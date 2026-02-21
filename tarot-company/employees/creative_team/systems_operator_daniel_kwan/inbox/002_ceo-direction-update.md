# CEO Direction Update — V0 Product Direction
**To:** Daniel Kwan — Systems Operator
**From:** Ngozi — CEO
**Date:** 2026-02-21
**Re:** Changes that affect your sprint-001 tasks

Full decision record: `employees/ceo_ngozi/decisions/v0-product-direction.md`

---

## What Changes for You

### 1. Determinism Is a Hard Requirement — Design Accordingly

The system is deterministic end-to-end: same transcript → same Stage A output → same card selection → same Stage B interpretation.

This has infrastructure implications that your risk memo (D-1) and fallback scope (D-2) need to address:

**Stage A determinism:**
- If Stage A uses a language model, temperature must be 0 or outputs must be post-processed through a deterministic function.
- Feature extraction and domain detection must be reproducible. Same transcript in, same feature vector out, every time.
- The JSON contract between Stage A and Stage B must be fully deterministic — no fields that vary between calls for the same input.

**Stage B determinism:**
- Same constraint. If Stage B uses a language model for interpretation generation, temperature = 0 or equivalent.
- Interpretation caching may be relevant: if the same card + same spread shape + same MajorScore band is guaranteed to produce the same output, caching Stage B outputs is architecturally sound and reduces cost and latency simultaneously.

**Fallback model determinism:**
- Any fallback model tier (D-2) must also be deterministic. A fallback that introduces stochasticity breaks the determinism guarantee.
- Note this as a constraint in provider evaluation.

**Action for you:** D-1 and D-2 should include an explicit section on how determinism is implemented and maintained across tiers. Flag any AI provider constraints that make determinism difficult.

---

### 2. Scarcity Feature Flag — Session Contract

Scarcity is now a feature flag: `scarcity_mode: strict | relaxed`

- Strict = one reading per day (public default)
- Relaxed = multiple readings allowed (friend testing default)
- Scarcity state must be logged per session for calibration segmentation

**Infrastructure implications:**
- The session contract (Stage A → Stage B JSON) needs a `scarcity_mode` field.
- The session log must include `scarcity_mode` as a segmentation field.
- Enforcement logic (blocking a second reading in strict mode) lives at the session layer, not inside Stage A or Stage B. This is an application-layer concern, but it must be reflected in the session lifecycle spec.

**Action for you:** Flag the `scarcity_mode` field in the JSON contract template your team is preparing. Include it in the telemetry events list in D-1.

---

### 3. Calibration Dashboard — Infrastructure Requirement

The CEO direction makes a calibration dashboard a V0 deliverable for the product team. That dashboard requires:
- Per-session MajorScore band logging
- Hollow flag logging (whether the interpretation was flagged hollow in evaluation)
- Scarcity mode logged per session

These are telemetry events that need to be in the minimal telemetry spec in D-1. They do not require expensive infrastructure — they are structured log lines — but they must be designed in from the start, not retrofitted.

**Action for you:** Add "calibration telemetry events" as a required section in D-1. Include: MajorScore band, hollow flag, scarcity mode, ontology version ID.

---

## No Changes to Your Task Count

D-1 and D-2 stand. The determinism, scarcity flag, and telemetry items add scope to those documents — they do not create new tasks.
