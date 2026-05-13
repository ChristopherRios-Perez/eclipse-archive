<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProgress } from '../composables/useProgress.js'
import { useSidebar } from '../composables/useSidebar.js'
import { useSettings } from '../composables/useSettings.js'
import { COVER_URLS } from '../data/covers.js'

const router = useRouter()
const { state, isVolumeCompleted, toggleVolume, completedCount, totalVolumes, getVolumeRating, getVolumeNotes, toggleWishlist, isWishlisted } = useProgress()
const { settings } = useSettings()
const { isOpen } = useSidebar() // nudges the header title when sidebar collapses

const volumes = ref([]) // populated after the MangaDex cover fetch
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const filterStatus = ref('all')
const viewMode = ref('grid') // grid or list

// Static volume metadata - covers get attached later after the API call
const berserkVolumes = Array.from({ length: 41 }, (_, i) => ({
  id: i + 1,
  title: `Berserk Vol. ${i + 1}`,
  volume: i + 1,
  chapters: getChapterCount(i + 1),
  arc: getArc(i + 1),
}))

// Per-volume chapter counts from published data - most are 8, a few early ones are 9
function getChapterCount(vol) {
  const map = {1:8,2:8,3:8,4:8,5:8,6:8,7:9,8:9,9:9,10:9,11:9,12:8,13:8,14:8,15:8,16:8,17:8,18:8,19:8,20:8,21:8,22:8,23:8,24:8,25:8,26:8,27:8,28:8,29:8,30:8,31:8,32:8,33:8,34:8,35:8,36:8,37:8,38:8,39:8,40:8,41:8}
  return map[vol] ?? 8
}

function getArc(vol) {
  if (vol <= 3) return 'Black Swordsman'
  if (vol <= 10) return 'Golden Age'
  if (vol <= 21) return 'Conviction'
  if (vol <= 28) return 'Millennium Falcon'
  if (vol <= 34) return 'Fantasia'
  return 'Fantasia'
}

async function fetchBerserkCovers() {
  // Covers are now bundled from src/data/covers.js - no API call needed
  berserkVolumes.forEach(v => {
    if (COVER_URLS[v.volume]) v.coverUrl = COVER_URLS[v.volume]
  })
  volumes.value = [...berserkVolumes]
  loading.value = false
}

onMounted(fetchBerserkCovers)

const filtered = computed(() => {
  return volumes.value.filter(v => {
    // Search matches on title or arc name
    const matchSearch = v.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      v.arc.toLowerCase().includes(searchQuery.value.toLowerCase())
    const completed = isVolumeCompleted(v.id)
    const matchFilter = filterStatus.value === 'all'
      ? true
      : filterStatus.value === 'completed' ? completed
      : filterStatus.value === 'wishlist' ? isWishlisted(v.id)
      : filterStatus.value === 'in-progress' ? (v.id === 1 && !completed)
      : !completed // 'unread'
    return matchSearch && matchFilter
  })
})

const inProgressCount = computed(() => {
  // A volume counts as in-progress if it's the current reading volume and not yet fully completed
  return volumes.value.filter(v => !isVolumeCompleted(v.id) && v.id === state.currentVolume).length
})

// Arc color palette - Black Swordsman and Fantasia both use crimson intentionally
const arcColors = {
  'Black Swordsman': '#c10b21',
  'Golden Age': '#d4a017',
  'Conviction': '#7b3ff2',
  'Millennium Falcon': '#0f766e',
  'Fantasia': '#c10b21',
}
</script>

