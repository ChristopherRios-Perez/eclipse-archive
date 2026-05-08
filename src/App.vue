<script setup>
import Sidebar from './components/Sidebar.vue'
import Login from './views/Login.vue'
import { useAuth } from './composables/useAuth.js'
import { useSidebar } from './composables/useSidebar.js'

const { isLoggedIn } = useAuth()
const { isOpen } = useSidebar() // needed here to shift <main> when sidebar collapses
</script>

<template>
  <div class="flex min-h-screen bg-[#111114]">

    <!-- Global red glow — fixed to full viewport, always behind everything -->
    <div v-if="isLoggedIn" class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div class="glow-a absolute rounded-full"
           style="width: 100vw; height: 100vw; top: 50%; left: 50%; transform: translate(-50%, -50%);
                  background: radial-gradient(circle, #8b0000 0%, #4a0000 40%, transparent 70%);"></div>
      <div class="glow-b absolute rounded-full"
           style="width: 70vw; height: 70vw; top: -15vh; right: -10vw;
                  background: radial-gradient(circle, #c10b21 0%, #6b0000 40%, transparent 70%);"></div>
      <div class="glow-c absolute rounded-full"
           style="width: 60vw; height: 60vw; bottom: -15vh; left: -8vw;
                  background: radial-gradient(circle, #7a0000 0%, transparent 65%);"></div>
      <div class="glow-b absolute rounded-full"
           style="width: 55vw; height: 55vw; bottom: -15vh; right: -8vw; animation-delay: 3s;
                  background: radial-gradient(circle, #6b0000 0%, transparent 65%);"></div>
    </div>

    <template v-if="isLoggedIn">
      <Sidebar />
      <!-- left offset matches the sidebar width (w-56 = 224px); drops to 0 when collapsed -->
      <main
        class="fixed top-0 bottom-0 right-0 overflow-y-auto z-10 transition-all duration-300"
        :class="isOpen ? 'left-56' : 'left-0'"
      >
        <RouterView />
      </main>
    </template>
    <Login v-else />
  </div>
</template>

<style scoped>
.glow-a {
  animation: glow-center 8s ease-in-out infinite;
  filter: blur(90px);
  opacity: 0.3;
}
.glow-b {
  animation: glow-breathe 6s ease-in-out infinite 2s;
  filter: blur(75px);
  opacity: 0.28;
}
.glow-c {
  animation: glow-flicker 10s ease-in-out infinite 1s;
  filter: blur(65px);
  opacity: 0.25;
}

@keyframes glow-center {
  0%, 100% { opacity: 0.2;  transform: translate(-50%, -50%) scale(1);    }
  50%       { opacity: 0.42; transform: translate(-50%, -50%) scale(1.12); }
}
@keyframes glow-breathe {
  0%, 100% { opacity: 0.18; transform: scale(1);    }
  50%       { opacity: 0.42; transform: scale(1.12); }
}
@keyframes glow-flicker {
  0%, 100% { opacity: 0.12; transform: scale(0.95); }
  30%       { opacity: 0.38; transform: scale(1.1);  }
  60%       { opacity: 0.18; transform: scale(1.0);  }
  80%       { opacity: 0.35; transform: scale(1.05); }
}
</style>
