# System Sketch — V0 and Beyond
**Owner:** Petra Voss — Systems Architect
**Date:** 2026-02-21
**Status:** First pass
**Feeds:** Product team research questions; engineering handoff

---

## V0 Architecture

### Component Map

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER                                     │
│                   (submits transcript)                          │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                             │
│                                                                 │
│  • Authentication / identity (user_id_hash)                    │
│  • Scarcity enforcement (strict | relaxed)                     │
│  • Transcript normalization (trim, case, whitespace)           │
│  • Session creation + session_id                               │
│  • Telemetry event logging                                     │
│  • Warm no routing (scarcity block → return immediately)       │
│  • Stage B cache lookup                                        │
│  • Response delivery to user                                   │
│  • Data storage (session records, telemetry log)               │
└─────────┬──────────────────────────┬────────────────────────────┘
          │                          │
          │ normalized transcript    │ spread contract (no transcript)
          ▼                          ▼
┌──────────────────┐      ┌──────────────────────────────────────┐
│    STAGE A       │      │           STAGE B CACHE              │
│                  │      │                                      │
│  LLM (temp=0)   │      │  Key: card_id + orientation +        │
│                  │ ───► │  spread_shape + matchscore_band +    │
│  • Axis feature  │      │  position + major_tier               │
│    extraction    │      │                                      │
│  • Domain detect │      │  Hit → return cached interpretation  │
│  • Cosine sim    │      │  Miss → call Stage B                 │
│  • Arcana Gate   │      └───────────────┬──────────────────────┘
│    (MajorScore)  │                      │ cache miss
│  • Orientation   │                      ▼
│    (up/reversed) │      ┌──────────────────────────────────────┐
│  • MatchScore    │      │              STAGE B                 │
│  • Spread shape  │      │                                      │
│                  │      │  LLM (temp=0)                       │
│  Output:         │      │                                      │
│  spread contract │      │  Input: spread contract ONLY        │
│  (see schema)    │      │  (no transcript, no feature vector)  │
└──────────────────┘      │                                      │
                          │  • Voice per Amara's spec            │
                          │  • Anchored to card image            │
                          │  • Register by Arcana type +         │
                          │    spread shape + MatchScore band     │
                          │  • P/P/F structure                   │
                          │                                      │
                          │  Output: reading text per card       │
                          └──────────────────────────────────────┘
```

### Data Stores

```
┌─────────────────────────────────────────────────────────────────┐
│                       DATA STORES (V0)                          │
│                                                                 │
│  SESSION STORE (PostgreSQL)                                     │
│  • session_id, user_id_hash, ontology_version_id               │
│  • transcript (retained during calibration phase)              │
│  • feature_vector, domain_detected, spread, major_tier         │
│  • interpretation, hollow_flag (null until evaluated)          │
│  • matchscores, majorscore per card                            │
│  • scarcity_mode, timestamps, latencies                        │
│                                                                 │
│  TELEMETRY LOG (append-only structured JSON)                   │
│  • session.started, stage_a.complete, stage_b.complete         │
│  • session.complete, calibration.evaluated, scarcity.blocked   │
│  • Queryable by calibration dashboard                          │
│                                                                 │
│  STAGE B CACHE (Redis or in-memory LRU)                        │
│  • Key: (card_id, orientation, spread_shape,                   │
│          matchscore_band, position, major_tier)                │
│  • Value: interpretation text                                  │
│  • Invalidated on ontology_version_id change                   │
│                                                                 │
│  ONTOLOGY STORE (versioned JSON files, git-managed)            │
│  • Card catalog (dispersion-map)                               │
│  • Similarity weights                                          │
│  • Stage A system prompt                                       │
│  • Stage B system prompt                                       │
│  • MajorScore and MatchScore thresholds                        │
│  • Version ID embedded in all session records                  │
└─────────────────────────────────────────────────────────────────┘
```

### External Dependencies (V0)

```
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL DEPENDENCIES                         │
│                                                                 │
│  AI PROVIDER (primary: Anthropic Claude)                       │
│  • Stage A calls: feature extraction, domain detection          │
│  • Stage B calls: interpretation generation (cache misses)     │
│  • Provider abstraction layer wraps all calls                   │
│  • temperature=0 enforced at abstraction layer                  │
│                                                                 │
│  (Post-V0: secondary provider, self-hosted Stage B)            │
└─────────────────────────────────────────────────────────────────┘
```

### Key Seams

| Seam | What crosses it | What does not |
|---|---|---|
| User → Application Layer | Raw transcript (HTTPS, encrypted in transit) | — |
| Application Layer → Stage A | Normalized transcript | User identity |
| Stage A → Application Layer | Spread contract (JSON) | Transcript |
| Application Layer → Stage B | Spread contract (JSON) | Transcript, feature vector, raw scores |
| Stage B → Application Layer | Reading text | — |
| Application Layer → Stage B Cache | Cache key lookup | Transcript |
| Application Layer → Session Store | Full session record (transcript retained in calibration) | — |

The transcript reaches Stage A and the session store only. It never reaches Stage B.

---

## V0 Data Flow (Narrative)

1. User submits a transcript via HTTPS.
2. Application layer authenticates, checks scarcity. If strict mode and user has a reading today: return warm no immediately.
3. Application layer normalizes the transcript (trim, case, whitespace).
4. Application layer creates a session record with a new session_id, logs `session.started`.
5. Application layer calls Stage A with the normalized transcript.
6. Stage A: extracts 6-axis feature vector, detects domain, applies weighted cosine similarity, applies tiered Arcana Gate, determines card orientations, computes MatchScore per card, determines spread shape. Returns spread contract JSON.
7. Application layer receives spread contract. Logs `stage_a.complete`. Builds Stage B cache key.
8. Cache lookup: hit → skip Stage B call, retrieve cached interpretation. Miss → call Stage B.
9. Stage B (if called): receives spread contract only. Generates P/P/F reading per Amara's voice spec. Returns reading text.
10. Application layer: logs `stage_b.complete`. Stores full session record. Returns reading to user.
11. Post-session (async, by a rater): `calibration.evaluated` event populated with hollow flag and appropriateness label.

---

## Calibration Loop

```
Golden test vector sprint
        ↓
