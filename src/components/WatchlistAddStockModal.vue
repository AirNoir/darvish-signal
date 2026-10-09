<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { computed } from 'vue';
import { useStockStore } from '../stores/stockStore';
import { useFavoritesStore } from '../stores/favoritesStore';

const emit = defineEmits<{ close: [] }>();

const stockStore = useStockStore();
const favorites = useFavoritesStore();
const query = ref('');
const inputRef = ref<HTMLInputElement | null>(null);
const pendingSymbol = ref<string | null>(null);
const notice = ref<string | null>(null);

// 代碼或名稱模糊搜尋；未輸入時顯示全部（上限 50 筆避免過長）
const results = computed(() => {
  const q = query.value.trim().toLowerCase();
  const list = q
    ? stockStore.stockList.filter(
        (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
      )
    : stockStore.stockList;
  return list.slice(0, 50);
});

const toggle = async (symbol: string) => {
  if (pendingSymbol.value) return;
  pendingSymbol.value = symbol;
  notice.value = null;
  try {
    const result = await favorites.toggle(symbol);
    if (typeof result === 'object' && !result.ok) {
      notice.value =
        result.reason === 'limit'
          ? `我的最愛已達上限（${result.limit} 檔）`
          : result.reason === 'not_found'
            ? '這檔股票目前無法加入我的最愛'
            : '操作失敗，請稍後再試';
    }
  } finally {
    pendingSymbol.value = null;
  }
};

onMounted(async () => {
  if (stockStore.stockList.length === 0) {
    await stockStore.fetchStockList();
  }
  inputRef.value?.focus();
});
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      <div class="absolute inset-0 bg-scrim backdrop-blur-sm" @click="emit('close')"></div>

      <div class="relative w-full sm:max-w-md max-h-[85vh] bg-surface border border-line rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between px-5 pt-4 pb-3 border-b border-line-subtle">
          <div>
            <h2 class="text-fg-strong text-base font-bold">新增個股</h2>
            <p class="text-xs text-fg-muted mt-0.5">
              我的最愛（{{ favorites.count }}/{{ favorites.limit }}）
            </p>
          </div>
          <button @click="emit('close')" class="p-1 text-fg-muted hover:text-fg-strong transition-colors" aria-label="關閉">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Search input -->
        <div class="px-5 py-3">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              placeholder="輸入股票代碼或名稱（例：2330 / 台積電）"
              class="w-full pl-9 pr-3 py-2 bg-raised border border-line rounded-lg text-base md:text-sm text-fg-strong placeholder:text-fg-subtle focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <p v-if="notice" class="mt-2 text-xs text-warning-fg">{{ notice }}</p>
        </div>

        <!-- Results -->
        <div class="flex-1 overflow-y-auto px-2 pb-4 min-h-[200px]">
          <p v-if="results.length === 0" class="px-4 py-6 text-center text-sm text-fg-muted">
            找不到符合的股票
          </p>
          <div
            v-for="stock in results"
            :key="stock.symbol"
            class="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-hover transition-colors"
          >
            <div class="flex items-center gap-3 min-w-0">
              <span class="font-mono text-accent text-sm w-14 shrink-0">{{ stock.symbol }}</span>
              <span class="text-sm text-fg truncate">{{ stock.name }}</span>
            </div>
            <button
              @click="toggle(stock.symbol)"
              :disabled="pendingSymbol === stock.symbol || (!favorites.isFavorite(stock.symbol) && favorites.isFull)"
              :class="[
                'px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed',
                favorites.isFavorite(stock.symbol)
                  ? 'bg-control text-fg-secondary hover:bg-danger/20 hover:text-danger-fg'
                  : 'bg-accent text-fg-strong hover:bg-accent-hover'
              ]"
            >
              {{ favorites.isFavorite(stock.symbol) ? '已加入' : '＋ 加入' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
