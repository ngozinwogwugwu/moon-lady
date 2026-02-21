'use client'
// THEO-004: Home screen

import { useState } from 'react'
import { getLastSessionId } from '@/lib/device'
import type { ReadingObject } from '@/lib/types'

interface Props {
  onRecord: () => void
  onLastReading: (reading: ReadingObject) => void
}

export default function HomeScreen({ onRecord, onLastReading }: Props) {
  const [showWhat, setShowWhat] = useState(false)
  const lastSessionId = getLastSessionId()

  function handleLastReading() {
    const stored = typeof window !== 'undefined'
      ? localStorage.getItem(`ml_reading_${lastSessionId}`)
      : null
    if (stored) onLastReading(JSON.parse(stored))
  }

  return (
    <div className="min-h-dvh flex flex-col justify-center py-16">
      <p className="font-display text-[1.75rem] font-light mb-12">Moon Lady</p>

      <button className="btn-primary mb-4" onClick={onRecord}>
        Record your memo
      </button>

      <button className="btn-ghost" onClick={() => setShowWhat((v) => !v)}>
        What is this?
      </button>

      {showWhat && (
        <p className="font-body text-base leading-relaxed mt-4 text-accent">
          A voice memo becomes a tarot reading. Speak for a minute or two about
          whatever is most present. The app listens, draws three cards, and
          offers a reflection. Nothing is predicted. Nothing is prescribed.
        </p>
      )}

      {lastSessionId && (
        <button className="btn-ghost mt-8" onClick={handleLastReading}>
          Your last reading →
        </button>
      )}
    </div>
  )
}
