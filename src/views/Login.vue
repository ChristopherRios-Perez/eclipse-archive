<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth.js'

const { login, register, loginAsGuest } = useAuth()

// Single ref drives which form is visible — simpler than a router-based approach for just two tabs
const tab = ref('login')

// Login and register fields are kept separate so switching tabs doesn't bleed state
const loginEmail = ref('')
const loginPassword = ref('')
const loginError = ref('')

const regUsername = ref('')
const regEmail = ref('')
const regPassword = ref('')
const regConfirm = ref('')
const regError = ref('')

function handleLogin() {
  loginError.value = '' // clear stale error before each attempt
  if (!loginEmail.value || !loginPassword.value) {
    loginError.value = 'Please fill in all fields.'
    return
  }
  const { error } = login(loginEmail.value, loginPassword.value)
  if (error) loginError.value = error
  // on success, useAuth updates state and App.vue reactively shows the main layout
}

function handleRegister() {
  regError.value = ''
  if (!regUsername.value || !regEmail.value || !regPassword.value || !regConfirm.value) {
    regError.value = 'Please fill in all fields.'
    return
  }
  // Client-side checks — not a substitute for server validation, but fine for localStorage auth
  if (regPassword.value !== regConfirm.value) {
    regError.value = 'Passwords do not match.'
    return
  }
  if (regPassword.value.length < 8) {
    regError.value = 'Password must be at least 8 characters.'
    return
  }
  const { error } = register(regUsername.value, regEmail.value, regPassword.value)
  if (error) regError.value = error
}
</script>

