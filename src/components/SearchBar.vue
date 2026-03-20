<script setup lang="ts">
import { ref } from 'vue';
import { useStockStore } from '../stores/stockStore';

const store = useStockStore();
const searchInput = ref<string>('');

const handleSearch = () => {
  const query = searchInput.value.trim();
  if (query) {
    store.searchStock(query);
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSearch();
  }
};
</script>

<template>
  <div class="flex items-center gap-2">
    <div class="relative">
      <input
        v-model="searchInput"
        type="text"
        placeholder="Stock ID (e.g., 2330)"
        @keydown="handleKeydown"
        class="w-48 px-3 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm text-white placeholder-[#666] focus:outline-none focus:border-[#3b82f6] transition-colors"
      />
      <svg
        v-if="store.isLoading"
        class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3b82f6] animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
    <button
      @click="handleSearch"
      :disabled="store.isLoading"
      class="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] disabled:bg-[#1e40af] disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
    >
      搜尋
    </button>
  </div>
</template>
