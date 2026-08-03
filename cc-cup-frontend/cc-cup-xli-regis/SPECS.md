# CC Cup XLI — Regis Frontend Integration Spec

This document specifies exactly how the `regis` React frontend should talk to the Django/DRF backend, so forms, validation, and API calls match the backend precisely. Written for an LLM (or a human) implementing the frontend from scratch or auditing an existing implementation.

---

## 0. Before you build anything: one missing piece

**There is currently no API endpoint that serves the per-sport rules** (roster min/max, gender restriction, subkategori options, dynamic field requirements) that live in the backend's `competition_data.py`. The frontend needs this data to render sport-specific form fields, but nothing in `urls.py` exposes it yet.

**Recommendation**: add a public (no-auth) `GET /api/regis/competitions/` endpoint that returns the `COMPETITIONS` dict as JSON, so the frontend fetches it once and drives all dynamic form logic off the live backend data — not a hand-copied duplicate that will drift out of sync. Section 12 below specifies the exact shape this endpoint should return. If you don't want to add this endpoint, the alternative is manually duplicating `competition_data.py` into the frontend as a static file, which **will** go stale the next time backend rules change — not recommended.

**Also missing**: `urls.py` has no JWT refresh endpoint (`TokenRefreshView` from `rest_framework_simplejwt`). Now that refresh tokens rotate on use (14-day sliding window, see backend notes), the frontend needs somewhere to actually call to refresh. Add:
```python
from rest_framework_simplejwt.views import TokenRefreshView
path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
```
to `regis/urls.py`. Without this, the 14-day rotation is unreachable and every user gets logged out after 30 minutes regardless.

---

## 1. Base configuration

| Setting | Value |
| :--- | :--- |
| API base URL (prod) | `https://api.cccup.id/api/regis/` |
| API base URL (dev) | `http://localhost:8000/api/regis/` (or wherever Django runs locally) |
| Auth scheme | JWT bearer — `Authorization: Bearer <access_token>` |
| Content-Type (JSON endpoints) | `application/json` |
| Content-Type (member/file endpoints) | `multipart/form-data` |

Frontend env var convention (adjust to your build tool): `VITE_API_BASE_URL` or `NEXT_PUBLIC_API_BASE_URL` = `https://api.cccup.id/api/regis`. Do not hardcode the host anywhere in components — one env var, one place to change it.

---

## 2. DNS & TLS setup for `api.cccup.id`

This is infra, not frontend code, but the frontend build breaks without it, so it's here for completeness:

1. **DNS**: add an `A` record — `api.cccup.id` → droplet's public IP. (If using Cloudflare or similar, keep proxy/orange-cloud off initially while testing raw TLS, since Gunicorn terminates TLS directly with no reverse proxy in front.)
2. **TLS certificate**: the existing Let's Encrypt cert must include `api.cccup.id` as a SAN. Reissue with certbot:
   ```
   certbot certonly --standalone -d cccup.id -d api.cccup.id -d admin.cccup.id
   ```
   (include whatever domains the cert already covers alongside the new one). Point Gunicorn's `--certfile`/`--keyfile` at the renewed cert and restart.
3. **`ALLOWED_HOSTS`**: add `api.cccup.id` to the `DJANGO_ALLOWED_HOSTS` env var on the droplet, restart Gunicorn.
4. **No CORS/CSRF/cookie-domain changes needed** — `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, and `SESSION_COOKIE_DOMAIN`/`CSRF_COOKIE_DOMAIN = ".cccup.id"` in `settings.py` already anticipate this subdomain split (they're scoped to the frontend origins and the parent domain respectively, not to a specific backend host).
5. **Frontend**: point the `regis` Vercel project's API base URL env var at `https://api.cccup.id`.

---

## 3. Auth flow

### `POST /register/`
No auth required.

**Request body** (JSON):
```json
{
  "email": "string",
  "password": "string (min 8 chars)",
  "phone": "string",
  "jenjang": "SMP | SMA",
  "school": "string",
  "nama_tim": "string",
  "competition": "string (slug — must exist in COMPETITIONS for the given jenjang)"
}
```

**Response `201`**:
```json
{
  "access": "jwt",
  "refresh": "jwt",
  "team": { /* full TeamSerializer payload, see §4 — includes one member: the representative, is_representative: true */ }
}
```

