<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProgress, getVolumeChapters } from '../composables/useProgress.js'
import { useSettings } from '../composables/useSettings.js'
import { useCovers } from '../composables/useCovers.js'

const route  = useRoute()
const router = useRouter()
const { fetchAllCovers, getCover } = useCovers()
const {
  state, isVolumeCompleted, toggleVolume, setCurrentProgress,
  isChapterCompleted, toggleChapter, getVolumeChapterProgress,
  setVolumeRating, getVolumeRating,
  addVolumeNote, clearVolumeNotes, getVolumeNotes, timeAgo,
} = useProgress()
const { settings } = useSettings()

// --- Reactivity timer for timeAgo labels ---
const tick = ref(0)
let tickInterval = null
onMounted(() => { tickInterval = setInterval(() => tick.value++, 60000) })
onUnmounted(() => clearInterval(tickInterval))

// --- Notes ---
const newNote = ref('')
function postNote() { if (addVolumeNote(volumeId.value, newNote.value)) newNote.value = '' }
const notes = computed(() => getVolumeNotes(volumeId.value))

// --- Rating ---
const hoverRating = ref(0)

// --- Volume data ---
const justSaved  = ref(false)
const volumeId   = computed(() => parseInt(route.params.id))
const volume     = ref(null)
const loading    = ref(true)

// Chapters for the current volume — reactive because volumeId can change
const volumeChapters = computed(() => volumeId.value ? getVolumeChapters(volumeId.value) : [])
const chapterProgress = computed(() => getVolumeChapterProgress(volumeId.value))

function getArc(vol) {
  if (vol <= 3)  return 'Black Swordsman'
  if (vol <= 10) return 'Golden Age'
  if (vol <= 21) return 'Conviction'
  if (vol <= 28) return 'Millennium Falcon'
  return 'Fantasia'
}

async function fetchVolume() {
  loading.value = true
  const id = volumeId.value
  const chapters = getVolumeChapters(id)

  // Use the same MangaDex cover cache as Archive — gets the right cover per volume
  await fetchAllCovers()
  const coverUrl = getCover(id)

  volume.value = {
    id,
    title:       `Berserk Vol. ${id}`,
    volume:      id,
    arc:         getArc(id),
    coverUrl,
    chapterCount: chapters.length,
    chapterStart: chapters[0],
    chapterEnd:   chapters[chapters.length - 1],
    synopsis:    `Volume ${id} of Berserk by Kentaro Miura. Part of the ${getArc(id)} arc, following Guts on his dark journey through a world of demons and apostles. This volume contains chapters ${chapters[0]}–${chapters[chapters.length - 1]}.`,
    author:      'Kentaro Miura',
    publisher:   'Dark Horse Comics',
    year:        1989 + Math.floor(id / 2),
  }
  loading.value = false
}

onMounted(fetchVolume)

