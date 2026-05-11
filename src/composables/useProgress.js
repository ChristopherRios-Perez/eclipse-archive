import { reactive, computed, watch } from 'vue'

// Hardcoded based on the final published volume count
const TOTAL_VOLUMES = 41
const TOTAL_CHAPTERS = 364

const STORAGE_KEY = 'eclipse-archive-progress'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

const saved = loadFromStorage()

// Module-level state — same pattern as useAuth, one shared instance across the app
const state = reactive({
  completedVolumes: saved?.completedVolumes ?? [],
  currentVolume: saved?.currentVolume ?? 1,
  currentChapter: saved?.currentChapter ?? 1,
  readingStreak: saved?.readingStreak ?? 0,
  apostlesEncountered: saved?.apostlesEncountered ?? [],
  recentActivity: saved?.recentActivity ?? [],
  lastRead: saved?.lastRead ?? null,
  volumeRatings: saved?.volumeRatings ?? {}, // volId → 1-5 stars
  volumeNotes: saved?.volumeNotes ?? {},    // volId → string
})

// Auto-persist on any state change — deep watch catches nested array mutations
watch(state, (val) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
}, { deep: true })

export function useProgress() {
  const completedCount = computed(() => state.completedVolumes.length)
  const volumesLeft = computed(() => TOTAL_VOLUMES - completedCount.value)

  // Capped at 100 just in case something goes sideways with the data
  const strugglePercentage = computed(() => {
    const base = (completedCount.value / TOTAL_VOLUMES) * 100
    return Math.min(100, Math.round(base))
  })

  // Arc boundaries — matches the actual Berserk publication structure
  const currentArc = computed(() => {
    const v = state.currentVolume
    if (v <= 3)  return 'Black Swordsman'
    if (v <= 10) return 'Golden Age'
    if (v <= 21) return 'Conviction'
    if (v <= 28) return 'Millennium Falcon'
    return 'Fantasia'
  })

  function isVolumeCompleted(volId) {
    return state.completedVolumes.includes(volId)
  }

  // Compares calendar dates to update the streak — called before lastRead is overwritten
  function updateStreak() {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    if (!state.lastRead) {
      // First time ever reading
      state.readingStreak = 1
      return
    }

    const lastReadDay = new Date(state.lastRead)
    lastReadDay.setHours(0, 0, 0, 0)

    const diffDays = Math.round((todayStart - lastReadDay) / 86400000)

    if (diffDays === 0) {
      // Already logged activity today, streak stays the same
    } else if (diffDays === 1) {
      // Read yesterday — keep it going
      state.readingStreak += 1
    } else {
      // Missed at least one day — reset to 1 (today counts)
      state.readingStreak = 1
    }
  }

  function toggleVolume(volId) {
    const idx = state.completedVolumes.indexOf(volId)
    if (idx === -1) {
      updateStreak()
      state.completedVolumes.push(volId)
      addActivity(`Completed Volume ${volId} of Berserk`)
      // Auto-advance current volume so the tracker stays ahead of what's been read
      if (volId >= state.currentVolume) {
        state.currentVolume = Math.min(TOTAL_VOLUMES, volId + 1)
        state.currentChapter = 1
      }
    } else {
      // Unchecking — just remove it, don't touch the streak
      state.completedVolumes.splice(idx, 1)
    }
    state.lastRead = new Date().toISOString()
  }

  function setCurrentProgress(volume, chapter) {
    updateStreak()
    state.currentVolume = volume
    state.currentChapter = chapter
    state.lastRead = new Date().toISOString()
    addActivity(`Updated progress to Volume ${volume}, Chapter ${chapter}`)
  }

  // Prepend new activity and trim to 10 — don't need an infinite log
  function addActivity(text) {
    state.recentActivity.unshift({ text, time: new Date().toISOString() })
    if (state.recentActivity.length > 10) state.recentActivity.pop()
  }

  function clearActivity() {
    state.recentActivity = []
  }

  function setVolumeNote(volId, note) {
    if (!note.trim()) {
      delete state.volumeNotes[volId]
    } else {
      state.volumeNotes[volId] = note.trim()
    }
  }

  function getVolumeNote(volId) {
    return state.volumeNotes[volId] ?? ''
  }

  function setVolumeRating(volId, rating) {
    // Rating of 0 clears it
    if (rating === 0) {
      delete state.volumeRatings[volId]
    } else {
      state.volumeRatings[volId] = rating
    }
  }

  function getVolumeRating(volId) {
    return state.volumeRatings[volId] ?? 0
  }

  function markApostleEncountered(apostleId) {
    // Guard against duplicates — set semantics via array
    if (!state.apostlesEncountered.includes(apostleId)) {
      state.apostlesEncountered.push(apostleId)
    }
  }

  // Simple relative time formatter — nothing fancy, just readable labels
  function timeAgo(isoString) {
    if (!isoString) return 'Never'
    const diff = Date.now() - new Date(isoString).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`
    const days = Math.floor(hrs / 24)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  return {
    state,
    completedCount,
    volumesLeft,
    strugglePercentage,
    currentArc,
    totalVolumes: TOTAL_VOLUMES,
    totalChapters: TOTAL_CHAPTERS,
    isVolumeCompleted,
    toggleVolume,
    setCurrentProgress,
    markApostleEncountered,
    clearActivity,
    setVolumeNote,
    getVolumeNote,
    setVolumeRating,
    getVolumeRating,
    addActivity,
    timeAgo,
  }
}
