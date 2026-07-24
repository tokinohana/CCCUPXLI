Here is an upgraded, comprehensive **UI/UX Technical Specification Document** tailored for **CC CUP XLI**. It builds directly on your structure while introducing world-class design patterns, accessibility standards, and micro-interactions.

---

# CC CUP XLI — Web Design & UI/UX Technical Specification

## 1. Global Design System & Layout Rhythm

To prevent visual monotony across long landing pages, the layout uses alternating section surface levels (Light vs. Dark/Muted surface steps) and strict 8pt grid spacing.

### Color Tokens (Grayscale Baseline)

| Token Name | Hex Code | Intended Use Case |
| --- | --- | --- |
| `color-bg-primary` | `#FAFAFA` | Default page background (Light Section) |
| `color-bg-alt` | `#121212` | High-contrast accent background (Dark Section) |
| `color-surface-card` | `#FFFFFF` | Card containers on light backgrounds |
| `color-surface-card-dark` | `#1E1E1E` | Card containers on dark backgrounds |
| `color-text-primary` | `#111111` | Primary headings & body text |
| `color-text-muted` | `#666666` | Metadata, badges, secondary text |
| `color-border` | `#E5E5E5` | Subtle dividers and card borders |

---

## 2. Navigation Bar (Sticky Header)

* **Behavior:** Fixed positioning with dynamic blur (`backdrop-filter: blur(12px)`) on scroll.
* **Layout:** * **Left:** CC CUP Logo / Brand Glyph.
* **Center:** Nav links (`Home`, `Competitions`, `Gallery`, `FAQ`).
* **Right:** Quick Action Button (`Register Now`).



---

## 3. Hero Section

> **Design Goal:** Immediate impact, high typographic contrast, zero clutter.

```
+-----------------------------------------------------------------------+
|                            [ NAVIGATION ]                             |
|                                                                       |
|                          [ PARALLAX BACKGROUND ]                      |
|                                                                       |
|                            C C  C U P  X L I                          |
|                                                                       |
|                 [ Register Now ]   [ Learn More ]                     |
|                                                                       |
+-----------------------------------------------------------------------+

```

1. **Parallax Effect:**
* Multi-layered depth (Background texture movement at 0.2x speed, foreground typography at 1.0x speed).
* Respects user preferences via `@media (prefers-reduced-motion: reduce)` to disable parallax for accessibility.


2. **Typography:**
* Single ultra-large display heading: **CC CUP XLI**.
* No subtext, no body text — maximum bold presentation.


3. **Call-To-Action (CTA) Cluster:**
* **Primary CTA:** High-contrast solid fill button (`Register Now`) with scale micro-interaction (`hover: scale(1.03)`).
* **Secondary CTA:** Ghost / outlined button with translucent background (`Learn More`) smooth scrolling to the Competitions section.



---

## 4. Body Sections

### Section A: Competitions

* **Background Tone:** `color-bg-primary` (`#FAFAFA`)
* **Layout:** Responsive 3-column Grid ($3 \times 2$ desktop, $2 \times 3$ tablet, $1 \times 6$ mobile).
* **Card Component Architecture:**
* **Top Bar:** Level Badge (`SMP` / `SMA`) using pill tag styling.
* **Icon:** Scalable Vector Graphic (SVG) with dedicated container.
* **Title:** Bold H3 Heading.
* **Footer Action:** Inline text link `View Details →` with animated arrow hover effect (`translateX(4px)`).


* **Hover Interaction:** Subtle vertical elevation shift (`translateY(-6px)`) with drop-shadow transition (`box-shadow: 0 12px 24px rgba(0,0,0,0.08)`).
* **Section CTA:** Centered secondary button linking to `/competitions`.

---

### Section B: Gallery

* **Background Tone:** `color-bg-alt` (`#121212`) — *Dark contrast break to disrupt section monotony.*
* **Layout:** Aspect-ratio balanced 3-column Grid (6 cards max).
* **Image Interaction & Saturation Effect:**
* **Default State:** Image saturation set to `50%`, opacity `0.9`.
* **Hover State:** Smooth `300ms` CSS transition to `100%` saturation, full opacity, and minor image scale (`1.04x`) bounded inside `overflow: hidden`.


* **Lightbox Modal:**
* Triggered on card click.
* Smooth entry animation (`fade-in` + `zoom-in` at `200ms`).
* Features full-screen display, dark overlay blur backdrop, close (`ESC`), and left/right navigation controls.


* **Section CTA:** Outlined dark-mode button linking to `/gallery`.

---

### Section C: Frequently Asked Questions (FAQ)

* **Background Tone:** `color-bg-primary` (`#FAFAFA`)
* **Layout:** Centered single-column accordion container (Max-width: `800px`).
* **Accordion Mechanics:**
* Clean list structure with subtle bottom borders.
* Click to expand/collapse answer block with height transition.
* Icon indicator rotates 180° when open.
* Built with accessible HTML/ARIA markup (`aria-expanded`, `aria-controls`).



---

## 5. Footer Section

* **Background Tone:** `#090909` (Deep Charcoal)
* **Layout:** 4-Column Grid Architecture:
1. **Brand & Concept:** Brief event tagline & CC CUP branding.
2. **Quick Navigation:** Sitemap links (`Home`, `Competitions`, `Gallery`, `FAQ`).
3. **Event Info:** Venue details, contact person, and email.
4. **Social Hub:** Highlighting social media icons with subtle hover states.


* **Bottom Bar:** Copyright notice `© 2026 CC CUP` and legal/privacy links.
