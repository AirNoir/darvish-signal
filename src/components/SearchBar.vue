<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useStockStore } from '../stores/stockStore';

const store = useStockStore();
const searchInput = ref<string>(store.stockId);

watch(() => store.stockId, (id) => {
  searchInput.value = id;
});
const showDropdown = ref<boolean>(false);
const highlightedIndex = ref<number>(-1);
const inputRef = ref<HTMLInputElement | null>(null);
const dropdownRef = ref<HTMLDivElement | null>(null);

const filteredStocks = computed(() => {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) return store.stockList;
  return store.stockList.filter(
    (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
  );
});

const openDropdown = async () => {
  if (store.stockList.length === 0) {
    await store.fetchStockList();
  }
  showDropdown.value = true;
  highlightedIndex.value = -1;
};

const closeDropdown = () => {
  showDropdown.value = false;
  highlightedIndex.value = -1;
};

const selectStock = (symbol: string) => {
  searchInput.value = symbol;
  closeDropdown();
  store.searchStock(symbol);
  nextTick(() => {
    inputRef.value?.select();
  });
};

const handleSearch = () => {
  const query = searchInput.value.trim();
  if (query) {
    closeDropdown();
    store.searchStock(query);
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (!showDropdown.value) {
    if (e.key === 'Enter') handleSearch();
    return;
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    highlightedIndex.value = Math.min(highlightedIndex.value + 1, filteredStocks.value.length - 1);
    scrollToHighlighted();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0);
    scrollToHighlighted();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (highlightedIndex.value >= 0 && filteredStocks.value[highlightedIndex.value]) {
      selectStock(filteredStocks.value[highlightedIndex.value]!.symbol);
    } else {
      handleSearch();
    }
  } else if (e.key === 'Escape') {
    closeDropdown();
  }
};

const scrollToHighlighted = () => {
  if (!dropdownRef.value) return;
  const item = dropdownRef.value.querySelector(`[data-index="${highlightedIndex.value}"]`) as HTMLElement | null;
  item?.scrollIntoView({ block: 'nearest' });
};

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as Node;
  if (
    inputRef.value && !inputRef.value.contains(target) &&
    dropdownRef.value && !dropdownRef.value.contains(target)
  ) {
    closeDropdown();
  }
};

onMounted(() => document.addEventListener('mousedown', handleClickOutside));
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside));
</script>

<template>
  <div class="flex items-center gap-2">
    <div class="relative">
      <input
        ref="inputRef"
        v-model="searchInput"
        type="text"
        placeholder="Stock ID (e.g., 2330)"
        @focus="openDropdown"
        @click="openDropdown"
        @keydown="handleKeydown"
        @input="highlightedIndex = -1"
        class="w-48 px-3 py-1 bg-[#1a1a1a] border border-[#333] rounded text-sm text-white placeholder-[#666] focus:outline-none focus:border-[#3b82f6] transition-colors"
      />
      <svg
        v-if="store.isLoading"
        class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3b82f6] animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>

      <!-- Dropdown Panel -->
      <div
        v-if="showDropdown"
        ref="dropdownRef"
        class="absolute top-full left-0 mt-1 w-64 max-h-64 overflow-y-auto bg-[#1a1a1a] border border-[#333] rounded shadow-lg z-50"
      >
        <div v-if="filteredStocks.length === 0" class="px-3 py-2 text-xs text-[#666]">
          找不到符合的股票
        </div>
        <button
          v-for="(stock, index) in filteredStocks"
          :key="stock.symbol"
          :data-index="index"
          @mousedown.prevent="selectStock(stock.symbol)"
          @mouseenter="highlightedIndex = index"
          class="w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors"
          :class="index === highlightedIndex ? 'bg-[#2a2a2a] text-white' : 'text-[#ccc] hover:bg-[#222] hover:text-white'"
        >
          <span class="font-mono text-[#3b82f6] w-12 shrink-0">{{ stock.symbol }}</span>
          <span class="truncate">{{ stock.name }}</span>
        </button>
      </div>
    </div>

    <button
      @click="handleSearch"
      :disabled="store.isLoading"
      class="px-3 py-1 bg-[#3b82f6] hover:bg-[#2563eb] disabled:bg-[#1e40af] disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
    >
      搜尋
    </button>
  </div>
</template>
