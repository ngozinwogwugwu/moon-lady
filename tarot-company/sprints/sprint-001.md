# Sprint 001 — Creative Team
**Date:** 2026-02-21
**Goal:** Produce all artifacts required to unlock the engineering handoff and unblock the product team.

> **CEO Direction Update — 2026-02-21:** See `employees/ceo_ngozi/decisions/v0-product-direction.md` for the full decision record. Key changes that affect this sprint: (1) the system must be deterministic end-to-end — all specs must reflect this; (2) scarcity is feature-flagged (`strict | relaxed`); (3) golden test vector sprint expanded to 100 transcripts with specific composition; (4) hollow operationalized with a formal definition; (5) interpretation anchor rule: exactly one per reading. Calibration is the primary V0 quality bar — cost, latency, and UX polish are secondary.

---

## What Blocks the Product Team

The product team cannot begin calibration, surface design, or infrastructure scoping until the creative team delivers:

| Artifact | Blocks |
|---|---|
| 18-card ontology (finalized) | ML Product Lead, Data Privacy Lead |
| MajorScore threshold proposal | ML Product Lead |
| Labelable "appropriateness" definition | ML Product Lead, golden test vector sprint |
| Interpreter spec (locked) | UX Product Designer |
| "Warm no" language (formalized) | UX Product Designer |
| Canon Constitution (draft) | Head of Product, Data Privacy Lead |
| Infrastructure risk memo | Infrastructure Lead, Data Privacy Lead |

Until these land, product team work is either blocked or limited to scaffolding that doesn't depend on creative outputs.

---

## Phase 1 — Creative Sprint (Today)

Tasks the creative team must complete. Some have internal dependencies — see sequencing note below.

---

### Sequencing Note

**Do the cross-session first.** Ilya and Amara need to draw the boundary between what the geometry hands the voice and what the voice has to do on its own before either of them finalizes their individual specs. That conversation is a prerequisite for both the ontology and the interpreter spec to be coherent with each other.

```
Ilya/Amara cross-session
        ↓                  ↓
  Ilya's tasks        Amara's tasks
        ↓
  Ngozi reviews
  appropriateness
  answer → kicks off
  test vector decision
```

---

### Ilya Moreau — Symbol Architect

| # | Task | Deliverable | Unlocks |
|---|---|---|---|
| I-1 | **Cross-session with Amara** — draw the geometry/voice boundary | Notes (both own) | I-2, I-3, A-2 |
| I-2 | **Domain bucket definitions** — 5 max, each mapped to polarity axes | `deliverables/domain-buckets.md` | I-3 |
| I-3 | **18-card dispersion map** — all 18 cards placed across polarity axes, no clustering | `deliverables/dispersion-map.md` | Ontology lock, ML Product Lead |
| I-4 | **MajorScore threshold proposal** — proposed starting value with stated rationale | `deliverables/majorscore-threshold.md` | ML Product Lead calibration |
| I-5 | **Similarity weighting table** — weights per axis for cosine similarity ranking | `deliverables/similarity-weights.md` | Selector spec lock |
| I-6 | **Answer: is "appropriateness" labelable?** — respond to Ngozi's Q2 from the meeting. If yes, define the rubric structure. If no, say why. | `deliverables/appropriateness-note.md` | Golden test vector sprint, ML Product Lead |
| I-7 | **Confirm or challenge: interiority worldview** — the three-axis reduction revealed the system is primarily about a person's relationship to their own interiority. Is that right for V0? Explicit answer required before ontology locks. | `deliverables/worldview-confirmation.md` | Ontology lock |

---

### Amara Vale — Ritual Designer

| # | Task | Deliverable | Unlocks |
|---|---|---|---|
| A-1 | **Cross-session with Ilya** — draw the geometry/voice boundary | Notes (both own) | A-2, A-3 |
| A-2 | **Interpretation voice constraints** — what the voice is and is not permitted to do | `deliverables/voice-constraints.md` | A-3, UX Product Designer |
| A-3 | **Prohibited deterministic phrases** — explicit list with examples of compliant alternatives | `deliverables/prohibited-phrases.md` | Interpreter spec lock |
| A-4 | **Drift guidelines** — rules for what anchors drift and what it's allowed to do | `deliverables/drift-guidelines.md` | Interpreter spec lock |
| A-5 | **P/P/F structure + escalation path** — define the V0 entry frame and specify what triggers progression to more complex frames | `deliverables/spread-structure.md` | UX Product Designer, sample spreads |
| A-6 | **3 sample readings** — using placeholder cards; one clean, one low-signal, one stalker card recurrence | `deliverables/sample-readings.md` | Sample spreads validation, ML Product Lead test vectors |
| A-7 | **Formalize the "warm no"** — exact language and register for when a user attempts a second reading | `deliverables/warm-no.md` | UX Product Designer |
| A-8 | **Finalize stalker card language** — exact language for pre-longitudinal recurrence acknowledgment | `deliverables/stalker-card-language.md` | UX Product Designer, interpreter spec |

