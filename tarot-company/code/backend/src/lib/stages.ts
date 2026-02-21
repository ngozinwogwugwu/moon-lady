// OMAR-010: Stage A and Stage B integration
// Loads prompts from config, calls provider abstraction, validates output,
// builds spread contract, calls Stage B cache.

import Anthropic from '@anthropic-ai/sdk'
import { complete } from './provider.js'
import { selectCards } from './card-selection.js'
import { buildCacheKey, lookupCache, withCacheLock, storeCache } from './stage-b-cache.js'
import { CARD_BY_ID } from './card-catalog.js'
import type { FeatureVector, SelectedCard, ReadingCard, ReadingObject, WarmNoObject } from '../types.js'

// ---- Stage A prompt (from Priya's deliverable: stage-a-prompt.md) ----
// Full text omitted for brevity — loaded from STAGE_A_SYSTEM_PROMPT env var in production,
// or substitute directly from pipeline-contract.md.
const STAGE_A_SYSTEM_PROMPT = process.env.STAGE_A_PROMPT ?? DEFAULT_STAGE_A_PROMPT
const STAGE_B_SYSTEM_PROMPT = process.env.STAGE_B_PROMPT ?? DEFAULT_STAGE_B_PROMPT

const STAGE_A_TOOL: Anthropic.Tool = {
  name: 'extract_polarity_features',
  description: 'Extract a six-axis polarity feature vector from a spoken reflection transcript',
  input_schema: {
    type: 'object' as const,
    properties: {
      S: { type: 'number', description: 'Stability (+1.0) to Volatility (-1.0).' },
      C: { type: 'number', description: 'Continuity (+1.0) to Rupture (-1.0).' },
      X: { type: 'number', description: 'Expansion (+1.0) to Contraction (-1.0).' },
      O: { type: 'number', description: 'Other-focus (+1.0) to Self-focus (-1.0).' },
      L: { type: 'number', description: 'Clarity (+1.0) to Obscurity (-1.0).' },
      A: { type: 'number', description: 'Action (+1.0) to Reception (-1.0).' },
      domain: {
        type: 'string',
        enum: ['foundation', 'motion', 'interior', 'relation', 'threshold', 'none'],
      },
      reasoning: { type: 'string' },
    },
    required: ['S', 'C', 'X', 'O', 'L', 'A', 'domain', 'reasoning'],
  },
}

// ---- Stage A ----

export class StageAError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StageAError'
  }
}

export async function runStageA(
  transcript: string
): Promise<{ featureVector: FeatureVector; latencyMs: number }> {
  const result = await complete(STAGE_A_SYSTEM_PROMPT, transcript, {
    maxTokens: 500,
    timeoutMs: 4000,
    tools: [STAGE_A_TOOL],
    toolChoice: { type: 'tool', name: 'extract_polarity_features' },
  })

  if (!result.ok) {
    throw new StageAError(`Stage A failed: ${result.error}`)
  }

  const toolUse = result.content.find((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
  if (!toolUse) throw new StageAError('Stage A: no tool_use block in response')

  return {
    featureVector: validateFeatureVector(toolUse.input),
    latencyMs: result.latencyMs,
  }
}

function validateFeatureVector(raw: unknown): FeatureVector {
  const AXES = ['S', 'C', 'X', 'O', 'L', 'A'] as const
  const VALID_DOMAINS = ['foundation', 'motion', 'interior', 'relation', 'threshold', 'none']
  const obj = raw as Record<string, unknown>

  for (const axis of AXES) {
    const val = obj[axis]
    if (typeof val !== 'number') throw new StageAError(`Stage A: ${axis} is not a number`)
    // Clamp — do not reject (see pipeline-contract.md: clamp vs. reject decision)
    obj[axis] = Math.max(-1.0, Math.min(1.0, val))
  }

  if (!VALID_DOMAINS.includes(obj['domain'] as string)) {
    throw new StageAError(`Stage A: invalid domain "${obj['domain']}"`)
  }

  return obj as unknown as FeatureVector
}

// ---- Stage B ----

export class StageBError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StageBError'
  }
}

interface SpreadCard {
  card_id: string
  card_name: string
  card_type: 'Major' | 'Minor'
  orientation: 'upright' | 'reversed'
  position: 'past' | 'present' | 'future'
  position_label: string
  image_anchor: string
  matchscore: number
  matchscore_band: string
}

