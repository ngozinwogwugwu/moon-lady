# Implementation Team

Builds the prototype. Takes the product team's specification and turns it into working software.

**Source of truth:** `tarot-company/specs/prototype-spec.md`
**Meeting transcript:** `tarot-company/employees/product_team/deliverables/product-team-meeting-001.md`

## Members

| Role | Name | Owns |
|---|---|---|
| UI/UX Designer | Suki Nakamura | Visual design, interaction patterns, all user-facing states |
| Frontend Engineer | Theo Park | Web client, voice recording, SSE integration, reading display |
| Backend Engineer | Omar Yusuf | API server, provider abstraction layer, Stage A/B orchestration, database |
| AI/ML Engineer | Priya Nair | Stage A prompt, Stage B prompt, card selection logic, MatchScore computation |

## Collaboration model

- Priya defines the AI pipeline contract (Stage A input/output schema, Stage B input/output schema).
- Omar builds the backend against Priya's contract.
- Suki defines the UI for every screen state.
- Theo builds the frontend against Suki's designs and Omar's API.

Parallelization: Suki and Priya can work simultaneously. Omar depends on Priya's contract. Theo depends on Suki's designs and Omar's API spec.
