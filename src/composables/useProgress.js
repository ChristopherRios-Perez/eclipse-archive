import { reactive, computed, watch } from 'vue'

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

const state = reactive({
  completedVolumes: saved?.completedVolumes ?? [],
  currentVolume: saved?.currentVolume ?? 1,
  currentChapter: saved?.currentChapter ?? 1,
  readingStreak: saved?.readingStreak ?? 0,
  apostlesEncountered: saved?.apostlesEncountered ?? [],
  recentActivity: saved?.recentActivity ?? [],
  lastRead: saved?.lastRead ?? null,
})

watch(state, (val) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
}, { deep: true })

export function useProgress() {
  const completedCount = computed(() => state.completedVolumes.length)
  const volumesLeft = computed(() => TOTAL_VOLUMES - completedCount.value)

  const strugglePercentage = computed(() => {
    const base = (completedCount.value / TOTAL_VOLUMES) * 100
    return Math.min(100, Math.round(base))
  })

  const currentArc = computed(() => {
    const v = state.currentVolume
    if (v <= 10) return 'Black Swordsman'
    if (v <= 21) return 'Golden Age'
    if (v <= 28) return 'Conviction'
    if (v <= 34) return 'Millennium Falcon'
    return 'Fantasia'
  })

  function isVolumeCompleted(volId) {
    return state.completedVolumes.includes(volId)
  }

  function toggleVolume(volId) {
    const idx = state.completedVolumes.indexOf(volId)
    if (idx === -1) {
      state.completedVolumes.push(volId)
      addActivity(`Completed Volume ${volId} of Berserk`)
      if (volId >= state.currentVolume) {
        state.currentVolume = Math.min(TOTAL_VOLUMES, volId + 1)
        state.currentChapter = 1
      }
    } else {
      state.completedVolumes.splice(idx, 1)
    }
    state.lastRead = new Date().toISOString()
  }

  function setCurrentProgress(volume, chapter) {
    state.currentVolume = volume
    state.currentChapter = chapter
    state.lastRead = new Date().toISOString()
    addActivity(`Updated progress to Volume ${volume}, Chapter ${chapter}`)
  }

  function addActivity(text) {
    state.recentActivity.unshift({ text, time: new Date().toISOString() })
    if (state.recentActivity.length > 10) state.recentActivity.pop()
  }

  function markApostleEncountered(apostleId) {
    if (!state.apostlesEncountered.includes(apostleId)) {
      state.apostlesEncountered.push(apostleId)
    }
  }

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
    addActivity,
    timeAgo,
  }
}
