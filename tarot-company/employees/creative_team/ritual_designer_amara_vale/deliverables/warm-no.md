# The Warm No
**Owner:** Amara Vale — Ritual Designer
**Sprint:** 001 / Task A-7
**Status:** Complete
**Depends on:** A-2, scarcity_mode CEO direction 2026-02-21
**Feeds:** UX Product Designer, interpreter spec lock

---

## What the Warm No Is

The warm no is the response the system gives when it cannot or will not proceed with a reading. It is not a refusal. It is not an error. It is a ritual acknowledgment that this reading is not available right now — and that the ritual has a reason for that.

The warm no must:
- Be short. Shorter than a reading. Much shorter.
- Name the reason without being procedural or cold.
- Return the user without dismissing them.
- Hold the quality of the product's voice — contemplative, not corporate.

The warm no must not:
- Apologize.
- Explain the technical reason (scarcity mode, low MajorScore, etc.).
- Promise when the next reading will be available.
- Be phrased as an error or a wall.

---

## Warm No Types

### Type 1 — Scarcity (one reading per day, strict mode)

The user has already completed a reading today and attempts another.

**Exact language:**

> Today's reading is still with you. Come back tomorrow.

That's the full response. Nothing more.

**Notes:**
- "Still with you" acknowledges that the reading they received has not been spent. The scarcity is not arbitrary deprivation — it is an invitation to stay with what was already given.
- No timestamp, no next-available time, no countdown. The ritual does not run on a clock. "Tomorrow" is enough.
- No apology. No "unfortunately" or "we're sorry."

**UX note for the product team:** The warm no is not a modal or an error banner. It is a text response in the same interface where readings appear. Same font, same weight, same quiet. A scarcity wall that looks like an error is wrong.

---

### Type 2 — Abstain (reading did not reach threshold)

Stage A returned `status: needs_more_input` — MajorScore below 0.40 on at least one card, or the transcript did not produce sufficient signal for a complete spread.

**Exact language:**

> What you shared doesn't have a clear enough signal for a reading today. That's not a failure — sometimes what we carry isn't ready to be read yet. You can share more, or come back when something feels more present.

**Notes:**
- "Doesn't have a clear enough signal" describes the geometric finding without explaining the mechanism.
- "Not a failure" addresses the likely user response: feeling like they did the prompt wrong.
- "Sometimes what we carry isn't ready to be read" frames low signal as a legitimate state, not a technical failure. This is aligned with the ritual design: not every state maps onto a card.
- "Share more" is the first option — it invites the user to try again in the same session with more text. "Come back when something feels more present" is the second option — it closes the session gracefully.
- No diagnosis. The voice does not tell the user what they were missing.

**Technical note for the product team:** When Stage A returns `needs_more_input`, the system should present the Abstain warm no and allow the user to either extend their transcript or end the session. If they extend and resubmit, the full pipeline runs again from the beginning with the extended input. There is no "partial" state saved.

---

### Type 3 — Incomplete Spread (partial selection failure)

In a three-card spread, if any single card falls in the Abstain band, the full reading does not proceed. This produces an incomplete spread that must be handled gracefully.

**Exact language:**

> This spread didn't come together — one of the three cards didn't find its signal in what you shared. A partial reading isn't a reading. Come back and try again, or share something different.

**Notes:**
- "Didn't come together" frames the failure at the spread level, not the card level.
- "A partial reading isn't a reading" states the design decision plainly — V0 does not support partial spreads.
- "Come back and try again" is open — no deadline, no instruction.

---

## What the Warm No Is Not Responsible For

### Technical errors (system failure)
If the reading failed due to a technical error — network, API, model failure — that is not a warm no situation. That is an error state. The product team and infrastructure lead own that language. The warm no is for ritual refusals, not system failures.

### Future scarcity states
The warm no does not explain future access. It does not say "you can try again in X hours." The ritual does not have a timer.

---

## Tone Reference

The warm no is in the same register as the readings: contemplative, precise, not warm in the commercial sense. It does not add extra warmth to compensate for saying no. The ritual acknowledges limits without apologizing for them.

The shortest version (Type 1) is the model: *Today's reading is still with you. Come back tomorrow.* That sentence does everything. It acknowledges the completed reading, names the posture ("still with you"), and gestures to return without demanding it.

All three warm no variants should feel like they came from the same voice as the readings.
