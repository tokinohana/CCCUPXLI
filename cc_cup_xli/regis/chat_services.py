"""
AI Consultant service layer for the CC CUP registration chatbot.
Ported from the Flask ai-testing demo into idiomatic Django.
"""
import logging
import os
import re
from io import BytesIO

from django.conf import settings

logger = logging.getLogger(__name__)

ADMIN_PHONE = getattr(settings, "CHAT_ADMIN_PHONE", "+62-812-3456-7890")
DEFAULT_MODEL = getattr(settings, "GROQ_MODEL", "llama-3.3-70b-versatile")
DEFAULT_TOKEN_CAP = getattr(settings, "CHAT_DEFAULT_TOKEN_CAP", 10000)

# ─────────────────────────────────────────────────────────────────────────────
# PDF text extraction
# ─────────────────────────────────────────────────────────────────────────────
def extract_pdf_text(pdf_bytes: bytes) -> str:
    """Extract text from a PDF file and return cleaned markdown-ish text."""
    try:
        from pypdf import PdfReader
    except ImportError:
        raise RuntimeError("pypdf is not installed. Run: pip install pypdf")

    reader = PdfReader(BytesIO(pdf_bytes))
    parts = []
    for idx, page in enumerate(reader.pages):
        text = (page.extract_text() or "").strip()
        if not text:
            continue
        cleaned = "\n".join(line.rstrip() for line in text.splitlines()).strip()
        if cleaned:
            parts.append(f"## Page {idx + 1}\n\n{cleaned}")

    merged = "\n\n---\n\n".join(parts).strip()
    return merged or "Tidak ada teks yang dapat diekstrak dari PDF ini."


def extract_chat_document_text(document_id: int):
    """
    Fetch a ChatDocument's PDF from its public URL and extract text.
    Saves the result to the extracted_text field.
    """
    import requests
    from .models import ChatDocument

    try:
        doc = ChatDocument.objects.get(pk=document_id)
    except ChatDocument.DoesNotExist:
        logger.error(f"ChatDocument {document_id} not found")
        return

    if not doc.pdf_url:
        logger.warning(f"ChatDocument {document_id} has no pdf_url")
        return

    logger.info(f"Extracting text from '{doc.name}' (id={document_id}) ...")

    try:
        resp = requests.get(doc.pdf_url, timeout=30)
        resp.raise_for_status()
        doc.extracted_text = extract_pdf_text(resp.content)
        doc.save(update_fields=['extracted_text'])
        logger.info(f"\u2713 Extracted {len(doc.extracted_text)} chars from '{doc.name}'")
    except Exception as exc:
        logger.error(f"Failed to extract text from '{doc.name}': {exc}")
        doc.extracted_text = f"[Extraction error: {exc}]"
        doc.save(update_fields=['extracted_text'])


# ─────────────────────────────────────────────────────────────────────────────
# Token estimation (heuristic: ~4 chars per token)
# ─────────────────────────────────────────────────────────────────────────────
def estimate_tokens(text: str) -> int:
    return len(text or "") // 4


# ─────────────────────────────────────────────────────────────────────────────
# Relevance scoring for RAG-style context selection
# ─────────────────────────────────────────────────────────────────────────────
_STOPWORDS = {
    "a", "an", "the", "and", "or", "to", "of", "in", "on", "for", "with",
    "is", "are", "was", "were", "be", "as", "at", "by", "it", "this",
    "that", "these", "those", "i", "you", "we", "they", "he", "she",
    "them", "his", "her", "their", "yang", "dan", "atau", "untuk", "dengan",
    "dari", "pada", "oleh", "ini", "itu", "tidak", "akan", "sudah",
}


def _keywords(text: str, limit: int = 25) -> list[str]:
    parts = re.findall(r"[a-zA-Z0-9]{2,}", (text or "").lower())
    return [p for p in parts if p not in _STOPWORDS][:limit]


def pick_relevant_snippet(text: str, query: str, max_chars: int = 4500) -> str:
    """Pick the most relevant blocks from a document based on query keywords."""
    blocks = [b.strip() for b in (text or "").split("\n\n") if b.strip()]
    if not blocks:
        return ""
    kw = _keywords(query)
    if not kw:
        return (text or "")[:max_chars]

    scored = []
    for b in blocks:
        lower = b.lower()
        score = sum(1 for t in kw if t in lower)
        if score > 0:
            scored.append((score, b))

    scored.sort(key=lambda x: x[0], reverse=True)
    chosen = [b for _, b in scored[:4]] if scored else blocks[:2]
    snippet = "\n\n---\n\n".join(chosen)
    return snippet[:max_chars]


