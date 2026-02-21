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

| Build target | Scale            | Latency ceiling         |
| ------------ | ---------------- | ----------------------- |
| Prototype    | 2–10 known users | 10s acceptable          |
| V0           | 10–50 users      | 10s uncached, 3s cached |
| V1           | 100–1,000 users  | Same targets            |

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

6. Provider abstraction layer — implementation pattern

Recommendation (V0) Use a lightweight custom wrapper around the official provider SDK(s) (Anthropic first), with a single “sealed” config surface that cannot express temperature at all. Enforce determinism by construction (no temperature parameter in the public API), plus a defensive runtime assertion that rejects any attempt to pass temperature via provider-specific escape hatches.

Rationale Off-the-shelf abstraction layers optimize for breadth (many providers, tools, agents). Your constraints are narrower but stricter: layer-level determinism enforcement, highly reliable structured JSON, and first-class per-call telemetry. A custom wrapper keeps the contract small, auditable, and testable, and avoids hidden defaults (retries, timeouts, temperature, etc.) that can violate the determinism requirement.

Tradeoffs (alternatives) LiteLLM: strong provider coverage and normalization, but you inherit a large configuration surface and “proxy” semantics; you will still need policy enforcement, and you must continuously verify that new versions don’t introduce defaults that conflict with your determinism constraints. LiteLLM’s docs emphasize temperature as a normal input parameter, so “reject non-zero temperature” becomes your responsibility at the boundary, not guaranteed by the library. ([LiteLLM][1]) aisuite: thin, OpenAI-like interface, but it intentionally exposes core parameters like temperature; you would still need a policy layer to prevent misuse. ([GitHub][2]) LangChain model layer: useful for apps that need chaining, tools, and agent patterns. For your use, it adds complexity and can multiply timeouts due to default retries unless carefully configured. ([support.langchain.com][3])

Temperature enforcement Pattern: “sealed config” + policy guard.

- Public interface does not accept temperature/top_p.
- Internally, set provider params to temperature=0 (and top_p=1 if supported) unconditionally.
- Guard: if any call site tries to sneak temperature through “extra_params”, fail fast.

Pseudocode sketch

```ts
type CompleteConfig = {
  max_tokens: number;
  response_format: "text" | "json";
  timeout_ms: number;
};

async function complete(
  system_prompt,
  user_message,
  config: CompleteConfig,
): Promise<CompleteResult> {
  // Policy: determinism by construction
  // No temperature accepted here; set internally only.
  const started = now();

  const providerRequest = {
    system: system_prompt,
    messages: [{ role: "user", content: user_message }],
    max_tokens: config.max_tokens,
    temperature: 0,
    // response_format mapped provider-specifically
  };

  const res = await withTimeout(
    () =>
      withRetry(
        () => anthropicClient.messages.create(providerRequest),
        retryPolicy,
      ),
    config.timeout_ms,
  );

  return normalize(res, { latency_ms: now() - started, provider: "anthropic" });
}
```

Retry logic and timeouts Retry policy (LLM calls):

- Retry only on transient classes: 429, 5xx, network timeouts, connection resets.
- Exponential backoff with full jitter; cap the backoff so you don’t blow the 10s ceiling.
- Suggested: max_retries=2 for Stage A; max_retries=1 for Stage B (because it’s larger and you want latency predictability), with “retry budget” bounded by the per-stage timeout.

Timeouts:

- Stage A expected 1–2s: set timeout_ms = 3000–4000ms.
- Stage B expected 3–8s: set timeout_ms = 9000ms (hard cap below the 10s uncached ceiling), but only if your end-to-end pipeline doesn’t add additional synchronous work. Otherwise set Stage B to 8000ms and reserve 2s for overhead.

Telemetry in the abstraction layer Put telemetry capture inside the abstraction boundary so every call is guaranteed to emit:

- provider, model_id, latency_ms, tokens_used (input/output), request_id (if provider returns one), retry_count, timeout flag. You should not leave this to call sites; otherwise you will eventually have “shadow calls” that bypass logging.

Prototype vs V0 Prototype:

