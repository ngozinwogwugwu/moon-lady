import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import devicesRouter from './routes/devices.js'
import sessionsRouter from './routes/sessions.js'

const app = new Hono()

// OMAR-001: CORS — accept requests from frontend service URL
app.use(
  '*',
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'X-Device-Token'],
  })
)

// OMAR-001: Health check — always-warm deployment check
app.get('/health', (c) => c.json({ ok: true }))

app.route('/api/devices', devicesRouter)
app.route('/api/sessions', sessionsRouter)

const port = Number(process.env.PORT) || 3001
serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running on port ${port}`)
})

export default app
