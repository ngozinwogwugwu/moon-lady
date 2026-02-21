import { getDeviceToken } from './device'
import type { ReadingObject, WarmNoObject } from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

function headers(): Record<string, string> {
  return { 'X-Device-Token': getDeviceToken() }
}

export async function registerDevice(): Promise<{ disclosed: boolean }> {
  const res = await fetch(`${API_BASE}/api/devices`, {
    method: 'POST',
    headers: { ...headers(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ device_token: getDeviceToken() }),
  })
  return res.json()
}

export async function confirmDisclosure(): Promise<void> {
  const token = getDeviceToken()
  await fetch(`${API_BASE}/api/devices/${token}/disclose`, {
    method: 'POST',
    headers: headers(),
  })
}

export async function uploadAudio(audioBlob: Blob): Promise<{ session_id: string }> {
  const form = new FormData()
  const mimeType = audioBlob.type || 'audio/webm'
  const ext = mimeType.includes('mp4') ? 'mp4' : 'webm'
  form.append('audio', new File([audioBlob], `recording.${ext}`, { type: mimeType }))
  form.append('device_token', getDeviceToken())

  const res = await fetch(`${API_BASE}/api/sessions/upload`, {
    method: 'POST',
    headers: headers(),
    body: form,
  })
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
  return res.json()
}

export async function uploadText(text: string): Promise<{ session_id: string }> {
  const form = new FormData()
  form.append('text', text)
  form.append('device_token', getDeviceToken())

  const res = await fetch(`${API_BASE}/api/sessions/upload`, {
    method: 'POST',
    headers: headers(),
    body: form,
  })
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
  return res.json()
}

export async function getSession(sessionId: string): Promise<ReadingObject | WarmNoObject> {
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}`, { headers: headers() })
  if (!res.ok) throw new Error(`Session fetch failed: ${res.status}`)
  return res.json()
}

export function openSSEStream(
  sessionId: string,
  handlers: {
    onTranscriptionComplete: () => void
    onStageAComplete: (status: 'ok' | 'needs_more_input') => void
    onStageBComplete: (reading: ReadingObject) => void
    onError: (stage: string) => void
  }
): () => void {
  let reconnectAttempted = false
  let done = false

  function connect() {
    const es = new EventSource(`${API_BASE}/api/sessions/${sessionId}/stream`)

    es.addEventListener('transcription_complete', () => handlers.onTranscriptionComplete())

    es.addEventListener('stage_a_complete', (e) => {
      const data = JSON.parse(e.data)
      handlers.onStageAComplete(data.status)
      if (data.status === 'needs_more_input') { done = true; es.close() }
    })

    es.addEventListener('stage_b_complete', (e) => {
      const data = JSON.parse(e.data)
      done = true
      es.close()
      handlers.onStageBComplete(data.reading)
    })

    es.addEventListener('pipeline_error', (e) => {
      const data = JSON.parse(e.data)
      done = true
      es.close()
      handlers.onError(data.stage)
    })

    es.onerror = () => {
      if (done) return
      es.close()
      if (!reconnectAttempted) {
        reconnectAttempted = true
        setTimeout(connect, 2000)
      } else {
        handlers.onError('connection')
      }
    }

    return es
  }

  const es = connect()
  return () => { done = true; es?.close() }
}
