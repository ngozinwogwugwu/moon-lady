# Deep Research: Implementation Questions (V0)

1. What is the definition of "done" for the V0 reading experience — what must a user be able to do end-to-end?
2. Who reviews and approves the 18-card ontology before it is locked?
3. What is the acceptance criteria for the MajorScore threshold — how do we know it is calibrated correctly?
4. What happens when a user's transcript is too short, ambiguous, or contains no discernible signal?
5. What is the minimum viable interpreter prompt — what inputs does Stage B receive, and what format does it return?
6. How is "one reading per day" enforced at the architecture level — session, device, or account?
7. What telemetry is strictly necessary for V0, and who has access to it?
8. What is the exact handoff package engineering receives — JSON schemas, sample spreads, prompt spec?
9. What are the criteria for declaring V0 ready for live testing?
10. Which lunar or seasonal events, if any, are in scope for the first post-MVP release?

# Deep Research on V0 Implementation Questions

## Scope and working assumptions

The questions reference a “reading” product surface, an “18-card ontology,” a “MajorScore threshold,” a multi-stage interpreter (“Stage B”), and a “one reading per day” constraint. Because no internal PRD, ontology document, or pipeline spec was provided, the research below is structured as (a) what is _knowable_ from external, well-established engineering and ML practices and (b) a concrete, implementation-ready _proposal template_ that can be adopted as the V0 spec and then finalized by your internal approvers. citeturn17view0turn35view0turn14view0turn12view0

Where I make a recommendation (e.g., “enforce at the account level”), it is grounded in security guidance that critical controls must be enforced server-side and in API guidance that per-user throttles should be supported; these recommendations are not claims about your current system, but a best-practice design to answer the implementation questions with minimal ambiguity. citeturn13view0turn27view0

## Definition of “done” for the V0 reading experience

### What “done” should mean

A rigorous “Definition of Done” is a shared, explicit statement of the state a deliverable reaches when it meets the _quality measures required for the product_, and work is not considered part of a releasable increment unless it meets this definition. citeturn17view0

To keep V0 tight, define “done” at two levels:

- **User-level done (end-to-end capability):** what the user can complete start-to-finish in production-like conditions.
- **System-level done (quality + operability):** reliability, security, monitoring, error handling, and release controls expected for early live testing. citeturn17view0turn16view0turn14view0

### Question 1: What must a user be able to do end-to-end?

A practical, testable “V0 reading done” can be defined as the user being able to complete **one full reading lifecycle** without staff intervention:

The user can:

1. **Initiate a reading** (e.g., tap “Start today’s reading”), and the system determines eligibility (including the “one per day” guardrail). citeturn27view0turn13view0
2. **Provide the input that drives the reading** (e.g., transcript text, or audio that becomes a transcript), and receive clear handling if the input is insufficient (see the low-signal section). citeturn33view0turn32view0turn18view0
3. **Receive a structured reading result** that is consistent with the locked ontology (e.g., one selected card or a small spread), including enough explanation to be meaningful, and a stable identifier so the result can be shown again later. citeturn18view0turn23view0turn35view0
4. **View the reading in the intended UI format** (cards, titles, text blocks), where the UI is driven by a predictable schema rather than brittle free-form parsing. citeturn18view0turn23view0
5. **Return later the same day and see the same reading**, with the system preventing accidental duplicates through idempotency and/or server-side gating. citeturn28view0turn13view0

This definition is intentionally outcome-oriented (the user can do the end-to-end flow) while still aligning with the engineering principle that “done” is tied to explicit quality measures and shared expectations. citeturn17view0turn16view0

### Question 9: Criteria for declaring V0 ready for live testing

A credible “ready for live testing” bar for V0 is less about feature completeness and more about **controlled rollout + observability + safety of failure**:

