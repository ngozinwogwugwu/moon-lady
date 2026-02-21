# Interaction Annotations
**Owner:** Suki Nakamura
**Ticket:** SUKI-013
**Status:** Complete
**For:** Theo Park (frontend implementation)

---

## Screen Flow

```
[First load]
  ↓
  disclosed? ──NO──→ Disclosure Screen
  ↓ YES                    ↓ "Got it"
  ↓ ←──────────────────────┘
  ↓
Home Screen
  ↓ "Record your memo"
  ↓
Recording Screen
  ↓ "Finish" (≥8s) OR hard stop (2:00)
  ↓
Review Screen ── "Re-record" ──→ Recording Screen
  ↓ [upload begins here, before Submit]
  ↓ "Submit"
  ↓
Processing Screen
  ↓ (SSE state machine drives from here)
  ↓
  ├──→ Reading Screen (stage_b_complete)
  ├──→ Warm No — Abstain (stage_a_complete: needs_more_input)
  └──→ Warm No — Pipeline Failure (pipeline_error OR SSE timeout)

Reading Screen
  ↓ "Record again" / home nav
  ↓
Home Screen
```

---

## SSE State Machine → UI Transitions

| SSE Event | Payload | UI Transition |
|---|---|---|
| `transcription_complete` | `{ session_id }` | Label: "Listening" → "Choosing cards" (200ms crossfade) |
| `stage_a_complete` (ok) | `{ session_id, status: "ok" }` | Label: "Choosing cards" → "Writing" (200ms crossfade) |
| `stage_a_complete` (needs_more_input) | `{ session_id, status: "needs_more_input" }` | Navigate to Warm No — Abstain |
| `stage_b_complete` | `{ session_id, reading: ReadingObject, cache_hit: bool }` | Navigate to Reading Screen with reading payload |
| `pipeline_error` | `{ session_id, stage }` | Navigate to Warm No — Pipeline Failure |
| SSE drop (after 15s timeout) | — | Navigate to Warm No — Pipeline Failure |

**SSE reconnect logic:**
- If SSE connection drops unexpectedly: wait 2 seconds, attempt one reconnect.
- If reconnect also drops: navigate to Warm No — Pipeline Failure.
- If `stage_b_complete` or `pipeline_error` was received before drop: do not reconnect (already done).

---

## Tap Targets and What They Trigger

### Disclosure Screen
| Element | Action |
|---|---|
| "Got it" button | `POST /api/devices/:token/disclose` → on success: navigate to Home |

### Home Screen
| Element | Action |
|---|---|
| "Record your memo" | Navigate to Recording Screen |
| "What is this?" | Toggle inline explanation (no navigation) |
| "Your last reading →" | Navigate to Reading Screen with stored session reading |

### Recording Screen
| Element | Condition | Action |
|---|---|---|
| Circle record button | State: Idle | `getUserMedia` → on success: start MediaRecorder, start timer, transition to Recording state |
| Circle record button | Permission denied | Show recovery state |
| "Finish" button | State: Recording, elapsed ≥ 8s | `MediaRecorder.stop()` → navigate to Review |
| Hard stop | 2:00 elapsed | Auto: `MediaRecorder.stop()` → navigate to Review |
| "Open settings" (recovery) | — | Attempt `getUserMedia` again (may re-prompt browser) |

### Review Screen
| Element | Action |
|---|---|
| Play/pause | Toggle audio playback of recorded blob |
| "Re-record" | Discard recording, navigate to Recording Screen |
| "Submit" | Open SSE connection → navigate to Processing Screen |
| [Screen appears] | Begin background upload: `POST /api/sessions/upload` (do not await) |

### Processing Screen
| Element | Action |
|---|---|
| [no tap targets] | Passive — driven entirely by SSE events |

### Reading Screen
| Element | Action |
|---|---|
| "Lens A" tab | Switch all card interpretations to Lens A (exploratory only) |
| "Lens B" tab | Switch all card interpretations to Lens B (exploratory only) |
| "Save" | Persist reading to localStorage keyed by session_id |
| "Reflect" | Toggle journaling prompt below (inline textarea) |

### Warm No — Abstain
| Element | Action |
|---|---|
| "Record again" | Navigate to Recording Screen, start new session |

### Warm No — Pipeline Failure
| Element | Action |
|---|---|
| "Try again" | Navigate to Home Screen |

---

## Edge Case Flows

### Upload fails before Submit is tapped
- Surface a retry option in the review screen
- Copy: "Upload didn't complete. Try again?"
- Retry: re-attempt `POST /api/sessions/upload`
- If upload still fails on retry: show "Something went wrong. Try again later." with home navigation

### Microphone permission denied
- Show recovery state in Recording Screen
- Do not show an error modal
- Do not navigate away from the recording screen

### SSE connection: stage already complete on connect
- The SSE backend buffers all events — late-connecting clients receive all buffered events immediately on connection
- Theo: drain buffered events in order, apply state transitions normally (they may all fire in rapid succession)

### Cache hit on Stage B
- `stage_b_complete` fires very quickly after `stage_a_complete`
- Labels "Choosing cards" and "Writing" may flash through in under a second
- This is correct behavior — the animation speeds up naturally, no special treatment

### No previous reading (first session)
- Home screen does not show "Your last reading →"
- Check: `localStorage.getItem('last_session_id')` on Home mount

---

## State Machine (formal)

```
States:
  IDLE
  LISTENING       — transcription running
  CHOOSING        — stage_a running
  WRITING         — stage_b running
  READING         — terminal, successful
  WARM_NO_ABSTAIN — terminal, needs_more_input
  WARM_NO_ERROR   — terminal, error

Transitions:
  IDLE → LISTENING           on: Submit tap + SSE connection opens
  LISTENING → CHOOSING       on: transcription_complete event
  CHOOSING → WRITING         on: stage_a_complete (status: ok)
  CHOOSING → WARM_NO_ABSTAIN on: stage_a_complete (status: needs_more_input)
  WRITING → READING          on: stage_b_complete
  any → WARM_NO_ERROR        on: pipeline_error
  any → WARM_NO_ERROR        on: SSE drop + reconnect failed (15s total)
```

---

## Notes for Theo

1. **Device token** must be sent with every API request. Use `X-Device-Token` header (align with Omar on whether header or body — default to header).

2. **Background upload timing:** Upload starts on Review screen mount, not on Submit tap. The `session_id` is stored in memory. Submit opens the SSE stream using the stored session_id.

3. **If session_id is not yet available when Submit is tapped** (upload still in flight): show a brief loading state ("One moment..."), then open SSE when upload returns.

4. **Reading screen** receives the full `ReadingObject` from the `stage_b_complete` SSE payload. Do not re-fetch from the API — use what was sent in the event.

5. **Card images** are in `public/cards/{card_id}.jpg`. File names match card_id values from the catalog (e.g., `the_emperor.jpg`, `four_of_cups.jpg`). Source: public domain 1909 Rider-Waite deck from archive.org / Wikimedia Commons.
