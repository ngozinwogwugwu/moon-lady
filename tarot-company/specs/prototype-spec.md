# Prototype Specification
**Version:** 0.1.0
**Status:** Handoff — implementation team use this as the build source of truth
**Owner:** Product Team
**Date:** 2026-02-21

---

## 1. What the Prototype Is

The prototype proves the pipeline works end-to-end. A user speaks a voice memo; the system returns a three-card tarot reading.

**In scope:**
- Voice memo recording UI
- Transcription (audio → text)
- Stage A: feature extraction → card selection
- Stage B: interpretation generation (with cache)
- All reading states the pipeline can produce: Commit, Exploratory, Abstain warm no, pipeline failure warm no
- Stalker card recurrence (within-session)
- Processing ritual (real-time pipeline progress via SSE)
- First-use disclosure screen

**Out of scope (V0):**
- Authentication (no login; device token only)
- Scarcity enforcement (always relaxed)
- Calibration dashboard
- Golden test vector sprint
- "Doesn't feel right" feedback
- Cross-session stalker card detection
- Decision log / Canon Constitution workflow

---

## 2. User Journey

### 2.1 First Use

1. User opens the app for the first time.
2. **Disclosure screen** is shown. Text (TBD by data lead):
   > We're building this together. During the prototype, we may review your transcripts to see if the system is working. You can ask us to delete yours at any time. Tap "Got it" to continue.
3. User taps "Got it." Device token is recorded with `disclosed_at` timestamp. Disclosure screen never shows again for this device.

### 2.2 Home Screen

- Single primary action: **Record your memo**
- Secondary: small "What is this?" link → one paragraph, no pipeline explanation
- If user has a reading from the current session, show "Your last reading" link

### 2.3 Recording Screen

- Full-screen distraction-minimal layout
- Large record button. Waveform visualization.
- Guidance text: *"Speak what's present. 1–3 minutes is enough."*
- Elapsed time counter.
- **Soft warning at 4:30:** "30 seconds left."
- **Hard cap at 5:00:** recording stops automatically.
- "Finish" button appears after 8 seconds (prevents accidental early taps).
- On finish → Review screen.
- If microphone permission denied: show single recovery screen with deep link to system settings.
- If recording interrupted (OS error): show "Recording interrupted. Try again." with retry CTA.

### 2.4 Review Screen

- Playback control (play / pause).
- "Re-record" and "Submit" actions.
- One line of transparency: *"Audio → transcript (kept during prototype for internal review)."*
- On "Submit" → transition to Processing screen.

### 2.5 Processing Screen (The Ritual)

- Three sequential states driven by SSE events from the backend:
  1. **Listening** — transcription in progress (`transcription_complete` event pending)
  2. **Choosing cards** — Stage A in progress (`stage_a_complete` event pending)
  3. **Writing** — Stage B in progress (`stage_b_complete` event pending)
- UI: single animated progress ring (slow, breathing rhythm — no spinner). Current state label centered below it.
- One supporting line: *"Give it a few breaths."*
- If Stage B is a cache hit: states 2 and 3 collapse — transition is visibly faster (do not label it as a cache hit, just let it feel quick).
- On `stage_b_complete`: transition to Reading screen.

### 2.6 Reading Screen

Three cards laid out as **Past / Present / Future** (labeled as: *Root / Active / Trajectory*).

For each card position:
- Card image (Rider-Waite)
- Card name
- If stalker card recurrence: one sentence inline, immediately under the card name: *"This card is returning. Sometimes that's just chance; sometimes it's a theme you're ready to meet again."* (first recurrence). Second recurrence: *"This card has come back again."*
- Interpretation text

If Commit band: single reading per card. No label.

If Exploratory band: show *"Two plausible readings"* header (small, understated) for the full spread. Two tabs: **Lens A** and **Lens B**. Default to Lens A. Anchor (exactly one per reading) is the same in both lenses.

After all three cards: one post-reading action area (quiet, small):
- "Save" (default — saves session locally)
- "Reflect" (opens single journaling prompt, optional)

### 2.7 Warm No — Abstain

When Stage A returns `status: "needs_more_input"`:

