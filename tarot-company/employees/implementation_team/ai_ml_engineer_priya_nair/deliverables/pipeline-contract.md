# Pipeline Contract
**Owner:** Priya Nair
**Ticket:** PRIYA-005
**Deliver to:** Omar Yusuf (backend_engineer_omar_yusuf)
**Status:** Complete — Omar can build against this

This document is the exact specification for the AI pipeline. Everything here is copy-paste ready or precisely defined. Do not build against any other source for AI integration.

---

## Stage A — Feature Extraction

### Purpose
Convert a transcript string into a six-axis polarity feature vector and dominant domain label. This is a structured output call using the Anthropic tools feature.

### System Prompt (exact text — copy-paste into config)

See: `deliverables/stage-a-prompt.md` — the full system prompt text block.

### Tool Schema (exact JSON)

```json
{
  "name": "extract_polarity_features",
  "description": "Extract a six-axis polarity feature vector from a spoken reflection transcript",
  "input_schema": {
    "type": "object",
    "properties": {
      "S": {
        "type": "number",
        "description": "Stability (+1.0) to Volatility (-1.0)."
      },
      "C": {
        "type": "number",
        "description": "Continuity (+1.0) to Rupture (-1.0)."
      },
      "X": {
        "type": "number",
        "description": "Expansion (+1.0) to Contraction (-1.0)."
      },
      "O": {
        "type": "number",
        "description": "Other-focus (+1.0) to Self-focus (-1.0)."
      },
      "L": {
        "type": "number",
        "description": "Clarity (+1.0) to Obscurity (-1.0)."
      },
      "A": {
        "type": "number",
        "description": "Action (+1.0) to Reception (-1.0)."
      },
      "domain": {
        "type": "string",
        "enum": ["foundation", "motion", "interior", "relation", "threshold", "none"]
      },
      "reasoning": {
        "type": "string"
      }
    },
    "required": ["S", "C", "X", "O", "L", "A", "domain", "reasoning"]
  }
}
```

### SDK Call (TypeScript)

```typescript
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-5-20251001',
  max_tokens: 500,
  temperature: 0,                          // enforced in provider abstraction layer — do not pass here
  system: STAGE_A_SYSTEM_PROMPT,
  tools: [STAGE_A_TOOL_SCHEMA],
  tool_choice: { type: 'tool', name: 'extract_polarity_features' },
  messages: [{ role: 'user', content: transcriptText }]
})
```

**Note:** Temperature is enforced at the provider abstraction layer (OMAR-003). Do not pass `temperature` in this call — the layer handles it.

### Parsing Stage A Response

```typescript
// response.content will have one item of type 'tool_use'
const toolUse = response.content.find(block => block.type === 'tool_use')
if (!toolUse || toolUse.type !== 'tool_use') {
  throw new StageAError('Unexpected response format: no tool_use block')
}
const featureVector = toolUse.input as FeatureVector
```

### Stage A Output Type

```typescript
interface FeatureVector {
  S: number      // [-1.0, +1.0]
  C: number      // [-1.0, +1.0]
  X: number      // [-1.0, +1.0]
  O: number      // [-1.0, +1.0]
  L: number      // [-1.0, +1.0]
  A: number      // [-1.0, +1.0]
  domain: 'foundation' | 'motion' | 'interior' | 'relation' | 'threshold' | 'none'
  reasoning: string
}
```

### Stage A Output Validation Rules

After parsing `toolUse.input`, validate before proceeding:

```typescript
function validateFeatureVector(fv: unknown): FeatureVector {
  const axes = ['S', 'C', 'X', 'O', 'L', 'A'] as const
  const validDomains = ['foundation', 'motion', 'interior', 'relation', 'threshold', 'none']

  for (const axis of axes) {
    const val = (fv as Record<string, unknown>)[axis]
    if (typeof val !== 'number') throw new StageAValidationError(`${axis} is not a number`)
    if (val < -1.0 || val > 1.0) {
      // CLAMP — do not reject
      ;(fv as Record<string, unknown>)[axis] = Math.max(-1.0, Math.min(1.0, val as number))
    }
  }

  const domain = (fv as Record<string, unknown>)['domain']
  if (!validDomains.includes(domain as string)) {
    throw new StageAValidationError(`Invalid domain: ${domain}`)
  }

  return fv as FeatureVector
}
```

**Clamp vs. reject decision:** Axis values outside [-1.0, 1.0] are clamped (not rejected). This handles rare floating-point overshoot from the model. Domain values outside the enum are rejected with a `pipeline_error` event.

