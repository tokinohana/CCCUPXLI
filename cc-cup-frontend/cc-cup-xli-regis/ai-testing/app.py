import os
import re
import uuid
import json
from datetime import datetime, timezone
from io import BytesIO

from dotenv import load_dotenv
from flask import Flask, jsonify, redirect, render_template, request, session, url_for
from werkzeug.utils import secure_filename

load_dotenv()

try:
    from pypdf import PdfReader
except Exception:
    PdfReader = None

try:
    from openai import OpenAI
except Exception:
    OpenAI = None


app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", uuid.uuid4().hex)
app.config["MAX_CONTENT_LENGTH"] = 15 * 1024 * 1024

ADMIN_PHONE = "+62-812-3456-7890"

_STORE: dict[str, dict] = {}


def _get_session_id() -> str:
    sid = session.get("sid")
    if isinstance(sid, str) and sid:
        return sid
    sid = uuid.uuid4().hex
    session["sid"] = sid
    return sid


def _get_state() -> dict:
    sid = _get_session_id()
    if sid not in _STORE:
        _STORE[sid] = {
            "documents": {},  # filename -> text
            "chat_history": [],
            "token_usage": 0,
            "token_cap": 10000,
            "settings": {
                "groq_api_key": None,
                "groq_model": None,
            },
        }
    return _STORE[sid]


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _clean_filename(name: str) -> str:
    safe = secure_filename(name or "document.pdf")
    return safe or "document.pdf"


def _is_allowed_pdf_filename(name: str) -> bool:
    lower = (name or "").lower()
    return lower.endswith(".pdf")


def _pdf_to_markdown(pdf_bytes: bytes) -> str:
    if PdfReader is None:
        raise RuntimeError("Missing PDF dependency")
    reader = PdfReader(BytesIO(pdf_bytes))
    parts: list[str] = []
    for idx, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        cleaned = "\n".join([line.rstrip() for line in text.splitlines()]).strip()
        if not cleaned:
            continue
        parts.append(f"## Page {idx + 1}\n\n{cleaned}")
    merged = "\n\n---\n\n".join(parts).strip()
    return merged or "Tidak ada teks yang dapat diekstrak dari PDF ini."


_STOPWORDS = {
    "a", "an", "the", "and", "or", "to", "of", "in", "on", "for", "with",
    "is", "are", "was", "were", "be", "as", "at", "by", "it", "this",
    "that", "these", "those", "i", "you", "we", "they", "he", "she",
    "them", "his", "her", "their",
}


def _tokens(text: str) -> list[str]:
    parts = re.findall(r"[a-zA-Z0-9]{2,}", (text or "").lower())
    out: list[str] = []
    for p in parts:
        if p in _STOPWORDS:
            continue
        out.append(p)
        if len(out) >= 25:
            break
    return out


def _pick_relevant_snippet(text: str, query: str, max_chars: int = 4500) -> str:
    blocks = [b.strip() for b in (text or "").split("\n\n") if b.strip()]
    q = _tokens(query)
    if not blocks:
        return ""
    if not q:
        return (text or "")[:max_chars]

    scored: list[tuple[int, str]] = []
    for b in blocks:
        lower = b.lower()
        score = 0
        for t in q:
            if t in lower:
                score += 1
        if score > 0:
            scored.append((score, b))

    scored.sort(key=lambda x: x[0], reverse=True)
    chosen = [b for _, b in scored[:4]] if scored else blocks[:2]
    snippet = "\n\n---\n\n".join(chosen)
    return snippet[:max_chars]


def _estimate_tokens(text: str) -> int:
    """Simple heuristic: 1 token approx 4 characters."""
    return len(text or "") // 4