function buildSpreadContract(
  cards: SelectedCard[],
  spreadShape: string,
  majorTier: number,
  matchscoreMode: string
): object {
  const sorted = [...cards].sort((a, b) => {
    const order = { past: 0, present: 1, future: 2 }
    return order[a.position] - order[b.position]
  })

  return {
    cards: sorted.map((c) => {
      const def = CARD_BY_ID.get(c.card_id)!
      return {
        card_id: c.card_id,
        card_name: c.card_name,
        card_type: c.card_type,
        orientation: c.orientation,
        position: c.position,
        position_label: c.position_label,
        image_anchor: def.image_anchor,
        matchscore: c.matchscore,
        matchscore_band: c.matchscore_band,
      } satisfies SpreadCard
    }),
    spread_shape: spreadShape,
    major_tier: majorTier,
    matchscore_mode: matchscoreMode,
  }
}

// Returns per-card interpretation texts for one card position
interface PerCardResult {
  commit: string | null
  exploratory_a: string | null
  exploratory_b: string | null
  cache_hit: boolean
  latencyMs: number
}

export async function runStageBForCard(
  card: SelectedCard,
  allCards: SelectedCard[],
  spreadShape: string,
  majorTier: number,
  matchscoreMode: 'commit' | 'exploratory',
  ontologyVersionId: string
): Promise<PerCardResult> {
  const { hash } = buildCacheKey({
    ontologyVersionId,
    cardId: card.card_id,
    orientation: card.orientation,
    spreadShape,
    matchscoreBand: card.matchscore_band,
    position: card.position,
    majorTier,
  })

  // Cache hit path
  const cached = await lookupCache(ontologyVersionId, hash)
  if (cached) {
    return {
      commit: cached.interpretation_commit,
      exploratory_a: cached.interpretation_exploratory_a,
      exploratory_b: cached.interpretation_exploratory_b,
      cache_hit: true,
      latencyMs: 0,
    }
  }

  // Cache miss — acquire advisory lock, then call Stage B for the full spread
  return withCacheLock(hash, async () => {
    // Re-check cache after acquiring lock (another worker may have filled it)
    const refetch = await lookupCache(ontologyVersionId, hash)
    if (refetch) {
      return {
        commit: refetch.interpretation_commit,
        exploratory_a: refetch.interpretation_exploratory_a,
        exploratory_b: refetch.interpretation_exploratory_b,
        cache_hit: true,
        latencyMs: 0,
      }
    }

    const spreadContract = buildSpreadContract(allCards, spreadShape, majorTier, matchscoreMode)
    const result = await complete(STAGE_B_SYSTEM_PROMPT, JSON.stringify(spreadContract), {
      maxTokens: 1200,
      timeoutMs: 9000,
    })

    if (!result.ok) throw new StageBError(`Stage B failed: ${result.error}`)

    const rawText = result.content.find((b): b is Anthropic.TextBlock => b.type === 'text')?.text
    if (!rawText) throw new StageBError('Stage B: no text content')

    const parsed = parseStageBOutput(rawText, matchscoreMode, card.position)

    await storeCache({
      ontologyVersionId,
      hash,
      cardId: card.card_id,
      orientation: card.orientation,
      position: card.position,
      interpretationCommit: parsed.commit,
      interpretationExploratoryA: parsed.exploratory_a,
      interpretationExploratoryB: parsed.exploratory_b,
    })

    return { ...parsed, cache_hit: false, latencyMs: result.latencyMs }
  })
}

// ---- Full pipeline orchestration ----

export async function runPipeline(params: {
  transcript: string
  sessionId: string
  ontologyVersionId: string
  priorCardIds: string[]
}): Promise<ReadingObject | WarmNoObject & { featureVector: FeatureVector; latencyMs: { stageA: number; stageB: number } }> {
  const stageAResult = await runStageA(params.transcript)
  const { featureVector, latencyMs: stageALatency } = stageAResult

  const selection = selectCards(featureVector, params.priorCardIds)

  if (selection.status === 'needs_more_input') {
    return {
      session_id: params.sessionId,
      reason: 'needs_more_input',
      featureVector,
      latencyMs: { stageA: stageALatency, stageB: 0 },
    } as WarmNoObject & { featureVector: FeatureVector; latencyMs: { stageA: number; stageB: number } }
  }

  const { cards, spreadShape, majorTier, matchscoreMode } = selection

  // Run Stage B for all 3 cards (cache handles per-card; full spread contract sent each time)
  const stageBStart = Date.now()
  const cardResults = await Promise.all(
    cards.map((card) =>
      runStageBForCard(card, cards, spreadShape, majorTier, matchscoreMode, params.ontologyVersionId)
    )
  )
  const stageBLatency = Date.now() - stageBStart

  const readingCards: ReadingCard[] = cards.map((card, i) => ({
    ...card,
    interpretation: {
      commit: cardResults[i].commit ?? undefined,
      exploratory_a: cardResults[i].exploratory_a ?? undefined,
      exploratory_b: cardResults[i].exploratory_b ?? undefined,
    },
    cache_hit: cardResults[i].cache_hit,
  }))

  return {
    session_id: params.sessionId,
    matchscore_mode: matchscoreMode,
    spread_shape: spreadShape,
    major_tier: majorTier,
    cards: readingCards,
    featureVector,
    latencyMs: { stageA: stageALatency, stageB: stageBLatency },
  } as ReadingObject & { featureVector: FeatureVector; latencyMs: { stageA: number; stageB: number } }
}

