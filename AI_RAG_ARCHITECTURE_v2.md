# AI Consultant System — Revised Architecture (v2)

## What changed from v1

v1 used pgvector + DashScope embeddings + HNSW indexing to retrieve chunk-level
context from 21 SOP PDFs. Given the actual corpus size (~130K tokens across all
21 docs) and the fact that these PDFs get revised often, that stack was solving
a scale problem you don't have yet, at the cost of infrastructure you do have
to maintain (pgvector extension, embedding pipeline, index rebuilds, staleness
on every revision).

v2 drops embeddings entirely. Retrieval becomes a **two-stage LLM routing
step**: a cheap call picks which 1–2 of the 21 documents are relevant, then
their full text (not chunks) is stuffed into the generation call. No vector
store, no pgvector, no DashScope, no re-embedding on document revision.

| | v1 | v2 |
|---|---|---|
| Retrieval | pgvector HNSW + keyword rerank | LLM router over doc titles/summaries |
| Context unit | 4 chunks (~2000 chars each) | 1–2 full documents |
| DB requirement | Postgres + pgvector extension | Plain Postgres (Neon default, no extension) |
| External APIs | DashScope (embed) + Groq (gen) | Groq only |
| On document revision | Re-fetch → re-chunk → re-embed → rebuild index | Re-fetch → re-extract. Done. |
| Groq calls per message | 1 | 2 (router + generation) |
| New model needed | `ChatChunk` (vectors) | None — `ChatDocument` gains a `summary` field |

---

## Purpose

The AI Consultant answers participant questions about CC CUP registration and
competition rules by grounding LLM replies in 21 official SOP PDFs. It lives
inside the Django `regis` app, exposed via REST API to a floating chat widget.

This purpose is unchanged from v1 — only the retrieval mechanism changes.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                             │
│  ChatWidget.jsx — floating chatbox on DashboardPage                  │
│  - Sends POST /api/regis/chat/ with user message                     │
│  - Receives reply + source citation + token usage                    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTP (JWT auth)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DJANGO BACKEND (regis app)                       │
│                                                                      │
│  ChatView (views.py)                                                 │
│    ├─ Token cap check (10,000 per team)                              │
│    ├─ chat_services.generate_reply()                                 │
│    │    ├─ route_documents()   ←── ROUTING PHASE (LLM call #1)       │
│    │    │    ├─ builds prompt from 21 (title, summary) pairs         │
│    │    │    ├─ Groq small call → returns 0-2 filenames              │
│    │    │    └─ fallback: keyword overlap on titles if call fails    │
│    │    └─ Groq LLM call        ←── GENERATION PHASE (LLM call #2)   │
│    │         (full extracted_text of routed doc(s) as context)       │
│    └─ Save history + update token usage                              │
└─────────────────────────────────────────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
           ┌──────────────┐       ┌──────────────┐
           │  PostgreSQL   │       │  Groq API    │
           │  (plain,      │       │  (routing +  │
           │  no pgvector) │       │  generation) │
           └──────────────┘       └──────────────┘
```

No embedding provider, no vector column, no ANN index. One database, one
external API.

---

## Data Models

### `ChatDocument` — Source Document Registry

Same table as v1, minus nothing — it gains one field.

| Field | Type | Description |
|---|---|---|
| `name` | CharField | Display name (e.g., "Voli", "Basket") |
| `pdf_url` | URLField | Public URL of the PDF |
| `filename` | CharField | Original filename for citations |
| `extracted_text` | TextField | Full extracted text, cached after ingestion |
| `summary` | TextField | 1–2 sentence description used by the router (see below) |
| `is_active` | BooleanField | Whether this document participates in routing |

**`summary` field:** written once per document, either by hand (21 docs is a
manageable amount to eyeball) or generated once via a single LLM call over
`extracted_text` at ingestion time. This is what the router sees instead of
full text — keeps the routing prompt tiny regardless of how long each SOP is.

### `ChatChunk`

**Removed entirely.** No vector column, no HNSW index, no `pgvector-django`
dependency.

### `ChatSession` — Per-Team Chat State

Unchanged from v1.

| Field | Type | Description |
|---|---|---|
| `team` | OneToOne → Team | The team this session belongs to |
| `chat_history` | JSONField | Last 20 messages as `[{role, content}]` |
| `token_usage` | PositiveIntegerField | Cumulative tokens consumed |
| `token_cap` | PositiveIntegerField | Hard limit (default 10,000) |

---

## The Two Phases

### Phase 1: Ingestion (One-Time, or On Revision)

```
import_sop_pdfs.py (management command)
         │
         ▼
┌─────────────────────────┐
│ 1. Register PDF URL      │   ChatDocument created with pdf_url
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│ 2. Fetch PDF over HTTP   │   requests.get(pdf_url, timeout=30)
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│ 3. Extract text (pypdf)  │   Save to extracted_text
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│ 4. Write/generate summary│   Manual, or one cheap LLM call
└──────────┬──────────────┘
           ▼
              done — no chunking, no embedding, no index build
```

**Triggering ingestion / re-ingestion on revision:**

| Command | What it does |
|---|---|
| `python manage.py import_sop_pdfs --force` | Re-fetch + re-extract all 21 SOPs |
| `python manage.py import_sop_pdfs` | Only process new/missing documents |
| Django Admin → "Re-extract PDF text" action | Background thread: re-fetch + re-extract one doc |

A PDF revision is now a single re-extract, not a re-embed-and-reindex. This
directly matches the fact that these SOPs get revised often — there's no
staleness window where the vector index lags behind the source text.

**Cost of full ingestion:** effectively $0 — pypdf extraction is local, and
the optional one-time summary generation for 21 short documents is a rounding
error in Groq free-tier usage.

---

### Phase 2: Online Query (Per User Message)

#### Step 1: Document Routing (replaces vector retrieval)

```
User query: "Bagaimana cara daftar voli?"
                    │
                    ▼
     ┌───────────────────────────────────────────┐
     │  Build routing prompt:                     │
     │  "Given these documents: [21 × (name,      │
     │  summary)], which are relevant to: <query>?│
     │  Return up to 2 filenames as JSON, or []."  │
     └──────────────────┬──────────────────────────┘
                         ▼
     ┌───────────────────────────────────────────┐
     │  Groq call (small, fast)                   │
     │  temperature = 0, max_tokens = 64           │
     │  Expects JSON array of filenames            │
     └──────────────────┬──────────────────────────┘
                         ▼
     ┌───────────────────────────────────────────┐
     │  Parse response                            │
     │  - Valid JSON, known filenames → use them  │
     │  - Malformed / empty / API error → fallback│
     │    to keyword overlap on doc names+summary │
     └───────────────────────────────────────────┘