- Same surface as the reading (no error modal).
- Three card backs (face-down) in place of card images.
- Copy: *"I don't have enough to work with yet."*
- Subtext: *"Try again with 45–90 seconds about what feels most active right now."*
- CTA: **Record again** (starts a new recording, same session context).

### 2.8 Warm No — Pipeline Failure

If transcription, Stage A, or Stage B fail:

- Copy: *"Something went wrong. Your words didn't make it through."*
- CTA: **Try again**
- No error codes or technical details shown to user.

### 2.9 Dev Override (Internal Only)

A hidden text input mode accessible via a debug flag (environment variable). Not user-facing. Used for testing Stage A/B without recording a voice memo.

---

## 3. Technical Architecture

```
User (Voice Memo)
      │
      ▼
[Frontend] ──── POST /api/sessions/start ──────────────► [Backend API]
                                                                │
                                                     ┌──────────┤
                                                     │  Transcription (Whisper API)
                                                     │  ──► SSE: transcription_complete
                                                     │
                                                     │  Stage A (LLM, temp=0)
                                                     │  ──► SSE: stage_a_complete
                                                     │
                                                     │  Stage B Cache lookup
                                                     │  [Hit] ──► skip to stage_b_complete
                                                     │  [Miss] ──► Stage B (LLM, temp=0)
                                                     │  ──► SSE: stage_b_complete
                                                     └──────────┤
                                                                │
[Frontend] ◄─── SSE stream + final reading JSON ───────────────┘
                                                                │
                                                          [Postgres]
                                                    sessions, stage_b_cache,
                                                    telemetry_events
```

**Key constraints:**
- All LLM calls: `temperature=0`. Enforced at provider abstraction layer. Not a per-call parameter.
- Pipeline is deterministic: same transcript → same card → same reading, every time.
- Audio is deleted immediately after transcription. Never stored.
- Stage B never receives the transcript or feature vector — only the spread contract.

---

## 4. API Design

### POST `/api/sessions`
Start a new session and submit audio.

**Request:** `multipart/form-data`
```
audio: <audio file blob>  (or text: <string> if DEV_TEXT_MODE=true)
device_token: <string>
```

**Response:** `text/event-stream` (SSE)

Events emitted in sequence:
```
event: transcription_complete
data: {"session_id": "uuid"}

event: stage_a_complete
data: {"session_id": "uuid", "status": "ok" | "needs_more_input"}

event: stage_b_complete
data: {"session_id": "uuid", "reading": <ReadingObject>}
```

If any stage fails:
```
event: pipeline_error
data: {"session_id": "uuid", "stage": "transcription" | "stage_a" | "stage_b"}
```

### GET `/api/sessions/:session_id`
Retrieve a completed session.

**Response:** `ReadingObject` or `WarmNoObject`

### ReadingObject schema
```json
{
  "session_id": "uuid",
  "spread_shape": "coherent | tensioned",
  "major_tier": 0,
  "matchscore_mode": "commit | exploratory",
  "cards": [
    {
      "position": "past | present | future",
      "card_id": "the_emperor",
      "card_name": "The Emperor",
      "card_orientation": "upright | reversed",
      "matchscore_band": "commit | exploratory | abstain",
      "stalker": false,
      "interpretation": {
        "commit": "...",
        "exploratory_a": "... | null",
        "exploratory_b": "... | null"
      }
    }
  ]
}
```

### WarmNoObject schema
```json
{
  "session_id": "uuid",
  "type": "abstain | pipeline_error",
  "message": "..."
}
```

---

## 5. Database Schema (Prototype)

