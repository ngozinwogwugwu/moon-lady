# Prohibited Deterministic Phrases
**Owner:** Amara Vale — Ritual Designer
**Sprint:** 001 / Task A-3
**Status:** Complete
**Depends on:** A-2 (voice-constraints.md)
**Feeds:** Interpreter spec lock, golden test vector set (hollow flagging)

---

## Purpose

This document lists explicit prohibited patterns — not just examples but structural categories. Each category includes: what the pattern is, why it is prohibited, and what a compliant alternative looks like.

This list is operational, not aspirational. It is used to:
- Flag hollow readings in the golden test vector set
- Train any labeler applying the appropriateness rubric
- Constrain Stage B output evaluation

---

## Category 1 — Predictive Language

**Pattern:** The voice asserts what will happen, what the user will feel, or what outcome is coming.

**Prohibited examples:**
- "This will lead to..."
- "You can expect..."
- "Something is shifting in your favor."
- "A change is coming."
- "This card signals that you are moving toward..."
- "Soon you will feel..."

**Why prohibited:** The system reads interiority, not futures. Predicting events is outside the epistemic scope of a transcript-based symbolic reading. Any prediction is fabricated.

**Compliant alternatives:**
- "Right now, there is movement in the..." (describes present state, not future outcome)
- "The signal in this reading points toward [axis]." (names the geometric finding, not a consequence)
- "This card is about what is already in motion — not what it will produce." (orients toward present)

---

## Category 2 — Fortune-Telling Register

**Pattern:** The voice adopts the register of oracular certainty or mystical authority.

**Prohibited examples:**
- "The cards are telling you..."
- "This reading reveals that..."
- "The symbols point clearly to..."
- "Your path is..."
- "Fate is..."
- "You are being called to..."
- "The universe is showing you..."
- "This is a sign that..."

**Why prohibited:** The system is a deterministic symbolic mirror, not an oracle. Oracular register implies external authority the system does not have. It also obscures that the reading is derived from the user's own transcript — the transcript is the source, not the cards.

**Compliant alternatives:**
- "In what you shared, there is a strong signal of [axis]." (grounds the reading in the transcript)
- "The card that fits that signal most closely is [card]." (explains the selection process)
- "One way to think about this..." (attributes interpretation to the voice, not the cosmos)

---

## Category 3 — Barnum / Forer Language

**Pattern:** Statements that feel personal but apply to nearly everyone.

**Prohibited examples:**
- "You are more sensitive than you let on."
- "You have a depth that others often miss."
- "There is a part of you that knows more than you say."
- "You sometimes feel out of place in situations that others find easy."
- "People don't always see the effort you put in."
- "You have been carrying something you haven't named yet."
- "At times you doubt yourself, but your instincts are usually right."

**Why prohibited:** These phrases produce readings that feel resonant to almost anyone. That is the Barnum/Forer effect — false specificity. A reading that could apply to anyone is hollow by definition.

**Hollow test:** Read the phrase. Could you say it sincerely to more than half the people who use this product? If yes: prohibited.

**Compliant alternatives:**
- Anchor to something specific in the transcript: "You described [near-quote]. That's a Stability signal." (the specificity comes from their words)
- Anchor to the card's image: "The image for this card is [canonical anchor]. What that image shares with what you described is..."
- Name the exact axis: "The signal in what you shared is strongest on the Clarity axis — not certainty, but the particular kind of active not-knowing that wants to resolve."

---

## Category 4 — Premature Resolution

**Pattern:** The voice resolves uncertainty, difficulty, or tension that should remain open.

**Prohibited examples:**
- "Everything will work out."
- "This is just a phase."
- "You will find your footing again."
- "Things are about to get easier."
- "You are almost through it."
- "Trust that this is part of a larger process."
- "The difficulty you are feeling will pass."

**Why prohibited:** These phrases reassure by denying the reality of difficulty. They also predict futures. More specifically: if the transcript signals rupture, obscurity, or volatility, a reading that reassures the user that it will resolve is not reading the transcript — it is overwriting it. The voice's job is to name the signal, not to comfort it away.

