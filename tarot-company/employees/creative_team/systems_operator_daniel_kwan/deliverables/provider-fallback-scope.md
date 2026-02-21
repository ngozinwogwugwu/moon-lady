# AI Provider Fallback Scope
**Owner:** Daniel Kwan — Systems Operator
**Sprint:** 001 / Task D-2
**Status:** Complete
**Feeds:** Infrastructure Lead, Head of Product

---

## The Problem

The system depends on one or more AI providers for two distinct operations: feature extraction (Stage A) and interpretation generation (Stage B). If a provider raises prices, changes API behavior, or becomes unavailable, the product breaks. This memo scopes what a provider abstraction layer requires, assesses fallback options, and estimates the cost of each mitigation.

The determinism requirement (CEO direction, 2026-02-21) materially constrains fallback options. A fallback that produces different output for the same input is not a valid fallback — it breaks the system's core guarantee.

---

## What the Abstraction Layer Must Do

A provider abstraction layer is a thin wrapper around all model API calls that allows the underlying model to be swapped without changing the pipeline logic. It is not optional — building directly against a single provider's SDK is the fragility we are mitigating.

### Required interface

```
interface ModelProvider {
  complete(
    system_prompt: string,
    user_message: string,
    config: {
      temperature: 0,          // always 0 — determinism requirement
      max_tokens: integer,
      response_format: "text" | "json",
      timeout_ms: integer
    }
  ): Promise<{
    content: string,
    model_id: string,
    provider: string,
    latency_ms: integer,
    tokens_used: { input: integer, output: integer }
  }>
}
```

### What the abstraction layer handles
- Authentication (API key injection per provider)
- Request formatting (providers have different request schemas)
- Response normalization (providers have different response schemas)
- Timeout enforcement
- Retry logic (transient failures, rate limit backoff)
- Provider selection (primary → fallback ordering)
- Logging of `model_provider` and `model_id` per call (required for telemetry)

### What it does NOT handle
- Prompt engineering (system prompts are pipeline concerns, not provider concerns)
- Output validation (Stage A validates its own feature vector structure)
- Caching (cache layer sits above the abstraction layer)

### Temperature lock
Every model call in the system uses `temperature=0`. This must be enforced at the abstraction layer level — it is not a per-call parameter left to the caller. The abstraction layer should reject any call that attempts to pass a non-zero temperature. This prevents future code paths from accidentally introducing stochasticity.

---

## Stage A vs Stage B — Different Fallback Profiles

Stage A and Stage B have different fallback requirements because they do different things.

**Stage A (feature extraction):**
- Input: transcript (natural language)
- Output: polarity feature vector (structured JSON)
- Fallback sensitivity: HIGH. If Stage A output changes format or values, the card selection changes. A lower-quality Stage A model may produce a valid JSON schema but semantically wrong feature vectors.
- Cacheability: LOW. Every transcript is unique; the feature vector is input-specific.

**Stage B (interpretation generation):**
- Input: spread + context (structured)
- Output: reading text (natural language)
- Fallback sensitivity: MEDIUM. Different models produce different text; but if the card and orientation are the same, the interpretation quality varies with the model.
- Cacheability: HIGH. Deterministic cache key means the same card/spread/MatchScore band always hits the same cached text regardless of what model generated it.

This asymmetry matters: Stage B fallback risk is substantially mitigated by caching. A Stage B provider outage only affects uncached combinations. Stage A fallback risk is not mitigated by caching — every transcript goes to Stage A fresh.

---

## Provider Evaluation Matrix

### Tier 1 — Primary providers (cloud, frontier model)

| Provider | Temperature=0 guarantee | JSON output mode | Latency | Cost (mid-tier) | Notes |
|---|---|---|---|---|---|
| Anthropic Claude Sonnet | Yes | Yes (tool use / JSON mode) | 1–5s | ~$3/$15 per M tokens | Strong on instruction following; good JSON schema adherence |
| OpenAI GPT-4o | Yes | Yes (response_format: json_object) | 1–4s | ~$2.5/$10 per M tokens | Widely tested; good determinism at temp=0 |
| Google Gemini 1.5 Pro | Yes (claimed) | Yes | 1–4s | ~$1.25/$5 per M tokens | Less tested for determinism guarantees across runs |