```sql
-- Device tokens and disclosure tracking
CREATE TABLE devices (
  device_token TEXT PRIMARY KEY,
  disclosed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session records
CREATE TABLE sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_token TEXT NOT NULL REFERENCES devices(device_token),
  ontology_version_id TEXT NOT NULL DEFAULT 'v0.1.0',
  transcript_hash TEXT,          -- SHA-256 of normalized transcript
  transcript_text TEXT,          -- stored for prototype debugging; delete manually after prototype
  feature_vector JSONB,          -- {S, C, X, O, L, A} floats
  domain_detected TEXT,
  spread_shape TEXT,
  major_tier INTEGER,
  stage_a_status TEXT,           -- 'ok' | 'needs_more_input'
  stage_b_cache_hit BOOLEAN,
  reading_json JSONB,            -- full ReadingObject
  stage_a_latency_ms INTEGER,
  stage_b_latency_ms INTEGER,
  total_latency_ms INTEGER,
  model_provider TEXT,
  model_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stage B interpretation cache
CREATE TABLE stage_b_cache (
  ontology_version_id TEXT NOT NULL,
  cache_key_hash TEXT NOT NULL,  -- SHA-256 of (card_id|orientation|spread_shape|matchscore_band|position|major_tier)
  card_id TEXT NOT NULL,
  card_orientation TEXT NOT NULL,
  spread_shape TEXT NOT NULL,
  matchscore_band TEXT NOT NULL,
  position TEXT NOT NULL,
  major_tier INTEGER NOT NULL,
  interpretation_commit TEXT,
  interpretation_exploratory_a TEXT,
  interpretation_exploratory_b TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (ontology_version_id, cache_key_hash)
);

-- Minimal telemetry (prototype)
CREATE TABLE telemetry_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(session_id),
  event_name TEXT NOT NULL,
  ts TIMESTAMPTZ DEFAULT NOW(),
  payload JSONB
);
```

---

## 6. AI Pipeline Specification

### 6.1 Stage A — Feature Extraction

**Input:** Normalized transcript text (whitespace trimmed, casing normalized, spaces collapsed, line breaks normalized).

**LLM call:** Single call at `temperature=0`. JSON output mode.

**System prompt (shape — AI/ML engineer writes the full prompt):**
```
You are a feature extraction system for a tarot reflection product.
Given a user's spoken transcript, extract a polarity feature vector
across six axes. Output valid JSON only.

The six axes (each a float from -1.0 to 1.0):
- S: Stability (+1.0) / Volatility (-1.0) — how settled or disrupted is the person's situation?
- C: Continuity (+1.0) / Rupture (-1.0) — is this a continuation or a break?
- X: Expansion (+1.0) / Contraction (-1.0) — is energy moving outward or inward?
- O: Other (+1.0) / Self (-1.0) — is focus on others/world or on interior self?
- L: Clarity (+1.0) / Obscurity (-1.0) — how clear or murky is the person's understanding?
- A: Action (+1.0) / Reception (-1.0) — is this about doing or receiving/waiting?

Also detect the dominant domain bucket: foundation | motion | interior | relation | threshold | none

Output schema:
{
  "S": float,
  "C": float,
  "X": float,
  "O": float,
  "L": float,
  "A": float,
  "domain": "foundation | motion | interior | relation | threshold | none",
  "reasoning": "one sentence"  // for debugging only, not forwarded to Stage B
}
```

**Post-LLM processing (deterministic arithmetic — no LLM):**

1. **Cosine similarity:** For each of the 18 cards, compute weighted cosine similarity between the transcript feature vector and the card's coordinate vector. MatchScore = (cosine_similarity + 1) / 2, mapping to [0, 1].

2. **Orientation:** For each card, if the transcript's highest-magnitude axis has the same sign as the card's primary axis, orientation = upright. If opposite sign, orientation = reversed.

3. **Arcana Gate:** Cards can only reach MajorScore tiers if they are Major Arcana and their MatchScore meets the tier threshold:
   - Tier 1: 1 Major with MatchScore ≥ 0.70
   - Tier 2: 2 Majors each ≥ 0.83
   - Tier 3: 3 Majors each ≥ 0.92
   Major Arcana below threshold are treated as ordinary cards for selection purposes.

4. **Card selection:** Select top 3 cards by MatchScore. Assign positions: highest MatchScore → Present; second → Future; third → Past. Tie-breaking: alphabetical by card_id (deterministic).

5. **MatchScore bands:**
   - Commit: ≥ 0.65
   - Exploratory: 0.40–0.64
   - Abstain: < 0.40
   If any card falls in Abstain, return `status: "needs_more_input"` and do not proceed to Stage B.

6. **Spread shape:**
   - Coherent: all three cards have at least two axes within ±0.25 of each other.
   - Tensioned: at least one card is > 0.60 apart from another card on a single axis.

7. **Major tier:** Count how many Major Arcana cards in the spread meet their tier threshold. Assign tier (0–3) based on highest qualifying tier.

