# AI RAG System — Architectural Overview

## Purpose

The AI RAG (Retrieval-Augmented Generation) system serves as an **AI registration consultant** for the CC CUP event. It answers participant questions about competition rules, registration procedures, and event logistics by grounding LLM responses in 21 official SOP PDF documents.

The system lives inside the Django `regis` app and is exposed via REST API to a floating chat widget on the registration dashboard.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                             │
│  ChatWidget.jsx — floating chatbox on DashboardPage                  │
│  - Sends POST /api/regis/chat/ with user message                     │
│  - Receives reply + source citations + token usage                   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTP (JWT auth)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DJANGO BACKEND (regis app)                       │
│                                                                      │
│  ChatView (views.py)                                                 │
│    ├─ Token cap check (10,000 per team)                              │
│    ├─ chat_services.generate_reply()                                 │
│    │    ├─ hybrid_retrieve()  ←── RETRIEVAL PHASE                    │
│    │    │    ├─ embed_query()        → DashScope embedding API        │
│    │    │    ├─ pgvector HNSW search → PostgreSQL cosine distance    │
│    │    │    └─ keyword rerank       → stopword-filtered scoring     │
│    │    └─ Groq LLM call       ←── GENERATION PHASE                 │
│    └─ Save history + update token usage                              │
└─────────────────────────────────────────────────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
     │  PostgreSQL   │ │  DashScope   │ │  Groq API    │
     │  (pgvector)   │ │  (embeddings)│ │  (LLM gen)  │
     └──────────────┘ └──────────────┘ └──────────────┘
```

---

## Data Models

### `ChatDocument` — Source Document Registry

Each record represents one SOP PDF in the knowledge base.

| Field | Type | Description |
|---|---|---|
| `name` | CharField | Display name (e.g., "Voli", "Basket") |
| `pdf_url` | URLField | Public URL of the PDF (e.g., `https://cccup.id/sop/voli.pdf`) |
| `filename` | CharField | Original filename for citations (e.g., `voli.pdf`) |
| `extracted_text` | TextField | Full extracted text, cached permanently after ingestion |
| `is_active` | BooleanField | Whether this document participates in retrieval |

### `ChatChunk` — Vector-Embedded Text Chunks

Each record is a ~500-character chunk of a `ChatDocument`'s extracted text, paired with its 1536-dimensional embedding vector.

| Field | Type | Description |
|---|---|---|
| `document` | FK → ChatDocument | Parent document |
| `chunk_index` | PositiveIntegerField | Sequential index within the document |
| `text` | TextField | Raw chunk text |
| `embedding` | VectorField(1536) | Qwen `text-embedding-v4` vector |
| `source_page` | PositiveIntegerField | PDF page number the chunk came from |

**Index:** HNSW index (`m=16, ef_construction=64, vector_cosine_ops`) for fast approximate nearest-neighbor search.

### `ChatSession` — Per-Team Chat State

| Field | Type | Description |
|---|---|---|
| `team` | OneToOne → Team | The team this session belongs to |
| `chat_history` | JSONField | Last 20 messages as `[{role, content}]` |
| `token_usage` | PositiveIntegerField | Cumulative tokens consumed |
| `token_cap` | PositiveIntegerField | Hard limit (default 10,000) |

---

## The Two Phases

### Phase 1: Offline Ingestion (One-Time Setup)

This phase runs **once** per document (or when documents are updated). It populates the vector index.

```
import_sop_pdfs.py (management command)
         │
         ▼
┌─────────────────────────┐
│ 1. Register PDF URL      │   ChatDocument created with pdf_url
│    (no download/upload)  │   pointing to static /public/sop/ file
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│ 2. Fetch PDF over HTTP   │   requests.get(pdf_url, timeout=30)
│    from homepage static  │   e.g., https://cccup.id/sop/voli.pdf
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│ 3. Extract text (pypdf)  │   Each page → "## Page N\n\n<text>"
│    Save to extracted_text│   Pages joined with "---" separators
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│ 4. Chunk text             │   ~500 char chunks, 50 char overlap
│    (paragraph-aware)      │   Respects paragraph + sentence boundaries
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│ 5. Embed via DashScope    │   Qwen text-embedding-v4 (1536 dims)
│    Batch of 10/request     │   DashScope limits to 10 per request
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│ 6. Bulk-create ChatChunks│   Old chunks deleted, new ones created
│    (numpy arrays → pgvec)│   Stored with HNSW index
└─────────────────────────┘
```

