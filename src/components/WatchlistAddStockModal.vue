<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useStockStore } from '../stores/stockStore';
import { useWatchlistStore, MAX_SYMBOLS_PER_GROUP } from '../stores/watchlistStore';

const props = defineProps<{ groupId: string }>();
const emit = defineEmits<{ close: [] }>();

const stockStore = useStockStore();
const watchlist = useWatchlistStore();
const query = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

const group = computed(() => watchlist.groups.find((g) => g.id === props.groupId) ?? null);

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

const isFull = computed(() => (group.value?.symbols.length ?? 0) >= MAX_SYMBOLS_PER_GROUP);

const toggle = (symbol: string) => {
  watchlist.toggleSymbol(props.groupId, symbol);
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
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="emit('close')"></div>

      <div class="relative w-full sm:max-w-md max-h-[85vh] bg-[#141414] border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/5">
          <div>
            <h2 class="text-white text-base font-bold">新增個股</h2>
            <p class="text-xs text-gray-500 mt-0.5">
              加入「{{ group?.name }}」（{{ group?.symbols.length ?? 0 }}/{{ MAX_SYMBOLS_PER_GROUP }}）
            </p>
          </div>
          <button @click="emit('close')" class="p-1 text-gray-500 hover:text-white transition-colors" aria-label="關閉">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Search input -->
        <div class="px-5 py-3">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              placeholder="輸入股票代碼或名稱（例：2330 / 台積電）"
              class="w-full pl-9 pr-3 py-2 bg-[#1e1e1e] border border-[#333] rounded-lg text-base md:text-sm text-white placeholder-[#666] focus:outline-none focus:border-[#3b82f6] transition-colors"
            />
          </div>
        </div>

        <!-- Results -->
        <div class="flex-1 overflow-y-auto px-2 pb-4 min-h-[200px]">
          <p v-if="results.length === 0" class="px-4 py-6 text-center text-sm text-gray-500">
            找不到符合的股票
          </p>
          <div
            v-for="stock in results"
            :key="stock.symbol"
            class="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div class="flex items-center gap-3 min-w-0">
              <span class="font-mono text-[#3b82f6] text-sm w-14 shrink-0">{{ stock.symbol }}</span>
              <span class="text-sm text-gray-200 truncate">{{ stock.name }}</span>
            </div>
            <button
              @click="toggle(stock.symbol)"
              :disabled="!watchlist.isInGroup(stock.symbol, props.groupId) && isFull"
              :class="[
                'px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed',
                watchlist.isInGroup(stock.symbol, props.groupId)
                  ? 'bg-white/10 text-gray-400 hover:bg-red-500/20 hover:text-red-400'
                  : 'bg-blue-600 text-white hover:bg-blue-500'
              ]"
            >
              {{ watchlist.isInGroup(stock.symbol, props.groupId) ? '已加入' : '＋ 加入' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
