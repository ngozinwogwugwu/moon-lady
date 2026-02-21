# Deep Research Prompt — Infrastructure Lead

## Context

You are the Infrastructure Lead for a tarot-based reflection product. The product takes a user's spoken transcript (voice memo), runs it through a two-stage AI pipeline, and returns a three-card tarot reading. Everything below is what has been built and decided so far.

### The full pipeline

```
Voice memo → [Transcription] → Normalization → Stage A → Stage B Cache? → Stage B → Reading
```

1. **Transcription:** User submits a voice memo. The system transcribes it to text via an external transcription service (e.g., Whisper API). Audio is deleted after transcription.
2. **Normalization:** Trim whitespace, normalize casing, collapse spaces, normalize line breaks. No semantic changes.
3. **Stage A — Feature Extraction (LLM call, temperature=0):** The normalized transcript enters an LLM. Output: a polarity feature vector (6 floats on 6 axes) + a fully specified spread (3 cards with IDs, orientations, MajorScore, MatchScore, MatchScore band).
4. **Stage B Cache lookup:** Check whether the spread is already cached. Cache key: `(card_id, orientation, spread_shape, matchscore_band, position, major_tier)`. Cache hit → return cached interpretation. Cache miss → proceed to Stage B.
5. **Stage B — Interpretation Generation (LLM call, temperature=0):** Input is the spread contract only (card IDs, orientations, MatchScore bands, spread shape, Major tier, scarcity mode, ontology version ID). Stage B **never receives the transcript or the feature vector.** Output: three-card reading text.
6. **Return to user.**

### Determinism requirement

This is the single most important infrastructure constraint. The pipeline must be **fully deterministic**: same transcript → same feature vector → same card selection → same interpretation, every time, across all runs.

This means:
- All LLM calls use `temperature=0` (no randomness)
- The provider abstraction layer must **enforce** temperature=0 — it must reject any call attempting a non-zero temperature
- Tie-breaking in card selection uses alphabetical order by card_id (not LLM output)
- Domain detection (also an LLM call) must also use temperature=0
- Stage B outputs are deterministic by cache key once cached; cache stores ground truth
- The CI pipeline must include a **determinism test**: run the same transcript twice through the full pipeline and assert identical outputs

### Provider abstraction layer

All LLM calls must go through a provider abstraction layer that wraps calls with a common interface. This layer handles:
- Authentication (API key injection)
- Request formatting per provider
- Response normalization to a common schema
- Timeout enforcement
- Retry logic (transient failures, rate limit backoff)
- Temperature=0 enforcement (hard-coded, not per-call)
- Logging of `model_provider` and `model_id` per call (required for telemetry)

The abstraction layer does NOT handle: prompt engineering, output validation, or caching.

Required interface shape:
```
complete(system_prompt, user_message, config: { max_tokens, response_format: "text"|"json", timeout_ms })
→ { content, model_id, provider, latency_ms, tokens_used: { input, output } }
```

For V0: use Anthropic Claude Sonnet as primary provider (strong instruction following for Stage A structured output). The abstraction layer enables future provider switching.

### Stage B cache

Cache key: `(card_id, orientation, spread_shape, matchscore_band, position, major_tier)`

Because the pipeline is deterministic, the same card in the same orientation with the same spread context always produces the same interpretation text. The cache stores that text. Cache hit cost is near-zero in latency and model cost.

Cache invalidation: when the ontology version changes (card coordinates, system prompt, or domain bucket assignments change), the Stage B cache must be flushed for affected cards. This should be automated by keying invalidation to `ontology_version_id`.

Estimated cache hit rate at 1,000+ users: 40–70% (18 cards × 2 orientations × 3 MatchScore bands × 3 positions × 2 spread shapes × 4 major tiers = a bounded combination space).

### Telemetry event set

The system emits structured JSON events to an append-only telemetry log. These events must be queryable by the calibration dashboard.

Required events:
- `session.started` — session_id, user_id_hash, timestamp, scarcity_mode, ontology_version_id
- `stage_a.complete` — session_id, timestamp, latency_ms, domain_detected, spread_shape, matchscores per card, arcana_gate status, model_provider, model_id
- `stage_b.complete` — session_id, timestamp, latency_ms, interpretation_id, cache_hit, model_provider, model_id
- `session.complete` — session_id, timestamp, total_latency_ms
- `calibration.evaluated` — session_id, timestamp, hollow_flag, appropriateness_label, axis_alignment_scores, spread_coherence_score, rater_id (human-populated post-session)
- `scarcity.blocked` — session_id, user_id_hash, timestamp, scarcity_mode
- `user.card_feedback` — session_id, user_id_hash, timestamp, feedback_type: "doesnt_feel_right", cards_flagged (array of {position, card_id, orientation, matchscore_band}), ontology_version_id

