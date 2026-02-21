# Infrastructure Risk Memo
**Owner:** Daniel Kwan — Systems Operator
**Sprint:** 001 / Task D-1
**Status:** Updated — CEO decisions 2026-02-21 (Arcana Gate tiering, Stage B transcript isolation)
**Feeds:** Infrastructure Lead, Data & Privacy Lead, Head of Product

---

## System Overview

The pipeline is two stages with a deterministic contract between them.

**Stage A — Feature Extraction:** Receives a normalized transcript. Extracts a polarity feature vector across six axes (S, C, X, O, L, A), detects the dominant domain bucket, applies weighted cosine similarity against the card catalog, applies the tiered Arcana Gate (MajorScore per card — three tiers: ≥0.70, ≥0.83, ≥0.92), and returns a fully specified spread: three cards with IDs, orientations (upright/reversed), MatchScore band per card, Major tier count, and spread shape (coherent/tensioned).

**Stage B — Interpretation Generation:** Receives the spread contract only — card IDs, orientations, MatchScore bands, and spread shape. **Stage B does not receive the transcript, the feature vector, or any other Stage A artifact.** Generates a P/P/F three-card reading in the voice registered to Amara's spec. Returns rendered interpretation text.

**Application Layer:** Enforces scarcity, manages sessions, stores outputs, logs telemetry.

Both stages use AI model calls. Both must be deterministic. This is the primary infrastructure design constraint.

---

## Cost Per Session — Assumptions and Scale Projections

### Model assumptions (current pricing, February 2026)

Stage A and Stage B are assumed to use a mid-tier hosted language model (e.g., Claude Sonnet or GPT-4o). Pricing is modeled at approximately $3 per million input tokens and $15 per million output tokens — representative of current mid-tier model costs and subject to change.

| Stage | Input tokens | Output tokens | Cost estimate |
|---|---|---|---|
| Stage A | ~800 (transcript + system prompt) | ~300 (feature vector JSON) | ~$0.007 |
| Stage B | ~1,000 (spread + system prompt) | ~1,500 (three-card reading) | ~$0.026 |
| **Per session total** | | | **~$0.033** |

With Stage B caching (described below), repeat card/spread/MatchScore-band combinations skip the Stage B model call. Cache hit cost is near-zero.

### Scale projections (uncached)

| Daily active users | Daily cost | Monthly cost |
|---|---|---|
| 10 | ~$0.33 | ~$10 |
| 100 | ~$3.30 | ~$100 |
| 1,000 | ~$33 | ~$1,000 |
| 10,000 | ~$330 | ~$10,000 |

These are ceiling estimates. With caching, actual costs are substantially lower at scale. One reading per user per day (strict scarcity mode) is a natural rate limiter that bounds cost linearly with user count.

### Stage B caching opportunity

Because the system is deterministic, Stage B outputs can be cached by key:

```
cache_key = (card_id, card_orientation, spread_shape, matchscore_band, spread_position)
```

The same card in the same orientation with the same spread shape and MatchScore band always produces the same interpretation text. This is both a cost mitigation and a latency mitigation. Cache warmup can begin during the golden test vector sprint — every evaluation reading is a cacheable Stage B output. Estimated cache hit rate at 1,000+ users: 40–70% (the 18-card deck with upright/reversed and three MatchScore bands produces ~108 possible per-card combinations; spread combinations are larger but coherent/tensioned shape reduces variance).

**Risk:** Cache invalidation on ontology version change. When the ontology version ID changes, the cache must be flushed for affected cards. This should be automated in the cache layer.

---

## Session Contract — JSON Schema Draft

The deterministic contract between Stage A and the application layer, and between the application layer and Stage B.

```json
{
  "session_id": "string (UUID)",
  "user_id_hash": "string (hashed, not raw)",
  "ontology_version_id": "string (e.g., 'v0.1.0')",
  "scarcity_mode": "strict | relaxed",
  "transcript_hash": "string (SHA-256 of normalized transcript)",
  "normalization_applied": ["trim_whitespace", "normalize_casing", "collapse_spaces", "normalize_linebreaks"],

  "stage_a_output": {
    "feature_vector": {
      "S": "float (-1.0 to 1.0)",
      "C": "float",
      "X": "float",
      "O": "float",
      "L": "float",
      "A": "float"
    },
    "domain_detected": "foundation | motion | interior | relation | threshold | none",
    "spread_shape": "coherent | tensioned",
    "major_tier": "0 | 1 | 2 | 3",
    "cards": [
      {
        "position": "past | present | future",
        "card_id": "string (e.g., 'the_emperor')",
        "card_name": "string (e.g., 'The Emperor')",
        "card_orientation": "upright | reversed",
        "majorscore": "float (0.0 to 1.0, intensity on primary axis)",
        "matchscore": "float (0.0 to 1.0, polarity match confidence)",
        "matchscore_band": "commit | exploratory | abstain",
        "second_best_card_id": "string",
        "margin_score": "float"
      }
    ],
    "status": "ok | needs_more_input"
  },

  "stage_b_input": {
    "NOTE": "Stage B receives ONLY this subset — no transcript, no feature vector, no raw scores",
    "spread_shape": "coherent | tensioned",
    "major_tier": "0 | 1 | 2 | 3",
    "cards": [
      {
        "position": "past | present | future",
        "card_id": "string",
        "card_name": "string",
        "card_orientation": "upright | reversed",
        "matchscore_band": "commit | exploratory | abstain"
      }
    ],
    "scarcity_mode": "strict | relaxed",
    "ontology_version_id": "string"
  },

  "stage_b_output": {
    "interpretation_id": "string (UUID)",
    "cache_hit": "boolean",
    "reading_text": "string",
    "hollow_flag": "boolean | null (null until evaluated)"
  },

  "session_metadata": {
    "created_at": "ISO 8601 timestamp",
    "stage_a_latency_ms": "integer",
    "stage_b_latency_ms": "integer",
    "total_latency_ms": "integer",
    "model_provider": "string",
    "model_id": "string"
  }
}
```