<template>
  <div class="fixed inset-0 bg-[#111114] flex items-center justify-center px-4">

    <!-- Background — pulsing crimson void -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <!-- Primary slow breathe -->
      <div class="glow-primary absolute top-1/2 left-1/2 w-[700px] h-[700px] rounded-full"
           style="background: radial-gradient(circle, #9b0000 0%, #4a0000 40%, transparent 70%);"></div>
      <!-- Secondary drift top-right -->
      <div class="glow-secondary absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full"
           style="background: radial-gradient(circle, #c10b21 0%, #6b0000 35%, transparent 65%);"></div>
      <!-- Tertiary flicker bottom-left -->
      <div class="glow-tertiary absolute bottom-1/4 left-1/3 w-[300px] h-[300px] rounded-full"
           style="background: radial-gradient(circle, #7a0000 0%, transparent 60%);"></div>
      <!-- Dark vignette overlay to keep edges black -->
      <div class="absolute inset-0" style="background: radial-gradient(ellipse at center, transparent 30%, #111114 80%);"></div>
    </div>

    <div class="w-full max-w-md relative z-10">

      <!-- Logo / Branding -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-[#c10b21] rounded-2xl mb-4 shadow-lg shadow-[#c10b21]/30">
          <span class="text-white font-black text-3xl leading-none">B</span>
        </div>
        <h1 class="text-white font-bold text-2xl tracking-tight">Eclipse Archive</h1>
        <p class="text-[#5a5a72] text-sm mt-1">Your Berserk reading companion</p>
      </div>

      <!-- Card -->
      <div class="bg-[#16161a] border border-[#2d2d38] rounded-2xl overflow-hidden shadow-2xl">

        <!-- Tabs -->
        <div class="flex border-b border-[#2d2d38]">
          <button
            @click="tab = 'login'; loginError = ''"
            class="flex-1 py-4 text-sm font-medium transition-colors"
            :class="tab === 'login' ? 'text-white border-b-2 border-[#c10b21] bg-[#1c1c22]' : 'text-[#5a5a72] hover:text-[#8888a0]'"
          >
            Sign In
          </button>
          <button
            @click="tab = 'register'; regError = ''"
            class="flex-1 py-4 text-sm font-medium transition-colors"
            :class="tab === 'register' ? 'text-white border-b-2 border-[#c10b21] bg-[#1c1c22]' : 'text-[#5a5a72] hover:text-[#8888a0]'"
          >
            Create Account
          </button>
        </div>

        <div class="p-6">

          <!-- Login Form -->
          <form v-if="tab === 'login'" @submit.prevent="handleLogin" class="space-y-4">
            <div>
              <label class="text-[#8888a0] text-xs block mb-1.5">Email</label>
              <input
                v-model="loginEmail"
                type="email"
                placeholder="you@example.com"
                class="w-full bg-[#23232b] border border-[#3d3d4d] rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#5a5a72] focus:outline-none focus:border-[#c10b21] transition-colors"
              />
            </div>
            <div>
              <label class="text-[#8888a0] text-xs block mb-1.5">Password</label>
              <input
                v-model="loginPassword"
                type="password"
                placeholder="••••••••"
                class="w-full bg-[#23232b] border border-[#3d3d4d] rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#5a5a72] focus:outline-none focus:border-[#c10b21] transition-colors"
              />
            </div>

            <p v-if="loginError" class="text-[#f83244] text-xs">{{ loginError }}</p>

            <button
              type="submit"
              class="w-full bg-[#c10b21] hover:bg-[#a00d20] text-white font-medium py-2.5 rounded-lg text-sm transition-colors mt-2"
            >
              Sign In
            </button>
          </form>

          <!-- Register Form -->
          <form v-else @submit.prevent="handleRegister" class="space-y-4">
            <div>
              <label class="text-[#8888a0] text-xs block mb-1.5">Username</label>
              <input
                v-model="regUsername"
                type="text"
                placeholder="GriffithFan99"
                class="w-full bg-[#23232b] border border-[#3d3d4d] rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#5a5a72] focus:outline-none focus:border-[#c10b21] transition-colors"
              />
            </div>
            <div>
              <label class="text-[#8888a0] text-xs block mb-1.5">Email</label>
              <input
                v-model="regEmail"
                type="email"
                placeholder="you@example.com"
                class="w-full bg-[#23232b] border border-[#3d3d4d] rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#5a5a72] focus:outline-none focus:border-[#c10b21] transition-colors"
              />
            </div>
            <div>
              <label class="text-[#8888a0] text-xs block mb-1.5">Password</label>
              <input
                v-model="regPassword"
                type="password"
                placeholder="••••••••"
                class="w-full bg-[#23232b] border border-[#3d3d4d] rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#5a5a72] focus:outline-none focus:border-[#c10b21] transition-colors"
              />
            </div>
            <div>
              <label class="text-[#8888a0] text-xs block mb-1.5">Confirm Password</label>
              <input
                v-model="regConfirm"
                type="password"
                placeholder="••••••••"
                class="w-full bg-[#23232b] border border-[#3d3d4d] rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#5a5a72] focus:outline-none focus:border-[#c10b21] transition-colors"
              />
            </div>

            <p v-if="regError" class="text-[#f83244] text-xs">{{ regError }}</p>

            <button
              type="submit"
              class="w-full bg-[#c10b21] hover:bg-[#a00d20] text-white font-medium py-2.5 rounded-lg text-sm transition-colors mt-2"
            >
              Create Account
            </button>
          </form>

          <!-- Divider -->
          <div class="flex items-center gap-3 my-5">
            <div class="flex-1 h-px bg-[#2d2d38]"></div>
            <span class="text-[#5a5a72] text-xs">or</span>
            <div class="flex-1 h-px bg-[#2d2d38]"></div>
          </div>

          <!-- Guest Login -->
          <button
            @click="loginAsGuest"
            class="w-full bg-[#23232b] hover:bg-[#2d2d38] border border-[#3d3d4d] hover:border-[#5a5a72] text-[#8888a0] hover:text-white font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
            </svg>
            Continue as Guest
          </button>
          <p class="text-center text-[#5a5a72] text-xs mt-2">No account needed — progress won't be saved to a profile</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.glow-primary {
  animation: breathe 6s ease-in-out infinite;
  opacity: 0.25;
  filter: blur(60px);
}

.glow-secondary {
  animation: breathe 4s ease-in-out infinite 1.5s;
  opacity: 0.2;
  filter: blur(50px);
}

.glow-tertiary {
  animation: flicker 8s ease-in-out infinite 3s;
  opacity: 0.15;
  filter: blur(40px);
}

@keyframes breathe {
  0%, 100% {
    opacity: 0.12;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.32;
    transform: translate(-50%, -50%) scale(1.18);
  }
}

@keyframes flicker {
  0%, 100% { opacity: 0.08; transform: scale(0.95); }
  30%       { opacity: 0.22; transform: scale(1.1);  }
  60%       { opacity: 0.12; transform: scale(1.0);  }
  80%       { opacity: 0.28; transform: scale(1.05); }
}
</style>
