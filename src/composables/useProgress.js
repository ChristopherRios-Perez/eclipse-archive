import { reactive, computed, watch } from 'vue'
import { api, getToken } from '../services/api.js'

const TOTAL_VOLUMES = 41
const TOTAL_CHAPTERS = 364
const STORAGE_KEY = 'eclipse-archive-progress'

// Per-volume chapter counts - single source of truth used everywhere
export const CHAPTER_COUNTS = {
  1:8,2:8,3:8,4:8,5:8,6:8,7:9,8:9,9:9,10:9,11:9,
  12:8,13:8,14:8,15:8,16:8,17:8,18:8,19:8,20:8,21:8,
  22:8,23:8,24:8,25:8,26:8,27:8,28:8,29:8,30:8,31:8,
  32:8,33:8,34:8,35:8,36:8,37:8,38:8,39:8,40:8,41:8,
}

// Returns the list of absolute chapter numbers that belong to a volume
export function getVolumeChapters(volId) {
  let start = 1
  for (let v = 1; v < volId; v++) start += (CHAPTER_COUNTS[v] ?? 8)
  const count = CHAPTER_COUNTS[volId] ?? 8
  return Array.from({ length: count }, (_, i) => start + i)
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

const saved = loadFromStorage()

// Backfill completedChapters for volumes that were marked complete before chapter tracking existed.
// Without this, old saves would show all chapters unchecked even for fully read volumes.
if (saved?.completedVolumes?.length && saved?.completedChapters) {
  saved.completedVolumes.forEach(volId => {
    if (!saved.completedChapters[volId] || saved.completedChapters[volId].length === 0) {
      saved.completedChapters[volId] = getVolumeChapters(volId)
    }
  })
}

const state = reactive({
  completedVolumes:   saved?.completedVolumes   ?? [],
  completedChapters:  saved?.completedChapters  ?? {}, // volId -> [chapterNum, ...]
  currentVolume:      saved?.currentVolume      ?? 1,
  currentChapter:     saved?.currentChapter     ?? 1,
  readingStreak:      saved?.readingStreak      ?? 0,
  apostlesEncountered:saved?.apostlesEncountered ?? [],
  recentActivity:     saved?.recentActivity     ?? [],
  lastRead:           saved?.lastRead            ?? null,
  volumeRatings:      saved?.volumeRatings      ?? {},
  volumeNotes:        saved?.volumeNotes        ?? {},
  wishlist:           saved?.wishlist           ?? [],
  readingGoal:        saved?.readingGoal        ?? null,
})

// Debounce so we don't hammer the API on rapid changes
let syncTimer = null

// Persist locally on every change; debounce-sync to API when a token exists.
// Guest users only ever use localStorage.
watch(state, val => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  if (getToken()) {
    clearTimeout(syncTimer)
    syncTimer = setTimeout(() => { api.progress.save(val) }, 1500)
  }
}, { deep: true })

