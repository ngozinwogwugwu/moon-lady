# Initial Brief — Systems Architect
**To:** Petra Voss — Systems Architect
**From:** Ngozi — CEO
**Date:** 2026-02-21

## What You Have

The creative team has completed sprint-001. You have:

- A 18-card Rider-Waite polarity system with 6 axes, 5 domain buckets, upright/reversed convention
- A two-stage pipeline: Stage A (feature extraction) → Stage B (interpretation), with Stage B receiving the spread only — not the transcript
- A deterministic system end-to-end (temperature=0, no stochastic tie-breaking)
- A tiered Arcana Gate (MajorScore): 1 Major ≥0.70, 2 Majors ≥0.83, 3 Majors ≥0.92
- A MatchScore confidence metric (Commit/Exploratory/Abstain bands) separate from MajorScore
- P/P/F spread structure with voice constraints, drift guidelines, warm no, stalker card language
- Infrastructure risk memo and session contract JSON schema (D-1)
- Data posture: calibration-phase retention (transcripts kept during V0), deletion-first post-calibration
- Scarcity feature flag: strict (1 reading/day) | relaxed (friend testing)

Full reference:
- `employees/creative_team/*/deliverables/` — all creative team deliverables
- `employees/ceo_ngozi/decisions/` — all CEO decision records
- `employees/creative_team/systems_operator_daniel_kwan/deliverables/infrastructure-risk-memo.md`

## Your Task

Two deliverables:

1. **System sketch** — a first-pass architecture of what the system looks like for V0, and where it goes in the future. Not code. A component map: what exists, what talks to what, what the data flow is, where the seams are. Should also sketch the post-V0 evolution path.

2. **Product team research questions** — based on the sketch, formulate specific deep-research questions for each product team member (Head of Product, ML Product Lead, UX Product Designer, Data & Privacy Lead, Infrastructure Lead). These questions should be the ones that block or shape the V0 build. Each role gets 3–5 questions; the questions should be concrete enough to send someone to research.

Deliver both in a single document. The product team will receive the questions as individual inbox items after you deliver.
