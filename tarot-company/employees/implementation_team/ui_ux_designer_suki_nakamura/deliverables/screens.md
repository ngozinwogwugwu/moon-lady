# Screen Specifications — v1
**Owner:** Suki Nakamura
**Tickets:** SUKI-002 through SUKI-012
**Status:** Complete

All screens use the design system defined in `design-system.md`. References to colors, typography, and spacing use tokens defined there.

---

## Screen 1: Disclosure (SUKI-002)

**When:** First use only. Never shows again after confirmation.

**Layout:** Vertically centered, 24px horizontal padding.

```
[64px top]

Before you begin

[24px gap]

Your voice memo will be transcribed so the app can work with
what you said. During this prototype, transcripts are kept
temporarily for internal review. They are not shared or sold.

[32px gap]

[btn-primary: Got it]

```

**Copy (final):**
- Heading: "Before you begin"
- Body: "Your voice memo will be transcribed so the app can work with what you said. During this prototype, transcripts are kept temporarily for internal review. They are not shared or sold."
- Button: "Got it"

**Typography:**
- Heading: Cormorant Garamond 22px, weight 400
- Body: IM Fell English 16px, line-height 1.65
- Button: Cormorant Garamond 16px (btn-primary)

**Annotation:** "Got it" tap fires `POST /api/devices/:token/disclose` then transitions to Home screen.

---

## Screen 2: Home (SUKI-003)

**When:** Default screen after disclosure. Re-entry point after readings.

**Layout:** Vertically centered.

```
[64px top]

Moon Lady

[48px gap]

[btn-primary: Record your memo]

[16px gap]

[btn-ghost: What is this?]

[— if previous reading exists —]
[32px gap]
[btn-ghost: Your last reading →]

```

**Copy:**
- App name: "Moon Lady" (display, small — not a logo, just text)
- Primary CTA: "Record your memo"
- Secondary: "What is this?"
- Conditional: "Your last reading →"

**Typography:**
- App name: Cormorant Garamond 28px, weight 300
- Primary button: btn-primary
- Secondary links: btn-ghost

**"What is this?" expanded text (inline, no modal):**
> "A voice memo becomes a tarot reading. Speak for a minute or two about whatever is most present. The app listens, draws three cards, and offers a reflection. Nothing is predicted. Nothing is prescribed."

**Annotation:** "Record your memo" navigates to Recording screen. "What is this?" toggles explanation inline (no new screen). "Your last reading" navigates to the completed reading.

---

## Screen 3: Recording (SUKI-004)

**Four states — same screen, content changes.**

### State 1: Idle (pre-record)

```
[64px top]

Speak what's present.
1–2 minutes is enough.

[48px gap]

[large circle button — 64px diameter, 1px border --c-accent]

[16px gap]

0:00

```

**Record button:** Circle, 64px diameter, 1px solid `--c-accent`. No fill. Tap to begin.

### State 2: Recording

```
[64px top]

[waveform visualization — 40px tall, full width, animated bars]

[32px gap]

[elapsed timer — 1:23]

[32px gap]

[btn-primary: Finish]   ← appears after 8 seconds

```

**Waveform:** 20–30 vertical bars, heights derived from audio analyser amplitude data. Color: `--c-accent`. Updates at 30fps via requestAnimationFrame.

**Timer:** Cormorant Garamond 48px, weight 300. Format: `M:SS`.

**Finish button:** Standard btn-primary. Does not appear until 8 seconds have elapsed.

### State 3: Soft warning (1:30 elapsed)

Same as State 2 but:
- Timer color shifts to `--c-accent` (was `--c-text`)
- Small text appears below timer: "Wrapping up" (Cormorant Garamond 12px, weight 300, `--c-accent`)

**Treatment:** Subtle — countdown without alarm. The visual change is noticed but not alarming.

### State 4: Hard stop (2:00 elapsed)

