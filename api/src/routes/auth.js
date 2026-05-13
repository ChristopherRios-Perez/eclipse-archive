import { Hono } from 'hono'

const auth = new Hono()

// POST /api/auth/register
// Creates a new user account. Checks for duplicate emails before saving.
auth.post('/register', async (c) => {
  const { username, email, password } = await c.req.json()

  if (!username || !email || !password) {
    return c.json({ error: 'All fields are required.' }, 400)
  }
  if (password.length < 8) {
    return c.json({ error: 'Password must be at least 8 characters.' }, 400)
  }

  const existing = await c.env.ECLIPSE_KV.get(`user:${email}`)
  if (existing) {
    return c.json({ error: 'An account with that email already exists.' }, 409)
  }

  const user = { username, email, password, createdAt: new Date().toISOString() }
  await c.env.ECLIPSE_KV.put(`user:${email}`, JSON.stringify(user))

  return c.json({ message: 'Account created.', username, email }, 201)
})

// POST /api/auth/login
// Validates credentials and returns a simple session token.
auth.post('/login', async (c) => {
  const { email, password } = await c.req.json()

  if (!email || !password) {
    return c.json({ error: 'Email and password are required.' }, 400)
  }

  const raw = await c.env.ECLIPSE_KV.get(`user:${email}`)
  if (!raw) return c.json({ error: 'Invalid email or password.' }, 401)

  const user = JSON.parse(raw)
  if (user.password !== password) {
    return c.json({ error: 'Invalid email or password.' }, 401)
  }

  // Simple token: base64 of email + timestamp (swap for JWT in production)
  const token = btoa(`${email}:${Date.now()}`)

  return c.json({ token, username: user.username, email: user.email })
})

export default auth
