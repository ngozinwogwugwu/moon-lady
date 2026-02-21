# Is "Appropriateness" Labelable?
**Owner:** Ilya Moreau — Symbol Architect
**Sprint:** 001 / Task I-6
**Status:** Complete — response to Ngozi's Q2 from the all-hands meeting
**Feeds:** ML Product Lead, golden test vector sprint, MajorScore calibration

---

## Answer: Yes, with a structured rubric

"Appropriate card selection" is labelable. It cannot be labeled as a single binary judgment ("right" or "wrong"), because no card selection is objectively correct for a given transcript. What can be labeled is whether the selection is *well-grounded* — whether it has defensible reasons rooted in the transcript and the geometry.

The rubric below produces a structured label rather than a binary one. That is not a weakness; it is honest about what is actually being measured.

---

## Three-Component Rubric

Each card selection in a spread is evaluated on three components. Each component is scored 0–2. Total possible per card: 6. Total per spread (3 cards): 18.

---

### Component 1: Axis Alignment (0–2)

Does the selected card's primary axis correspond to a dominant theme in the transcript?

- **2 — Strong alignment:** The transcript has a clear, sustained signal on the card's primary axis. A rater reading the transcript and the card definition would find the connection obvious.
- **1 — Partial alignment:** The transcript touches the card's primary axis but inconsistently, or the signal is present in subtext rather than explicit content.
- **0 — Weak/no alignment:** The transcript has no discernible signal on the card's primary axis. The connection is not findable on a close read.

*This component is the most important. A score of 0 here makes the selection indefensible regardless of other scores.*

---

### Component 2: Arcana Type Match (0–2)

Is the Arcana type (Major vs Minor) appropriate for the intensity of the transcript's signal?

- **2 — Appropriate type:** Major Arcana selected for a transcript with a high-intensity, sustained, or life-level signal; or Minor Arcana selected for a structural, mid-intensity signal.
- **1 — Borderline:** Major selected for a moderately intense transcript (could go either way); or Minor selected for a high-intensity transcript that could plausibly support a Major.
- **0 — Mismatch:** Major selected for a low-intensity or meandering transcript; or Minor selected for a transcript where the signal is clearly archetype-level.

*Note: In V0 with a single reading per day, Major Arcana should not appear in most readings. Frequent Major selection is a calibration signal worth monitoring.*

---

### Component 3: Spread Coherence (0–2)

Evaluated at the spread level, not per card. Do the three selected cards form a readable pattern?

- **2 — Coherent:** The three cards together make sense as a reading. A rater can articulate what the spread is pointing at. Cards may be in tension (tensioned spread) but the tension itself is legible.
- **1 — Partial coherence:** The spread has two cards that relate clearly but a third that feels unconnected or arbitrary.
- **0 — Incoherent:** The three cards do not form a pattern. A rater cannot find a through-line. The spread feels like three unrelated suggestions.

*This component is applied once per spread, not per card. It captures what neither per-card component captures: the gestalt.*

---

## Threshold for Labeled "Appropriate"

A selection is labeled **appropriate** if:
- Axis Alignment ≥ 1 (for all three cards individually), AND
- No card scores 0 on Axis Alignment, AND
- Spread Coherence ≥ 1

A selection is labeled **inappropriate** if:
- Any card scores 0 on Axis Alignment, OR
- Spread Coherence = 0

A selection is labeled **uncertain** if:
- All Axis Alignment scores are ≥ 1, AND
- Spread Coherence = 1, AND
- Rater cannot resolve whether the spread is appropriate without more context

Uncertain labels are valid and useful. They are not failures of the rubric — they are honest captures of genuine ambiguity.

---

## Who Can Apply This Rubric