<template>
  <div class="p-6 min-h-screen bg-[#111114]">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-white transition-all duration-300" :class="isOpen ? '' : 'pl-6'">The Archive</h1>
      <p class="text-[#5a5a72] text-sm mt-0.5">
        {{ totalVolumes }} total volumes · {{ completedCount }} completed · {{ inProgressCount }} in progress · {{ state.wishlist.length }} wishlisted
      </p>
    </div>

    <!-- Controls bar -->
    <div class="flex items-center gap-3 mb-6">
      <div class="relative flex-1 max-w-sm">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by volume number..."
          class="w-full bg-[#1c1c22] border border-[#3d3d4d] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#5a5a72] focus:outline-none focus:border-[#c10b21]"
        />
        <svg class="w-4 h-4 absolute right-3 top-3 text-[#5a5a72]" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
        </svg>
      </div>

      <select
        v-model="filterStatus"
        class="bg-[#1c1c22] border border-[#3d3d4d] rounded-lg px-3 py-2.5 text-sm text-[#8888a0] focus:outline-none focus:border-[#c10b21]"
      >
        <option value="all">All Volumes</option>
        <option value="completed">Completed</option>
        <option value="unread">Unread</option>
        <option value="wishlist">Wishlist</option>
      </select>

      <!-- Grid/List toggle -->
      <div class="flex items-center gap-1 bg-[#1c1c22] border border-[#3d3d4d] rounded-lg p-1">
        <button
          @click="viewMode = 'grid'"
          class="p-1.5 rounded transition-colors"
          :class="viewMode === 'grid' ? 'bg-[#c10b21] text-white' : 'text-[#5a5a72] hover:text-white'"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 8a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zm6-6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
        </button>
        <button
          @click="viewMode = 'list'"
          class="p-1.5 rounded transition-colors"
          :class="viewMode === 'list' ? 'bg-[#c10b21] text-white' : 'text-[#5a5a72] hover:text-white'"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/></svg>
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="grid grid-cols-6 gap-3">
      <div v-for="i in 12" :key="i" class="bg-[#16161a] rounded-xl animate-pulse">
        <div class="aspect-[2/3] bg-[#23232b] rounded-t-xl"></div>
        <div class="p-3 space-y-2">
          <div class="h-3 bg-[#23232b] rounded w-1/2"></div>
          <div class="h-2 bg-[#23232b] rounded w-3/4"></div>
        </div>
      </div>
    </div>

    <!-- Grid view -->
    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-6 gap-3">
      <div
        v-for="vol in filtered"
        :key="vol.id"
        class="bg-[#16161a] border border-[#2d2d38] rounded-xl overflow-hidden cursor-pointer hover:border-[#c10b21]/50 transition-all duration-200 hover:scale-[1.02] group"
        @click="router.push('/archive/' + vol.id)"
      >
        <!-- Cover -->
        <div class="aspect-[2/3] relative overflow-hidden bg-[#23232b]">
          <img
            v-if="vol.coverUrl"
            :src="vol.coverUrl"
            :alt="vol.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            :class="settings.spoilerBlur && !isVolumeCompleted(vol.id) ? 'blur-sm scale-105' : ''"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <div class="text-center">
              <div class="text-[#c10b21] font-black text-4xl leading-none">B</div>
              <div class="text-[#3d3d4d] text-xs mt-1">VOL {{ String(vol.volume).padStart(2,'0') }}</div>
            </div>
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-[#0d0d0f]/80 via-transparent to-transparent"></div>
          <!-- Spoiler overlay -->
          <div
            v-if="settings.spoilerBlur && !isVolumeCompleted(vol.id)"
            class="absolute inset-0 flex items-center justify-center"
          >
            <span class="bg-black/60 text-white text-xs px-2 py-1 rounded-lg font-medium">Spoiler</span>
          </div>

          <!-- Wishlist bookmark -->
          <button
            @click.stop="toggleWishlist(vol.id)"
            class="absolute top-2 left-2 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
            :class="isWishlisted(vol.id)
              ? 'bg-[#d4a017] text-white'
              : 'bg-black/40 text-white/60 hover:bg-black/60 hover:text-white'"
            title="Toggle wishlist"
          >
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
            </svg>
          </button>

          <!-- Status badge -->
          <div
            v-if="isVolumeCompleted(vol.id)"
            class="absolute top-2 right-2 bg-[#c10b21] text-white text-xs px-2 py-0.5 rounded font-medium flex items-center gap-1"
          >
            <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
            Read
          </div>

        </div>

        <!-- Info -->
        <div class="p-3">
          <p class="text-[#5a5a72] text-xs mb-0.5">Volume</p>
          <p class="text-white font-semibold text-sm mb-1.5">{{ String(vol.volume).padStart(2, '0') }}</p>
          <!-- Arc badge -->
          <span class="inline-block text-xs px-2 py-0.5 rounded mb-1.5" :style="{ background: arcColors[vol.arc] + '33', border: '1px solid ' + arcColors[vol.arc] + '66', color: arcColors[vol.arc] }">
            {{ vol.arc }}
          </span>
          <!-- Note count indicator -->
          <span v-if="getVolumeNotes(vol.id).length" class="inline-block text-[#5a5a72] text-xs mb-1">
            📝 {{ getVolumeNotes(vol.id).length }} note{{ getVolumeNotes(vol.id).length > 1 ? 's' : '' }}
          </span>
          <!-- Star rating (only if rated) -->
          <div v-if="getVolumeRating(vol.id)" class="flex items-center gap-0.5">
            <svg
              v-for="star in 5" :key="star"
              class="w-3 h-3"
              fill="currentColor" viewBox="0 0 20 20"
              :class="star <= getVolumeRating(vol.id) ? 'text-[#d4a017]' : 'text-[#3d3d4d]'"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          </div>
        </div>

        <!-- Mark complete button -->
        <div class="px-3 pb-3">
          <button
            @click.stop="toggleVolume(vol.id)"
            class="w-full text-xs py-1.5 rounded-lg border transition-all duration-150 font-medium"
            :class="isVolumeCompleted(vol.id)
              ? 'border-[#c10b21]/40 text-[#c10b21] bg-[#c10b21]/10 hover:bg-[#c10b21]/20'
              : 'border-[#3d3d4d] text-[#5a5a72] hover:border-[#c10b21]/40 hover:text-[#c10b21]'"
          >
            {{ isVolumeCompleted(vol.id) ? '✓ Completed' : 'Mark Complete' }}
          </button>
        </div>
      </div>
    </div>

    <!-- List view -->
    <div v-else class="space-y-2">
      <div
        v-for="vol in filtered"
        :key="vol.id"
        class="bg-[#16161a] border border-[#2d2d38] rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-[#c10b21]/40 transition-colors"
        @click="router.push('/archive/' + vol.id)"
      >
        <div class="w-10 h-14 bg-[#23232b] rounded overflow-hidden shrink-0">
          <img v-if="vol.coverUrl" :src="vol.coverUrl" class="w-full h-full object-cover" :class="settings.spoilerBlur && !isVolumeCompleted(vol.id) ? 'blur-sm' : ''" />
          <div v-else class="w-full h-full flex items-center justify-center text-[#c10b21] font-black text-lg">B</div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-0.5">
            <p class="text-white font-semibold">Volume {{ String(vol.volume).padStart(2,'0') }}</p>
            <span class="text-xs px-1.5 py-0.5 rounded" :style="{ background: arcColors[vol.arc] + '22', color: arcColors[vol.arc] }">{{ vol.arc }}</span>
          </div>
          <p class="text-[#5a5a72] text-xs">{{ vol.chapters }} chapters</p>
        </div>
        <div class="flex items-center gap-3">
          <span v-if="isVolumeCompleted(vol.id)" class="text-[#c10b21] text-xs font-medium">✓ Read</span>
          <!-- Wishlist bookmark -->
          <button
            @click.stop="toggleWishlist(vol.id)"
            class="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
            :class="isWishlisted(vol.id) ? 'bg-[#d4a017] text-white' : 'bg-[#23232b] border border-[#3d3d4d] text-[#5a5a72] hover:text-white hover:border-[#d4a017]'"
            title="Toggle wishlist"
          >
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
            </svg>
          </button>
          <button
            @click.stop="toggleVolume(vol.id)"
            class="text-xs px-3 py-1.5 rounded-lg border transition-colors"
            :class="isVolumeCompleted(vol.id) ? 'border-[#c10b21]/40 text-[#c10b21]' : 'border-[#3d3d4d] text-[#5a5a72] hover:border-[#c10b21]/40 hover:text-[#c10b21]'"
          >
            {{ isVolumeCompleted(vol.id) ? 'Unmark' : 'Mark Complete' }}
          </button>
          <svg class="w-4 h-4 text-[#5a5a72]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && filtered.length === 0" class="text-center py-20">
      <div class="text-[#3d3d4d] text-5xl mb-4">📚</div>
      <p class="text-[#5a5a72]">No volumes match your search</p>
    </div>
  </div>
</template>