const arcColors = {
  'Black Swordsman': '#c10b21',
  'Golden Age':      '#d4a017',
  'Conviction':      '#7b3ff2',
  'Millennium Falcon':'#0f766e',
  'Fantasia':        '#c10b21',
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
        <div class="mt-4 flex flex-col gap-3">
          <button
            @click="toggleVolume(volumeId)"
            class="w-56 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
            :class="isVolumeCompleted(volumeId)
              ? 'bg-[#c10b21]/10 border border-[#c10b21]/40 text-[#c10b21] hover:bg-[#c10b21]/20'
              : 'bg-[#c10b21] text-white hover:bg-[#a00d20]'"
          >
            {{ isVolumeCompleted(volumeId) ? '✓ Mark as Unread' : 'Mark as Complete' }}
          </button>
          <div class="w-56 border-t border-[#2d2d38]"></div>
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

          <!-- Notes — comment style, up to 10 per volume -->
          <div v-if="isVolumeCompleted(volumeId)" class="mt-4">
            <div class="flex items-center justify-between mb-2">
              <p class="text-[#5a5a72] text-xs">Notes {{ notes.length ? `(${notes.length}/10)` : '' }}</p>
              <button
                v-if="notes.length"
                @click="clearVolumeNotes(volumeId)"
                class="text-[#5a5a72] hover:text-[#f83244] text-xs transition-colors"
              >Clear all</button>
            </div>
            <!-- Input row -->
            <div class="flex flex-col gap-1.5 w-56 mb-3">
              <textarea
                v-model="newNote"
                placeholder="Leave a note..."
                rows="3"
                @keydown.ctrl.enter="postNote"
                class="w-full bg-[#23232b] border border-[#3d3d4d] rounded-lg px-3 py-2 text-white text-xs placeholder-[#5a5a72] focus:outline-none focus:border-[#c10b21] resize-none transition-colors"
              ></textarea>
              <button
                @click="postNote"
                :disabled="!newNote.trim() || notes.length >= 10"
                class="w-full py-1.5 rounded-lg text-xs font-medium border border-[#3d3d4d] text-[#8888a0] hover:border-[#c10b21]/40 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {{ notes.length >= 10 ? 'Limit reached' : 'Post Note' }}
              </button>
            </div>
            <!-- Posted notes list -->
            <div v-if="notes.length" class="w-56 space-y-2">
              <div
                v-for="(note, i) in notes"
                :key="i"
                class="bg-[#23232b] border border-[#3d3d4d] rounded-lg px-3 py-2"
              >
                <p class="text-white text-xs leading-relaxed">{{ note.text }}</p>
                <p class="text-[#5a5a72] text-xs mt-1">{{ note.time ? (tick, timeAgo(note.time)) : '' }}</p>
              </div>
            </div>
          </div>

          <!-- Star rating — only shown after marking complete -->
          <div v-if="isVolumeCompleted(volumeId)" class="mt-4">
            <p class="text-[#5a5a72] text-xs mb-2">Your Rating</p>
            <div class="flex items-center gap-1">
              <button
                v-for="star in 5"
                :key="star"
                @mouseenter="hoverRating = star"
                @mouseleave="hoverRating = 0"
                @click="setVolumeRating(volumeId, getVolumeRating(volumeId) === star ? 0 : star)"
                class="transition-transform hover:scale-110"
              >
                <svg
                  class="w-6 h-6 transition-colors duration-100"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  :class="star <= (hoverRating || getVolumeRating(volumeId)) ? 'text-[#d4a017]' : 'text-[#3d3d4d]'"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </button>
              <span class="text-[#5a5a72] text-xs ml-2">
                {{ getVolumeRating(volumeId) ? getVolumeRating(volumeId) + '/5' : 'Not rated' }}
              </span>
            </div>
          </div>
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
            <p class="text-white font-bold text-xl">{{ volume.chapterCount }}</p>
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
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-white font-semibold">Synopsis</h3>
            <span v-if="settings.spoilerBlur && !isVolumeCompleted(volumeId)" class="text-[#5a5a72] text-xs">🔒 Spoiler hidden</span>
          </div>
          <p
            class="text-[#8888a0] text-sm leading-relaxed transition-all duration-300 select-none"
            :class="settings.spoilerBlur && !isVolumeCompleted(volumeId) ? 'blur-sm' : ''"
          >{{ volume.synopsis }}</p>
        </div>

        <!-- Chapter list — fully interactive -->
        <div class="bg-[#16161a] border border-[#2d2d38] rounded-xl p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-white font-semibold">Chapters in this Volume</h3>
            <span class="text-[#5a5a72] text-xs">{{ chapterProgress.done }} / {{ chapterProgress.total }} read</span>
          </div>

          <!-- Chapter progress bar -->
          <div class="h-1.5 bg-[#23232b] rounded-full overflow-hidden mb-4">
            <div
              class="h-full bg-[#c10b21] rounded-full transition-all duration-500"
              :style="{ width: chapterProgress.pct + '%' }"
            ></div>
          </div>

          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="chNum in volumeChapters"
              :key="chNum"
              @click="toggleChapter(volumeId, chNum)"
              class="rounded-lg p-3 text-center transition-all duration-150 border group"
              :class="isChapterCompleted(volumeId, chNum)
                ? 'bg-[#c10b21]/15 border-[#c10b21]/50 hover:bg-[#c10b21]/25'
                : 'bg-[#23232b] border-transparent hover:bg-[#2d2d38] hover:border-[#3d3d4d]'"
            >
              <p class="text-[#5a5a72] text-xs mb-0.5">Chapter</p>
              <p
                class="font-semibold text-sm"
                :class="isChapterCompleted(volumeId, chNum) ? 'text-[#c10b21]' : 'text-white'"
              >{{ String(chNum).padStart(3, '0') }}</p>
              <div class="mt-1 h-3 flex items-center justify-center">
                <svg
                  v-if="isChapterCompleted(volumeId, chNum)"
                  class="w-3 h-3 text-[#c10b21]"
                  fill="currentColor" viewBox="0 0 20 20"
                >
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
