# V0 Product Direction — Decision Record
**Owner:** Ngozi — CEO
**Date:** 2026-02-21
**Status:** Issued — effective immediately
**Informs:** All sprint-001 tasks, handoff gate, calibration workflow

---

## 1. Calibration Is the Primary V0 Quality Bar

Card selections must feel structurally appropriate and defensible from day one.

Cost, latency, UX polish, and semantic drift detection are secondary.

V0 optimizes for:
- Right-feeling card selection
- Deterministic consistency
- Evaluability

---

## 2. The System Is Deterministic

Same transcript → same card → same interpretation.

Applies to:
- Stage A (feature extraction)
- Card selection logic
- Stage B (interpretation generation)

No randomness. No temperature drift. No stochastic tie-breaking.

If two users submit the same transcript, they receive the same result. Pattern recognition is intentional.

**Implementation note:** This applies to domain detection, MajorScore computation, weighting, and ranking. All stages must be seeded or otherwise made reproducible. The determinism requirement must appear in every spec that touches the pipeline.

---

## 3. Light Normalization Only

Before feature extraction:

- Trim whitespace
- Normalize casing
- Collapse repeated spaces
- Normalize line breaks

Do NOT:
- Rephrase
- Lemmatize
- Correct grammar
- Alter semantics

We normalize formatting, not meaning.

---

## 4. Scarcity Is Feature-Flagged

`scarcity_mode: strict | relaxed`

- **Strict:** one reading per day (public default)
- **Relaxed:** multiple readings allowed (friend testing default)

Scarcity state is logged per session for calibration segmentation. This is a flag in the session contract, not a wall in the UX. The ritual meaning of scarcity is preserved in the voice layer regardless of mode.

---

## 5. Deletion-First Data Posture

Delete until forced to keep.

Deleted after purpose served:
- Raw transcripts (used for feature extraction, then pruned)

Stored long-term:
- Spread (card selection)
- Interpretation
- Summary
- Ontology version ID
- Calibration metadata

Raw emotional voice data does not persist.

---

## 6. MajorScore Is a Prior, Not Calibrated

For V0:
- We choose a defensible threshold (Ilya's proposal: 0.65 commit, 0.40 exploratory).
- We log all outcomes.
- Calibration is iterative post-launch.

We do not pretend it is statistically calibrated before we have labeled data.

---

## 7. Golden Test Vector Sprint — 100 Transcripts

Dataset composition:
- 40 clear polarity cases
- 30 ambiguous cases
- 15 edge/noise cases
- 15 adversarial/overlap cases

Each transcript includes:
- Deterministic selected card
- Second-best card
- Margin score
- Structural justification
- Ritual plausibility rating (1–5)
- Hollow flag (true/false, with note if true)

This dataset becomes: calibration baseline, regression suite, future fine-tuning corpus.

---

## 8. Hollow Is Operationalized

A reading is hollow if:
- It could plausibly apply to >50% of transcripts, OR
- It lacks a specific anchor (image detail, observable, or practice), OR
- It relies only on generic emotional language.

Drift must include one anchor. The hollow flag in the golden test vector set operationalizes this definition.

---

## 9. Interpretation Anchor Rule

Each reading must include exactly one specific anchor:
- Image detail (from the card's canonical image)
- Concrete observable (something the user can notice)
- Small practice (something the user can do)

This prevents Barnum collapse. "Exactly one" is deliberate — multiple anchors dilute specificity.

---

## 10. User Feedback on Card Selection — Resolved 2026-02-21

If structural geometry selects a card that is technically correct, but users consistently report it "doesn't feel right":

**Decision:** Collect the signal, store it, find patterns later. Do not act on individual feedback in real time.

See `user-feedback-storage.md` for the full decision record, data model, and telemetry event spec.

---

## What Is Explicitly Tolerated in V0

- Higher per-session cost
- Slower latency
- Smaller UX polish surface
- Incomplete semantic drift detection
- Limited provider fallback sophistication (initially)

Calibration and appropriateness take priority over all of the above.

---

## Distribution

This decision record is the authoritative source. All four sprint-001 owners have received a version of these decisions in their inboxes. Any conflict between this record and an earlier working document: this record wins.
