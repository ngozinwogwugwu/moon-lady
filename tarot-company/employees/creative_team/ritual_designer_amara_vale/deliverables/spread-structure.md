# Spread Structure — P/P/F and Escalation Path
**Owner:** Amara Vale — Ritual Designer
**Sprint:** 001 / Task A-5
**Status:** Complete
**Depends on:** A-2, A-4, cross-session I-1/A-1
**Feeds:** UX Product Designer, sample spreads validation

---

## V0 Entry Frame: Past / Present / Future

The three-card spread assigns each selected card to one of three temporal positions:
- **Past:** What has been — the ground of what is now.
- **Present:** What is — the current state, active signal.
- **Future:** What is emerging — the direction in motion.

These are not literal time periods. Past does not mean "a year ago." Present does not mean "this morning." Future does not mean "next month." They are structural orientations within a reading — how this card relates to the current moment.

The geometry selects the cards in ranked order by similarity score. Position assignment is deterministic:
- Highest similarity score → Present
- Second highest → either Past or Future (determined by the axis direction of the card relative to the spread's polarity flow; see selector spec for assignment logic)
- Third highest → the remaining position

The user does not select positions. The geometry assigns them.

---

## What Each Position Does in the Interpretation

### Past
The Past card reads what is already established in the user's experience — what they have come from, what is behind the current moment. It is not a story of what happened. It is the polarity state that preceded what the Present card is showing.

The voice for Past:
- Uses past-leaning language: "what has been solid," "what you've been in," "the ground that formed"
- Does not speculate about specific past events
- Grounds the Present card — the Past card explains why the Present card is the reading's center

### Present
The Present card is the reading's anchor. It carries the strongest similarity signal to the transcript — it is what the transcript is most clearly showing.

The voice for Present:
- Uses present-tense language: "what is," "what you are in," "the current signal"
- Interprets with the most weight — this card speaks most directly to what the user brought
- In a Coherent spread, names the theme here: "All three cards are in this territory. The Present card is its clearest expression."

### Future
The Future card reads what is in motion — not what will happen, but what is already beginning to emerge from the present state. It is the polarity direction the current signal is moving toward.

The voice for Future:
- Uses emergent language: "what is beginning to form," "the direction of this signal," "what wants to move next"
- Never predicts: "this will become" is prohibited. "There is already movement toward" is permitted.
- Closes with the spread's closing question or practice — the Future card's closing grounds the reading's ending.

---

## Reading Sequence and Voice Structure

A full P/P/F reading has this structure:

1. **Spread-level opening** (1–2 sentences)
   Names the spread shape (Coherent or Tensioned) and the territory or tension. No card names yet.

2. **Past card interpretation** (full drift per A-4)

3. **Brief transition** (1 sentence, optional)
   Bridges Past → Present. Not required for all spreads. Used when the axis relationship between Past and Present needs naming.

4. **Present card interpretation** (full drift per A-4, with most weight)

5. **Brief transition** (1 sentence, optional)
   Bridges Present → Future. Used when the direction of movement benefits from explicit framing.

6. **Future card interpretation** (full drift per A-4, closes with spread's closing question/practice)

Total: typically 25–45 sentences for a full three-card spread. Not a word count target — a calibration reference.

---

## Escalation Path — Beyond P/P/F

The P/P/F frame is V0's only reading frame. The escalation path below defines what would trigger moving to more complex frames in post-V0. No complex frames are built in V0.

### Triggers for escalation (post-V0 only)

**1. Recurrent card pattern**
If the same card appears in the Present position across multiple readings within a defined window (see A-8), the reading may shift from P/P/F to a single-card deep reading focused on the recurring card. This is a depth frame, not a spread frame. Not in V0.

**2. User-initiated focus request**
If a future interface allows users to specify which of the three P/P/F positions they want to go deeper on, a single-card extended reading for that position is the escalation. Not in V0.

**3. Consistent Tensioned spread**
If a user's readings consistently show tensioned spreads (at least two of three readings in a window are tensioned), a future "tension map" frame could name the axes in ongoing tension. This requires longitudinal data. Not in V0.

**4. Advanced frames (named for awareness, not for building)**
Post-V0 frames that may be developed:
- **Threshold frame:** A single-card reading for liminal states (The Break, The Veil, The Crossing dominant). More silence, less drift, extended closing practice.
- **Relational frame:** A spread oriented toward the relational field — interpreting the user's experience of connection and separation, not just interiority.
- **Deep reading frame:** One card, extended drift, longer session. For users who have been with the product long enough to need more than the P/P/F entry.

None of these are built in V0. They are named here so the architecture knows where it is going.

---

## What P/P/F Assumes

- The user is entering without much context — they have shared a transcript and received a reading.
- The P/P/F frame is self-contained and needs no explanation.
- The user does not need to understand how the positions were assigned. They receive a reading, not a methodology.

---

## Edge Cases

### Transcript does not clearly map to a temporal moment
This is the most common edge case. The user may describe a state that is neither clearly past, present, nor future — it is simply how things are. In this case, the geometry's position assignment still applies; the voice does not comment on or explain the temporal assignment. The reading proceeds.

### Abstain (no card selected for a position)
If any card falls in the Abstain band, the full reading does not proceed. A three-card spread with one missing position is not a reading — it is a partial artifact. See A-7 (warm-no.md) for how to handle this case.

### Spread with a Major Arcana
If a Major appears in any position, it takes interpretive precedence across the spread. If the Major is in the Past position, its axis gravity still shapes the Present and Future interpretations. If the Major is in the Future position, the Present and Past cards should drift toward the Major's axis in anticipation of it. See A-4 (drift-guidelines.md).
