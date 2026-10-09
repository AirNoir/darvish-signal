<script setup lang="ts">
// 我的最愛星號：單一清單直接 toggle（後端 /api/favorites）。
import { computed, ref } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useFavoritesStore } from '../stores/favoritesStore';

const props = defineProps<{ symbol: string }>();

const auth = useAuthStore();
const favorites = useFavoritesStore();
const pending = ref(false);

const isStarred = computed(() => favorites.isFavorite(props.symbol));

const handleClick = async () => {
  if (!auth.isLoggedIn) {
    auth.openLogin('star_button');
    return;
  }
  if (pending.value) return;
  pending.value = true;
  try {
    const result = await favorites.toggle(props.symbol);
    if (typeof result === 'object' && !result.ok) {
      if (result.reason === 'limit') {
        window.alert(`我的最愛已達上限（${result.limit} 檔），請先移除部分個股`);
      } else if (result.reason === 'not_found') {
        window.alert('這檔股票目前無法加入我的最愛');
      } else {
        window.alert('操作失敗，請稍後再試');
      }
    }
  } finally {
    pending.value = false;
  }
};
</script>

<template>
  <button
    @click="handleClick"
    :disabled="pending"
    class="p-1 transition-colors disabled:opacity-50"
    :class="isStarred ? 'text-[#f5b840]' : 'text-[#666] hover:text-[#f5b840]'"
    :aria-label="isStarred ? '從我的最愛移除' : '加入我的最愛'"
    :title="isStarred ? '從我的最愛移除' : '加入我的最愛'"
  >
    <svg class="w-4 h-4" :fill="isStarred ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.5a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.5.04.7.663.32.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.32-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  </button>
</template>
