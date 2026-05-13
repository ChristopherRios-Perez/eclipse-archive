import { ref } from 'vue'

// Declared outside the composable so all callers share the same ref -
// sidebar state needs to be global, not per-component
const isOpen = ref(true)

export function useSidebar() {
  function toggle() { isOpen.value = !isOpen.value }
  return { isOpen, toggle }
}
