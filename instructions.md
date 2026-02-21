## Product Team — Parallel to Creative

### 1. Head of Product — Systems Integrator

**Role:** Translates canon, ritual, and architecture into an executable roadmap without diluting intent.

**Mandate:** Protect the core decisions already made (scarcity, deletion posture, ontology governance) while turning them into ship-ready artifacts and milestones.

**Primary Responsibilities:**

- Own the Definition of Done across V0 and beyond.
- Translate Canon Constitution into operational policy.
- Turn open questions (MajorScore calibration, golden test vectors, semantic drift detection) into scoped workstreams.
- Maintain a decision log so governance choices remain legible.
- Define what “V0 success” means in measurable terms without compromising ritual integrity.

**Profile Needed:**

- Has shipped ML-backed products.
- Comfortable with probabilistic systems and calibration.
- Understands that constraint is part of value, not a growth blocker.
- Will push back when creative intent and operational reality conflict.

---

### 2. ML Product Lead — Calibration & Evaluation

**Role:** Owns MajorScore, test vectors, and model abstraction strategy.

**Mandate:** Turn “appropriate card selection” from a philosophical question into a testable one.

**Primary Responsibilities:**

- Design and own the golden test vector set (with Ilya + Amara).
- Define what “appropriateness” means in evaluable terms.
- Build calibration workflow (reliability diagrams, logging, threshold iteration).
- Design provider abstraction layer requirements.
- Scope fallback model feasibility.

**Profile Needed:**

- Deep experience in model evaluation frameworks.
- Comfortable designing labeling rubrics for subjective domains.
- Pragmatic about imperfect ground truth.
- Strong bias toward observability.

---

### 3. UX Product Designer — Ritual Surface Architect

**Role:** Owns how governance decisions appear at the surface layer.

**Mandate:** Make scarcity, deletion, scaffolding, and drift constraints legible without breaking sacred minimalism.

**Primary Responsibilities:**

- Design the “warm no” interaction.
- Design scaffolding layer (expandable explanations, onboarding cadence).
- Map progression from Past/Present/Future → advanced frames.
- Define interaction patterns for repeat card draws.
- Ensure accessibility without bloating the front layer.

**Profile Needed:**

- Experience designing constrained, contemplative interfaces.
- Sensitive to tone and restraint.
- Understands progressive disclosure.
- Comfortable working closely with a ritual designer.

---

### 4. Data & Privacy Lead — Archive Steward

**Role:** Owns long-term data posture and deletion guarantees.

**Mandate:** Operationalize “delete until forced to keep.”

**Primary Responsibilities:**

- Define transcript pruning workflow.
- Build retention logic tied to session lifecycle.
- Design export & ethical exit pathway.
- Version ontology changes in stored sessions.
- Model five-year archive shape.

**Profile Needed:**

- Experience in privacy-forward architecture.
- Familiar with compliance frameworks but not compliance-first.
- Thinks in lifecycle, not just storage.

---

### 5. Infrastructure Lead — Model Independence & Reliability

**Role:** Ensures the system cannot be broken by a pricing email.

**Mandate:** Reduce AI provider fragility.

**Primary Responsibilities:**

- Implement model abstraction layer.
- Define fallback tiers.
- Ensure deterministic JSON contract between Stage A and Stage B.
- Stress test latency ceilings.
- Monitor cost per session across scale tiers (10 / 100 / 1000 users).

**Profile Needed:**

- Backend architect with ML pipeline experience.
- Pragmatic about tradeoffs between elegance and resilience.
- Strong on cost modeling.

---

## Structural Principle

Creative Team defines:

- Canon
- Voice
- Geometry
- Ritual logic
- Ethical posture

Product Team defines:

- Evaluation
- Calibration
- Observability
- Surface experience
- Infrastructure resilience
- Roadmap sequencing

Neither overrides the other. Product operationalizes constraints; Creative defines them.

---

## Immediate Cross-Team Workstreams

1. Golden Test Vector Sprint (joint ownership)
2. Canon Constitution Draft → Product Operationalization
3. MajorScore V0 Prior Definition
4. Model Provider Abstraction Requirements
5. Accessibility Scaffolding Prototype
6. Five-Year Archive Model Spec Below is a clean executive summary you can hand directly to your assistant and then to the team.

---

