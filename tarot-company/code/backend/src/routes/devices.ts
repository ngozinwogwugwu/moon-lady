// OMAR-005: Device and disclosure endpoints
import { Hono } from 'hono'
import { eq, and, isNull } from 'drizzle-orm'
import { db } from '../db/client.js'
import { devices } from '../db/schema.js'

const router = new Hono()

// POST /api/devices — create device token record if not exists; return { disclosed: boolean }
// Idempotent: calling with an existing token returns current state
// Device token is the client's UUID — server does not generate it
router.post('/', async (c) => {
  const body = await c.req.json<{ device_token: string }>()
  const { device_token } = body

  if (!device_token) return c.json({ error: 'device_token required' }, 400)

  // Upsert — insert if not exists, ignore conflict
  await db
    .insert(devices)
    .values({ device_token })
    .onConflictDoNothing({ target: devices.device_token })

  const [device] = await db.select().from(devices).where(eq(devices.device_token, device_token)).limit(1)

  return c.json({ disclosed: device.disclosed_at !== null })
})

// POST /api/devices/:token/disclose — record disclosed_at timestamp
// Idempotent: calling again after already disclosed is a no-op
router.post('/:token/disclose', async (c) => {
  const token = c.req.param('token')

  await db
    .update(devices)
    .set({ disclosed_at: new Date() })
    .where(and(eq(devices.device_token, token), isNull(devices.disclosed_at)))

  return c.json({ ok: true })
})

export default router
