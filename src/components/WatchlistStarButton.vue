<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useWatchlistStore } from '../stores/watchlistStore';

const props = defineProps<{ symbol: string }>();

const auth = useAuthStore();
const watchlist = useWatchlistStore();
const popoverOpen = ref(false);
const rootRef = ref<HTMLDivElement | null>(null);

const isStarred = computed(() => watchlist.groupsContaining(props.symbol).length > 0);

const handleClick = () => {
  if (!auth.isLoggedIn) {
    auth.openLogin('star_button');
    return;
  }
  popoverOpen.value = !popoverOpen.value;
};

const handleClickOutside = (e: MouseEvent) => {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    popoverOpen.value = false;
  }
};

onMounted(() => document.addEventListener('mousedown', handleClickOutside));
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside));
</script>

<template>
  <div ref="rootRef" class="relative flex items-center">
    <button
      @click="handleClick"
      class="p-1 transition-colors"
      :class="isStarred ? 'text-[#f5b840]' : 'text-[#666] hover:text-[#f5b840]'"
      :aria-label="isStarred ? '管理自選股' : '加入自選股'"
      :title="isStarred ? '管理自選股' : '加入自選股'"
    >
      <svg class="w-4 h-4" :fill="isStarred ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.5a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.5.04.7.663.32.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.32-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    </button>

    <!-- 群組勾選 popover -->
    <div
      v-if="popoverOpen"
      class="absolute right-0 top-full mt-2 w-52 bg-[#161616] border border-white/10 rounded-xl shadow-2xl z-[60] py-1"
    >
      <p class="px-3 py-2 text-xs text-gray-500 border-b border-white/5">加入自選股群組</p>
      <button
        v-for="group in watchlist.groups"
        :key="group.id"
        @click="watchlist.toggleSymbol(group.id, props.symbol)"
        class="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
      >
        <span class="truncate">{{ group.name }}</span>
        <svg
          v-if="watchlist.isInGroup(props.symbol, group.id)"
          class="w-4 h-4 text-blue-400 shrink-0"
          fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span v-else class="w-4 h-4 rounded border border-[#444] shrink-0"></span>
      </button>
    </div>
  </div>
</template>
