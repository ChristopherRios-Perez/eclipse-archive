<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProgress } from '../composables/useProgress.js'
import { useCovers } from '../composables/useCovers.js'

const router = useRouter()
const { state, markApostleEncountered } = useProgress()
const { fetchAllCovers, getCover } = useCovers()

onMounted(fetchAllCovers)

const searchQuery = ref('')
const activeFilter = ref('All')

const filters = ['All', 'Golden Age', 'Conviction', 'Millennium Falcon', 'Fantasia']

// coverVolume = which manga volume cover best represents this apostle
const apostles = [
  { id: 1,  name: 'Zodd the Immortal',          arc: 'Golden Age',        status: 'Alive',       title: 'God Hand Servant',  firstAppearance: 'Volume 1, Chapter 2', coverVolume: 1,  description: 'An immortal warrior apostle who has fought for centuries. One of the most powerful apostles and later becomes a servant of Griffith.' },
  { id: 2,  name: 'The Count',                   arc: 'Golden Age',        status: 'Deceased',    title: 'Apostle Lord',      firstAppearance: 'Volume 1, Chapter 1', coverVolume: 2,  description: 'The first major apostle encountered by Guts. A corpulent nobleman who sacrificed his wife to become an apostle.' },
  { id: 3,  name: 'Wyald',                       arc: 'Golden Age',        status: 'Deceased',    title: 'Black Dog Knight',  firstAppearance: 'Volume 10',           coverVolume: 10, description: 'A massive, brutal apostle who led the Black Dog Knights. Known for extraordinary cruelty and power.' },
  { id: 4,  name: 'Rosine',                      arc: 'Conviction',        status: 'Deceased',    title: 'Elf Queen',         firstAppearance: 'Volume 16',           coverVolume: 16, description: 'A young girl who became an apostle and created a false paradise for children. One of the more tragic apostles in the series.' },
  { id: 5,  name: 'The Egg of the Perfect World',arc: 'Conviction',        status: 'Transcended', title: 'Apostle',           firstAppearance: 'Volume 22',           coverVolume: 22, description: 'A deformed creature who swallowed the Crimson Beherit, allowing Griffith to reincarnate into the physical world.' },
  { id: 6,  name: 'Mozgus',                      arc: 'Conviction',        status: 'Deceased',    title: 'Holy Inquisitor',   firstAppearance: 'Volume 18',           coverVolume: 19, description: 'A fanatical inquisitor who became an angel-like apostle. Serves as the primary antagonist of the Conviction arc.' },
  { id: 7,  name: 'Grunbeld',                    arc: 'Millennium Falcon', status: 'Alive',       title: 'Great Apostle',     firstAppearance: 'Volume 27',           coverVolume: 27, description: 'A massive knight apostle who serves as one of Griffith\'s most powerful commanders in the reborn Band of the Hawk.' },
  { id: 8,  name: 'Ganishka',                    arc: 'Fantasia',          status: 'Transcended', title: 'Emperor',           firstAppearance: 'Volume 30',           coverVolume: 31, description: 'The most powerful apostle in the series, the Emperor of Kushan who transforms into a colossal fog giant.' },
  { id: 9,  name: 'Locus',                       arc: 'Millennium Falcon', status: 'Alive',       title: 'Moonlight Knight',  firstAppearance: 'Volume 28',           coverVolume: 28, description: 'A chivalric apostle who serves Griffith. Known as the Moonlight Knight for his lance mastery.' },
  { id: 10, name: 'Irvine',                      arc: 'Millennium Falcon', status: 'Alive',       title: 'Archer Apostle',    firstAppearance: 'Volume 28',           coverVolume: 29, description: 'A wolf-like apostle with extraordinary archery skills. One of the five falcon-wing generals under Griffith.' },
  { id: 11, name: 'The Baron',                   arc: 'Black Swordsman',   status: 'Deceased',    title: 'Snake Baron',       firstAppearance: 'Volume 1',            coverVolume: 1,  description: 'One of the earliest apostles faced by Guts in his journey of revenge. Ruler of a small domain with a snake-like apostle form.' },
  { id: 12, name: 'Female Apostle',              arc: 'Golden Age',        status: 'Deceased',    title: 'Unnamed Apostle',   firstAppearance: 'Volume 3',            coverVolume: 3,  description: 'A female apostle encountered during Guts\'s early travels. One of the first to recognise the mark of sacrifice on Guts.' },
]

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

const stats = computed(() => ({
  total: apostles.length,
  alive: apostles.filter(a => a.status === 'Alive').length,
  deceased: apostles.filter(a => a.status === 'Deceased').length,
  transcended: apostles.filter(a => a.status === 'Transcended').length,
}))