**Determinism caveat:** No provider guarantees byte-identical outputs at temperature=0 across different infrastructure runs (different hardware, batching). In practice, at temperature=0 with greedy decoding, outputs are highly stable but not provably identical. The CI determinism test (described in D-1) will surface any provider that fails in practice.

**Recommendation for V0:** Start with Anthropic Claude as primary. The instruction-following quality is the most important factor for Stage A's structured feature extraction. OpenAI GPT-4o as first fallback.

### Tier 2 — Smaller model on same provider (cost/latency optimization)

| Option | Notes |
|---|---|
| Claude Haiku | ~10x cheaper than Sonnet; ~2x faster. Quality degradation for Stage A feature extraction is the risk. |
| GPT-4o-mini | Similar tradeoff. Lower cost, lower quality on complex instruction following. |

**When appropriate:** Tier 2 models are acceptable for Stage B if Stage B caching is not viable for a given combination. They are NOT recommended for Stage A — the accuracy of feature extraction is the primary V0 quality bar, and a cheaper model may produce systematically wrong axis assignments.

**Cost comparison:**

| Configuration | Stage A | Stage B | Per session |
|---|---|---|---|
| Sonnet + Sonnet (uncached) | $0.007 | $0.026 | $0.033 |
| Sonnet + Haiku (uncached) | $0.007 | $0.003 | $0.010 |
| Sonnet + cache hit | $0.007 | ~$0.000 | $0.007 |
| Haiku + Haiku (uncached) | $0.001 | $0.003 | $0.004 |

Sonnet Stage A + cache hit for Stage B is the target operating point: quality for extraction, cost savings on generation.

---

## Fallback Tier Definitions

### Active fallback (automatic, within a session)

If the primary provider returns an error or times out, the abstraction layer retries with the next configured provider. The user sees no interruption — the session completes on the fallback provider.

```
Tier 1A: Primary provider (Claude Sonnet)
  → on failure →
Tier 1B: Secondary provider (GPT-4o)
  → on failure →
Tier 2: Smaller model on primary provider (Claude Haiku)
  → on failure →
Tier 3: Rule-based Stage A fallback (Stage A only; see below)
  → on failure →
Return: status "needs_more_input" (warm no)
```

All fallback transitions are logged in telemetry with `model_provider` and `model_id`. A fallback event is a signal worth monitoring.

### Rule-based Stage A fallback (Tier 3)

If all LLM providers fail for Stage A, a rule-based keyword extraction fallback can produce a degraded but functional feature vector. This is a static dictionary approach: known keywords and phrases mapped to axis signals.

**What it can do:** Produce approximate axis weights for common, unambiguous signals ("I feel stuck" → Volatility, "I know what I need to do" → Clarity/Action, "everything fell apart" → Rupture).

**What it cannot do:** Handle complex, nuanced, or ambiguous transcripts. The feature vector quality drops significantly. The MatchScore will be low for most transcripts (correctly flagging low confidence), which may push selections into the Exploratory or Abstain bands. This is honest — the system knows it is degraded.

**When to use:** Only in total LLM provider failure scenarios. Not a cost-optimization path.

**Development cost:** ~2–3 weeks to build a functional keyword dictionary covering the six axes and five domain buckets. Should be scoped as a post-V0 resilience feature unless provider risk is assessed as high.

---

## Self-Hosted Model Feasibility

A self-hosted model eliminates provider pricing risk entirely at the cost of operational complexity. This section assesses feasibility per stage.

### Stage B — Feasible

**Why:** Stage B takes a structured input (spread + context) and generates natural language text. Smaller open-source models (Llama 3 8B, Mistral 7B, Qwen 2.5) can produce interpretation-quality text when given good system prompts. The quality constraint is lower because Stage B text quality is partially mitigated by Amara's voice spec.

**Infrastructure requirement:** A GPU-equipped server or cloud GPU instance. An NVIDIA A10G (24GB VRAM) can serve Llama 3 8B at 4-bit quantization, handling ~10 concurrent requests at ~2–4s latency. Cost: ~$1.50/hour on a cloud GPU (AWS g5.xlarge equivalent). At 100 readings/day, this is ~$36/month — comparable to the cloud model cost at that scale.

**Determinism:** Self-hosted models at temperature=0 are deterministic within a fixed model version. The risk is model version changes — updating the self-hosted model invalidates Stage B cache and may change interpretation text. Treat model version as part of the ontology version ID.

