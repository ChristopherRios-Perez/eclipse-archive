import { reactive, computed } from 'vue'

// Separate keys so the auth session and account list don't collide
const AUTH_KEY = 'eclipse-archive-auth'
const ACCOUNTS_KEY = 'eclipse-archive-accounts'

// Called once at module load - try/catch because localStorage can throw
// in some browsers with strict privacy settings
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

// Seed a test account so instructor can log in on any browser
// without needing to create an account first.
const TEST_ACCOUNT = { username: 'TestUser', email: 'test@123test.com', password: '12345678' }
;(function seedTestAccount() {
  try {
    const accounts = loadAccounts()
    if (!accounts.find(a => a.email === TEST_ACCOUNT.email)) {
      accounts.push(TEST_ACCOUNT)
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
    }
  } catch {}
})()

// Module-level so auth state is shared across all composable calls
// without needing a store - fine at this scale
const state = reactive({
  user: loadAuth(),
})

// Writes the current user to localStorage, or clears it on logout
function persist() {
  if (state.user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(state.user))
  } else {
    localStorage.removeItem(AUTH_KEY)
  }
}

export function useAuth() {
  const isLoggedIn = computed(() => !!state.user)
  const isGuest = computed(() => state.user?.type === 'guest') // guests can browse but progress isn't saved to a profile
  const username = computed(() => state.user?.username ?? '')

  function loginAsGuest() {
    state.user = { type: 'guest', username: 'Guest' }
    persist()
  }

  function login(email, password) {
    const accounts = loadAccounts()
    // Re-load from storage each time so other-tab changes are picked up
    const account = accounts.find(a => a.email === email && a.password === password)
    if (!account) return { error: 'Invalid email or password.' }
    // Only store what we need - no reason to keep the password in state
    state.user = { type: 'user', username: account.username, email: account.email }
    persist()
    return { error: null }
  }

  function register(username, email, password) {
    const accounts = loadAccounts()
    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters.' }
    }
    // Email has to be unique - that's the only constraint we check
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
    persist() // removes the key entirely, cleaner than storing null
  }

  // Updates the display name in the session and in the stored accounts list
  function updateUsername(newUsername) {
    if (!newUsername.trim() || !state.user) return { error: 'Username cannot be empty.' }
    if (state.user.type === 'user') {
      const accounts = loadAccounts()
      const account = accounts.find(a => a.email === state.user.email)
      if (account) {
        account.username = newUsername.trim()
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
      }
    }
    state.user = { ...state.user, username: newUsername.trim() }
    persist()
    return { error: null }
  }

  return { state, isLoggedIn, isGuest, username, loginAsGuest, login, register, logout, updateUsername }
}
