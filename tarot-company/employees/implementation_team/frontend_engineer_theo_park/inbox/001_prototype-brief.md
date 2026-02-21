# Prototype Brief — Frontend Engineer
**To:** Theo Park — Frontend Engineer
**From:** Product Team
**Date:** 2026-02-21
**Reference:** `tarot-company/specs/prototype-spec.md` — read this first

---

## What You're Building

The web client for a tarot reflection product. User records a voice memo → receives a three-card tarot reading. You build the browser-side of this: voice recording, server-sent event integration for real-time pipeline progress, and all reading display components.

Build from Suki's designs (UI/UX) and Omar's API spec (backend).

---

## Your Deliverables

1. **Voice recording component** — browser MediaRecorder API, waveform visualization, 4:30/5:00 soft/hard stop, permission error handling.
2. **SSE client** — subscribes to the session stream, drives the processing ritual state machine (Listening → Choosing cards → Writing).
3. **Reading display** — three-card layout, Commit and Exploratory (Lens A/B tabs) variants, stalker card note rendering, Major Arcana Tier 3 preface.
4. **Warm no states** — abstain and pipeline failure screens.
5. **First-use disclosure screen.**
6. **Device token management** — generate and persist a device token (localStorage or equivalent); send with every API request.

---

## API Contract

**Base URL:** `POST /api/sessions` — submits audio and returns an SSE stream.

**Request:** `multipart/form-data`
- `audio`: audio blob (or `text` string if `DEV_TEXT_MODE` env is true)
- `device_token`: string (from localStorage)

**Response:** `text/event-stream`

You subscribe to the stream and handle four event types:

```
event: transcription_complete   → update UI to "Choosing cards"
event: stage_a_complete         → update UI to "Writing"; if status=needs_more_input → navigate to abstain warm no
event: stage_b_complete         → navigate to reading screen with the reading JSON
event: pipeline_error           → navigate to pipeline failure warm no
```

The `stage_b_complete` event carries a `reading` object — see the ReadingObject schema in the prototype spec (section 4).

**Session retrieval:** `GET /api/sessions/:session_id` — used to load a previous reading.

---

## Key Implementation Details

### Device Token
Generate a UUID on first load. Persist in localStorage. Send as a header or form field on every request. The backend checks whether this device has seen the disclosure screen.

### Disclosure Screen
First-use only. Show if the backend returns a `disclosure_required` flag (or if no device token exists locally). After user taps "Got it," POST confirmation to the backend.

### Voice Recording
Use browser MediaRecorder API. Record in a format compatible with Whisper (webm/opus or mp3). Enforce:
- Soft warning at 4:30 (display countdown "30 seconds left")
- Hard stop at 5:00 (stop recording automatically)
- "Finish" button appears only after 8 seconds (prevent accidental early submissions)
- Handle permission denied gracefully: show recovery screen with link to system settings

### SSE Client
Subscribe with `EventSource` or `fetch` streaming. The connection stays open until `stage_b_complete` or `pipeline_error`. Handle connection drops gracefully (show a failure state, don't hang).

### Processing Ritual States
Three states: `listening`, `choosing`, `writing`. Map SSE events:
- On connection open → `listening`
- On `transcription_complete` → `choosing`
- On `stage_a_complete` (status=ok) → `writing`
- On `stage_b_complete` → navigate to reading

The animation (breathing ring) plays continuously. The label changes. No progress bar.

### Reading Screen
Render three cards in order: past, present, future (labeled Root / Active / Trajectory).

For each card:
- Rider-Waite card image
- Card name
- If `card.stalker === true`: render stalker note inline
- Interpretation text (`card.interpretation.commit`, or tabs for exploratory)

For exploratory band (when `reading.matchscore_mode === "exploratory"`):
- Show "Two plausible readings" header
- Tabs: Lens A (interpretation_exploratory_a) and Lens B (interpretation_exploratory_b)
- Default to Lens A

For Tier 3 (`reading.major_tier === 3`): render a one-line preface above the spread: *"This spread carries unusual weight. Read slowly."*

### Dev Text Mode
If `DEV_TEXT_MODE=true` (env var exposed to client), show a hidden text area instead of the recording UI. Accessible via long-press on a specific UI element (coordinate with Suki). Not user-facing.

---

## Key Decisions Already Made

- **No auth.** Device token only. No login screen.
- **Always relaxed scarcity.** No "come back tomorrow" screen in the prototype.
- **"Reversed" is never shown.** Card orientation is an internal pipeline concept.
- **MatchScore is never shown.** Commit = single reading. Exploratory = two lenses. Abstain = warm no.
- **SSE is required for the processing ritual.** Polling is not acceptable.

---

## Open Questions to Resolve with Omar

1. **SSE endpoint:** Does the SSE stream start on the same `POST /api/sessions` or does the client POST first and then connect to a separate SSE endpoint by session_id? Coordinate with Omar.
2. **Warm no retry:** Does "Record again" create a new session or append to the current session? The API contract needs to specify this.
3. **Disclosure confirmation:** Is this a separate API call or included in the first session POST?
