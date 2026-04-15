<script setup>
import Sidebar from './components/Sidebar.vue'
</script>

<template>
  <div class="flex min-h-screen bg-[#111114]">
    <Sidebar />
    <main class="flex-1 ml-56 min-h-screen overflow-y-auto">
      <RouterView />
    </main>
  </div>
</template>
