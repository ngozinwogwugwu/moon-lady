// Types matching the backend's src/types.ts — kept in sync manually for prototype

export interface CardInterpretation {
  commit?: string
  exploratory_a?: string
  exploratory_b?: string
}

export interface ReadingCard {
  card_id: string
  card_name: string
  card_type: 'Major' | 'Minor'
  orientation: 'upright' | 'reversed'
  position: 'past' | 'present' | 'future'
  position_label: 'Root' | 'Active' | 'Trajectory'
  matchscore: number
  matchscore_band: 'commit' | 'exploratory'
  stalker: boolean
  interpretation: CardInterpretation
  cache_hit: boolean
}

export interface ReadingObject {
  session_id: string
  matchscore_mode: 'commit' | 'exploratory'
  spread_shape: 'coherent' | 'tensioned' | 'standard'
  major_tier: 0 | 1 | 2 | 3
  cards: ReadingCard[]
}

export interface WarmNoObject {
  session_id: string
  reason: 'needs_more_input'
}

export type PipelineState =
  | 'idle'
  | 'listening'
  | 'choosing'
  | 'writing'
  | 'reading'
  | 'warm_no_abstain'
  | 'warm_no_error'
