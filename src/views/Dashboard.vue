<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useProgress, getVolumeChapters, CHAPTER_COUNTS } from '../composables/useProgress.js'
import { useAuth } from '../composables/useAuth.js'
import { useSidebar } from '../composables/useSidebar.js'
import { useBadges } from '../composables/useBadges.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const { unlockedCount } = useBadges()
const { username, isGuest, logout } = useAuth()
const { isOpen } = useSidebar()

const {
  state,
  strugglePercentage,
  completedCount,
  volumesLeft,
  totalVolumes,
  totalChapters,
  currentArc,
  timeAgo,
  setCurrentProgress,
  toggleVolume,
  isVolumeCompleted,
  clearActivity,
  setReadingGoal,
  clearReadingGoal,
} = useProgress()

// Avatar dropdown state + cover art for the currently reading card
const showUserMenu = ref(false)
const currentCoverUrl = ref(null)
const MANGA_ID = '801513ba-a712-498c-8f57-cae55b38cc92'
const coversCache = ref([])

// Paginates through MangaDex covers once and caches them - no need to hit the API again on re-renders
async function loadCovers() {
  if (coversCache.value.length) return
  try {
    let all = [], offset = 0
    while (true) {
      const r = await fetch(`https://api.mangadex.org/cover?manga[]=${MANGA_ID}&limit=100&offset=${offset}&order[volume]=asc`)
      if (!r.ok) break
      const { data, total } = await r.json()
      all = all.concat(data)
      offset += 100
      if (offset >= total || !data.length) break
    }
    coversCache.value = all
  } catch {}
}

// Prefer English locale (Dark Horse / Deluxe), fall back to whatever's available
function resolveVolumeCover(vol) {
  const num = parseInt(vol)
  const match =
    coversCache.value.find(c => parseInt(c.attributes.volume) === num && c.attributes.locale === 'en') ||
    coversCache.value.find(c => parseInt(c.attributes.volume) === num)
  if (match) currentCoverUrl.value = `https://uploads.mangadex.org/covers/${MANGA_ID}/${match.attributes.fileName}.512.jpg`
}

onMounted(async () => { await loadCovers(); resolveVolumeCover(state.currentVolume) })
watch(() => state.currentVolume, vol => resolveVolumeCover(vol))

function handleLogout() { showUserMenu.value = false; logout() }

// Chapter-level progress through the current volume
function getVolumeChaptersCount(volId) { return CHAPTER_COUNTS[volId] ?? 8 }
function getChapterPct(volId) {
  const done  = (state.completedChapters?.[volId] ?? []).length
  const total = getVolumeChaptersCount(volId)
  return Math.round((done / total) * 100)
}

// Quick volume search - matches on title, arc name, or padded number ("05", "golden"...)
const searchQuery = ref('')
const showSearch = ref(false)

const allVolumes = Array.from({ length: 41 }, (_, i) => {
  const vol = i + 1
  let arc = 'Fantasia'
  if (vol <= 3)  arc = 'Black Swordsman'
  else if (vol <= 10) arc = 'Golden Age'
  else if (vol <= 21) arc = 'Conviction'
  else if (vol <= 28) arc = 'Millennium Falcon'
  return { id: vol, title: `Berserk Vol. ${vol}`, arc }
})

const searchResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  return allVolumes.filter(v =>
    v.title.toLowerCase().includes(q) ||
    v.arc.toLowerCase().includes(q) ||
    String(v.id).padStart(2, '0').includes(q)
  ).slice(0, 6)
})

function goToVolume(id) {
  searchQuery.value = ''
  showSearch.value = false
  router.push('/archive/' + id)
}

// Bell tracks the last time the user opened it so we know what's "new"
const showNotifications = ref(false)
const NOTIF_KEY = 'eclipse-archive-last-seen-notif'

const lastSeenNotif = ref(localStorage.getItem(NOTIF_KEY) ?? null)

const unreadCount = computed(() =>
  state.recentActivity.filter(a => !lastSeenNotif.value || a.time > lastSeenNotif.value).length
)

function openNotifications() {
  showNotifications.value = true
  const now = new Date().toISOString()
  lastSeenNotif.value = now
  localStorage.setItem(NOTIF_KEY, now)
}

// Pre-fills the modal with existing goal values if one is already set
const showGoalModal = ref(false)
const goalVolume = ref(41)
const goalDate = ref('')

