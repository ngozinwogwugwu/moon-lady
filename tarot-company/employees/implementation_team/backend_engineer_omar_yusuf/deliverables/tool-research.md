# Tool Research — Backend Engineer
**Owner:** Omar Yusuf
**Sprint:** Prototype / 1-hour research

---

## Framework

**Hono (free, MIT)**

Hono is a lightweight TypeScript web framework with first-class SSE support, minimal dependencies, and clean Railway deployment. It's significantly faster than Express and has better TypeScript ergonomics.

SSE is a first-class primitive in Hono:
```typescript
app.get('/api/sessions/:id/stream', (c) => {
  return streamSSE(c, async (stream) => {
    await stream.writeSSE({ event: 'transcription_complete', data: JSON.stringify({...}) })
    // ...
  })
})
```

**Express considered:** Mature, familiar, but SSE requires manual headers and flushing. More boilerplate for the same result.

**FastAPI (Python) considered:** Strong for ML-heavy work, but this backend is primarily I/O (API calls, DB writes). Node/TypeScript is faster to build here and Priya's AI pipeline is API calls, not local inference.

**Decision: Hono + TypeScript.**

---

## ORM and Migrations

**Drizzle ORM (free, MIT)**

TypeScript-first ORM with compile-time query validation. Schema defined in code — migrations generated automatically.

Why Drizzle over Prisma:
- Smaller bundle, faster cold starts
- Schema definition is plain TypeScript (no .prisma file)
- Drizzle Kit for migrations is simple CLI

```typescript
// schema.ts
export const sessions = pgTable('sessions', {
  sessionId: uuid('session_id').primaryKey().defaultRandom(),
  deviceToken: text('device_token').notNull(),
  // ...
})
```

**Decision: Drizzle ORM + Drizzle Kit.**

---

## Postgres Client

**`postgres` npm package (free, MIT)** — used by Drizzle internally. No additional setup.

Railway managed Postgres: add the Postgres plugin to Ngozi's existing Railway project. Connection string injected as `DATABASE_URL` environment variable automatically.

---

## Railway Setup

**Ngozi's existing Railway project** — add two services:
1. **Backend service** (Hono Node.js) — deploy from the repository
2. **Postgres plugin** — add via Railway dashboard, auto-injects `DATABASE_URL`

Frontend (Next.js) can go in the same Railway project as a third service, OR deploy to Vercel and call the Railway backend API. Omar recommends keeping everything in one Railway project for simplicity.

Railway Nixpacks auto-detects Node.js. No Dockerfile needed for the prototype.

---

## Audio / Transcription

**OpenAI `openai` npm package (free, MIT)**

```typescript
const transcription = await openai.audio.transcriptions.create({
  file: audioFile,
  model: 'whisper-1',
})
```

**Latency findings (critical):**
- 30-second memo: ~2–4 seconds on Whisper API
- 90-second memo: ~5–10 seconds
- 2-minute memo: ~8–15 seconds

The kickoff decision to upload during the review screen (background upload starts on "Finish" press) effectively hides most Whisper latency. By the time the user taps "Submit," transcription is likely complete or nearly complete.

**Implementation:** `POST /api/sessions/upload` — receives audio, starts background job, returns `session_id` immediately. The SSE stream endpoint then emits `transcription_complete` when Whisper responds.

The "upload on Finish" pattern means: the client uploads as soon as the user finishes recording. The `session_id` comes back. The user sees the review screen. When they tap "Submit," the client connects to the SSE stream — transcription is likely already done.

---

## File/Audio Handling

**`multer` (free, MIT)** for multipart form data parsing in Node. Or Hono's built-in `parseBody` for multipart — checking if this is sufficient.

Audio file is held in memory (not written to disk) during the upload. Passed directly to Whisper API. Deleted from memory after transcription returns. Never persisted.

---

## Cosine Similarity (Card Selection)

**No library.** The cosine similarity computation over 18 cards is 6-dimensional. It's ~20 lines of code:

```typescript
function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0)
  const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0))
  const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0))
  return dot / (magA * magB)
}
```

The card catalog (18 entries × 6 floats) is a static JSON constant in the codebase. No database lookup needed.

---

## Dependency Summary

```json
{
  "dependencies": {
    "hono": "latest",
    "@hono/node-server": "latest",
    "drizzle-orm": "latest",
    "postgres": "latest",
    "openai": "latest",
    "@anthropic-ai/sdk": "latest",
    "zod": "latest"
  },
  "devDependencies": {
    "typescript": "5.x",
    "drizzle-kit": "latest",
    "@types/node": "latest",
    "tsx": "latest"
  }
}
```

**Total: minimal footprint. All free/MIT licensed.**
