# DESIGN.md: CC Cup Registration Platform — Design System

> **System Context:** This document is the absolute source of truth for all human developers and AI coding agents working on this platform. It defines design tokens, motifs, components, and content rules. Individual page specs (`homepage.md`, `competition-details.md`, etc.) reference this document by token name and MUST NOT redefine visual rules — they only describe content, structure, and behavior for that page.

## 1. Project Overview & Identity

* **Core Purpose:** A friction-free, step-by-step competition registration platform for CC Cup.
* **Target Audience:** Students with low literacy levels. The UI must be highly intuitive, guarded against confusion, and rely on visual hierarchy rather than dense text.
* **Theme:** Ancient Maya civilization — monumental, geometric, grounded. Evokes the stone-carved permanence of Tikal/Chichén Itzá and the surrounding jungle. Clean, light-themed, modern. Not cartoonish, not "Indiana Jones" decay, not a costume — a disciplined material language borrowed from real Maya visual culture.
* **Design Philosophy:** Radical simplicity and structural geometry. Typography, spacing, and layout structure carry the design. No decorative fluff.
* **Content Language:** All user-facing copy is in **Bahasa Indonesia**. No exceptions — buttons, labels, errors, empty states, everything.

## 2. Tech Stack & Engineering Constraints

* **Framework:** React (multi-page app across subdomains: `cccup.id`, `regis.cccup.id`).
* **Styling:** Tailwind CSS.
* **Components:** `shadcn/ui` as the *behavior* layer only (accessibility, form state, dialog/popover mechanics). Every visual token (radius, shadow, border, color, font) is overridden per Section 3 — never ship an unthemed shadcn default.
* **Icons:** Sourced or hand-styled to match Game-Icons.net's etched-line aesthetic (see 3.4). Used sparingly, for high-impact thematic flair only (suns, stepped pyramids, jaguars, geometric glyphs) — never as generic UI iconography (no generic "settings gear," no generic "hamburger" — style everything to fit).

## 3. Design Tokens

### 3.1 Color

| Name | Hex | Use |
|---|---|---|
| Limestone White | `#F4F4F2` | Primary background |
| Obsidian Black | `#1C1C1C` | Primary text, high-contrast borders |
| Jungle Canopy | `#2D6A4F` | Primary action / accents |
| Maya Blue | `#0080C6` | Secondary accent — sparingly, for highlights, active states, links. A real historical pigment used at Chichén Itzá and in the Bonampak murals; this is what keeps the palette from reading as generic "earthy green + terracotta." |
| Terracotta/Cinnabar | `#E07A5F` | Destructive actions / errors / high-alert badges only |

No gradients. No glassmorphism. No soft drop-shadows anywhere, ever — shadow tokens are disabled at the Tailwind config level, not just avoided by convention.

### 3.2 Typography

* **Display (headings):** A heavy, monumental, blocky sans-serif or display font (e.g. Teko, Oswald, or geometric equivalent) — simulates the weight of stone carving.
* **Body/UI:** Inter (or equally legible clean sans-serif) — absolute readability for the target audience.
* No monospace fonts anywhere in UI copy, navigation, or labels. Monospace reads as "developer tool," not "carved stone" — this is the single most important typography rule in this document.

### 3.3 Shape & Structural Motifs (Reference Material)

These are the actual Maya visual devices to build with — not abstract "blocky" adjectives:

* **Glyph-block grid:** Maya hieroglyphic writing is composed in discrete square/rectangular blocks, read in paired columns. Use this as a genuine layout logic — each step of a flow, each card, is a "block" — rather than an exposed CSS-grid brutalist look.
* **Corbel arch framing:** the stepped, inward-leaning triangular archway used in Maya architecture. Use for card tops, modal headers, or image frames instead of plain rectangles or rounded corners.
* **Talud-tablero (stepped pyramid) profile:** the alternating sloped/vertical stepped silhouette of Maya pyramids. Use for section dividers, background silhouettes, or hero framing instead of hairline rules.
* **Textile/weaving pattern:** geometric repeating patterns from Guatemalan/Mesoamerican weaving — usable as a subtle divider or border treatment, never as a busy background texture.
* **Corners:** not a blanket rule. Specify per element — some elements are fully sharp-cut (stone-cut), others use a stepped-notch corner derived from the talud-tablero motif. Applying `rounded-none` uniformly everywhere is what produces a generic brutalist-tech look — avoid that outcome explicitly.

