# Tool Research — UI/UX Designer
**Owner:** Suki Nakamura
**Sprint:** Prototype / 1-hour research

---

## Design Tooling

**Figma (free tier)** — best option. Free tier allows 3 projects, unlimited collaborators, and full prototyping. All screens fit within one project. No cost.

**Alternative considered:** Penpot (open source, self-hosted). Rejected for prototype — setup overhead not worth it when Figma free tier is sufficient.

**Decision: Figma.**

---

## Rider-Waite Card Images

**Licensing situation:** The original 1909 Rider-Waite deck is in the public domain in the United States. Pamela Colman Smith (illustrator) died 1951; Arthur Edward Waite (author) died 1942. In the US, works published before 1928 are public domain. The original deck was published 1909 by the Rider Company.

**NOT public domain:**
- Universal Waite Tarot (recolored by Mary Hanson-Roberts, 1990) — still under copyright
- Radiant Rider-Waite (Smith-Waite Centennial, 2009) — still under copyright
- Any reformatted/recolored editions published after 1927

**Source:** Wikipedia's "Rider-Waite Tarot" article; archive.org high-res scans.

**Best source for high-res images:** [archive.org/details/rider-waite-tarot-scans](https://archive.org/details/rider-waite-tarot-scans) — original 1909 printing scans at high resolution. Also available on Wikimedia Commons with public domain tags.

**For the 18 cards in scope:**
All 18 cards are present in the original deck. Download individual card images from Wikimedia Commons where each file's PD status is verified.

**Decision: Use original 1909 Rider-Waite scans from archive.org / Wikimedia Commons.**

---

## Card Image Display Treatment

**Question raised in kickoff:** Full card face vs. cropped detail vs. name only?

**Research:** Existing tarot apps (Labyrinthos, Golden Thread, The Pattern) universally show full card faces. Users orient to the card image before reading the interpretation — the image is part of the meaning-making. The reading anchor ("the grip of the coin held to the chest") is only graspable if the user can see it.

**Decision: Full card face, displayed at a size where the anchor detail is visible.** On mobile, a card height of ~180px at 390px viewport width is sufficient to see detail without dominating the screen.

---

## Typography

**Google Fonts (free, open license):**
- Display / card names: **Cormorant Garamond** — elegant, contemplative, serif. Feels weighted.
- Body / interpretation text: **IM Fell English** — slightly irregular, humanist, historical. Appropriate for the register.
- Fallback: **Libre Baskerville** — more neutral serif, readable at small sizes.

**Decision: Cormorant Garamond (display) + IM Fell English (body).**

---

## Color System

Three values only:
- Background: `#F5F0E8` (warm off-white, cream)
- Text: `#1C1C1A` (near-black, warm undertone)
- Accent (single, use sparingly): `#8C7A5E` (muted warm brown — for active state, anchor highlight)

No brand colors. No bright accents. No gradients.

---

## Reference Products Studied

| Product | What it does well | What to avoid from it |
|---|---|---|
| Labyrinthos (tarot app) | Clean card grid, readable interpretations | Too educational, too much explanation |
| Day One (journaling) | Ritual of daily entry, restraint | Too social-focused in recent versions |
| Oak (meditation) | Breathing animation, loading ritual | Slightly too playful/rounded |
| The Pattern (astrology) | Thoughtful language, gravity | Too much text density |
| Headspace (old UI) | Breathing ring for waiting | Gaming/streaks framework — avoid |

**Conclusion:** Closest analogue is Day One (ritual daily use, no social) + contemplative reading experience of The Pattern (gravity, language weight). But both are more decorated than this product needs to be. Strip further.

---

## Processing Ritual Animation

**Breathing ring spec:** A single circle that slowly expands and contracts. Cycle: 4 seconds expand, 4 seconds contract. Implemented in CSS (`@keyframes` with `transform: scale()`). No libraries needed.

Label transitions between states should fade (200ms), not slide or pop.

**No progress bar.** No percentage. No estimated time. The indeterminate quality is intentional.