The calibration dashboard requires these fields to be queryable: `matchscore_band`, `hollow_flag`, `scarcity_mode`, `ontology_version_id`, `cache_hit`, `appropriateness_label`.

### Session contract (abridged JSON schema)

```json
{
  "session_id": "UUID",
  "user_id_hash": "SHA-256 of user ID",
  "ontology_version_id": "e.g. v0.1.0",
  "scarcity_mode": "strict | relaxed",
  "transcript_hash": "SHA-256 of normalized transcript",

  "stage_a_output": {
    "feature_vector": { "S": float, "C": float, "X": float, "O": float, "L": float, "A": float },
    "domain_detected": "foundation | motion | interior | relation | threshold | none",
    "spread_shape": "coherent | tensioned",
    "major_tier": "0 | 1 | 2 | 3",
    "cards": [{ "position": "past|present|future", "card_id": string, "card_orientation": "upright|reversed", "majorscore": float, "matchscore": float, "matchscore_band": "commit|exploratory|abstain", "second_best_card_id": string, "margin_score": float }],
    "status": "ok | needs_more_input"
  },

  "stage_b_input": {
    "NOTE": "Stage B receives ONLY this subset — no transcript, no feature vector",
    "spread_shape": "coherent | tensioned",
    "major_tier": "0 | 1 | 2 | 3",
    "cards": [{ "position": string, "card_id": string, "card_name": string, "card_orientation": "upright|reversed", "matchscore_band": "commit|exploratory|abstain" }],
    "scarcity_mode": "strict | relaxed",
    "ontology_version_id": string
  },

  "stage_b_output": {
    "interpretation_id": "UUID",
    "cache_hit": boolean,
    "reading_text": string,
    "hollow_flag": "boolean | null"
  },

  "session_metadata": {
    "created_at": "ISO 8601",
    "stage_a_latency_ms": int,
    "stage_b_latency_ms": int,
    "total_latency_ms": int,
    "model_provider": string,
    "model_id": string
  }
}
```

### Scale and latency

| Build target | Scale | Latency ceiling |
|---|---|---|
| Prototype | 2–10 known users | 10s acceptable |
| V0 | 10–50 users | 10s uncached, 3s cached |
| V1 | 100–1,000 users | Same targets |

Cost per session (uncached, Claude Sonnet): ~$0.033 (Stage A ~$0.007, Stage B ~$0.026). With Stage B cache hit: ~$0.007.

### Prototype vs V0

Two build targets:
- **Prototype:** No authentication. Always relaxed scarcity. No dashboard. Proves the pipeline works. Minimum infrastructure.
- **V0:** Authentication (Firebase or off-the-shelf). Scarcity feature flag. Calibration dashboard. Full telemetry. Hardened error handling.

### Encryption

- All data at rest: AES-256, per-user key
- All API calls: TLS 1.3
- Key management: secrets manager (AWS KMS, Vault, or equivalent) from day one

---

## Your Research Questions

You are the Infrastructure Lead. You own the deployment architecture, provider abstraction, caching, telemetry, and the CI determinism test. Answer the following questions in as much concrete detail as possible.

**1. Provider abstraction layer — implementation pattern**

The abstraction layer must wrap all AI model calls with the common interface above. What is the right implementation for V0?