---

### Daniel Kwan — Systems Operator

| # | Task | Deliverable | Unlocks |
|---|---|---|---|
| D-1 | **Infrastructure risk memo** — cost per session assumptions, minimal telemetry events, encryption compatibility, scalability constraints (1–2 pages) | `deliverables/infrastructure-risk-memo.md` | Infrastructure Lead, Data Privacy Lead |
| D-2 | **AI provider fallback scope** — what an abstraction layer requires, feasibility of a self-hosted fallback, rough cost of each mitigation | `deliverables/provider-fallback-scope.md` | Infrastructure Lead |

---

### Ngozi — CEO

| # | Task | Deliverable | Unlocks |
|---|---|---|---|
| N-1 | **Canon Constitution draft** — versioning rules, definition of a change, proposal standing, deprecation policy, succession rules | `employees/ceo_ngozi/deliverables/canon-constitution.md` | Head of Product, Data Privacy Lead, ontology lock |
| N-2 | **Ontology approval chain** — formalize who reviews and approves the lock (product owner, domain expert, engineering, privacy) with named roles | `employees/ceo_ngozi/deliverables/ontology-approval-chain.md` | Ontology lock |
| N-3 | **Golden test vector sprint kickoff** — 100 transcripts (40 clear polarity / 30 ambiguous / 15 edge/noise / 15 adversarial). Each entry: deterministic selected card, second-best card, margin score, structural justification, ritual plausibility rating, hollow flag. Decide: joint workstream or named owner. | `employees/ceo_ngozi/decisions/test-vector-ownership.md` | ML Product Lead |

---

## Phase 2 — Product Team Unlocked

Becomes available once Phase 1 deliverables are complete. Listed by role with the Phase 1 artifact each depends on.

---

### Head of Product

| Task | Depends On |
|---|---|
| Operationalize Canon Constitution into policy | N-1 |
| Define V0 Definition of Done in measurable terms | N-1, I-3, A-5 |
| Turn open questions into scoped workstreams | N-3, I-6 |
| Build and maintain decision log | N-2 |

### ML Product Lead

| Task | Depends On |
|---|---|
| Design golden test vector set (with Ilya + Amara) | I-6, N-3 |
| Define "appropriateness" in evaluable terms | I-6 |
| Build calibration workflow requirements (reliability diagram, logging, threshold iteration) | I-4, I-6 |
| Provider abstraction layer requirements | D-2 |
| Scope fallback model feasibility | D-2 |

### UX Product Designer

| Task | Depends On |
|---|---|
| Design the "warm no" interaction | A-7 |
| Design scaffolding layer (expandable explanations, onboarding cadence) | A-2 |
| Map P/P/F → advanced frames progression | A-5 |
| Interaction patterns for repeat card draws | A-8 |

### Data & Privacy Lead

| Task | Depends On |
|---|---|
| Define transcript pruning workflow | D-1 |
| Build retention logic tied to session lifecycle | D-1 |
| Ontology version control in stored sessions | N-1, I-3 |
| Model five-year archive shape | N-1, I-3 |
| Design export and ethical exit pathway | N-1 |

### Infrastructure Lead

| Task | Depends On |
|---|---|
| Implement model abstraction layer | D-1, D-2 |
| Define fallback tiers | D-2 |
| Implement deterministic pipeline (deterministic Stage A, deterministic Stage B, seeded or rule-based — no temperature drift) | CEO direction |
| Implement `scarcity_mode` feature flag and session logging | CEO direction |
| Stress test latency ceilings | D-1 |
| Cost per session across scale tiers (10 / 100 / 1000 users) | D-1 |

### ML Product Lead (additions)

| Task | Depends On |
|---|---|
| Build calibration dashboard (reliability diagram, band breakdown, hollow flag rate) | I-4, I-6, golden sprint |

---

## What Product Team Can Do During Phase 1

These tasks don't depend on creative outputs and can run in parallel today.

| Role | Task |
|---|---|
| Head of Product | Definition of Done framework skeleton — structure only, no values yet |
| Head of Product | Decision log template |
| Data & Privacy Lead | Deletion logic architecture — the posture is decided; the mechanism can be drafted independently |
| Data & Privacy Lead | GDPR/retention policy template |
| Infrastructure Lead | Stage A → Stage B JSON contract template — structure without values |
| Infrastructure Lead | Cost-per-session modeling framework — the formula, not the numbers |

---

## Handoff Gate

Engineering handoff requires all of the following. None can be skipped.

- [ ] 18-card ontology finalized (`I-3` + `I-7` confirmed)
- [ ] Selector spec locked (`I-4` + `I-5`)
- [ ] Interpreter spec locked (`A-2` + `A-3` + `A-4` + `A-5`)
- [ ] JSON schemas defined (product team, Phase 2)
- [ ] Sample spreads validated (`A-6`)
- [ ] Canon Constitution approved (`N-1` + `N-2`)

---
