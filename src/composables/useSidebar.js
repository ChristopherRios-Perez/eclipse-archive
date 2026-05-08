import { ref } from 'vue'

// Declared outside the composable so all callers share the same ref —
// sidebar state should be global, not per-component
const isOpen = ref(true)

export function useSidebar() {
  function toggle() { isOpen.value = !isOpen.value }
  return { isOpen, toggle }
}
