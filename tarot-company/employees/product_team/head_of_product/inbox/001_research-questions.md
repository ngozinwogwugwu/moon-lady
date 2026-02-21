# Deep Research Prompt — Head of Product

## Context

You are the Head of Product for a tarot-based reflection product. The product takes a user's spoken transcript (voice memo), runs it through a two-stage AI pipeline, and returns a three-card tarot reading with interpretation. Everything below is what has been built and decided so far.

### What the product does

1. The user submits a **voice memo**. The system transcribes it to text.
2. The transcript is lightly normalized (trim whitespace, normalize casing — no semantic changes).
3. **Stage A (feature extraction):** The normalized transcript is sent to an LLM at temperature=0. The LLM extracts a polarity feature vector across six axes: Stability/Volatility (S), Continuity/Rupture (C), Expansion/Contraction (X), Other/Self (O), Clarity/Obscurity (L), Action/Reception (A). Each axis is a float from -1.0 to 1.0. Stage A also detects a dominant domain bucket (Foundation, Motion, Interior, Relation, Threshold), runs a weighted cosine similarity against an 18-card Rider-Waite subset, applies the Arcana Gate, and outputs a fully specified spread: three cards with IDs, orientations (upright/reversed), and confidence scores.
4. **Stage B (interpretation generation):** Receives *only* the spread contract — card IDs, orientations, MatchScore bands, spread shape, Major tier. Stage B never sees the transcript or the feature vector. It generates a three-card reading (Past / Present / Future) in a specific voice register.
5. The reading is returned to the user.

### The 18-card deck

Six Major Arcana: The Emperor, The Tower, The High Priestess, The Chariot, The Moon, The Lovers.
Twelve Minor Arcana: Ten of Pentacles, Four of Pentacles, Ace of Swords, Ace of Wands, Knight of Wands, Three of Wands, Four of Cups, Seven of Cups, Page of Cups, Two of Cups, Six of Cups, Six of Swords.

### Key metrics

**MatchScore** — polarity match confidence between the transcript's feature vector and the selected card. Three bands:
- Commit: ≥0.65 (high confidence)
- Exploratory: 0.40–0.64 (moderate confidence — reading is offered in two voices)
- Abstain: <0.40 (system returns a warm no: "I don't have enough to work with")

**MajorScore** — Arcana Gate intensity for Major Arcana cards. Three tiers:
- Tier 1: 1 Major Arcana card with score ≥0.70 (once-a-quarter life event)
- Tier 2: 2 Major Arcana cards each ≥0.83 (major life chapter)
- Tier 3: 3 Major Arcana cards each ≥0.92 (defining life moment)

A spread with no Major Arcana above threshold is a Minor-only reading.

### Hollow flag

A reading is **hollow** if: it could apply to >50% of transcripts, lacks a specific anchor (image detail, observable, or small practice), or uses only generic emotional language. Human raters assess hollow flag post-session. It is not automated. A high hollow rate at the Commit band is a quality failure.

### Calibration loop

The product's V0 quality bar is calibration. The system builds a **golden test vector set** of 100 transcripts:
- 40 clear polarity cases
- 30 ambiguous cases
- 15 edge/noise cases
- 15 adversarial/overlap cases

Each transcript is labeled: selected card, second-best card, margin score, structural justification, ritual plausibility rating (1–5), hollow flag. The golden test set becomes the calibration baseline and regression suite.

The calibration target: ≥70% of Commit-band readings rated "appropriate" by human raters.

### Ontology versioning

The card coordinates, system prompts, and domain bucket assignments together form an **ontology**. It is versioned (e.g., v0.1.0). Changing the ontology is equivalent to a schema migration: it invalidates the Stage B cache, requires re-running the golden test vectors, and must be tracked in a decision log. Changes are governed by a **Canon Constitution** — a versioning and change governance spec. The Canon Constitution defines who can propose changes, who approves them, and what triggers a version bump.

### Prototype vs V0

Two distinct build targets:
- **Prototype:** No authentication. Scarcity always relaxed (unlimited readings). No dashboard. No calibration sprint. Proves the pipeline works.
- **V0:** Authentication (Firebase or off-the-shelf). Scarcity feature-flagged (strict = 1 reading/day, relaxed = friend testing). Calibration dashboard. Golden test vector sprint. Full telemetry. This is where real calibration begins.

### Warm no

Three types of "warm no" (system declines to give a reading):
1. **Scarcity:** "Today's reading is still with you. Come back tomorrow." (strict mode, one reading per day)
2. **Abstain:** "I don't have enough to work with." (MatchScore below Abstain threshold)
3. **Incomplete spread:** Partial pipeline failure

---

## Your Research Questions

You are the Head of Product. You own the product definition, the governance workflow, and the calibration dashboard requirements. Answer the following questions in as much concrete detail as possible.

**1. V0 Definition of Done**

What are the measurable criteria for V0 to be considered complete? Define across three dimensions:
- **Calibration quality:** What MatchScore reliability curve target does the product need to reach before V0 ships? The calibration target is "≥70% appropriate at Commit band" — but what does the reliability *curve* look like, and what is the minimum acceptable shape (i.e., is Exploratory band quality also gated)?
- **System correctness:** What determinism test pass rate is required? The CI pipeline runs the same transcript twice and asserts output identity — what is the pass threshold?
- **Ritual integrity:** How do you verify that warm no, stalker card recurrence, and voice constraints (no predictive language, interiority-first, exactly one anchor) are implemented correctly? What does a ritual integrity checklist look like at ship time?

**2. Canon Constitution operationalization**

The Canon Constitution governs ontology changes. What does this look like as an operational workflow for a small team?
- Who can propose an ontology change (card coordinate adjustment, domain bucket reassignment, system prompt edit)?
- What is the review and approval chain?
- What triggers a version bump vs. a hotfix vs. a rejected change?
- What happens to in-flight sessions when a version bump occurs?
- What is the minimum viable process — something a 3-person team can run without bureaucratic overhead?

Research: what do similar governance systems (API versioning, data schema governance, ML model versioning) use at small-team scale?

**3. Calibration dashboard requirements**

The calibration dashboard is used by the product team to evaluate whether the system is working. It must support three decisions:
- Are MatchScore thresholds correctly calibrated? (Is the Commit band actually high-confidence?)
- Is the hollow flag rate acceptable? (Are Commit-band readings non-hollow?)
- Is the MajorScore tier distribution matching the intended life-scale mapping? (Is Tier 3 rare enough to be meaningful?)

What does this dashboard need to show? What are the exact views, metrics, and filters a small calibration team needs? Who uses it and on what cadence? What is the minimum viable dashboard for a team of 2–3 that doesn't require a dedicated data engineer?

**4. Decision log structure**

You own the decision log that keeps governance choices legible over time. What is the minimum viable decision log format?
- What decisions must be logged (ontology versions, threshold changes, data posture transitions, Canon Constitution amendments)?
- What fields does each log entry need?
- What tooling supports this for a small team (markdown files in a repo, a lightweight database, a structured spreadsheet)?
- How does the decision log interact with the ontology version ID stamped on every session?

Research: what decision log formats work well for small ML/AI product teams?

---

## Output format

For each question, provide:
1. A concrete recommendation or answer
2. The reasoning behind it
3. Any unresolved tradeoffs or choices the team must make
4. If applicable: research pointers, prior art, or analogous systems worth studying
