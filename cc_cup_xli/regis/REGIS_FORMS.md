# Registration Forms & Inputs Documentation

This document details the inputs the `regis` API actually accepts, based on `models.py`, `serializers.py`, and `views.py`. It replaces the earlier version, which described the product-level intent but didn't distinguish what the backend structurally enforces from what's UI/product convention only.

## 1. Account / Team Creation (`RegisterSerializer` — `POST /register/`)

Sent as a **single call**, not a two-step account-then-team flow at the API level (any step-splitting is frontend UI only):

- **email** — `EmailField`, must be unique (checked in `RegisterView`, `409` if taken)
- **password** — write-only, `min_length=8`
- **phone** — `CharField(max_length=20)`
- **jenjang** — `SMP` or `SMA`
- **school** — `CharField(max_length=200)`
- **nama_tim** — `CharField(max_length=150)`
- **competition** — `CharField(max_length=100)` — a free-text slug, **not** an FK or `choices`-constrained field; the backend doesn't validate it against a fixed sport list.

Login (`POST /login/`) takes `email` + `password` only. A successful register/login returns JWT `access`/`refresh` tokens — there's no session-cookie-based auth for this flow (JWT is `DEFAULT_AUTHENTICATION_CLASSES[0]`).

## 2. Required Team-Level Files (`TeamFile.FILE_TYPE_CHOICES`)

Uploaded individually via `POST /upload/<file_type>/`, one at a time (not a single multi-file form submit):

| `file_type` value | Label | Accepted formats |
| :--- | :--- | :--- |
| `pembayaran` | Bukti Pembayaran | PDF, PNG, JPG |
| `kartuPelajar` | Kartu Pelajar Kapten | PDF only |
| `selfie` | Selfie Dengan Kartu Pelajar | PDF only |
| `suratPernyataan` | Surat Pernyataan Tim | PDF only |
| `suratIzin` | Surat Izin Sekolah | PDF only |

All 5 are required before `/submit/` will succeed (`SubmitRegistrationView` checks this explicitly).

## 3. Base Member Inputs (`Member` model)

All of the following are `blank=True` at the model level (i.e. **not required by the database or by `AddMemberView`/`EditMemberView`** — the views accept whatever's sent, defaulting missing fields to empty):

- **nama** — full name
- **email**
- **nomor_telepon**
- **tanggal_lahir** — date
- **gender** — `Laki-laki` / `Perempuan`
- **kelas**
- **nisn**

## 4. Sport-Specific Member Fields

These five are explicit `Member` model columns (not just thrown into the JSON catch-all), reused across multiple sports:

- **tempat_lahir**, **berat_badan** (kg, decimal), **tinggi_badan** (cm, decimal), **role**, **subkategori**

Anything not covered by an explicit column lands in **`dynamic_data`** (a `JSONField`), sent as a JSON-encoded string under the `dynamic_data` key in the multipart body.

> ⚠️ **None of the per-sport field requirements below are enforced by the backend.** The `Member` model doesn't vary its required fields by `competition`, and neither `AddMemberView` nor `EditMemberView` branch on sport. This table is a **product/UI reference** — actual enforcement (if any) lives in frontend form logic not included in these files.

| Sport | Extra Member Fields | Extra Member Files |
| :--- | :--- | :--- |
| 🏀 Basketball (Putra & Putri) | Tempat Lahir, Berat Badan, Tinggi Badan | — |
| 🥋 Pencak Silat | Tempat Lahir, Berat Badan, Tinggi Badan, Subkategori | — |
| ♟️ Catur (Chess) | — | Akte Kelahiran, Fotocopy Rapor |
| 🥋 Taekwondo | Subkategori | Akte Kelahiran, Sertifikat Sabuk |
| 🎬 Short Movie | Role | — |
| 🧊 Cubing | — (team-level: Cube Categories, see §7) | — |
| 🎨 Digital Painting | — | Akte Kelahiran |
| 🥋 Karate Kyokushin | Tempat Lahir, Berat Badan, Tinggi Badan, Subkategori | Sertifikat Sabuk |
| Mini Soccer, Voli, Bulu Tangkis, Modern Dance, Band, Fotografi, English Debate, Wall Climbing, Paduan Suara, Cerdas Cermat | — | — |

> ⚠️ **Roster size limits (min/max players per team) are documented but not enforced anywhere in the current backend.** `SubmitRegistrationView` only checks "team has ≥ 1 member," regardless of `competition`. Treat the old min/max table as product intent, not a live constraint.

## 5. Member Files (`MemberFile`)

Uploaded via multipart keys formatted `file_<type>` on `add_member`/`edit_member` — e.g. `file_akte`, `file_rapor`, `file_sabuk`. Unlike `TeamFile`, `MemberFile.file_type` is a **free `CharField(max_length=50)`**, not a fixed `choices` list — the backend will accept any `file_<anything>` key and create a `MemberFile` with that type string.

## 6. Bank / Rekening (`RekeningSerializer` — `POST /update-rekening/`)

- **bank_name** — `CharField(max_length=100)`
- **account_number** — `CharField(max_length=50)`
- **account_holder** — `CharField(max_length=150)`

Only accepted while `Team.regis_status == 'PENDINGTF'` — rejected (`403`) at any other status.

## 7. Team Metadata (`OtherInfo` — `POST /add_info/`)

Accepts **any** flat `{key: value}` JSON object — there's no fixed schema at the DB level. In practice this is used for things like Nama Pelatih / Email Pelatih / Nomor Telepon Pelatih (coach info) and Cube Categories (Cubing), but the backend will happily store any key/value pair sent to it. One `OtherInfo` row is upserted per key.