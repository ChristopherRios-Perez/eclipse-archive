<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCovers } from '../composables/useCovers.js'
import { useProgress } from '../composables/useProgress.js'
import { apostles } from '../data/apostles.js'

const route = useRoute()
const router = useRouter()
const { fetchAllCovers, getCover } = useCovers()
const { state } = useProgress()
const apostleId = computed(() => parseInt(route.params.id))

onMounted(fetchAllCovers)

const apostle = computed(() => apostles.find(a => a.id === apostleId.value))

function hasReached(ap) {
  if (!ap) return true
  const match = ap.firstAppearance.match(/Volume (\d+)/)
  if (!match) return true
  const vol = parseInt(match[1])
  return state.completedVolumes.includes(vol) || state.currentVolume >= vol
}

const reached = computed(() => hasReached(apostle.value))

const statusColors = {
  'Alive': '#16a34a',
  'Deceased': '#c10b21',
  'Transcended': '#7b3ff2',
}

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
    <button
      @click="router.push('/bestiary')"
      class="flex items-center gap-2 text-[#5a5a72] hover:text-white text-sm mb-6 transition-colors"
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
      Back to Bestiary
    </button>

    <div v-if="!apostle" class="text-center py-20">
      <p class="text-[#5a5a72]">Apostle not found.</p>
    </div>

    <div v-else class="max-w-4xl">
      <div class="flex gap-8">
        <!-- Image panel -->
        <div class="shrink-0 w-56">
          <div class="w-56 h-72 bg-[#16161a] rounded-xl border border-[#2d2d38] overflow-hidden">
            <img v-if="getCover(apostle.coverVolume)" :src="getCover(apostle.coverVolume)" :alt="apostle.name" class="w-full h-full object-cover object-top" />
            <div v-else class="w-full h-full flex items-center justify-center">
              <svg class="w-16 h-16 text-[#3d3d4d]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"/></svg>
            </div>
          </div>

          <!-- Quick facts -->
          <div class="mt-4 bg-[#16161a] border border-[#2d2d38] rounded-xl p-4 space-y-3">
            <div>
              <p class="text-[#5a5a72] text-xs mb-1">Status</p>
              <span v-if="reached" class="text-xs px-2 py-0.5 rounded font-medium" :style="{ background: statusColors[apostle.status] + '22', color: statusColors[apostle.status] }">
                {{ apostle.status }}
              </span>
              <span v-else class="text-xs px-2 py-0.5 rounded font-medium bg-[#23232b] text-[#5a5a72]">
                Unknown
              </span>
            </div>
            <div>
              <p class="text-[#5a5a72] text-xs mb-1">Arc</p>
              <span class="text-xs px-2 py-0.5 rounded font-medium" :style="{ background: arcColors[apostle.arc] + '22', color: arcColors[apostle.arc] }">
                {{ apostle.arc }}
              </span>
            </div>
            <div>
              <p class="text-[#5a5a72] text-xs mb-1">First Appearance</p>
              <p class="text-[#e5e5ef] text-xs">{{ apostle.firstAppearance }}</p>
            </div>
          </div>
        </div>

        <!-- Detail panel -->
        <div class="flex-1">
          <h1 class="text-3xl font-bold text-white mb-1">{{ apostle.name }}</h1>
          <p class="text-[#c10b21] font-medium mb-6">{{ apostle.title }}</p>

          <div class="bg-[#16161a] border border-[#2d2d38] rounded-xl p-5 mb-4">
            <h3 class="text-white font-semibold mb-3">Overview</h3>
            <p class="text-[#8888a0] text-sm leading-relaxed">{{ apostle.description }}</p>
          </div>

          <div v-if="apostle.abilities" class="bg-[#16161a] border border-[#2d2d38] rounded-xl p-5">
            <h3 class="text-white font-semibold mb-3">Known Abilities</h3>
            <ul class="space-y-2">
              <li v-for="ability in apostle.abilities" :key="ability" class="flex items-center gap-2 text-sm text-[#8888a0]">
                <div class="w-1.5 h-1.5 bg-[#c10b21] rounded-full shrink-0"></div>
                {{ ability }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
