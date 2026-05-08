<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProgress } from '../composables/useProgress.js'

const route = useRoute()
const router = useRouter()
const { state, isVolumeCompleted, toggleVolume, setCurrentProgress } = useProgress()

const justSaved = ref(false)


const volumeId = computed(() => parseInt(route.params.id))
const volume = ref(null)
const loading = ref(true)

function getArc(vol) {
  if (vol <= 3) return 'Black Swordsman'
  if (vol <= 10) return 'Golden Age'
  if (vol <= 21) return 'Conviction'
  if (vol <= 28) return 'Millennium Falcon'
  return 'Fantasia'
}

function getChapterRange(vol) {
  // Approximate chapter ranges per volume
  const start = (vol - 1) * 8 + 1
  const end = Math.min(364, vol * 8)
  return { start, end, count: end - start + 1 }
}

async function fetchVolume() {
  loading.value = true
  const id = volumeId.value

  // Try fetching from Jikan API
  let coverUrl = null
  try {
    const resp = await fetch(`https://api.jikan.moe/v4/manga/2/full`)
    if (resp.ok) {
      const data = await resp.json()
      coverUrl = data?.data?.images?.jpg?.large_image_url ?? null
    }
  } catch {}

  const range = getChapterRange(id)
  volume.value = {
    id,
    title: `Berserk Vol. ${id}`,
    volume: id,
    arc: getArc(id),
    coverUrl,
    chapters: range.count,
    chapterStart: range.start,
    chapterEnd: range.end,
    synopsis: `Volume ${id} of Berserk by Kentaro Miura. Part of the ${getArc(id)} arc, following Guts on his dark journey through a world of demons and apostles. This volume contains chapters ${range.start}–${range.end}.`,
    author: 'Kentaro Miura',
    publisher: 'Dark Horse Comics',
    year: 1989 + Math.floor(id / 2),
  }
  loading.value = false
}

onMounted(fetchVolume)

const arcColors = {
  'Black Swordsman': '#c10b21',
  'Golden Age': '#d4a017',
  'Conviction': '#7b3ff2',
  'Millennium Falcon': '#0f766e',
  'Fantasia': '#c10b21',
}

function markCurrentlyReading() {
  if (volume.value) {
    setCurrentProgress(volume.value.volume, volume.value.chapterStart)
    justSaved.value = true
    setTimeout(() => { justSaved.value = false }, 2000)
  }
}

const isCurrentVolume = computed(() => state.currentVolume === volumeId.value)
</script>