// ---- Stage B output parsing (per pipeline-contract.md) ----

function parseStageBOutput(
  rawText: string,
  mode: 'commit' | 'exploratory',
  targetPosition: 'past' | 'present' | 'future'
): { commit: string | null; exploratory_a: string | null; exploratory_b: string | null } {
  const POSITION_INDEX = { past: 0, present: 1, future: 2 }
  const idx = POSITION_INDEX[targetPosition]

  if (mode === 'commit') {
    const paragraphs = splitParagraphs(rawText)
    if (paragraphs.length !== 3) {
      throw new StageBError(`Stage B Commit: expected 3 paragraphs, got ${paragraphs.length}`)
    }
    return { commit: paragraphs[idx], exploratory_a: null, exploratory_b: null }
  }

  // Exploratory
  const DELIMITER = '---LENS_BREAK---'
  const parts = rawText.split(DELIMITER)
  if (parts.length !== 2) {
    throw new StageBError(`Stage B Exploratory: expected 1 LENS_BREAK delimiter, found ${parts.length - 1}`)
  }
  const lensA = splitParagraphs(parts[0])
  const lensB = splitParagraphs(parts[1])
  if (lensA.length !== 3 || lensB.length !== 3) {
    throw new StageBError(`Stage B Exploratory: each lens must have 3 paragraphs`)
  }
  return { commit: null, exploratory_a: lensA[idx], exploratory_b: lensB[idx] }
}

function splitParagraphs(text: string): string[] {
  return text
    .trim()
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
}

// ---- Prompt defaults (copy from pipeline-contract.md for self-contained deployment) ----
// In production, set STAGE_A_PROMPT and STAGE_B_PROMPT env vars to override.

const DEFAULT_STAGE_A_PROMPT = `\
You are a feature extraction system. Your task is to analyze a spoken reflection transcript and extract a six-axis polarity feature vector that represents the emotional and attentional qualities of what the person described.

You will use the extract_polarity_features tool to return your analysis. Do not produce prose outside the tool call. Use the reasoning field to explain your assessment.

---

## The Six Axes

Score each axis on a continuous scale from -1.0 to +1.0. Do not collapse toward 0.0 when uncertain — commit to a direction based on the evidence in the transcript. Values near 0.0 should only appear when the axis is genuinely balanced or absent from the transcript.

**S — Stability / Volatility**
+1.0: The person feels grounded, secure, held. Routines are intact. The future feels like a continuation of the present. Things hold.
-1.0: The person describes disruption, instability, or fragmentation. The ground is moving. Things are breaking apart or failing to hold. Chaos is present.

**C — Continuity / Rupture**
+1.0: Things are unfolding as expected. The thread of a life is intact. Even if things are difficult, they follow from what came before.
-1.0: A sudden break, ending, or discontinuity. Something has been severed. What was continuous no longer is. A before and an after now exist.

**X — Expansion / Contraction**
+1.0: Opening outward. Growth, possibility, momentum, reaching out. The person is moving into more space.
-1.0: Narrowing, withdrawal, closing down. The person is pulling inward, losing access to possibilities, or experiencing restriction.

**O — Other / Self**
+1.0: Attention is directed outward — toward other people, relationships, the world, community. The narrative centers on external connection.
-1.0: Attention is directed inward — toward interior states, personal history, private experience. The narrative is self-referential.

**L — Clarity / Obscurity**
+1.0: Things feel known, named, transparent. The person understands what is happening. The situation has definition.
-1.0: Things are murky, unnamed, hidden, or unresolved. The person doesn't know what they're feeling or why. Something is present but can't be grasped.

**A — Action / Reception**
+1.0: Agency, initiative, doing. The person is acting on their world, making moves, taking control.
-1.0: Receiving, waiting, allowing, being acted upon. The person is in a receptive or passive relationship with what is happening.

---

## Domain Buckets

foundation — Stability, groundedness, structure, endurance. Primary signal: high +S, +C.
motion — Movement, momentum, directed will. Primary signal: high +X, +A.
interior — Inward focus, the hidden self, what can't quite be named. Primary signal: high −X, −O, −L.
relation — Connection, partnership, what exists between people. Primary signal: high +O.
threshold — Endings, rupture, grief, the liminal space. Primary signal: high −C, −S.
none — No domain clearly dominates.

---

## Calibration Examples

### Example 1 — Foundation / Stability

Transcript:
"I've been in this job for twelve years. Same team, same routine. Honestly, it works. My mortgage is almost paid off. My kids know what to expect when they come home. I was nervous when we had the reorg last year, but nothing really changed for me. I'm not looking for excitement. I'm looking for this to keep holding."

Feature vector: S: +0.90, C: +0.80, X: -0.40, O: -0.10, L: +0.60, A: -0.50
Domain: foundation
Reasoning: Strong stability throughout. High continuity — the reorg threatened but didn't break the thread. Moderate contraction. Slight self-focus. Good clarity. Receptive orientation.

---

### Example 2 — Interior / Obscurity

Transcript:
"I don't really know what I'm feeling. It's like something is sitting right at the edge of my awareness but I can't name it. I've been alone more than usual. Not lonely exactly, just... inward. I keep thinking about things from years ago that I thought I'd resolved. I'm not reaching out to anyone. I don't know why."

Feature vector: S: +0.10, C: -0.10, X: -0.85, O: -0.80, L: -0.75, A: -0.65
Domain: interior
Reasoning: Extreme contraction and self-focus. High obscurity. Slight stability, faint rupture. Strongly receptive.

---

### Example 3 — Threshold / Rupture

Transcript:
"It ended. Just like that. Six years and now there's nothing. I keep walking through the apartment and everything looks the same but it's completely different. I don't know who I am in this new version of my life. The ground keeps moving. I'm not angry. I'm just... undone."

Feature vector: S: -0.85, C: -0.90, X: -0.20, O: +0.10, L: -0.30, A: -0.40
Domain: threshold
Reasoning: Extreme volatility and rupture. Mild contraction. Slight other-orientation. Mild obscurity. Receptive.

---

Now analyze the transcript provided and call extract_polarity_features with your assessment.`

