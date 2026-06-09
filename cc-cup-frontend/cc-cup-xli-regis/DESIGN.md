1. Project Overview & Identity
Core Purpose: Competition registration platform.

Target Audience: Students with low literacy levels. The UI must be friction-free, highly intuitive, and guarded against user confusion.

Theme/Vibe: Scandinavian Vikings. However, it must avoid looking like a messy gaming forum. It should be a clean, light-themed, modern interpretation of a Norse aesthetic.

Design Philosophy: Radical simplicity. The typography and layout structure do the heavy lifting, not decorative fluff.

2. Tech Stack & Engineering Constraints
Framework: React JS

Styling: Tailwind CSS

Components: shadcn/ui (customized to fit the theme)

Icons: strictly sourced from Game-Icons.net (used sparingly for high-impact RPG/Viking flair).

3. Visual & Thematic Constraints
Typography
Headings: Berserker Regular (for heavy thematic impact).

Body / UI Text: Inter (or a highly legible, clean sans-serif equivalent).

Rule: Let the typography drive the aesthetic. Do not over-rely on icons or images to convey meaning.

Color Palette & Themes
Mode: Light Mode only.

Palette: Temporary 3-color minimalist wireframe palette (Black, White, Gray) while waiting for the design team.

Strictly Forbidden: Generic gradients, floating colorful blobs, glassmorphism/glass cards, generic tech illustrations, and overused emojis.

Form Factor & Layout
Responsiveness: Fully responsive.

Desktop Navigation: Clean top navbar.

Mobile Navigation: Bottom navigation bar optimized for easy thumb-reach.

Layout Density: Balanced. Not too dense (which confuses low-literacy users), but not overly sparse with giant void spaces.

4. UX Guardrails for Low-Literacy Users
Workflow-Driven Layouts
Design strictly around the step-by-step registration workflow. The user should never wonder, "What do I do next?"

The 1-2-Muted Rule: Aggressively prioritize actions. Each view must have exactly one obvious primary action, a maximum of few secondary actions, and everything else must be visually muted.

Cognitive Load Reduction
Avoid vague marketing language or clever microcopy. Use direct, literal, action-oriented phrases (e.g., instead of "Embark on your journey," use "Start Registration").

Make important elements physically larger to emphasize the visual hierarchy.

Use strict form validation with clear, simple error messages written in plain language.

5. UI Implementation Checklist (For LLM Reference)
[ ] Is the primary action the most visually dominant element on the screen?

[ ] Does the page use Berserker Regular for main headers and a highly readable sans-serif for forms/body?

[ ] Are there any generic AI-looking gradients or floating decorations? (If yes, remove them).

[ ] Is the form easy to fill out on a mobile device with one hand?

[ ] Are we using limited, meaningful icons from game-icons.net instead of generic icon packs?