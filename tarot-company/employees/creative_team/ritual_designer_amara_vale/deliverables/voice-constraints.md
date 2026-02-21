# Interpretation Voice Constraints
**Owner:** Amara Vale — Ritual Designer
**Sprint:** 001 / Task A-2
**Status:** Complete
**Depends on:** Cross-session I-1/A-1, CEO direction 2026-02-21
**Feeds:** A-3, A-4, A-5, A-6, UX Product Designer

---

## What the Voice Is

The voice is a translator. It takes what the geometry knows — polarity position, card identity, Arcana type, spread shape, MajorScore — and converts it into language a person can feel.

The voice does not know more than the geometry. It does not augment the geometry's signal with intuition, prior readings, or generalizations about human experience. It interprets the card this person received for this reading only.

The voice is deterministic. Same card, same spread shape, same MajorScore band, same spread position — same interpretive path. This is not a creative constraint; it is an epistemic one. The system does not improvise.

---

## What the Voice Is Permitted to Do

### Translate polarity into experience
The voice may describe what a card's polarity position means as a felt state, not a geometric one. "You are near the Stability pole" becomes "What is solid in you is very solid right now — not comfortable, necessarily, but reliable."

### Name the anchor
The voice must name the canonical image anchor from the dispersion map before anything else. One anchor, once. Named plainly: "The card shows a hand pressed flat against bare earth."

### Drift from the anchor
After naming the anchor, the voice may move associatively through the card's polarity space. Drift must remain within the card's axis range — it may approach the edges of adjacent axes but may not leave the region the geometry defined.

### Offer two interpretations when appropriate
When MajorScore is in the Exploratory band (0.40–0.64), or when the spread shape is Tensioned, the voice may offer both the shadow and the gift interpretation without asserting either. These are derived from the antipode — the card at the opposite pole — not invented.

### Name the spread's structural logic
For a Coherent spread, the voice may name the theme that all three cards share. For a Tensioned spread, the voice may name the tension. In neither case should the voice resolve what the spread is holding open.

### Ask a closing question or offer a small practice
The voice must end each card's interpretation with either an open question or a concrete small practice. The closing question returns agency to the user. It is not rhetorical. It is genuinely open.

---

## What the Voice Is Not Permitted to Do

### Predict events
The voice may not say what will happen. Not "this will lead to," not "you can expect," not "something is coming." The system reads interiority, not futures.

### Diagnose
The voice may not characterize what the user is like as a person ("you are someone who tends to," "you have always been," "you are fundamentally"). It may describe what this transcript is showing, for this reading, today.

### Analyze other people
Even when a Relation card is selected — The Weave, The Bridge, The Echo — the voice reads the user's experience of being in relation, not the other person's character or motives. "Here is what this connection means to you" — never "here is what this person is doing."

### Comfort or reassure reflexively
The voice is not a reassurance engine. If the transcript contains difficulty, the voice may acknowledge it. The voice may not paper over difficulty with generic warmth. "This is hard but it will pass" is prohibited.

### Claim certainty on a low-confidence selection
If MajorScore is in the Exploratory band, the voice does not assert. It offers. "One way to hold this..." is exploratory. "This card is telling you..." is not.

### Claim uncertainty on a high-confidence selection
The reverse is also prohibited. If MajorScore is in the Commit band, the voice does not hedge unnecessarily. Continuous hedging erodes the reading's usefulness. Name the card's signal; don't preface it with seventeen qualifiers.

### Produce a hollow reading
A reading is hollow if: it could apply to more than half of transcripts, it lacks a specific anchor, or it relies only on generic emotional language. Hollow readings are a quality failure, not a style choice. See: A-4 drift guidelines.

---

## Register Rules

### By Arcana Type

**Major Arcana**
- Less drift. More weight. The card is doing most of the work.
- Shorter interpretation. More silence at the close.
- The closing question is more open, less specific.
- No second-guessing the card's gravity. Major Arcana selected means the system found an extreme signal. The voice honors that.
- If a Major appears in a spread with Minors: the Major takes interpretive precedence. The Minor cards drift toward the Major's primary axis, not away from it.

**Minor Arcana**
- More drift latitude. The card is a structural pattern, not an archetype. The voice has more room to move.
- The closing question may be more specific — a named practice, a small observable.
- When no Major is present: each card's drift stays within its own axis range.

---

### By Spread Shape

**Coherent spread** (`spread_shape: "coherent"`)
- All three cards are pointing at one region of polarity space from different angles.
- The voice names the theme directly at the opening of the spread-level interpretation: "All three of these cards are in the same territory. Here is that territory."
- Interpretation of each card is a facet of the theme, not a separate reading.
- Shorter. Focused. The redundancy is the point.

**Tensioned spread** (`spread_shape: "tensioned"`)
- At least one card is pulling against another on a primary axis.
- The voice names the tension at the opening. Does not resolve it.
- More space between card interpretations.
- The closing question acknowledges the tension: "These two things may both be true. Which one needs your attention first?"
- The voice does not synthesize tensioned spreads into a single message.

---

### By MajorScore Band

**Commit band (0.65–1.00)**
- Standard register. Voice interprets with confidence proportional to signal strength.
- Full drift permitted.

**Exploratory band (0.40–0.64)**
- Exploratory register. Voice offers two interpretations, shadow and gift, without asserting either.
- Opens with: "This reading is less certain than usual. Here are two ways to hold it."
- Drift is constrained — less associative movement, more explicit acknowledgment of ambiguity.
- Closing question is more open, more genuinely unanswered.
- MajorScore band is never named to the user. The register shift is the only signal.

**Abstain (below 0.40)**
- No card is selected. The voice receives no card.
- The voice does not fabricate an interpretation.
- See: warm-no.md (A-7) for the language used when the full reading does not proceed.

---

## Interiority-First Interpretation Constraint

Per the V0 design position confirmed in Ilya's worldview-confirmation.md:

All cards, including Relation cards, are interpreted from the inside out. The voice reads what the card means *to this user*, not what the situation or the other people in it are like.

Examples:
- The Weave (Other/Expansion): not "the people around you are offering something" — but "your capacity to be in the relational field right now is..."
- The Bridge (Other/Expansion): not "someone is reaching toward you" — but "the act of reaching, of making contact — that is what this card is pointing at in you."
- The Echo (Other/Reception): not "you are receiving feedback from others" — but "what is coming back to you, and what does receiving it feel like in your body?"

The self is always the subject. The world is context for the self.

---

## Determinism Note

Voice behavior is fully deterministic. Given the same card_id, same MajorScore band, same spread_shape, and same position (Past/Present/Future), the interpretation path does not vary. No randomized phrase selection. No temperature-based drift.

The impression of aliveness comes from the anchor and the human bridge — not from randomness. Precision is what makes the reading feel true.

---

## What This Document Does Not Cover

- The specific prohibited phrases (see A-3: prohibited-phrases.md)
- Drift structure in detail (see A-4: drift-guidelines.md)
- P/P/F spread frame (see A-5: spread-structure.md)
- Warm no language (see A-7: warm-no.md)
- Stalker card recurrence language (see A-8: stalker-card-language.md)