<template>
  <div class="p-6 min-h-screen bg-[#111114]">
    <!-- Back button -->
    <button
      @click="router.push('/archive')"
      class="flex items-center gap-2 text-[#5a5a72] hover:text-white text-sm mb-6 transition-colors"
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
      Back to Archive
    </button>

    <!-- Loading -->
    <div v-if="loading" class="flex gap-8 animate-pulse">
      <div class="w-64 h-96 bg-[#16161a] rounded-xl shrink-0"></div>
      <div class="flex-1 space-y-4">
        <div class="h-8 bg-[#16161a] rounded w-1/2"></div>
        <div class="h-4 bg-[#16161a] rounded w-1/3"></div>
        <div class="h-24 bg-[#16161a] rounded"></div>
      </div>
    </div>

    <!-- Volume content -->
    <div v-else-if="volume" class="flex gap-8">
      <!-- Cover -->
      <div class="shrink-0">
        <div class="w-56 h-80 bg-[#16161a] rounded-xl overflow-hidden border border-[#2d2d38] relative">
          <img v-if="volume.coverUrl" :src="volume.coverUrl" :alt="volume.title" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#1c1c22] to-[#111114]">
            <div class="text-center">
              <div class="text-[#c10b21] font-black text-7xl leading-none">B</div>
              <div class="text-[#5a5a72] text-sm mt-2">BERSERK</div>
              <div class="text-[#3d3d4d] text-xs mt-1">VOL {{ String(volume.volume).padStart(2,'0') }}</div>
            </div>
          </div>
          <div v-if="isVolumeCompleted(volumeId)" class="absolute top-3 right-3 bg-[#c10b21] text-white text-xs px-2 py-1 rounded-lg font-medium">
            ✓ Read
          </div>
        </div>

        <!-- Action buttons -->
        <div class="mt-4 space-y-2">
          <button
            @click="toggleVolume(volumeId)"
            class="w-56 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
            :class="isVolumeCompleted(volumeId)
              ? 'bg-[#c10b21]/10 border border-[#c10b21]/40 text-[#c10b21] hover:bg-[#c10b21]/20'
              : 'bg-[#c10b21] text-white hover:bg-[#a00d20]'"
          >
            {{ isVolumeCompleted(volumeId) ? '✓ Mark as Unread' : 'Mark as Complete' }}
          </button>
          <button
            @click="markCurrentlyReading"
            class="w-56 py-2.5 rounded-xl text-sm font-medium border transition-colors"
            :class="justSaved
              ? 'border-green-500/40 text-green-400 bg-green-500/10'
              : isCurrentVolume
                ? 'border-[#c10b21]/40 text-[#c10b21] bg-[#c10b21]/10 hover:bg-[#c10b21]/20'
                : 'border-[#3d3d4d] text-[#8888a0] hover:border-[#c10b21]/40 hover:text-white'"
          >
            {{ justSaved ? '✓ Saved!' : isCurrentVolume ? '★ Currently Reading' : 'Set as Current' }}
          </button>
        </div>
      </div>

      <!-- Details -->
      <div class="flex-1">
        <div class="flex items-start justify-between mb-2">
          <div>
            <span
              class="text-xs px-2.5 py-1 rounded-full font-medium mb-3 inline-block"
              :style="{ background: arcColors[volume.arc] + '22', color: arcColors[volume.arc], border: '1px solid ' + arcColors[volume.arc] + '44' }"
            >{{ volume.arc }} Arc</span>
            <h1 class="text-3xl font-bold text-white mt-2">{{ volume.title }}</h1>
            <p class="text-[#8888a0] mt-1">by {{ volume.author }} · {{ volume.publisher }} · {{ volume.year }}</p>
          </div>
        </div>

        <!-- Stats row -->
        <div class="flex gap-6 my-6">
          <div>
            <p class="text-[#5a5a72] text-xs mb-1">Volume</p>
            <p class="text-white font-bold text-xl">{{ String(volume.volume).padStart(2,'0') }}</p>
          </div>
          <div class="w-px bg-[#2d2d38]"></div>
          <div>
            <p class="text-[#5a5a72] text-xs mb-1">Chapters</p>
            <p class="text-white font-bold text-xl">{{ volume.chapters }}</p>
          </div>
          <div class="w-px bg-[#2d2d38]"></div>
          <div>
            <p class="text-[#5a5a72] text-xs mb-1">Chapter Range</p>
            <p class="text-white font-bold text-xl">{{ volume.chapterStart }}–{{ volume.chapterEnd }}</p>
          </div>
          <div class="w-px bg-[#2d2d38]"></div>
          <div>
            <p class="text-[#5a5a72] text-xs mb-1">Status</p>
            <p class="font-bold text-xl" :class="isVolumeCompleted(volumeId) ? 'text-[#c10b21]' : 'text-[#8888a0]'">
              {{ isVolumeCompleted(volumeId) ? 'Complete' : 'Unread' }}
            </p>
          </div>
        </div>

        <!-- Synopsis -->
        <div class="bg-[#16161a] border border-[#2d2d38] rounded-xl p-5 mb-5">
          <h3 class="text-white font-semibold mb-3">Synopsis</h3>
          <p class="text-[#8888a0] text-sm leading-relaxed">{{ volume.synopsis }}</p>
        </div>

        <!-- Chapter list -->
        <div class="bg-[#16161a] border border-[#2d2d38] rounded-xl p-5">
          <h3 class="text-white font-semibold mb-4">Chapters in this Volume</h3>
          <div class="grid grid-cols-4 gap-2">
            <div
              v-for="ch in volume.chapters"
              :key="ch"
              class="bg-[#23232b] hover:bg-[#2d2d38] rounded-lg p-3 text-center cursor-pointer transition-colors"
              :class="isVolumeCompleted(volumeId) ? 'border border-[#c10b21]/30' : 'border border-transparent'"
            >
              <p class="text-[#8888a0] text-xs mb-0.5">Chapter</p>
              <p class="text-white font-semibold text-sm">{{ String(volume.chapterStart + ch - 1).padStart(3, '0') }}</p>
              <div v-if="isVolumeCompleted(volumeId)" class="mt-1">
                <svg class="w-3 h-3 text-[#c10b21] mx-auto" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