**Triggering ingestion:**

| Command | What it does |
|---|---|
| `python manage.py import_sop_pdfs --force` | Re-fetch, re-extract, re-embed all 21 SOPs |
| `python manage.py import_sop_pdfs` | Only process new/missing documents |
| `python manage.py import_sop_pdfs --re-embed` | Skip fetching — re-chunk and re-embed existing extracted_text |
| Django Admin → "Re-extract PDF text + embed" action | Background thread: re-fetch + re-embed |
| Django Admin → "Re-embed chunks" action | Background thread: re-embed only (no re-fetch) |

**Cost of full ingestion:** ~130K tokens × $0.02/1M = **~$0.003 total** (practically free).

---

### Phase 2: Online Query (Per User Message)

This phase runs **every time** a user sends a chat message.

#### Step 1: Hybrid Retrieval

```
User query: "Bagaimana cara daftar voli?"
                    │
                    ▼
         ┌─────────────────────┐
         │  embed_query()       │  Qwen text-embedding-v4 (DashScope)
         │  → 1536-dim vector   │  Cost: ~100 tokens (negligible)
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────────────────────────────┐
         │  pgvector HNSW search (cosine distance)      │
         │  ChatChunk.objects                           │
         │    .filter(document__is_active=True)          │
         │    .order_by(CosineDistance(embedding, qv))   │
         │    [:8]   ← VECTOR_CANDIDATES                 │
         └──────────┬──────────────────────────────────┘
                    │  8 candidate chunks
                    ▼
         ┌─────────────────────────────────────────────┐
         │  Keyword reranking                           │
         │  For each candidate:                         │
         │    vec_score  = positional decay (1/(1+rank)) │
         │    kw_score   = keyword_hit_ratio             │
         │    combined   = 0.7 * vec + 0.3 * kw         │
         └──────────┬──────────────────────────────────┘
                    │  8 scored chunks
                    ▼
         ┌─────────────────────┐
         │  Take top 4          │  FINAL_TOP_K = 4
         │  (sorted by score)   │
         └─────────────────────┘
```

**Why hybrid?** Pure vector search is great at semantic understanding ("volleyball registration" matches "pendaftaran voli"), but can miss exact technical terms or competition names. Keyword reranking boosts chunks that contain the exact terms the user typed, giving the best of both worlds.

**Scoring formula:**

```
combined_score = 0.7 × vector_score + 0.3 × keyword_score

where:
  vector_score  = 1 / (1 + position_rank)    # decaying positional proxy
  keyword_score = keywords_found / total_keywords   # 0.0 to 1.0
```

