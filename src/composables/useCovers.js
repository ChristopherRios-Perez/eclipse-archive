import { COVER_URLS } from '../data/covers.js'

// Covers are now pre-fetched and hardcoded in src/data/covers.js.
// No API calls needed - works on any deployment without CORS issues.
export function useCovers() {
  async function fetchAllCovers() {
    // No-op - data is already bundled
  }

  function getCover(volNum) {
    return COVER_URLS[volNum] ?? null
  }

  return { fetchAllCovers, getCover, coverMap: COVER_URLS }
}