- Single provider (Anthropic).
- Minimal retry (1 retry) and a single timeout.
- Log to stdout (structured JSON) plus return metadata to the caller. V0:
- Add circuit breaker behavior (temporary fail-closed to “needs_more_input” or “try again” rather than pile on retries).
- Add provider fallback only if you can keep determinism constraints (in practice, provider fallback breaks “same transcript → same output” unless you freeze a deterministic routing rule).

Important determinism caveat (provider reality) Even with temperature=0, providers may not guarantee byte-identical outputs forever; there are public reports/issues noting variability. Design your CI determinism checks accordingly (section 5). ([GitHub][4])

2. V0 deployment target (10–50 users, ~50 sessions/day)

Recommendation (V0) Use a managed container platform with always-warm instances (no scale-to-zero by default) + managed Postgres. Treat Redis as optional (you can implement Stage B cache in Postgres initially). This avoids cold start risk while keeping ops light.

Managed platform options Railway / Render / Fly.io class platforms work. Railway provides straightforward container deploy + managed DB, but managed add-ons can become expensive depending on sizing; official Railway pricing is usage/subscription-based. ([Railway][5]) Render often has simpler “always-on” semantics for small services; third-party comparisons suggest managed DB/Redis pricing that is reasonable at small scale, but verify against current official pricing before committing. ([The Software Scout][6])

Serverless (Vercel functions) Tradeoff: cold starts + per-request initialization can easily consume meaningful portions of a 10s ceiling, especially when you add transcription + two LLM calls. If you go serverless, you must explicitly mitigate cold starts (keep-warm pings, provisioned concurrency equivalents) and control connection pooling to Postgres. For this product, serverless is viable but higher-risk for latency predictability.

Self-hosted VPS Cheapest on paper, highest operational burden (patching, monitoring, secrets, backups). For friend testing, the opportunity cost is usually not worth it unless you already operate infrastructure.

Assessment criteria (a) Cold start latency risk

- Managed containers (always-on): low.
- Serverless scale-to-zero: medium/high unless mitigated.
- VPS: low (always-on), but you must manage everything.

(b) Ease of deployment

- Managed container platforms: highest.
- Serverless: high for simple HTTP, but complexity rises with DB pooling + long-running requests.
- VPS: lowest.

(c) Monthly cost (rough order-of-magnitude at V0)

- App container: typically low tens of dollars/month for always-on small instance.
- Managed Postgres: varies widely by provider/tier; avoid overprovisioning early.
- If you add Upstash Redis: free tier may be enough; pay-as-you-go is low at your volume. ([Upstash: Serverless Data Platform][7])

(d) Upgrade path to V1 (100–1,000 users) A container + Postgres architecture upgrades cleanly:

- Add read replicas or move to stronger managed Postgres.
- Add Redis if cache pressure requires it.
- Add a queue for transcription/LLM work only if you need async workflows (you currently return synchronously).

Does transcription change the recommendation? It increases the case against cold-started serverless because you’re adding another external dependency and more tail latency. Keep the core API always-warm for V0.

3. Stage B cache implementation

Recommendation (V0) Implement the Stage B cache as a Postgres table with a composite unique key that includes ontology_version_id, and use an advisory-lock or “insert-once” pattern to prevent thundering herd on cache misses. Add Redis later only if you need lower latency than Postgres can provide (you likely won’t at this scale).

Why Postgres-first

- You already need Postgres for sessions/telemetry.
- Cache size is bounded and small.
- Persistence is desirable (you want cached interpretations to survive deploys).
- Operational simplicity: one datastore for V0.

Schema sketch

- stage_b_cache( ontology_version_id text, cache_key_hash bytea, -- hash of (card_id, orientation, spread_shape, matchscore_band, position, major_tier) card_id text, orientation text, spread_shape text, matchscore_band text, position text, major_tier int, reading_text text, interpretation_id uuid, created_at timestamptz, PRIMARY KEY (ontology_version_id, cache_key_hash) )

Cache warming strategy Pre-warm before V0 launch using your 100 “golden sessions”:

- Run Stage B inputs derived from those sessions and populate cache.
- This increases early cache hit rate immediately and reduces first impressions being dominated by the slow path.

Invalidation on ontology version bump Namespace keys by ontology_version_id (do not delete rows in-place unless you must).

- Easiest: every cache lookup includes ontology_version_id; old entries are automatically ignored.
- Optional cleanup job: drop rows for old versions after N days.

Cache miss handling / thundering herd For concurrent identical misses:

