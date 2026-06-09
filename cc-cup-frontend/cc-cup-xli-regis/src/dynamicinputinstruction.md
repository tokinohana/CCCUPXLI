Here is a detailed backend-to-frontend specification and step-by-step TODO architecture list. It map your fields precisely against the database endpoints from `REGIS_ROUTES.md` and rules from `REGIS_FORMS.md`.

---

### 📋 The Master TODO List: Dynamic Field Injection & Endpoint Alignment

#### 🟩 Phase 1: React State Schema Definition

* [ ] Create a comprehensive object dictionary in your React hook context or state provider mapping all 19 unique sport slugs (`basket-putra`, `pencak-silat`, `cubing`, `wallclimb`, etc.) to their metadata constraints.
* [ ] For each slug, define:
* [ ] `minPlayers` & `maxPlayers` integers to control the visibility/disabling of the final "Submit Registration" payload button.
* [ ] A `teamFields` collection array tracking any extra parameters sent to the `/add_info` payload endpoint.
* [ ] A `memberFields` collection array tracking any customized metadata fields needed during member payload creation (e.g., `weight`, `height`, `birthplace`).
* [ ] A `memberFiles` collection array tracking individual required attachments (e.g., `akte`, `sabuk`, `rapor`).



#### 🟩 Phase 2: Team Metadata Setup (`/add_info`)

* [ ] Read the authenticated user's selected competition slug from your global profile state.
* [ ] Conditionally render the "Informasi Tambahan Kompetisi" container:
* [ ] If `teamFields` is empty (e.g., `mini-soccer`, `wallclimb`), hide the section completely or display a muted fallback block to enforce the 1-2-Muted rule and prevent cognitive noise.
* [ ] If fields exist (e.g., coach tracking inputs for `basket-putra` or subcategory checkboxes for `cubing`), map through the array to generate inputs with proper `name` values matching your Django context.


* [ ] Bind the container's `<form>` action target to trigger a POST request directly to the `/add_info` API endpoint.

#### 🟩 Phase 3: The Member Form Modal Payload Architecture

* [ ] Create a unified payload construction state for the member modal.
* [ ] **Hardcoded Section:** Keep standard input blocks for base elements required by all 19 sports (`nama`, `email`, `nomor_telepon`, `tanggal_lahir`, `gender`, `kelas`, `nisn`).
* [ ] **Dynamic Inputs Section:** Map over the active sport's `memberFields` to render specialized inputs:
* [ ] Use conditional conditional blocks to support text types (`birthplace`), numbers (`weight`, `height`), or dropdown selection blocks (`subkategori`).
* [ ] **Important Endpoint Sync:** Ensure any dropdown choices for martial arts or performance categories save their text parameters to the correct field so that it updates properly via the `/save-subkategori` route.


* [ ] **Dynamic Files Section:** Map over `memberFiles` to render specialized PDF file upload nodes.
* [ ] Wire the final submission button to hit `/add_member`, processing both standard field JSON data and individual attachment files simultaneously via multipart form encoding.

#### 🟩 Phase 4: Workflow Block Rules & Form Safety Guards

* [ ] Connect form fields and modification controls directly to the global `RegisStatus` flag downloaded from your session profile endpoint.
* [ ] Add field condition states:
* [ ] **`PENDING` Mode:** Keep all elements completely editable, displaying file deletion handlers next to uploaded assets.
* [ ] **`SUBMITTED` / `REVIEWED` / `ACCEPTED` Modes:** Set all fields, checkboxes, modals, and upload buttons to a native `disabled` layout state. Hide any delete endpoints (`/delete_member/<id>`, `/delete_file/<file_type>`) to prevent unauthorized structural data changes while panitia checks the roster.
* [ ] **`PENDINGTF` Mode:** Display a dedicated bank configuration form that targets the `/update-rekening` endpoint to handle refund details for the team's security deposit.



---

### 📝 Prompt Reference Sheet for Your Next Context Session

When you provide your file inputs to a specialized routing LLM to verify and expand your dictionary config layout, you can copy and paste this direct contextual prompt:

```text
Act as an API validation engine. Read the file REGIS_ROUTES.md to understand the exact endpoints used for managing a team's registration flow. Cross-reference it with REGIS_FORMS.md to extract the data requirements for all 19 sports.

Generate a comprehensive, zero-omission JSON or JavaScript config dictionary structure that perfectly maps every competition slug to its strict parameters. 

Ensure that:
1. Every extra textual information item maps cleanly to fields expected by the `/add_info` payload.
2. Every martial arts division choice maps cleanly to data expected by the `/save-subkategori` parameter.
3. Every individual file attachment matches the expected field names during processing at the `/add_member` route.
4. Player count integers match the minimum and maximum constraints for every single sport variant listed.

```