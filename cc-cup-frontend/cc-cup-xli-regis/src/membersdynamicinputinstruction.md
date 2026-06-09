### 📋 The Master TODO List: Unified Member Lifecycle & Endpoint Alignment

#### 🟩 Phase 1: Client-Side Roster Schema & Payload Validation State

* [ ] Create a local verification state machine inside the member modal component mapping the active `competition_slug` to its strict constraints from `REGIS_FORMS.md`.
* [ ] Initialize separate field schemas for data payload structures:
* [ ] **`BaseFields`**: Standard tracking schema required uniformly across all sports (`nama`, `nisn`, `kelas`, `email`, `nomor_telepon`, `tanggal_lahir`, `gender`).
* [ ] **`DynamicFields`**: Specialized textual/numerical property models passed via form encoding (e.g., `tinggi_badan`, `berat_badan`, `id_user_ml`, `posisi_instrumen`).
* [ ] **`DynamicFiles`**: Binary file attachment references to pass as multipart fields (e.g., `file_rapor`, `file_akte`, `file_sertifikat_sabuk`).


* [ ] Add a visual boundary counter tracking active entries against the sport-specific constraints (e.g., triggering a layout warning if a `bulutangkis-tunggal-putra` group exceeds 1 player, or a `mini-soccer` roster falls under 7 players).

#### 🟩 Phase 2: Dynamic Input Injection & Sub-category Routing Sync

* [ ] Set up a dynamic content handler inside the form component that reads the current sport slug when `openMemberModal()` is fired.
* [ ] Build a conditional layout engine to render input variations based on the schema mapping:
* [ ] **Numerical Inputs**: Form fields with strict safety thresholds (e.g., `tinggi_badan` bounded between `100` and `250` cm, `berat_badan` between `30` and `150` kg) to prevent structural format bypasses.
* [ ] **Text Metadata Inputs**: Text elements configured with predictive placeholder labels (e.g., `Riot ID & Tagline (Name#Tag)` for Valorant, `ID User & Zone ID` for Mobile Legends).
* [ ] **Brutalist Radio Toggles**: Replace hidden dropdown items with high-contrast, clickable card components for low-literacy clarity (e.g., instrument tracking slots for `band`, or weight brackets for martial arts).


* [ ] **Endpoint Route Mapping**: Map martial arts weight brackets and subcategories directly to properties that sync with the `/save-subkategori` routing script, ensuring categorization data updates reliably in the backend.

#### 🟩 Phase 3: Multipart File Attachment Layer (`/add_member`)

* [ ] Integrate individual file-dropzone targets that conditionally surface based on the active sport's file checklist (e.g., rendering a single `file_rapor` uploader for standard sports, or appending multiple nodes for `file_akte` and `file_sertifikat_sabuk` under martial arts branches).
* [ ] Wire file picker triggers to use custom state visual feedback, turning text lines bright green upon selection to reassure the user that their document was registered.
* [ ] Enforce frontend constraints restricting all files strictly to `.pdf` formats to ensure predictable uploads.
* [ ] Bind the final modal save action button to standard form delivery configurations, transmitting text blocks and files as a unified payload to the `/add_member` backend route.

#### 🟩 Phase 4: Lifecycle Mutation Safeguards & Status Freezing

* [ ] Wrap modal controls and component fields in active safety checks that listen directly to the team's live status code profile (`PENDING`, `SUBMITTED`, `REVIEWED`, `REJECTED`).
* [ ] Build status conditional rules into your component lifecycle:
* [ ] **`PENDING` Mode**: Grant full access to modification tools. Configure player action buttons to open the unified modal pre-populated with data, routing update inputs to the `/edit_member` route while displaying explicit user confirmations on deletion tags (`/delete_member/<id>`).
* [ ] **`SUBMITTED` / `REVIEWED` Modes**: Remove delete buttons, replace the interactive "+ Tambah Anggota" trigger with a muted locked indicator, and strip or disable `<input>` wrappers inside the member view to prevent data shifts during review.
* [ ] **`REJECTED` Mode**: Hide the member section entirely and display a single, professional notice with an urgent support hyperlink to maintain clear messaging.



---

### 📝 Prompt Reference Sheet for Your Next Context Session

When you provide your file inputs to a specialized routing LLM to verify and expand your member dictionary config layout, you can copy and paste this direct contextual prompt:

```text
Act as an API validation engine. Read the file REGIS_ROUTES.md to understand the exact endpoints used for managing individual team members (specifically /add_member, /edit_member, /delete_member/<id>, and /save-subkategori). Cross-reference it with REGIS_FORMS.md to extract individual player requirements for all 19 sports.

Generate a comprehensive, zero-omission JSON or JavaScript config dictionary structure that perfectly maps every competition slug to its member-level parameters.

Ensure that:
1. Every standard base element (Nama, NISN, Kelas, Email, No Telp, Tgl Lahir, Gender) is tracked uniformly.
2. Every extra metadata variable (Tinggi, Berat, Game ID, Instumen) maps to fields expected by /add_member and /edit_member payload processing.
3. Every dynamic radio selection (such as martial arts weight divisions) outputs text data structured for the /save-subkategori endpoint parameters.
4. Every dynamic file uploader field correctly outputs field names (like file_rapor, file_akte, file_sertifikat_sabuk) that align with backend file processors.
5. Max and min player limitations match the strict limits defined for each sport variant.

```