// Call this after login to pull the user's progress from the API.
// Falls back silently to the existing localStorage data if the request fails.
async function loadProgressFromApi() {
  try {
    const data = await api.progress.get()
    if (data && !data.error) {
      Object.assign(state, data)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  } catch {}
}

export function useProgress() {
  const completedCount     = computed(() => state.completedVolumes.length)
  const volumesLeft        = computed(() => TOTAL_VOLUMES - completedCount.value)
  const totalChaptersRead  = computed(() =>
    Object.values(state.completedChapters).reduce((sum, arr) => sum + arr.length, 0)
  )

  const strugglePercentage = computed(() =>
    Math.min(100, Math.round((completedCount.value / TOTAL_VOLUMES) * 100))
  )

  const currentArc = computed(() => {
    const v = state.currentVolume
    if (v <= 3)  return 'Black Swordsman'
    if (v <= 10) return 'Golden Age'
    if (v <= 21) return 'Conviction'
    if (v <= 28) return 'Millennium Falcon'
    return 'Fantasia'
  })

  // --- Volume-level ---

  function isVolumeCompleted(volId) {
    return state.completedVolumes.includes(volId)
  }

  function toggleVolume(volId) {
    const idx = state.completedVolumes.indexOf(volId)
    if (idx === -1) {
      // Mark complete - also fill all chapters for this volume
      updateStreak()
      state.completedVolumes.push(volId)
      state.completedChapters[volId] = getVolumeChapters(volId)
      addActivity(`Completed Volume ${volId} of Berserk`)
      if (volId >= state.currentVolume) {
        state.currentVolume = Math.min(TOTAL_VOLUMES, volId + 1)
        state.currentChapter = getVolumeChapters(Math.min(TOTAL_VOLUMES, volId + 1))[0] ?? 1
      }
    } else {
      // Unmark - clear all chapters for this volume too
      state.completedVolumes.splice(idx, 1)
      delete state.completedChapters[volId]
    }
    state.lastRead = new Date().toISOString()
  }

  // --- Chapter-level ---

  function isChapterCompleted(volId, chapterNum) {
    return (state.completedChapters[volId] ?? []).includes(chapterNum)
  }

  function toggleChapter(volId, chapterNum) {
    if (!state.completedChapters[volId]) state.completedChapters[volId] = []

    const idx = state.completedChapters[volId].indexOf(chapterNum)
    if (idx === -1) {
      // Mark chapter complete
      updateStreak()
      state.completedChapters[volId].push(chapterNum)
      state.lastRead = new Date().toISOString()

      // Advance currentChapter tracker
      if (chapterNum >= state.currentChapter) {
        state.currentChapter = chapterNum + 1
        // If chapter overflows into next volume, bump currentVolume too
        const volChapters = getVolumeChapters(volId)
        if (chapterNum >= volChapters[volChapters.length - 1]) {
          if (volId >= state.currentVolume) {
            state.currentVolume = Math.min(TOTAL_VOLUMES, volId + 1)
            state.currentChapter = getVolumeChapters(Math.min(TOTAL_VOLUMES, volId + 1))[0] ?? 1
          }
        }
      }

      // Auto-complete the volume when all its chapters are done
      const allChapters = getVolumeChapters(volId)
      const done = allChapters.every(c => state.completedChapters[volId].includes(c))
      if (done && !state.completedVolumes.includes(volId)) {
        state.completedVolumes.push(volId)
        addActivity(`Completed Volume ${volId} of Berserk`)
      }
    } else {
      // Unmark chapter - also unmark the volume if it was complete
      state.completedChapters[volId].splice(idx, 1)
      const vi = state.completedVolumes.indexOf(volId)
      if (vi !== -1) state.completedVolumes.splice(vi, 1)
    }
  }

  function getVolumeChapterProgress(volId) {
    const all  = getVolumeChapters(volId)
    const done = (state.completedChapters[volId] ?? []).length
    return { total: all.length, done, pct: Math.round((done / all.length) * 100) }
  }

  // --- Progress ---

  function setCurrentProgress(volume, chapter) {
    updateStreak()
    state.currentVolume  = volume
    state.currentChapter = chapter
    state.lastRead = new Date().toISOString()
    addActivity(`Updated progress to Volume ${volume}, Chapter ${chapter}`)
  }

  function updateStreak() {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
    if (!state.lastRead) { state.readingStreak = 1; return }
    const lastDay = new Date(state.lastRead); lastDay.setHours(0, 0, 0, 0)
    const diff = Math.round((todayStart - lastDay) / 86400000)
    if      (diff === 0) { /* already counted today */ }
    else if (diff === 1) { state.readingStreak += 1 }
    else                 { state.readingStreak = 1 }
  }

  function addActivity(text) {
    state.recentActivity.unshift({ text, time: new Date().toISOString() })
    if (state.recentActivity.length > 10) state.recentActivity.pop()
  }

  function clearActivity() { state.recentActivity = [] }

  function setReadingGoal(targetVolume, targetDate) {
    state.readingGoal = { targetVolume, targetDate, createdAt: new Date().toISOString() }
  }

  function clearReadingGoal() { state.readingGoal = null }

  function toggleWishlist(volId) {
    const idx = state.wishlist.indexOf(volId)
    if (idx === -1) state.wishlist.push(volId)
    else state.wishlist.splice(idx, 1)
  }

  function isWishlisted(volId) { return state.wishlist.includes(volId) }

  function addVolumeNote(volId, text) {
    if (!text.trim()) return false
    if (!state.volumeNotes[volId]) state.volumeNotes[volId] = []
    if (state.volumeNotes[volId].length >= 10) return false
    state.volumeNotes[volId].unshift({ text: text.trim(), time: new Date().toISOString() })
    return true
  }

  function clearVolumeNotes(volId) { delete state.volumeNotes[volId] }

  function getVolumeNotes(volId) {
    const val = state.volumeNotes[volId]
    if (typeof val === 'string') return [{ text: val, time: null }]
    return val ?? []
  }

  function setVolumeRating(volId, rating) {
    if (rating === 0) delete state.volumeRatings[volId]
    else state.volumeRatings[volId] = rating
  }

  function getVolumeRating(volId) { return state.volumeRatings[volId] ?? 0 }

  function markApostleEncountered(apostleId) {
    if (!state.apostlesEncountered.includes(apostleId))
      state.apostlesEncountered.push(apostleId)
  }

  function timeAgo(isoString) {
    if (!isoString) return 'Never'
    const diff = Date.now() - new Date(isoString).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1)  return 'Just now'
    if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24)  return `${hrs} hour${hrs > 1 ? 's' : ''} ago`
    const days = Math.floor(hrs / 24)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  return {
    state,
    loadProgressFromApi,
    completedCount,
    volumesLeft,
    strugglePercentage,
    currentArc,
    totalVolumes:      TOTAL_VOLUMES,
    totalChapters:     TOTAL_CHAPTERS,
    totalChaptersRead,
    isVolumeCompleted,
    toggleVolume,
    isChapterCompleted,
    toggleChapter,
    getVolumeChapterProgress,
    setCurrentProgress,
    setReadingGoal,
    clearReadingGoal,
    toggleWishlist,
    isWishlisted,
    markApostleEncountered,
    clearActivity,
    addVolumeNote,
    clearVolumeNotes,
    getVolumeNotes,
    setVolumeRating,
    getVolumeRating,
    addActivity,
    timeAgo,
  }
}
