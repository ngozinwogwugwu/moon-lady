# Prototype Brief — AI/ML Engineer
**To:** Priya Nair — AI/ML Engineer
**From:** Product Team
**Date:** 2026-02-21
**Reference:** `tarot-company/specs/prototype-spec.md` — read this first

---

## What You're Building

The intelligence layer of the prototype. Your deliverables are the exact prompts and logic specifications that drive Stage A (feature extraction) and Stage B (interpretation generation). Omar builds the backend infrastructure that calls your prompts — but he builds against your contract.

**Your first deliverable is the pipeline contract:** exact input/output schemas, Stage A system prompt, Stage B system prompt, and validation rules. Omar cannot build until he has this.

---

## Your Deliverables

1. **Stage A system prompt** — instructs the LLM to extract a six-axis polarity feature vector and domain bucket from a transcript. Must produce valid, schema-adherent JSON at temperature=0.
2. **Stage B system prompt** — instructs the LLM to generate a three-card reading in the correct voice register from a spread contract. Must never reference the transcript.
3. **Pipeline contract doc** — the exact JSON schemas for Stage A output and Stage B input/output. Omar codes to this.
4. **Validation rules** — what to do if Stage A returns malformed JSON, an out-of-range value, or an unexpected domain. What to do if Stage B returns hollow text. (Prototype: fail gracefully, not silently.)
5. **Golden test transcripts** — 5–10 test transcripts with expected card selections, to verify the pipeline is working correctly during development. These are development aids, not the formal calibration sprint (that's V0).

---

## Stage A — Full Specification

**What you're building:**
An LLM prompt that takes a user's normalized spoken transcript and returns a structured feature vector.

**Input:** Plain text transcript.

**Output schema** (what the LLM must return):
```json
{
  "S": <float -1.0 to 1.0>,
  "C": <float -1.0 to 1.0>,
  "X": <float -1.0 to 1.0>,
  "O": <float -1.0 to 1.0>,
  "L": <float -1.0 to 1.0>,
  "A": <float -1.0 to 1.0>,
  "domain": "foundation | motion | interior | relation | threshold | none",
  "reasoning": "<one sentence — for debugging only>"
}
```

**The six axes:**
- **S** — Stability (+1.0) / Volatility (-1.0): How settled or disrupted is the person's situation or inner state?
- **C** — Continuity (+1.0) / Rupture (-1.0): Is this a continuation of something established, or a break from it?
- **X** — Expansion (+1.0) / Contraction (-1.0): Is the person's energy moving outward (into the world, into connection, into growth) or inward (retreating, containing, consolidating)?
- **O** — Other (+1.0) / Self (-1.0): Is the person's attention focused outward (on others, relationships, world) or inward (on their own experience, inner life)?
- **L** — Clarity (+1.0) / Obscurity (-1.0): How clear is the person's understanding of what's happening? Are things visible, or murky/unknown?
- **A** — Action (+1.0) / Reception (-1.0): Is the person in doing-mode (moving, deciding, initiating), or in receiving-mode (waiting, processing, being acted upon)?

**Domain buckets:**
- **foundation** — stability, structure, resources, what is built and held
- **motion** — movement, momentum, direction, volition
- **interior** — self-knowledge, inner life, witness, uncertainty
- **relation** — connection, contact between self and other, relational field
- **threshold** — rupture, passage, what cannot be held, liminal states
- **none** — no clear domain detected

**Key constraints:**
- All values must be in [-1.0, 1.0].
- `reasoning` is a debug field only — it is never forwarded to Stage B or shown to users.
- The prompt must work at temperature=0. Design it to avoid ambiguous outputs.
- Test with short transcripts (2–3 sentences), medium transcripts (1–2 minutes of speech), and long transcripts (5 minutes). The prompt must handle all three without collapsing to central (0.0) values for short inputs.

---

## Card Selection Logic (Post-LLM — Deterministic Arithmetic)

The following is handled by Omar's code, but you must understand it and validate the output.

1. **Cosine similarity** for each of 18 cards against the feature vector. MatchScore = (cosine_sim + 1) / 2 → [0, 1].
2. **Orientation:** If the transcript's highest-magnitude axis has the same sign as the card's primary axis → upright. If opposite sign but card still wins similarity → reversed.
3. **Sort by MatchScore.** Top 3 = the spread. Positions: highest = Present, second = Future, third = Past.
4. **Tie-breaking:** alphabetical by card_id.
5. **MatchScore bands:** Commit ≥ 0.65, Exploratory 0.40–0.64, Abstain < 0.40. Any Abstain → `needs_more_input`.
6. **Spread shape:** Coherent if all cards have ≥ 2 axes within ±0.25 of each other. Tensioned if any pair of cards is > 0.60 apart on a single axis.
7. **Major tier:** Count how many Majors in the spread exceed their tier threshold (1 Major ≥ 0.70, 2 Majors ≥ 0.83, 3 Majors ≥ 0.92).

Your golden test transcripts should verify that this logic selects the expected cards.

---

## Stage B — Full Specification

**What you're building:**
An LLM prompt that takes the spread contract (cards only — no transcript) and generates a three-card reading in the product's voice register.

**Input (Stage B receives this and nothing else):**
```json
{
  "spread_shape": "coherent | tensioned",
  "major_tier": 0,
  "cards": [
    {
      "position": "past | present | future",
      "card_id": "the_emperor",
      "card_name": "The Emperor",
      "card_orientation": "upright | reversed",
      "matchscore_band": "commit | exploratory"
    }
  ],
  "ontology_version_id": "v0.1.0"
}
```

**Voice register — hard constraints. These must be in the Stage B system prompt:**

1. **Interiority-first.** Every card is interpreted from the user's interior experience. Relation cards (The Lovers, Two of Cups, Six of Cups) are not about other people — they are about how connection or disconnection lives *inside* this person. Motion cards are about the person's will and direction, not external events.

2. **No predictive language.** Never: "you will," "this means X will happen," "this predicts," "soon you will." Never state outcomes as certain. Use: "what has been building," "what you're moving through," "a direction you're already heading."

3. **No oracular register.** Never: "the cards say," "the universe is telling you," "this card means," "your reading shows." The reading speaks directly to the person, not about an external authority interpreting for them.

4. **No character diagnosis.** Never label the user or anyone else: controlling, avoidant, anxious, wounded, narcissistic, codependent. These are prohibited.

5. **Never say "reversed."** Orientation is an internal concept. Interpret toward the reversed pole silently (the shadow of the card, the inversion of its primary energy). The user never hears "reversed."

6. **Exactly one anchor per card.** Each card interpretation must include exactly one specific, concrete anchor — no more, no fewer. An anchor is one of:
   - An image detail from the canonical Rider-Waite illustration (specific — not "the card shows a figure" but "the grip of the coin held to the chest")
   - A concrete observable the user can notice in their body or environment ("where in your body does this register right now?")
   - A small practice (not a prescription — something the user can do if they want to, not "you should")

7. **Position framing:**
   - Past card (Root): what has been forming — the ground of the current moment
   - Present card (Active): what is alive right now — the active force
   - Future card (Trajectory): what is indicated — a direction, not a destination

**Output for Commit band:** Three paragraphs (one per card, in past/present/future order). 150–250 words total.

**Output for Exploratory band:** Two full readings (Lens A and Lens B), each three paragraphs. Lens A interprets the cards toward their upright orientation. Lens B interprets toward their reversed orientation. The same physical anchor appears in both lenses (because it's drawn from the card image, not from the transcript).

**Card image anchors for reference** (use these in Stage B):
- The Emperor: armored figure on a stone throne, mountains unmoved behind
- The Tower: crown struck from the top of the tower, the falling already happening
- The High Priestess: figure between two pillars, veil of pomegranates, what lies beyond unseen
- The Chariot: two sphinxes facing different directions, charioteer still, the movement committed
- The Moon: path winding under a full moon, the far end not visible
- The Lovers: two figures with space between them, radiant figure above, the gap held open
- Ten of Pentacles: family under an archway, pattern of pentacles overhead, older than any of them
- Four of Pentacles: figure with coin held to chest, city behind, the grip complete
- Ace of Swords: single sword upright from cloud, crown balanced at its tip
- Ace of Wands: wooden staff with new leaves growing from the sides, grip just made
- Knight of Wands: rider mid-turn on rearing horse, direction not yet settled
- Three of Wands: figure at cliff edge, ships already on the water, wands planted
- Four of Cups: figure with arms crossed, three cups on ground, fourth offered from cloud, unacknowledged
- Seven of Cups: seven cups in cloud, each containing something different, none clearly graspable
- Page of Cups: figure looking into a cup, a fish has appeared inside it, looking back
- Two of Cups: two figures raising cups toward each other, space between them open, not yet received
- Six of Cups: one figure handing a cup of white flowers to another, offering extended, not yet received
- Six of Swords: boat crossing water, choppy near side, calm far side, passage not yet complete

---

## Testing Your Prompts

Before handing the pipeline contract to Omar, test Stage A and Stage B manually against at least 5 transcripts. For each, verify:

**Stage A:**
- JSON is valid and schema-adherent
- All axis values are in [-1.0, 1.0]
- Domain detection feels appropriate
- No central tendency collapse for short transcripts

**Stage B:**
- Reading is in the correct voice register (no predictive language, no oracular register)
- Exactly one anchor per card
- Reversed orientation is interpreted silently (no mention of "reversed")
- Commit and Exploratory outputs are both plausible

Document your 5–10 golden test transcripts in your deliverables directory. Include: transcript, expected dominant card(s), expected domain, and your Stage B assessment of the output quality.

---

## Pipeline Contract (Your First Output)

Before anything else, produce:

```
ai_ml_engineer_priya_nair/deliverables/pipeline-contract.md
```

This document contains:
1. Stage A system prompt (exact text)
2. Stage A output JSON schema (exact)
3. Stage B system prompt (exact text)
4. Stage B output JSON schema (exact)
5. Validation rules (what counts as a malformed Stage A response, what to do)

Omar blocks on this document. It is the first thing you produce.
