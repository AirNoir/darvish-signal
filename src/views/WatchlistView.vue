<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AppHeader from '../components/AppHeader.vue';
import WatchlistAddStockModal from '../components/WatchlistAddStockModal.vue';
import WatchlistGroupManageModal from '../components/WatchlistGroupManageModal.vue';
import { useAuthStore } from '../stores/authStore';
import { useStockStore } from '../stores/stockStore';
import { useWatchlistStore, MAX_GROUPS } from '../stores/watchlistStore';
import { stockApi } from '../api/stockApi';
import { trackEvent } from '../lib/analytics';

interface Quote {
  close: number | null;
  change: number | null;
  changePercent: number | null;
  volume: number | null;
}

const router = useRouter();
const auth = useAuthStore();
const stockStore = useStockStore();
const watchlist = useWatchlistStore();

const showAddModal = ref(false);
const showGroupModal = ref(false);
const quotes = ref<Record<string, Quote>>({});
const loadingQuotes = ref(false);

const nameOf = (symbol: string): string =>
  stockStore.stockList.find((s) => s.symbol === symbol)?.name ?? '';

// 取最近兩根日 K 算漲跌；已抓過的 symbol 不重抓
const fetchQuotes = async (symbols: string[]) => {
  const missing = symbols.filter((s) => !(s in quotes.value));
  if (missing.length === 0) return;
  loadingQuotes.value = true;
  try {
    await Promise.all(
      missing.map(async (symbol) => {
        try {
          const data = await stockApi.getStockHistory(symbol, 2); // newest-first
          const latest = data[0];
          const prev = data[1];
          const close = latest?.close ?? null;
          const prevClose = prev?.close ?? null;
          const change = close != null && prevClose != null ? close - prevClose : null;
          quotes.value[symbol] = {
            close,
            change,
            changePercent:
              change != null && prevClose ? (change / prevClose) * 100 : null,
            volume: latest?.volume ?? null
          };
        } catch {
          quotes.value[symbol] = { close: null, change: null, changePercent: null, volume: null };
        }
      })
    );
  } finally {
    loadingQuotes.value = false;
  }
};

const activeSymbols = computed(() => watchlist.activeGroup?.symbols ?? []);

watch(activeSymbols, (symbols) => fetchQuotes(symbols), { immediate: true, deep: true });

const goToStock = (symbol: string) => {
  trackEvent('watchlist_stock_click', { symbol });
  router.push(`/app/${symbol}`);
};

const removeFromActive = (symbol: string) => {
  if (watchlist.activeGroup) {
    watchlist.removeSymbol(watchlist.activeGroup.id, symbol);
  }
};

const formatPrice = (v: number | null): string =>
  v == null || !Number.isFinite(v) ? '—' : v.toFixed(2);

const formatVolume = (v: number | null): string => {
  if (v == null || !Number.isFinite(v)) return '—';
  // 股 → 張
  const lots = v / 1000;
  if (lots >= 1e4) return (lots / 1e4).toFixed(1) + ' 萬張';
  return Math.round(lots).toLocaleString() + ' 張';
};

