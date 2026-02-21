// OMAR-006: Audio upload endpoint
// OMAR-007: SSE stream endpoint + pipeline orchestration
// OMAR-011: Session retrieval endpoint

import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { eq, and } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { db } from '../db/client.js'
import { sessions, devices } from '../db/schema.js'
import { transcribe } from '../lib/transcription.js'
import { runPipeline } from '../lib/stages.js'
import { initSession, emit, getState } from '../lib/session-bus.js'
import type { ReadingObject, WarmNoObject } from '../types.js'

const router = new Hono()
const ONTOLOGY_VERSION_ID = process.env.ONTOLOGY_VERSION_ID ?? 'prototype-v1'
const DEV_TEXT_MODE = process.env.DEV_TEXT_MODE === 'true'

// ---- OMAR-006: Audio upload ----

// POST /api/sessions/upload
// Accepts multipart/form-data with `audio` (File) and `device_token` (string)
// In DEV_TEXT_MODE: accepts `text` field instead of `audio`
// Returns 202 immediately; pipeline runs in background
router.post('/upload', async (c) => {
  const formData = await c.req.formData()
  const deviceToken = formData.get('device_token') as string | null

  if (!deviceToken) return c.json({ error: 'device_token required' }, 400)

  // OMAR-006: Reject if device has not confirmed disclosure
  const [device] = await db.select().from(devices).where(eq(devices.device_token, deviceToken)).limit(1)
  if (!device || device.disclosed_at === null) {
    return c.json({ error: 'disclosure_required' }, 403)
  }

  const sessionId = randomUUID()

  // Create session record — audio never persisted
  await db.insert(sessions).values({
    session_id: sessionId,
    device_token: deviceToken,
    ontology_version_id: ONTOLOGY_VERSION_ID,
    status: 'processing',
  })

  // Initialize in-memory event bus for this session
  initSession(sessionId)

  // Start pipeline in background (do not await)
  void runSessionPipeline({ sessionId, deviceToken, formData })

  return c.json({ session_id: sessionId, status: 'processing' }, 202)
})

async function runSessionPipeline(params: {
  sessionId: string
  deviceToken: string
  formData: FormData
}): Promise<void> {
  const { sessionId, deviceToken, formData } = params

  // Collect prior card IDs in this session for stalker detection
  const priorSessions = await db
    .select({ cards: sessions.cards })
    .from(sessions)
    .where(and(eq(sessions.device_token, deviceToken), eq(sessions.status, 'ok')))

  const priorCardIds: string[] = priorSessions
    .flatMap((s) => (s.cards as Array<{ card_id: string }> | null) ?? [])
    .map((c) => c.card_id)

  try {
    // Step 1: Transcription
    let transcript: string

    if (DEV_TEXT_MODE) {
      // DEV_TEXT_MODE: accept text field in place of audio
      transcript = (formData.get('text') as string | null) ?? ''
    } else {
      const audioFile = formData.get('audio') as File | null
      if (!audioFile) throw new Error('audio field required')
      // Audio is never written to disk — passed directly to Whisper
      transcript = await transcribe(audioFile)
      // audioFile reference ends here — eligible for GC
    }

    await db.update(sessions).set({ transcript_text: transcript }).where(eq(sessions.session_id, sessionId))

    emit(sessionId, { type: 'transcription_complete', data: { session_id: sessionId } })

    // Steps 2–3: Stage A, card selection, Stage B
    const result = await runPipeline({
      transcript,
      sessionId,
      ontologyVersionId: ONTOLOGY_VERSION_ID,
      priorCardIds,
    })

    if (result.reason === 'needs_more_input') {
      // Warm no — Abstain
      await db
        .update(sessions)
        .set({ status: 'needs_more_input', stage_a_status: 'needs_more_input' })
        .where(eq(sessions.session_id, sessionId))

      emit(sessionId, {
        type: 'stage_a_complete',
        data: { session_id: sessionId, status: 'needs_more_input' },
      })
      return
    }

    const reading = result as ReadingObject & {
      featureVector: Record<string, unknown>
      latencyMs: { stageA: number; stageB: number }
    }

    emit(sessionId, {
      type: 'stage_a_complete',
      data: { session_id: sessionId, status: 'ok' },
    })

    // Persist completed session
    const cacheHit = reading.cards.every((c) => c.cache_hit)
    await db
      .update(sessions)
      .set({
        status: 'ok',
        feature_vector: reading.featureVector,
        domain: reading.featureVector.domain as string,
        stage_a_status: 'ok',
        stage_a_latency_ms: reading.latencyMs.stageA,
        spread_shape: reading.spread_shape,
        major_tier: reading.major_tier,
        matchscore_mode: reading.matchscore_mode,
        cards: reading.cards,
        stage_b_latency_ms: reading.latencyMs.stageB,
        cache_hit: cacheHit,
      })
      .where(eq(sessions.session_id, sessionId))

    emit(sessionId, {
      type: 'stage_b_complete',
      data: {
        session_id: sessionId,
        reading: sanitizeReading(reading),
        cache_hit: cacheHit,
      },
    })
  } catch (err) {
    console.error('Pipeline error', { sessionId, err })

    const stage = err instanceof Error && err.name === 'StageAError'
      ? 'stage_a'
      : err instanceof Error && err.name === 'StageBError'
      ? 'stage_b'
      : err instanceof Error && err.name === 'TranscriptionError'
      ? 'transcription'
      : 'stage_b'

    await db.update(sessions).set({ status: 'error' }).where(eq(sessions.session_id, sessionId))

    emit(sessionId, {
      type: 'pipeline_error',
      data: { session_id: sessionId, stage },
    })
  }
}

