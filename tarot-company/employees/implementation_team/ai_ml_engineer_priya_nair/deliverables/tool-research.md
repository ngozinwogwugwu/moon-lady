# Tool Research — AI/ML Engineer
**Owner:** Priya Nair
**Sprint:** Prototype / 1-hour research

---

## Anthropic SDK

**`@anthropic-ai/sdk` (free, MIT)**

Official SDK. Install: `npm install @anthropic-ai/sdk`.

All calls use `claude-sonnet-4-5` or equivalent mid-tier Sonnet model (strong instruction following, good structured output). Temperature=0 is a first-class parameter.

---

## Structured Output: Tools Feature

**Key finding:** Asking Claude to "return JSON" in the prompt is less reliable than using the `tools` feature to force a specific schema.

Anthropic tools allow defining a JSON schema; Claude is constrained to return values matching that schema. This is the right approach for Stage A feature extraction.

```typescript
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-5-20251001',
  max_tokens: 500,
  temperature: 0,
  tools: [{
    name: 'extract_polarity_features',
    description: 'Extract polarity feature vector from a transcript',
    input_schema: {
      type: 'object',
      properties: {
        S: { type: 'number', description: 'Stability (+1) / Volatility (-1)' },
        C: { type: 'number', description: 'Continuity (+1) / Rupture (-1)' },
        X: { type: 'number', description: 'Expansion (+1) / Contraction (-1)' },
        O: { type: 'number', description: 'Other (+1) / Self (-1)' },
        L: { type: 'number', description: 'Clarity (+1) / Obscurity (-1)' },
        A: { type: 'number', description: 'Action (+1) / Reception (-1)' },
        domain: { type: 'string', enum: ['foundation', 'motion', 'interior', 'relation', 'threshold', 'none'] },
        reasoning: { type: 'string' }
      },
      required: ['S', 'C', 'X', 'O', 'L', 'A', 'domain', 'reasoning']
    }
  }],
  tool_choice: { type: 'tool', name: 'extract_polarity_features' },
  messages: [{ role: 'user', content: transcript }]
})
// response.content[0].type === 'tool_use' → response.content[0].input
```

The `tool_choice: { type: 'tool', name: '...' }` forces Claude to use this tool — guaranteed structured output.

**Note:** This does NOT guarantee values are in [-1.0, 1.0]. Add runtime validation after parsing.

**Decision: Use Anthropic tools feature for Stage A structured output.**

---

## Stage A: Zero-Shot vs. Few-Shot

**Research finding:** For nuanced axis extraction (especially Stability/Volatility and Clarity/Obscurity), zero-shot produces central tendency bias for short or ambiguous transcripts. The LLM hedges toward 0.0 when uncertain.

**Few-shot recommendation:** Include 3 example transcript → feature vector pairs in the Stage A system prompt. Examples should cover:
1. A clear Stability/Foundation case (high +S, high +C)
2. A clear Interior/Obscurity case (high −X, high −L)
3. A Threshold/Rupture case (high −C, high −S)

These examples anchor the scale and prevent hedging. The LLM learns from context what "extreme" values look like in practice.

**Token cost:** 3 examples add ~600–800 input tokens. At $3/M tokens, that's ~$0.002 per call — negligible.

**Decision: Few-shot with 3 examples in Stage A system prompt.**

---

## Stage B: Approach

Stage B is text generation with strict voice constraints. Unlike Stage A, it does NOT use tools — the output is free-form text, not structured data.

**What works for voice constraints:**

1. **Explicit prohibitions** are more reliable than implicit style guidance. List the 6 prohibited behaviors explicitly ("Never say 'you will.' Never say 'the cards say.' Never name orientations.").

2. **Positive examples > negative examples.** Including a short example interpretation (100 words) that demonstrates the correct voice is more effective than describing it abstractly.

3. **XML tags for structure.** Claude responds well to structured system prompts using XML-like tags:
   ```
   <voice-constraints>
   ...prohibited behaviors...
   </voice-constraints>
   <anchor-rule>
   Each card interpretation must include exactly one concrete anchor...
   </anchor-rule>
   ```

4. **One-card-at-a-time vs. full-spread:** Testing suggests prompting for the full three-card reading in a single call (not three separate calls) produces better cross-card thematic coherence, even though Stage B doesn't synthesize across cards explicitly. The model can see all three cards and uses that context to modulate tone.

**Decision: Single Stage B call for the full three-card reading. XML-structured system prompt. Include one short example interpretation.**

---

## Evaluation Approach (Prototype)

For development, Priya reviews Stage B output manually against a checklist before delivering the pipeline contract:

1. No predictive language (search for "will," "soon," "next," future-tense verbs with subject "you")
2. No oracular register (search for "the cards say," "the universe," "this card means")
3. Exactly one anchor per card (count: image detail, observable, or practice)
4. No mention of "reversed"
5. Interiority-first (does the reading focus on interior experience?)

5 test transcripts × manual review = ~2 hours. This is the quality gate before the pipeline contract.

---

## Token Budget

| Stage | Input tokens (est.) | Output tokens (est.) | Cost/call |
|---|---|---|---|
| Stage A (with few-shot) | ~1,200 | ~200 | ~$0.007 |
| Stage B (Commit) | ~800 | ~500 | ~$0.012 |
| Stage B (Exploratory) | ~800 | ~1,000 | ~$0.020 |
| **Full session (Commit)** | | | **~$0.019** |
| **Full session (Exploratory)** | | | **~$0.027** |

Slightly lower than the spec estimate ($0.033) because few-shot examples partially overlap with the system prompt. These are estimates; actual costs depend on the final prompt length.

---

## Determinism at Temperature=0

**Research finding:** Claude Sonnet at `temperature=0` produces highly stable outputs across repeated calls with identical input. Not byte-identical (minor formatting variations are possible), but semantically consistent — same axis values, same card selection.

For Stage B, cache eliminates this concern: once a reading is cached, it's always identical. For Stage A, the feature vector values may vary by ±0.02–0.05 on some axes across runs, but this is unlikely to change card selection (the margin between top cards is typically > 0.05 for non-borderline transcripts).

**CI determinism test strategy:** Assert card selection identity (not raw float values). Assert MatchScore band identity. Assert orientation identity. These are the operationally meaningful outputs.

---

## No Additional Libraries Needed

Stage A and Stage B are prompt engineering tasks, not ML training tasks. No PyTorch, no LangChain, no vector database. The Anthropic SDK is the only AI dependency.

LangChain is overkill and adds unnecessary abstraction. The pipeline is two sequential API calls with deterministic post-processing.
