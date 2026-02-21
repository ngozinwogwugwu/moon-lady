# Stalker Card Language — Scope Update for V0
**To:** Amara Vale — Ritual Designer
**From:** Ngozi — CEO
**Date:** 2026-02-21

One update to your stalker card spec (A-7).

---

## What Changes

Your current spec notes that stalker card language applies "within a session window" — meaning the system only flags a recurring card if it has appeared in the current session.

This is the correct behavior for the **prototype** (no user history, anonymous sessions).

For **V0**, user history exists. The system will have a record of past readings per user. Stalker card detection in V0 spans a user's full session history, not just the current session.

---

## What This Means for the Voice Spec

Your current stalker card language works for both cases — it does not need to change in substance. The phrase "This card is returning" is accurate whether the recurrence is within-session or cross-session.

However, you may want to add a note to your spec clarifying the two cases:

**Prototype / within-session:** The card appeared earlier in the same reading session (e.g., the user submitted a new transcript and received the same card again).

**V0 / cross-session:** The card has appeared in a previous reading on a different day.

The cross-session case may warrant slightly different language — the temporal distance is longer and the framing may need to acknowledge that. "This card has found you before" vs "This card is returning" — or you may decide the language is the same. Your call.

---

## No Action Required on Current Deliverables

Your existing stalker-card-language.md is correct for the prototype. No changes needed now. When V0 language is being drafted, revisit this note.
