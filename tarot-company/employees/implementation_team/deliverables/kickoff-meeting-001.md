# Implementation Team Kickoff — Meeting 001
**Date:** 2026-02-21
**Attendees:** Ngozi (CEO), Suki Nakamura (UX), Theo Park (Frontend), Omar Yusuf (Backend), Priya Nair (AI/ML)
**Purpose:** Surface unknown unknowns, agree on unresolved decisions, define research areas, set critical path

---

## Opening

**Ngozi:** Everyone has read the prototype spec. Today is not about re-explaining the spec — it's about finding the gaps. What do you not know that you need to know before you can start? What worries you? What's underspecified? Let's find the real work. Two constraints: prefer free tools where possible, and I already have a Railway project running, so we should reuse that for deployment rather than starting fresh.

---

## Unknown Unknowns — Raised by Each Member

### Suki

**Platform?** The spec says "web client" but doesn't say mobile or desktop. Voice memo recording is a primarily mobile behavior. Is this a mobile-first web app? A PWA? A native app? This changes the design significantly.

**Rider-Waite images?** The spec references canonical Rider-Waite card images. Do we have them? What's the licensing situation?

**Card image treatment?** The reading anchor references specific image details ("the grip of the coin held to the chest"). Does the user see the full card face, a cropped detail, or just the card name? This is a design decision that affects interpretation.

### Theo

**Upload + SSE in the same request?** The spec says POST audio and return an SSE stream. That's a multipart form upload returning a streaming response — unusual and browser-inconsistent. Is this one request or two?

**iOS audio recording?** Safari has specific constraints on MediaRecorder. webm/opus doesn't work. iOS records in mp4/aac. What format does Whisper accept, and do we need client-side transcoding?

**Whisper latency?** A 5-minute audio file could take 15–30 seconds on the Whisper API. That blows the entire 10-second pipeline ceiling before Stage A even starts. Has this been modeled?

### Omar

**Whisper latency concern (seconding Theo).** This is the most significant risk I see. For a 3-minute memo, Whisper typically takes 8–15 seconds alone. We'd need to pipeline the upload differently.

**Railway project — what's already there?** Ngozi, what services are on the Railway project? Just a starter? Are there any services deployed already?

**Node or Python?** The spec is language-agnostic. The choice affects which libraries are available, how SSE is implemented, and deployment configuration. This needs to be decided before I can start.

### Priya

**Stage A: zero-shot or few-shot?** Axis extraction is subtle. "Stability vs Volatility" is not self-explanatory to an LLM. Zero-shot may collapse to central values for ambiguous transcripts. Do we want few-shot examples in the Stage A prompt?

**Structured output method?** Anthropic has a `tools` feature that forces structured JSON output via a schema definition — much more reliable than "please return JSON." Should Stage A use tools/function-calling for the feature vector output?

**Stage B: how do we evaluate quality during development?** The voice register constraints are specific and hard to verify automatically. Who reviews Stage B output before we hand the pipeline contract to Omar?

---

## Decisions Reached

### 1. Platform: Mobile-first web (PWA)

**Ngozi:** Mobile-first. Users will record voice memos on their phones. This is a PWA — installable, offline-capable eventually, but web-based. No App Store.

**Suki:** Design for iPhone viewport first. Desktop is secondary for the prototype.

### 2. Upload + SSE: Two-step pattern

**Omar:** Simplest and most compatible pattern: `POST /api/sessions` receives the audio, returns a JSON response with `{"session_id": "...", "status": "processing"}`. Then the client connects to `GET /api/sessions/:id/stream` as a separate SSE connection. The processing pipeline runs in the background between the two.

**Theo:** That works cleanly. I can open the SSE connection immediately after receiving the session_id. No multipart + streaming weirdness.

**Decision:** Two-step. POST audio → receive session_id → connect to SSE stream.

### 3. Whisper latency: Begin upload earlier + reduce recording cap

**Omar:** If we start the audio upload as soon as the user taps "Finish" (before they see the review screen), we buy 5–15 seconds while they're reviewing. By the time they tap "Submit," transcription may be nearly complete.