```

**Why an LLM router instead of keyword matching as the primary path?**
Keyword-only matching misses paraphrase (e.g. *"pendaftaran"* vs *"cara
daftar"*), which is exactly the failure mode vector search existed to avoid.
A router call over 21 short summaries costs almost nothing and handles
paraphrase the same way an embedding model would, without needing an
embedding model at all. Keyword overlap stays in the code path, but only as
the fallback for when the router call itself fails — same defensive pattern
v1 used for its embedding fallback.

**Fallback:** If `GROQ_API_KEY` is unset, or the routing call errors, or
returns something unparseable, fall back to scoring documents by keyword hits
between the query and each document's `name` + `summary`, take the top match.
This keeps the chatbot functional even if the router is down.

#### Step 2: LLM Generation

```
     ┌─────────────────────────────────────────────────┐
     │  Build message array:                            │
     │                                                  │
     │  [0] System prompt (Indonesian, role definition) │
     │  [1] Document Context (full extracted_text of    │
     │      the 1-2 routed documents, with filenames)   │
     │  [2-11] Last 10 chat history messages             │
     │  [12] Current user message                        │
     └────────────────────┬────────────────────────────┘
                          ▼
     ┌─────────────────────────────────────────────────┐
     │  Groq API (llama-3.3-70b-versatile)              │
     │  temperature = 0.2, max_tokens = 256              │
     └────────────────────┬────────────────────────────┘
                          ▼
     ┌─────────────────────────────────────────────────┐
     │  Post-processing (unchanged from v1):            │
     │  1. Extract [[source.pdf]] citations              │
     │  2. Strip citations from displayed text            │
     │  3. Return (cleaned_reply, [source_filenames])     │
     └─────────────────────────────────────────────────┘
```

Since each SOP is short, 1–2 full documents is comfortably smaller than the
old 4-chunk context was ever meant to approximate, and nowhere near Groq's
context ceiling. If a query legitimately needs 3+ documents (rare — e.g. a
cross-competition rules question), raise the router's cap from 2 to 3; this
is a one-line change, not a re-architecture.

**System prompt** — unchanged responsibilities from v1:
- Act as "Konsultan CC CUP"
- Respond in formal but friendly Indonesian
- Limit answers to 2 concise paragraphs
- Cite source files as `[[filename.pdf]]`
- Redirect to admin phone if information is unavailable or no document routed

---

## API Endpoints

Unchanged from v1.

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
5. Call `generate_reply()` → routing call + generation call
6. Estimate tokens in reply (now includes the routing call's tokens too — see Cost Analysis)
7. Append both messages to history (keep last 20)
8. Save session, return response

---

## Token Budget System

Unchanged mechanism from v1, one addition: the routing call's tokens now
count against the same per-team cap, since it's a real API call on the
critical path.

- Token counting: `len(text) // 4` heuristic
- Both routing-call and generation-call tokens count toward usage
- Cap enforced server-side in `ChatView.post()`
- Clearing chat history does **not** reset token usage