**Stage B caching interaction:** A self-hosted Stage B with strong caching is highly cost-effective at scale. Pre-warm the cache with golden test vector readings; most live sessions hit the cache.

### Stage A — Not Recommended for V0

**Why:** Stage A's feature extraction requires strong instruction following and structured output reliability. Smaller open-source models struggle with consistent JSON schema adherence across diverse transcript inputs, especially for nuanced axis assignments. The primary V0 quality bar (calibration) depends on Stage A accuracy. Degraded Stage A quality directly degrades card selection quality.

**Post-V0:** If a fine-tuned model is developed for polarity extraction (using golden test vectors as training data), self-hosting Stage A becomes viable and potentially superior to general-purpose LLMs. This is a medium-term path (6–12 months post-V0).

---

## Determinism Across Providers

This is the hardest problem in the fallback scope. Same transcript must produce the same card selection regardless of which provider processes it. But different providers produce different outputs, even at temperature=0.

### The actual problem

If a session starts on Provider A and needs to fall back mid-session to Provider B, Stage A may produce a different feature vector. This produces a different card selection. The determinism guarantee is broken for that session.

### Mitigation options

**Option 1: No mid-session fallback for Stage A.**
Stage A is attempted on the primary provider only. If it fails, the session returns `needs_more_input` (warm no). Stage A is fast enough (~1–2s) that a single retry on the same provider is acceptable before failing. This is the simplest and most correct approach.

*Cost:* Slightly higher abstain rate during provider outages. Not a calibration concern.

**Option 2: Stage A output is provider-agnostic.**
Design Stage A to produce a feature vector that is normalized through a deterministic post-processing step regardless of the LLM's raw output. Example: the LLM outputs a structured analysis; a separate rule-based function converts that analysis to the six-axis float vector. The float conversion is deterministic; the LLM variation is absorbed.

*Cost:* More engineering work. The normalization function becomes a critical component. But this approach is architecturally sound for long-term provider independence.

**Option 3: Stage A caching by transcript hash.**
Cache Stage A outputs by the transcript hash (SHA-256 of normalized transcript). If the same transcript is submitted twice — even across provider switches — the cached feature vector is returned. This doesn't solve the cold-path fallback problem but eliminates re-processing costs and ensures repeat transcripts are stable.

*Cost:* Low. This should be built regardless.

**Recommendation for V0:** Option 1 (no mid-session Stage A fallback) + Option 3 (Stage A caching by transcript hash). Option 2 is the right long-term architecture and should be scoped for V1.

### Stage B fallback across providers

Stage B fallback across providers is less critical because Stage B outputs are cached. A fallback provider only handles uncached Stage B combinations. The interpretation text will differ from what the primary provider would have produced, but since it's a new (uncached) combination, there is no prior output to be inconsistent with. The cache then stores the fallback provider's output — consistent on all future requests.

---

## Cost Summary by Mitigation

| Mitigation | One-time cost (eng) | Ongoing cost | Risk eliminated |
|---|---|---|---|
| Provider abstraction layer | 1–2 weeks | Negligible | Single provider lock-in |
| Stage B caching | 1 week | ~$10–50/month for cache infra | 40–70% of Stage B model costs; provider outage risk for cached combinations |
| Stage A transcript hash cache | 2–3 days | Negligible | Repeat transcript re-processing; Stage A cold-path cost |
| Secondary cloud provider (GPT-4o) | 3–5 days (integration) | Pay-per-use only on failover | Primary provider outage |
| Self-hosted Stage B | 2–4 weeks | $30–60/month at 100 users | Stage B pricing risk; long-term cost predictability |
| Rule-based Stage A fallback | 2–3 weeks | Negligible | Total LLM provider failure |
| Fine-tuned Stage A model | 2–3 months | $50–100/month hosting | Stage A quality and pricing risk (post-V0) |

### V0 recommended investment

1. **Provider abstraction layer** — build this first. Everything depends on it.
2. **Stage B caching** — high ROI immediately. Build during or immediately after V0 launch.
3. **Stage A transcript hash cache** — low cost, build alongside abstraction layer.
4. **Secondary cloud provider integration** — add after V0 is stable. Two-week lead time is acceptable for friend testing.

Self-hosted and rule-based fallbacks are post-V0 work unless provider risk assessment changes.