onMounted(() => {
  if (stockStore.stockList.length === 0) {
    stockStore.fetchStockList();
  }
});
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0a] text-white" style="font-family: 'GuanHei', 'Iansui', sans-serif;">
    <AppHeader />

    <main class="max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-16">
      <!-- 未登入 -->
      <div v-if="!auth.isLoggedIn" class="flex flex-col items-center justify-center py-24 text-center gap-4">
        <svg class="w-12 h-12 text-[#f5b840]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
        <h1 class="text-xl font-bold">我的自選股</h1>
        <p class="text-gray-400 text-sm">登入後即可建立自選股群組，追蹤你關注的個股</p>
        <button
          @click="auth.openLogin('watchlist_page')"
          class="mt-2 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors shadow-lg shadow-blue-600/20"
        >
          使用 Google 帳號登入
        </button>
      </div>

      <!-- 已登入 -->
      <template v-else>
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-xl font-bold">我的自選股</h1>
          <div class="flex items-center gap-2">
            <button
              @click="showAddModal = true"
              class="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors flex items-center gap-1"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              新增個股
            </button>
            <button
              @click="showGroupModal = true"
              class="px-3 py-1.5 rounded-lg border border-white/15 text-gray-300 hover:text-white hover:border-white/30 text-sm font-medium transition-colors"
            >
              管理群組
            </button>
          </div>
        </div>

        <!-- 群組 tabs -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 -mx-1 px-1">
          <button
            v-for="group in watchlist.groups"
            :key="group.id"
            @click="watchlist.setActiveGroup(group.id)"
            :class="[
              'px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0',
              group.id === watchlist.activeGroupId
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            ]"
          >
            {{ group.name }}
            <span class="text-xs opacity-60 ml-1">{{ group.symbols.length }}</span>
          </button>
          <button
            v-if="watchlist.canAddGroup"
            @click="showGroupModal = true"
            class="w-8 h-8 rounded-full bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors shrink-0 flex items-center justify-center"
            :aria-label="`新增群組（最多 ${MAX_GROUPS} 個）`"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <!-- 空清單 -->
        <div
          v-if="activeSymbols.length === 0"
          class="flex flex-col items-center justify-center py-20 text-center gap-3 border border-dashed border-white/10 rounded-2xl"
        >
          <p class="text-gray-500 text-sm">「{{ watchlist.activeGroup?.name }}」還沒有個股</p>
          <button
            @click="showAddModal = true"
            class="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-sm transition-colors"
          >
            ＋ 用代碼或名稱搜尋加入
          </button>
        </div>

        <!-- 個股清單 -->
        <div v-else class="rounded-2xl border border-white/5 overflow-hidden">
          <!-- 表頭 -->
          <div class="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1.2fr_1fr_1fr_1fr_auto] items-center gap-2 px-4 py-2 bg-white/[0.03] text-xs text-gray-500">
            <span>個股</span>
            <span class="text-right w-20 sm:w-auto">股價</span>
            <span class="text-right w-24 sm:w-auto">漲跌</span>
            <span class="hidden sm:block text-right">成交量</span>
            <span class="hidden sm:block w-8"></span>
          </div>

          <button
            v-for="symbol in activeSymbols"
            :key="symbol"
            @click="goToStock(symbol)"
            class="w-full grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1.2fr_1fr_1fr_1fr_auto] items-center gap-2 px-4 py-3 border-t border-white/5 hover:bg-white/[0.04] transition-colors text-left group"
          >
            <!-- 代碼 + 名稱 -->
            <div class="min-w-0">
              <p class="text-sm font-medium text-white truncate">{{ nameOf(symbol) || symbol }}</p>
              <p class="text-xs text-gray-500 font-mono">{{ symbol }}</p>
            </div>

            <!-- 股價 -->
            <span class="text-sm text-white tabular-nums text-right w-20 sm:w-auto">
              {{ formatPrice(quotes[symbol]?.close ?? null) }}
            </span>

            <!-- 漲跌（台股慣例：紅漲綠跌，同 KZoneApp） -->
            <span
              class="text-sm tabular-nums text-right w-24 sm:w-auto"
              :class="
                (quotes[symbol]?.change ?? 0) > 0
                  ? 'text-[#ef5350]'
                  : (quotes[symbol]?.change ?? 0) < 0
                    ? 'text-[#26a69a]'
                    : 'text-gray-400'
              "
            >
              <template v-if="quotes[symbol]?.change != null">
                {{ (quotes[symbol]!.change! > 0 ? '+' : '') + quotes[symbol]!.change!.toFixed(2) }}
                ({{ quotes[symbol]!.changePercent!.toFixed(2) }}%)
              </template>
              <template v-else>—</template>
            </span>

            <!-- 成交量（桌面） -->
            <span class="hidden sm:block text-sm text-gray-400 tabular-nums text-right">
              {{ formatVolume(quotes[symbol]?.volume ?? null) }}
            </span>

            <!-- 移除 -->
            <span class="hidden sm:flex w-8 justify-end">
              <span
                @click.stop="removeFromActive(symbol)"
                class="p-1 text-gray-600 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all cursor-pointer"
                role="button"
                aria-label="移除"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
            </span>
          </button>
        </div>

        <p v-if="loadingQuotes" class="text-xs text-gray-600 mt-3 text-center">報價載入中…</p>
        <p class="text-[11px] text-gray-600 mt-6 text-center">
          報價為日 K 收盤資料，非即時行情；點擊個股可進入 K-Zone 查看完整技術分析
        </p>
      </template>
    </main>

    <WatchlistAddStockModal
      v-if="showAddModal && watchlist.activeGroup"
      :group-id="watchlist.activeGroup.id"
      @close="showAddModal = false"
    />
    <WatchlistGroupManageModal v-if="showGroupModal" @close="showGroupModal = false" />
  </div>
</template>