# V0 Product Direction — Executive Summary

**Date:** 2026-02-21 **CEO Decision Update: Calibration-First, Deterministic System**

---

# Core Strategic Decisions

## 1. Calibration Is the Primary V0 Quality Bar

The most important outcome for V0:

> Card selections must feel structurally appropriate and defensible from day one.

Cost, latency, UX polish, and semantic drift detection are secondary.

We are optimizing for:

- Right-feeling card selection
- Deterministic consistency
- Evaluability

---

## 2. The System Is Deterministic

Same transcript → same card → same interpretation.

This applies to:

- Stage A (feature extraction)
- Card selection logic
- Stage B (interpretation generation)

No randomness. No temperature drift. No stochastic tie-breaking.

If two users prompt in the same way, they receive the same result. Pattern recognition is intentional.

---

## 3. Light Normalization Only

Before feature extraction:

- Trim whitespace
- Normalize casing
- Collapse repeated spaces
- Normalize line breaks

Do NOT:

- Rephrase
- Lemmatize
- Correct grammar
- Alter semantics

We normalize formatting, not meaning.

---

## 4. Scarcity Is Feature-Flagged

“One reading per day” remains philosophically constitutive of the ritual.

However:

- `scarcity_mode = strict | relaxed`
- Strict = one reading/day.
- Relaxed = multiple readings allowed (for friend testing).

Scarcity state is logged per session for calibration segmentation.

Public default: strict. Internal/friend testing default: relaxed.

---

## 5. Deletion-First Data Posture

We are implementing:

> Delete until forced to keep.

Raw transcripts:

- Used for feature extraction and summary.
- Deleted automatically afterward.

Stored long-term:

- Spread (card selection)
- Interpretation
- Summary
- Ontology version ID
- Calibration metadata

Raw emotional voice data does not persist.

---

## 6. MajorScore Is a Prior, Not Calibrated

For V0:

- We choose a defensible threshold.
- We log all outcomes.
- Calibration is iterative post-launch.

We do not pretend it is statistically calibrated before we have labeled data.

---

## 7. Golden Test Vector Sprint Expanded

Calibration requires rigor.

Dataset size increased to 100 transcripts:

- 40 clear polarity cases
- 30 ambiguous cases
- 15 edge/noise cases
- 15 adversarial/overlap cases

Each transcript includes:

- Deterministic selected card
- Second-best card
- Margin score
- Structural justification
- Ritual plausibility rating
- Hollow flag (if applicable)

This dataset becomes:

- Calibration baseline
- Regression suite
- Future fine-tuning corpus

---

## 8. Hollow Is Operationalized

A reading is hollow if:

- It could plausibly apply to >50% of transcripts.
- It lacks a specific anchor (image detail, observable, or practice).
- It relies only on generic emotional language.

Drift must include one anchor.

---

## 9. Interpretation Anchor Rule

Each reading must include exactly one specific anchor:

- Image detail
- Concrete observable
- Small practice

This prevents Barnum collapse.

---

## 10. Determinism Enables Calibration

Because the system is deterministic:

- Reliability curves are stable.
- Regression testing is meaningful.
- Brittleness becomes visible quickly.
- Pattern recognition is legitimate.

This increases epistemic integrity.

---

# What Is Secondary in V0

The CEO explicitly tolerates:

- Higher per-session cost
- Slower latency
- Smaller UX polish surface
- Incomplete semantic drift detection
- Limited provider fallback sophistication (initially)

Calibration and appropriateness take priority.

---

# Open Foundational Question

If structural geometry selects a card that is technically correct, but users consistently report it “doesn’t feel right,”

We must decide whether to adjust:

- Geometry weights
- Interpretation voice
- Ontology itself
- Or privilege structural correctness over subjective feel

This is the next philosophical fork.

---

# Immediate Next Actions

1. Draft Canon Constitution.
2. Lock Ontology v1.
3. Define appropriateness rubric.
4. Execute 100-transcript golden sprint.
5. Implement deterministic pipeline.
6. Implement scarcity flag.
7. Build calibration dashboard.
8. Begin friend pilot in relaxed mode.

---

# The System We Are Building

Not an oracle. Not a stochastic experience. Not an engagement mechanic.

A deterministic symbolic mirror with measurable calibration discipline.

That is the spine of V0.
