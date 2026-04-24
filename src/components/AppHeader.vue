<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const mobileOpen = ref(false);

const navItems = [
  { label: '機器人戰績', to: '/trade-records' },
];

const goHome = () => {
  mobileOpen.value = false;
  router.push('/');
};

const navigate = (to: string) => {
  mobileOpen.value = false;
  router.push(to);
};

const enterApp = () => {
  mobileOpen.value = false;
  router.push('/app');
};
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5"
    style="font-family: 'GuanHei', 'Iansui', sans-serif;"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
      <!-- Logo -->
      <button @click="goHome" class="flex items-center gap-2 group">
        <img src="/logo.png" alt="達比 K-Zone" class="w-7 h-7 rounded-full" />
        <span class="text-white font-bold text-base tracking-wide group-hover:text-blue-400 transition-colors">達比 K-Zone</span>
      </button>

      <!-- Desktop Nav -->
      <nav class="hidden sm:flex items-center gap-1">
        <button
          v-for="item in navItems"
          :key="item.to"
          @click="navigate(item.to)"
          :class="[
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            route.path === item.to
              ? 'bg-blue-600/20 text-blue-400'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          ]"
        >
          {{ item.label }}
        </button>
        <button
          @click="enterApp"
          class="ml-2 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors shadow-lg shadow-blue-600/20"
        >
          進入 K-Zone
        </button>
      </nav>

      <!-- Mobile hamburger -->
      <button
        class="sm:hidden text-gray-400 hover:text-white transition-colors p-1"
        @click="mobileOpen = !mobileOpen"
        aria-label="選單"
      >
        <svg v-if="!mobileOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- Mobile Menu -->
    <div v-if="mobileOpen" class="sm:hidden border-t border-white/5 bg-[#0a0a0a]/95 px-4 py-3 flex flex-col gap-1">
      <button
        v-for="item in navItems"
        :key="item.to"
        @click="navigate(item.to)"
        :class="[
          'w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          route.path === item.to
            ? 'bg-blue-600/20 text-blue-400'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        ]"
      >
        {{ item.label }}
      </button>
      <button
        @click="enterApp"
        class="w-full text-left px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors mt-1"
      >
        進入 K-Zone
      </button>
    </div>
  </header>
</template>