const filtered = computed(() => {
  return apostles.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      a.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchFilter = activeFilter.value === 'All' || a.arc === activeFilter.value
    return matchSearch && matchFilter
  })
})

function viewApostle(apostle) {
  markApostleEncountered(apostle.id)
  router.push('/bestiary/' + apostle.id)
}
</script>

<template>
  <div class="p-6 min-h-screen bg-[#111114]">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-2">
      <div class="w-7 h-7 bg-[#c10b21]/20 rounded-lg flex items-center justify-center">
        <svg class="w-4 h-4 text-[#c10b21]" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm8 0a3 3 0 11-6 0 3 3 0 016 0zm-4.07 11c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>
      </div>
      <h1 class="text-2xl font-bold text-white">The Bestiary</h1>
    </div>
    <p class="text-[#5a5a72] text-sm mb-6">
      {{ stats.total }} apostles catalogued · {{ stats.alive }} alive · {{ stats.deceased }} deceased · {{ stats.transcended }} transcended
    </p>

    <!-- Search bar -->
    <div class="relative mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by name or title..."
        class="w-full bg-[#1c1c22] border border-[#3d3d4d] rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder-[#5a5a72] focus:outline-none focus:border-[#c10b21]"
      />
      <svg class="w-4 h-4 absolute left-3.5 top-3.5 text-[#5a5a72]" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
      </svg>
    </div>

    <!-- Arc filter pills -->
    <div class="flex items-center gap-2 mb-6">
      <button
        v-for="f in filters"
        :key="f"
        @click="activeFilter = f"
        class="px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150"
        :class="activeFilter === f
          ? 'bg-[#c10b21] border-[#c10b21] text-white'
          : 'border-[#3d3d4d] text-[#8888a0] hover:border-[#c10b21]/40 hover:text-white'"
      >{{ f }}</button>
    </div>

    <!-- Results count -->
    <p class="text-[#5a5a72] text-sm mb-4">Showing {{ filtered.length }} entries</p>

    <!-- Apostle grid -->
    <div class="grid grid-cols-4 gap-4">
      <div
        v-for="apostle in filtered"
        :key="apostle.id"
        class="bg-[#16161a] border border-[#2d2d38] rounded-xl overflow-hidden cursor-pointer hover:border-[#c10b21]/50 transition-all duration-200 hover:scale-[1.02] group"
        @click="viewApostle(apostle)"
      >
        <!-- Image area -->
        <div class="relative h-48 bg-[#23232b] overflow-hidden">
          <img
            v-if="getCover(apostle.coverVolume)"
            :src="getCover(apostle.coverVolume)"
            :alt="apostle.name"
            class="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <div class="text-[#3d3d4d] text-center">
              <svg class="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"/></svg>
              <p class="text-xs">Loading...</p>
            </div>
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-[#16161a] via-[#16161a]/20 to-transparent"></div>

          <!-- Arc badge -->
          <div class="absolute top-2 left-2">
            <span
              class="text-xs px-2 py-0.5 rounded font-medium"
              :style="{ background: arcColors[apostle.arc] + '33', color: arcColors[apostle.arc], border: '1px solid ' + arcColors[apostle.arc] + '55' }"
            >{{ apostle.arc }}</span>
          </div>

          <!-- Status badge -->
          <div class="absolute top-2 right-2">
            <span
              class="text-xs px-2 py-0.5 rounded font-medium flex items-center gap-1"
              :style="{ background: statusColors[apostle.status] + '22', color: statusColors[apostle.status], border: '1px solid ' + statusColors[apostle.status] + '44' }"
            >
              <span class="w-1.5 h-1.5 rounded-full" :style="{ background: statusColors[apostle.status] }"></span>
              {{ apostle.status }}
            </span>
          </div>

          <!-- Encountered indicator -->
          <div v-if="state.apostlesEncountered.includes(apostle.id)" class="absolute bottom-2 right-2">
            <svg class="w-5 h-5 text-[#c10b21]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/></svg>
          </div>
        </div>

        <!-- Info -->
        <div class="p-4">
          <h3 class="text-white font-semibold mb-0.5 group-hover:text-[#c10b21] transition-colors truncate">{{ apostle.name }}</h3>
          <p class="text-[#5a5a72] text-xs mb-3">{{ apostle.title }}</p>
          <div class="flex items-center gap-1.5 text-xs">
            <span class="text-[#5a5a72]">First seen</span>
            <span class="text-[#8888a0] truncate">{{ apostle.firstAppearance }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="filtered.length === 0" class="text-center py-20">
      <div class="text-[#3d3d4d] text-5xl mb-4">⚔️</div>
      <p class="text-[#5a5a72]">No apostles match your search</p>
    </div>
  </div>
</template>