function openGoalModal() {
  goalVolume.value = state.readingGoal?.targetVolume ?? 41
  goalDate.value = state.readingGoal?.targetDate ?? ''
  showGoalModal.value = true
}

function saveGoal() {
  if (!goalDate.value) return
  setReadingGoal(Number(goalVolume.value), goalDate.value)
  showGoalModal.value = false
}

// Calculate goal stats - days left, volumes needed, whether we're on pace
const goalStats = computed(() => {
  const g = state.readingGoal
  if (!g) return null
  const today = new Date(); today.setHours(0,0,0,0)
  const target = new Date(g.targetDate); target.setHours(0,0,0,0)
  const daysLeft = Math.ceil((target - today) / 86400000)
  const volsNeeded = Math.max(0, g.targetVolume - completedCount.value)
  const pct = Math.min(100, Math.round((completedCount.value / g.targetVolume) * 100))
  const onTrack = daysLeft > 0 && (volsNeeded === 0 || daysLeft >= volsNeeded)
  return { daysLeft, volsNeeded, pct, onTrack, targetVolume: g.targetVolume, targetDate: g.targetDate, done: volsNeeded === 0 }
})

const showUpdateModal = ref(false)
const editVolume = ref(state.currentVolume)
const editChapter = ref(state.currentChapter)

function saveProgress() {
  setCurrentProgress(editVolume.value, editChapter.value)
  showUpdateModal.value = false
}

const arcLabel = computed(() => {
  const p = strugglePercentage.value
  if (p < 25) return 'Beginning'
  if (p < 60) return 'Midpoint'
  return 'Eclipse'
})

function formatTime(iso) {
  return timeAgo(iso)
}
</script>

