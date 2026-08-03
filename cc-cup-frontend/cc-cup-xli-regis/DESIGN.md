# DESIGN.md: Maya-Themed Registration Platform

> **System Context:** This document serves as the absolute source of truth for all human developers and AI coding agents working on the registration platform. It defines the architecture, visual identity, UX constraints for low-literacy users, and LLM-visibility infrastructure.

## 1. Project Overview & Identity

* **Core Purpose:** A friction-free, step-by-step competition registration platform.
* **Target Audience:** Students with low literacy levels. The UI must be highly intuitive, heavily guarded against user confusion, and rely on clear visual hierarchy rather than complex text.
* **Theme/Vibe:** Ancient Maya Civilization.
* *Aesthetic:* Monumental, geometric, and grounded. It should evoke the stone-carved permanence of Maya architecture (like Chichén Itzá or Tikal) and the lushness of the surrounding jungle.
* *Tone:* Clean, light-themed, and modern. Avoid cartoonish tropes, muddy textures, or "Indiana Jones" style decay.


* **Design Philosophy:** Radical simplicity and structural geometry. Typography, robust spacing, and monumental layout structures do the heavy lifting. Avoid decorative fluff.

## 2. Tech Stack & Engineering Constraints

* **Framework:** React JS.
* **Styling:** Tailwind CSS.
* **Components:** `shadcn/ui`, heavily customized to reflect the blocky, grounded geometry of the Maya theme. (e.g., sharp corners, prominent borders, zero soft drop-shadows).
* **Icons:** Strictly sourced from Game-Icons.net, used sparingly for high-impact thematic flair (e.g., stylized suns, stepped pyramids, jaguars, or geometric glyphs).

## 3. Visual & Thematic Constraints

### Typography

Let the typography drive the aesthetic. Do not over-rely on icons or images to convey meaning.

* **Headings:** A heavy, monumental, blocky sans-serif or display font (e.g., *Teko*, *Oswald*, or a geometric equivalent) to simulate the weight of stone carvings.
* **Body / UI Text:** *Inter* (or a highly legible, clean sans-serif equivalent) to ensure absolute readability for the target audience.

### Color Palette & Themes

* **Mode:** Light Mode only.
* **Core Palette:** Grounded, earthy, and vibrant.
* *Limestone White:* `#F4F4F2` (Primary Background)
* *Obsidian Black:* `#1C1C1C` (Primary Text and high-contrast borders)
* *Jungle Canopy:* `#2D6A4F` (Primary Action / Accents)
* *Terracotta/Cinnabar:* `#E07A5F` (Destructive Actions / Errors / Highlights)


* **Strictly Forbidden:** Generic gradients, floating colorful blobs, glassmorphism/glass cards, generic tech illustrations, soft UI shadows, and overused emojis.

### Form Factor & Layout

* **Responsiveness:** Fully responsive across all devices.
* **Desktop Navigation:** Clean, blocky top navbar resembling a temple lintel.
* **Mobile Navigation:** Bottom navigation bar optimized for easy thumb-reach.
* **Layout Density:** Balanced. Use a "stepped" grid layout mirroring Maya pyramids. Avoid extreme density (which confuses low-literacy users) and giant void spaces.

## 4. UX Guardrails for Low-Literacy Users

* **Workflow-Driven Layouts:** Design strictly around the step-by-step registration workflow. The user should never wonder, "What do I do next?".
* **The 1-2-Muted Rule:** Aggressively prioritize actions. Each view must have exactly *one* obvious primary action, a maximum of a few secondary actions, and everything else must be visually muted.
* **Cognitive Load Reduction:**
* Make important elements physically larger to establish an unmistakable visual hierarchy.
* Avoid vague marketing language or clever microcopy. Use direct, literal, action-oriented phrases (e.g., instead of "Begin the Ritual," use "Start Registration").
* Implement strict form validation with clear, simple error messages written in plain language.



## 5. LLM Visibility & Agentic Infrastructure

To ensure this platform is fully readable by LLMs (ChatGPT, Claude, Perplexity) and coding agents, the following infrastructure must be implemented:

* **Clean Markdown Sourcing:** For every content page at `/path`, the server must also serve clean Markdown at `/path.md`.
* **Content Negotiation:** Implement `Accept: text/markdown` headers. If an AI agent requests Markdown, resolve ties to Markdown, return `406 Not Acceptable` if neither HTML/MD is acceptable, and set `Vary: Accept`.
* **Robots.txt & Signals:** Do not block AI crawlers. Include the Cloudflare Content-Signal directive: `Content-Signal: search=yes, ai-input=yes, ai-train=yes`.
* **Routing Pointers:** * Include `<link rel="alternate" type="text/markdown" href="/path.md" />` in the HTML `head`.
* Include a visually hidden `div` for human copy-pasters: *"A Markdown version of this page is available at [URL]."*.


* **Site Manifest:** Ship an `/llms.txt` file at the root directory serving as a brief README outlining the site's structure for AI-mediated conversations.
* **Strict Anti-Patterns (DO NOT USE):** Do not implement `<meta name="ai-content-url">`, `/.well-known/ai.txt`, hidden HTML comments, AI toggle buttons, or User-Agent sniffing.

## 6. Implementation Checklist (For Agent/LLM Verification)

* [ ] Is the primary action the most visually dominant, monumental element on the screen?
* [ ] Does the page use a monumental, blocky display font for main headers and a highly readable sans-serif (Inter) for forms/body?
* [ ] Are there any generic AI-looking gradients, soft drop-shadows, or floating decorations? (If yes, explicitly remove them).
* [ ] Is the form utilizing the Maya-inspired color palette (Limestone, Obsidian, Jungle, Terracotta)?
* [ ] Is the form easy to navigate and fill out on a mobile device with one hand?
* [ ] Are we using limited, meaningful, geometry-focused icons from game-icons.net instead of generic icon packs?
* [ ] Is standard HTTP content negotiation (`Accept: text/markdown`) configured for all informational routes?