- **Release control exists:** staged rollout / canary capability, and the ability to stop or roll back quickly if metrics degrade. The Google SRE launch checklist explicitly calls out “canaries under live traffic” and “staged rollouts” as part of reliable launches. citeturn14view0
- **Capacity and failure behaviors are understood:** rate limiting, timeouts, retries, and “what happens when X fails” are explicitly designed and tested. citeturn14view0turn27view0
- **Evaluation exists for model-driven parts:** because generative/LLM systems are nondeterministic, you need task-specific evals, logged cases, and (where appropriate) human judgment to validate quality and calibrate automated scoring. citeturn12view0
- **Security basics are in place:** server-side enforcement of business-critical controls (eligibility, quotas), and secure logging/access controls. citeturn13view0turn11view0
- **Minimal monitoring is shipped:** enough telemetry to detect breakage and regressions (details in the telemetry section), consistent with data minimization. citeturn14view0turn20view0

If you need a single operationally testable statement: **V0 is ready for live testing when you can safely expose it to a small cohort, detect harmful regressions quickly, and halt/roll back without data corruption or runaway cost.** citeturn14view0turn12view0turn27view0

## Review and approval of the 18-card ontology

### What an ontology “lock” implies

An ontology is a shared vocabulary of concepts and relations that enables consistent interpretation and reuse; the value (and risk) of locking it is that it becomes the **contract** used by downstream systems, evaluations, and user-visible outputs. citeturn35view0

The W3C’s ontology engineering best-practices efforts explicitly frame ontology engineering as an area with reusable patterns and “best practices,” underscoring that governance is part of successful ontology deployment, not just taxonomy design. citeturn39view0

### Question 2: Who reviews and approves the 18-card ontology before it is locked?

Because this is organization-specific, the only defensible “deep research” answer is a **recommended governance model** that is consistent with (a) product accountability for value and (b) domain-expert validation for correctness.

A workable V0 approval chain is:

- **Accountable approver (single throat to choke):** the product owner / product lead should be accountable for the product’s value decisions, including whether the ontology matches intended user outcomes and positioning. The Scrum Guide makes the Product Owner accountable for maximizing product value (even if others do the work), which is a useful governance analogy for ontology lock decisions. citeturn17view0
- **Domain correctness reviewers:** at least one domain expert (or an internal “content/interpretation” lead) should validate that each of the 18 concepts is semantically distinct, non-overlapping enough to be useful, and aligned to the intended reading experience. Ontologies are explicitly positioned as moving to the “desktops of domain experts,” and the biomedical ontology literature demonstrates domain expert review being used to assess correctness of ontology concepts and relationships. citeturn35view0turn38view0
- **Technical contract reviewers:** an engineering representative (and, if applicable, ML/NLP) should review for implementability: stable IDs, versioning, and whether the ontology supports evaluation and structured outputs cleanly. citeturn18view0turn23view0
- **Safety/privacy reviewer (as-needed):** if ontology elements drive sensitive inference or store user-derived attributes, require privacy/security review on the telemetry and retention implications, guided by minimization and least-privilege access. citeturn20view0turn21view0turn11view0

A concrete “lock” artifact should include at minimum:

- `ontology_version` (semantic versioning or date-based)
- stable `card_id` values (never reused)
- human-readable names and descriptions
- allowed relationships (if any) among cards (often V0 can have none to reduce complexity)
- deprecation policy (ideally: “no deletions in V0; only add in post-MVP versions”) citeturn35view0turn23view0

## Acceptance criteria for the MajorScore threshold

### Why “threshold acceptance” is a calibration problem, not a gut-feel problem

If MajorScore is used to decide whether the system is confident enough to commit to a card/spread (or to abstain / ask clarifying questions), then a threshold is only defensible if:

1. The score is meaningfully calibrated as a confidence signal, and
2. The threshold yields acceptable tradeoffs between false positives (confident but wrong) and false negatives (unnecessarily abstaining), and
3. The decision remains stable as distributions shift (new users, new topics, different transcript quality). citeturn29view0turn30view0turn12view0

### Question 3: How do we know MajorScore threshold is calibrated correctly?

A strong acceptance criteria package has **three layers**: calibration quality, decision quality, and production monitoring.

#### Calibration acceptance (score ↔ reality alignment)