8. **Stalker card (within-session):** If any card_id in this spread matches a card_id from a previous spread in the same session, set `stalker: true` for that card.

### 6.2 The 18-Card Catalog

All coordinates are upright values. Reversed uses the inverse polarity on the primary axis (other axes unchanged in the similarity computation — the orientation is determined post-selection, not pre-filter).

| card_id | card_name | arcana | bucket | S | C | X | O | L | A |
|---|---|---|---|---|---|---|---|---|---|
| the_emperor | The Emperor | Major | Foundation | +0.95 | +0.70 | −0.30 | −0.20 | +0.40 | −0.50 |
| the_tower | The Tower | Major | Threshold | −0.80 | −0.95 | +0.30 | 0.00 | −0.40 | +0.60 |
| the_high_priestess | The High Priestess | Major | Interior | +0.20 | +0.30 | −0.90 | −0.85 | −0.60 | −0.70 |
| the_chariot | The Chariot | Major | Motion | −0.30 | −0.20 | +0.50 | +0.40 | +0.80 | +0.95 |
| the_moon | The Moon | Major | Threshold | +0.10 | +0.20 | −0.40 | −0.30 | −0.95 | −0.60 |
| the_lovers | The Lovers | Major | Relation | +0.30 | +0.50 | +0.90 | +0.95 | +0.30 | +0.40 |
| ten_of_pentacles | Ten of Pentacles | Minor | Foundation | +0.50 | +0.65 | −0.20 | −0.10 | +0.30 | −0.30 |
| four_of_pentacles | Four of Pentacles | Minor | Foundation | +0.60 | +0.40 | −0.45 | −0.30 | +0.20 | −0.50 |
| ace_of_swords | Ace of Swords | Minor | Foundation | +0.40 | +0.30 | −0.10 | 0.00 | +0.65 | +0.20 |
| ace_of_wands | Ace of Wands | Minor | Motion | −0.20 | −0.10 | +0.40 | +0.20 | +0.40 | +0.60 |
| knight_of_wands | Knight of Wands | Minor | Motion | −0.55 | −0.40 | +0.20 | +0.10 | −0.20 | +0.50 |
| three_of_wands | Three of Wands | Minor | Motion | −0.30 | −0.20 | +0.60 | +0.35 | +0.50 | +0.70 |
| four_of_cups | Four of Cups | Minor | Interior | +0.30 | +0.40 | −0.55 | −0.60 | +0.20 | −0.40 |
| seven_of_cups | Seven of Cups | Minor | Interior | +0.10 | +0.10 | −0.50 | −0.40 | −0.60 | −0.50 |
| page_of_cups | Page of Cups | Minor | Interior | −0.20 | −0.35 | −0.45 | −0.50 | −0.30 | −0.20 |
| two_of_cups | Two of Cups | Minor | Relation | +0.20 | +0.30 | +0.55 | +0.60 | +0.40 | +0.40 |
| six_of_cups | Six of Cups | Minor | Relation | +0.30 | +0.20 | −0.30 | +0.50 | +0.10 | −0.20 |
| six_of_swords | Six of Swords | Minor | Threshold | −0.50 | −0.65 | +0.10 | 0.00 | −0.35 | +0.30 |

### 6.3 Stage B — Interpretation Generation

**Input:** Spread contract only. No transcript. No feature vector.

```json
{
  "spread_shape": "coherent | tensioned",
  "major_tier": 0,
  "cards": [
    {
      "position": "past | present | future",
      "card_id": "the_emperor",
      "card_name": "The Emperor",
      "card_orientation": "upright | reversed",
      "matchscore_band": "commit | exploratory"
    }
  ],
  "ontology_version_id": "v0.1.0"
}
```

**LLM call:** Single call at `temperature=0`. Text output.

**System prompt constraints (AI/ML engineer writes the full prompt):**

Voice register requirements:
- **Interiority-first:** Every card is interpreted from the user's interior experience. Even relation and motion cards are framed as "how this lives inside you," not as external events.
- **No predictive language:** No "you will," "this means X will happen," no timelines, no outcomes stated as certain.
- **No oracular register:** No "the cards say," "the universe is telling you," "this card means."
- **No character diagnosis:** Do not call the user or anyone else controlling, avoidant, anxious, etc.
- **No mention of "reversed":** Never say "reversed" to the user. Interpret toward the orientation silently.
- **Exactly one anchor:** Each card interpretation includes exactly one concrete anchor:
  - An image detail from the canonical Rider-Waite illustration, OR
  - A concrete observable the user can notice in their body or environment, OR
  - A small practice (something the user can do, not a prescription)
  Multiple anchors dilute specificity. Exactly one.
