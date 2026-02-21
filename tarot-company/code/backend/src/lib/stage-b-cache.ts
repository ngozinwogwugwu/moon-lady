// OMAR-009: Stage B cache with advisory locking
// Cache key: SHA-256 of {ontology_version_id}|{card_id}|{orientation}|{spread_shape}|{matchscore_band}|{position}|{major_tier}
// Advisory lock prevents thundering-herd duplicate Stage B calls on cache miss.

import { createHash } from 'crypto'
import { eq, and } from 'drizzle-orm'
import { pool, db } from '../db/client.js'
import { stageBCache } from '../db/schema.js'

export interface CachedInterpretation {
  interpretation_commit: string | null
  interpretation_exploratory_a: string | null
  interpretation_exploratory_b: string | null
  cache_hit: true
}

export function buildCacheKey(params: {
  ontologyVersionId: string
  cardId: string
  orientation: string
  spreadShape: string
  matchscoreBand: string
  position: string
  majorTier: number
}): { hash: string; ontologyVersionId: string } {
  const raw = [
    params.ontologyVersionId,
    params.cardId,
    params.orientation,
    params.spreadShape,
    params.matchscoreBand,
    params.position,
    params.majorTier,
  ].join('|')

  return {
    hash: createHash('sha256').update(raw).digest('hex'),
    ontologyVersionId: params.ontologyVersionId,
  }
}

export async function lookupCache(
  ontologyVersionId: string,
  hash: string
): Promise<CachedInterpretation | null> {
  const rows = await db
    .select()
    .from(stageBCache)
    .where(
      and(
        eq(stageBCache.ontology_version_id, ontologyVersionId),
        eq(stageBCache.cache_key_hash, hash)
      )
    )
    .limit(1)

  if (rows.length === 0) return null

  // Increment hit count
  await db
    .update(stageBCache)
    .set({ hit_count: rows[0].hit_count + 1 })
    .where(
      and(
        eq(stageBCache.ontology_version_id, ontologyVersionId),
        eq(stageBCache.cache_key_hash, hash)
      )
    )

  return {
    interpretation_commit: rows[0].interpretation_commit,
    interpretation_exploratory_a: rows[0].interpretation_exploratory_a,
    interpretation_exploratory_b: rows[0].interpretation_exploratory_b,
    cache_hit: true,
  }
}

// Acquires a PostgreSQL advisory lock scoped to this transaction to prevent
// duplicate Stage B calls for the same cache key under concurrent load.
export async function withCacheLock<T>(
  hash: string,
  fn: () => Promise<T>
): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    // pg_advisory_xact_lock takes a bigint — use hashtext for string → int conversion
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [hash])
    const result = await fn()
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function storeCache(params: {
  ontologyVersionId: string
  hash: string
  cardId: string
  orientation: string
  position: string
  interpretationCommit: string | null
  interpretationExploratoryA: string | null
  interpretationExploratoryB: string | null
}): Promise<void> {
  await db
    .insert(stageBCache)
    .values({
      ontology_version_id: params.ontologyVersionId,
      cache_key_hash: params.hash,
      card_id: params.cardId,
      orientation: params.orientation,
      position: params.position,
      interpretation_commit: params.interpretationCommit,
      interpretation_exploratory_a: params.interpretationExploratoryA,
      interpretation_exploratory_b: params.interpretationExploratoryB,
    })
    .onConflictDoNothing() // race condition safety — advisory lock should prevent this
}
