<script setup>
import { computed } from 'vue'
import { useProgress } from '../composables/useProgress.js'
import { useSidebar } from '../composables/useSidebar.js'
import { useBadges } from '../composables/useBadges.js'

const { isOpen } = useSidebar()
const { badges, unlockedCount } = useBadges()
const {
  state,
  completedCount,
  volumesLeft,
  strugglePercentage,
  totalVolumes,
  totalChapters,
  isVolumeCompleted,
  timeAgo,
} = useProgress()

// Arc definitions — volume ranges and their accent colors
const arcs = [
  { name: 'Black Swordsman', start: 1,  end: 3,  color: '#c10b21' },
  { name: 'Golden Age',      start: 4,  end: 10, color: '#d4a017' },
  { name: 'Conviction',      start: 11, end: 21, color: '#7b3ff2' },
  { name: 'Millennium Falcon', start: 22, end: 28, color: '#0f766e' },
  { name: 'Fantasia',        start: 29, end: 41, color: '#c10b21' },
]

// For each arc, count how many of its volumes are completed
const arcStats = computed(() => arcs.map(arc => {
  const total = arc.end - arc.start + 1
  const done = state.completedVolumes.filter(v => v >= arc.start && v <= arc.end).length
  return { ...arc, total, done, pct: Math.round((done / total) * 100) }
}))

// Estimated chapters read based on completed volumes (8 chapters average per volume)
const chaptersRead = computed(() => {
  return state.completedVolumes.reduce((sum, vol) => {
    const map = {1:8,2:8,3:8,4:8,5:8,6:8,7:9,8:9,9:9,10:9,11:9,12:8,13:8,14:8,15:8,16:8,17:8,18:8,19:8,20:8,21:8,22:8,23:8,24:8,25:8,26:8,27:8,28:8,29:8,30:8,31:8,32:8,33:8,34:8,35:8,36:8,37:8,38:8,39:8,40:8,41:8}
    return sum + (map[vol] ?? 8)
  }, 0)
})

// All 41 volumes in order for the completion heatmap
const allVolumes = Array.from({ length: 41 }, (_, i) => i + 1)

// Which arc does this volume belong to?
function getArcColor(vol) {
  for (const arc of arcs) {
    if (vol >= arc.start && vol <= arc.end) return arc.color
  }
  return '#c10b21'
}
</script>