### Stage A Error Cases

| Error condition | Action |
|---|---|
| No `tool_use` block in response | Emit `pipeline_error { stage: "stage_a" }`, close SSE |
| Axis value not a number | Emit `pipeline_error { stage: "stage_a" }`, close SSE |
| Axis value outside [-1.0, 1.0] | Clamp to range, continue |
| Domain not in enum | Emit `pipeline_error { stage: "stage_a" }`, close SSE |
| Timeout (4000ms) | Emit `pipeline_error { stage: "stage_a" }`, close SSE |
| 429 / 5xx (after 2 retries) | Emit `pipeline_error { stage: "stage_a" }`, close SSE |

### Stage A Example I/O

**Input (user message):**
```
"I've been in this job for twelve years. Same team, same routine. Honestly, it works. My mortgage is almost paid off. My kids know what to expect when they come home. I was nervous when we had the reorg last year, but nothing really changed for me. I'm not looking for excitement. I'm looking for this to keep holding."
```

**Output (toolUse.input):**
```json
{
  "S": 0.88,
  "C": 0.82,
  "X": -0.42,
  "O": -0.12,
  "L": 0.58,
  "A": -0.48,
  "domain": "foundation",
  "reasoning": "Strong stability markers throughout — twelve years, same routine, explicitly seeking continuation. High continuity: the reorg threatened but didn't break the thread. Moderate contraction: explicitly not seeking growth. Slight self-focus. Good clarity about what they want. Receptive orientation."
}
```

---

## Card Selection (Deterministic — No LLM)

This logic lives in OMAR-008 and runs between Stage A and Stage B. Documented here so Stage B input format makes sense.

### Card Catalog (Static Constant)

All 18 cards with their polarity coordinates and image anchors:

