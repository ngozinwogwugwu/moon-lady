# Prototype Brief — Backend Engineer
**To:** Omar Yusuf — Backend Engineer
**From:** Product Team
**Date:** 2026-02-21
**Reference:** `tarot-company/specs/prototype-spec.md` — read this first

---

## What You're Building

The API server, database, and pipeline orchestration for the prototype. You take a voice memo, run it through transcription + Stage A + Stage B, and return the result via a server-sent event stream. You integrate Priya's AI pipeline (she provides the exact prompts and card selection logic; you call them and wire them together).

---

## Your Deliverables

1. **API server** — `POST /api/sessions`, `GET /api/sessions/:session_id`, device disclosure handling.
2. **Provider abstraction layer** — wraps all LLM calls; enforces temperature=0.
3. **Transcription step** — Whisper API, audio deleted after transcription.
4. **Pipeline orchestration** — Stage A → card selection logic → Stage B (with cache).
5. **Stage B cache** — Postgres table; composite key includes ontology_version_id.
6. **SSE event stream** — three events: transcription_complete, stage_a_complete, stage_b_complete.
7. **Database schema** — as specified in the prototype spec (section 5).
8. **Deployment** — Railway or Render, managed Postgres, always-warm instance.

---

## Provider Abstraction Layer (Critical)

All LLM calls must go through a single wrapper that enforces the determinism requirement. The public interface does NOT accept a temperature parameter. Temperature is always 0, hardcoded internally.

```typescript
type CompleteConfig = {
  max_tokens: number;
  response_format: "text" | "json";
  timeout_ms: number;
};

async function complete(
  system_prompt: string,
  user_message: string,
  config: CompleteConfig
): Promise<{
  content: string;
  model_id: string;
  provider: string;
  latency_ms: number;
  tokens_used: { input: number; output: number };
}>
```

The layer handles: authentication, request formatting, response normalization, timeout enforcement, retry on transient errors (429, 5xx — exponential backoff with jitter, max 2 retries), and logging of model_provider and model_id per call.

The layer does NOT handle: prompt engineering, output validation, caching.

**Stage A timeout:** 4000ms. **Stage B timeout:** 9000ms.

---

## Pipeline Orchestration

```
audio → Whisper transcription → delete audio → normalize transcript →
Stage A (LLM: extract feature vector) → card selection logic (deterministic arithmetic) →
check abstain → Stage B cache lookup →
[miss] Stage B (LLM: generate reading) → store in cache →
[hit] return cached reading →
store session → SSE: stage_b_complete
```

**Card selection logic** — Priya owns the prompt. You own calling it and applying the post-LLM deterministic steps:
1. Parse the LLM's feature vector JSON
2. Compute cosine similarity for all 18 cards (the card catalog is in the spec, section 6.2)
3. Apply MatchScore mapping: (cosine_sim + 1) / 2
4. Determine orientations
5. Sort by MatchScore; assign positions; apply alphabetical tie-breaking
6. Determine spread shape (coherent/tensioned)
7. Count major tier
8. Check for abstain (any card < 0.40 threshold → return needs_more_input)
9. Check for stalker card (within-session: compare card_ids against previous spreads in this device token's session history)
10. Build stage_b_input (spread contract only — no transcript, no feature vector)

**Stage B cache key:** SHA-256 of `ontology_version_id|card_id|orientation|spread_shape|matchscore_band|position|major_tier`. Look up before calling Stage B. Store after calling Stage B.

---

## SSE Design

The `POST /api/sessions` endpoint returns `text/event-stream`. Connection stays open through all three pipeline stages. Events:

```
data: {"event":"transcription_complete","session_id":"..."}

data: {"event":"stage_a_complete","session_id":"...","status":"ok"}
// or: {"event":"stage_a_complete","session_id":"...","status":"needs_more_input"}

data: {"event":"stage_b_complete","session_id":"...","reading":{...}}
// or on any error: {"event":"pipeline_error","session_id":"...","stage":"..."}
```

Keep the connection alive between stages (no timeouts). Close after stage_b_complete or pipeline_error.

---

## Database

Schema is in the prototype spec (section 5). Key points:
- `sessions.transcript_text` is stored for prototype debugging only — not for calibration. Delete manually after the prototype phase.
- `sessions.transcript_hash` is SHA-256 of the normalized transcript — used for deduplication and cache key construction.
- `stage_b_cache` primary key is `(ontology_version_id, cache_key_hash)` — different ontology versions store separate interpretations.
- Use `pg_advisory_lock(hashtext(cache_key))` before a Stage B call on cache miss to prevent thundering herd on concurrent identical requests.

---

## Deployment

- **Platform:** Railway or Render. Pick one.
- **Instance:** Always-warm (no scale-to-zero). Cold starts break the 10-second latency ceiling.
- **Database:** Managed Postgres on the same platform.
- **Secrets:** Environment variables. Never committed to the repo.
- **Required env vars:** `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `DATABASE_URL`, `DEV_TEXT_MODE`, `ONTOLOGY_VERSION_ID`.

---

## Key Decisions Already Made

- **temperature=0 everywhere.** The abstraction layer enforces this. No exceptions.
- **Stage B never sees the transcript.** Build the stage_b_input object from the spread contract only.
- **Audio is deleted after transcription.** Don't log it, cache it, or store it anywhere.
- **Postgres from day one.** No SQLite.
- **No auth.** Device token in headers is all identity management the prototype needs.

---

## Open Questions to Resolve with Priya

1. **Stage A output schema:** Priya produces the exact JSON schema the LLM returns. You parse it. Get this from her before writing the parsing logic.
2. **Stage B output schema:** Does Stage B return a single string (Commit) and two strings (Exploratory)? Or does Priya want a different structure? Align before building the cache schema.
3. **Feature vector validation:** If the LLM returns a malformed feature vector (axis out of range, missing field), what is the fallback? Does the pipeline fail gracefully or retry? Coordinate with Priya.

## Open Questions to Resolve with Theo

1. **SSE endpoint pattern:** Does the client POST the audio and immediately receive the SSE stream, or does it POST and then connect to a separate SSE endpoint? Pick the simpler one and document the contract.
2. **Disclosure confirmation:** Separate API call or embedded in the first session POST?
3. **Warm no retry session continuity:** When the user re-records after an abstain, is that a new session_id or does it extend the current one? Decide and expose accordingly.
