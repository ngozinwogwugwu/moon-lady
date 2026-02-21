# Prototype Brief — UI/UX Designer
**To:** Suki Nakamura — UI/UX Designer
**From:** Product Team
**Date:** 2026-02-21
**Reference:** `tarot-company/specs/prototype-spec.md` — read this first

---

## What You're Building

A tarot-based reflection product. The user records a voice memo; the system returns a three-card reading. Your job is to design every screen the user encounters, including all the states the pipeline can produce.

This is not a consumer app. The design philosophy is **sacred minimalism**: ritual gravity without spectacle. Restraint over decoration. The reading is the event — the UI supports it without competing.

---

## Your Deliverables

1. **Screen designs for all 8 states** (spec section 7):
   - Disclosure screen (first-use only)
   - Home screen
   - Recording screen
   - Review screen
   - Processing screen (ritual — 3 states)
   - Reading screen (the primary surface)
   - Warm no — abstain
   - Warm no — pipeline failure

2. **Interaction annotations** for Theo: what happens on each tap, what triggers each state transition, what the SSE events drive.

3. **Reading screen variants:**
   - Commit band (single reading)
   - Exploratory band (Lens A / Lens B tabs)
   - With stalker card recurrence note (inline, under card name)
   - With Major Arcana tier 1/2/3 treatment (Tier 3 only gets a one-line preface)

---

## Key Decisions Already Made (Don't Revisit)

- **Voice memo is the input.** No text box for users. Dev override exists behind a flag but users never see it.
- **"Reversed" is never shown to users.** Orientation is internal. The reading interprets toward it silently.
- **MatchScore is never shown.** Users see the reading (Commit = single reading, Exploratory = two lenses) or a warm no. No numbers.
- **Major Arcana tier is not labeled.** Tier 3 gets a quiet one-line preface. No tier number, no badge, no spectacle.
- **Scarcity warm no is not in the prototype.** Only abstain and pipeline failure warm nos.
- **Stalker card language is fixed:** first recurrence — *"This card is returning. Sometimes that's just chance; sometimes it's a theme you're ready to meet again."* This is inline, under the card name, not a separate screen.

---

## Processing Ritual (Critical)

The pipeline takes 4–10 seconds. The processing screen is one of the most important design surfaces. It has three states driven by real-time SSE events from the backend:

1. **Listening** — transcription in progress
2. **Choosing cards** — Stage A running
3. **Writing** — Stage B running

Design constraint: make the wait part of the ritual. One slow, breathing-rhythm animation (not a spinner). One state label. One supporting line ("Give it a few breaths."). No progress bar with a percentage. No entertainment.

If Stage B is a cache hit, stages 2 and 3 collapse — the transition is visibly faster. Do not label this. Let it feel quick.

---

## Reading Screen (Most Important)

Three cards: **Past / Present / Future** labeled as *Root / Active / Trajectory*.

Per card: card image (Rider-Waite), card name, stalker note if applicable, interpretation text.

For Exploratory band: *"Two plausible readings"* header (small). Two tabs: Lens A / Lens B. Anchor (exactly one concrete image detail or practice per reading) is the same in both lenses — it should be visually stable across tabs so users understand they're seeing the same anchor, two different framings.

Post-reading actions (quiet, small, at the bottom): Save (default), Reflect (optional journaling prompt).

---

## Design Constraints

- **No gamification.** No badges, streaks, or social features.
- **No bright colors.** Near-black on off-white or cream. Nothing playful.
- **No bounces.** Motion is slow and deliberate.
- **Typography:** serif or humanist sans. Nothing rounded.
- **The reading must dominate attention.** Everything else is infrastructure for the reading.

---

## Open Questions for You to Resolve

1. **Recording hard cap (5:00) vs. soft warning (4:30):** The spec says hard cap. What does the UI look like as the user approaches the limit? Does the hard stop feel jarring?

2. **Warm no (abstain) retry:** "Record again" — does this look like starting over, or does the previous warm no screen stay visible while the new recording begins? UX needs to decide.

3. **Exploratory band tabs:** The spec calls them "Lens A" and "Lens B." Is that the right label? Could be "Reading A / Reading B" or "Path A / Path B." Your call — just make sure it doesn't imply one is "correct."

4. **Card image treatment:** Full card face, cropped card detail, or illustrated abstraction? The reading anchors reference specific Rider-Waite image details — the card image should support recognition of those details.
