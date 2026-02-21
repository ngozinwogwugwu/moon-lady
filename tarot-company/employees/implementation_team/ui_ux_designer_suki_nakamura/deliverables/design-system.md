# Design System — v1
**Owner:** Suki Nakamura
**Tickets:** SUKI-001
**Status:** Complete

---

## Philosophy

Sacred minimalism. The product should feel like a very good notebook — not a wellness app. Nothing competes with the reading. Typography does the work; decoration does not exist.

---

## Color System (3 values)

```css
:root {
  --c-bg:     #F7F3EE;  /* warm parchment — background of everything */
  --c-text:   #1C1917;  /* warm near-black — all text */
  --c-accent: #9C8063;  /* muted warm bronze — borders, subtle UI, active states */
}
```

**Usage rules:**
- Background: `--c-bg` only. No cards, panels, or surfaces with a different background color.
- Text: `--c-text` only. No gray text. No secondary color for "less important" text — use smaller size or lighter weight instead.
- Accent: `--c-accent` for borders, the breathing ring, tab underlines, and any single interactive highlight. Used sparingly.
- No fills on buttons. No colored backgrounds on interactive elements.

---

## Typography

**Google Fonts imports:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=IM+Fell+English:ital@0;1&display=swap" rel="stylesheet">
```

### Type Scale

| Role | Font | Size | Weight | Line height |
|---|---|---|---|---|
| App name / display | Cormorant Garamond | 28px / 1.75rem | 300 | 1.1 |
| Screen heading | Cormorant Garamond | 22px / 1.375rem | 400 | 1.2 |
| Card name | Cormorant Garamond | 18px / 1.125rem | 400 | 1.3 |
| Position label | Cormorant Garamond | 12px / 0.75rem | 300 | 1.4 |
| Body / interpretation | IM Fell English | 16px / 1rem | 400 | 1.65 |
| Body italic (anchors) | IM Fell English | 16px / 1rem | 400 italic | 1.65 |
| Supporting line | IM Fell English | 14px / 0.875rem | 400 italic | 1.5 |
| Button / CTA | Cormorant Garamond | 16px / 1rem | 400 | 1 |
| Label / meta | Cormorant Garamond | 12px / 0.75rem | 300 | 1.4 |

**Typography rules:**
- All body copy is IM Fell English. All labels, names, and CTAs are Cormorant Garamond.
- Italic is used sparingly: supporting lines, Tier 3 preface, the stalker note.
- Letter-spacing on position labels: `0.08em` (small-caps feel without actual small-caps).
- No bold except for active tab indicator (font-weight: 500).

---

## Spacing Scale

Base unit: `4px` (0.25rem)

| Token | Value | Use |
|---|---|---|
| `space-1` | 4px | Tight internal spacing |
| `space-2` | 8px | Component padding (small) |
| `space-3` | 12px | Standard gap |
| `space-4` | 16px | Section padding |
| `space-6` | 24px | Between major blocks |
| `space-8` | 32px | Screen-level vertical rhythm |
| `space-12` | 48px | Large vertical gaps |
| `space-16` | 64px | Top/bottom breathing room |

---

## Component Primitives

### Button

Two variants only:
1. **Primary** — Cormorant Garamond 16px, `--c-text`, no background, 1px border `--c-accent`, 8px top/bottom padding, 20px left/right padding. Full width on mobile.
2. **Ghost / text link** — Cormorant Garamond 12–14px, `--c-accent`, no border, no padding. Underlined on hover.

No filled buttons. No rounded-pill buttons. No shadow.

```css
.btn-primary {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1rem;
  color: var(--c-text);
  background: transparent;
  border: 1px solid var(--c-accent);
  padding: 8px 20px;
  width: 100%;
  cursor: pointer;
  letter-spacing: 0.04em;
}

.btn-ghost {
  font-family: 'Cormorant Garamond', serif;
  font-size: 0.875rem;
  color: var(--c-accent);
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}
```

### Card (reading card container)

No border. No shadow. No background. Cards are stacked content blocks, not UI containers.

The Rider-Waite image has its own weight. Let it breathe.

### Input (text area — dev text mode only)

```css
textarea {
  font-family: 'IM Fell English', serif;
  font-size: 1rem;
  color: var(--c-text);
  background: transparent;
  border: 1px solid var(--c-accent);
  border-radius: 0;
  padding: 12px;
  width: 100%;
  resize: vertical;
}
```

### Tab (Exploratory lens switch)

Two text tabs, left-aligned. Active tab: font-weight 500, 1px bottom border in `--c-accent`. Inactive: font-weight 300, no border.

```css
.tab { font-family: 'Cormorant Garamond', serif; font-size: 1rem; font-weight: 300; color: var(--c-text); border: none; background: transparent; padding: 4px 0; margin-right: 24px; cursor: pointer; }
.tab.active { font-weight: 500; border-bottom: 1px solid var(--c-accent); }
```

---

## Breathing Ring Animation

The only animation in the product (outside of crossfades). Used on the processing ritual screen.

```css
@keyframes breathe {
  0%, 100% {
    transform: scale(0.96);
    opacity: 0.45;
  }
  50% {
    transform: scale(1.04);
    opacity: 0.85;
  }
}

.breathing-ring {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 1px solid var(--c-accent);
  animation: breathe 8s ease-in-out infinite;
  will-change: transform, opacity;
}
```

**Keyframe parameters:**
- Duration: 8s
- Timing: ease-in-out
- Scale range: 0.96 → 1.04 (subtle — not dramatic)
- Opacity range: 0.45 → 0.85
- The ring is a border-only circle — no fill

---

## State Transitions

All text state changes use a 200ms opacity crossfade. No motion, no slide, no scale.

```css
.crossfade {
  transition: opacity 200ms ease;
}
.crossfade.hidden {
  opacity: 0;
}
```

Theo: implement as: set opacity to 0 (200ms), swap text, set opacity to 1 (200ms).

---

## Layout

- Max width: `480px`, centered
- Horizontal padding: `24px`
- All screens are full-viewport-height (`100dvh`)
- No navigation bar, no header chrome
- Content is vertically centered or top-aligned with `64px` top padding (screen-dependent)