```typescript
const CARD_CATALOG: CardDefinition[] = [
  // Foundation domain
  {
    card_id: 'the_emperor',
    card_name: 'The Emperor',
    card_type: 'Major',
    domain: 'foundation',
    coords: { S: 0.95, C: 0.70, X: -0.30, O: -0.20, L: 0.40, A: -0.50 },
    image_anchor: 'the stone throne carved with ram\'s heads, the orb and scepter held firm'
  },
  {
    card_id: 'ten_of_pentacles',
    card_name: 'Ten of Pentacles',
    card_type: 'Minor',
    domain: 'foundation',
    coords: { S: 0.85, C: 0.80, X: 0.10, O: 0.40, L: 0.50, A: -0.30 },
    image_anchor: 'the old man at the gate, his back to the viewer, two white dogs at his feet, the younger couple ahead'
  },
  {
    card_id: 'four_of_swords',
    card_name: 'Four of Swords',
    card_type: 'Minor',
    domain: 'foundation',
    coords: { S: 0.70, C: 0.60, X: -0.60, O: -0.50, L: 0.20, A: -0.80 },
    image_anchor: 'the stone effigy of a knight lying in repose, three swords mounted above, one beside'
  },
  // Motion domain
  {
    card_id: 'the_chariot',
    card_name: 'The Chariot',
    card_type: 'Major',
    domain: 'motion',
    coords: { S: 0.30, C: 0.20, X: 0.90, O: -0.10, L: 0.50, A: 0.95 },
    image_anchor: 'the two sphinxes — one dark, one light — standing still before the chariot, held by will alone'
  },
  {
    card_id: 'eight_of_wands',
    card_name: 'Eight of Wands',
    card_type: 'Minor',
    domain: 'motion',
    coords: { S: -0.10, C: -0.20, X: 0.85, O: 0.20, L: 0.30, A: 0.90 },
    image_anchor: 'eight wands crossing through open air in swift parallel flight, the valley floor far below'
  },
  {
    card_id: 'knight_of_swords',
    card_name: 'Knight of Swords',
    card_type: 'Minor',
    domain: 'motion',
    coords: { S: -0.30, C: -0.10, X: 0.70, O: -0.30, L: 0.60, A: 0.85 },
    image_anchor: 'the knight charging hard into the wind, sword raised, the trees bending behind him'
  },
  {
    card_id: 'page_of_cups',
    card_name: 'Page of Cups',
    card_type: 'Minor',
    domain: 'motion',
    coords: { S: 0.10, C: 0.30, X: 0.40, O: 0.50, L: -0.20, A: 0.40 },
    image_anchor: 'the page standing at the shore, holding up a cup from which a fish peers out'
  },
  // Interior domain
  {
    card_id: 'the_high_priestess',
    card_name: 'The High Priestess',
    card_type: 'Major',
    domain: 'interior',
    coords: { S: 0.20, C: 0.30, X: -0.90, O: -0.85, L: -0.60, A: -0.70 },
    image_anchor: 'the pomegranate veil behind her, the scroll half-visible in her lap'
  },
  {
    card_id: 'four_of_cups',
    card_name: 'Four of Cups',
    card_type: 'Minor',
    domain: 'interior',
    coords: { S: 0.40, C: 0.20, X: -0.70, O: -0.40, L: -0.50, A: -0.60 },
    image_anchor: 'the figure seated at the oak\'s base, arms folded, three cups on the ground, a fourth extended from a cloud'
  },
  {
    card_id: 'seven_of_cups',
    card_name: 'Seven of Cups',
    card_type: 'Minor',
    domain: 'interior',
    coords: { S: -0.20, C: -0.30, X: -0.40, O: -0.50, L: -0.80, A: -0.20 },
    image_anchor: 'the seven cups floating in cloud, each containing a different vision: a castle, a wreath, a serpent, a shrouded figure'
  },
  {
    card_id: 'the_moon',
    card_name: 'The Moon',
    card_type: 'Major',
    domain: 'interior',
    coords: { S: -0.30, C: -0.40, X: -0.50, O: -0.60, L: -0.90, A: -0.50 },
    image_anchor: 'the crayfish emerging from the still pool at night, the two towers in the distance, the dog and wolf at the water\'s edge'
  },
  // Relation domain
  {
    card_id: 'the_lovers',
    card_name: 'The Lovers',
    card_type: 'Major',
    domain: 'relation',
    coords: { S: 0.40, C: 0.50, X: 0.20, O: 0.90, L: 0.10, A: 0.30 },
    image_anchor: 'the angel spreading great wings above the man and woman, the serpent coiled in the fruit tree behind her'
  },
  {
    card_id: 'three_of_cups',
    card_name: 'Three of Cups',
    card_type: 'Minor',
    domain: 'relation',
    coords: { S: 0.50, C: 0.60, X: 0.30, O: 0.85, L: 0.40, A: 0.50 },
    image_anchor: 'three women raising their cups in a circle, flowers and harvest abundance at their feet'
  },
  {
    card_id: 'two_of_cups',
    card_name: 'Two of Cups',
    card_type: 'Minor',
    domain: 'relation',
    coords: { S: 0.60, C: 0.70, X: -0.10, O: 0.80, L: 0.30, A: 0.20 },
    image_anchor: 'the man and woman facing each other, exchanging cups, the caduceus with lion\'s head rising between them'
  },
  {
    card_id: 'five_of_pentacles',
    card_name: 'Five of Pentacles',
    card_type: 'Minor',
    domain: 'relation',
    coords: { S: -0.50, C: -0.40, X: -0.20, O: 0.70, L: -0.30, A: -0.40 },
    image_anchor: 'two figures walking through snow outside a lit stained-glass window, neither looking up at the warmth inside'
  },
  // Threshold domain
  {
    card_id: 'the_tower',
    card_name: 'The Tower',
    card_type: 'Major',
    domain: 'threshold',
    coords: { S: -0.80, C: -0.95, X: 0.30, O: 0.00, L: -0.40, A: 0.60 },
    image_anchor: 'the jagged lightning bolt striking the tower\'s crown, two figures in mid-fall against the dark sky'
  },
  {
    card_id: 'five_of_cups',
    card_name: 'Five of Cups',
    card_type: 'Minor',
    domain: 'threshold',
    coords: { S: -0.60, C: -0.70, X: -0.30, O: 0.20, L: -0.50, A: -0.60 },
    image_anchor: 'the figure in a black cloak standing before three spilled cups, two full cups standing upright behind'
  },
  {
    card_id: 'ten_of_swords',
    card_name: 'Ten of Swords',
    card_type: 'Minor',
    domain: 'threshold',
    coords: { S: -0.70, C: -0.80, X: -0.10, O: -0.10, L: -0.20, A: -0.70 },
    image_anchor: 'the figure lying face-down with ten swords in the back, the calm water and the pale dawn on the horizon'
  }
]
```

### Card Selection Algorithm (for reference — Omar implements in OMAR-008)

