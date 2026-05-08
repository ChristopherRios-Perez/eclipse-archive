import { reactive, computed } from 'vue'

// Separate keys so auth session and account list don't step on each other
const AUTH_KEY = 'eclipse-archive-auth'
const ACCOUNTS_KEY = 'eclipse-archive-accounts'

// Called once at module load — wrapping in try/catch because
// localStorage can throw in some browsers with strict privacy settings
function loadAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function loadAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// Module-level reactive state so auth is shared across all composable calls
// without needing a store — works fine at this scale
const state = reactive({
  user: loadAuth(),
})

// Writes current user to localStorage (or clears it on logout)
function persist() {
  if (state.user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(state.user))
  } else {
    localStorage.removeItem(AUTH_KEY)
  }
}

export function useAuth() {
  const isLoggedIn = computed(() => !!state.user)
  const isGuest = computed(() => state.user?.type === 'guest') // guests can browse but progress isn't tied to a profile
  const username = computed(() => state.user?.username ?? '')

  function loginAsGuest() {
    state.user = { type: 'guest', username: 'Guest' }
    persist()
  }

  function login(email, password) {
    const accounts = loadAccounts()
    // Re-loading from storage each time so changes made in other tabs are picked up
    const account = accounts.find(a => a.email === email && a.password === password)
    if (!account) return { error: 'Invalid email or password.' }
    // Only store what we actually need — no reason to keep the password in state
    state.user = { type: 'user', username: account.username, email: account.email }
    persist()
    return { error: null }
  }

  function register(username, email, password) {
    const accounts = loadAccounts()
    // Email uniqueness is the only constraint we enforce right now
    if (accounts.find(a => a.email === email)) {
      return { error: 'An account with that email already exists.' }
    }
    accounts.push({ username, email, password })
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
    state.user = { type: 'user', username, email }
    persist()
    return { error: null }
  }

  function logout() {
    state.user = null
    persist() // removes the key entirely — cleaner than storing null
  }

  return { state, isLoggedIn, isGuest, username, loginAsGuest, login, register, logout }
}