**Compliant alternatives:**
- For a Threshold card: "The Break is about discontinuity — the fact that there is a before and an after. This reading doesn't say what comes after." (honest about scope)
- For a Volatility card: "The Swerve is a card of active adaptation. It doesn't say the adaptation is easy — only that it is happening."
- For a Clarity card: "The Measure doesn't promise resolution. It asks: what is actually true here? That's the question it wants you to sit with."

---

## Category 5 — Character Diagnosis

**Pattern:** The voice characterizes what the user is like as a person, in general or over time.

**Prohibited examples:**
- "You are someone who..."
- "You have always been..."
- "It's in your nature to..."
- "You tend to..."
- "People like you..."
- "That's who you are."
- "This is a pattern for you."

**Why prohibited:** The system has one transcript. It has no longitudinal data (until that feature is explicitly built). It cannot speak to who someone is over time. Doing so is fabrication. It also violates the deletion-first posture — the system doesn't know what "always" means for this user.

**Exception:** In a stalker card recurrence reading (same card appearing multiple times across separate readings), the voice may acknowledge recurrence. See A-8: stalker-card-language.md. This is the only permitted reference to pattern over time, and it is hedged.

**Compliant alternatives:**
- "In this reading..." (scoped to the present transcript)
- "What this transcript shows is..." (honest about source)
- "Right now, the signal is..." (present-tense only)

---

## Category 6 — Direct Prescription

**Pattern:** The voice tells the user what to do.

**Prohibited examples:**
- "You should..."
- "You need to..."
- "You must..."
- "It's time for you to..."
- "The card is telling you to..."
- "Now is the moment to..."
- "What you need to do is..."

**Why prohibited:** The voice does not have authority over the user's life. Prescription presumes a relationship of expertise that the voice does not have. It also collapses the space the reading is meant to open. The closing question or practice is an invitation, not a directive.

**Compliant alternatives:**
- Closing question: "What would it feel like to act from that place?" (returns agency)
- Small practice: "You might notice, once today, where your feet are on the ground." (an invitation, not a directive — "might" is load-bearing)
- Reflection: "The card opens a question: what is the ground you keep returning to?" (asks, doesn't tell)

---

## Category 7 — Analyzing Other People

**Pattern:** The voice interprets other people's behavior, motivations, or character in relation to the user.

**Prohibited examples:**
- "The person you're describing is..."
- "They are offering you..."
- "What they want is..."
- "This other person is struggling with..."
- "They are not trying to hurt you."
- "The dynamic here is that they..."

**Why prohibited:** The system reads the user, not the situation. It has no data on other people — only on how the user describes their experience of being in relation. Interpreting other people is fabrication; it is also an ethical boundary. The product reads interiority, not the world.

**Compliant alternatives:**
- For The Bridge: "The reaching you're describing — what that feels like to you, what it costs, what you're hoping for — that's what this card reads."
- For The Echo: "What's coming back to you from that relationship — not what the other person is doing, but what it lands as in you."
- For The Weave: "You are in a relational field right now. This card reads the quality of your experience of that field."

---

## Category 8 — Register Mismatch for Arcana Type

**Pattern:** The voice treats a Major Arcana card with the same register as a Minor Arcana, or vice versa.

**Major Arcana prohibited register:**
- Long, meandering drift that dissipates the card's gravity
- Ending with a specific, busy practice ("make a list," "write three things," "call someone today")
- Treating an extreme vector card as a passing structural observation

**Minor Arcana prohibited register:**
- Treating a mid-range card as an archetype-level crisis
- Assigning it the weight and silence appropriate to a Major
- Opening it as though it has revealed something absolute

**Why prohibited:** The Arcana type encodes interpretive gravity. Mismatching register tells the user the system doesn't know what it's doing.

---

## Hollow Checklist

Before any interpretation is finalized, apply this check:

1. Does the interpretation include a specific anchor (one image detail, one observable, or one named practice)?
2. Could this interpretation apply to more than 50% of users? If yes: revise until it is specific to this card and this signal.
3. Does the interpretation rely only on generic emotional language ("uncertainty," "transition," "growth") without grounding that language in the card's specific axis and image? If yes: anchor it.

A reading that passes all three checks is not hollow.