<template>
  <div class="p-6 min-h-screen w-full">

    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-white transition-all duration-300" :class="isOpen ? '' : 'pl-6'">Statistics</h1>
      <p class="text-[#5a5a72] text-sm mt-0.5">Your Berserk reading breakdown</p>
    </div>

    <!-- Top stat cards -->
    <div class="grid grid-cols-4 gap-4 mb-4">
      <div class="bg-[#16161a] border border-[#2d2d38] rounded-xl p-5">
        <p class="text-[#5a5a72] text-xs mb-1">Volumes Completed</p>
        <p class="text-white font-bold text-3xl">{{ completedCount }}</p>
        <p class="text-[#5a5a72] text-xs mt-1">of {{ totalVolumes }} total</p>
      </div>
      <div class="bg-[#16161a] border border-[#2d2d38] rounded-xl p-5">
        <p class="text-[#5a5a72] text-xs mb-1">Chapters Read</p>
        <p class="text-white font-bold text-3xl">{{ chaptersRead }}</p>
        <p class="text-[#5a5a72] text-xs mt-1">of {{ totalChapters }} total</p>
      </div>
      <div class="bg-[#16161a] border border-[#2d2d38] rounded-xl p-5">
        <p class="text-[#5a5a72] text-xs mb-1">Overall Progress</p>
        <p class="text-[#c10b21] font-bold text-3xl">{{ strugglePercentage }}%</p>
        <p class="text-[#5a5a72] text-xs mt-1">Struggle Percentage</p>
      </div>
      <div class="bg-[#16161a] border border-[#2d2d38] rounded-xl p-5">
        <p class="text-[#5a5a72] text-xs mb-1">Last Read</p>
        <p class="text-white font-bold text-xl mt-1">{{ timeAgo(state.lastRead) }}</p>
        <p class="text-[#5a5a72] text-xs mt-1">Reading Streak: {{ state.readingStreak }} days</p>
      </div>
    </div>

    <!-- Currently reading banner — updates whenever Dashboard progress is changed -->
    <div class="bg-[#16161a] border border-[#2d2d38] rounded-xl p-4 mb-6 flex items-center gap-6">
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 bg-[#c10b21] rounded-full animate-pulse"></div>
        <span class="text-[#5a5a72] text-sm">Currently Reading</span>
      </div>
      <div class="flex items-center gap-8">
        <div>
          <span class="text-[#5a5a72] text-xs block">Volume</span>
          <span class="text-white font-bold">{{ String(state.currentVolume).padStart(2, '0') }}</span>
        </div>
        <div>
          <span class="text-[#5a5a72] text-xs block">Chapter</span>
          <span class="text-white font-bold">{{ String(state.currentChapter).padStart(2, '0') }}</span>
        </div>
        <div>
          <span class="text-[#5a5a72] text-xs block">Volumes Left</span>
          <span class="text-white font-bold">{{ volumesLeft }}</span>
        </div>
        <div>
          <span class="text-[#5a5a72] text-xs block">Last Updated</span>
          <span class="text-white font-bold">{{ timeAgo(state.lastRead) }}</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-5">

      <!-- Left column: Arc breakdown + Volume heatmap -->
      <div class="col-span-2 space-y-5">

        <!-- Arc breakdown -->
        <div class="bg-[#16161a] border border-[#2d2d38] rounded-xl p-5">
          <h3 class="text-white font-semibold mb-5">Progress by Arc</h3>
          <div class="space-y-4">
            <div v-for="arc in arcStats" :key="arc.name">
              <div class="flex items-center justify-between mb-1.5">
                <div class="flex items-center gap-2">
                  <div class="w-2.5 h-2.5 rounded-full" :style="{ background: arc.color }"></div>
                  <span class="text-[#e5e5ef] text-sm font-medium">{{ arc.name }}</span>
                  <span class="text-[#5a5a72] text-xs">Vol {{ arc.start }}–{{ arc.end }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-[#8888a0] text-xs">{{ arc.done }} / {{ arc.total }} volumes</span>
                  <span class="text-sm font-bold" :style="{ color: arc.color }">{{ arc.pct }}%</span>
                </div>
              </div>
              <div class="h-2 bg-[#23232b] rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-700"
                  :style="{ width: arc.pct + '%', background: arc.color }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Volume completion heatmap -->
        <div class="bg-[#16161a] border border-[#2d2d38] rounded-xl p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-white font-semibold">Volume Map</h3>
            <div class="flex items-center gap-4 text-xs text-[#5a5a72]">
              <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-[#c10b21] inline-block"></span> Completed</span>
              <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-[#23232b] inline-block"></span> Unread</span>
            </div>
          </div>
          <!-- 41 volume squares, colored by arc when complete -->
          <div class="grid grid-cols-10 gap-2">
            <div
              v-for="vol in allVolumes"
              :key="vol"
              class="aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300 relative group"
              :style="isVolumeCompleted(vol)
                ? { background: getArcColor(vol), color: '#fff' }
                : { background: '#23232b', color: '#3d3d4d' }"
            >
              {{ String(vol).padStart(2, '0') }}
              <!-- Tooltip on hover -->
              <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1c1c22] border border-[#3d3d4d] text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Vol {{ vol }} — {{ isVolumeCompleted(vol) ? 'Read' : 'Unread' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right column: Recent activity + apostle count -->
      <div class="space-y-5">

        <!-- Apostles encountered -->
        <div class="bg-[#16161a] border border-[#2d2d38] rounded-xl p-5">
          <h3 class="text-white font-semibold mb-4">Bestiary Progress</h3>
          <div class="flex items-center gap-4 mb-3">
            <div class="text-center">
              <p class="text-[#c10b21] font-bold text-3xl">{{ state.apostlesEncountered.length }}</p>
              <p class="text-[#5a5a72] text-xs mt-0.5">Documented</p>
            </div>
            <div class="flex-1 h-px bg-[#2d2d38]"></div>
            <div class="text-center">
              <p class="text-white font-bold text-3xl">16</p>
              <p class="text-[#5a5a72] text-xs mt-0.5">Total Known</p>
            </div>
          </div>
          <div class="h-2 bg-[#23232b] rounded-full overflow-hidden">
            <div
              class="h-full bg-[#c10b21] rounded-full transition-all duration-700"
              :style="{ width: Math.round((state.apostlesEncountered.length / 16) * 100) + '%' }"
            ></div>
          </div>
          <p class="text-[#5a5a72] text-xs mt-2 text-right">{{ Math.round((state.apostlesEncountered.length / 16) * 100) }}% catalogued</p>
        </div>

        <!-- Volumes remaining breakdown -->
        <div class="bg-[#16161a] border border-[#2d2d38] rounded-xl p-5">
          <h3 class="text-white font-semibold mb-4">What's Left</h3>
          <div class="space-y-3">
            <div v-for="arc in arcStats" :key="arc.name" class="flex items-center justify-between">
              <span class="text-[#8888a0] text-sm">{{ arc.name }}</span>
              <span class="text-sm font-medium" :class="arc.done === arc.total ? 'text-[#c10b21]' : 'text-white'">
                {{ arc.done === arc.total ? '✓ Done' : `${arc.total - arc.done} left` }}
              </span>
            </div>
          </div>
        </div>

        <!-- Recent activity -->
        <div class="bg-[#16161a] border border-[#2d2d38] rounded-xl p-5">
          <h3 class="text-white font-semibold mb-4">Recent Activity</h3>
          <div v-if="!state.recentActivity.length" class="text-[#5a5a72] text-sm">
            No activity yet.
          </div>
          <div v-else class="space-y-1">
            <div
              v-for="(item, i) in state.recentActivity"
              :key="i"
              class="py-2.5 border-b border-[#23232b] last:border-0"
            >
              <p class="text-[#e5e5ef] text-sm">{{ item.text }}</p>
              <p class="text-[#5a5a72] text-xs mt-0.5">{{ timeAgo(item.time) }}</p>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Achievement Badges -->
    <div class="mt-5 bg-[#16161a] border border-[#2d2d38] rounded-xl p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-white font-semibold">Achievement Badges</h3>
        <span class="text-[#5a5a72] text-xs">{{ unlockedCount }} / {{ badges.length }} unlocked</span>
      </div>
      <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div
          v-for="badge in badges"
          :key="badge.id"
          class="flex flex-col items-center text-center p-3 rounded-xl border transition-all duration-200"
          :class="badge.unlocked
            ? 'bg-[#1c1c22] border-[#c10b21]/40'
            : 'bg-[#111114] border-[#23232b] opacity-40'"
        >
          <span class="text-2xl mb-2">{{ badge.icon }}</span>
          <p class="text-white text-xs font-semibold leading-tight mb-1">{{ badge.name }}</p>
          <p class="text-[#5a5a72] text-xs leading-tight">{{ badge.desc }}</p>
          <span v-if="badge.unlocked" class="mt-2 text-[10px] text-[#c10b21] font-medium">Unlocked</span>
          <span v-else class="mt-2 text-[10px] text-[#3d3d4d]">Locked</span>
        </div>
      </div>
    </div>
  </div>
</template>
