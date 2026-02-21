# Deep Research Prompt — ML Product Lead

## Context

You are the ML Product Lead for a tarot-based reflection product. The product takes a user's spoken transcript (voice memo), runs it through a two-stage AI pipeline, and returns a three-card tarot reading. Everything below is what has been built and decided so far.

### The two-stage pipeline

**Stage A — Feature Extraction (LLM call, temperature=0)**

Input: normalized transcript text.
Output: a polarity feature vector across six axes, plus card selection.

The six axes:
- S: Stability (1.0) / Volatility (-1.0)
- C: Continuity (1.0) / Rupture (-1.0)
- X: Expansion (1.0) / Contraction (-1.0)
- O: Other (1.0) / Self (-1.0)
- L: Clarity (1.0) / Obscurity (-1.0)
- A: Action (1.0) / Reception (-1.0)

Each axis is a float from -1.0 to 1.0. Stage A also detects a dominant domain bucket (Foundation, Motion, Interior, Relation, Threshold) and runs a weighted cosine similarity against an 18-card Rider-Waite subset.

Stage A outputs a fully specified spread: three cards (Past, Present, Future), each with a card ID, orientation (upright/reversed), MajorScore, MatchScore, and MatchScore band.

**Stage B — Interpretation Generation (LLM call, temperature=0)**

Input: the spread contract only — card IDs, orientations, MatchScore bands, spread shape (coherent/tensioned), Major tier (0–3), scarcity mode, ontology version.
Stage B **never** sees the transcript or the feature vector. This is a hard architectural requirement.

Output: a three-card reading in a specific voice register (interiority-first, no predictive language, exactly one concrete anchor).

### The 18-card deck

Six Major Arcana: The Emperor, The Tower, The High Priestess, The Chariot, The Moon, The Lovers.
Twelve Minor Arcana: Ten of Pentacles, Four of Pentacles, Ace of Swords, Ace of Wands, Knight of Wands, Three of Wands, Four of Cups, Seven of Cups, Page of Cups, Two of Cups, Six of Cups, Six of Swords.

Each card has polarity coordinates on the six axes (upright) and inverted polarity (reversed).

### Key metrics

**MatchScore** — polarity match confidence between the feature vector and the selected card. Computed as weighted cosine similarity. Three bands:
- Commit: ≥0.65 — high confidence; reading is offered as a single interpretation
- Exploratory: 0.40–0.64 — moderate confidence; reading is offered in two voices ("this might be X, or it might be Y")
- Abstain: <0.40 — low confidence; system returns a warm no ("I don't have enough to work with")

**MajorScore (Arcana Gate)** — intensity threshold for Major Arcana cards. A card must exceed its tier threshold to count toward the Major tier. Three tiers, exponentially harder:
- Tier 1: 1 Major Arcana card ≥0.70 — once-a-quarter life event
- Tier 2: 2 Major Arcana cards each ≥0.83 — major life chapter
- Tier 3: 3 Major Arcana cards each ≥0.92 — defining life moment

Spreads that don't meet any tier threshold are Minor-only readings (tier 0).

### Hollow flag

A reading is **hollow** if:
- It could apply to >50% of transcripts (too generic)
- It lacks a specific anchor (an image detail from the card, a concrete observable, or a small practice the user can do)
- It relies only on generic emotional language

Human raters assess hollow flag post-session by reviewing the interpretation text. It is a boolean per session, not an automated score. Hollow readings at the Commit band indicate a quality failure.

### Calibration approach

The calibration plan:
1. Build a **golden test vector set** of 100 labeled transcripts:
   - 40 clear polarity cases
   - 30 ambiguous cases
   - 15 edge/noise cases
   - 15 adversarial/overlap cases
2. Run all 100 through the pipeline
3. Human raters label each transcript against the appropriateness rubric:
   - Per-card axis alignment score (0–2)
   - Spread coherence score (0–2)
   - Hollow flag (true/false)
   - Appropriateness label (appropriate / inappropriate / uncertain)
4. Compute a MatchScore reliability diagram: for each MatchScore bin, what fraction of readings are labeled "appropriate"?
5. Calibration target: ≥70% appropriate at Commit band

The thresholds (0.65 Commit, 0.40 Exploratory) are priors chosen before calibration data exists. They are not statistically derived yet.

### Ontology versioning

The card coordinates, system prompts, and domain assignments form a versioned ontology (e.g., v0.1.0). Changing the ontology invalidates the Stage B cache and requires re-running the golden test vectors. Each session records its ontology version.

### Determinism requirement

