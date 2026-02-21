# Tickets — Backend Engineer
**Owner:** Omar Yusuf
**Sprint:** Prototype

Technology-agnostic. These describe what to build, not which library to use.

---

## OMAR-001: Project setup and Railway deployment
**Size:** S
**Depends on:** nothing
**Blocks:** all other OMAR tickets

Initialize the backend service and connect it to Ngozi's Railway project.

### Acceptance criteria
- [ ] Backend service deployed to Ngozi's existing Railway project
- [ ] Postgres plugin added to Railway project; `DATABASE_URL` injected automatically
- [ ] Health check endpoint (`GET /health`) returns 200
- [ ] All required environment variables documented in a `.env.example` file: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `DATABASE_URL`, `DEV_TEXT_MODE`, `ONTOLOGY_VERSION_ID`
- [ ] CORS configured to accept requests from the frontend service URL
- [ ] Deployment is always-warm (no scale-to-zero)

---

## OMAR-002: Database schema and migrations
**Size:** S
**Depends on:** OMAR-001
**Blocks:** OMAR-005, OMAR-006, OMAR-009, OMAR-011

Create all four tables from the prototype spec (section 5). Run migrations against Railway Postgres.

### Acceptance criteria
- [ ] All 4 tables created: `devices`, `sessions`, `stage_b_cache`, `telemetry_events`
- [ ] Migrations versioned and repeatable (running migrations twice does not error)
- [ ] `devices.disclosed_at` nullable (device exists before disclosure)
- [ ] `sessions.transcript_text` included (stored for prototype debugging; noted for manual cleanup)
- [ ] `stage_b_cache` primary key is `(ontology_version_id, cache_key_hash)`
- [ ] Indexes on `sessions.device_token` and `sessions.created_at`

---

## OMAR-003: Provider abstraction layer
**Size:** M
**Depends on:** OMAR-001
**Blocks:** OMAR-007, OMAR-010

Single function that wraps all LLM calls. Enforces temperature=0. Logs model metadata.

### Interface
```
complete(system_prompt, user_message, config: {max_tokens, response_format, timeout_ms})
  → {content, model_id, provider, latency_ms, tokens_used}
```

### Acceptance criteria
- [ ] `temperature` is NOT an input parameter — it is hardcoded to 0 internally
- [ ] Any call that attempts to pass temperature via any mechanism is rejected (defensive assertion)
- [ ] `timeout_ms` is enforced — calls that exceed timeout throw a typed error
- [ ] Retry logic: exponential backoff with jitter, max 2 retries, on 429/5xx/network errors only
- [ ] Every call logs: `model_provider`, `model_id`, `latency_ms`, `tokens_used.input`, `tokens_used.output`
- [ ] Stage A timeout: 4000ms. Stage B timeout: 9000ms.
- [ ] Returns a typed error (not a throw) for non-retryable failures

---

## OMAR-004: Transcription service integration
**Size:** S
**Depends on:** OMAR-001
**Blocks:** OMAR-006

Accept audio file, send to Whisper API, return transcript text. Delete audio from memory immediately.

### Acceptance criteria
- [ ] Accepts audio in any format Whisper supports (webm, mp4, ogg — passthrough, no transcoding)
- [ ] Calls Whisper transcriptions API with the audio
- [ ] Returns transcript text string
- [ ] Audio file is never written to disk
- [ ] Audio blob is dereferenced (eligible for garbage collection) immediately after transcription completes
- [ ] Errors from Whisper are caught and converted to a typed `TranscriptionError`

---

## OMAR-005: Device and disclosure endpoints
**Size:** S
**Depends on:** OMAR-002
**Blocks:** THEO (disclosure flow)

Two endpoints: create/look up a device, confirm disclosure.

### Endpoints
- `POST /api/devices` — create device token record if not exists; return `{disclosed: boolean}`
- `POST /api/devices/:token/disclose` — record `disclosed_at` timestamp

### Acceptance criteria
- [ ] `POST /api/devices` is idempotent — calling with an existing token returns current state
- [ ] `POST /api/devices/:token/disclose` sets `disclosed_at` if not already set; is idempotent
- [ ] Device token is the client's UUID (not server-generated) — the client generates it
- [ ] Undisclosed devices cannot submit audio (checked in OMAR-006)

---

## OMAR-006: Audio upload endpoint
**Size:** M
**Depends on:** OMAR-003, OMAR-004, OMAR-005
**Blocks:** OMAR-007, THEO (background upload)

`POST /api/sessions/upload` — accepts audio, starts pipeline, returns session_id immediately.

### Acceptance criteria
- [ ] Accepts `multipart/form-data` with `audio` field and `device_token` field
- [ ] Rejects if device has not confirmed disclosure (return 403)
- [ ] Creates session record in DB with `session_id`, `device_token`, `ontology_version_id`
- [ ] Starts transcription in the background (does not await before responding)
- [ ] Returns `{"session_id": "...", "status": "processing"}` immediately (202 Accepted)
- [ ] If `DEV_TEXT_MODE=true`, accepts `text` field in place of `audio`
- [ ] Audio is never persisted to disk or database

---

## OMAR-007: SSE stream endpoint and pipeline orchestration
**Size:** L
**Depends on:** OMAR-006, OMAR-003, OMAR-004
**Blocks:** OMAR-008, OMAR-009, OMAR-010, THEO (SSE client)

`GET /api/sessions/:id/stream` — SSE stream that emits events as each pipeline stage completes.

