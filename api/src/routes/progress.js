import { Hono } from 'hono'

const progress = new Hono()

// Helper: extract email from the simple token we issue on login
function emailFromToken(c) {
  const auth = c.req.header('Authorization') ?? ''
  const token = auth.replace('Bearer ', '')
  if (!token) return null
  try {
    const decoded = atob(token)
    return decoded.split(':')[0]
  } catch {
    return null
  }
}

// GET /api/progress
// Returns the stored reading progress for the authenticated user.
progress.get('/', async (c) => {
  const email = emailFromToken(c)
  if (!email) return c.json({ error: 'Unauthorised.' }, 401)

  const raw = await c.env.ECLIPSE_KV.get(`progress:${email}`)
  const data = raw ? JSON.parse(raw) : {
    completedVolumes: [],
    completedChapters: {},
    currentVolume: 1,
    currentChapter: 1,
    readingStreak: 0,
    apostlesEncountered: [],
    recentActivity: [],
    lastRead: null,
    volumeRatings: {},
    volumeNotes: {},
    wishlist: [],
    readingGoal: null,
  }

  return c.json(data)
})

// PUT /api/progress
// Saves the full progress object sent from the frontend.
progress.put('/', async (c) => {
  const email = emailFromToken(c)
  if (!email) return c.json({ error: 'Unauthorised.' }, 401)

  const body = await c.req.json()
  await c.env.ECLIPSE_KV.put(`progress:${email}`, JSON.stringify(body))

  return c.json({ message: 'Progress saved.' })
})

export default progress
