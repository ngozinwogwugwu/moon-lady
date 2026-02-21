import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  primaryKey,
  index,
} from 'drizzle-orm/pg-core'

// OMAR-002: All 4 tables per prototype spec §5

export const devices = pgTable('devices', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  device_token: text('device_token').notNull().unique(),
  disclosed_at: timestamp('disclosed_at', { withTimezone: true }), // nullable — device exists before disclosure
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const sessions = pgTable(
  'sessions',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    session_id: text('session_id').notNull().unique(),
    device_token: text('device_token').notNull(),
    ontology_version_id: text('ontology_version_id').notNull(),
    status: text('status').notNull().default('processing'), // processing | ok | needs_more_input | error
    // Stored for prototype debugging — note for manual cleanup before V0
    transcript_text: text('transcript_text'),
    // Stage A outputs
    feature_vector: jsonb('feature_vector'),
    domain: text('domain'),
    stage_a_status: text('stage_a_status'), // ok | needs_more_input
    stage_a_latency_ms: integer('stage_a_latency_ms'),
    // Card selection outputs
    spread_shape: text('spread_shape'),
    major_tier: integer('major_tier'),
    matchscore_mode: text('matchscore_mode'),
    // Stage B outputs — array of 3 card objects with interpretation text
    cards: jsonb('cards'),
    stage_b_latency_ms: integer('stage_b_latency_ms'),
    cache_hit: boolean('cache_hit'),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    deviceTokenIdx: index('sessions_device_token_idx').on(table.device_token),
    createdAtIdx: index('sessions_created_at_idx').on(table.created_at),
  })
)

export const stageBCache = pgTable(
  'stage_b_cache',
  {
    ontology_version_id: text('ontology_version_id').notNull(),
    // SHA-256 of: {ontology_version_id}|{card_id}|{orientation}|{spread_shape}|{matchscore_band}|{position}|{major_tier}
    cache_key_hash: text('cache_key_hash').notNull(),
    card_id: text('card_id').notNull(),
    orientation: text('orientation').notNull(),
    position: text('position').notNull(),
    interpretation_commit: text('interpretation_commit'),
    interpretation_exploratory_a: text('interpretation_exploratory_a'),
    interpretation_exploratory_b: text('interpretation_exploratory_b'),
    hit_count: integer('hit_count').notNull().default(0),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.ontology_version_id, table.cache_key_hash] }),
  })
)

export const telemetryEvents = pgTable('telemetry_events', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  session_id: text('session_id'),
  device_token: text('device_token'),
  event_type: text('event_type').notNull(),
  event_data: jsonb('event_data'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