### 3.4 Icons

Single-color, etched/incised line style. No fill, no gradients, no drop shadow. Line weight should read as "carved into stone," not "drawn with a vector pen tool." Sourced from Game-Icons.net or hand-styled to match.

## 4. Named Anti-Patterns (DO NOT USE)

This list exists because a prior AI generation pass produced exactly these failure modes from an earlier, vaguer version of this doc. Treat this as a hard blocklist, not a suggestion:

* Monospace or code-style fonts anywhere in UI copy or navigation
* `//` or terminal-prompt-style labels (e.g. `// home`, `$ register`)
* Exposed grid lines used as decoration
* Terminal-window chrome (fake window dots, fake title bars)
* Dark mode
* Glitch/scanline/CRT effects
* Uniform `rounded-none` applied blanket-style across every element
* Generic AI-cliché palettes: warm cream + high-contrast serif + terracotta-near-`#D97757`, or near-black + single acid-green/vermilion accent
* Numbered markers (01/02/03) used as decoration where the content isn't actually a sequence
* Generic tech illustrations, floating colorful blobs, overused emojis

## 5. UX Guardrails for Low-Literacy Users

* **Workflow-driven layouts:** design strictly around the step-by-step registration flow. The user should never wonder "what do I do next?"
* **The 1-2-Muted Rule:** each view has exactly one obvious primary action, at most a couple of secondary actions, everything else visually muted.
* **Cognitive load reduction:** important elements are physically larger to establish unmistakable hierarchy. No vague or clever microcopy — direct, literal, action-oriented phrases (Bahasa Indonesia equivalents of "Start Registration," not "Begin the Ritual").
* **Form validation:** strict, with clear, plain-language error messages in Bahasa Indonesia.

## 6. Form Factor & Layout

* **Responsiveness:** fully responsive.
* **Desktop nav:** clean, blocky top navbar resembling a temple lintel.
* **Mobile nav:** bottom nav bar, optimized for thumb reach.
* **Layout density:** balanced "stepped" grid mirroring Maya pyramids — not extreme density, not giant void spaces.

## 7. LLM Visibility & Agentic Infrastructure

* **Clean Markdown sourcing:** every content page at `/path` also serves clean Markdown at `/path.md`.
* **Content negotiation:** honor `Accept: text/markdown`; resolve ties to Markdown; `406` if neither HTML/MD acceptable; set `Vary: Accept`.
* **Robots.txt & signals:** don't block AI crawlers. Include `Content-Signal: search=yes, ai-input=yes, ai-train=yes`.
* **Routing pointers:** `<link rel="alternate" type="text/markdown" href="/path.md" />` in `<head>`; visually hidden div noting the Markdown version's URL for human copy-pasters.
* **Site manifest:** `/llms.txt` at root, briefly outlining site structure.
* **Strict anti-patterns:** no `<meta name="ai-content-url">`, no `/.well-known/ai.txt`, no hidden HTML comments, no AI toggle buttons, no User-Agent sniffing.

## 8. Page Spec Format

Each page or major section gets its own Markdown file (e.g. `homepage.md`, `competition-details.md`). These files:

* Reference tokens/motifs by name from this document (e.g. "Jungle Canopy," "corbel arch framing") — never redefine colors, fonts, or shape rules locally.
* Describe content structure, data shapes (as JSON), interaction/state behavior, and routing.
* Use ASCII wireframes where layout logic (asymmetry, overlap, parallax) isn't obvious from prose alone.
* Mark unresolved content (actual copy, images, data) with `[PLACEHOLDER: ...]` rather than inventing filler copy.

## 9. Implementation Checklist

* [ ] Is the primary action the most visually dominant element on the screen?
* [ ] Display font used only for headings; Inter used for all forms/body copy?
* [ ] Zero soft shadows, zero gradients, zero glassmorphism anywhere?
* [ ] Any monospace fonts, `//`-style labels, or terminal chrome present? (If yes — remove. See Section 4.)
* [ ] Corners specified per-element, not blanket `rounded-none`?
* [ ] Palette limited to the five named tokens in 3.1 — no invented colors?
* [ ] Icons in single-color etched-line style, used sparingly?
* [ ] All copy in Bahasa Indonesia, direct and literal (no clever/vague microcopy)?
* [ ] Easy to navigate and fill out one-handed on mobile?
* [ ] `Accept: text/markdown` content negotiation configured for informational routes?