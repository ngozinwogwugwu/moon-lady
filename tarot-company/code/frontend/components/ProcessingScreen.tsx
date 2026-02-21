'use client'
// THEO-007: SSE client and pipeline state machine
// THEO-008: Processing ritual screen (breathing ring + state label crossfade)

import { useEffect, useRef, useState } from 'react'
import { openSSEStream } from '@/lib/api'
import type { PipelineState, ReadingObject } from '@/lib/types'

const STATE_LABELS: Partial<Record<PipelineState, string>> = {
  listening: 'Listening',
  choosing: 'Choosing cards',
  writing: 'Writing',
}

interface Props {
  sessionId: string
  onReading: (reading: ReadingObject) => void
  onAbstain: () => void
  onError: () => void
}

export default function ProcessingScreen({ sessionId, onReading, onAbstain, onError }: Props) {
  const [pipelineState, setPipelineState] = useState<PipelineState>('listening')
  const [labelVisible, setLabelVisible] = useState(true)
  const cleanupRef = useRef<(() => void) | null>(null)

  function transitionLabel(next: PipelineState) {
    // 200ms fade-out, swap, fade-in
    setLabelVisible(false)
    setTimeout(() => {
      setPipelineState(next)
      setLabelVisible(true)
    }, 200)
  }

  useEffect(() => {
    cleanupRef.current = openSSEStream(sessionId, {
      onTranscriptionComplete: () => transitionLabel('choosing'),
      onStageAComplete: (status) => {
        if (status === 'needs_more_input') {
          onAbstain()
        } else {
          transitionLabel('writing')
        }
      },
      onStageBComplete: (reading) => onReading(reading),
      onError: () => onError(),
    })

    return () => cleanupRef.current?.()
  }, [sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  const label = STATE_LABELS[pipelineState] ?? 'Listening'

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-6">
      {/* Breathing ring — SUKI-006 */}
      <div className="breathing-ring" role="presentation" />

      {/* State label with crossfade */}
      <p
        className={`font-display text-lg font-normal crossfade ${labelVisible ? '' : 'crossfade-hidden'}`}
      >
        {label}
      </p>

      {/* Static supporting line */}
      <p className="font-body text-sm italic text-accent">
        Give it a few breaths.
      </p>
    </div>
  )
}
