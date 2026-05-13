<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import { useProgress } from '../composables/useProgress.js'
import { useSidebar } from '../composables/useSidebar.js'
import { useSettings } from '../composables/useSettings.js'

const router = useRouter()
const { isOpen } = useSidebar()
const { state: authState, isGuest, username, logout, updateUsername } = useAuth()
const { state: progressState, completedCount, strugglePercentage } = useProgress()
const { settings, toggleSpoilerBlur } = useSettings()

// Username editing
const editingUsername = ref(false)
const newUsername = ref('')
const usernameError = ref('')
const usernameSuccess = ref(false)

function startEditUsername() {
  newUsername.value = username.value
  editingUsername.value = true
  usernameError.value = ''
  usernameSuccess.value = false
}

function saveUsername() {
  const { error } = updateUsername(newUsername.value)
  if (error) {
    usernameError.value = error
    return
  }
  editingUsername.value = false
  usernameSuccess.value = true
  setTimeout(() => { usernameSuccess.value = false }, 3000)
}

function cancelEdit() {
  editingUsername.value = false
  usernameError.value = ''
}

// Reset progress confirmation
const showResetConfirm = ref(false)

function resetProgress() {
  // Wipe all tracked reading data
  progressState.completedVolumes = []
  progressState.currentVolume = 1
  progressState.currentChapter = 1
  progressState.readingStreak = 0
  progressState.apostlesEncountered = []
  progressState.recentActivity = []
  progressState.lastRead = null
  showResetConfirm.value = false
}

function handleLogout() {
  logout()
  router.push('/')
}
</script>

