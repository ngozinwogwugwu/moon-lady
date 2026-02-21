# MajorScore Threshold Proposal
**Owner:** Ilya Moreau — Symbol Architect
**Sprint:** 001 / Task I-4
**Status:** Complete
**Feeds:** ML Product Lead (calibration workflow)

---

## What MajorScore Measures

MajorScore is Stage A's confidence that a selected card's polarity position genuinely corresponds to a dominant signal in the user's transcript. It is not a measure of how "meaningful" a reading is — it is a measure of how clearly the transcript maps onto the selected card's region of polarity space.

A high MajorScore means: the transcript has a clear, consistent signal that points toward this card's primary axis and pole. A low MajorScore means: the signal is weak, mixed, or ambiguous — the card is the best match but not a strong one.

---

## Proposed Three-Band Model

| Band | Score range | System behavior | Voice behavior |
|---|---|---|---|
| **Commit** | 0.65 – 1.00 | Card selection proceeds. Output: `status: "ok"` | Standard register. Voice interprets card with full drift. |
| **Exploratory** | 0.40 – 0.64 | Card selection proceeds. Output: `status: "ok"` with `confidence: "low"` flag | Exploratory register. Voice offers two interpretations (shadow/gift) without asserting either. Closing question is more open. |
| **Abstain** | 0.00 – 0.39 | Card selection does not proceed. Output: `status: "needs_more_input"` | Voice receives no card. Fallback language is Amara's territory. |

---

## Rationale for 0.65 Commit Threshold

The 0.65 value is a prior, not a calibrated parameter. It is chosen for the following reasons:

**Why not higher (e.g., 0.80):** A high commit threshold would cause the system to abstain too often, especially in V0 where transcripts may be short or meandering. The cost of under-reading is high — users experience the product as broken, not honest.

**Why not lower (e.g., 0.50):** A commit threshold below 0.60 means the system frequently presents confident card selections for transcripts with no clear polarity signal. That produces hollow readings, which is the failure mode Amara identified as most damaging.

**0.65 as a reasonable prior:** At this threshold, the system commits when Stage A has found at least one clearly dominant axis signal in the transcript. It is not requiring certainty — it is requiring signal.

---

## Rationale for 0.40 Exploratory Band

The 0.40–0.64 band exists because abstaining entirely from a low-confidence selection is not always the right response. If the transcript has some signal but not a strong one, a reading that explicitly holds two possibilities open is more honest than silence.

The exploratory band is operationalized through the voice, not through the card selection. The same card is selected; the voice changes its posture. This keeps the system's behavior legible to the user without exposing the score.

---

## Per-Spread Threshold Logic

For a three-card spread, threshold is applied per card, not per spread.

- A spread with three Commit-band cards: standard reading.
- A spread with one or more Exploratory-band cards: the exploratory register applies to those cards. The spread_shape signal still applies across all three.
- A spread where any card falls in the Abstain band: the entire reading does not proceed. A single weak card is enough to invalidate the spread — partial readings are not supported in V0.

---

## Determinism Constraint

**Added per CEO direction (2026-02-21).**

MajorScore computation must be deterministic. Same transcript → same MajorScore → same band assignment → same behavioral output.

This means:
- Stage A feature extraction must be deterministic (no stochastic sampling, no randomized tie-breaking).
- If Stage A uses a language model, temperature must be set to 0 or the output must be post-processed through a deterministic function.
- Band thresholds (0.65, 0.40) are fixed values, not sampled. No jitter, no random perturbation.

Calibration iteration changes the threshold values between sprints; it does not introduce randomness within a sprint. Once thresholds are set, the system is fully deterministic.

---

## V0 Honest Disclaimer

**This threshold is a prior.** It has not been validated against labeled data because that labeled dataset does not yet exist. See I-6 (appropriateness-note.md) for the rubric structure that will enable calibration.

The threshold should be treated as a starting estimate to be revised after the first evaluation sprint. The calibration plan:

1. Build labeled evaluation set using the rubric in appropriateness-note.md.
2. Plot reliability diagram: for readings scored in each band, what fraction do human raters judge as appropriate?
3. If the 0.65 threshold produces systematic mismatch (e.g., Commit-band readings frequently rated as hollow), adjust upward. If Exploratory-band readings are frequently rated as appropriate, lower the Commit threshold.
4. Target operating point for V0 live testing: ≥70% of Commit-band readings rated appropriate by raters using the rubric.

---

## What Changes Post-V0

Once the evaluation set exists and calibration is run:
- The threshold values become evidence-based rather than stipulated.
- The Exploratory band may be narrowed or widened depending on whether low-confidence readings are useful.
- Per-bucket threshold modifiers may be introduced (e.g., Threshold-bucket cards may warrant a lower commit threshold because ambiguity is constitutive of that domain).
