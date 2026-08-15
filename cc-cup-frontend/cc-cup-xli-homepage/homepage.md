# Page Spec: Homepage (`cccup.id`)

> References `DESIGN.md` for all tokens, motifs, and anti-patterns. This file defines content, structure, data, and behavior only.

**Route:** `/` on `cccup.id`
**Language:** Bahasa Indonesia (all copy)

---

## 1. Hero Banner

**Behavior:** Parallax scroll — background layer (jungle/stepped-pyramid silhouette, per Section 3.3 of DESIGN.md) moves slower than foreground content on scroll.

**Content:**
- Title: a single image asset (WEBP or SVG) containing the styled title lockup — not live text. `[PLACEHOLDER: title asset — need to know if this already exists as a designed asset, or if it needs a typography spec written first]`
- Two buttons:
  - **Primary — "Daftar Sekarang"** (or final Bahasa Indonesia copy) → navigates to `regis.cccup.id`
  - **Secondary — "Perlombaan"** → smooth-scrolls to the Competition Section anchor on the same page (no navigation)

**Wireframe:**
```
┌─────────────────────────────────────┐
│         [parallax jungle/pyramid bg]  │
│                                       │
│         [ TITLE IMAGE ASSET ]        │
│                                       │
│   [ Daftar Sekarang ]   [ Perlombaan ]│
└─────────────────────────────────────┘
```

---

## 2. Competition Section

**Anchor id:** `#perlombaan` (target of hero's secondary button)

**Layout:** Asymmetrical Maya-themed grid (glyph-block logic per DESIGN.md 3.3) — cards vary in size/offset rather than a uniform even grid. Card count: `[PLACEHOLDER: confirm 4 or 6 — see question below]`.

**Card contents:**
- Competition title
- Icon (etched-line style, per DESIGN.md 3.4)
- Two badges showing available tiers (e.g. "Pro" / "Casual")

**Card behavior:** Click → navigates to `cccup.id/competition/:slug` (e.g. `/competition/mini-soccer`)

**Section footer:** "Lihat Semua" (See All) button → `[PLACEHOLDER: destination route — assuming /kompetisi or /lomba, confirm]`

**Data shape:**
```json
{
  "slug": "mini-soccer",
  "title": "Mini Soccer",
  "icon": "icon-mini-soccer",
  "tiers": ["pro", "casual"]
}
```

---

## 3. Competition Details Page (separate route, documented here for continuity)

**Route:** `cccup.id/competition/:slug`

**Content, top to bottom:**
1. Breadcrumb: `Beranda / Perlombaan / {Competition Title}`
2. On page load: General Rules popup/modal — user must click "Lanjutkan" (Continue) to dismiss before viewing the rest of the page
3. SOP document rendered in a PDF iframe
4. "Daftar" (Register) button → `regis.cccup.id`

*(This will get its own full spec file — `competition-details.md` — flagging it here since it's linked directly from the homepage cards.)*

---

## 4. Timeline Section

**Layout:** Vertical or horizontal event timeline (per stepped/pyramid visual motif where reasonable — not a generic dotted-line timeline).

**Per-entry contents:**
- Heading (large, display font)
- One-line description (body font)
- Badge: in-progress state — `[PLACEHOLDER: confirm exact meaning — see question below]`

**Data shape:**
```json
[
  {
    "date": "2026-08-18",
    "heading": "Pendaftaran Dibuka",
    "description": "Pendaftaran tim resmi dimulai.",
    "in_progress": true
  },
  {
    "date": "2026-09-11",
    "heading": "Pendaftaran Ditutup",
    "description": "Batas akhir pendaftaran tim.",
    "in_progress": false
  }
]
```

---

## 5. Gallery Section

**Layout:** Asymmetrical Maya grid (same logic as Competition Section), max 6 images.

**Card behavior:**
- Default state: image at 50% saturation
- Hover: image transitions to 100% saturation, title text appears
- Click: opens lightbox with the full image

**Section footer:** button → navigates to the full Gallery tab/page (route to be confirmed — likely `/galeri`).

---

## 6. FAQ Section

**Layout:** Accordion list, one question expanded at a time (or independently expandable — standard accordion behavior).

**Data shape:**
```json
[
  {
    "question": "Bagaimana cara mendaftar?",
    "answer": "Klik tombol Daftar Sekarang dan ikuti langkah-langkah pendaftaran."
  }
]
```

---

## Navbar

- Desktop: top navbar styled as a temple lintel (per DESIGN.md 6).
- Mobile: bottom nav bar.
- Hover effect: Maya-themed — e.g. an underline that reveals as a stepped/notched line (talud-tablero motif) rather than a generic color-fade or underline slide. `[PLACEHOLDER: confirm exact hover treatment once we test it visually — flagging as the one interaction detail worth prototyping before locking]`

---

## Open Questions

1. Competition Section: exactly 4 cards or exactly 6?
2. Hero title: existing designed asset, or do you need a copy + typography spec drafted first?
3. Timeline "in progress" badge — does it mean registration is currently open, the event is currently happening, or both states need separate tracking?