- Acquire pg_advisory_lock(hash(cache_key_hash)) before calling Stage B.
- Recheck cache after lock acquisition (double-checked locking).
- If still missing: call Stage B once, insert, release lock. This makes “one LLM call per unique key” true even under bursty load.

Redis / Upstash alternative If you do want Redis in V0:

- Upstash is a reasonable “minimal ops” choice and has a free tier and pay-as-you-go pricing. ([Upstash: Serverless Data Platform][7]) But you still need persistence and invalidation-by-version; you’ll implement the same namespace pattern and some form of single-flight locking (Redis SETNX lock with expiry).

Prototype vs V0 Prototype:

- In-memory map is acceptable only if you run a single process and accept cache loss on restart. V0:
- Postgres-backed cache (recommended) or managed Redis with persistence strategy.

4. Telemetry infrastructure

Recommendation (V0) Use Postgres as the telemetry store with an append-only events table (JSONB payload + extracted indexed columns), and use Metabase OSS as the calibration dashboard. Use a tiny internal web form to write calibration.evaluated events keyed by session_id.

Backend choice rationale Postgres hits the sweet spot:

- Queryable by a small team with SQL.
- Easy to index the specific fields your dashboard needs.
- No new vendor learning curve. Metabase provides a low-friction dashboard UI and connects cleanly to Postgres. ([Metabase][8])

Event ingestion pattern Write events via direct DB insert in the API service (synchronous) with minimal overhead.

- Table: telemetry_events(id uuid, session_id uuid, event_name text, ts timestamptz, payload jsonb)
- Also store “hot” columns redundantly for indexing: matchscore_band, hollow_flag, scarcity_mode, ontology_version_id, cache_hit, appropriateness_label (nullable). This avoids expensive JSON path indexes and keeps queries simple.

Calibration.evaluated write path (human-populated) Minimum viable:

- Internal web page (basic auth or admin-only route) where a rater pastes/chooses session_id and submits hollow_flag, appropriateness_label, axis_alignment_scores, spread_coherence_score, rater_id.
- The submission writes a telemetry_events row with event_name='calibration.evaluated' and also updates extracted columns. Alternative (even simpler but more brittle): spreadsheet + periodic import. I would avoid this because it weakens “single source of truth” and invites ID mismatch.

Dashboard implementation (minimum viable) Metabase OSS:

- Create saved questions (SQL) and dashboards filtered by ontology_version_id and scarcity_mode.
- Charts: cache_hit rate, hollow_flag rate by matchscore_band, appropriateness_label distribution, latency percentiles.

Alternatives considered PostHog/Mixpanel/Amplitude:

- Pros: fast setup for product analytics.
- Cons: your calibration fields are bespoke; you’ll still need a structured store for rater-entered evaluation and to join to session metadata. PostHog cloud has a generous free tier, but it’s a heavier dependency than needed for V0 calibration queries. ([PostHog][9]) Log files + DuckDB:
- Works, but rater write-back and concurrent ingestion become awkward quickly. Timescale/Influx:
- Overkill; you don’t need time-series-specific features at this scale.

Prototype vs V0 Prototype:

- Structured JSON logs to stdout/file are sufficient; you can load into DuckDB ad hoc. V0:
- Postgres telemetry_events + Metabase + rater form.

5. Determinism test in CI

Recommendation Use a two-layer determinism strategy: A) “Hard” determinism tests that do not hit real LLM APIs (run on every PR/commit). B) “Canary” determinism checks that do hit the real provider (run nightly or pre-deploy), with assertions designed around your actual determinism contract (card selection + cache behavior), not byte-identical free-form text.

Why not rely on end-to-end byte identity against the live LLM on every PR? Providers can produce small variations even at temperature=0; there are public reports of non-determinism. Treat this as an external drift signal, not as a gate that blocks all engineering work. ([Unstract.com →][10])

A) PR-gating determinism tests (no live LLM) Test design

- Given a fixed normalized transcript fixture, stub Stage A provider response with a golden JSON output (feature vector + domain + spread contract).
- Assert:
  1. Normalization produces identical transcript_hash.
  2. Card selection logic (including tie-break alphabetical by card_id) yields the exact 3 cards/orientations/positions.
  3. Stage B cache key generation is stable and matches expected keys.
  4. Telemetry events emitted contain required fields and stable values (except timestamps, UUIDs).