---

## Technology Stack

| Component | Technology | Purpose |
|---|---|---|
| LLM Generation | Groq `llama-3.3-70b-versatile` | Reply generation (free tier) |
| LLM Routing | Groq `llama-3.3-70b-versatile` (or a smaller/faster Groq model) | Document selection |
| Database | PostgreSQL (Neon), no extensions | Store documents, sessions |
| PDF Extraction | pypdf | Extract text from PDFs |
| HTTP Client | requests | Fetch PDFs from static hosting |
| ORM | Django (stock, no `pgvector-django`) | Standard models only |

Removed: DashScope, pgvector, HNSW indexing, `VectorField`, `CosineDistance`.

---

## Configuration (settings.py + .env)

```env
# LLM (routing + generation — same key, same provider)
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_ROUTER_MODEL=llama-3.3-70b-versatile   # can swap for a faster/cheaper model later
CHAT_ADMIN_PHONE=+62-812-3456-7890
CHAT_DEFAULT_TOKEN_CAP=10000
CHAT_MAX_ROUTED_DOCS=2
```

DashScope keys and embedding-dimension config are gone — nothing reads them.

---

## File Map

| File | Responsibility |
|---|---|
| `regis/models.py` | `ChatDocument` (+ `summary` field), `ChatSession`. No `ChatChunk`. |
| `regis/chat_services.py` | `route_documents()`, `_fallback_keyword_route()`, `generate_reply()` |
| `regis/views.py` | REST API endpoints — unchanged |
| `regis/admin.py` | Django admin for documents/sessions + single "Re-extract PDF text" action |
| `regis/management/commands/import_sop_pdfs.py` | Bulk SOP ingestion — extract + summary only, no embed step |
| `cc-cup-xli-regis/src/components/ChatWidget.jsx` | Frontend floating chat widget — unchanged |

---

## Failure Modes and Fallbacks

| Failure | Behavior |
|---|---|
| `GROQ_API_KEY` not set | `_demo_fallback()` returns a static "chatbot unavailable" message with admin contact |
| Router call errors or returns malformed output | Falls back to keyword overlap on document `name` + `summary` |
| Router returns 0 documents | Generation call proceeds with no document context; system prompt instructs it to redirect to admin |
| Generation call (Groq) errors | Error message returned to user with admin contact |
| PDF fetch fails during ingestion | `[Extraction error: ...]` stored; document skipped in routing |
| Token cap reached | Immediate rejection with "budget exceeded" message |

Note what's gone: there's no more "DASHSCOPE_API_KEY not set → zero vectors →
silent degraded search" failure mode, because there's no embedding step to
silently degrade.

---

## Cost Analysis

| Operation | Tokens | Cost |
|---|---|---|
| Full ingestion (21 PDFs, extraction only) | ~0 (local pypdf, no API) | $0 |
| One-time summary generation (optional, 21 calls) | ~5K total | $0 (free tier) |
| Per user query — routing call | ~500-800 tokens (21 summaries + query) | $0 |
| Per user query — generation call | ~2K-6K tokens (1-2 full doc texts + history) | $0 |
| **Total for 1,000 queries** | ~2.5M-6.8M tokens (Groq, all free tier) | **$0**, but watch TPM rate limits |

**The one real trade-off to flag:** v1's per-query context was small and
predictable (~2K tokens, fixed regardless of document length). v2's
generation-call context scales with however long the routed document(s) are.
For 21 short SOPs this is still small in absolute terms, but if any SOP grows
into a long document later, that one document's full-text stuffing grows with
it — there's no chunking to cap it. Worth a periodic sanity check on your
longest SOP's token count as content evolves, not a day-one concern.

---

## Migration Notes (if v1 is partially built)

1. Drop `ChatChunk` model + its migration (or leave the table and stop
   writing to it if you'd rather not touch existing migrations under time
   pressure).
2. Remove `pgvector-django` from `INSTALLED_APPS` / requirements once nothing
   references `VectorField` or `CosineDistance`.
3. Add `summary` field to `ChatDocument`, backfill for existing 21 docs.
4. Replace `hybrid_retrieve()` in `chat_services.py` with `route_documents()`
   + `_fallback_keyword_route()`.
5. Remove DashScope calls and env vars.
6. Neon: no extension to enable, no index to build — this is the "headache"
   that goes away. You'll still use Neon/Postgres for `ChatDocument` and
   `ChatSession`, just as a plain relational store.
