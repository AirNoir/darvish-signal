<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { trackEvent } from '../lib/analytics';
import ThemeToggle from './ThemeToggle.vue';

const router = useRouter();
const route = useRoute();
const mobileOpen = ref(false);

const navItems = [
  { label: 'AI 產業地圖', to: '/industry-map' },
  { label: '最新動態', to: '/feed' },
  { label: '關於我', to: '/about' },
];

const goHome = () => {
  mobileOpen.value = false;
  router.push('/');
};

const navigate = (item: { label: string; to: string }) => {
  mobileOpen.value = false;
  trackEvent('nav_click', { nav_label: item.label, nav_to: item.to });
  router.push(item.to);
};

const enterApp = () => {
  mobileOpen.value = false;
  trackEvent('cta_click', { cta_id: 'enter_kzone', cta_location: 'header' });
  router.push('/app');
};
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 bg-header backdrop-blur-md border-b border-line-subtle"
    style="font-family: 'GuanHei', 'Iansui', sans-serif;"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
      <!-- Logo -->
      <button @click="goHome" class="flex items-center gap-2 group">
        <img src="/logo.png" alt="達比 K-Zone" class="w-7 h-7 rounded-full" />
        <span class="text-fg-strong font-bold text-base tracking-wide group-hover:text-accent-fg transition-colors">達比 K-Zone</span>
      </button>

      <!-- Desktop Nav -->
      <nav class="hidden sm:flex items-center gap-1">
        <button
          v-for="item in navItems"
          :key="item.to"
          @click="navigate(item)"
          :class="[
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            route.path === item.to
              ? 'bg-accent/20 text-accent-fg'
              : 'text-fg-secondary hover:text-fg-strong hover:bg-line-subtle'
          ]"
        >
          {{ item.label }}
        </button>
        <ThemeToggle source="header" class="ml-1" />
        <button
          @click="enterApp"
          class="ml-2 px-4 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-fg-on-accent text-sm font-medium transition-colors shadow-lg shadow-accent/20"
        >
          進入 K-Zone
        </button>
      </nav>

      <!-- Mobile hamburger -->
      <div class="sm:hidden flex items-center gap-1">
        <ThemeToggle source="header_mobile" />
        <button
          class="text-fg-secondary hover:text-fg-strong transition-colors p-1"
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
    </div>

    <!-- Mobile Menu -->
    <div v-if="mobileOpen" class="sm:hidden border-t border-line-subtle bg-surface px-4 py-3 flex flex-col gap-1">
      <button
        v-for="item in navItems"
        :key="item.to"
        @click="navigate(item)"
        :class="[
          'w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          route.path === item.to
            ? 'bg-accent/20 text-accent-fg'
            : 'text-fg-secondary hover:text-fg-strong hover:bg-line-subtle'
        ]"
      >
        {{ item.label }}
      </button>
      <button
        @click="enterApp"
        class="w-full text-left px-3 py-2 rounded-lg bg-accent hover:bg-accent-hover text-fg-on-accent text-sm font-medium transition-colors mt-1"
      >
        進入 K-Zone
      </button>
    </div>
  </header>
</template>