If MajorScore is intended to behave like a probability/confidence, “well-calibrated” means: among items scored near 0.8, about 80% are actually correct (or judged acceptable). This exact interpretation is how calibration is defined in standard ML tooling documentation. citeturn29view0

Minimum acceptance checks:

- Produce a **reliability diagram / calibration curve** on a held-out labeled set and ensure monotonic alignment (no pathological “high score but low correctness” regions). citeturn29view0
- If MajorScore is not well-calibrated, apply post-hoc calibration such as **sigmoid (Platt scaling)** or **isotonic regression**, with calibration fit on data disjoint from the model training set to avoid bias toward overconfidence. citeturn29view0turn1search0turn1search1

A key nuance: single-number scores like Brier loss combine calibration and discrimination terms, so use them carefully and preferably together with calibration curves rather than alone. citeturn29view0

#### Decision acceptance (threshold ↔ business and UX tradeoffs)

If the threshold drives a binary decision (commit vs abstain), evaluate:

- **Risk–coverage curve:** selective prediction formalizes the trade-off between _coverage_ (fraction of cases you answer) and _risk_ (error rate on answered cases). This is a standard framing: the system answers only when confidence exceeds a threshold, otherwise abstains. citeturn30view0
- Choose a target operating point like: “≥X% of answered readings are judged acceptable by humans, at ≥Y% coverage,” then pick the threshold that meets that. citeturn30view0turn12view0

If you need a threshold-selection heuristic (only as a starting point), ROC-based methods like maximizing **Youden’s J** are commonly used in diagnostic thresholding, but you still need to align it to your product’s asymmetric costs (wrong reading vs fewer readings). citeturn8search1

#### Production acceptance (calibration stays true after launch)

Because distributions drift, the acceptance criteria should also require:

- **Continuous evaluation:** evaluation is a continuous process; log cases, grow eval sets, and calibrate automated scoring against human judgment. citeturn12view0
- **Alerting on score drift:** monitor if the distribution of MajorScore shifts materially (e.g., suddenly most users fall below threshold, or suddenly everything is above). This aligns with launch guidance emphasizing monitoring and financially important logs/alerts. citeturn14view0turn11view0

## Handling transcripts that are too short, ambiguous, or have no signal

### Why short/low-signal inputs predictably break classification

Short texts are specifically challenging due to “semantic sparsity” and limited context, which leads to vagueness and ambiguity; this is a well-established finding in short text classification research and is directly relevant if you derive readings from brief transcripts. citeturn32view0

For audio-based input, you also have a quality gating problem: if there is little/no speech, downstream interpretation should not proceed as if the transcript were meaningful. Voice Activity Detection (VAD) is explicitly designed to detect speech segments vs non-speech and can return frame-level speech/non-speech decisions or boundaries. citeturn33view0

### Question 4: What happens in low-signal cases?

A V0-friendly answer is to define an explicit **abstain + recover** pathway, treated as a first-class product outcome, not an error.

A robust V0 behavior tree:

1. **No speech / meaningless audio** (audio pipeline): run VAD (or equivalent) to detect whether speech segments exist; if not, return a “no speech detected” outcome and prompt re-recording. citeturn33view0
2. **Transcript too short** (text pipeline): if below a minimum token/word count, treat as insufficient context and request more detail. Short text ambiguity is expected; don’t force a confident reading from a few words. citeturn32view0
3. **Transcript ambiguous / conflicting signals:** prefer abstention or a clarifying question rather than inventing specifics. Selective prediction explicitly supports abstaining when prediction is likely incorrect, trading coverage for reliability. citeturn30view0
4. **Transcript out-of-domain or poorly recognized** (speech/NLU): confidence scores can be used to accept or reject utterances in speech understanding systems; classic speech confidence scoring work frames rejection as preferable to producing lengthy incorrect responses. citeturn34view0

To make this implementable, define a structured output that can represent: `status = "ok" | "needs_more_input" | "no_signal" | "abstained"`, plus a `reason_code`. Structured outputs guidance explicitly warns that if user input is incompatible with the task/schema, models may hallucinate values unless you instruct them how to return empty parameters or a specific fallback response. citeturn18view0turn30view0

