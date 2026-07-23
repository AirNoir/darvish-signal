<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const auth = useAuthStore();
const router = useRouter();
const menuOpen = ref(false);
const rootRef = ref<HTMLDivElement | null>(null);

const goWatchlist = () => {
  menuOpen.value = false;
  router.push('/watchlist');
};

const handleSignOut = () => {
  menuOpen.value = false;
  auth.signOut();
};

const handleClickOutside = (e: MouseEvent) => {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    menuOpen.value = false;
  }
};

onMounted(() => document.addEventListener('mousedown', handleClickOutside));
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside));
</script>

<template>
  <div ref="rootRef" class="relative">
    <!-- 未登入：登入按鈕 -->
    <button
      v-if="!auth.isLoggedIn"
      @click="auth.openLogin('header')"
      class="px-3 py-1.5 rounded-lg border border-white/15 text-sm font-medium text-gray-300 hover:text-white hover:border-white/30 transition-colors"
    >
      登入
    </button>

    <!-- 已登入：頭像 + 下拉選單 -->
    <template v-else>
      <button
        @click="menuOpen = !menuOpen"
        class="flex items-center gap-1.5 rounded-full hover:ring-2 hover:ring-blue-500/50 transition-shadow"
        aria-label="使用者選單"
      >
        <img
          v-if="auth.user?.picture"
          :src="auth.user.picture"
          :alt="auth.user?.name ?? '使用者'"
          referrerpolicy="no-referrer"
          class="w-8 h-8 rounded-full border border-white/20"
        />
        <span
          v-else
          class="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center"
        >
          {{ (auth.user?.name ?? auth.user?.email ?? '?').charAt(0).toUpperCase() }}
        </span>
      </button>

      <div
        v-if="menuOpen"
        class="absolute right-0 top-full mt-2 w-56 bg-[#161616] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
      >
        <div class="px-4 py-3 border-b border-white/5">
          <p class="text-white text-sm font-medium truncate">{{ auth.user?.name ?? '使用者' }}</p>
          <p class="text-gray-500 text-xs truncate">{{ auth.user?.email }}</p>
        </div>
        <button
          @click="goWatchlist"
          class="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
        >
          <svg class="w-4 h-4 text-[#f5b840]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
          我的自選股
        </button>
        <button
          @click="handleSignOut"
          class="w-full text-left px-4 py-2.5 text-sm text-gray-400 hover:bg-white/5 hover:text-red-400 transition-colors flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          登出
        </button>
      </div>
    </template>
  </div>
</template>