### Events to emit (in order)
```
transcription_complete  → {session_id}
stage_a_complete        → {session_id, status: "ok" | "needs_more_input"}
stage_b_complete        → {session_id, reading: ReadingObject}
pipeline_error          → {session_id, stage: "transcription"|"stage_a"|"stage_b"}
```

### Acceptance criteria
- [ ] SSE connection uses correct headers (`Content-Type: text/event-stream`, `Cache-Control: no-cache`)
- [ ] Emits `transcription_complete` when Whisper returns (may already be done by the time client connects)
- [ ] If transcription already done when client connects: emit `transcription_complete` immediately on connection
- [ ] Emits `stage_a_complete` after card selection logic completes
- [ ] If `status: "needs_more_input"`: emits `stage_a_complete` with that status, then closes connection
- [ ] Emits `stage_b_complete` with full `ReadingObject` after Stage B (cache hit or miss)
- [ ] Emits `pipeline_error` with `stage` field on any unrecoverable error
- [ ] Connection is closed cleanly after final event
- [ ] Concurrent connections to the same session_id are handled safely

---

## OMAR-008: Card selection logic
**Size:** M
**Depends on:** nothing (pure function, testable independently)
**Blocks:** OMAR-007

Deterministic arithmetic pipeline: feature vector → spread. No LLM calls.

### Acceptance criteria
- [ ] Cosine similarity computed for all 18 cards against the feature vector
- [ ] MatchScore = (cosine_sim + 1) / 2, clamped to [0, 1]
- [ ] Orientation determined per card: if transcript's highest-magnitude axis sign matches card's primary axis sign → upright, else → reversed
- [ ] Top 3 cards by MatchScore assigned: highest = Present, second = Future, third = Past
- [ ] Alphabetical tie-breaking by `card_id` when MatchScore values are equal (within 0.001 epsilon)
- [ ] MatchScore bands applied: Commit ≥ 0.65, Exploratory 0.40–0.64, Abstain < 0.40
- [ ] Any Abstain card → return `{status: "needs_more_input"}` for the whole spread
- [ ] Spread shape: Coherent if all 3 cards share ≥ 2 axes within ±0.25; Tensioned if any pair > 0.60 on any axis
- [ ] Major tier: count Majors exceeding tier thresholds (1 Major ≥ 0.70 = Tier 1; 2 Majors ≥ 0.83 = Tier 2; 3 Majors ≥ 0.92 = Tier 3)
- [ ] Stalker detection: flag `stalker: true` if card_id appeared in a previous spread for this device token in the current session
- [ ] Card catalog (18 entries) is a static constant — not a DB query
- [ ] Function is a pure function: same inputs always produce same outputs
- [ ] Unit tests cover: clear polarity case, tie-breaking case, abstain case, Tier 3 major case

---

## OMAR-009: Stage B cache
**Size:** M
**Depends on:** OMAR-002, OMAR-008
**Blocks:** OMAR-010

Cache lookup and storage for Stage B interpretation text.

### Cache key
SHA-256 of: `{ontology_version_id}|{card_id}|{orientation}|{spread_shape}|{matchscore_band}|{position}|{major_tier}`

### Acceptance criteria
- [ ] Cache lookup checks `stage_b_cache` table by `(ontology_version_id, cache_key_hash)` before calling Stage B
- [ ] Cache hit: return stored `interpretation_commit` (and `_exploratory_a`, `_exploratory_b` if applicable)
- [ ] Cache miss: call Stage B, store result, return result
- [ ] Advisory lock (or equivalent) acquired on cache miss before calling Stage B — prevents duplicate calls for the same key under concurrent load
- [ ] Cache key includes `ontology_version_id` — different ontology versions have separate cache entries
- [ ] `cache_hit: true` is included in the session record and `stage_b_complete` event

---

## OMAR-010: Stage B and Stage A integration
**Size:** M
**Depends on:** OMAR-003, OMAR-007, OMAR-008, OMAR-009
**Blocks:** nothing (wires it all together)

Integrate Priya's prompts into the pipeline. Depends on Priya's pipeline contract.

### Acceptance criteria
- [ ] Stage A system prompt loaded from config (not hardcoded in the orchestration logic)
- [ ] Stage A LLM call uses the tools/structured output pattern from Priya's contract
- [ ] Stage A response parsed and validated: all 6 axis values present and in [-1.0, 1.0]; domain is a valid enum value
- [ ] Invalid Stage A response: log error, return `pipeline_error` event
- [ ] Stage B system prompt loaded from config
- [ ] Stage B LLM call uses text output (no tools)
- [ ] Stage B response split into Commit and Exploratory A/B fields per Priya's contract
- [ ] Full session record written to DB after pipeline completes (including feature_vector, domain, spread shape, all card fields, latency per stage)

---

## OMAR-011: Session retrieval endpoint
**Size:** S
**Depends on:** OMAR-002, OMAR-010
**Blocks:** THEO (loading previous reading)

`GET /api/sessions/:id` — retrieve a completed session's reading.

### Acceptance criteria
- [ ] Returns `ReadingObject` for completed sessions (status: ok)
- [ ] Returns `WarmNoObject` for sessions with `stage_a_status: needs_more_input`
- [ ] Returns 404 for unknown session IDs
- [ ] Returns 403 if `device_token` in request does not match session's device token
- [ ] Does not return `transcript_text` or `feature_vector` to the client