## Minimum viable Stage B interpreter prompt

### What “minimum viable prompt” means in modern LLM deployments

For LLM-based systems, prompts should be versioned/pinned and measured with evals, because nondeterminism makes traditional testing insufficient. The OpenAI prompt engineering guidance explicitly recommends pinning production to model snapshots and building evals to monitor prompt behavior over time. citeturn19view0turn12view0

Where possible, prefer a schema-constrained response rather than relying on fragile parsing: structured outputs are explicitly designed to ensure a model response adheres to your supplied JSON Schema so required keys/enums aren’t omitted/hallucinated. citeturn18view0turn23view0

### Question 5: What inputs Stage B receives, and what format it returns?

Below is a minimal, implementation-ready **Stage B contract** that keeps V0 small while addressing edge cases and evaluation needs.

**Stage B inputs (minimum viable):**

- `request_id`: unique ID for trace + idempotency alignment. citeturn28view0turn11view0
- `transcript_text`: the user transcript after preprocessing (or empty if low-signal). citeturn32view0turn18view0
- `ontology_version`: fixed string that maps to the locked 18-card set. citeturn35view0
- `candidate_cards`: output of Stage A (or heuristic fallback), including `card_id` and `major_score` (and optionally other signals). citeturn29view0turn30view0
- `policy`: includes `major_score_threshold` and any abstain rules. citeturn29view0turn30view0
- `context`: `user_locale`, `client_date` (important for daily reading semantics), and optionally `timezone`. citeturn14view0turn20view0

**Stage B outputs (minimum viable):**

- `status`: `"ok"` or an explicit fallback status. citeturn18view0turn30view0
- If `ok`: a `reading` object (selected cards + explanation + confidence metadata). citeturn18view0turn23view0
- If not `ok`: a `fallback` object with user-safe messaging + a reason code. citeturn18view0turn26view0

A minimal JSON Schema sketch for the **Stage B response** (illustrative; tighten enums to your ontology):

```json
{
  "type": "object",
  "required": ["status", "ontology_version", "request_id"],
  "properties": {
    "request_id": { "type": "string" },
    "ontology_version": { "type": "string" },
    "status": {
      "type": "string",
      "enum": ["ok", "needs_more_input", "no_signal", "abstained", "error"]
    },
    "reading": {
      "type": "object",
      "required": ["cards", "summary"],
      "properties": {
        "cards": {
          "type": "array",
          "minItems": 1,
          "items": {
            "type": "object",
            "required": ["card_id", "title", "major_score"],
            "properties": {
              "card_id": { "type": "string" },
              "title": { "type": "string" },
              "major_score": { "type": "number" },
              "evidence_spans": {
                "type": "array",
                "items": {
                  "type": "object",
                  "required": ["start_char", "end_char"],
                  "properties": {
                    "start_char": { "type": "integer", "minimum": 0 },
                    "end_char": { "type": "integer", "minimum": 0 }
                  }
                }
              }
            }
          }
        },
        "summary": { "type": "string" }
      }
    },
    "fallback": {
      "type": "object",
      "required": ["reason_code", "user_message"],
      "properties": {
        "reason_code": {
          "type": "string",
          "enum": [
            "TRANSCRIPT_TOO_SHORT",
            "NO_SPEECH",
            "AMBIGUOUS",
            "LOW_CONFIDENCE",
            "OTHER"
          ]
        },
        "user_message": { "type": "string" }
      }
    }
  }
}
```

This approach is aligned with: (1) using JSON Schema to describe JSON structure, (2) using structured outputs to force adherence, and (3) explicitly handling incompatible/low-signal inputs to avoid hallucinated structure. citeturn23view0turn18view0turn19view0

## Enforcing “one reading per day” at the architecture level

### Question 6: Is it enforced by session, device, or account?

From a security and integrity standpoint, enforce it **server-side at the account level** (or at least at a server-controlled user identifier level), because client-side controls can be bypassed, and critical authorization/transaction controls should be enforced on the server side. citeturn13view0

