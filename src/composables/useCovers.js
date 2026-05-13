import { ref } from 'vue'

const MANGA_ID = '801513ba-a712-498c-8f57-cae55b38cc92'

// Shared cache - only fetches once regardless of how many components use this
const coverMap = ref({})
const fetched = ref(false)
const fetching = ref(false)

export function useCovers() {
  async function fetchAllCovers() {
    if (fetched.value || fetching.value) return
    fetching.value = true
    try {
      let offset = 0
      while (Object.keys(coverMap.value).length < 41) {
        const r = await fetch(
          `https://api.mangadex.org/cover?manga[]=${MANGA_ID}&limit=100&offset=${offset}&order[volume]=asc`
        )
        if (!r.ok) break
        const { data, total } = await r.json()
        if (!data.length) break
        data.forEach(cover => {
          const vol = parseInt(cover.attributes.volume)
          if (!isNaN(vol) && vol >= 1 && vol <= 41 && !coverMap.value[vol]) {
            coverMap.value[vol] = `https://uploads.mangadex.org/covers/${MANGA_ID}/${cover.attributes.fileName}.512.jpg`
          }
        })
        offset += 100
        if (offset >= total) break
      }
    } catch {}
    fetched.value = true
    fetching.value = false
  }

  function getCover(volNum) {
    return coverMap.value[volNum] ?? null
  }

  return { fetchAllCovers, getCover, coverMap }
}