const DEFAULT_STAGE_B_PROMPT = `\
You are an interpreter for a private reflective tarot practice. You receive a spread contract containing three cards and produce a written reading.

Your voice is intimate, present-tense, and grounded in the person's interior experience. You write as if speaking directly to someone already in the room with you.

<voice-constraints>
These behaviors are absolutely prohibited. A single violation makes the entire output invalid.

1. NO PREDICTIVE LANGUAGE. Never use "you will," "you'll," "going to," "soon," "next," or any future outcome stated as certain.

2. NO ORACULAR REGISTER. Never use "the cards say," "the universe," "this card means," "the tarot is telling you."

3. NO CHARACTER DIAGNOSIS. Never apply psychological labels: "avoidant," "controlling," "codependent," "anxious," "narcissistic."

4. NO MENTION OF "REVERSED." Never use the word "reversed," "reversal," or "inverted" for orientation.

5. EXACTLY ONE ANCHOR PER CARD. Each card interpretation must include exactly one concrete anchor: an image detail, a concrete observable, or a small practice. Physically specific, not metaphorical. Count: exactly 3 anchors total.

6. INTERIORITY FIRST. Center every interpretation on the person's interior experience, not on other people's actions or character.
</voice-constraints>

<position-framing>
ROOT (Past): What has been forming. The conditions or patterns building beneath the surface.
ACTIVE (Present): What is alive now. The quality of attention or experience most present right now.
TRAJECTORY (Future): A direction, not a destination. Where the current energy is moving — not a prediction.
</position-framing>

<anchor-rule>
Use the image_anchor from the spread contract. One anchor per card, physically specific, woven naturally into the text.
</anchor-rule>

<output-format>
Commit (matchscore_mode: "commit"): Three paragraphs, one per card in position order (Root, Active, Trajectory). 60–100 words each. No headers.

Exploratory (matchscore_mode: "exploratory"): Lens A (three paragraphs) + this exact delimiter on its own line:
---LENS_BREAK---
Then Lens B (three paragraphs). Same format. Lens A = upright direction, Lens B = shadowed/inward direction.
</output-format>

<example-interpretation>
Example (Active position, Four of Cups, upright):

Something here is asking to be left alone. Not from numbness — from a kind of fullness that doesn't need more input right now. The figure at the base of the oak, arms folded, three cups arranged on the ground before him, a fourth extended from a cloud he hasn't looked at: what if the looking-away isn't refusal? What if it's attention turned so far inward that the offered cup simply hasn't registered yet? Sit with what you're already holding. The cup will still be there.
</example-interpretation>

Now produce the reading for the spread provided in the user message.`