Additionally, API security guidance recommends limiting/throttling “how many times… a single API client/user can execute a single operation,” which maps directly onto “one reading per day.” citeturn27view0

A minimal V0 enforcement design:

- **Canonical key:** `(user_id, reading_day)` where `reading_day` is computed in a clearly-defined timezone rule (e.g., user timezone if known, else server default). citeturn14view0turn20view0
- **Hard constraint:** database unique constraint on `(user_id, reading_day)` so even concurrent requests can’t create duplicates. (This is the same class of robustness goal that idempotency systems aim for.) citeturn28view0turn13view0
- **Idempotency for retries:** require an idempotency key on “create reading” so network retries return the same reading rather than generating a second one. Stripe’s idempotency pattern (store the first result and replay it on retries) is a well-known reference implementation for this class of problem. citeturn28view0
- **Rate limiting as defense-in-depth:** add per-user endpoint-level throttles to prevent abuse and runaway cost, consistent with API resource-consumption guidance. citeturn27view0turn14view0

## Telemetry requirements, access control, and the engineering handoff package

### Question 7: What telemetry is strictly necessary for V0, and who has access?

Two external principles strongly constrain telemetry design:

- **Data minimization:** collect personal data that is adequate, relevant, and limited to what is necessary; don’t collect “on the off-chance” it is useful later. citeturn20view0
- **Least privilege:** restrict access privileges to the minimum necessary to accomplish assigned tasks. citeturn21view0

Security logging guidance also emphasizes that logs may contain sensitive/personal information, and privileges to read log data should be restricted and reviewed; access should be recorded and monitored. citeturn11view0

**Strictly necessary V0 telemetry (a minimal set):**

1. **Eligibility and flow integrity**
   - `reading_attempted` (yes/no), `reading_created` (yes/no), and a reason code if blocked (already read today, etc.). citeturn27view0turn13view0
2. **Pipeline health**
   - Stage A/Stage B latency, timeouts, error codes, and fallback status counts (e.g., `no_signal`, `needs_more_input`). citeturn14view0turn18view0
3. **Quality measurement hooks**
   - anonymized outcome labels where feasible: user thumbs-up/down, “show me another,” abandon rate, and a sampling mechanism to collect cases for evals (with privacy constraints). Logging as you develop so logs can become eval cases is explicitly recommended in evaluation best practices. citeturn12view0turn20view0
4. **MajorScore distribution monitoring**
   - histogram bucket counts (not raw text) to detect drift. This supports continuous evaluation without collecting more content than needed. citeturn12view0turn20view0

**Who should have access (V0 recommendation):**

- **Engineers on-call / service owners:** access to aggregated metrics and error traces necessary for reliability, bounded by least privilege. citeturn14view0turn21view0turn11view0
- **Product/UX:** access to aggregated funnel metrics and user feedback signals; avoid raw transcripts unless explicitly required and justified under minimization. citeturn20view0
- **ML/NLP:** access to a curated, consented, and minimized dataset for calibration/evals; keep a clear retention policy. citeturn12view0turn20view0

### Question 8: What is the exact handoff package engineering receives?

For V0, engineering handoff should be a **contract-first bundle**: schemas + prompts + test vectors + evaluation hooks.

A precise handoff package that reduces rework:

- **Ontology artifact**
  - `ontology.json` (18 cards) with stable IDs + `ontology_version`. citeturn35view0
- **Interface contracts**
  - JSON Schemas for:
    - Stage B input
    - Stage B output
    - “Create reading” API request/response
  - JSON Schema is explicitly a format for describing the structure of JSON data. citeturn23view0
- **API specification**
  - An OpenAPI 3.1 spec for the server endpoints, because OpenAPI is a language-agnostic interface description for HTTP APIs, and 3.1 aligns with JSON Schema draft 2020-12 (reducing schema mismatch between docs and validation). citeturn22view0
- **Error contract**
  - Use RFC 7807 “problem details” for machine-readable error responses so clients don’t need bespoke error formats, with attention to not leaking sensitive internals. citeturn26view0