**Theo:** I can POST the audio in the background during the review screen and hold the session_id. When the user taps "Submit," I connect to the SSE stream — which is likely already past "Listening" at that point.

**Ngozi:** Do it. And reduce the recording cap. 1–3 minutes is the design intent anyway. The 5-minute cap in the spec was conservative. Prototype cap: **2 minutes hard stop, 90-second soft warning**.

**Decision:** Background upload starts on "Finish" press. Hard cap reduced to 2 minutes for prototype.

### 4. iOS audio format

**Theo:** iOS Safari records in mp4/aac by default. Whisper accepts mp4, so no transcoding needed. I just need to detect the format and not assume webm.

**Decision:** Accept whatever format the browser produces. The backend passes it to Whisper as-is. Whisper handles mp4, webm, wav, mp3.

### 5. Rider-Waite images: use public domain originals

**Ngozi:** The original 1909 Rider-Waite deck is public domain in the US (Pamela Colman Smith died 1951, Arthur Waite 1942). We use those scans. Do NOT use Universal Waite or any reformatted/recolored version — those are not public domain.

**Suki:** I'll source high-res scans from archive.org or Wikimedia Commons. Individual card images are widely available.

**Decision:** Public domain 1909 Rider-Waite scans. Suki sources them.

### 6. Language: TypeScript/Node for backend

**Omar:** Node/TypeScript is the right choice for Railway, SSE, and the kind of lightweight API this is. Python/FastAPI is stronger for ML-heavy work, but Priya's pipeline is API calls — no local model serving.

**Priya:** Agreed. The AI work is prompts + API calls. Language doesn't matter much; Node is fine.

**Decision:** Node.js + TypeScript. Hono or Express (Omar researches).

### 7. Stage A: tools/function-calling for structured output

**Priya:** Anthropic `tools` feature forces the LLM to return a specific JSON schema. Much more reliable than asking for JSON in the prompt. I'll design Stage A as a tool call with a defined parameter schema.

**Decision:** Stage A uses Anthropic tools for structured output.

### 8. Stage B quality review: Priya reviews before handoff

**Ngozi:** Priya manually reviews Stage B output for 5+ transcripts before producing the pipeline contract. She evaluates against the voice register checklist (no predictive language, no oracular register, interiority-first, exactly one anchor). That's the gate before Omar integrates.

---

## Critical Path

```
Priya: Stage A prompt + contract schema   ──────┐
Priya: Stage B prompt                            │
                                                  ▼
Omar: Provider abstraction layer         ← (unblocked)
Omar: DB schema + migrations             ← (unblocked)
Omar: Transcription step                 ← (unblocked)
                                                  │
Omar: Pipeline integration         ◄─── Priya's contract
                                                  │
Theo: SSE client                   ◄─── Omar's SSE spec (from contract)
Theo: Reading display              ◄─── Omar's ReadingObject schema
                                                  │
Suki: All screens (parallel — unblocked from day 1)
```

**First thing Monday:** Priya delivers pipeline contract. Everything else unblocks from there.

---

## Research Assignments (1 hour each)

Each member does a focused research sprint on their tool choices before producing tickets.

| Member | Research focus |
|---|---|
| Suki | Design tooling, Rider-Waite image sources, mobile web design patterns for contemplative apps |
| Theo | Frontend framework (Next.js vs others), voice recording across browsers, SSE client, animation for processing ritual |
| Omar | Backend framework (Hono vs Express), Drizzle ORM, Railway config for existing project |
| Priya | Anthropic tools/structured output, few-shot vs zero-shot for axis extraction, Stage B prompt patterns |

---

## Open Items (unresolved, carry forward)

1. **Card image display treatment** — Full card face vs. cropped detail vs. card name only. Suki decides during design research.
2. **Warm no retry continuity** — Does re-recording after an abstain create a new session or extend the current one? Omar and Theo align post-research.
3. **Disclosure confirmation API** — Separate endpoint or embedded in the first session POST? Omar decides and documents in the contract.
4. **Dev text mode toggle** — How does Theo surface the hidden text input? Long-press somewhere? URL param? Decide during implementation.
