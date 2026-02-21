# Tickets — Frontend Engineer
**Owner:** Theo Park
**Sprint:** Prototype

Technology-agnostic. These describe what to build, not which library to use.

---

## THEO-001: Project setup and deployment config
**Size:** S
**Depends on:** nothing
**Blocks:** all other THEO tickets

Initialize the frontend project and deploy a "hello world" to Railway (or Vercel if Omar recommends splitting).

### Acceptance criteria
- [ ] Project created with chosen framework (Next.js or equivalent)
- [ ] Deployed to Railway / Vercel and reachable at a URL
- [ ] Tailwind CSS (or chosen utility framework) configured
- [ ] Environment variable for API base URL configured and working
- [ ] PWA manifest file in place (installable on iOS homescreen)
- [ ] Fonts loading correctly (Cormorant Garamond + IM Fell English from Google Fonts)

---

## THEO-002: Device token generation and persistence
**Size:** S
**Depends on:** THEO-001
**Blocks:** THEO-003, THEO-006

Generate a unique device identifier on first load. Persist it locally. Send it with every API call.

### Acceptance criteria
- [ ] UUID generated on first app load if not already present
- [ ] Token persisted in local storage (or IndexedDB)
- [ ] Token sent with every API request (header or request body — align with Omar)
- [ ] Token survives page refresh and browser close/reopen
- [ ] Token is NOT regenerated on subsequent loads

---

## THEO-003: First-use disclosure screen
**Size:** S
**Depends on:** THEO-002, SUKI-002
**Blocks:** THEO-004

Show on first use only. One confirmation action.

### Acceptance criteria
- [ ] Screen shows if the device has no `disclosed_at` record (check from backend or infer from device token state)
- [ ] "Got it" tap sends disclosure confirmation to backend
- [ ] After confirmation, disclosure screen never shows again for this device token
- [ ] Screen matches Suki's design

---

## THEO-004: Home screen
**Size:** S
**Depends on:** THEO-003, SUKI-003
**Blocks:** THEO-005

### Acceptance criteria
- [ ] Renders the home screen from Suki's design
- [ ] "Record your memo" CTA navigates to recording screen
- [ ] "What is this?" link renders the one-paragraph explanation
- [ ] If session has a completed reading, "Your last reading" link is visible and navigates to it

---

## THEO-005: Voice recording component
**Size:** L
**Depends on:** THEO-004, SUKI-004
**Blocks:** THEO-006

The core input component. Four states. Cross-browser audio recording.