```
for each card in CARD_CATALOG:
  cosine_sim = dot(featureVector, card.coords) / (magnitude(featureVector) * magnitude(card.coords))
  matchscore = (cosine_sim + 1) / 2   // normalize to [0, 1]
  clamp matchscore to [0, 1]

sort cards by matchscore descending
  tie-breaking: alphabetical by card_id (within epsilon 0.001)

top_card → position: "present" (Active)
second_card → position: "future" (Trajectory)
third_card → position: "past" (Root)

orientation per card:
  find axis with highest absolute value in featureVector (primary_axis)
  if featureVector[primary_axis] sign == card.coords[primary_axis] sign → "upright"
  else → "reversed"

matchscore_band per card:
  ≥ 0.65 → "commit"
  0.40–0.64 → "exploratory"
  < 0.40 → "abstain"

if any card is "abstain" → return { status: "needs_more_input" }

spread_shape:
  "coherent" if all 3 cards share ≥ 2 axes within ±0.25 of each other
  "tensioned" if any pair of cards differs by > 0.60 on any single axis
  otherwise "standard"

major_tier:
  count Majors where matchscore ≥ tier threshold:
  1 Major ≥ 0.70 → tier 1
  2 Majors ≥ 0.83 → tier 2
  3 Majors ≥ 0.92 → tier 3
  else → tier 0

matchscore_mode:
  if all 3 cards are "commit" → "commit"
  else → "exploratory"
```

---

## Stage B — Interpretation Generation

### Purpose
Convert a spread contract (3 cards with metadata) into a written three-card reading in the correct voice register.

### System Prompt (exact text — copy-paste into config)

See: `deliverables/stage-b-prompt.md` — the full system prompt text block.

### Stage B Input: The Spread Contract

Stage B receives the following as the user message content (JSON serialized to string):

```typescript
interface SpreadContract {
  cards: SpreadCard[]
  spread_shape: 'coherent' | 'tensioned' | 'standard'
  major_tier: 0 | 1 | 2 | 3
  matchscore_mode: 'commit' | 'exploratory'
}

interface SpreadCard {
  card_id: string
  card_name: string
  card_type: 'Major' | 'Minor'
  orientation: 'upright' | 'reversed'
  position: 'past' | 'present' | 'future'
  position_label: 'Root' | 'Active' | 'Trajectory'
  image_anchor: string       // from CARD_CATALOG
  matchscore: number         // rounded to 3 decimal places
  matchscore_band: 'commit' | 'exploratory'
}
```

**Card order in array:** Always [past, present, future] — Root first, Active second, Trajectory third.

**Build the spread contract from card selection output:**
```typescript
function buildSpreadContract(
  cards: SelectedCard[],        // from OMAR-008
  spreadShape: SpreadShape,
  majorTier: number,
  matchscoreMode: 'commit' | 'exploratory'
): SpreadContract {
  return {
    cards: cards.map(card => ({
      card_id: card.card_id,
      card_name: CARD_CATALOG.find(c => c.card_id === card.card_id)!.card_name,
      card_type: CARD_CATALOG.find(c => c.card_id === card.card_id)!.card_type,
      orientation: card.orientation,
      position: card.position,
      position_label: POSITION_LABELS[card.position],
      image_anchor: CARD_CATALOG.find(c => c.card_id === card.card_id)!.image_anchor,
      matchscore: Math.round(card.matchscore * 1000) / 1000,
      matchscore_band: card.matchscore_band
    })),
    spread_shape: spreadShape,
    major_tier: majorTier,
    matchscore_mode: matchscoreMode
  }
}

const POSITION_LABELS = { past: 'Root', present: 'Active', future: 'Trajectory' }
```

### SDK Call (TypeScript)

```typescript
const userMessage = JSON.stringify(spreadContract)

const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-5-20251001',
  max_tokens: 1200,            // Commit ~500 tokens; Exploratory ~1000 tokens; buffer for both
  temperature: 0,              // enforced by provider abstraction layer
  system: STAGE_B_SYSTEM_PROMPT,
  messages: [{ role: 'user', content: userMessage }]
})

const rawText = response.content[0].type === 'text' ? response.content[0].text : null
if (!rawText) throw new StageBError('No text content in Stage B response')
```

### Stage B Output Parsing

**Commit band:**
```typescript
function parseCommitOutput(rawText: string): CommitReading {
  const paragraphs = rawText
    .trim()
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0)

  if (paragraphs.length !== 3) {
    throw new StageBParseError(`Expected 3 paragraphs, got ${paragraphs.length}`)
  }

  return {
    root: paragraphs[0],      // Past card
    active: paragraphs[1],    // Present card
    trajectory: paragraphs[2] // Future card
  }
}
```

