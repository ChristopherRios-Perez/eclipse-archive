import { reactive } from 'vue'

const SETTINGS_KEY = 'eclipse-archive-settings'

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const saved = loadSettings()

// Module-level so all components share the same settings instance
const settings = reactive({
  spoilerBlur: saved.spoilerBlur ?? false,
})

function persist() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function useSettings() {
  function toggleSpoilerBlur() {
    settings.spoilerBlur = !settings.spoilerBlur
    persist()
  }

  return { settings, toggleSpoilerBlur }
}
