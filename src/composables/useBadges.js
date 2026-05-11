import { computed } from 'vue'
import { useProgress } from './useProgress.js'

export function useBadges() {
  const { state, completedCount } = useProgress()

  // Helper — how many volumes in a range are completed
  const completedInRange = (start, end) =>
    state.completedVolumes.filter(v => v >= start && v <= end).length

  const badges = computed(() => [
    {
      id: 'first_blood',
      name: 'First Blood',
      desc: 'Complete your first volume',
      icon: '⚔️',
      unlocked: completedCount.value >= 1,
    },
    {
      id: 'black_swordsman',
      name: 'Black Swordsman',
      desc: 'Complete the Black Swordsman arc (Vol 1–3)',
      icon: '🗡️',
      unlocked: completedInRange(1, 3) === 3,
    },
    {
      id: 'golden_age',
      name: 'Golden Age',
      desc: 'Complete the Golden Age arc (Vol 4–10)',
      icon: '🏆',
      unlocked: completedInRange(4, 10) === 7,
    },
    {
      id: 'eclipse_survivor',
      name: 'Eclipse Survivor',
      desc: 'Complete the Conviction arc (Vol 11–21)',
      icon: '🔥',
      unlocked: completedInRange(11, 21) === 11,
    },
    {
      id: 'millennium_falcon',
      name: 'Millennium Falcon',
      desc: 'Complete the Millennium Falcon arc (Vol 22–28)',
      icon: '🦅',
      unlocked: completedInRange(22, 28) === 7,
    },
    {
      id: 'fantasia',
      name: 'Fantasia',
      desc: 'Complete the Fantasia arc (Vol 29–41)',
      icon: '✨',
      unlocked: completedInRange(29, 41) === 13,
    },
    {
      id: 'eclipse_complete',
      name: 'The Brand of Sacrifice',
      desc: 'Complete all 41 volumes of Berserk',
      icon: '💀',
      unlocked: completedCount.value === 41,
    },
    {
      id: 'halfway',
      name: 'Halfway There',
      desc: 'Complete 20 or more volumes',
      icon: '📖',
      unlocked: completedCount.value >= 20,
    },
    {
      id: 'apostle_hunter',
      name: 'Apostle Hunter',
      desc: 'Encounter 5 or more apostles in the Bestiary',
      icon: '👁️',
      unlocked: state.apostlesEncountered.length >= 5,
    },
    {
      id: 'bestiary_scholar',
      name: 'Bestiary Scholar',
      desc: 'Encounter all 16 catalogued apostles',
      icon: '📜',
      unlocked: state.apostlesEncountered.length >= 16,
    },
    {
      id: 'streak_week',
      name: 'Devoted Reader',
      desc: 'Maintain a 7-day reading streak',
      icon: '🔥',
      unlocked: state.readingStreak >= 7,
    },
    {
      id: 'rated_5',
      name: 'Critic',
      desc: 'Rate 5 or more volumes',
      icon: '⭐',
      unlocked: Object.keys(state.volumeRatings).length >= 5,
    },
  ])

  const unlockedCount = computed(() => badges.value.filter(b => b.unlocked).length)

  return { badges, unlockedCount }
}