Recording ends automatically. Transition to Review screen happens immediately — no user action.

**Annotation:** Hard stop is programmatic. MediaRecorder.stop() fires at 120000ms. `onstop` event triggers navigation to Review.

### Permission Denied (recovery state)

```
[64px top]

Microphone access is needed.

[16px gap]

Open your device settings and allow microphone access
for this app, then return here.

[32px gap]

[btn-ghost: Open settings]

```

**Annotation:** "Open settings" calls `navigator.mediaDevices.getUserMedia` with a user gesture — browser may show the permission prompt again, or on iOS the link should open `App-Prefs:Privacy&path=MICROPHONE`.

---

## Screen 4: Review (SUKI-005)

**When:** After recording completes (finish tap or hard stop at 2:00).

**Note for Theo:** Audio upload begins immediately when this screen appears — before "Submit" is tapped.

```
[32px top]

[audio playback control]
  [play/pause icon]  0:00 / 1:23

[48px gap]

[btn-ghost: Re-record]

[16px gap]

[btn-primary: Submit]

[32px gap]

[transparency line]
Audio is transcribed and stored temporarily for internal review.

```

**Playback control:** Play/pause icon (Lucide), elapsed / total. No seek bar for prototype.

**Transparency line:** IM Fell English 13px italic, `--c-accent`, centered.

**Annotation:** "Re-record" discards audio and returns to Recording screen (State 1). "Submit" opens SSE connection and transitions to Processing screen.

---

## Screen 5: Processing Ritual (SUKI-006)

**The most important transitional surface. Design with care.**

```
[vertically and horizontally centered]

[breathing ring — 200px circle]

[24px gap]

[state label — crossfades]
Listening

[16px gap]

Give it a few breaths.

```

**State labels (crossfade at 200ms on change):**
1. `Listening` — transcription running
2. `Choosing cards` — Stage A + card selection running
3. `Writing` — Stage B running

**Typography:**
- State label: Cormorant Garamond 18px, weight 400
- Supporting line: IM Fell English 14px italic

**Breathing ring:** See `design-system.md` — 200px circle, 1px `--c-accent` border, 8s ease-in-out breathe animation.

**No progress indicator. No estimated time. No percentage.**

**Annotation (for Theo):**
- `transcription_complete` SSE event → transition label to "Choosing cards"
- `stage_a_complete` (status: ok) → transition label to "Writing"
- `stage_a_complete` (status: needs_more_input) → navigate to Warm No — Abstain
- `stage_b_complete` → navigate to Reading screen
- `pipeline_error` → navigate to Warm No — Pipeline failure

---

## Screen 6: Reading — Commit Band (SUKI-007)

**Three cards stacked vertically. Reading dominates; actions are quiet.**

```
[32px top]

[— optional: Tier 3 preface line —]
[12px gap]

--- CARD 1 (Root / Past) ---
[card image — full width, aspect-ratio 2:3]
[12px gap]
[position label: ROOT]
[4px gap]
[card name: The Moon]
[— optional: stalker note —]
[16px gap]
[interpretation text — one paragraph]

[32px gap]

--- CARD 2 (Active / Present) ---
[same structure]

[32px gap]

--- CARD 3 (Trajectory / Future) ---
[same structure]

[48px gap]

[btn-ghost: Save]    [btn-ghost: Reflect]

[64px bottom]
```

**Card image:** Full container width. Aspect ratio 2:3 (standard tarot proportions). `object-fit: cover`. Source: `/public/cards/{card_id}.jpg`

**Position label:** Cormorant Garamond 12px, weight 300, letter-spacing 0.08em, `--c-accent`, uppercase.

**Card name:** Cormorant Garamond 18px, weight 400, `--c-text`.

**Interpretation text:** IM Fell English 16px, line-height 1.65. The anchor within the text is not highlighted — it's part of the prose. No special treatment.

**Save:** btn-ghost. Persists session to localStorage.

