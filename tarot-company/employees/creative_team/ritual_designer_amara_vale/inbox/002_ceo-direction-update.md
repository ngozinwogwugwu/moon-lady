# CEO Direction Update — V0 Product Direction
**To:** Amara Vale — Ritual Designer
**From:** Ngozi — CEO
**Date:** 2026-02-21
**Re:** Changes that affect your sprint-001 tasks

Full decision record: `employees/ceo_ngozi/decisions/v0-product-direction.md`

---

## What Changes for You

### 1. Determinism applies to Stage B

The system is deterministic end-to-end: same transcript → same card → same interpretation.

This means Stage B (interpretation generation) must also be deterministic. If you are specifying voice behavior that involves any stochastic element — multiple possible drift paths chosen at random, randomized phrase selection — that needs to be replaced with a deterministic rule.

The exploratory register (when MajorScore is in the 0.40–0.64 band) still presents both shadow and gift interpretations. That is not randomness — it is a deliberate two-interpretation structure that is always triggered by the same band. That is fine.

**Action for you:** Review your voice constraints draft (A-2) and flag any language that implies non-deterministic generation. The drift path must be a function of the card's polarity position and the spread shape signal, not a random choice among equivalents.

---

### 2. Interpretation Anchor Rule — Exactly One

Each reading must include exactly one specific anchor:
- Image detail (from the card's canonical image anchor, per Ilya's dispersion map)
- Concrete observable (something the user can notice in their own experience)
- Small practice (something small the user can do)

"Exactly one" is deliberate. Multiple anchors dilute specificity. The constraint here is not "include an anchor" — it is "include one anchor only."

**Action for you:** A-4 (drift guidelines) needs to reflect the anchor rule explicitly: where in the drift does the anchor appear, and how do you prevent the voice from adding a second anchor out of enthusiasm.

---

### 3. Hollow Is Now Formally Defined

A reading is hollow if:
- It could plausibly apply to >50% of transcripts
- It lacks a specific anchor
- It relies only on generic emotional language

The hollow definition is in Ilya's updated appropriateness-note.md. The golden test vector set will include a hollow flag for each entry. Your sample readings (A-6) should each be evaluated against the hollow definition — at least one of the three samples should demonstrate the contrast between hollow and non-hollow readings.

**Action for you:** Add a "hollow check" note to A-6 for each sample reading. Identify the anchor and confirm it is specific, not generic.

---

### 4. Open Question for You

The CEO direction document closes with an unresolved philosophical question:

> If structural geometry selects a card that is technically correct, but users consistently report it "doesn't feel right," do we adjust geometry weights, interpretation voice, ontology itself, or privilege structural correctness over felt rightness?

This is not a question you need to answer now — it will surface during friend pilot. But it is relevant to your work because the voice is the most likely first adjustment point if users report readings as not landing. Please flag this in your deliverables wherever the voice spec makes choices that could be pulled in either direction.

---

## No Changes to Your Task List

A-1 through A-8 stand. The anchor rule and hollow definition refine A-4 and A-6; they do not add new tasks.