<template>
  <div class="p-6 min-h-screen w-full">

    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-white transition-all duration-300" :class="isOpen ? '' : 'pl-6'">Settings</h1>
      <p class="text-[#5a5a72] text-sm mt-0.5">Manage your account and preferences</p>
    </div>

    <div class="grid grid-cols-3 gap-5">

      <!-- Left column -->
      <div class="col-span-2 space-y-5">

        <!-- Profile card -->
        <div class="bg-[#16161a] border border-[#2d2d38] rounded-xl p-6">
          <h3 class="text-white font-semibold mb-5">Profile</h3>

          <!-- Avatar + info -->
          <div class="flex items-center gap-5 mb-6">
            <div class="w-16 h-16 rounded-xl bg-[#c10b21] flex items-center justify-center text-white font-black text-2xl shrink-0">
              {{ username ? username[0].toUpperCase() : 'G' }}
            </div>
            <div>
              <p class="text-white font-semibold text-lg">{{ username }}</p>
              <p class="text-[#5a5a72] text-sm">{{ authState.user?.email ?? 'No email (guest session)' }}</p>
              <span
                class="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium"
                :class="isGuest ? 'bg-[#3d3d4d] text-[#8888a0]' : 'bg-[#c10b21]/20 text-[#c10b21]'"
              >
                {{ isGuest ? 'Guest' : 'Account' }}
              </span>
            </div>
          </div>

          <!-- Username edit -->
          <div>
            <label class="text-[#8888a0] text-xs block mb-1.5">Display Name</label>

            <div v-if="!editingUsername" class="flex items-center gap-3">
              <div class="flex-1 bg-[#23232b] border border-[#3d3d4d] rounded-lg px-4 py-2.5 text-white text-sm">
                {{ username }}
              </div>
              <button
                v-if="!isGuest"
                @click="startEditUsername"
                class="bg-[#23232b] border border-[#3d3d4d] hover:border-[#c10b21]/40 text-[#8888a0] hover:text-white text-sm px-4 py-2.5 rounded-lg transition-colors"
              >
                Edit
              </button>
            </div>

            <div v-else class="space-y-2">
              <div class="flex items-center gap-3">
                <input
                  v-model="newUsername"
                  type="text"
                  class="flex-1 bg-[#23232b] border border-[#3d3d4d] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#c10b21]"
                  @keyup.enter="saveUsername"
                  @keyup.esc="cancelEdit"
                  autofocus
                />
                <button @click="saveUsername" class="bg-[#c10b21] hover:bg-[#a00d20] text-white text-sm px-4 py-2.5 rounded-lg transition-colors">Save</button>
                <button @click="cancelEdit" class="bg-[#23232b] border border-[#3d3d4d] text-[#8888a0] hover:text-white text-sm px-4 py-2.5 rounded-lg transition-colors">Cancel</button>
              </div>
              <p v-if="usernameError" class="text-[#f83244] text-xs">{{ usernameError }}</p>
            </div>

            <p v-if="usernameSuccess" class="text-green-400 text-xs mt-1.5">✓ Username updated successfully</p>
            <p v-if="isGuest" class="text-[#5a5a72] text-xs mt-1.5">Create an account to set a custom display name.</p>
          </div>
        </div>

        <!-- Reading progress section -->
        <div class="bg-[#16161a] border border-[#2d2d38] rounded-xl p-6">
          <h3 class="text-white font-semibold mb-1">Reading Progress</h3>
          <p class="text-[#5a5a72] text-xs mb-5">Your current tracked reading data</p>

          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="bg-[#23232b] rounded-lg p-4 text-center">
              <p class="text-[#c10b21] font-bold text-2xl">{{ completedCount }}</p>
              <p class="text-[#5a5a72] text-xs mt-0.5">Volumes Done</p>
            </div>
            <div class="bg-[#23232b] rounded-lg p-4 text-center">
              <p class="text-[#c10b21] font-bold text-2xl">{{ strugglePercentage }}%</p>
              <p class="text-[#5a5a72] text-xs mt-0.5">Progress</p>
            </div>
            <div class="bg-[#23232b] rounded-lg p-4 text-center">
              <p class="text-[#c10b21] font-bold text-2xl">{{ progressState.apostlesEncountered.length }}</p>
              <p class="text-[#5a5a72] text-xs mt-0.5">Apostles Found</p>
            </div>
          </div>

          <!-- Danger zone -->
          <div class="border border-[#f83244]/30 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-white font-medium text-sm">Reset All Progress</p>
                <p class="text-[#5a5a72] text-xs mt-0.5">Clears completed volumes, activity log, and apostle data. Cannot be undone.</p>
              </div>
              <button
                @click="showResetConfirm = true"
                class="bg-[#f83244]/10 hover:bg-[#f83244]/20 border border-[#f83244]/30 text-[#f83244] text-sm px-4 py-2 rounded-lg transition-colors shrink-0 ml-4"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- Right column -->
      <div class="space-y-5">

        <!-- Preferences -->
        <div class="bg-[#16161a] border border-[#2d2d38] rounded-xl p-6">
          <h3 class="text-white font-semibold mb-4">Preferences</h3>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-white text-sm font-medium">Spoiler Blur</p>
              <p class="text-[#5a5a72] text-xs mt-0.5">Blur covers and synopses of unread volumes</p>
            </div>
            <!-- Toggle switch -->
            <button
              @click="toggleSpoilerBlur"
              class="relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none shrink-0"
              :class="settings.spoilerBlur ? 'bg-[#c10b21]' : 'bg-[#3d3d4d]'"
            >
              <span
                class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                :class="settings.spoilerBlur ? 'translate-x-6' : 'translate-x-0'"
              ></span>
            </button>
          </div>
        </div>

        <!-- Account actions -->
        <div class="bg-[#16161a] border border-[#2d2d38] rounded-xl p-6">
          <h3 class="text-white font-semibold mb-4">Account</h3>
          <div class="space-y-3">
            <button
              @click="handleLogout"
              class="w-full flex items-center gap-3 px-4 py-3 bg-[#23232b] hover:bg-[#2d2d38] border border-[#3d3d4d] rounded-lg text-[#8888a0] hover:text-white text-sm transition-colors"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"/>
              </svg>
              Sign Out
            </button>
          </div>
        </div>

        <!-- About -->
        <div class="bg-[#16161a] border border-[#2d2d38] rounded-xl p-6">
          <h3 class="text-white font-semibold mb-4">About</h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-[#5a5a72]">App</span>
              <span class="text-white">The Eclipse Archive</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#5a5a72]">Version</span>
              <span class="text-white">1.0.0</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#5a5a72]">Stack</span>
              <span class="text-white">Vue 3 + Tailwind</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#5a5a72]">Covers</span>
              <span class="text-white">MangaDex API</span>
            </div>
            <div class="flex justify-between items-center gap-2">
              <span class="text-[#5a5a72] shrink-0">Manga</span>
              <span class="text-[#c10b21] font-medium whitespace-nowrap">Berserk - Kentaro Miura</span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Reset confirmation modal -->
    <div v-if="showResetConfirm" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" @click.self="showResetConfirm = false">
      <div class="bg-[#1c1c22] border border-[#3d3d4d] rounded-2xl p-6 w-96">
        <h3 class="text-white font-bold text-lg mb-2">Reset All Progress?</h3>
        <p class="text-[#8888a0] text-sm mb-6">This will clear all completed volumes, apostle data, and activity history. This cannot be undone.</p>
        <div class="flex gap-3">
          <button @click="showResetConfirm = false" class="flex-1 bg-[#2d2d38] hover:bg-[#3d3d4d] text-[#8888a0] py-2.5 rounded-lg text-sm transition-colors">Cancel</button>
          <button @click="resetProgress" class="flex-1 bg-[#f83244] hover:bg-[#d42038] text-white py-2.5 rounded-lg text-sm font-medium transition-colors">Yes, Reset</button>
        </div>
      </div>
    </div>

  </div>
</template>