**Reflect:** btn-ghost. Opens a journaling prompt below (inline text field, no submission required).

**Journaling prompt (on Reflect tap):**
> "What in this reading surprises you?"
> [textarea — IM Fell English 16px, 4 rows, 1px `--c-accent` border]

---

## Screen 7: Reading — Exploratory Band (SUKI-008)

**Same layout as Commit, with two additions.**

```
[32px top]

Two plausible readings

[24px gap]

[Lens A]    [Lens B]    ← tabs

[24px gap]

[same three-card layout as Commit]
[interpretation switches when tab changes]

```

**"Two plausible readings" header:** Cormorant Garamond 14px, weight 300, `--c-accent`. Small and understated — not celebratory.

**Tabs:** See component primitive in `design-system.md`. "Lens A" active by default.

**Tab behavior:** Switching tabs swaps interpretation text for all three cards simultaneously. Card images, names, and position labels do not change.

**Annotation:** Tab is a content switch, not navigation. No page transition. Interpretation text swaps with a 200ms opacity fade.

---

## Screen 8: Stalker Card Variant (SUKI-009)

**One line appears below the card name when `card.stalker === true`.**

```
[card name: The Moon]
[stalker note: This card is returning.]
[16px gap]
[interpretation text]
```

**Stalker note copy:** "This card is returning. Sometimes that's just chance; sometimes it's a theme you're ready to meet again."

**Typography:** IM Fell English 14px italic, `--c-accent`. Same weight as supporting text — matter-of-fact, not alarming.

**Layout:** Appears between card name and interpretation text. Does not interrupt the reading layout. 4px gap above note, 4px gap below.

---

## Screen 9: Tier 3 Preface (SUKI-010)

**One line appears above the spread when `reading.major_tier === 3`.**

```
This spread carries unusual weight. Read slowly.

[12px gap]

[CARD 1 — Root]
...
```

**Copy:** "This spread carries unusual weight. Read slowly."

**Typography:** IM Fell English 16px italic, `--c-text`. Restrained — same size as body text, italic, no other treatment.

**Nothing else changes.** No different background, no ornament. Tier 0/1/2 screens are identical to Commit — no preface, no indication of tier.

---

## Screen 10: Warm No — Abstain (SUKI-011)

**Same surface as the reading screen — not an error modal.**

```
[32px top]

--- CARD 1 ---
[face-down card back — full width, aspect-ratio 2:3, --c-accent solid fill]

[32px gap]

--- CARD 2 ---
[face-down card back]

[32px gap]

--- CARD 3 ---
[face-down card back]

[48px gap]

I don't have enough to work with yet.

[12px gap]

Try again with 45–90 seconds about what feels most active right now.

[24px gap]

[btn-primary: Record again]

```

**Card backs:** Solid `--c-accent` rectangle, same dimensions as a reading card (full width, aspect-ratio 2:3). No image, no texture. The plainness is the point.

**Copy:**
- Heading: "I don't have enough to work with yet."
- Subtext: "Try again with 45–90 seconds about what feels most active right now."

**Typography:**
- Heading: Cormorant Garamond 18px, weight 400
- Subtext: IM Fell English 16px, line-height 1.65

**No mention of MatchScore, confidence, or technical reasons.**

**Annotation:** "Record again" navigates to Recording screen and starts a new session. The prior session is abandoned.

---

## Screen 11: Warm No — Pipeline Failure (SUKI-012)

**Clean, non-alarming. Not an error page.**

```
[vertically centered]

Something went wrong.
Your words didn't make it through.

[32px gap]

[btn-primary: Try again]

```

**Copy:**
- "Something went wrong. Your words didn't make it through."
- Button: "Try again"

**Typography:** Cormorant Garamond 18px, weight 400 for the copy.

**No error codes. No technical details. No apology.**

**Annotation:** "Try again" navigates to Home screen.
