# Product Team Meeting 001 — Prototype Handoff Alignment
**Date:** 2026-02-21
**Attendees:** Head of Product, ML Product Lead, UX Product Designer, Data & Privacy Lead, Infrastructure Lead
**Purpose:** Align on prototype scope; produce implementation handoff for the build team
**Output:** This transcript + `tarot-company/specs/prototype-spec.md`

---

## Opening

**Head of Product:** The goal today is simple. We have five research documents and a system sketch. We need to agree on exactly what the prototype is, flag anything that blocks the build team, and then hand off. The prototype is not V0. Prototype proves the pipeline works. V0 is where calibration begins. Let's hold that distinction.

---

## Discussion: What Goes Into the Prototype

**UX Designer:** I want to anchor on the user experience first, then let infrastructure and ML respond. The core interaction is: voice memo → reading. Everything else is secondary. The recording UI, the processing ritual (Listening / Choosing cards / Writing), and the reading screen are the three surfaces that matter. Edge cases — warm no, exploratory two-voice, stalker card — those are all in scope because they're pipeline outputs, not extra features. We don't control when they happen.

**ML Lead:** Confirmed. Exploratory band, abstain, and stalker card will emerge naturally from the pipeline. If we don't build those states, we'll have blank screens on a percentage of real transcripts. They have to be there.

**Head of Product:** So the prototype implements the full user-facing pipeline — all states the user might encounter. What it does not implement: authentication, scarcity enforcement, the calibration sprint, the dashboard, the "doesn't feel right" feedback mechanism, cross-session stalker detection. Those are V0.

**Data Lead:** What about consent? Even with friends, if we're storing their transcripts internally for debugging during the prototype, they should know.

**UX Designer:** I had a short disclosure screen in my research. One screen, plain language, before the first use. Not a policy wall. Something like: "We're building this. During the prototype we may look at your transcripts to see if the system is working. You can ask us to delete yours at any time."

**Data Lead:** That works. Minimal but honest. We should log whether the user saw it. Device token tied to the disclosure flag.

**Infrastructure Lead:** Easy. Postgres row per device token with `disclosed_at` timestamp.

**Head of Product:** Agreed. One-screen disclosure, no checkbox required for prototype (friends-only population), just a "Got it" confirm. Data lead, draft the exact language post-meeting. We put it in the spec before handoff.

---

## Discussion: Voice Memo and Transcription

**UX Designer:** Voice memo is the hard decision and we're not softening it for the prototype. The user speaks; the system transcribes. I do want a dev override — text input behind a flag, for our own testing — but it's not user-facing.

**Infrastructure Lead:** Transcription step I'm recommending OpenAI Whisper API. Adds roughly 1–2 seconds to the pipeline. Audio is deleted immediately after transcription completes. That's a data posture requirement.

**Data Lead:** Yes. Audio is the most sensitive artifact. Delete on transcription completion, no exceptions even in prototype.

**ML Lead:** Do we need to store transcripts at all in the prototype? For debugging, yes, I think we want to be able to look at what people submitted and what card the system selected. That's how we'll know if Stage A is working before we have formal calibration.

**Head of Product:** We store transcripts for internal debugging during the prototype. Not for formal calibration — that's V0. Informal: we look at them ourselves, then delete them manually. Data lead, is that acceptable?

**Data Lead:** As long as we disclose it and it's a named, limited set of people, yes. The disclosure screen covers this. After the prototype, we clean up manually.

---

## Discussion: Real-Time Pipeline Progress

**UX Designer:** I need SSE for the processing ritual. The pipeline takes 4–10 seconds. I want to show three sequential states: "Listening" (transcription), "Choosing cards" (Stage A), "Writing" (Stage B). That requires the backend to emit progress events the frontend can subscribe to.

**Infrastructure Lead:** Server-sent events are straightforward. Three events: `transcription_complete`, `stage_a_complete`, `stage_b_complete`. The frontend subscribes and updates the UI state. Low complexity.

**Head of Product:** That's in scope for the prototype. It's a core part of the UX, not a V0 enhancement.

---

## Discussion: Stage B Cache

**Infrastructure Lead:** I want to build the Stage B cache into the prototype, not defer it to V0. It's a single Postgres table. The cache key is `(card_id, orientation, spread_shape, matchscore_band, position, major_tier, ontology_version_id)`. Same card combination always returns the same reading text. Given we're using 18 cards and a deterministic pipeline, the prototype test runs will warm the cache immediately. From the first week, a good fraction of readings will be cache hits.

**ML Lead:** Agreed. The cache is also useful for debugging — we can inspect what the system produced for a given card combination.

**Head of Product:** Yes. Cache is in prototype scope.

---

## Discussion: Deployment

**Infrastructure Lead:** Railway or Render. Managed container, always-warm instance, managed Postgres. No serverless — cold start latency conflicts with the 10-second ceiling. We don't want the first request after an idle period to blow the UX. Cost at prototype scale (maybe 5–20 users, occasional use) is under $30/month.

**Head of Product:** Fine. Pick one and run with it. Document the choice in the prototype spec so the backend engineer knows where to deploy.

---

## Decisions Locked

The following decisions are final for the prototype. They are written into the prototype spec and the implementation team takes them as given.

| Decision | Outcome |
|---|---|
| Voice memo input | Required. Primary UX. Dev text override behind flag (not user-facing). |
| Auth | None. Device token only. |
| Scarcity | Always relaxed. No enforcement. No scarcity warm no. |
| Transcription | Whisper API. Audio deleted after transcription. |
| Pipeline progress | SSE: `transcription_complete`, `stage_a_complete`, `stage_b_complete` |
| Stage B cache | Postgres, from day 1. Composite key includes ontology_version_id. |
| Exploratory band | Implemented. Lens A / Lens B treatment. |
| Stalker card | Within-session only. Language as specified by Amara. |
| Warm no (abstain) | Implemented. "I don't have enough to work with yet." + Re-record CTA. |
| Warm no (scarcity) | Not implemented in prototype. |
| Warm no (pipeline failure) | Implemented. Generic graceful failure state. |
| Dashboard | None. |
| Calibration sprint | Deferred to V0. |
| "Doesn't feel right" | Deferred to V0. |
| First-use disclosure | One screen, plain language, no checkbox, "Got it" confirm. |
| Deployment | Managed container (Railway or Render) + managed Postgres. |
| Database | Postgres from day 1. No SQLite. |

---

## Open Items (to resolve before build starts)

1. **Consent disclosure text** — Data lead drafts, Head of Product approves. Needed before frontend builds the disclosure screen.
2. **Stage A prompt** — AI/ML engineer owns this. Full prompt including axis extraction instructions and JSON output schema.
3. **Stage B prompt** — AI/ML engineer owns this. Full prompt including voice register constraints and reading structure.
4. **Exact recording time limit** — UX designer called out 5 minutes. Is this a hard cap or a soft warning? Frontend needs to know.
5. **Retry behavior on abstain warm no** — Does "Record again" start a fresh session or resume the current one? Backend and UX need to align.

---

## Handoff

Full implementation spec: `tarot-company/specs/prototype-spec.md`

Implementation team:
- **Suki Nakamura** — UI/UX Designer
- **Theo Park** — Frontend Engineer
- **Omar Yusuf** — Backend Engineer
- **Priya Nair** — AI/ML Engineer

Each has received a role-specific inbox brief. The prototype spec is the single source of truth.