### Acceptance criteria
- [ ] Requests microphone permission on entry to recording screen
- [ ] If permission denied: shows recovery screen with link to system settings (matches SUKI-004)
- [ ] Recording starts when record button is tapped
- [ ] Waveform visualization animates during recording (amplitude bars from audio analyser)
- [ ] Elapsed timer increments every second
- [ ] "Finish" button appears after 8 seconds of recording
- [ ] Soft warning at 1:30 elapsed (visual indicator — matches Suki's design)
- [ ] Hard stop at 2:00 — recording ends automatically
- [ ] Handles both webm/opus (Chrome/Android) and mp4/aac (iOS Safari) without error
- [ ] Tapping "Finish" captures the recording and transitions to review screen

---

## THEO-006: Review screen and background upload
**Size:** M
**Depends on:** THEO-005, SUKI-005
**Blocks:** THEO-007

Show recorded audio for review. Begin upload in background immediately (do not wait for "Submit").

### Acceptance criteria
- [ ] Playback control (play/pause) works for the recorded audio
- [ ] "Re-record" discards the current recording and returns to the recording screen
- [ ] Audio upload to `POST /api/sessions/upload` begins immediately when this screen is shown (background, non-blocking)
- [ ] `session_id` from upload response is stored in memory
- [ ] "Submit" button activates regardless of whether upload is complete (SSE stream handles the rest)
- [ ] If upload fails before "Submit": surface an error with retry option
- [ ] Transparency line renders correctly (matches Suki's design)

---

## THEO-007: SSE client and pipeline state machine
**Size:** M
**Depends on:** THEO-006, SUKI-006
**Blocks:** THEO-008, THEO-009, THEO-010, THEO-011

Subscribe to the SSE stream and drive the processing ritual UI.

### State machine
```
IDLE → LISTENING (on Submit tap + SSE connection open)
LISTENING → CHOOSING (on transcription_complete event)
CHOOSING → WRITING (on stage_a_complete with status=ok)
CHOOSING → WARM_NO_ABSTAIN (on stage_a_complete with status=needs_more_input)
WRITING → READING (on stage_b_complete)
any → WARM_NO_ERROR (on pipeline_error)
any → WARM_NO_ERROR (on SSE connection drop after 15s timeout)
```

### Acceptance criteria
- [ ] SSE connection opens to `GET /api/sessions/:id/stream` after receiving session_id from upload
- [ ] Processing ritual screen displays current state label from the state machine
- [ ] State transitions trigger label crossfade (no layout shift)
- [ ] `stage_b_complete` event payload is parsed and stored for reading display
- [ ] Connection is closed after `stage_b_complete` or `pipeline_error`
- [ ] If SSE connection drops unexpectedly: wait 2 seconds, attempt one reconnect, then navigate to pipeline failure warm no

---

## THEO-008: Processing ritual screen
**Size:** S
**Depends on:** THEO-007, SUKI-006
**Blocks:** nothing (visual layer only)

Render the three-state processing animation driven by the SSE state machine.

### Acceptance criteria
- [ ] Breathing ring animation plays continuously (expand/contract cycle as specified by Suki)
- [ ] State label (Listening / Choosing cards / Writing) crossfades on state change (200ms)
- [ ] Supporting line "Give it a few breaths." is static — does not change
- [ ] When Stage B is a cache hit (CHOOSING → WRITING happens fast), the animation speeds up naturally — no special treatment needed

---

## THEO-009: Reading display — 3-card layout and Commit band
**Size:** M
**Depends on:** THEO-007, SUKI-007
**Blocks:** THEO-010, THEO-011, THEO-012

Render the reading from the stage_b_complete payload.

### Acceptance criteria
- [ ] Three cards displayed vertically (mobile): Root, Active, Trajectory
- [ ] Per card: Rider-Waite card image, card name, position label, interpretation text
- [ ] Card images load correctly for all 18 cards (by card_id mapping to image assets)
- [ ] Interpretation text from `card.interpretation.commit` renders with correct typography
- [ ] Save button persists the session locally (localStorage or IndexedDB)
- [ ] Reflect button opens a single journaling prompt (text field, no submission required for prototype)

---

## THEO-010: Reading display — Exploratory band (Lens A/B)
**Size:** M
**Depends on:** THEO-009, SUKI-008
**Blocks:** nothing

When `reading.matchscore_mode === "exploratory"`, show two-lens treatment.

### Acceptance criteria
- [ ] "Two plausible readings" header renders above the spread
- [ ] Tabs for Lens A and Lens B are visible; Lens A is selected by default
- [ ] Tapping Lens B switches interpretation text for all three cards simultaneously
- [ ] Card images, names, position labels do not change between tabs
- [ ] Anchor text is visually the same in both tabs (confirm with Suki's annotation)

---

## THEO-011: Reading display — stalker card note and Tier 3 preface
**Size:** S
**Depends on:** THEO-009, SUKI-009, SUKI-010
**Blocks:** nothing

Two optional treatments on the reading screen.

### Acceptance criteria
- [ ] If `card.stalker === true`: one-line note renders immediately below the card name (matches Suki's design)
- [ ] If `reading.major_tier === 3`: one-line preface renders above the spread (matches Suki's design)
- [ ] Stalker note and Tier 3 preface can coexist without layout issues

---

## THEO-012: Warm no screens (Abstain + Pipeline failure)
**Size:** S
**Depends on:** THEO-007, SUKI-011, SUKI-012
**Blocks:** nothing

### Acceptance criteria
- [ ] Abstain warm no: three face-down card backs, correct copy, "Record again" CTA navigates to recording screen and starts a new session
- [ ] Pipeline failure warm no: correct copy, "Try again" CTA navigates to home screen
- [ ] Neither state is an error modal — both render in the main content area
- [ ] Neither shows MatchScore, error codes, or technical details

---

## THEO-013: Dev text mode
**Size:** S
**Depends on:** THEO-005
**Blocks:** nothing

Hidden text input mode for internal testing without recording audio.

### Acceptance criteria
- [ ] Activated by environment variable (`NEXT_PUBLIC_DEV_TEXT_MODE=true`)
- [ ] When active: a text area replaces the recording UI
- [ ] Text is submitted to the API in place of audio
- [ ] Not visible in production builds (environment variable is false by default)
- [ ] No visible toggle or button in the normal user flow