- **Structure:** Past card → Present card → Future card. Each card gets its own paragraph. No cross-card synthesis in the prototype (V0 feature).

**Output for Commit band:** Single reading per card. Total length: 150–250 words.

**Output for Exploratory band:** Two readings per card — Lens A (upright interpretation) and Lens B (reversed interpretation). Same anchor in both. Total per lens: 150–250 words.

**Card anchors for reference (from the symbol architect's dispersion map):**
- The Emperor: armored figure on a stone throne, mountains behind
- The Tower: crown struck from the top of the tower, bolt already gone
- The High Priestess: figure between two pillars, veil of pomegranates, what lies beyond unseen
- The Chariot: two sphinxes facing different directions, charioteer still
- The Moon: path winding into the distance beneath a full moon, far end not visible
- The Lovers: two figures with space between them, radiant figure above
- Ten of Pentacles: family gathered under an archway, pattern of pentacles overhead
- Four of Pentacles: figure with coin held to chest, grip complete
- Ace of Swords: single sword upright from cloud, crown balanced at its tip
- Ace of Wands: wooden staff with new leaves already growing, grip just made
- Knight of Wands: rider mid-turn on rearing horse, direction not yet settled
- Three of Wands: figure at cliff edge looking outward, ships already on water
- Four of Cups: figure with arms crossed, three cups on ground, fourth offered from cloud unacknowledged
- Seven of Cups: seven cups in cloud, each containing something different
- Page of Cups: figure looking into cup, a fish inside looking back
- Two of Cups: two figures raising cups toward each other, space between them open
- Six of Cups: one figure handing cup of flowers to another, not yet received
- Six of Swords: boat crossing water, choppy near side, calm far side

---

## 7. UI Specification

### Typography and palette

This is not a consumer app. Design choices:
- Typeface: serif or humanist sans. Nothing playful, nothing rounded.
- Color: near-black body text on off-white or cream background. No bright accent colors.
- Motion: slow, deliberate. No bounces. No pop animations.
- No badges, streaks, or social elements.

### Screen inventory

1. **Disclosure screen** — centered text, one "Got it" button
2. **Home screen** — single large action, one secondary link
3. **Recording screen** — full-screen, waveform, record/stop, timer
4. **Review screen** — playback, re-record, submit
5. **Processing screen** — ring + state label + one supporting line
6. **Reading screen** — three card layout, past/present/future, interpretations
7. **Warm no screen (abstain)** — three card backs, copy, re-record CTA
8. **Warm no screen (failure)** — simple error state, retry CTA

The reading screen is the primary design surface. Everything else is functional support for getting to the reading.

---

## 8. Provider and Environment

**LLM provider:** Anthropic Claude Sonnet (primary).
**Transcription:** OpenAI Whisper API.
**Database:** PostgreSQL (managed, provider TBD by infrastructure engineer).
**Deployment:** Managed container (Railway or Render), always-warm instance.
**Environment variables required:**
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY` (Whisper)
- `DATABASE_URL`
- `DEV_TEXT_MODE` (boolean, false by default)
- `ONTOLOGY_VERSION_ID` (default: "v0.1.0")

---

## 9. Success Criteria

The prototype is complete when:

1. A user can record a voice memo and receive a three-card reading end-to-end.
2. The pipeline is deterministic: the same transcript returns the same cards on repeated submissions.
3. All reading states are reachable: Commit, Exploratory (Lens A/B), Abstain warm no, Pipeline failure warm no.
4. The processing ritual shows the three states (Listening → Choosing cards → Writing) driven by SSE.
5. Stage B cache is operational: repeated reads of the same card combination return the cached interpretation.
6. Stalker card recurrence is detected and surfaced within a session.
7. First-use disclosure screen appears once per device and is not shown again.
8. Audio is deleted after transcription; this is verifiable by inspection of the database.
