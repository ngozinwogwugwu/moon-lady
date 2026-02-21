# Stalker Card Language
**Owner:** Amara Vale — Ritual Designer
**Sprint:** 001 / Task A-8
**Status:** Complete
**Depends on:** A-2, A-6 (sample-readings.md)
**Feeds:** UX Product Designer, interpreter spec lock

---

## What a Stalker Card Is

A stalker card is a card that appears in the Present position across multiple readings within a session window — without the system having longitudinal user history to confirm it as a genuine recurring pattern.

In V0, the system retains no long-term card history per user. The stalker card condition is detectable only within a session window (the current device session, or within the same calendar period if session continuity is implemented). It is not a feature of the archive — it is a feature of the immediate return.

A card "stalks" when it appears in the same position (Present) more than once. Other positions (Past, Future) repeating is noted but does not trigger stalker card language.

---

## Why It Needs Special Language

When the same card appears twice in a user's Present position, two things are true simultaneously:

1. It could be chance. The similarity ranking is deterministic, and the same transcript content mapping onto the same card is geometrically correct.
2. It might be a genuine signal — the user's state has not shifted, or the theme the card represents is persistent.

The voice cannot know which. It does not have enough data. The stalker card language must hold both possibilities without asserting either — and without dismissing the recurrence as meaningless.

The language must also avoid:
- Creating a false sense of longitudinal pattern (the system doesn't have one)
- Over-interpreting coincidence
- Under-interpreting a potentially real signal
- Sounding technical ("this card was selected again because...")

---

## The Core Phrase

> This card is returning. Sometimes that's just chance; sometimes it's a theme you're ready to meet again.

This is the baseline stalker card acknowledgment. It goes at the beginning of the Present card's interpretation, before the anchor is named.

**Structure:**
1. Stalker card acknowledgment (above phrase)
2. Anchor (named plainly, as always)
3. Full drift (same as any other reading)

---

## Extended Language — First vs. Second Recurrence

### First recurrence (card appearing for the second time in the Present position)

> This card is returning. Sometimes that's just chance; sometimes it's a theme you're ready to meet again.

Then proceed with the anchor and full drift. No additional commentary on the recurrence within the interpretation itself.

The closing question should reflect the recurrence lightly — not by naming it again, but by being a question that could only be asked of someone who has been here before:

*Compliant example:*
> "You've been here before, in this territory. What has stayed the same about it?"

*Prohibited:*
> "Since this card has appeared twice, it must be important."

---

### Second recurrence (card appearing for the third time in the Present position within the same window)

> This card is returning again. It has appeared in this position before, and it's here again now. We don't have enough history to know what that means about your patterns — but within this session, this card keeps finding you.

Then:
> The anchor for [card name] is [anchor text].

Proceed with drift. The closing question should be more explicitly held open:

> "What does it mean that this card keeps returning? That's a question the reading can't answer — but you might be able to."

**Notes:**
- "We don't have enough history" is honest — V0 has no longitudinal archive.
- "This card keeps finding you" is poetic but not mystical — it's geometrically true. The transcript similarity keeps mapping to the same region of polarity space.
- The second recurrence language is slower, more weighted. More silence at the close.

---

## What Stalker Card Language Does Not Do

### Diagnose recurrence as pathology
"This card keeps appearing because you are avoiding something" — prohibited. The system does not make diagnostic claims about why a card recurs.

### Promise resolution
"Keep sitting with this card and it will eventually shift" — prohibited. The system does not promise that recurrence is temporary.

### Dismiss it as pure chance
"This is probably just coincidence" — prohibited. The language acknowledges both possibilities without dismissing either.

### Reference the archive
"In your history with this product, this card has come up before" — prohibited in V0. The system has no longitudinal history in V0.

---

## Positions Other Than Present

If the same card appears in the Past or Future position across readings (but not the Present position), no special language is triggered. Recurrence in those positions is not tracked in V0.

This may change post-V0 if longitudinal data is implemented. The stalker card language above is designed for the Present-position case specifically.

---

## Integration with Sample Readings

Sample 3 in A-6 demonstrates the stalker card language integrated into a full reading. The relevant phrase appears at the beginning of the Present card's interpretation:

> "This card is returning. Sometimes that's just chance; sometimes it's a theme you're ready to meet again."

Followed immediately by the anchor. That is the correct sequence.