**Errors**:
- `400` — validation errors (missing fields, `competition`/`jenjang` combo doesn't exist)
- `409` — email already registered

The representative's own `Member` row is created automatically server-side on register — **do not** call `/add_member/` again for the person who signed up.

### `POST /login/`
No auth required. Body: `{ "email": "string", "password": "string" }`.
Response: `{ "access", "refresh", "team": TeamPayload | null }` — `team` is `null` if the account somehow has no team.

### `POST /logout/`
Auth required. Body: `{ "refresh": "jwt" }`. Blacklists the refresh token.

### Token refresh (once the endpoint from §0 exists)
`POST /token/refresh/` — body `{ "refresh": "jwt" }` → `{ "access": "jwt", "refresh": "jwt" }` (rotation issues a new refresh token each time; discard the old one, store the new one).

**Frontend session handling**:
- Store `access` in memory (not localStorage, ideally) and `refresh` in a persistent store.
- On any `401` response, attempt one silent refresh via `/token/refresh/`, then retry the original request once. If refresh also fails, redirect to login.
- Because refresh tokens rotate, always replace the stored refresh token with the new one returned — reusing an old rotated-out refresh token will fail.

---

## 4. Dashboard — `GET /dashboard/`

Auth required. Returns the full team payload:

```json
{
  "id": 1,
  "nama_tim": "string",
  "school": "string",
  "phone": "string",
  "competition": "string (slug)",
  "jenjang": "SMP | SMA",
  "regis_status": "PENDING | SUBMITTED | REVIEWED | ACCEPTED | PENDINGTF | REJECTED",
  "bank_name": "string",
  "account_number": "string",
  "account_holder": "string",
  "captain_email": "string",
  "player_range": { "min": 1, "max": 14 } | null,
  "member_count": 3,
  "members": [ /* MemberSerializer array, see §5 */ ],
  "files": [ { "id": 1, "file_type": "pembayaran", "url": "string|null", "uploaded_at": "iso8601" } ],
  "other_info": [ { "id": 1, "key": "string", "value": "string" } ],
  "created_at": "iso8601",
  "updated_at": "iso8601"
}
```

`player_range`/`member_count` are provided so the frontend can render "3 / 7–14 players" progress without re-deriving it from the metadata endpoint — but if you build the roster-limit UI live against §12's metadata, these are a convenient cross-check, not the only source of truth.

---

## 5. Members

### Member object shape (used in dashboard + add/edit responses)
```json
{
  "id": 1,
  "nama": "string",
  "email": "string",
  "nomor_telepon": "string",
  "tanggal_lahir": "YYYY-MM-DD | null",
  "gender": "Laki-laki | Perempuan | ''",
  "kelas": "string",
  "nisn": "string",
  "tempat_lahir": "string",
  "berat_badan": "number | null",
  "tinggi_badan": "number | null",
  "role": "string",
  "subkategori": "string",
  "dynamicFields": { "any_extra_key": "value" },
  "is_representative": true,
  "files": [ { "id": 1, "file_type": "akte", "url": "string|null", "uploaded_at": "iso8601" } ],
  "created_at": "iso8601",
  "updated_at": "iso8601"
}
```

`is_representative: true` means this row belongs to whoever is currently logged in — **hide the delete button for this specific row in the UI**, since the backend will reject it with `403` anyway. Don't rely on client-side hiding alone for security, but do it for UX (no point letting someone click delete just to get an error).

### `POST /add_member/` — multipart/form-data
Fields: `nama`, `email`, `nomor_telepon`, `tanggal_lahir`, `gender`, `kelas`, `nisn`, plus sport-specific `tempat_lahir`/`berat_badan`/`tinggi_badan`/`role`/`subkategori` as needed. Anything from `extra.anggota` (§12) that isn't one of those five named fields goes into a `dynamic_data` field, **sent as a JSON-encoded string**, e.g.:
```
dynamic_data: '{"cube_category": "3x3"}'
```
Member files go as separate multipart keys prefixed `file_`, e.g. `file_akte`, `file_sabuk` — filename doesn't matter, only the key prefix.

**Which fields to show per sport**: cross-reference `extra.anggota` from §12's metadata for the team's `competition`+`jenjang`. Fields with `type: "File"` render as file inputs (→ `file_<key>` multipart key); `"String"`/`"Number"` render as text/number inputs (→ into the `dynamic_data` JSON).

**Response `201`**: the created Member object. **`400`** with field-level errors on validation failure — e.g.:
```json
{ "gender": ["Cabang ini hanya menerima gender: M."] }
```
or
```json
{ "dynamicFields": { "cube_category": "Wajib diisi untuk cabang ini (String)." } }
```
Render these under the corresponding form field.

**`403`** if the team is frozen (`SUBMITTED`/`ACCEPTED`) — disable the "add member" button entirely in that state rather than letting the user hit the error.

### `PUT /edit_member/<id>/` — same shape as add, partial (unset fields keep their current value)

### `DELETE /delete_member/<id>/`
- `403` if this is the caller's own representative row (`is_representative: true`)
- `403` if the team is frozen
- `404` if the member doesn't belong to the caller's team

---

## 6. Team Files

### `POST /upload/<file_type>/` — multipart, single `file` key

| `file_type` | Accepted formats |
| :--- | :--- |
| `pembayaran` | pdf, png, jpg, jpeg |
| `kartuPelajar` | pdf |
| `selfie` | pdf |
| `suratPernyataan` | pdf |
| `suratIzin` | pdf |

Re-uploading a type replaces the existing file. `400` if `file_type` isn't one of the five above, or wrong format for that type. `403` if frozen.

### `DELETE /delete_file/<file_type>/`
`404` if no file of that type exists yet. `403` if frozen.

**UI**: show all 5 required file types as a checklist regardless of sport — these are universal, not sport-specific. `/submit/` will reject if any are missing.

---

## 7. Team Info (`OtherInfo`) — `POST /add_info/`

Body: flat JSON object, any keys — e.g. `{ "Nama Pelatih": "...", "Email Pelatih": "...", "Nomor Telepon Pelatih": "..." }`. Cross-reference `extra.tim` from §12 for which keys a given sport actually needs (e.g. Basketball/Pencak Silat/Taekwondo need coach info; Cubing needs `Cube Categories` as a multi-select — check the metadata's type hint for how to render it). Response is the current full list of `OtherInfo` rows for the team. `403` if frozen.

---

## 8. Submit / Unsubmit

### `POST /submit/`
No body. Validates:
- All 5 required `TeamFile` types are present (`400` listing which are missing)
- Roster size is within the sport's `player_range` from §4/§12 (`400` with the exact range and current count if out of bounds)

On success, `regis_status` → `SUBMITTED`. **Frontend**: before enabling the submit button, pre-check both conditions client-side (files checklist + member count) so the user isn't surprised by a `400` — but still handle the `400` gracefully since it's the source of truth.

### `POST /unsubmit/`
No body. Only works from `SUBMITTED`/`REVIEWED` → reverts to `PENDING`. `403` otherwise.

---

## 9. Rekening — `POST /update-rekening/`

Body: `{ "bank_name": "string", "account_number": "string", "account_holder": "string" }`. Only accepted while `regis_status == "PENDINGTF"` — `403` otherwise. **UI**: only show this form/section when `regis_status === "PENDINGTF"`.

---

## 10. Subkategori — `POST /save-subkategori/`

Body: `{ "member_id": 1, "subkategori": "string" }`. Value must be one of the sport's `subkategori` options from §12, or the backend returns `400`. Use this for a quick weight-class picker separate from the full edit-member form if useful; functionally equivalent to editing `subkategori` via `/edit_member/`.

---

## 11. AI Chat Consultant

- `GET /chat/status/` → `{ "token_usage": int, "token_cap": int, "document_count": int, "has_documents": bool }`
- `POST /chat/` — body `{ "message": "string" }` → `{ "reply": "string", "usage": int, "cap": int, "sources": [...] }`. If `token_usage >= token_cap`, the backend still returns `200` with a canned "limit reached" reply rather than an error — check the reply content or compare `usage`/`cap` client-side to disable the input once the cap is hit.
- `POST /chat/clear/` — clears history only, doesn't reset `token_usage`. Warn the user in the UI that clearing history doesn't refund their token budget.

---

## 12. Per-sport metadata endpoint (to be added — see §0)

Once `GET /api/regis/competitions/` exists, expected shape per competition:

```json
{
  "mini-soccer": {
    "name": "Mini Soccer",
    "jenjang": ["SMP", "SMA"],
    "sop": "https://...",
    "SMP": {
      "gender": ["M"],
      "players": [7, 14],
      "subkategori": [],
      "kuota": 16,
      "status": null,
      "extra": { "tim": {}, "anggota": {} }
    },
    "SMA": { "...": "..." }
  }
}
```

Frontend usage per field:
- **`gender`**: `["M"]`/`["F"]`/`["U"]` (or combinations) — restrict the gender `<select>` in the add/edit member form accordingly; `"U"` means unrestricted.
- **`players: [min, max]`**: drive the roster progress indicator and disable "Submit" until the count is in range.
- **`subkategori`**: if non-empty, render as a `<select>` with these exact options instead of free text; if empty, hide the field or leave free text.
- **`kuota`** / **`status`**: **display-only** — e.g. a "registration is closed for this sport" banner is fine, but the backend does *not* block registration on these (admins handle it manually), so don't hard-disable the register button based on this — it would misrepresent what actually happens server-side.
- **`extra.tim`**: extra fields to render on the team-info form (§7), submitted via `/add_info/`.
- **`extra.anggota`**: extra fields to render on the member form (§5), submitted via `dynamic_data` (or `file_<key>` for `"File"` type).

---

## 13. Error response conventions

- `400` — validation error. Body is either `{ "field_name": ["message"] }` (DRF default) or `{ "error": "message" }` (custom views like submit/rekening). Handle both shapes.
- `401` — expired/invalid access token → attempt refresh, see §3.
- `403` — permission/state error (frozen team, wrong status, deleting own row) → body is `{ "error": "message" }`, show it directly, it's already written for end users (in Indonesian).
- `404` — resource not found (wrong member id, no team, no file of that type).
- `409` — only on `/register/`, email taken.

---

## 14. Status workflow reference

`PENDING → SUBMITTED → REVIEWED → ACCEPTED`, plus `PENDINGTF` (rekening-only, admin-triggered) and `REJECTED`. Mutating endpoints (members/files/team-info) are blocked once `SUBMITTED`/`ACCEPTED`. Drive all "is this field editable right now" UI logic off `regis_status` from the dashboard payload — don't infer it from anything else.
