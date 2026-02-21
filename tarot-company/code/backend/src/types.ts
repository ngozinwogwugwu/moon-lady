// Shared types — referenced by stages.ts, session-bus.ts, and routes/sessions.ts

export interface FeatureVector {
  S: number
  C: number
  X: number
  O: number
  L: number
  A: number
  domain: 'foundation' | 'motion' | 'interior' | 'relation' | 'threshold' | 'none'
  reasoning: string
}

export interface SelectedCard {
  card_id: string
  card_name: string
  card_type: 'Major' | 'Minor'
  orientation: 'upright' | 'reversed'
  position: 'past' | 'present' | 'future'
  position_label: 'Root' | 'Active' | 'Trajectory'
  matchscore: number
  matchscore_band: 'commit' | 'exploratory'
  stalker: boolean
}

export interface CardInterpretation {
  commit?: string
  exploratory_a?: string
  exploratory_b?: string
}

export interface ReadingCard extends SelectedCard {
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

export type PipelineEventType =
  | 'transcription_complete'
  | 'stage_a_complete'
  | 'stage_b_complete'
  | 'pipeline_error'

export interface PipelineEvent {
  type: PipelineEventType
  data: Record<string, unknown>
}
