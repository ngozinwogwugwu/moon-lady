# Tickets — AI/ML Engineer
**Owner:** Priya Nair
**Sprint:** Prototype

Technology-agnostic. These describe what to produce, not which tool to use.

**Critical path note:** PRIYA-005 (pipeline contract) must be delivered first. Omar cannot build OMAR-010 until it exists.

---

## PRIYA-001: Stage A system prompt — v1
**Size:** M
**Depends on:** nothing
**Blocks:** PRIYA-003, PRIYA-005

Write the Stage A system prompt. Uses the Anthropic tools/function-calling feature for reliable structured output.

The prompt must instruct the LLM to extract a six-axis polarity feature vector and dominant domain bucket from a user transcript.

### Acceptance criteria
- [ ] System prompt is plain text, no code
- [ ] Defines the 6 axes clearly with scale anchors (what does +1.0 feel like? what does -1.0 feel like?)
- [ ] Includes 3 few-shot examples:
  - A Foundation/Stability example (high +S, +C)
  - An Interior/Obscurity example (high −X, −O, −L)
  - A Threshold/Rupture example (high −C, −S)
- [ ] Each few-shot example shows: transcript → expected axis values → expected domain
- [ ] Tool schema defined with all required fields: S, C, X, O, L, A, domain, reasoning
- [ ] Prompt tested at temperature=0 against all 3 example transcripts — produces expected values
- [ ] No axis value collapses to 0.0 for the clear examples (central tendency check)

---

## PRIYA-002: Stage B system prompt — v1
**Size:** M
**Depends on:** nothing
**Blocks:** PRIYA-004, PRIYA-005

Write the Stage B system prompt. Takes a spread contract (3 cards with IDs, orientations, positions, matchscore_bands, spread_shape, major_tier) and produces a three-card reading in the correct voice register.

### Acceptance criteria
- [ ] System prompt is plain text, no code
- [ ] Explicitly prohibits all 6 prohibited behaviors:
  - Predictive language ("you will," future outcomes as certain)
  - Oracular register ("the cards say," "the universe")
  - Character diagnosis (calling user/others controlling, avoidant, etc.)
  - Mention of "reversed"
  - Multiple anchors per card (exactly one required)
  - Relational cards interpreted as being about other people (interiority-first)
- [ ] Instructs one anchor per card (image detail, concrete observable, or small practice)
- [ ] Specifies position framing (Past = Root = what has been forming; Present = Active = what's alive now; Future = Trajectory = a direction, not a destination)
- [ ] Includes one short example interpretation (~100 words, one card) demonstrating the correct voice
- [ ] Output format specified: three paragraphs for Commit; two sets of three paragraphs for Exploratory (Lens A upright interpretation, Lens B reversed interpretation)
- [ ] Tested against 3 spread inputs — output passes the voice register checklist

---

## PRIYA-003: Golden test transcripts
**Size:** M
**Depends on:** PRIYA-001, PRIYA-002
**Blocks:** PRIYA-004, PRIYA-005

5–10 transcripts for development verification. These are not the formal calibration golden set (that's V0) — they're development aids to verify the pipeline works correctly.

### Required coverage
- 2 clear cases (unambiguous polarity — a clear Foundation/Stability transcript, a clear Interior/Obscurity transcript)
- 1 ambiguous case (multiple domains active, mixed polarity)
- 1 short transcript (2–3 sentences)
- 1 long transcript (2 minutes of speech, ~300 words)
- 1 adversarial case (highly metaphorical, poetic language)

### Per transcript, document
- The transcript text
- Expected dominant domain bucket
- Expected top card(s) by polarity geometry
- Expected orientation (upright/reversed) for the top card
- Expected MatchScore band (Commit, Exploratory, or Abstain)
- Actual Stage A output (feature vector) after running the prompt
- Stage B output (first 100 words) and a pass/fail against the voice register checklist

### Acceptance criteria
- [ ] 5 transcripts minimum, 10 preferred
- [ ] Each transcript documented with all fields above
- [ ] At least 4/5 Stage B outputs pass the voice register checklist
- [ ] Stage A does not produce central tendency collapse (no axis at exactly 0.0 for clear cases)
- [ ] Short transcript test: does the prompt handle 2–3 sentences without collapsing to center?

---

## PRIYA-004: Voice register checklist
**Size:** S
**Depends on:** PRIYA-002
**Blocks:** PRIYA-003

A one-page evaluation checklist for Stage B output quality. Used during PRIYA-003 and referenced by anyone reviewing Stage B output in the future.

### Acceptance criteria
- [ ] Six binary checks (pass/fail per output):
  1. No predictive language — scan for "will," "going to," "soon," future outcomes stated as certain
  2. No oracular register — scan for "the cards say," "the universe," "this means"
  3. No character diagnosis — scan for adjective labels applied to user or others
  4. No mention of "reversed"
  5. Exactly one anchor per card — count anchors (image detail, observable, or practice)
  6. Interiority-first — does each card interpretation focus on the user's interior experience?
- [ ] Each check includes one example of a pass and one example of a fail
- [ ] Overall quality rating (1–5): "Would this feel meaningful in a real reflection context?"

---

## PRIYA-005: Pipeline contract document
**Size:** M
**Depends on:** PRIYA-001, PRIYA-002, PRIYA-003
**Blocks:** OMAR-010 (Omar cannot integrate without this)

**This is the first deliverable due. Omar blocks on it.**

The pipeline contract is the exact specification that Omar builds against. It contains the complete input/output schemas, the prompts, and the validation rules.

Deliver to: `ai_ml_engineer_priya_nair/deliverables/pipeline-contract.md`

### Contents required

**Stage A:**
- [ ] Full system prompt (exact text, ready to copy-paste into code)
- [ ] Tool schema (exact JSON Schema definition for the tools call)
- [ ] Output validation rules: what counts as a valid Stage A response? What counts as malformed?
- [ ] Error cases: what should the pipeline do if Stage A returns an axis value > 1.0 or < -1.0? (Clamp or reject?)
- [ ] Example input (transcript) + example output (feature vector JSON)

**Stage B:**
- [ ] Full system prompt (exact text, ready to copy-paste into code)
- [ ] Input format (exact JSON that Stage B receives — the spread contract)
- [ ] Output format for Commit band: expected structure (three paragraphs, labeled by position?)
- [ ] Output format for Exploratory band: expected structure (Lens A and Lens B, how delimited?)
- [ ] Output length targets: Commit (words/paragraphs), Exploratory per lens (words/paragraphs)
- [ ] Example input + example output (both Commit and Exploratory)

**Integration notes:**
- [ ] How does Omar parse the Stage B response to split it into per-card fields?
- [ ] What delimiter or structure separates Past / Present / Future card interpretations in the output?
- [ ] What delimiter separates Lens A from Lens B in the Exploratory output?

---

## PRIYA-006: End-to-end determinism verification
**Size:** S
**Depends on:** PRIYA-005, OMAR-008 (card selection logic must be built first)
**Blocks:** nothing (verification task)

Verify that the full pipeline is deterministic: same transcript → same cards → same interpretations.

### Acceptance criteria
- [ ] Run 3 test transcripts through the full pipeline twice each
- [ ] Card selection (card_id, orientation, position) is identical on both runs for all 3 transcripts
- [ ] MatchScore band is identical on both runs
- [ ] Stage B output: if cache hit on second run, reading text is byte-identical
- [ ] Stage B output: if cache miss on both runs (first-run cache disabled), card selection is still identical
- [ ] Document any observed variation and its source (LLM float variation, tie-breaking edge case, etc.)
- [ ] Recommend CI test assertion strategy to Omar based on findings