- **Prompt spec**
  - Stage B prompt as a versioned asset:
    - system/developer instructions
    - required inputs (as above)
    - expected schema (structured output)
  - Include pinned model snapshot expectations and eval coverage requirements. citeturn19view0turn18view0turn12view0
- **Golden test vectors**
  - At least:
    - 10 “happy path” transcripts that map cleanly to cards
    - 10 ambiguous/short/no-signal cases
    - 5 adversarial-ish formatting cases (empty input, emoji-only, etc.)
  - This aligns with evaluation guidance to include typical, edge, and adversarial cases and to combine metrics with human judgment. citeturn12view0turn18view0turn32view0
- **Encoding requirements**
  - All JSON exchanged outside a closed ecosystem must be UTF‑8 encoded (so avoid accidental encoding drift across services). citeturn25view0

## Post-MVP lunar and seasonal events scope

### What “in scope” should mean for post-MVP

Because event-driven experiences often add complexity (scheduling, localization, calendar correctness, UI variants), “post-MVP scope” is best defined as the _smallest set of globally stable events_ that:

- are well-defined from authoritative sources,
- can be computed reliably for a user locale/timezone,
- and do not require heavy personalization to be meaningful. citeturn10search0turn10search2turn14view0

### Question 10: Which lunar or seasonal events, if any, are in scope for the first post-MVP release?

A defensible first post-MVP scope is:

**Lunar (recommended minimal set):**

- **Primary lunar phases:** New Moon and Full Moon as top-tier triggers; optionally add First Quarter and Third/Last Quarter if you want four evenly spaced anchors. NASA lists the lunar phases and notes the cycle repeats about every 29.5 days. citeturn10search0
- **Optional informational detail:** percent illumination definitions (e.g., New Moon 0%, First/Last Quarter ~50%, Full Moon 100%) are available from authoritative astronomical references like the U.S. Naval Observatory. citeturn10search8

**Seasonal (recommended minimal set):**

- **Equinoxes and solstices** (the four astronomical season boundaries). Seasons are driven by Earth’s axial tilt, and solstices/equinoxes are standard astronomical reference points; National Weather Service educational materials describe this clearly, and NWS provides published astronomical season date/times tables. citeturn10search2turn10search6

**Out of scope for first post-MVP (recommended, to keep complexity down):**

- **Eclipses** as a product trigger (rare, location-dependent visibility, and higher risk of user confusion). NASA explains eclipses, but operationalizing them well is typically more complex than phases/solstices/equinoxes. citeturn10search5turn10search1
- **Culturally specific seasonal festivals** (unless your product explicitly commits to a cultural calendar layer), because “seasonal” can be astronomical, meteorological, or culturally defined. citeturn10search10turn10search2

image_group{"layout":"carousel","aspect_ratio":"16:9","query":["diagram of moon phases new moon first quarter full moon last quarter","earth tilt solstice equinox diagram","lunar phases calendar illustration"],"num_per_query":1}

If you adopt this scope, your first post-MVP release can cleanly support: “special readings on New Moon / Full Moon” plus “season-turn readings on the March/September equinox and June/December solstice,” without needing location-specific eclipse logic or culturally variable calendars. citeturn10search0turn10search6turn10search2

## Entity-highlighted references used

- entity["book","Scrum Guide","2020 scrum framework"] citeturn17view0
- entity["organization","World Wide Web Consortium","standards body"] citeturn39view0
- entity["organization","OpenAPI Initiative","api specification project"] citeturn22view0
- entity["organization","Internet Engineering Task Force","standards body"] citeturn25view0turn26view0
- entity["organization","Stripe","payments company"] citeturn28view0
- entity["organization","OWASP","security foundation"] citeturn13view0turn27view0turn11view0
- entity["organization","OpenAI","ai research company"] citeturn18view0turn19view0turn12view0
- entity["organization","Information Commissioner's Office","uk privacy regulator"] citeturn20view0
- entity["organization","National Institute of Standards and Technology","us standards body"] citeturn21view0
- entity["organization","NASA","us space agency"] citeturn10search0turn10search5
- entity["organization","U.S. Naval Observatory","astronomy reference"] citeturn10search8
