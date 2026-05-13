import { Hono } from 'hono'

const user = new Hono()

function emailFromToken(c) {
  const auth = c.req.header('Authorization') ?? ''
  const token = auth.replace('Bearer ', '')
  if (!token) return null
  try { return atob(token).split(':')[0] } catch { return null }
}

// GET /api/user
// Returns the current user's profile.
user.get('/', async (c) => {
  const email = emailFromToken(c)
  if (!email) return c.json({ error: 'Unauthorised.' }, 401)

  const raw = await c.env.ECLIPSE_KV.get(`user:${email}`)
  if (!raw) return c.json({ error: 'User not found.' }, 404)

  const { username, email: userEmail, createdAt } = JSON.parse(raw)
  return c.json({ username, email: userEmail, createdAt })
})

// PUT /api/user
// Updates the user's display name.
user.put('/', async (c) => {
  const email = emailFromToken(c)
  if (!email) return c.json({ error: 'Unauthorised.' }, 401)

  const { username } = await c.req.json()
  if (!username?.trim()) return c.json({ error: 'Username cannot be empty.' }, 400)

  const raw = await c.env.ECLIPSE_KV.get(`user:${email}`)
  if (!raw) return c.json({ error: 'User not found.' }, 404)

  const userData = JSON.parse(raw)
  userData.username = username.trim()
  await c.env.ECLIPSE_KV.put(`user:${email}`, JSON.stringify(userData))

  return c.json({ message: 'Username updated.', username: userData.username })
})

export default user