The pipeline is fully deterministic: same transcript → same feature vector → same card → same interpretation, every time. All LLM calls use temperature=0. Tie-breaking uses alphabetical order by card_id. This is a hard constraint that cannot be relaxed.

---

## Your Research Questions

You are the ML Product Lead. You own the evaluation methodology, labeling workflow, calibration quality bar, and Stage A failure detection. Answer the following questions in as much concrete detail as possible.

**1. Golden test vector labeling workflow**

100 transcripts need to be labeled against the appropriateness rubric. Design the labeling workflow:
- Who does the labeling? How many raters are needed for a dataset of 100?
- What is the labeling interface — spreadsheet, custom tool, a hosted annotation platform (Label Studio, Argilla, etc.)?
- Each transcript requires: axis alignment scores per card (0–2), spread coherence score (0–2), hollow flag (true/false with note), appropriateness label (appropriate / inappropriate / uncertain), and ritual plausibility rating (1–5). Is this rubric coherent, and does it need refinement?
- How are rater disagreements resolved? At what level of inter-rater agreement (Cohen's kappa, Krippendorff's alpha, or percent agreement) is the dataset considered trustworthy for calibration?
- What is the labeling guide raters receive? What examples and edge cases need to be in it?

**2. MatchScore reliability diagram — methodology**

Once the golden test vector set is labeled, how do you compute and interpret the reliability curve?
- What is the binning strategy for MatchScore (equal-width bins, quantile bins, or fixed thresholds)?
- Given 100 total transcripts, how many samples fall in each bin? Is that sample size sufficient for statistically meaningful reliability estimates? At what sample size per bin do confidence intervals become too wide to be useful?
- Should the sprint be expanded beyond 100 transcripts? What is the minimum dataset size for a calibration curve the team can act on?
- What does the reliability diagram need to show? What is the acceptable shape — and what does a "bad" reliability curve look like?
- How does the curve inform threshold adjustment? If Commit band reliability is 60% (below the 70% target), what is the decision process for moving the threshold?

**3. MajorScore tier calibration**

The three tiers (Tier 1 ≥0.70, Tier 2 ≥0.83, Tier 3 ≥0.92) are priors. They are meant to correspond to life scales: once-a-quarter event, major life chapter, defining life moment.
- What does a labeling schema for tier calibration look like? Raters see a transcript and the spread; they must assess whether the "life scale" of the transcript matches the tier prediction. What labels do they apply?
- How do you convert rater labels into threshold adjustments? What statistical method is appropriate given the small dataset?
- Is it possible to calibrate all three tiers from a 100-transcript golden set, or does each tier require its own targeted sample? Tier 3 (3 Majors ≥0.92) may appear rarely in the wild — how do you ensure calibration coverage for rare tiers?
- What is the minimum evidence needed to adjust a threshold vs. leaving it as a prior?

**4. Stage A failure detection**

Stage A may produce systematically wrong feature vectors for certain transcript types, contaminating calibration data.
- What are the known failure modes for LLM-based structured output at temperature=0? (e.g., schema adherence failures, axis assignment bias for short/ambiguous transcripts, domain detection errors)
- Should the golden test vector set include Stage A feature vector ground truth, not just card selection ground truth? If so, how do raters assess whether a feature vector is correct?
- What is the protocol for detecting Stage A extraction errors before they cascade into bad calibration data? What signals indicate a systemic Stage A problem vs. a one-off extraction error?
- How does the margin score (gap between best-match and second-best card) signal Stage A quality? What margin score distribution is expected for a well-functioning Stage A?

**5. Hollow rate as a quality signal**

The hollow flag is rater-populated. What is the acceptable hollow rate, and what does it diagnose?
- What is the acceptable hollow rate at the Commit band in V0? (e.g., <10%, <20%?)
- If the hollow rate is too high, the source could be: Stage A selected the wrong card (correct card would yield a non-hollow interpretation), or Stage B produced a hollow interpretation for the correct card (voice/drift problem). How do you diagnose which component is failing?
- Does the hollow flag need to be split into sub-types (structural hollow vs. voice hollow) to enable this diagnosis?
- How does hollow rate interact with spread shape? Is a tensioned spread (cards in tension with each other) more likely to produce hollow readings than a coherent spread?

---

## Output format

For each question, provide:
1. A concrete recommendation or methodology
2. The reasoning and relevant prior art (calibration methods, NLP evaluation practices, etc.)
3. Any unresolved tradeoffs the team must decide
4. Implementation notes specific to a small team without a dedicated ML infrastructure team
