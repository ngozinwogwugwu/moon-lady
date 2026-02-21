# Tickets — UI/UX Designer
**Owner:** Suki Nakamura
**Sprint:** Prototype

Technology-agnostic. These describe what to design, not how to implement it.

---

## SUKI-001: Design system baseline
**Size:** S
**Depends on:** nothing
**Blocks:** all other SUKI tickets

Establish the design primitives used across all screens:
- Typeface choices (display + body)
- Color system (3 values: background, text, accent)
- Spacing scale
- Component primitives: button, card, input, tab

### Acceptance criteria
- [ ] Figma file created with shared styles defined
- [ ] Colors match the three-value system (warm off-white, near-black, muted accent)
- [ ] Typefaces installed and rendered in Figma (Cormorant Garamond + IM Fell English or approved alternatives)
- [ ] One reference component demonstrates all primitives at once

---

## SUKI-002: Disclosure screen
**Size:** S
**Depends on:** SUKI-001
**Blocks:** THEO (disclosure screen implementation)

First-use only. Plain language, no policy wall. One action.

### Acceptance criteria
- [ ] Text is plain language (non-lawyerly) and honest about transcript retention
- [ ] Single "Got it" confirmation action
- [ ] No checkbox required (friends-only prototype population)
- [ ] Annotation: what fires when "Got it" is tapped (disclosure confirmation API call + transition to home)

---

## SUKI-003: Home screen
**Size:** S
**Depends on:** SUKI-001
**Blocks:** THEO (home screen implementation)

Single primary action. No clutter.

### Acceptance criteria
- [ ] One primary CTA: "Record your memo" (or similar — final copy TBD)
- [ ] One secondary link: "What is this?" (one paragraph, no pipeline explanation)
- [ ] If user has a previous reading in session: "Your last reading" link visible
- [ ] No navigation bar, no logo prominence, no other elements

---

## SUKI-004: Recording screen
**Size:** M
**Depends on:** SUKI-001
**Blocks:** THEO (recording component)

Full-screen. Distraction-minimal. Four states to design.

### States
1. **Idle (pre-record):** Large record button, guidance text, elapsed time at 0:00
2. **Recording:** Waveform visualization, elapsed timer, "Finish" button (appears after 8 seconds)
3. **Soft warning (1:30):** Visual indicator that recording is approaching the end (subtle — not alarming)
4. **Hard stop (2:00):** Recording ends automatically, transitions to Review

### Acceptance criteria
- [ ] All 4 states designed and annotated
- [ ] Guidance text: "Speak what's present. 1–3 minutes is enough." (or similar)
- [ ] "Finish" button placement does not compete with record button
- [ ] Soft warning (1:30) treatment is subtle — a countdown, not an alarm
- [ ] Hard stop (2:00) transition annotated (automatic, no user action required)
- [ ] Annotation: what happens if microphone permission is denied (recovery state)

---

## SUKI-005: Review screen
**Size:** S
**Depends on:** SUKI-001
**Blocks:** THEO (review screen implementation)

After recording. Two actions: re-record or submit.

### Acceptance criteria
- [ ] Playback control (play/pause, elapsed time)
- [ ] "Re-record" and "Submit" actions both visible; Submit is primary
- [ ] One transparency line: "Audio → transcript (kept during prototype for internal review)"
- [ ] Annotation: audio upload begins in background on this screen (before "Submit" is tapped)

---

## SUKI-006: Processing ritual screen
**Size:** M
**Depends on:** SUKI-001
**Blocks:** THEO (processing ritual implementation)

The most important transitional surface. Three sequential states driven by the pipeline.

### States
1. **Listening** — transcription running
2. **Choosing cards** — Stage A running
3. **Writing** — Stage B running
(If Stage B is cache hit, states 2 and 3 collapse visibly — faster, no label change)

### Acceptance criteria
- [ ] Single breathing ring animation: slow expand/contract cycle, ~8s period
- [ ] State label changes between the three states (crossfade, no motion)
- [ ] Supporting line: "Give it a few breaths."
- [ ] No progress percentage, no estimated time
- [ ] Animation spec documented for Theo: keyframe parameters, timing function