**Exploratory band:**
```typescript
function parseExploratoryOutput(rawText: string): ExploratoryReading {
  const DELIMITER = '---LENS_BREAK---'
  const parts = rawText.split(DELIMITER)

  if (parts.length !== 2) {
    throw new StageBParseError(`Expected LENS_BREAK delimiter, found ${parts.length - 1} occurrences`)
  }

  const lensA = parseCommitOutput(parts[0])
  const lensB = parseCommitOutput(parts[1])

  return { lensA, lensB }
}
```

**Top-level parser (dispatches by mode):**
```typescript
function parseStageBOutput(
  rawText: string,
  mode: 'commit' | 'exploratory'
): CommitReading | ExploratoryReading {
  return mode === 'commit'
    ? parseCommitOutput(rawText)
    : parseExploratoryOutput(rawText)
}
```

### Stage B Output Types

```typescript
interface CommitReading {
  root: string        // Root (Past) card interpretation — one paragraph
  active: string      // Active (Present) card interpretation — one paragraph
  trajectory: string  // Trajectory (Future) card interpretation — one paragraph
}

interface ExploratoryReading {
  lensA: CommitReading   // Upright interpretation set
  lensB: CommitReading   // Reversed/shadowed interpretation set
}
```

### Stage B Output Format Summary

| Mode | Structure | Delimiter | Expected tokens |
|---|---|---|---|
| Commit | 3 paragraphs | blank lines between | ~400–600 |
| Exploratory | 3 paragraphs + `---LENS_BREAK---` + 3 paragraphs | `---LENS_BREAK---` on its own line | ~800–1100 |

### Stage B Output Length Targets

- Per card per paragraph: 60–100 words
- Commit total: ~180–300 words
- Exploratory per lens: ~180–300 words
- Exploratory total: ~360–600 words

### Stage B Example I/O

**Input (spread contract for Commit):**
```json
{
  "cards": [
    {
      "card_id": "the_tower",
      "card_name": "The Tower",
      "card_type": "Major",
      "orientation": "reversed",
      "position": "past",
      "position_label": "Root",
      "image_anchor": "the jagged lightning bolt striking the tower's crown, two figures in mid-fall against the dark sky",
      "matchscore": 0.81,
      "matchscore_band": "commit"
    },
    {
      "card_id": "four_of_cups",
      "card_name": "Four of Cups",
      "card_type": "Minor",
      "orientation": "upright",
      "position": "present",
      "position_label": "Active",
      "image_anchor": "the figure seated at the oak's base, arms folded, three cups on the ground, a fourth extended from a cloud",
      "matchscore": 0.76,
      "matchscore_band": "commit"
    },
    {
      "card_id": "eight_of_wands",
      "card_name": "Eight of Wands",
      "card_type": "Minor",
      "orientation": "upright",
      "position": "future",
      "position_label": "Trajectory",
      "image_anchor": "eight wands crossing through open air in swift parallel flight, the valley floor far below",
      "matchscore": 0.72,
      "matchscore_band": "commit"
    }
  ],
  "spread_shape": "tensioned",
  "major_tier": 1,
  "matchscore_mode": "commit"
}
```

**Output (rawText):**
```
Something was uprooted before it could fully fall. The ground shifted — you felt it — and yet here you are, still in the room, still upright. What the tower-moment does isn't always what it promises: sometimes the strike comes and what was supposed to end doesn't end cleanly, it just changes the air pressure of your life. The jagged bolt, the crown displaced from the spire, the figures in mid-fall — the image isn't the aftermath. It's the instant. That instant is still in you somewhere, still mid-arc.

Something here is asking to be left alone. Not from numbness — from a kind of fullness that doesn't need more input right now. The figure at the base of the oak, arms folded, three cups arranged on the ground before him, a fourth extended from a cloud he hasn't looked at: what if the looking-away isn't refusal? What if it's attention turned so far inward that the offered cup simply hasn't registered yet? Sit with what you're already holding. The cup will still be there.

The direction from here is outward and fast. Whatever has been held in suspension — the half-finished thought, the delayed decision, the thing you've been circling — there's a pressure gathering. Eight wands crossing open sky, nothing impeding their arc. This isn't a call to act immediately; it's a reading of the momentum already present. When the release comes, it will feel less like a choice and more like arriving somewhere you were already headed.
```