// ---- OMAR-007: SSE stream ----

// GET /api/sessions/:id/stream
// Emits pipeline events as they happen. Replays buffered events for late-connecting clients.
router.get('/:id/stream', async (c) => {
  const sessionId = c.req.param('id')

  return streamSSE(c, async (stream) => {
    const state = getState(sessionId)

    if (!state) {
      // Unknown session — emit error and close
      await stream.writeSSE({
        event: 'pipeline_error',
        data: JSON.stringify({ session_id: sessionId, stage: 'stage_b' }),
      })
      return
    }

    // Replay all buffered events (handles clients connecting after pipeline progressed)
    for (const event of state.buffered) {
      await stream.writeSSE({ event: event.type, data: JSON.stringify(event.data) })
    }

    if (state.done) return

    // Listen for new events
    await new Promise<void>((resolve) => {
      const handler = async (event: { type: string; data: Record<string, unknown> }) => {
        await stream.writeSSE({ event: event.type, data: JSON.stringify(event.data) })
        if (event.type === 'stage_b_complete' || event.type === 'pipeline_error') {
          resolve()
        }
      }

      state.emitter.on('event', handler)

      stream.onAbort(() => {
        state.emitter.off('event', handler)
        resolve()
      })
    })
  })
})

// ---- OMAR-011: Session retrieval ----

// GET /api/sessions/:id
// Returns ReadingObject or WarmNoObject for completed sessions.
// Does NOT return transcript_text or feature_vector.
router.get('/:id', async (c) => {
  const sessionId = c.req.param('id')
  const deviceToken = c.req.header('X-Device-Token')

  const [session] = await db.select().from(sessions).where(eq(sessions.session_id, sessionId)).limit(1)

  if (!session) return c.json({ error: 'not_found' }, 404)

  if (session.device_token !== deviceToken) return c.json({ error: 'forbidden' }, 403)

  if (session.status === 'needs_more_input') {
    return c.json({ session_id: sessionId, reason: 'needs_more_input' } satisfies WarmNoObject)
  }

  if (session.status !== 'ok' || !session.cards) {
    return c.json({ error: 'not_ready' }, 202)
  }

  const reading: ReadingObject = {
    session_id: sessionId,
    matchscore_mode: session.matchscore_mode as 'commit' | 'exploratory',
    spread_shape: session.spread_shape as ReadingObject['spread_shape'],
    major_tier: session.major_tier as ReadingObject['major_tier'],
    cards: session.cards as ReadingObject['cards'],
  }

  // OMAR-011: do not return transcript_text or feature_vector
  return c.json(reading)
})

// Strip internal-only fields before sending ReadingObject to client
function sanitizeReading(reading: ReadingObject & { featureVector?: unknown; latencyMs?: unknown }): ReadingObject {
  const { featureVector: _fv, latencyMs: _lat, ...safe } = reading as ReadingObject & {
    featureVector: unknown
    latencyMs: unknown
  }
  return safe
}

export default router
