import { Hono } from 'hono'
import { cors } from 'hono/cors'
import auth from './routes/auth.js'
import progress from './routes/progress.js'
import user from './routes/user.js'

const app = new Hono()

// Allow requests from the Vue frontend on any origin during dev.
// Lock this down to your deployed URL in production.
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://eclipse-archive.christopherr308.workers.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Health check - useful for confirming the API is reachable
app.get('/', (c) => c.json({ status: 'Eclipse Archive API is running.' }))

// Route groups
app.route('/api/auth',     auth)
app.route('/api/progress', progress)
app.route('/api/user',     user)

// Catch-all for unknown routes
app.notFound((c) => c.json({ error: 'Route not found.' }, 404))

export default app