**Notes:**
- `user_id_hash` is hashed at the application layer before storage. Raw user ID is never persisted in the session record.
- `transcript_hash` allows deduplication and cache key construction without storing the transcript in the contract.
- `hollow_flag` is null at session creation and populated by a rater during evaluation. It is not produced by Stage B.
- `ontology_version_id` is stamped at session creation. If the ontology changes, old sessions retain their version reference.

---

## Minimal Telemetry Event Set

Telemetry is structured log lines. Not a metrics platform — structured JSON events written to an append-only log. These events must be designed in from the start; retrofitting telemetry onto a live system is expensive and produces gaps in calibration data.

### Required events

**`session.started`**
```json
{
  "event": "session.started",
  "session_id": "...",
  "user_id_hash": "...",
  "timestamp": "...",
  "scarcity_mode": "strict | relaxed",
  "ontology_version_id": "..."
}
```

**`stage_a.complete`**
```json
{
  "event": "stage_a.complete",
  "session_id": "...",
  "timestamp": "...",
  "latency_ms": "...",
  "domain_detected": "...",
  "spread_shape": "...",
  "matchscores": [{"position": "...", "card_id": "...", "card_orientation": "...", "matchscore": "...", "matchscore_band": "..."}],
  "arcana_gate_passed": "...",
  "status": "ok | needs_more_input",
  "model_provider": "...",
  "model_id": "..."
}
```

**`stage_b.complete`**
```json
{
  "event": "stage_b.complete",
  "session_id": "...",
  "timestamp": "...",
  "latency_ms": "...",
  "interpretation_id": "...",
  "cache_hit": "...",
  "model_provider": "...",
  "model_id": "..."
}
```

**`session.complete`**
```json
{
  "event": "session.complete",
  "session_id": "...",
  "timestamp": "...",
  "total_latency_ms": "..."
}
```

**`calibration.evaluated`** *(populated post-session by a human rater)*
```json
{
  "event": "calibration.evaluated",
  "session_id": "...",
  "timestamp": "...",
  "hollow_flag": "boolean",
  "appropriateness_label": "appropriate | inappropriate | uncertain",
  "axis_alignment_scores": [{"position": "...", "score": "0 | 1 | 2"}],
  "spread_coherence_score": "0 | 1 | 2",
  "rater_id": "..."
}
```

**`scarcity.blocked`** *(when warm no is triggered)*
```json
{
  "event": "scarcity.blocked",
  "session_id": "...",
  "user_id_hash": "...",
  "timestamp": "...",
  "scarcity_mode": "strict"
}
```

### Calibration dashboard requirements

The product team's calibration dashboard requires these fields to be queryable per session:
- `matchscore_band` per card (from `stage_a.complete`)
- `hollow_flag` (from `calibration.evaluated`)
- `scarcity_mode` (from `session.started`)
- `ontology_version_id` (from `session.started`)
- `cache_hit` (from `stage_b.complete`)
- `appropriateness_label` (from `calibration.evaluated`)

These are all present in the events above. The dashboard is a read query against the telemetry log — no separate data pipeline required for V0.

---

## Determinism Implementation

Determinism is a hard architectural requirement. Same transcript → same feature vector → same card selection → same interpretation text, every time.

### Stage A determinism
- LLM call must use `temperature=0` (or nearest equivalent — some providers call this `top_p=0` or `greedy decoding`).
- System prompt must be fixed and versioned. If the system prompt changes, Stage A outputs may change for the same transcript. System prompt is part of the ontology version.
- Post-processing (cosine similarity, weighting, Arcana Gate) is arithmetic — deterministic by construction.
- Tie-breaking (equal similarity scores for two cards) must use a deterministic rule: alphabetical by card_id. Document this rule; do not rely on LLM outputs to break ties.
- Domain detection must be deterministic. If Stage A uses an LLM call to detect domain, that call must also be at `temperature=0`.

