// Central API client. All fetch calls to the Hono backend go through here.
// Switching between local dev and production is handled by the VITE_API_URL env var.

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8787'
const TOKEN_KEY = 'eclipse-archive-token'

export function getToken()        { return localStorage.getItem(TOKEN_KEY) }
export function setToken(token)   { localStorage.setItem(TOKEN_KEY, token) }
export function clearToken()      { localStorage.removeItem(TOKEN_KEY) }

async function request(method, path, body) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  // Always return the parsed JSON — callers check for `error` field
  return res.json()
}

export const api = {
  auth: {
    register: (data) => request('POST', '/api/auth/register', data),
    login:    (data) => request('POST', '/api/auth/login',    data),
  },
  user: {
    get:    ()     => request('GET', '/api/user'),
    update: (data) => request('PUT', '/api/user', data),
  },
  progress: {
    get:  ()     => request('GET', '/api/progress'),
    save: (data) => request('PUT', '/api/progress', data),
  },
}
