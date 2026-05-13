import { reactive, computed } from 'vue'
import { api, getToken, setToken, clearToken } from '../services/api.js'
import { useProgress } from './useProgress.js'

// Separate keys so the auth session and account list don't collide
const AUTH_KEY = 'eclipse-archive-auth'

// Restore session from stored token on page load
function loadAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function persistAuth(user) {
  if (user) localStorage.setItem(AUTH_KEY, JSON.stringify(user))
  else localStorage.removeItem(AUTH_KEY)
}

// Module-level so auth state is shared across all composable calls
const state = reactive({
  user: loadAuth(),
})

export function useAuth() {
  const { loadProgressFromApi } = useProgress()
  const isLoggedIn = computed(() => !!state.user)
  const isGuest    = computed(() => state.user?.type === 'guest')
  const username   = computed(() => state.user?.username ?? '')

  function loginAsGuest() {
    state.user = { type: 'guest', username: 'Guest' }
    persistAuth(state.user)
  }

  async function login(email, password) {
    try {
      const data = await api.auth.login({ email, password })
      if (data.error) return { error: data.error }

      // Store token for API calls, store user info for UI
      setToken(data.token)
      state.user = { type: 'user', username: data.username, email: data.email }
      persistAuth(state.user)
      // Pull this user's progress from the API now that we have a token
      await loadProgressFromApi()
      return { error: null }
    } catch {
      return { error: 'Could not reach the server. Please try again.' }
    }
  }

  async function register(username, email, password) {
    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters.' }
    }
    try {
      const data = await api.auth.register({ username, email, password })
      if (data.error) return { error: data.error }

      // Auto-login after successful registration
      return login(email, password)
    } catch {
      return { error: 'Could not reach the server. Please try again.' }
    }
  }

  function logout() {
    state.user = null
    clearToken()
    persistAuth(null)
  }

  async function updateUsername(newUsername) {
    if (!newUsername.trim() || !state.user) return { error: 'Username cannot be empty.' }
    try {
      const data = await api.user.update({ username: newUsername.trim() })
      if (data.error) return { error: data.error }
      state.user = { ...state.user, username: newUsername.trim() }
      persistAuth(state.user)
      return { error: null }
    } catch {
      return { error: 'Could not reach the server. Please try again.' }
    }
  }

  return { state, isLoggedIn, isGuest, username, loginAsGuest, login, register, logout, updateUsername }
}