### Stage B determinism
- Same constraint: `temperature=0`.
- With caching: Stage B is deterministic by cache key lookup. A cache hit guarantees identical output.
- Without cache: Stage B at `temperature=0` should produce identical output for identical input, but this depends on provider guarantees. See provider evaluation in D-2.

### Determinism verification
- Include determinism as a required check in the CI pipeline: run the same test transcript through the full pipeline twice and assert output identity.
- The golden test vector sprint provides the ground truth for this check.

### Risk: provider non-determinism
Some providers do not guarantee identical outputs at `temperature=0` across different infrastructure runs (batching, hardware variation). This is the most significant determinism risk. See D-2 for mitigation.

---

## Encryption and Data Posture

### Current posture (V0 calibration phase)
Per CEO direction (ontology-revision.md, 2026-02-21): transcripts and all session artifacts are retained during V0 calibration. This supersedes the deletion-first posture until calibration is sufficient.

### Encryption at rest
All stored session data must be encrypted at rest:
- Transcripts: AES-256 encryption, per-user key
- Session records: AES-256, database-level encryption minimum
- Telemetry logs: encrypted at rest; readable by calibration tooling only
- Key management: a secrets manager (e.g., AWS KMS, Vault) should be used from day one even for V0 — retrofitting key management is painful

### Encryption in transit
- TLS 1.3 for all API calls (Stage A, Stage B, application layer)
- No plaintext transcript or session data transmitted over any channel

### Future: client-side encryption
If client-side or zero-knowledge encryption is desired post-V0 (user holds their own key), the pipeline architecture is compatible. Stage A would run server-side on the decrypted transcript and immediately re-encrypt the feature vector. This is additive — no architectural change required.

### Data posture reversion
When calibration is complete (MatchScore reliability diagram reaches ≥70% appropriate at Commit band), the posture reverts:
- Transcripts: deleted after Stage A completes
- Session records: retain spread, interpretation, MatchScore, ontology version ID, calibration metadata
- Telemetry logs: retain events, strip raw transcript references

The application layer must support a configurable retention policy that can be switched without code changes.

---

## Scalability Constraints

### V0 (friend testing, 10–50 users)
No significant scaling concerns. A single-instance application server and a managed database (SQLite or PostgreSQL) handle this load trivially. Focus on correctness, not scaling.

### V1 (100–1,000 users)
- Rate limiting: one reading per user per day (strict mode) caps API calls at user count. At 1,000 users/day, this is well within standard API rate limits.
- Stage B cache: becomes meaningful at this scale. A simple Redis or in-memory LRU cache keyed by the schema above handles this load.
- Database: PostgreSQL with indexed telemetry events. No horizontal scaling needed.
- Latency target: <10 seconds end-to-end for uncached; <3 seconds with Stage B cache hit. Both are achievable with current API latencies.

### Latency ceiling
Based on current model API latencies:

| Scenario | Stage A | Stage B | Total |
|---|---|---|---|
| Uncached, fast provider | 1–2s | 3–6s | 4–8s |
| Uncached, slow provider | 2–4s | 5–10s | 7–14s |
| Stage B cache hit | 1–2s | <0.1s | 1–2s |

A 10-second uncached ceiling is acceptable for V0 (friend testing). If users consistently experience >10 seconds, Stage B caching should be prioritized.

### Ontology as infrastructure
A change to the ontology version (card coordinates, keywords, system prompt) is functionally equivalent to a schema migration:
- All active sessions must complete under the old ontology version
- Cached Stage B outputs must be invalidated for affected card IDs
- Telemetry logs must record the ontology version at session creation
- Golden test vector results are version-specific — rerun on new version

Plan for at least one ontology version change in V0. Make version management automatic, not manual.

---

## Risk Table

| Risk | Likelihood | Severity | Mitigation |
|---|---|---|---|
| Provider non-determinism at temperature=0 | Medium | High | Determinism test in CI; cache hit guarantees determinism for cached paths |
| Provider pricing change makes costs unacceptable | Medium | Medium | Provider abstraction layer; fallback tiers (D-2) |
| Stage B latency exceeds 10s for uncached | Low–Medium | Low | Stage B caching; latency monitoring; smaller model fallback |
| Ontology version change invalidates cache silently | Medium | Medium | Automated cache invalidation keyed to ontology_version_id |
| Calibration telemetry gap (hollow_flag not populated) | Medium | High | Hollow flag is rater-populated; requires calibration sprint discipline, not infrastructure |
| Transcript data breach during calibration retention period | Low | High | Encryption at rest (AES-256), per-user keys, key manager from day one |
| Scarcity bypass (user submits multiple readings) | Low | Low | Session layer enforcement; user_id_hash per reading per day; scarcity_mode logged for audit |
