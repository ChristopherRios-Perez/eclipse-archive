<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCovers } from '../composables/useCovers.js'

const route = useRoute()
const router = useRouter()
const { fetchAllCovers, getCover } = useCovers()
const apostleId = computed(() => parseInt(route.params.id))

onMounted(fetchAllCovers)

const apostles = [
  { id: 1,  coverVolume: 1,  name: 'Zodd the Immortal',           arc: 'Golden Age',        status: 'Alive',       title: 'God Hand Servant', firstAppearance: 'Volume 1, Chapter 2', description: 'An immortal warrior apostle who has fought for centuries. Known as the most powerful pseudo-apostle, Zodd serves as a recurring rival for Guts throughout the series. After Griffith\'s resurrection as Femto, Zodd pledges his loyalty to him. His apostle form is a massive winged bull-like creature. He is one of the few apostles who possesses genuine honor as a warrior.', abilities: ['Immortal regeneration', 'Superhuman strength', 'Flight (apostle form)', 'Master swordsmanship'] },
  { id: 2,  coverVolume: 2,  name: 'The Count',                    arc: 'Golden Age',        status: 'Deceased',    title: 'Apostle Lord',     firstAppearance: 'Volume 1, Chapter 1', description: 'The first major apostle faced by Guts. A corpulent nobleman who sacrificed his wife to the God Hand after discovering her heresy. His apostle form is a massive slug-like creature. The Count is ultimately defeated by Guts and devoured by the God Hand after refusing to offer a sacrifice.',   abilities: ['Apostle transformation', 'Enhanced durability', 'Acid secretion'] },
  { id: 3,  coverVolume: 10, name: 'Wyald',                        arc: 'Golden Age',        status: 'Deceased',    title: 'Black Dog Knight', firstAppearance: 'Volume 10',           description: 'A sadistic and brutal apostle who commanded the Black Dog Knights. Known for extraordinary size and cruelty. Eventually revealed that Zodd was sent to deal with him, suggesting he had become too uncontrollable even for the God Hand\'s plans.',                                             abilities: ['Colossal apostle form', 'Extreme physical power', 'Rapid regeneration'] },
  { id: 4,  coverVolume: 16, name: 'Rosine',                       arc: 'Conviction',        status: 'Deceased',    title: 'Elf Queen',        firstAppearance: 'Volume 16',           description: 'A young girl who escaped an abusive home by becoming an apostle. She created a false paradise for children, transforming them into pseudo-apostles resembling elves. One of the most tragic apostles in the series, as she genuinely wanted to protect children despite the horror of her actions.', abilities: ['Flight', 'Apostle transformation of others', 'High-speed movement', 'Sonic attacks'] },
  { id: 5,  coverVolume: 22, name: 'The Egg of the Perfect World', arc: 'Conviction',        status: 'Transcended', title: 'Apostle',          firstAppearance: 'Volume 22',           description: 'A severely deformed creature who found the Crimson Beherit and swallowed it, becoming the vessel for Griffith\'s reincarnation. After Femto\'s birth, the Egg dissolved, his dream of a beautiful world fulfilled through Griffith\'s descent.',                                          abilities: ['Contains Crimson Beherit', 'Vehicle for God Hand reincarnation'] },
  { id: 6,  coverVolume: 19, name: 'Mozgus',                       arc: 'Conviction',        status: 'Deceased',    title: 'Holy Inquisitor',  firstAppearance: 'Volume 18',           description: 'A fanatical religious inquisitor who believed absolutely in divine justice through torture. He and his disciples became apostle-like beings empowered by the spiritual energy of the Tower of Conviction. His angel-like form is both beautiful and terrifying.',                              abilities: ['Angel-like apostle form', 'Flight with stone wings', 'Breath of holy fire', 'Extreme durability'] },
  { id: 7,  coverVolume: 27, name: 'Grunbeld',                     arc: 'Millennium Falcon', status: 'Alive',       title: 'Great Apostle',    firstAppearance: 'Volume 27',           description: 'A massive apostle knight who serves as one of Griffith\'s most fearsome generals. He is one of the few apostles to fight Guts when Guts wears the Berserker Armor, nearly matching him blow for blow. His apostle form is a colossal dragon.',                                          abilities: ['Dragon apostle form', 'Fire breath', 'Hardened crystal scales', 'Exceptional swordsmanship'] },
  { id: 8,  coverVolume: 31, name: 'Ganishka',                     arc: 'Fantasia',          status: 'Transcended', title: 'Emperor',          firstAppearance: 'Volume 30',           description: 'The most powerful apostle in the entire series. As Emperor of Kushan, he commands vast armies and transforms into a colossal fog giant. His second transformation via the Demon Infant and the Maelstrom pierces the boundary between the physical and astral worlds, triggering the merging of both realms.', abilities: ['Fog giant transformation', 'Immense spiritual power', 'Second transformation triggers world merger', 'Commands apostle armies'] },
  { id: 9,  coverVolume: 28, name: 'Locus',                        arc: 'Millennium Falcon', status: 'Alive',       title: 'Moonlight Knight', firstAppearance: 'Volume 28',           description: 'A chivalric apostle who serves Griffith with knightly honor. Called the Moonlight Knight for his mastery of the lance in moonlit battles. Unlike many apostles, Locus maintains a code of honor and treats worthy opponents with respect.',                                                abilities: ['Apostle transformation', 'Lance mastery', 'Extreme speed'] },
  { id: 10, coverVolume: 29, name: 'Irvine',                       arc: 'Millennium Falcon', status: 'Alive',       title: 'Archer Apostle',   firstAppearance: 'Volume 28',           description: 'A wolf-like apostle with extraordinary archery skills serving under Griffith. One of the five Falcon Wing Generals of the reborn Band of the Hawk. His apostle form resembles a massive wolf, and his arrows can pierce through entire formations of soldiers.',                             abilities: ['Wolf apostle form', 'Extraordinary archery', 'Arrow shots through multiple targets'] },
  { id: 11, coverVolume: 1,  name: 'The Baron',                    arc: 'Black Swordsman',   status: 'Deceased',    title: 'Snake Baron',      firstAppearance: 'Volume 1',            description: 'One of the earliest apostles encountered by Guts during his travels as the Black Swordsman. He rules over a small domain and his apostle form is a massive serpentine creature. His defeat at Guts\'s hands marks one of the first steps in Guts\'s journey of vengeance.',               abilities: ['Snake apostle form', 'Immense physical power', 'Armored scales'] },
  { id: 12, coverVolume: 3,  name: 'Female Apostle',               arc: 'Golden Age',        status: 'Deceased',    title: 'Unnamed Apostle',  firstAppearance: 'Volume 3',            description: 'A female apostle encountered during Guts\'s early travels with the Band of the Hawk. One of the first to recognise the Mark of Sacrifice on Guts, and among the first apostles to actively hunt him. Her true name is never revealed in the series.',                                 abilities: ['Apostle transformation', 'Enhanced speed and strength'] },
]

const apostle = computed(() => apostles.find(a => a.id === apostleId.value))

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
              <span class="text-xs px-2 py-0.5 rounded font-medium" :style="{ background: statusColors[apostle.status] + '22', color: statusColors[apostle.status] }">
                {{ apostle.status }}
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