**Fallback:** If no `ChatChunk` records exist (e.g., embeddings haven't been generated yet), the system falls back to the legacy keyword-only search on `ChatDocument.extracted_text`. This ensures the chatbot works even before the vector index is populated.

#### Step 2: LLM Generation

```
         ┌─────────────────────────────────────────────────┐
         │  Build message array:                            │
         │                                                  │
         │  [0] System prompt (Indonesian, role definition) │
         │  [1] Document Context (top 4 chunks, 2000 chars  │
         │      each, with source filenames)                │
         │  [2-11] Last 10 chat history messages            │
         │  [12] Current user message                       │
         └────────────────────┬────────────────────────────┘
                              │
                              ▼
         ┌─────────────────────────────────────────────────┐
         │  Groq API (llama-3.3-70b-versatile)              │
         │  temperature = 0.2                               │
         │  max_tokens  = 256                               │
         │  tool_choice = "none"                            │
         └────────────────────┬────────────────────────────┘
                              │
                              ▼
         ┌─────────────────────────────────────────────────┐
         │  Post-processing:                                │
         │  1. Extract [[source.pdf]] citations from reply  │
         │  2. Strip citations from displayed text          │
         │  3. Return (cleaned_reply, [source_filenames])   │
         └─────────────────────────────────────────────────┘
```

**System prompt** instructs the LLM to:
- Act as "Konsultan CC CUP" — a professional registration assistant
- Respond in formal but friendly Indonesian
- Limit answers to 2 concise paragraphs
- Cite source files as `[[filename.pdf]]`
- Redirect to admin phone if information is unavailable

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/regis/chat/status/` | Token usage, cap, active document count |
| `POST` | `/api/regis/chat/` | Send message, receive AI reply + sources |
| `POST` | `/api/regis/chat/clear/` | Clear chat history (does not reset tokens) |

**Chat flow per request:**

1. Authenticate via JWT
2. Look up user's Team → get/create ChatSession
3. Check token cap (reject if exceeded)
4. Estimate tokens in user message (~4 chars/token)
5. Call `generate_reply()` → hybrid retrieval + Groq LLM
6. Estimate tokens in reply
7. Append both messages to history (keep last 20)
8. Save session, return response

---

## Token Budget System

Each team gets a **10,000-token budget** per session (configurable via `CHAT_DEFAULT_TOKEN_CAP`).

- Token counting uses a heuristic: `len(text) // 4` (approximately 4 characters per token)
- Both user messages and assistant replies consume tokens
- Once the cap is reached, the system returns a "budget exceeded" message
- Clearing chat history does **not** reset token usage
- The token cap is enforced server-side in `ChatView.post()`

---

## Technology Stack

| Component | Technology | Purpose |
|---|---|---|
| LLM Generation | Groq `llama-3.3-70b-versatile` | Reply generation (free tier) |
| Embeddings | Qwen `text-embedding-v4` (DashScope) | 1536-dim text vectors |
| Vector DB | PostgreSQL + pgvector extension | Store and search embeddings |
| Index | HNSW (m=16, ef_construction=64) | Fast approximate nearest-neighbor |
| PDF Extraction | pypdf | Extract text from PDFs |
| HTTP Client | requests | Fetch PDFs from static hosting |
| ORM | Django + pgvector-django | VectorField, CosineDistance, HnswIndex |

---

## Configuration (settings.py + .env)

```env
# LLM Generation
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile
CHAT_ADMIN_PHONE=+62-812-3456-7890
CHAT_DEFAULT_TOKEN_CAP=10000

# Embeddings
DASHSCOPE_API_KEY=sk-...
DASHSCOPE_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
EMBEDDING_MODEL=text-embedding-v4
EMBEDDING_DIMENSIONS=1536
```

---

## File Map

| File | Responsibility |
|---|---|
| `regis/models.py` | `ChatDocument`, `ChatChunk`, `ChatSession` models |
| `regis/chat_services.py` | All AI logic: extraction, chunking, embedding, retrieval, generation |
| `regis/views.py` | REST API endpoints (`ChatView`, `ChatStatusView`, `ChatClearView`) |
| `regis/admin.py` | Django admin for documents/chunks/sessions + re-embed actions |
| `regis/management/commands/import_sop_pdfs.py` | Bulk SOP ingestion command |
| `cc-cup-xli-regis/src/components/ChatWidget.jsx` | Frontend floating chat widget |

---

## Failure Modes and Fallbacks

| Failure | Behavior |
|---|---|
| `DASHSCOPE_API_KEY` not set | Embeddings return zero vectors; vector search returns no results; falls back to legacy keyword search |
| No `ChatChunk` records exist | `hybrid_retrieve()` falls back to `_fallback_legacy_retrieve()` — keyword search on `ChatDocument.extracted_text` |
| `GROQ_API_KEY` not set | `_demo_fallback()` returns raw relevant snippets without LLM generation |
| Groq API error | Error message returned to user with admin contact |
| PDF fetch fails | `[Extraction error: ...]` stored; document skipped in retrieval |
| Token cap reached | Immediate rejection with "budget exceeded" message |

---

## Cost Analysis

| Operation | Tokens | Cost |
|---|---|---|
| Full SOP ingestion (21 PDFs) | ~130K embedding tokens | $0 (DashScope free tier: 1M tokens) |
| Per user query (embedding) | ~100 tokens | $0 |
| Per LLM reply (Groq) | ~256 output tokens | $0 (free tier) |
| **Total for 1,000 queries** | ~100K embed + 256K Groq | **$0** |

The system is designed to operate at **$0 cost** for the entire event (DashScope free tier + Groq free tier).
