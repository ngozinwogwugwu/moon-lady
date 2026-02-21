// OMAR-008: Card selection logic — pure function, no LLM calls, no side effects
// Same inputs always produce same outputs.

import { CARD_CATALOG } from './card-catalog.js'
import type { FeatureVector, SelectedCard } from '../types.js'

export type SpreadShape = 'coherent' | 'tensioned' | 'standard'
export type MajorTier = 0 | 1 | 2 | 3
export type MatchscoreMode = 'commit' | 'exploratory'

export interface SelectionResult {
  status: 'ok'
  cards: SelectedCard[]
  spreadShape: SpreadShape
  majorTier: MajorTier
  matchscoreMode: MatchscoreMode
}

export interface AbstainResult {
  status: 'needs_more_input'
}

const AXES = ['S', 'C', 'X', 'O', 'L', 'A'] as const
const EPSILON = 0.001 // tie-breaking threshold
const POSITION_LABELS = {
  past: 'Root',
  present: 'Active',
  future: 'Trajectory',
} as const

export function selectCards(
  featureVector: FeatureVector,
  priorCardIds: string[] = [] // card_ids from earlier spreads in this session (for stalker detection)
): SelectionResult | AbstainResult {
  const fv = [featureVector.S, featureVector.C, featureVector.X, featureVector.O, featureVector.L, featureVector.A]
  const fvMag = magnitude(fv)

  // Score all 18 cards
  const scored = CARD_CATALOG.map((card) => {
    const cv = [card.coords.S, card.coords.C, card.coords.X, card.coords.O, card.coords.L, card.coords.A]
    const cosine = fvMag === 0 ? 0 : dot(fv, cv) / (fvMag * magnitude(cv))
    const score = Math.max(0, Math.min(1, (cosine + 1) / 2))
    return { card, score }
  })

  // Sort: descending by score, alphabetical by card_id for ties within epsilon
  scored.sort((a, b) => {
    const diff = b.score - a.score
    if (Math.abs(diff) <= EPSILON) return a.card.card_id.localeCompare(b.card.card_id)
    return diff
  })

  const top3 = scored.slice(0, 3)

  // Determine matchscore bands
  const bands = top3.map(({ score }) => matchscoreBand(score))

  // Abstain if any card is below 0.40
  if (bands.includes('abstain')) return { status: 'needs_more_input' }

  // Determine primary axis (highest absolute value in feature vector)
  const primaryAxis = AXES.reduce((best, axis) =>
    Math.abs(featureVector[axis]) > Math.abs(featureVector[best]) ? axis : best
  )

  // Assign positions: highest=present, second=future, third=past
  const positions: Array<'past' | 'present' | 'future'> = ['present', 'future', 'past']

  const cards: SelectedCard[] = top3.map(({ card, score }, i) => {
    const position = positions[i]
    const orientation: 'upright' | 'reversed' =
      Math.sign(featureVector[primaryAxis]) === Math.sign(card.coords[primaryAxis]) ? 'upright' : 'reversed'

    return {
      card_id: card.card_id,
      card_name: card.card_name,
      card_type: card.card_type,
      orientation,
      position,
      position_label: POSITION_LABELS[position],
      matchscore: Math.round(score * 1000) / 1000,
      matchscore_band: bands[i] as 'commit' | 'exploratory',
      stalker: priorCardIds.includes(card.card_id),
    }
  })

  const spreadShape = computeSpreadShape(top3.map((s) => s.card.coords))
  const majorTier = computeMajorTier(top3)
  const matchscoreMode: MatchscoreMode = bands.every((b) => b === 'commit') ? 'commit' : 'exploratory'

  return { status: 'ok', cards, spreadShape, majorTier, matchscoreMode }
}

// --- helpers ---

function dot(a: number[], b: number[]): number {
  return a.reduce((sum, ai, i) => sum + ai * b[i], 0)
}

function magnitude(v: number[]): number {
  return Math.sqrt(v.reduce((sum, x) => sum + x * x, 0))
}

function matchscoreBand(score: number): 'commit' | 'exploratory' | 'abstain' {
  if (score >= 0.65) return 'commit'
  if (score >= 0.40) return 'exploratory'
  return 'abstain'
}

function computeSpreadShape(
  coords: Array<{ S: number; C: number; X: number; O: number; L: number; A: number }>
): SpreadShape {
  const [a, b, c] = coords

  // Tensioned: any pair differs by > 0.60 on any single axis
  const pairs: [typeof a, typeof a][] = [[a, b], [b, c], [a, c]]
  for (const [x, y] of pairs) {
    for (const axis of AXES) {
      if (Math.abs(x[axis] - y[axis]) > 0.60) return 'tensioned'
    }
  }

  // Coherent: all 3 cards share ≥ 2 axes within ±0.25 of each other
  let sharedAxes = 0
  for (const axis of AXES) {
    const values = [a[axis], b[axis], c[axis]]
    const range = Math.max(...values) - Math.min(...values)
    if (range <= 0.25) sharedAxes++
  }
  if (sharedAxes >= 2) return 'coherent'

  return 'standard'
}

function computeMajorTier(top3: Array<{ card: typeof CARD_CATALOG[0]; score: number }>): MajorTier {
  const majors = top3.filter(({ card }) => card.card_type === 'Major')

  const tier3Count = majors.filter(({ score }) => score >= 0.92).length
  const tier2Count = majors.filter(({ score }) => score >= 0.83).length
  const tier1Count = majors.filter(({ score }) => score >= 0.70).length

  if (tier3Count >= 3) return 3
  if (tier2Count >= 2) return 2
  if (tier1Count >= 1) return 1
  return 0
}
