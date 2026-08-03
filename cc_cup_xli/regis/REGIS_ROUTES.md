# Registration API Routes Documentation

This document describes the actual API surface of the `regis` Django app, as implemented in `views.py`/`urls.py`. It replaces the earlier version of this document, which described a server-rendered template flow (`login.html`, `user_dashboard.html`, `base.html` navbar) that does not exist in the current codebase — `regis` is a pure DRF JSON API consumed by a React frontend. There are no Django templates, no session-rendered pages, and no `RegisStatus`-driven page routing on the backend.

**Base path**: `/api/regis/` (mounted via `path('api/regis/', include('regis.urls'))` in the project root `urls.py`).
**Auth**: JWT (`rest_framework_simplejwt`), plus `SessionAuthentication` for staff/admin use. All endpoints below are relative to `/api/regis/`.

---

## 1. Auth

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/register/` | POST | none | Combines account + team creation in one call (`RegisterSerializer`). Creates a `User` (`is_external=True`) and a `Team` in one transaction-less pair of calls. Returns `409` if the email already exists. Returns `access`/`refresh` JWT + `team` on success (`201`). |
| `/login/` | POST | none | Authenticates by email + password (`LoginSerializer`). Requires `user.is_external`; non-external users get `403`. Returns `access`/`refresh` JWT + `team` (`team` is `null` if the user has no `Team` row yet). |
| `/logout/` | POST | required | Blacklists the refresh token passed in the body as `refresh`. Silently ignores an invalid/missing token. |

## 2. Dashboard

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/dashboard/` | GET | required | Returns the full `TeamSerializer` payload for the authenticated user's team, including nested `members`, `files`, and `other_info`. `404` if the user has no team. |

## 3. Members

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/add_member/` | POST | required, blocked if frozen | `multipart/form-data`. Base fields: `nama`, `email`, `nomor_telepon`, `tanggal_lahir`, `gender`, `kelas`, `nisn`. Sport-specific: `tempat_lahir`, `berat_badan`, `tinggi_badan`, `role`, `subkategori`. Anything else goes in a `dynamic_data` field sent as a JSON string. Member files are uploaded as `file_<type>` multipart keys (e.g. `file_akte`, `file_rapor`, `file_sabuk`) — one `MemberFile` row per key. |
| `/edit_member/<int:member_id>/` | PUT | required, blocked if frozen | Same field shape as add; unspecified fields keep their current value. Re-uploading a `file_<type>` key replaces the existing `MemberFile` for that type (`update_or_create`). |
| `/delete_member/<int:member_id>/` | DELETE | required, blocked if frozen | `403` if the member is the team captain (`is_kapten=True`) — the captain member cannot be deleted. |

**"Frozen"** = `team.regis_status in ('SUBMITTED', 'ACCEPTED')`. All member/file/info-mutating endpoints check this via `_freeze_check` and return `403` if frozen.

## 4. Team Files

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/upload/<str:file_type>/` | POST | required, blocked if frozen | `file_type` must be one of `TeamFile.FILE_TYPE_CHOICES` (`pembayaran`, `kartuPelajar`, `selfie`, `suratPernyataan`, `suratIzin`) or `400`. Body: multipart with a `file` key. `pembayaran` accepts `.pdf`/`.png`/`.jpg`/`.jpeg`; all others require `.pdf`. Upserts via `update_or_create` (re-uploading replaces the existing file). |
| `/delete_file/<str:file_type>/` | DELETE | required, blocked if frozen | Deletes the file from Cloudinary storage and the DB row. `404` if no such file exists. |

## 5. Team Info (`OtherInfo`)

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/add_info/` | POST | required, blocked if frozen | Body is a flat JSON object, `{key: value, ...}` — e.g. coach name/email/phone, cube categories. One `OtherInfo` row is upserted per key. Returns all current `OtherInfo` rows for the team. |

## 6. Submit / Unsubmit

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/submit/` | POST | required | Only allowed from `PENDING`/`REVIEWED` (else `403`). Validates all 5 required `TeamFile` types are uploaded (`400` listing what's missing), and that the team has at least 1 member (`400`). Sets status to `SUBMITTED`. |
| `/unsubmit/` | POST | required | Only allowed from `SUBMITTED`/`REVIEWED` (else `403`). Reverts status to `PENDING`. |

> ⚠️ **Doc/code gap**: `REGIS_FORMS.md`'s per-sport min/max member-count table (e.g. Basketball 5–12, Catur 1–2) is **not enforced by `SubmitRegistrationView`** — the backend only checks for "at least 1 member," regardless of competition. If per-sport roster limits matter, they currently exist only in frontend UI logic (not visible in these files) or aren't enforced at all.

## 7. Rekening (bank info)

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/update-rekening/` | POST | required | Only allowed while `regis_status == 'PENDINGTF'` (else `403`). Body: `bank_name`, `account_number`, `account_holder` (`RekeningSerializer`). |

## 8. Subkategori

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/save-subkategori/` | POST | required | Body: `{ "member_id": <int>, "subkategori": "<value>" }`. Directly updates one member's `subkategori` field (used for weight-class-style pickers outside the full edit form). |

## 9. AI Chat Consultant

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/chat/status/` | GET | required | Returns `token_usage`, `token_cap`, `document_count`, `has_documents` for the team's `ChatSession`. |
| `/chat/` | POST | required | Body: `{ "message": "..." }`. Rejects (with a canned reply, not an error status) if `token_usage >= token_cap`. Otherwise estimates tokens for the user message + AI reply, appends both to `chat_history` (trimmed to the last 20 entries), calls `chat_services.generate_reply()` against all active `ChatDocument` texts, and returns `{ reply, usage, cap, sources }`. |
| `/chat/clear/` | POST | required | Clears `chat_history` only — `token_usage` is **not** reset. |

## 10. Status workflow (`Team.regis_status`)

`PENDING → SUBMITTED → REVIEWED → ACCEPTED`, plus `PENDINGTF` (rekening-only state, reachable via admin action, not a POST endpoint in this file) and `REJECTED`. Mutating endpoints (members, files, team info) are blocked once frozen; `submit`/`unsubmit` have their own status gates (see §6).

## 11. Django Admin (`admin.py`)

- Staff group name is **`Registration Committee`** (the `REGIS_GROUP` constant) — not `Regis_Staff` as an earlier version of this doc stated. Enforced via `AppGroupPermissionMixin` on every `ModelAdmin`.
- Registered models: `Team` (with inline `Member`/`TeamFile`/`OtherInfo`, filterable by competition/status/jenjang), `Member`, `TeamFile`, `MemberFile`, `OtherInfo`, `ChatDocument` (background PDF text extraction on save or via the "Re-extract PDF text" admin action), `ChatSession` (read-only history/token fields).