<template>
  <div class="p-6 min-h-screen w-full">

    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="transition-all duration-300" :class="isOpen ? '' : 'pl-6'">
        <h1 class="text-2xl font-bold text-white">Dashboard</h1>
        <p class="text-[#5a5a72] text-sm">Welcome back, {{ username || 'Hunter' }}</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="relative">
          <input
            v-model="searchQuery"
            @focus="showSearch = true"
            type="text"
            placeholder="Search volumes or arcs..."
            class="bg-[#23232b] border border-[#3d3d4d] rounded-lg px-4 py-2 text-sm text-[#8888a0] placeholder-[#5a5a72] w-64 focus:outline-none focus:border-[#c10b21] transition-colors"
          />
          <svg class="w-4 h-4 absolute right-3 top-2.5 text-[#5a5a72]" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
          </svg>

          <!-- Search results dropdown -->
          <div
            v-if="showSearch && searchResults.length"
            class="absolute top-10 right-0 w-72 bg-[#1c1c22] border border-[#3d3d4d] rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <button
              v-for="vol in searchResults"
              :key="vol.id"
              @mousedown.prevent="goToVolume(vol.id)"
              class="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#2d2d38] transition-colors text-left"
            >
              <div>
                <p class="text-white text-sm font-medium">{{ vol.title }}</p>
                <p class="text-[#5a5a72] text-xs">{{ vol.arc }}</p>
              </div>
              <svg class="w-3.5 h-3.5 text-[#5a5a72]" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>

          <!-- Click outside to close -->
          <div v-if="showSearch" class="fixed inset-0 z-40" @click="showSearch = false; searchQuery = ''"></div>
        </div>
        <!-- Notification bell -->
        <div class="relative">
          <button
            @click="openNotifications"
            class="w-8 h-8 rounded-lg bg-[#23232b] border border-[#3d3d4d] flex items-center justify-center text-[#8888a0] hover:text-white hover:border-[#c10b21] transition-colors relative"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
            <!-- Unread badge -->
            <span
              v-if="unreadCount > 0"
              class="absolute -top-1 -right-1 w-4 h-4 bg-[#c10b21] text-white text-[10px] font-bold rounded-full flex items-center justify-center"
            >{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
          </button>

          <!-- Dropdown -->
          <div
            v-if="showNotifications"
            class="absolute right-0 top-10 w-80 bg-[#1c1c22] border border-[#3d3d4d] rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div class="px-4 py-3 border-b border-[#2d2d38] flex items-center justify-between">
              <span class="text-white font-medium text-sm">Activity</span>
              <button
                v-if="state.recentActivity.length"
                @click="clearActivity"
                class="text-[#5a5a72] hover:text-[#f83244] text-xs transition-colors"
              >
                Clear all
              </button>
            </div>
            <div v-if="state.recentActivity.length === 0" class="px-4 py-6 text-center text-[#5a5a72] text-sm">
              No activity yet.
            </div>
            <div v-else class="max-h-72 overflow-y-auto">
              <div
                v-for="(item, i) in state.recentActivity"
                :key="i"
                class="flex items-start gap-3 px-4 py-3 border-b border-[#23232b] last:border-0"
              >
                <div class="w-1.5 h-1.5 bg-[#c10b21] rounded-full mt-1.5 shrink-0"></div>
                <div class="flex-1 min-w-0">
                  <p class="text-[#e5e5ef] text-sm">{{ item.text }}</p>
                  <p class="text-[#5a5a72] text-xs mt-0.5">{{ timeAgo(item.time) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Click outside to close -->
          <div v-if="showNotifications" class="fixed inset-0 z-40" @click="showNotifications = false"></div>
        </div>
        <!-- Avatar + dropdown -->
        <div class="relative">
          <button
            @click="showUserMenu = !showUserMenu"
            class="w-8 h-8 rounded-lg bg-[#c10b21] flex items-center justify-center text-white font-bold text-sm hover:bg-[#a00d20] transition-colors"
          >
            {{ username ? username[0].toUpperCase() : 'G' }}
          </button>

          <div
            v-if="showUserMenu"
            class="absolute right-0 top-10 w-48 bg-[#1c1c22] border border-[#3d3d4d] rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div class="px-4 py-3 border-b border-[#2d2d38]">
              <p class="text-white font-medium text-sm truncate">{{ username }}</p>
              <p class="text-[#5a5a72] text-xs mt-0.5">{{ isGuest ? 'Guest session' : 'Signed in' }}</p>
            </div>
            <button
              @click="handleLogout"
              class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#8888a0] hover:text-white hover:bg-[#2d2d38] transition-colors"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"/>
              </svg>
              Sign Out
            </button>
          </div>

          <!-- Click-outside overlay -->
          <div v-if="showUserMenu" class="fixed inset-0 z-40" @click="showUserMenu = false"></div>
        </div>
      </div>
    </div>

    <!-- Main content grid -->
    <div class="grid grid-cols-3 gap-5">

      <!-- Left column: Struggle bar + Currently reading card -->
      <div class="col-span-2 space-y-5">

        <!-- Struggle Percentage Bar -->
        <div class="bg-[#16161a] border border-[#2d2d38] rounded-xl p-5">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <div class="w-5 h-5 bg-[#c10b21] rounded flex items-center justify-center">
                <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/></svg>
              </div>
              <span class="text-white font-semibold">Struggle Percentage</span>
              <span class="text-[#5a5a72] text-sm">Current Progress</span>
            </div>
            <span class="text-[#c10b21] font-bold text-xl">{{ strugglePercentage }}%</span>
          </div>

          <!-- Progress bar -->
          <div class="relative mb-2">
            <div class="h-2.5 bg-[#23232b] rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-[#c10b21] to-[#f83244] rounded-full transition-all duration-700"
                :style="{ width: strugglePercentage + '%' }"
              ></div>
            </div>
          </div>
          <div class="flex justify-between text-xs text-[#5a5a72] mb-3">
            <span>Beginning</span>
            <span>Midpoint</span>
            <span>Eclipse</span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-[#5a5a72] text-sm">
              Next Milestone: <span class="text-[#e5e5ef]">
                {{ strugglePercentage < 25 ? '25% – Golden Age' : strugglePercentage < 60 ? '60% – The Brand' : '100% – Eclipse' }}
              </span>
            </span>
            <button
              @click="showUpdateModal = true"
              class="bg-[#c10b21] hover:bg-[#a00d20] text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              Update Progress
            </button>
          </div>
        </div>

        <!-- Currently Reading Card -->
        <div class="bg-[#16161a] border border-[#2d2d38] rounded-xl p-5">
          <div class="flex gap-5">
            <!-- Cover art -->
            <div class="w-36 h-52 bg-[#23232b] rounded-lg shrink-0 relative overflow-hidden">
              <img
                v-if="currentCoverUrl"
                :src="currentCoverUrl"
                :alt="`Berserk Vol. ${state.currentVolume}`"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <div class="text-center">
                  <div class="text-[#c10b21] font-black text-5xl leading-none">B</div>
                  <div class="text-[#5a5a72] text-xs mt-1">BERSERK</div>
                </div>
              </div>
              <div class="absolute inset-0 bg-gradient-to-b from-transparent to-[#111114]/60"></div>
              <span class="absolute top-2 right-2 bg-[#c10b21] text-white text-xs px-2 py-0.5 rounded font-medium">Reading Now</span>
            </div>

            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <div class="w-4 h-4 bg-[#c10b21] rounded flex items-center justify-center">
                  <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/></svg>
                </div>
                <h2 class="text-white font-bold text-lg">Berserk</h2>
              </div>
              <p class="text-[#5a5a72] text-xs mb-4">by Kentaro Miura</p>

              <div class="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p class="text-[#5a5a72] text-xs mb-0.5">Current Volume</p>
                  <p class="text-white font-semibold">Volume {{ String(state.currentVolume).padStart(2, '0') }}</p>
                </div>
                <div>
                  <p class="text-[#5a5a72] text-xs mb-0.5">Chapter</p>
                  <p class="text-white font-semibold">Chapter {{ String(state.currentChapter).padStart(2, '0') }}</p>
                </div>
              </div>

              <div class="mb-1">
                <div class="flex justify-between text-xs text-[#5a5a72] mb-1">
                  <span>Chapter Progress</span>
                  <span>{{ (state.completedChapters[state.currentVolume] ?? []).length }} / {{ getVolumeChaptersCount(state.currentVolume) }} chapters</span>
                </div>
                <div class="h-1.5 bg-[#23232b] rounded-full overflow-hidden">
                  <div class="h-full bg-[#c10b21] rounded-full" :style="{ width: getChapterPct(state.currentVolume) + '%' }"></div>
                </div>
              </div>

              <p class="text-[#5a5a72] text-xs mb-4">
                <svg class="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>
                Last read: {{ timeAgo(state.lastRead) }}
              </p>

              <div class="flex gap-2">
                <button
                  @click="router.push('/archive')"
                  class="flex-1 bg-[#c10b21] hover:bg-[#a00d20] text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
                >
                  Continue Reading
                </button>
                <button
                  @click="toggleVolume(state.currentVolume)"
                  class="flex-1 text-sm font-medium py-2 rounded-lg border transition-all duration-150"
                  :class="isVolumeCompleted(state.currentVolume)
                    ? 'border-[#c10b21]/40 text-[#c10b21] bg-[#c10b21]/10 hover:bg-[#c10b21]/20'
                    : 'border-[#3d3d4d] text-[#8888a0] hover:border-[#c10b21]/40 hover:text-white'"
                >
                  {{ isVolumeCompleted(state.currentVolume) ? '✓ Completed' : 'Mark Complete' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-[#16161a] border border-[#2d2d38] rounded-xl p-5">
          <h3 class="text-white font-semibold mb-4">Recent Activity</h3>
          <div v-if="state.recentActivity.length === 0" class="text-[#5a5a72] text-sm">
            No activity yet. Start reading to track your progress!
          </div>
          <div v-else class="space-y-1">
            <div
              v-for="(item, i) in state.recentActivity.slice(0, 5)"
              :key="i"
              class="flex items-start gap-3 py-2.5 border-b border-[#23232b] last:border-0"
            >
              <div class="w-1 h-1 bg-[#c10b21] rounded-full mt-2 shrink-0"></div>
              <div class="flex-1 min-w-0">
                <p class="text-[#e5e5ef] text-sm truncate">{{ item.text }}</p>
                <p class="text-[#5a5a72] text-xs mt-0.5">{{ timeAgo(item.time) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right column: Quick Stats + Progress Cards -->
      <div class="space-y-5">

        <!-- Reading Goal card -->
        <div class="bg-[#16161a] border border-[#2d2d38] rounded-xl p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-white font-semibold text-sm">Reading Goal</h3>
            <div class="flex items-center gap-2">
              <button @click="openGoalModal" class="text-[#5a5a72] hover:text-white text-xs transition-colors">
                {{ state.readingGoal ? 'Edit' : 'Set Goal' }}
              </button>
              <button v-if="state.readingGoal" @click="clearReadingGoal" class="text-[#5a5a72] hover:text-[#f83244] text-xs transition-colors">Clear</button>
            </div>
          </div>

          <!-- No goal set -->
          <div v-if="!goalStats" class="text-center py-3">
            <p class="text-[#5a5a72] text-xs mb-2">No goal set yet</p>
            <button @click="openGoalModal" class="text-xs px-3 py-1.5 rounded-lg bg-[#c10b21] hover:bg-[#a00d20] text-white transition-colors">Set a Goal</button>
          </div>

          <!-- Goal active -->
          <div v-else>
            <div class="flex items-center justify-between mb-2">
              <span class="text-[#5a5a72] text-xs">Vol {{ completedCount }} / {{ goalStats.targetVolume }}</span>
              <span
                class="text-xs font-medium px-2 py-0.5 rounded-full"
                :class="goalStats.done ? 'bg-green-500/20 text-green-400' : goalStats.daysLeft < 0 ? 'bg-[#f83244]/20 text-[#f83244]' : goalStats.onTrack ? 'bg-[#c10b21]/20 text-[#c10b21]' : 'bg-yellow-500/20 text-yellow-400'"
              >
                {{ goalStats.done ? '✓ Goal reached!' : goalStats.daysLeft < 0 ? 'Overdue' : goalStats.onTrack ? 'On track' : 'Behind' }}
              </span>
            </div>
            <div class="h-2 bg-[#23232b] rounded-full overflow-hidden mb-2">
              <div class="h-full bg-[#c10b21] rounded-full transition-all duration-700" :style="{ width: goalStats.pct + '%' }"></div>
            </div>
            <div class="flex justify-between text-xs text-[#5a5a72]">
              <span>{{ goalStats.volsNeeded }} volumes left</span>
              <span>{{ goalStats.daysLeft > 0 ? goalStats.daysLeft + ' days left' : goalStats.daysLeft === 0 ? 'Due today' : Math.abs(goalStats.daysLeft) + ' days overdue' }}</span>
            </div>
            <p class="text-[#3d3d4d] text-xs mt-1.5 text-right">Target: {{ new Date(goalStats.targetDate).toLocaleDateString() }}</p>
          </div>
        </div>

        <!-- Quick Stats panel -->
        <div class="bg-[#16161a] border border-[#2d2d38] rounded-xl p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-white font-semibold">Quick Stats</h3>
            <span class="text-[#5a5a72] text-xs">Your reading overview</span>
          </div>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-[#8888a0] text-sm">Apostles Documented</span>
              <span class="text-white font-semibold">{{ state.apostlesEncountered.length }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[#8888a0] text-sm">Volumes Left</span>
              <span class="text-white font-semibold">{{ volumesLeft }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[#8888a0] text-sm">Current Arc</span>
              <span class="text-[#c10b21] font-semibold text-sm">{{ currentArc }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[#8888a0] text-sm">Badges</span>
              <span class="text-white font-semibold">{{ unlockedCount }} / 12</span>
            </div>
          </div>
        </div>

        <!-- Stat cards grid -->
        <div class="grid grid-cols-2 gap-3">
          <!-- Apostles encountered -->
          <div class="bg-[#16161a] border border-[#2d2d38] rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="w-6 h-6 bg-[#c10b21]/20 rounded flex items-center justify-center">
                <svg class="w-3.5 h-3.5 text-[#c10b21]" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm8 0a3 3 0 11-6 0 3 3 0 016 0zm-4.07 11c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>
              </div>
              <svg class="w-3 h-3 text-[#c10b21]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
            </div>
            <p class="text-white font-bold text-2xl">{{ state.apostlesEncountered.length }}</p>
            <p class="text-[#5a5a72] text-xs mt-0.5">Apostles Encountered</p>
          </div>

          <!-- Volumes left -->
          <div class="bg-[#16161a] border border-[#2d2d38] rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="w-6 h-6 bg-[#c10b21]/20 rounded flex items-center justify-center">
                <svg class="w-3.5 h-3.5 text-[#c10b21]" fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/></svg>
              </div>
              <svg class="w-3 h-3 text-[#5a5a72]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
            </div>
            <p class="text-white font-bold text-2xl">{{ volumesLeft }}</p>
            <p class="text-[#5a5a72] text-xs mt-0.5">Volumes Left</p>
          </div>

          <!-- Reading streak -->
          <div class="bg-[#16161a] border border-[#2d2d38] rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="w-6 h-6 bg-[#c10b21]/20 rounded flex items-center justify-center">
                <svg class="w-3.5 h-3.5 text-[#c10b21]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>
              </div>
              <svg class="w-3 h-3 text-[#c10b21]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
            </div>
            <p class="text-white font-bold text-2xl">{{ state.readingStreak }} <span class="text-base font-normal">days</span></p>
            <p class="text-[#5a5a72] text-xs mt-0.5">Reading Streak</p>
          </div>

          <!-- Total chapters -->
          <div class="bg-[#16161a] border border-[#2d2d38] rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="w-6 h-6 bg-[#c10b21]/20 rounded flex items-center justify-center">
                <svg class="w-3.5 h-3.5 text-[#c10b21]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/></svg>
              </div>
            </div>
            <p class="text-white font-bold text-2xl">{{ totalChapters }}</p>
            <p class="text-[#5a5a72] text-xs mt-0.5">Total Chapters</p>
          </div>
        </div>

        <!-- Arc progress indicator -->
        <div class="bg-[#16161a] border border-[#2d2d38] rounded-xl p-4">
          <h3 class="text-white font-semibold text-sm mb-3">Arc Progress</h3>
          <div class="space-y-2.5">
            <div v-for="arc in [
              { name: 'Black Swordsman', start: 1,  end: 3  },
              { name: 'Golden Age',      start: 4,  end: 10 },
              { name: 'Conviction',      start: 11, end: 21 },
              { name: 'Millennium Falcon', start: 22, end: 28 },
              { name: 'Fantasia',        start: 29, end: 41 },
            ]" :key="arc.name">
              <div class="flex justify-between text-xs mb-1">
                <span :class="currentArc === arc.name ? 'text-[#c10b21] font-medium' : 'text-[#8888a0]'">{{ arc.name }}</span>
                <span class="text-[#5a5a72]">Vol {{ arc.start }}-{{ arc.end }}</span>
              </div>
              <div class="h-1 bg-[#23232b] rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="currentArc === arc.name ? 'bg-[#c10b21]' : completedCount >= arc.end ? 'bg-[#5a5a72]' : 'bg-[#2d2d38]'"
                  :style="{ width: Math.min(100, Math.max(0, ((state.completedVolumes.filter(v => v >= arc.start && v <= arc.end).length) / (arc.end - arc.start + 1)) * 100)) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reading Goal Modal -->
    <div v-if="showGoalModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" @click.self="showGoalModal = false">
      <div class="bg-[#1c1c22] border border-[#3d3d4d] rounded-2xl p-6 w-96">
        <h3 class="text-white font-bold text-lg mb-5">Set Reading Goal</h3>
        <div class="space-y-4">
          <div>
            <label class="text-[#8888a0] text-sm block mb-1.5">Target Volume (1–41)</label>
            <input
              v-model.number="goalVolume"
              type="number" min="1" max="41"
              class="w-full bg-[#23232b] border border-[#3d3d4d] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#c10b21]"
            />
          </div>
          <div>
            <label class="text-[#8888a0] text-sm block mb-1.5">Target Date</label>
            <input
              v-model="goalDate"
              type="date"
              class="w-full bg-[#23232b] border border-[#3d3d4d] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#c10b21]"
            />
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="showGoalModal = false" class="flex-1 bg-[#2d2d38] hover:bg-[#3d3d4d] text-[#8888a0] py-2.5 rounded-lg text-sm transition-colors">Cancel</button>
          <button @click="saveGoal" :disabled="!goalDate" class="flex-1 bg-[#c10b21] hover:bg-[#a00d20] disabled:opacity-40 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">Save Goal</button>
        </div>
      </div>
    </div>

    <!-- Update Progress Modal -->
    <div v-if="showUpdateModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" @click.self="showUpdateModal = false">
      <div class="bg-[#1c1c22] border border-[#3d3d4d] rounded-2xl p-6 w-96">
        <h3 class="text-white font-bold text-lg mb-5">Update Reading Progress</h3>
        <div class="space-y-4">
          <div>
            <label class="text-[#8888a0] text-sm block mb-1.5">Current Volume (1–41)</label>
            <input
              v-model.number="editVolume"
              type="number" min="1" max="41"
              class="w-full bg-[#23232b] border border-[#3d3d4d] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#c10b21]"
            />
          </div>
          <div>
            <label class="text-[#8888a0] text-sm block mb-1.5">Current Chapter</label>
            <input
              v-model.number="editChapter"
              type="number" min="1"
              class="w-full bg-[#23232b] border border-[#3d3d4d] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#c10b21]"
            />
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="showUpdateModal = false" class="flex-1 bg-[#2d2d38] hover:bg-[#3d3d4d] text-[#8888a0] py-2.5 rounded-lg text-sm transition-colors">Cancel</button>
          <button @click="saveProgress" class="flex-1 bg-[#c10b21] hover:bg-[#a00d20] text-white py-2.5 rounded-lg text-sm font-medium transition-colors">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>


