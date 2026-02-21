'use client'
// THEO-009: Reading display — 3-card layout, Commit band
// THEO-010: Exploratory band (Lens A/B tabs)
// THEO-011: Stalker card note and Tier 3 preface

import { useState } from 'react'
import { setLastSessionId } from '@/lib/device'
import type { ReadingObject, ReadingCard } from '@/lib/types'

// Card image paths — public domain 1909 Rider-Waite deck
// Images sourced from archive.org / Wikimedia Commons (see Suki's tool-research.md)
// Place JPGs in public/cards/{card_id}.jpg
function cardImageSrc(cardId: string): string {
  return `/cards/${cardId}.jpg`
}

interface Props {
  reading: ReadingObject
  onHome: () => void
}

export default function ReadingScreen({ reading, onHome }: Props) {
  const [lens, setLens] = useState<'a' | 'b'>('a')
  const [reflectOpen, setReflectOpen] = useState(false)
  const isExploratory = reading.matchscore_mode === 'exploratory'

  // Sort cards: past, present, future (Root, Active, Trajectory)
  const orderedCards = [...reading.cards].sort((a, b) => {
    const order = { past: 0, present: 1, future: 2 }
    return order[a.position] - order[b.position]
  })

  function handleSave() {
    setLastSessionId(reading.session_id)
    localStorage.setItem(`ml_reading_${reading.session_id}`, JSON.stringify(reading))
  }

  return (
    <div className="py-8 pb-16">
      {/* Tier 3 preface — THEO-011 */}
      {reading.major_tier === 3 && (
        <p className="font-body text-base italic mb-3">
          This spread carries unusual weight. Read slowly.
        </p>
      )}

      {/* Exploratory header and tabs — THEO-010 */}
      {isExploratory && (
        <div className="mb-6">
          <p className="font-display text-sm font-light text-accent mb-4">
            Two plausible readings
          </p>
          <div className="flex">
            <button
              className={`tab ${lens === 'a' ? 'active' : ''}`}
              onClick={() => setLens('a')}
            >
              Lens A
            </button>
            <button
              className={`tab ${lens === 'b' ? 'active' : ''}`}
              onClick={() => setLens('b')}
            >
              Lens B
            </button>
          </div>
        </div>
      )}

      {/* Three cards */}
      <div className="flex flex-col gap-8">
        {orderedCards.map((card) => (
          <CardBlock
            key={card.card_id}
            card={card}
            isExploratory={isExploratory}
            lens={lens}
          />
        ))}
      </div>

      {/* Post-reading actions */}
      <div className="mt-12 flex gap-6 justify-center">
        <button className="btn-ghost" onClick={handleSave}>
          Save
        </button>
        <button className="btn-ghost" onClick={() => setReflectOpen((v) => !v)}>
          Reflect
        </button>
      </div>

      {reflectOpen && (
        <div className="mt-6">
          <p className="font-body text-base italic mb-3 text-accent">
            What in this reading surprises you?
          </p>
          <textarea
            className="w-full border border-accent bg-transparent font-body text-base p-3 h-32 resize-y"
            placeholder=""
          />
        </div>
      )}

      <div className="mt-8 text-center">
        <button className="btn-ghost" onClick={onHome}>
          ← Home
        </button>
      </div>
    </div>
  )
}

function CardBlock({
  card,
  isExploratory,
  lens,
}: {
  card: ReadingCard
  isExploratory: boolean
  lens: 'a' | 'b'
}) {
  const interpretation = isExploratory
    ? lens === 'a'
      ? card.interpretation.exploratory_a
      : card.interpretation.exploratory_b
    : card.interpretation.commit

  return (
    <div>
      {/* Card image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cardImageSrc(card.card_id)}
        alt={card.card_name}
        className="w-full aspect-[2/3] object-cover"
      />

      {/* Card header */}
      <div className="mt-3">
        <p
          className="font-display text-xs font-light text-accent uppercase"
          style={{ letterSpacing: '0.08em' }}
        >
          {card.position_label}
        </p>
        <p className="font-display text-[1.125rem] font-normal mt-1">{card.card_name}</p>

        {/* Stalker note — THEO-011 */}
        {card.stalker && (
          <p className="font-body text-sm italic text-accent mt-1">
            This card is returning. Sometimes that&apos;s just chance; sometimes
            it&apos;s a theme you&apos;re ready to meet again.
          </p>
        )}
      </div>

      {/* Interpretation text */}
      {interpretation && (
        <p className="font-body text-base leading-[1.65] mt-4">{interpretation}</p>
      )}
    </div>
  )
}
