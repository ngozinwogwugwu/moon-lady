// In-memory event bus: connects background pipeline → SSE stream
// The pipeline emits events; the SSE route drains them.
// Buffered events allow SSE clients that connect after pipeline has already progressed.

import { EventEmitter } from 'events'
import type { PipelineEvent } from '../types.js'

interface SessionBusState {
  buffered: PipelineEvent[]
  done: boolean
  emitter: EventEmitter
}

const bus = new Map<string, SessionBusState>()

export function initSession(sessionId: string): void {
  bus.set(sessionId, {
    buffered: [],
    done: false,
    emitter: new EventEmitter(),
  })
}

export function emit(sessionId: string, event: PipelineEvent): void {
  const state = bus.get(sessionId)
  if (!state) return
  state.buffered.push(event)
  state.emitter.emit('event', event)
  if (event.type === 'stage_b_complete' || event.type === 'pipeline_error') {
    state.done = true
    // Keep the state for 60s to allow reconnects; then clean up
    setTimeout(() => bus.delete(sessionId), 60_000)
  }
}

export function getState(sessionId: string): SessionBusState | undefined {
  return bus.get(sessionId)
}