**Parsed output:**
```typescript
{
  root: "Something was uprooted before it could fully fall...",
  active: "Something here is asking to be left alone...",
  trajectory: "The direction from here is outward and fast..."
}
```

---

## Stage B Cache Key

The cache key is built from card-level fields, not the full session. Cache lives in the `stage_b_cache` table.

**Cache key input (per card):**
```
{ontology_version_id}|{card_id}|{orientation}|{spread_shape}|{matchscore_band}|{position}|{major_tier}
```

**Hash:** SHA-256 of the above string.

**Note:** The `image_anchor` text is NOT part of the cache key — it comes from the static catalog, not from the transcript. The `major_tier` IS part of the key because it may eventually influence Stage B behavior (e.g., Tier 3 preface).

---

## Integration Notes for Omar

### 1. How to parse Stage B response into per-card fields

Split on double newlines (`\n\n+`). The three resulting paragraph strings map to cards in this order:
- Paragraph 0 → Root (past card) → `interpretation_commit` for that card
- Paragraph 1 → Active (present card) → `interpretation_commit` for that card
- Paragraph 2 → Trajectory (future card) → `interpretation_commit` for that card

For Exploratory, first split on `---LENS_BREAK---` to get Lens A text and Lens B text, then apply the same paragraph-split logic to each half.

### 2. What delimiter separates Past / Present / Future cards

Double newline (`\n\n`). No card names, no position labels, no section headers — just paragraphs. Stage B is instructed not to include any labels.

**Validation:** If splitting on `\n\n+` yields anything other than 3 non-empty strings, throw a `StageBParseError`. Log the raw output for debugging. Do not silently accept malformed output.

### 3. What delimiter separates Lens A from Lens B in Exploratory

Exact string: `---LENS_BREAK---` on its own line. Split on this exact value. If not found in Exploratory output, throw `StageBParseError`.

### 4. How to store Stage B output in the DB

The `stage_b_cache` table stores per-card interpretation fields. For each card:
- `interpretation_commit`: the paragraph for Commit band
- `interpretation_exploratory_a`: the Lens A paragraph for Exploratory (null if Commit-only)
- `interpretation_exploratory_b`: the Lens B paragraph for Exploratory (null if Commit-only)

For Commit-mode output, store the paragraph as `interpretation_commit`. Set `_a` and `_b` to null.
For Exploratory-mode output, store both lens paragraphs. The `interpretation_commit` field is null (Exploratory readings don't have a Commit version).

### 5. Session record after pipeline completes

The `sessions` table should store:
- `feature_vector`: JSON — the full FeatureVector object from Stage A
- `domain`: string — the domain field from Stage A
- `spread_shape`: string
- `major_tier`: integer
- `matchscore_mode`: string
- Per-card fields (3 rows or 3 JSON objects): card_id, orientation, position, matchscore, matchscore_band, cache_hit
- `stage_a_latency_ms`: integer
- `stage_b_latency_ms`: integer (0 if cache hit)
- `stage_a_status`: 'ok' | 'needs_more_input'

### 6. Timeout configuration

| Stage | Timeout |
|---|---|
| Stage A | 4000ms |
| Stage B | 9000ms |

These are set in the provider abstraction layer config per call, not as global settings.

---

## Ontology Version

Both Stage A and Stage B prompts are versioned. The current version is `v1`. The `ontology_version_id` field in the cache key and session table refers to the combined prompt version.

When either prompt changes (content, examples, schema), increment `ontology_version_id`. This invalidates all cache entries for the previous version.

Current value: `"prototype-v1"`

---

## Acceptance Criteria Check

**Stage A:**
- [x] Full system prompt — see stage-a-prompt.md
- [x] Tool schema — defined above
- [x] Output validation rules — clamp vs. reject decision documented
- [x] Error cases — table above
- [x] Example input + output — T-001 from golden-test-transcripts.md

**Stage B:**
- [x] Full system prompt — see stage-b-prompt.md
- [x] Input format (spread contract) — TypeScript types and JSON example above
- [x] Output format for Commit — three paragraphs, blank-line delimited
- [x] Output format for Exploratory — Lens A + `---LENS_BREAK---` + Lens B
- [x] Output length targets — 60–100 words per paragraph
- [x] Example input + output — Commit example above

**Integration notes:**
- [x] How Omar parses Stage B response into per-card fields — paragraph-split logic above
- [x] Delimiter for Past / Present / Future — double newline
- [x] Delimiter for Lens A / Lens B — `---LENS_BREAK---`