# ─────────────────────────────────────────────────────────────────────────────
# LLM call (Groq via OpenAI-compatible client)
# ─────────────────────────────────────────────────────────────────────────────
def generate_reply(
    documents: list[dict],
    chat_history: list[dict],
    user_message: str,
) -> tuple[str, list[str]]:
    """
    Generate a reply using the Groq LLM (or fallback demo mode).
    
    Args:
        documents: list of {name, text} dicts (active ChatDocuments).
        chat_history: list of {role, content} dicts.
        user_message: the latest user message.
    Returns:
        (reply_text, source_filenames)
    """
    # Build RAG context
    context_parts = []
    available_sources = []
    for doc in documents:
        snippet = pick_relevant_snippet(doc.get("text", ""), user_message, max_chars=2000)
        if snippet:
            ref = doc.get('filename') or doc['name']
            context_parts.append(f"Content from '{doc['name']}' (file: {ref}):\n{snippet}")
            available_sources.append(ref)

    system_prompt = (
        "Anda adalah 'Konsultan CC CUP'—layanan pelanggan profesional yang bertugas "
        "membantu pendaftaran berbagai kompetisi di CC CUP. "
        "Tugas utama Anda adalah memberikan informasi yang jelas, padat (concise), dan "
        "sangat sopan berdasarkan konteks dokumen yang diberikan. "
        "Gunakan gaya bahasa Indonesia yang formal namun ramah. Jangan memberikan "
        "pertanyaan balik yang tidak perlu atau berbelit-belit; langsung berikan solusi "
        "atau jawaban yang dicari user. "
        "BATASI jawaban Anda MAKSIMAL 2 paragraf singkat. Jangan bertele-tele.\n"
        "Jika informasi tersedia dalam dokumen, jelaskan dengan akurat. Jika informasi "
        "sama sekali tidak ditemukan, sampaikan dengan sopan bahwa Anda belum memiliki "
        f"datanya dan arahkan user untuk menghubungi Admin pusat di: {ADMIN_PHONE}.\n\n"
        "PENTING: Di akhir jawaban Anda, sebutkan HANYA nama file sumber yang Anda "
        "gunakan untuk menjawab pertanyaan tersebut di dalam kurung siku ganda, "
        "contoh: [[nama_file.pdf]]. "
        "Jika Anda menggunakan beberapa file, pisahkan dengan koma: "
        "[[file1.pdf, file2.pdf]]. Jika tidak ada sumber yang digunakan, jangan "
        "tuliskan apa pun."
    )

    messages = [{"role": "system", "content": system_prompt}]

    if context_parts:
        messages.append({
            "role": "system",
            "content": "Document Context:\n\n" + "\n\n---\n\n".join(context_parts),
        })

    # Include last 10 history messages for context
    recent = chat_history[-10:]
    for m in recent:
        if m.get("role") in ("user", "assistant") and isinstance(m.get("content"), str):
            messages.append({"role": m["role"], "content": m["content"]})

    # Ensure the current user message is the last entry
    last = recent[-1] if recent else {}
    if not (last.get("role") == "user" and last.get("content") == user_message):
        messages.append({"role": "user", "content": user_message})

    # Call Groq API
    api_key = (getattr(settings, "GROQ_API_KEY", "") or "").strip()
    model = (getattr(settings, "GROQ_MODEL", "") or "").strip() or DEFAULT_MODEL

    if not api_key:
        return _demo_fallback(documents, user_message)

    try:
        from openai import OpenAI
    except ImportError:
        return _demo_fallback(documents, user_message)

    try:
        client = OpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")
        resp = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.2,
            max_tokens=256,
            tool_choice="none",
        )
        raw = (resp.choices[0].message.content or "").strip()
    except Exception as e:
        return (
            f"Terjadi kesalahan saat menghubungi layanan AI: {e}. "
            f"Silakan coba lagi atau hubungi admin di {ADMIN_PHONE}.",
            [],
        )

    # Extract source references [[...]]
    sources = []
    cleaned = raw
    match = re.search(r"\[\[(.*?)\]\]", raw)
    if match:
        source_str = match.group(1)
        sources = [s.strip() for s in source_str.split(",") if s.strip()]
        cleaned = raw.replace(match.group(0), "").strip()

    return cleaned or "Saya tidak dapat menghasilkan respons. Silakan coba ulangi pertanyaan Anda.", sources


def _demo_fallback(documents: list[dict], user_message: str) -> tuple[str, list[str]]:
    """Fallback when Groq is not configured — returns raw relevant snippet."""
    for doc in documents:
        snippet = pick_relevant_snippet(doc.get("text", ""), user_message)
        if snippet:
            return (
                f"(Mode demo — AI belum dikonfigurasi.) Ditemukan dalam dokumen:\n\n{snippet}\n\n"
                f"Hubungi admin di {ADMIN_PHONE} untuk bantuan lebih lanjut.",
                [doc["name"]],
            )
    return (
        f"Belum ada informasi yang tersedia. Hubungi admin di {ADMIN_PHONE}.",
        [],
    )