def _llm_reply(
    docs: dict,
    chat_history: list[dict],
    user_message: str,
    settings: dict,
) -> tuple[str, list[str]]:
    context_parts = []
    available_source_names = []
    for doc_id, doc in docs.items():
        snippet = _pick_relevant_snippet(doc.get("text") or "", user_message, max_chars=2000)
        if snippet:
            context_parts.append(f"Content from uploaded file '{doc['name']}':\n{snippet}")
            available_source_names.append(doc['name'])

    system = (
        "Anda adalah 'Konsultan CC CUP'—layanan pelanggan profesional yang bertugas membantu pendaftaran berbagai kompetisi di CC CUP. "
        "Tugas utama Anda adalah memberikan informasi yang jelas, padat (concise), dan sangat sopan berdasarkan konteks dokumen yang diberikan. "
        "Gunakan gaya bahasa Indonesia yang formal namun ramah. Jangan memberikan pertanyaan balik yang tidak perlu atau berbelit-belit; langsung berikan solusi atau jawaban yang dicari user. "
        "Jika informasi tersedia dalam dokumen, jelaskan dengan akurat. Jika informasi sama sekali tidak ditemukan, sampaikan dengan sopan bahwa Anda belum memiliki datanya dan arahkan user untuk menghubungi Admin pusat di: " + ADMIN_PHONE + ".\n\n"
        "PENTING: Di akhir jawaban Anda, sebutkan HANYA nama file sumber yang Anda gunakan untuk menjawab pertanyaan tersebut di dalam kurung siku ganda, contoh: [[nama_file.pdf]]. "
        "Jika Anda menggunakan beberapa file, pisahkan dengan koma: [[file1.pdf, file2.pdf]]. Jika tidak ada sumber yang digunakan, jangan tuliskan apa pun."
    )

    messages = [{"role": "system", "content": system}]
    if context_parts:
        context_str = "\n\n---\n\n".join(context_parts)
        messages.append({"role": "system", "content": f"Document Context:\n\n{context_str}"})

    recent_history = chat_history[-10:]
    for m in recent_history:
        if m.get("role") in ("user", "assistant") and isinstance(m.get("content"), str):
            messages.append({"role": m["role"], "content": m["content"]})
    
    last = recent_history[-1] if recent_history else {}
    if not (last.get("role") == "user" and last.get("content") == user_message):
        messages.append({"role": "user", "content": user_message})

    api_key = (settings.get("groq_api_key") or "").strip() or (os.environ.get("GROQ_API_KEY") or "").strip()
    model = (settings.get("groq_model") or "").strip() or (os.environ.get("GROQ_MODEL") or "").strip() or "llama-3.3-70b-versatile"
    base_url = "https://api.groq.com/openai/v1"

    if OpenAI is None or not api_key:
        # Fallback for demo mode
        any_snippet = ""
        demo_source = None
        for doc in docs.values():
            any_snippet = _pick_relevant_snippet(doc.get("text") or "", user_message)
            if any_snippet:
                demo_source = doc['name']
                break
        
        if any_snippet:
            return f"Demo mode (Groq not configured). I found this in your documents:\n\n{any_snippet}\n\nContact admin at {ADMIN_PHONE} for more help.", [demo_source] if demo_source else []
        return f"I couldn't find an answer in the documents. Please contact the admin at {ADMIN_PHONE}.", []

    client = OpenAI(api_key=api_key, base_url=base_url)
    resp = client.chat.completions.create(
        model=model, 
        messages=messages, 
        temperature=0.2,
        tool_choice="none"
    )
    
    raw_content = (resp.choices[0].message.content or "").strip()
    
    # Extract sources from [[...]]
    extracted_sources = []
    cleaned_content = raw_content
    match = re.search(r"\[\[(.*?)\]\]", raw_content)
    if match:
        source_str = match.group(1)
        extracted_sources = [s.strip() for s in source_str.split(",") if s.strip()]
        # Remove the source tag from the visible text
        cleaned_content = raw_content.replace(match.group(0), "").strip()
    
    return cleaned_content or "Saya tidak dapat menghasilkan respons. Silakan coba ulangi pertanyaan Anda.", extracted_sources


@app.get("/")
def home():
    state = _get_state()
    docs = state.get("documents") or {}
    doc_list = [{"name": d["name"], "base": k} for k, d in docs.items()]
    return render_template(
        "index.html",
        docs=doc_list,
        admin_phone=ADMIN_PHONE
    )


@app.post("/upload")
def upload():
    files = request.files.getlist("file")
    if not files:
        return redirect(url_for("home"))

    state = _get_state()
    for f in files:
        filename = _clean_filename(f.filename or "")
        if not _is_allowed_pdf_filename(filename):
            continue

        raw = f.read()
        try:
            text = _pdf_to_markdown(raw)
        except Exception:
            text = ""

        if text:
            base_name = filename.lower()
            if base_name.endswith(".pdf"):
                base_name = base_name[:-4]
            state["documents"][base_name] = {
                "name": filename,
                "text": text,
                "created_at": _now_iso(),
            }

    state["chat_history"] = []
    return redirect(url_for("home"))


@app.post("/api/chat")
def api_chat():
    payload = request.get_json(silent=True) or {}
    message = payload.get("message")
    if not isinstance(message, str) or not message.strip():
        return jsonify({"reply": "Silakan kirim pesan yang valid."})

    state = _get_state()
    docs = state.get("documents") or {}
    chat_history = state.get("chat_history") or []
    token_usage = state.get("token_usage", 0)
    token_cap = state.get("token_cap", 10000)

    if token_usage >= token_cap:
        reply = f"Batas token Anda ({token_cap}) telah tercapai. Silakan hubungi admin untuk bantuan lebih lanjut."
        return jsonify({"reply": reply, "usage": token_usage, "cap": token_cap, "sources": []})

    token_usage += _estimate_tokens(message.strip())
    state["token_usage"] = token_usage
    chat_history.append({"role": "user", "content": message.strip()})

    try:
        reply, sources = _llm_reply(docs, chat_history, message.strip(), state.get("settings", {}))
        token_usage += _estimate_tokens(reply)
        state["token_usage"] = token_usage
    except Exception as e:
        reply = f"Terjadi kesalahan pada backend chat: {str(e)}. Silakan coba lagi atau muat ulang halaman."
        sources = []

    chat_history.append({"role": "assistant", "content": reply})
    state["chat_history"] = chat_history[-20:]
    return jsonify({"reply": reply, "usage": token_usage, "cap": token_cap, "sources": sources})


@app.post("/api/clear")
def api_clear():
    state = _get_state()
    state["documents"] = {}
    state["chat_history"] = []
    return jsonify({"ok": True})


@app.post("/api/settings")
def api_settings():
    payload = request.get_json(silent=True) or {}
    state = _get_state()
    settings = state.get("settings", {})

    if "groq_api_key" in payload:
        settings["groq_api_key"] = str(payload["groq_api_key"]).strip() or None
    if "groq_model" in payload:
        settings["groq_model"] = str(payload["groq_model"]).strip() or None
    if "token_cap" in payload:
        try:
            state["token_cap"] = int(payload["token_cap"])
        except: pass

    state["settings"] = settings
    return jsonify({
        "ok": True,
        "key_set": bool(settings.get("groq_api_key")),
        "token_usage": state.get("token_usage", 0),
        "token_cap": state.get("token_cap", 10000),
    })


@app.get("/api/status")
def api_status():
    groq_key = (os.environ.get("GROQ_API_KEY") or "").strip()
    return jsonify({
        "groq_api_key_set": bool(groq_key),
    })


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.environ.get("PORT", "5000")), debug=True)