The rubric requires a rater who:
1. Has read and understood the dispersion map (knows what each card's primary axis and polarity mean)
2. Can read a transcript without projecting their own interpretation onto it
3. Is willing to use "uncertain" rather than forcing a binary judgment

In V0, this means the creative team (Ilya, Amara, or Ngozi). Post-V0, a rubric-trained annotation guide would enable external labelers.

---

## Sample Labeled Examples

These are illustrative transcripts with proposed labels. They are not golden test vectors — that set requires joint ownership (see Q1 from meeting). These demonstrate rubric application.

---

**Example A — Appropriate**

*Transcript:* "I keep trying to plan everything and it's not working. Every time I think I know what's coming next, something changes. I'm exhausted from trying to control things I can't see coming."

*Selected card:* The Veil (Primary: Obscurity−, Bucket: Threshold)
*Position:* Present

| Component | Score | Notes |
|---|---|---|
| Axis Alignment | 2 | Transcript is explicitly about not-knowing and inability to anticipate. Maps directly to Obscurity− axis. |
| Arcana Type | 2 | Major Arcana appropriate — this is a sustained, life-level experience of epistemic limitation, not a passing moment. |
| Spread Coherence | — | Evaluated at spread level with other two cards |

Label: **Appropriate** (Axis Alignment = 2, Arcana type confirmed)

---

**Example B — Inappropriate**

*Transcript:* "Today was good actually. Work went fine. I talked to my sister which was nice. I'm feeling pretty settled."

*Selected card:* The Break (Primary: Rupture−, Bucket: Threshold)
*Position:* Past

| Component | Score | Notes |
|---|---|---|
| Axis Alignment | 0 | Transcript has no rupture or discontinuity signal. "Settled" and "fine" point away from Rupture. Strongest signal in transcript is mild Stability+. |
| Arcana Type | 0 | Major Arcana for a low-intensity, positive transcript is a mismatch. |
| Spread Coherence | — | Irrelevant — Axis Alignment = 0 makes this indefensible. |

Label: **Inappropriate**

---

**Example C — Uncertain**

*Transcript:* "I've been thinking a lot about what I actually want, which I don't usually let myself do. It's a bit uncomfortable. I'm not sure what I'm going to find when I keep going with it."

*Selected card:* The Turn (Primary: Self+ / slight Rupture−, Bucket: Interior)
*Position:* Present

| Component | Score | Notes |
|---|---|---|
| Axis Alignment | 1 | Transcript has Self+ signal (turning inward, asking what I want) and slight Rupture/discomfort signal. The alignment is real but not sustained — "a bit uncomfortable" is mild. |
| Arcana Type | 2 | Minor Arcana correct — this is a structural, mid-range inner moment, not an archetype-level experience. |
| Spread Coherence | — | Evaluated at spread level |

Label: **Uncertain** — Axis alignment is partial. Rater could see this as appropriate (the inward turn is real) or borderline (the discomfort is minor and the rupture signal is weak). Needs second rater.

---

## Golden Test Vector Composition

**Updated per CEO direction (2026-02-21). Original size was unspecified; now locked at 100.**

Dataset composition:
- 40 clear polarity cases (transcript has a sustained, unambiguous dominant signal)
- 30 ambiguous cases (signal is real but mixed or inconsistent)
- 15 edge/noise cases (meandering, low-signal, or affectively flat transcripts)
- 15 adversarial/overlap cases (transcripts designed to stress overlap between adjacent cards)

Each entry in the set must include:
- Deterministic selected card (the card the pipeline should select)
- Second-best card (the runner-up — used to compute margin score)
- Margin score (similarity delta between selected and second-best)
- Structural justification (why this card, referencing axis alignment)
- Ritual plausibility rating (1–5; a human rater's sense of whether the reading would land)
- Hollow flag (true/false) — see definition below

The "deterministic" label on the selected card is the correct-by-geometry answer, not a rater preference. Raters apply the rubric above; the selected card is fixed by the pipeline's logic.

---

## Hollow Definition

**Added per CEO direction (2026-02-21).**

A reading is **hollow** if ANY of the following:
- It could plausibly apply to more than 50% of transcripts (the Barnum/Forer failure mode)
- It lacks a specific anchor — an image detail, concrete observable, or small practice
- It relies only on generic emotional language ("you may be feeling uncertain," "this is a time of transition")

Operationally: a rater applying the hollow flag asks, "Could I give this interpretation to almost anyone and have it feel true?" If yes: hollow.

**The anchor rule prevents hollow readings.** Each reading must include exactly one anchor. "Exactly one" is deliberate — multiple anchors dilute specificity rather than compounding it.

The hollow flag in the golden test vector set is applied by a rater reviewing Stage B output for the test transcript. It is not a property of the card; it is a property of the specific interpretation generated.

---

## What This Enables

The rubric enables:
- **Labeled evaluation set construction** (golden test vectors) — the ML Product Lead can build a set with a clear, auditable labeling process
- **MajorScore calibration** — once labeled, the reliability diagram can be plotted (score band vs fraction labeled appropriate)
- **Hollow rate tracking** — hollow flag rate across the commit band is a direct quality signal; if high, the voice spec or drift guidelines need revision
- **Threshold revision** — if Commit-band selections frequently score 0 on Axis Alignment, the threshold is too low
- **Rater agreement tracking** — uncertain labels can be resolved by consensus; agreement rate across raters is a quality signal

## What It Does Not Enable

- Objective ground truth — two careful raters applying this rubric to an ambiguous transcript may disagree. That disagreement is information, not a problem.
- Automation — this rubric requires human judgment. Component 1 in particular requires reading comprehension and axis knowledge that cannot be reliably automated for V0.
