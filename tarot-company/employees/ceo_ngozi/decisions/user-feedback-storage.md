# User Feedback Storage — "Doesn't Feel Right" — Decision Record
**Owner:** Ngozi — CEO
**Date:** 2026-02-21
**Status:** Issued — closes philosophical fork from v0-product-direction.md §10
**Informs:** Petra Voss (systems architect), ML product lead, data & privacy lead

---

## The Decision

When users indicate that a card selection **doesn't feel right**, the system stores that signal. It is batched over time and used to find patterns. This data is a long-term calibration input.

This closes the philosophical fork raised in v0-product-direction.md §10, which deferred the question. The answer is: collect the signal, don't act on it immediately.

---

## What "Doesn't Feel Right" Means

Users will have some way — TBD by UX — to signal that a card selection feels wrong to them. Not wrong in a metaphysical sense; wrong in the sense that it doesn't resonate, doesn't connect to their situation, or feels like a mismatch.

This is distinct from:
- A reading being "hollow" (evaluator-assessed, not user-reported)
- A user not liking the interpretation text (voice/drift issue)
- A user wanting a different card (preference, not mismatch)

The signal we want: the card itself, not the text, felt structurally wrong.

---

## What We Store

Per feedback event:
- `session_id` — links to the full session record
- `card_id` and `card_orientation` per flagged card (which card felt wrong)
- `position` (past/present/future)
- `matchscore_band` at time of feedback
- `timestamp`
- `ontology_version_id`

We do NOT store:
- Free-text user explanation (too noisy, creates new data burden)
- The transcript (already governed by existing data posture rules)

---

## What We Do With It

Nothing immediately. This is a pattern-finding dataset, not a real-time signal.

Post-V0, after sufficient volume:
- Batch the feedback by card, domain bucket, axis, and MatchScore band
- Look for systematic patterns (e.g., the Tower in reversed orientation consistently flagged in Foundation domain)
- Use patterns to inform ontology revision proposals (Ilya) and threshold recalibration (ML product lead)

The feedback never directly changes card selection. It informs human review of the ontology.

---

## What This Requires from Infrastructure

A new telemetry event:

```json
{
  "event": "user.card_feedback",
  "session_id": "...",
  "user_id_hash": "...",
  "timestamp": "...",
  "feedback_type": "doesnt_feel_right",
  "cards_flagged": [
    {
      "position": "past | present | future",
      "card_id": "...",
      "card_orientation": "upright | reversed",
      "matchscore_band": "..."
    }
  ],
  "ontology_version_id": "..."
}
```

This event is additive to the existing telemetry event set. It does not change existing events.

---

## Timing

This feature is a V0 requirement, not a prototype requirement. The prototype does not need a feedback mechanism. V0 ships with a minimal "this doesn't feel right" affordance in the UX and the telemetry event above.
