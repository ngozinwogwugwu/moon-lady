# tarot-company

Documentation-only repo. No app code lives here.

## The 10 Core Artifacts

| File | What it is |
|---|---|
| `vision.md` | One-page vision + non-goals |
| `safety-policy.md` | Non-negotiable content constraints |
| `backlog.yaml` | Full ticket backlog (23 tickets) |
| `specs/system-architecture.md` | Data flow + privacy boundary diagram |
| `specs/integration-contract.md` | Stage A → Stage B interface spec |
| `contracts/spread_object.schema.json` | JSON Schema for the spread object |
| `ontology/cards_mvp.json` | 18-card MVP ontology |
| `prompts/interpreter_system.prompt.md` | Stage B system prompt |
| `handoff/engineering-handoff.md` | Checklist to hand off to engineering |

## How Work Happens

1. Pull a ticket from `backlog.yaml`, set `status: in-progress`
2. Produce the deliverable at the path listed in the ticket
3. Mark `status: done` when `definition_of_done` is met

## Decision Authority

Ngozi (CEO) is the sole decision-maker on vision, priorities, and standards.

---

## Project Status

Current State:
- Vision defined
- Product Philosophy defined
- Symbol System Constraints defined
- MVP scope locked

Next Steps:
- Finalize 18-card ontology
- Define MajorScore threshold values
- Draft interpreter voice spec
- Produce 2–3 sample spreads for testing
