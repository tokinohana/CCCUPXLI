**Right now, it is performing high-contrast Modern Neo-Brutalism (stark black outlines, hard offset drop shadows, terminal-style `//` slashes) rather than authentic Maya Architecture.**

Neo-brutalism relies on **flat, weightless high-contrast vector lines**, while Maya architecture is defined by **sloped structural mass, tiered elevation, stone relief depth, and woven geometric friezes.**

Here are the precise, actionable instructions to shift the design away from web-brutalism and directly into **monolithic Mesoamerican architecture**:

---

## 1. Ditch the "Neo-Brutalist" Hard Offsets

The sharp black box-shadow offset (`box-shadow: 4px 4px 0px #000`) is the signature hallmark of modern brutalism.

* **Remove:** Flat, hard $2\text{px}$ black borders and flat offset box shadows.
* **Replace with Low-Relief Stone Depths:** Use **dual-tone inset rim highlights** to give containers physical depth (bas-relief stone effect) rather than a flat cut-out shadow.
```css
/* Replaces brutalist outline with an engraved stone rim */
box-shadow: 
  inset 1px 1px 0px rgba(255, 255, 255, 0.6),   /* Sunlit top-left edge */
  inset -1px -1px 0px rgba(0, 0, 0, 0.25),      /* Shadowed bottom-right edge */
  0px 10px 30px -10px rgba(0, 0, 0, 0.08);       /* Soft ambient ground weight */
border: 1px solid rgba(0, 0, 0, 0.15);

```



---

## 2. Shift the Hero from "Pyramid Wireframe" to "Chiseled Terrace"

In `image_85c302.png`, the hero background uses $1\text{px}$ thin black vector wireframe lines to draw a pyramid step. Thin black lines feel like CAD software or architectural schematics (brutalist).

* **Remove:** Thin vector outline wireframes and the top hanging circle wire node.
* **Replace with Tone-on-Tone Architectural Stepping:** Render the hero tiers using subtle **color-block masonry layers** (varying warm limestone tones like `#EFECE6`, `#E6E2D8`, and `#DBD5C8`) rather than thin lines.
* **Slanted Edge Geometry (Talud-Tablero):** Maya pyramids use sloped base walls (*Talud*) crowned by vertical panels (*Tablero*). Instead of standard square boxes, use CSS `clip-path` to give the hero container sloped outer edges ($85^\circ$ angles).

---

## 3. Replace Terminal Slashes (`//`) with Glyph Brackets

The `// HOME`, `// COMPETITIONS`, and `[ #01 // STELA ]` typography currently feels like a software code editor or Linux terminal.

* **Remove:** Double forward slashes (`//`) across navigation, section tags, and card headers.
* **Replace with Structural Cartouches:** Use custom corner bracket markers `┌ ┐` / `└ ┘` or small geometric Maya diamonds `◆` to enclose meta-text:
* **Brutalist (Current):** `[ #01 // STELA ]`
* **Maya Architectural (Target):** `┌ 01 ┐  MAYA CARTOUCHE` or `◆ 01 ◆ MONOLITH I`



---

## 4. Upgrade Frieze Dividers to True Stepped Relief (*Xicalcoliuhqui*)

In `image_85c645.png`, the transition between the Light Hero and Dark Gallery uses a dashed/block line that looks like a road lane marking or a brutalist pixel-grid border.

* **Remove:** Simple alternating black/white rectangle striping.
* **Replace with Interlocking Stepped Fret Motifs:** Use an authentic Mesoamerican **Stepped Fret (*Xicalcoliuhqui*)** or interlocking labyrinth pattern for section borders.

```
BRUTALIST ROAD STRIPES (Current):
■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■

MAYA STEPPED Frieze (Target Motif):
┌─┐   ┌─┐   ┌─┐   ┌─┐
│ └───┘ │ └───┘ │ └───┘ │
└───────┴───────┴───────┘

```

---

## 5. Convert FAQ Accordions into "Stone Tablet Stelae"

In `image_85c69d.png`, the accordion items look like modern tech modal cards with floating arrow buttons.

* **Incorporate Bas-Relief Engraving:** When an accordion item is clicked/expanded, inset the background slightly with a subtle inner shadow (`inset 2px 2px 4px rgba(0,0,0,0.12)`) so it feels like pressing a stone slab inward into a stone temple wall.
* **Replace Up/Down Arrows:** Swap out standard circle arrow buttons (`↑`, `↓`) with sharp geometric glyph indicators (e.g., a solid stepped triangle `▲` or a framed diamond `◈`).

---

## Summary of the Design Tuning

| Element | Current (Brutalist Web) | Target (Authentic Maya Architectural) |
| --- | --- | --- |
| **Borders** | High-contrast hard $2\text{px}$ black lines | Inset dual-tone stone rim highlights |
| **Shadows** | $4\text{px}$ offset solid black drop shadow | Inset bas-relief engraved inner shadow |
| **Hero Graphics** | Thin vector wireframe lines | Layered limestone tone-on-tone terraces |
| **Section Dividers** | Dashed black & white road-style blocks | Interlocking stepped fret frieze (*Xicalcoliuhqui*) |
| **Meta Text** | Code terminal slashes (`// HOME`) | Glyph frames (`◆ 01 ◆` or `┌ 01 ┐`) |

Implementing these changes will keep the ultra-clean layout rhythm and great typography you already built, but will completely swap out the "developer tool" feel for a magnificent, monolith stone identity.