---

## SUKI-007: Reading screen — Commit band
**Size:** L
**Depends on:** SUKI-001
**Blocks:** THEO (reading display — Commit)

The primary product surface. Three cards: Root / Active / Trajectory.

### Acceptance criteria
- [ ] Three-card vertical layout (mobile-first: cards stacked, not side-by-side)
- [ ] Per card: card image (Rider-Waite), card name, position label (Root/Active/Trajectory)
- [ ] Interpretation text follows each card
- [ ] Exactly one anchor per card visually distinct (subtle treatment — not highlighted but findable)
- [ ] Post-reading actions (Save, Reflect) at the bottom, visually quiet
- [ ] Reading dominates attention; post-reading actions do not compete

---

## SUKI-008: Reading screen — Exploratory band
**Size:** M
**Depends on:** SUKI-007
**Blocks:** THEO (reading display — Exploratory)

Same layout as Commit but with two lenses.

### Acceptance criteria
- [ ] "Two plausible readings" header (small, understated — not celebratory)
- [ ] Two tabs: Lens A (default), Lens B
- [ ] Anchor is visually the same in both lenses (it doesn't change between tabs — this should be apparent)
- [ ] No implication that one lens is "correct"
- [ ] Annotation: tab is a content switch, not a navigation

---

## SUKI-009: Reading screen — stalker card variant
**Size:** S
**Depends on:** SUKI-007
**Blocks:** THEO (stalker card rendering)

Stalker card note appears inline, under the card name.

### Acceptance criteria
- [ ] One-line note immediately below the card name
- [ ] Copy: "This card is returning. Sometimes that's just chance; sometimes it's a theme you're ready to meet again." (first recurrence)
- [ ] Visual treatment: same weight as card name, not alarming, matter-of-fact
- [ ] Does not interrupt the reading layout — the interpretation text follows normally

---

## SUKI-010: Reading screen — Major Arcana Tier 3 preface
**Size:** S
**Depends on:** SUKI-007
**Blocks:** THEO (Tier 3 treatment)

Tier 3 (3 Majors at high intensity) gets a single preface line. No other tier gets visual treatment.

### Acceptance criteria
- [ ] One line above the spread: "This spread carries unusual weight. Read slowly."
- [ ] Typographic treatment: italics, same body size — restrained, not prominent
- [ ] Nothing else changes: no different background, no additional ornament
- [ ] Tier 0/1/2 screens are identical to Commit — no preface, no indication of tier

---

## SUKI-011: Warm no — Abstain
**Size:** S
**Depends on:** SUKI-001
**Blocks:** THEO (abstain warm no implementation)

When Stage A can't select cards with sufficient confidence.

### Acceptance criteria
- [ ] Same surface as the reading screen (not an error modal, not a different page)
- [ ] Three face-down card backs in place of card images
- [ ] Copy: "I don't have enough to work with yet."
- [ ] Subtext: "Try again with 45–90 seconds about what feels most active right now."
- [ ] CTA: "Record again" — starts new recording
- [ ] No mention of MatchScore, confidence, or technical reasons

---

## SUKI-012: Warm no — Pipeline failure
**Size:** S
**Depends on:** SUKI-001
**Blocks:** THEO (pipeline failure implementation)

When something goes wrong in the pipeline (transcription failure, LLM error).

### Acceptance criteria
- [ ] Clean, non-alarming state
- [ ] Copy: "Something went wrong. Your words didn't make it through."
- [ ] CTA: "Try again"
- [ ] No error codes or technical details shown

---

## SUKI-013: Interaction annotations for Theo
**Size:** M
**Depends on:** SUKI-002 through SUKI-012
**Blocks:** THEO (integration of all screens)

Document the state machine for all screen transitions.

### Acceptance criteria
- [ ] Figma prototype or annotation layer showing all transitions
- [ ] Every tap target annotated with what it triggers
- [ ] SSE events → UI state transitions documented (which event triggers which screen change)
- [ ] All edge case flows included (permission denied, upload fails, SSE connection drops)
