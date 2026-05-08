<script setup>
import { useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import { useSidebar } from '../composables/useSidebar.js'

const route = useRoute()
const { username } = useAuth() // used for the avatar initial in the header
const { isOpen, toggle } = useSidebar()

// Defined here rather than a router meta field so it's easy to reorder visually
const navItems = [
  { name: 'Dashboard', path: '/', icon: 'grid' },
  { name: 'My Collection', path: '/archive', icon: 'book' },
  { name: 'Statistics', path: '/stats', icon: 'chart' },
  { name: 'Settings', path: '/settings', icon: 'settings' },
]

// Root path needs exact match to avoid always being "active"
function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path) // catches nested routes like /archive/5
}
</script>

<template>
  <!-- Sidebar -->
  <aside
    class="fixed top-0 left-0 h-screen w-56 bg-[#16161a] border-r border-[#2d2d38] flex flex-col z-50 transition-transform duration-300"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- Logo + collapse button -->
    <div class="p-5 border-b border-[#2d2d38] flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded bg-[#c10b21] flex items-center justify-center text-white font-bold text-sm">
          {{ username ? username[0].toUpperCase() : 'E' }}
        </div>
        <div>
          <div class="text-white font-semibold text-sm leading-tight">The Eclipse</div>
          <div class="text-[#5a5a72] text-xs">Archive</div>
        </div>
      </div>
      <button
        @click="toggle"
        class="w-6 h-6 flex items-center justify-center text-[#5a5a72] hover:text-white transition-colors rounded hover:bg-[#2d2d38]"
        title="Collapse sidebar"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 py-4 px-3">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-all duration-150"
        :class="isActive(item.path)
          ? 'bg-[#c10b21] text-white font-medium'
          : 'text-[#8888a0] hover:text-white hover:bg-[#2d2d38]'"
      >
        <svg v-if="item.icon === 'grid'" class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 8a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zm6-6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
        </svg>
        <svg v-if="item.icon === 'book'" class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
        </svg>
        <svg v-if="item.icon === 'chart'" class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
        </svg>
        <svg v-if="item.icon === 'settings'" class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
        </svg>
        {{ item.name }}
      </RouterLink>
    </nav>

    <div class="p-4 border-t border-[#2d2d38]">
      <div class="text-[#5a5a72] text-xs text-center">The Eclipse Archive v1.0</div>
    </div>
  </aside>

  <!-- Reopen tab (visible when sidebar is closed) -->
  <button
    v-if="!isOpen"
    @click="toggle"
    class="fixed top-4 left-0 z-50 bg-[#16161a] border border-[#2d2d38] border-l-0 rounded-r-lg px-2 py-3 text-[#5a5a72] hover:text-white hover:bg-[#2d2d38] transition-all duration-150"
    title="Open sidebar"
  >
    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
    </svg>
  </button>
</template>