100 labeled transcripts (appropriateness rubric)
        ↓
Run through pipeline → compare card selections to labels
        ↓
Plot MatchScore reliability diagram (band vs. % labeled appropriate)
        ↓
Adjust MatchScore thresholds if needed
        ↓
Plot MajorScore reliability diagram (tier vs. % labeled at life scale)
        ↓
Adjust MajorScore tier thresholds if needed
        ↓
Repeat with live friend-pilot readings
        ↓
Target: ≥70% of Commit-band readings labeled appropriate
        ↓
When target met → revert transcript retention to deletion-first
```

---

## V0 → Post-V0 Evolution Path

### What changes when we add longitudinal data

Currently: no user history. Stalker card language applies only within a session window.

Post-V0 (longitudinal): the session store accumulates readings per user over time. This unlocks:
- **True stalker card detection:** same card across multiple calendar days → stalker card language escalates
- **Tension map:** if a user consistently shows Tensioned spreads on the same two axes, the system can name the ongoing tension
- **Pattern reading frame:** a new reading type that reflects on a window of past readings (requires post-V0 UX and voice design)

**Architectural requirement:** User identity must be stable across sessions (a real user account, not just a session ID). V0 may use a device token; post-V0 requires proper authentication with a persistent user ID. This is the single largest architectural difference between V0 and a longitudinal system.

### What changes when we add custom decks

Currently: 18 Rider-Waite cards are the ontology. Ilya owns the card catalog.

Post-V0 (custom decks): users can define their own card sets, with their own polarity coordinates. The ontology store becomes multi-tenant: a global ontology (Rider-Waite V0) and per-user or per-deck ontologies.

**Architectural requirement:** Every system prompt, similarity weight table, and card catalog reference must be parameterized by ontology_version_id. This is already true in V0 (the version ID is stamped on all session records). Extending to custom decks means the ontology store needs to be queryable by (user_id, deck_id) rather than just version_id.

### What changes when Stage A is fine-tuned

Currently: Stage A uses a general-purpose LLM for feature extraction.

Post-V0: a fine-tuned model trained on the golden test vector corpus (transcript → feature vector ground truth) replaces or augments the general-purpose LLM. This model is smaller, faster, cheaper, and more consistently accurate on this specific task.

**Architectural requirement:** The provider abstraction layer must support custom model endpoints. The fine-tuned model may be self-hosted. The determinism requirement still applies; fine-tuned models at inference-time temperature=0 are deterministic within a fixed model version.

### What changes when we move to deletion-first

Post-calibration: the session store stops retaining transcripts. The retention policy becomes configurable without code changes (a flag in the application layer).

**Architectural requirement:** The application layer must have a configurable retention policy that can flip without a deployment. The session store must support a transcript pruning job that runs on a schedule (not a manual deletion).

---

## Open Architectural Questions

These are not decided here. They are flagged for the product team's research.

1. **User identity in V0:** Device token or account? The choice has implications for longitudinal data post-V0 and for the privacy posture (an account is more persistent, more valuable, and a bigger privacy surface).

2. **Stage B cache warming strategy:** Who generates the initial cache entries for the 18 cards × 2 orientations × 2 spread shapes × 3 MatchScore bands × 3 positions × 4 major tiers = up to ~864 combinations? The golden test vector sprint generates some. Does the team need a cache-warming script?

3. **Calibration dashboard tooling:** The telemetry log needs to be queryable. Does V0 need a proper dashboard tool (Metabase, Redash), or is a read-query script against the log sufficient for friend testing scale?

4. **Ontology version governance:** When the card catalog changes, how is the new version approved, deployed, and announced to the team? This is the Canon Constitution question (N-1).

5. **The philosophical fork:** If users consistently report card selections as "not feeling right" despite geometric correctness, what changes first — geometry weights, voice, or ontology? The system needs a feedback mechanism before this question can be answered empirically.

---

## Product Team Research Questions

The following questions should be deep-researched by each product team member. They are based on the architecture above and represent the gaps that block or shape the V0 build.

---

### Head of Product

**Context:** You operationalize the creative team's constraints into measurable outcomes and governance. The system sketch above defines the components; your job is to define what done looks like and how decisions about the system are made.

1. **V0 Definition of Done:** What are the measurable criteria for V0 to be considered complete? Define across three dimensions: (a) calibration quality — what MatchScore reliability curve target do we need to ship?, (b) system correctness — what determinism test pass rate is required?, (c) ritual integrity — how do we verify the warm no, stalker card, and voice constraints are implemented correctly?

2. **Canon Constitution operationalization:** The Canon Constitution (N-1) defines versioning rules and change governance for the ontology. What does this look like as an operational workflow? Who proposes a change, who reviews it, what is the approval chain, and what happens to live sessions when an ontology version is bumped?

3. **Calibration dashboard requirements:** The calibration dashboard must support the decisions: (a) are MatchScore thresholds correctly calibrated?, (b) is the hollow flag rate acceptable?, (c) is the MajorScore tier distribution matching the intended life-scale mapping? What does this dashboard need to show, and who uses it and when?

4. **Decision log structure:** You are responsible for the decision log that keeps governance choices legible over time. What is the minimum viable decision log format? What decisions must be logged (ontology versions, threshold changes, data posture transitions), and what tooling supports this without becoming overhead?

---

### ML Product Lead

**Context:** You own the evaluation framework — the golden test vector set, the labeling workflow, the MatchScore reliability diagram, and the MajorScore tier calibration. The system's quality is only as good as your ability to measure it.

1. **Golden test vector labeling workflow:** 100 transcripts need to be labeled against the appropriateness rubric (Ilya's appropriateness-note.md). Who does the labeling (CEO, creative team, external raters)? What is the labeling interface (spreadsheet, custom tool)? How are rater disagreements resolved? What is the minimum inter-rater agreement required before the dataset is considered trustworthy?

2. **MatchScore reliability diagram — methodology:** Once the golden test vector set is labeled, how do you compute the reliability curve? What is the binning strategy for MatchScore? What sample size is needed in each bin for the curve to be statistically meaningful? Given the dataset is 100 transcripts total, are the bins large enough for V0 calibration, or should the sprint be expanded?

3. **MajorScore tier calibration:** The three tiers (0.70, 0.83, 0.92) are priors. To calibrate them, raters need to assess: for each spread in the golden test vector set, does the life scale of the transcript match the tier prediction? What label schema do raters apply (life scale rating 1–5? categorical?), and how do you convert those labels into threshold adjustments?

4. **Stage A failure detection:** If Stage A produces systematically wrong feature vectors for a class of transcript (e.g., transcripts about relationships consistently map to the wrong axis), this contaminates the calibration dataset before you know it. What is the protocol for detecting Stage A extraction errors before they cascade? Does the golden test vector set need to include Stage A feature vector ground truth, not just card selection ground truth?

5. **Hollow rate as a quality signal:** The hollow flag is rater-populated post-session. Once you have enough labeled readings, what is the acceptable hollow rate at the Commit band? If the hollow rate is too high, which component is failing — Stage A (wrong card selected) or Stage B (correct card, hollow interpretation)? How do you diagnose which component is the source?

---

### UX Product Designer

**Context:** You own how governance decisions appear at the surface. The architecture above gives you the behavioral rules; your job is to make them feel intentional and human.

1. **Full user journey map:** From transcript submission to receiving a reading — including all edge cases — what is the complete interaction sequence? Specifically: (a) What happens while Stage A and Stage B are running (latency up to 10 seconds uncached)? (b) How does the warm no manifest — same surface as the reading, or different? (c) How does the exploratory register (two-interpretation structure) appear? (d) How does the stalker card recurrence note appear within a reading?

2. **Major Arcana tier surface treatment:** The three Major Arcana tiers signal meaningfully different life scales (once a quarter vs. defining life moment). Does a 3-Major spread look different from a 1-Major spread to the user? If so, how? Options range from no visual distinction (the voice carries the weight) to subtle surface signals (slower reveal, more silence, different typography). Research: what precedents exist in contemplative digital experiences for signaling gravity without spectacle?

3. **Onboarding for friend testing:** V0 users are friends and testers. They need to understand: (a) what the product is and isn't (not an oracle, a deterministic symbolic mirror), (b) that transcripts are retained during this phase for calibration, (c) what a reading looks like before they submit their first transcript. What is the minimum viable onboarding that sets correct expectations without breaking the ritual? Research: what do the best ritual/contemplative onboarding experiences do?

4. **Scaffolding layer design:** The voice spec references expandable explanations and progressive disclosure as future features. For V0, what is the minimum scaffolding that helps a new user understand what they received — without explaining the geometry or breaking the sacred minimalism? The warm no language is one example of scaffolding. What other moments in the experience need scaffolding, and what form should it take?

---

### Data & Privacy Lead

**Context:** You own the data posture lifecycle — from calibration retention back to deletion-first, and everything in between. The architecture above defines what is stored; your job is to define how, for how long, and with what protections.

1. **Calibration retention → deletion-first transition:** The current posture retains transcripts during V0 calibration. What triggers the transition back to deletion-first, and what does the transition process look like? Specifically: (a) What is the technical mechanism (a configurable flag, a deployment change, a database migration)? (b) What happens to transcripts that were retained during calibration — are they deleted, anonymized, or archived? (c) Who authorizes the transition?

2. **Informed consent for V0 users:** V0 users (friends and testers) are submitting emotional transcripts that are being retained for calibration. What does informed consent look like for this population — a terms-of-service screen, a verbal explanation, something else? Research: what do the best privacy-forward products do for informed consent in a testing phase? What are the legal minimums, and what is the ethical standard above the minimum?

3. **Export and ethical exit pathway:** If a user wants to know what data the system holds about them, or wants to delete their data, what does that pathway look like? What data does a user receive in an export (reading history, spread data, interpretation text — but not necessarily the feature vectors)? How is deletion handled (immediate purge vs. anonymization vs. scheduled deletion)?

4. **Ontology version in stored sessions:** When the ontology version changes, past sessions reference a version that may no longer be current. How are past readings interpreted in light of a new ontology version? Should past sessions be re-run under the new version, archived as-is, or annotated with a "this reading was generated under ontology vX" note? Research: what do similar systems (music recommendation, content personalization) do when their underlying model changes?

---

### Infrastructure Lead

**Context:** You implement the system the architect has sketched. Your research should focus on the concrete technical decisions that block the first commit.

1. **Provider abstraction layer — implementation pattern:** The abstraction layer must wrap all AI model calls with a common interface (as specified in Daniel's provider-fallback-scope.md). What is the right pattern for V0 — a thin wrapper class, a library (e.g., LangChain, LiteLLM), or a custom implementation? Research: what are the tradeoffs between off-the-shelf provider abstraction libraries and a custom implementation for this system's requirements (temperature=0 enforcement, structured JSON output, telemetry logging per call)?

2. **V0 deployment target:** What is the right hosting environment for V0 (friend testing, 10–50 users)? Options include: a single managed cloud server (e.g., Railway, Render, Fly.io), a serverless architecture (e.g., Vercel + managed database), or a self-hosted VPS. Research the tradeoffs for: (a) cold start latency (important for a 10-second ceiling), (b) ease of deployment and iteration, (c) cost at V0 scale, (d) upgrade path to V1.

3. **Stage B cache implementation:** The cache key is (card_id, orientation, spread_shape, matchscore_band, position, major_tier). For V0 scale, what is the right cache backend — Redis, an in-memory LRU cache, or something simpler? What is the cache warming strategy — manual pre-generation of all 864 possible combinations, lazy warming as readings occur, or a combination? How does cache invalidation work on ontology version bump?

4. **Telemetry infrastructure:** The calibration dashboard requires the telemetry log to be queryable by (matchscore_band, hollow_flag, scarcity_mode, ontology_version_id). For V0 scale, what is the right telemetry infrastructure — a structured log file queried with jq/DuckDB, a lightweight managed analytics tool, or a proper time-series store? The calibration dashboard does not need real-time — batch queries are fine. Research: what is the simplest queryable telemetry setup that a small team can operate without a dedicated data engineer?

5. **Determinism test in CI:** The CI pipeline must include a determinism check: run the same test transcript through the full pipeline twice and assert output identity. What does this test look like technically? What are the failure modes (provider non-determinism, non-deterministic tie-breaking, prompt version mismatch), and how does the test surface each one?