- **Off-the-shelf vs custom:** Research the available provider abstraction libraries (LiteLLM, aisuite, LangChain's model layer, etc.). What are the tradeoffs between using an off-the-shelf library and a lightweight custom implementation for this system's specific requirements: temperature=0 enforcement at the layer level (not per-call), structured JSON output reliability, per-call telemetry logging (model_provider, model_id, latency_ms, tokens_used)?
- **Temperature enforcement:** The layer must reject any call attempting non-zero temperature. Which libraries support this? If building custom, what is the right pattern?
- **Retry logic:** What retry strategy is appropriate for LLM API calls? (exponential backoff, jitter, max retries) What is the right timeout for Stage A (~1–2s expected) vs Stage B (~3–8s expected)?
- **Telemetry:** The layer must log model_provider and model_id per call. Where does this logging live in the abstraction?
- Recommend a concrete implementation pattern with rationale.

**2. V0 deployment target**

What is the right hosting environment for V0 (friend testing, 10–50 users)?

Evaluate the following options:
- **Managed platform (Railway, Render, Fly.io):** Single container, managed PostgreSQL, simple deployment. Tradeoffs?
- **Serverless (Vercel + managed database):** Function-based, scales to zero. Cold start latency risk given the 10-second ceiling?
- **Self-hosted VPS (DigitalOcean, Linode, Hetzner):** Full control, lowest cost, highest ops burden.

For each option, assess: (a) cold start latency risk, (b) ease of deployment for a small team, (c) monthly cost at V0 scale (10–50 users, ~50 sessions/day), (d) upgrade path to V1 (100–1,000 users) without architectural change.

Also: the transcription step adds a new external API call (audio → text). Does this change the deployment recommendation?

**3. Stage B cache implementation**

Cache key: `(card_id, orientation, spread_shape, matchscore_band, position, major_tier)`.

- **Backend choice:** Redis, in-memory LRU (e.g., node-lru-cache), SQLite-based cache, or a managed cache service (Upstash, Railway Redis)? For V0 scale, what is the right tradeoff between simplicity and operational cost?
- **Cache warming:** The golden test vector sprint produces 100 sessions. All Stage B outputs from those sessions are cacheable. What is the cache warming strategy — pre-warm before V0 launch, or let cache warm organically?
- **Invalidation on ontology version bump:** When `ontology_version_id` changes, the cache must be flushed for affected cards. What is the right invalidation mechanism? (flush all entries with old version ID, namespace keys by version, etc.)
- **Cache miss handling:** If Stage B is called on a cache miss during high load, how does the system handle concurrent requests for the same uncached key? (thundering herd problem)
- Recommend a concrete implementation with rationale.

**4. Telemetry infrastructure**

The calibration dashboard must query telemetry by `matchscore_band`, `hollow_flag`, `scarcity_mode`, `ontology_version_id`, `cache_hit`, `appropriateness_label`. The `calibration.evaluated` event is human-populated post-session (a rater adds hollow_flag, appropriateness_label, axis alignment scores after reviewing a session).

- **Backend choice for V0:** A structured log file queried with jq/DuckDB, a lightweight SQLite database, a managed analytics tool (PostHog, Mixpanel, Amplitude), or a proper time-series store (InfluxDB, TimescaleDB)? The requirement is: queryable by a small team without a dedicated data engineer.
- **Event ingestion:** How are the telemetry events written? (direct DB inserts, append-only log file, message queue) What is the right pattern for a prototype that needs to stay simple but not require a rewrite for V0?
- **Calibration.evaluated write path:** This event is human-populated. What is the interface — a spreadsheet, a simple internal web form, a direct database update tool? How does the rater link their evaluation to a session_id?
- **Dashboard implementation:** What is the minimum viable calibration dashboard for a 2–3 person team? (SQL queries on the telemetry DB, a Metabase/Superset instance, a custom lightweight dashboard, or even a Jupyter notebook?)
- Recommend a concrete telemetry stack with rationale.

**5. Determinism test in CI**

The CI pipeline must include a determinism check: run the same test transcript through the full pipeline twice and assert identical outputs at each stage.

- **Test design:** What exactly is asserted? (Stage A feature vector identity, card selection identity, Stage B interpretation text identity) Should the test run end-to-end against the real LLM API, or mock the LLM and test the post-LLM determinism?
- **Failure modes:** What are the ways this test can fail? (LLM non-determinism at temp=0, race conditions in async steps, floating point inconsistency in cosine similarity, tie-breaking logic not applied, cache state bleeding between runs)
- **LLM non-determinism:** Some providers do not guarantee byte-identical outputs at temperature=0 across different infrastructure runs (hardware batching variation). How should the test handle this? Is byte-identity the right assertion, or semantic identity (same card selected, same orientation)?
- **Test transcript selection:** What properties should the test transcript have? (unambiguous polarity, clear card selection, exercises the Arcana Gate) Should there be multiple test transcripts covering edge cases?
- **CI integration:** How is this test integrated into the CI pipeline? What triggers it — every commit, every PR, or before every deploy?
- Recommend a concrete determinism test implementation.

---

## Output format

For each question, provide:
1. A concrete implementation recommendation with rationale
2. Tradeoffs of alternatives considered
3. Code patterns or pseudocode where helpful
4. Cost or operational considerations for a small team
5. What must be in place for the prototype vs. what can wait for V0