- For Stage B, do not call the LLM; instead, insert a known cached interpretation for the expected cache keys and assert you get a cache hit and the same reading_text.

Failure modes caught

- Race conditions in async steps (e.g., emitting different telemetry sequences).
- Floating point instability in similarity computations (solve by rounding/quantizing feature vector + similarity scores before any comparisons and before serialization).
- Tie-breaking regressions.
- Cache-key regressions.
- Non-deterministic UUID generation leaking into “determinism assertions” (fix by excluding interpretation_id/session_id from equality, or injecting deterministic UUIDs in test mode).

B) Nightly / pre-deploy live canary (real LLM) Test design Run a small suite (3–10 transcripts) end-to-end twice:

- Assert Stage A status='ok' both times.
- Assert selected spread contract is identical (card_id, orientation, position, spread_shape, major_tier, matchscore_band).
- Do not assert raw Stage A JSON byte-equality; assert field-level equality after parsing + canonicalization (sorted keys, normalized floats).
- Stage B:
  - First run: allow cache miss and store result.
  - Second run: require cache hit and exact reading_text match (because your cache is ground truth once written).

Handling LLM non-determinism If Stage A can drift across runs, you have three mitigation levers:

1. Canonicalization/validation: enforce numeric rounding (e.g., 4–6 decimals) in Stage A JSON before any downstream logic, so small numeric noise doesn’t flip bands/cards.
2. Strong JSON schema + strict parsing: reject outputs that don’t match schema exactly; re-request with the same input (bounded retries).
3. Model/version pinning: always log and pin model_id; treat model changes as ontology_version-like changes requiring explicit rollout.

Test transcript selection Include multiple fixtures with targeted properties:

- Clear single-domain transcript (domain_detected stable).
- Borderline Arcana Gate transcript that exercises major_tier transitions.
- A “tie” transcript designed so the top-2 card match is very close, to validate alphabetical tie-break behavior.
- A “needs_more_input” transcript to validate deterministic refusal paths.

CI integration

- PR gate: run A) on every PR and main-branch commit.
- Canary: run nightly and/or as part of a “release” workflow before deploy. If the canary detects drift, fail the deploy and require investigation (model update, provider behavior change, prompt regression).

Prototype vs V0 Prototype:

- Only PR-gating tests with stubs are strictly necessary. V0:
- Add nightly canary; add alerting when drift occurs; add dashboards tracking drift frequency by model_id/provider.

[1]: https://docs.litellm.ai/docs/completion/input?utm_source=chatgpt.com "Input Params"
[2]: https://github.com/andrewyng/aisuite?utm_source=chatgpt.com "andrewyng/aisuite: Simple, unified interface to ..."
[3]: https://support.langchain.com/articles/1557730279-configuring-timeout-for-init-chat-model-in-langchain?__hsfp=3006156910&__hssc=71363532.1.1766188800254&__hstc=71363532.73bd3bee6fa385653ecd7c9674ba06f0.1766188800251.1766188800252.1766188800253.1&threadId=892df624-4829-43a6-83fc-0bc36fef0913&utm_source=chatgpt.com "Configuring Timeout for init_chat_model in LangChain"
[4]: https://github.com/anthropics/claude-code/issues/3370?utm_source=chatgpt.com "[BUG] Claude CLI produces non-deterministic output for ..."
[5]: https://railway.com/pricing?utm_source=chatgpt.com "Pricing"
[6]: https://thesoftwarescout.com/railway-vs-render-2026-best-platform-for-deploying-apps/?utm_source=chatgpt.com "Railway vs Render 2026: Best Platform for Deploying Apps"
[7]: https://upstash.com/pricing/redis?utm_source=chatgpt.com "Pricing"
[8]: https://www.metabase.com/docs/latest/databases/connections/postgresql?utm_source=chatgpt.com "PostgreSQL | Metabase Documentation"
[9]: https://posthog.com/pricing?utm_source=chatgpt.com "Transparent, usage-based, generous free tier"
[10]: https://unstract.com/blog/understanding-why-deterministic-output-from-llms-is-nearly-impossible/?utm_source=chatgpt.com "Why is deterministic output from LLMs nearly impossible?"
