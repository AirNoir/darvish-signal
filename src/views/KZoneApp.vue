<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import type { IndicatorSettings } from '../types';
import { useStockStore } from '../stores/stockStore';
import SearchBar from '../components/SearchBar.vue';
import MultiPaneChart from '../components/MultiPaneChart.vue';
import AlphaPickPanel from '../components/AlphaPickPanel.vue';
import MarketSummaryCard from '../components/MarketSummaryCard.vue';
import IndicatorSettingsModal from '../components/IndicatorSettings.vue';
import ThemeToggle from '../components/ThemeToggle.vue';
import { trackEvent } from '../lib/analytics';

const router = useRouter();
const route = useRoute();
const store = useStockStore();
const showMobileAlphaPick = ref(false);
const showSettings = ref(false);
// 手機版進站預設展開搜尋面板，讓使用者能直接輸入股票代碼
const isMobileViewport = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
const showMobileMenu = ref(isMobileViewport);

const openIndicatorSettings = (source: 'desktop' | 'mobile') => {
  showSettings.value = true;
  showMobileMenu.value = false;
  trackEvent('indicator_settings_open', { source });
};

const industryMaps = [
  { label: 'AI 產業地圖', short: 'AI 地圖', to: '/industry-map' },
  { label: '低軌衛星地圖', short: '衛星地圖', to: '/leo-map' }
];
// 平板寬度（md–lg）header 放不下兩顆地圖按鈕，收成一顆「產業地圖」下拉
const showMapMenu = ref(false);

const openIndustryMap = (map: { label: string; to: string }) => {
  showMobileMenu.value = false;
  showMapMenu.value = false;
  trackEvent('nav_click', { nav_label: map.label, nav_to: map.to, nav_location: 'kzone' });
  router.push(map.to);
};

const goToHome = () => {
  router.push('/');
};

const onAlphaStockSelected = () => {
  // 桌機因 md:flex 永遠顯示面板，所以這個 flag 收合不影響桌機 UI
  showMobileAlphaPick.value = false;
};

const closeMobileAlphaPanel = () => {
  showMobileAlphaPick.value = false;
};

const SETTINGS_STORAGE_KEY = 'kzone:indicator-settings';

// 預設只開：成交量、外資、投信
const defaultIndicatorSettings = (): IndicatorSettings => ({
  volume: true,
  turnoverRate: false,
  volumeMA: false,
  foreignNet: true,
  foreignNetMA: false,
  trustNet: true,
  foreignHoldingPct: false,
  instiHoldingPct: false,
  majorRetailHolding: false,
  marginBalance: false,
  marginChange: false,
  shortBalance: false,
  shortChange: false,
  shortMarginRatio: false,
  rsi: false,
  macd: false,
  bollinger: false,
  kd: false
});

// 載入使用者上次的指標設定；合併預設值，讓未來新增的指標自動帶預設、舊殘留鍵被忽略
const loadIndicatorSettings = (): IndicatorSettings => {
  const base = defaultIndicatorSettings();
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw) as Partial<Record<keyof IndicatorSettings, unknown>>;
    for (const key of Object.keys(base) as (keyof IndicatorSettings)[]) {
      if (typeof saved[key] === 'boolean') base[key] = saved[key] as boolean;
    }
    return base;
  } catch {
    return base;
  }
};

const indicatorSettings = ref<IndicatorSettings>(loadIndicatorSettings());

// 使用者調整指標後寫回 localStorage（無痕模式 / 配額滿時忽略錯誤）
watch(indicatorSettings, (val) => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(val));
  } catch {
    /* ignore */
  }
}, { deep: true });

const indicatorOrder = ref<string[]>([
  'volume',
  'foreignNet',
  'foreignNetMA',
  'volumeMA',
  'turnoverRate',
  'trustNet',
  'foreignHoldingPct',
  'instiHoldingPct',
  'majorRetailHolding',
  'margin',
  'short',
  'shortMarginRatio',
  'macd',
  'kd',
  'rsi',
  'bollinger'
]);

const latestData = computed(() => {
  const len = store.stockData.length;
  if (len === 0) return null;
  return store.stockData[len - 1];
});

const previousData = computed(() => {
  const len = store.stockData.length;
  if (len < 2) return null;
  return store.stockData[len - 2];
});

const priceChange = computed(() => {
  if (!latestData.value || !previousData.value) return null;
  const cur = latestData.value.close;
  const prev = previousData.value.close;
  if (cur == null || prev == null || !Number.isFinite(cur) || !Number.isFinite(prev) || prev === 0) {
    return null;
  }
  const change = cur - prev;
  const changePercent = (change / prev) * 100;
  return {
    value: change,
    percent: changePercent,
    isPositive: change >= 0
  };
});

const formatMobileVolume = (v: number | null | undefined): string => {
  if (v == null || !Number.isFinite(v)) return '—';
  if (v >= 1e8) return (v / 1e8).toFixed(2) + ' 億';
  if (v >= 1e4) return (v / 1e4).toFixed(1) + ' 萬';
  return v.toLocaleString();
};

const formatPrice = (v: number | null | undefined): string =>
  v == null || !Number.isFinite(v) ? '—' : v.toFixed(2);

const displayedIdx = computed<number>(() => {
  const n = store.stockData.length;
  if (n === 0) return -1;
  const hoverTime = store.syncedHoverTime;
  if (!hoverTime) return n - 1;
  const idx = store.stockData.findIndex((d) => d.time === hoverTime);
  return idx >= 0 ? idx : n - 1;
});

const displayedData = computed(() => {
  const idx = displayedIdx.value;
  return idx >= 0 ? store.stockData[idx] : null;
});

const isLatestBar = computed(() => {
  const n = store.stockData.length;
  return n > 0 && displayedIdx.value === n - 1;
});

const movingAverage = (idx: number, period: number): number | null => {
  if (idx < period - 1) return null;
  let sum = 0;
  for (let i = idx - (period - 1); i <= idx; i++) {
    const c = store.stockData[i]!.close;
    if (c == null || !Number.isFinite(c)) return null;
    sum += c;
  }
  return sum / period;
};

const displayedMA5 = computed<number | null>(() => movingAverage(displayedIdx.value, 5));
const displayedMA10 = computed<number | null>(() => movingAverage(displayedIdx.value, 10));
const displayedMA20 = computed<number | null>(() => movingAverage(displayedIdx.value, 20));

const routeSymbol = computed(() => {
  const s = route.params.symbol;
  return typeof s === 'string' && s.trim() ? s.trim() : null;
});

onMounted(() => {
  store.fetchStockData(routeSymbol.value ?? '2330');
});

// URL → store：使用者直接改網址 / 上一頁下一頁
watch(routeSymbol, (s) => {
  if (s && s !== store.stockId) {
    store.fetchStockData(s);
  }
});

// store → URL：使用者透過搜尋或 alpha pick 切換股票時同步路徑
watch(() => store.stockId, (id) => {
  if (id && id !== routeSymbol.value) {
    router.replace({ name: 'app', params: { symbol: id } });
  }
});
</script>

<template>
  <div class="relative flex flex-col h-screen bg-canvas overflow-hidden" style="height: 100vh; font-family: 'Noto Sans TC', system-ui, sans-serif;">
    <!-- Header -->
    <header class="h-14 min-h-[56px] md:h-10 md:min-h-[40px] flex items-center px-3 border-b border-line bg-surface flex-shrink-0 gap-2">
      <div class="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity" @click="goToHome">
        <img src="/logo.png" alt="達比 K-Zone" class="w-7 h-7 rounded-full" />
        <h1 class="text-sm font-semibold text-fg-strong whitespace-nowrap hidden sm:block md:hidden lg:block">達比 K-Zone</h1>
      </div>

      <div v-if="latestData" class="ml-auto flex items-center gap-x-2 gap-y-0 flex-wrap justify-end min-w-0">
        <span class="text-accent font-semibold text-sm">{{ store.stockId }}</span>
        <span
          v-if="store.stockName"
          class="text-series-gold font-semibold text-base"
          style="text-shadow: 0 0 8px color-mix(in srgb, var(--ds-brand-gold) 35%, transparent);"
        >{{ store.stockName }}</span>
        <span class="text-fg-strong text-sm font-medium">{{ formatPrice(latestData.close) }}</span>
        <span
          v-if="priceChange"
          class="text-sm font-medium"
          :class="(latestData.price_limit_up || latestData.price_limit_down)
            ? ['px-1.5 py-0.5 rounded text-fg-on-accent', latestData.price_limit_up ? 'bg-market-up' : 'bg-market-down']
            : (priceChange.isPositive ? 'text-market-up' : 'text-market-down')"
        >
          {{ priceChange.isPositive ? '+' : '' }}{{ priceChange.value.toFixed(2) }}
          ({{ priceChange.percent.toFixed(2) }}%)
        </span>
      </div>

      <div :class="['hidden md:flex items-center gap-2', !latestData && 'ml-auto']">
        <button
          v-for="map in industryMaps"
          :key="map.to"
          @click="openIndustryMap(map)"
          class="hidden lg:inline-block shrink-0 whitespace-nowrap px-2 py-1 text-sm font-medium rounded border border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan-fg hover:bg-brand-cyan/20 transition-colors"
        ><span class="xl:hidden">{{ map.short }}</span><span class="hidden xl:inline">{{ map.label }}</span></button>
        <div class="relative lg:hidden">
          <button
            @click="showMapMenu = !showMapMenu"
            :aria-expanded="showMapMenu"
            class="shrink-0 whitespace-nowrap px-2 py-1 text-sm font-medium rounded border border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan-fg hover:bg-brand-cyan/20 transition-colors"
          >產業地圖 ▾</button>
          <div v-if="showMapMenu" class="fixed inset-0 z-40" @click="showMapMenu = false"></div>
          <div
            v-if="showMapMenu"
            class="absolute right-0 top-full mt-1 z-50 w-36 py-1 bg-surface border border-line rounded shadow-lg"
          >
            <button
              v-for="map in industryMaps"
              :key="map.to"
              @click="openIndustryMap(map)"
              class="w-full px-3 py-2 text-left text-sm text-fg hover:bg-hover hover:text-fg-strong transition-colors"
            >{{ map.label }}</button>
          </div>
        </div>
        <ThemeToggle source="kzone" />
        <button
          @click="openIndicatorSettings('desktop')"
          class="shrink-0 whitespace-nowrap px-2 py-1 text-sm font-medium rounded transition-colors bg-control text-fg-secondary hover:bg-control-hover"
        >
          <span class="flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            指標
          </span>
        </button>
        <SearchBar />
      </div>

      <button
        @click="showMobileMenu = !showMobileMenu"
        aria-label="選單"
        :aria-expanded="showMobileMenu"
        class="md:hidden p-1 text-fg-secondary hover:text-fg-strong transition-colors"
      >
        <svg v-if="!showMobileMenu" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </header>

    <!-- Mobile Menu Dropdown -->
    <div
      v-if="showMobileMenu"
      class="md:hidden absolute top-14 left-0 right-0 bg-surface border-b border-line z-50 p-3 flex flex-col gap-2"
    >
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="map in industryMaps"
          :key="map.to"
          @click="openIndustryMap(map)"
          class="px-3 py-2 text-sm font-medium rounded border border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan-fg hover:bg-brand-cyan/20 transition-colors text-left"
        >{{ map.label }}</button>
      </div>
      <SearchBar autofocus @stock-selected="showMobileMenu = false" />
      <button
        @click="openIndicatorSettings('mobile')"
        class="w-full px-3 py-1.5 text-sm font-medium rounded transition-colors bg-control text-fg-secondary hover:bg-control-hover text-left"
      >
        <span class="flex items-center gap-2">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          指標設定
        </span>
      </button>
      <button
        @click="showMobileAlphaPick = !showMobileAlphaPick; showMobileMenu = false"
        :class="[
          'w-full px-3 py-1.5 text-sm font-medium rounded transition-colors text-left',
          showMobileAlphaPick ? 'bg-brand-rose text-fg-on-accent' : 'bg-control text-fg-secondary hover:bg-control-hover'
        ]"
      >
        技術條件清單
      </button>

      <ThemeToggle source="kzone_mobile" with-label class="w-full px-3 py-1.5 rounded bg-control hover:bg-control-hover text-left" />

      <button
        @click="showMobileMenu = false"
        class="w-full mt-1 px-4 py-2 bg-accent hover:bg-accent-hover text-fg-on-accent text-sm font-medium rounded-lg transition-colors"
      >
        完成
      </button>
    </div>

    <!-- Main Content -->
    <main class="flex-1 flex overflow-hidden">
      <!-- Mobile Backdrop -->
      <div
        v-if="showMobileAlphaPick"
        class="md:hidden fixed inset-0 z-30 bg-scrim"
        @click="closeMobileAlphaPanel"
      ></div>

      <!-- Alpha Pick Panel -->
      <div
        :class="[
          'w-72 border-r border-line flex-col flex-shrink-0 md:flex relative z-40 bg-canvas',
          showMobileAlphaPick ? 'flex' : 'hidden'
        ]"
      >
        <MarketSummaryCard />
        <div class="flex-1 overflow-y-auto min-h-0">
          <AlphaPickPanel @stock-selected="onAlphaStockSelected" />
        </div>
      </div>

      <!-- Charts Area -->
      <div class="flex-1 flex flex-col overflow-hidden relative">
        <div
          v-if="store.error"
          class="mx-2 mt-2 p-2 bg-danger/10 border border-danger/30 rounded text-danger-fg text-xs"
        >
          {{ store.error }}
        </div>

        <div
          v-if="store.isLoading && store.stockData.length === 0"
          class="flex-1 flex items-center justify-center"
        >
          <div class="flex flex-col items-center gap-2">
            <svg class="w-6 h-6 text-accent animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-fg-secondary text-xs">Loading...</span>
          </div>
        </div>

        <div v-else class="flex-1 flex flex-col overflow-hidden">
          <!-- Mobile OHLC + MA strip (dynamic: updates with klinecharts crosshair on long-press) -->
          <div
            v-if="displayedData"
            class="md:hidden flex items-center gap-x-3 gap-y-0 flex-wrap px-3 py-1.5 bg-surface border-b border-line text-sm flex-shrink-0"
          >
            <span class="flex items-center gap-1">
              <span class="text-fg-label">時間</span>
              <span class="tabular-nums" :class="isLatestBar ? 'text-fg-strong' : 'text-series-gold'">{{ displayedData.time }}</span>
              <button
                v-if="!isLatestBar"
                @click="store.setSyncedHoverTime(null)"
                class="ml-0.5 text-xs text-accent px-1.5 py-px border border-accent/60 rounded hover:bg-accent/10 transition-colors"
              >↩ 最新</button>
            </span>
            <span><span class="text-fg-label">開</span> <span class="text-fg-strong tabular-nums">{{ formatPrice(displayedData.open) }}</span></span>
            <span><span class="text-fg-label">高</span> <span class="text-market-up tabular-nums">{{ formatPrice(displayedData.high) }}</span></span>
            <span><span class="text-fg-label">低</span> <span class="text-market-down tabular-nums">{{ formatPrice(displayedData.low) }}</span></span>
            <span><span class="text-fg-label">收</span> <span class="text-fg-strong tabular-nums">{{ formatPrice(displayedData.close) }}</span></span>
            <span><span class="text-fg-label">量</span> <span class="text-fg-strong tabular-nums">{{ formatMobileVolume(displayedData.volume) }}</span></span>
            <span v-if="displayedMA5 !== null"><span class="text-series-gold">MA5</span> <span class="text-fg-strong tabular-nums">{{ displayedMA5.toFixed(2) }}</span></span>
            <span v-if="displayedMA10 !== null"><span class="text-series-cyan">MA10</span> <span class="text-fg-strong tabular-nums">{{ displayedMA10.toFixed(2) }}</span></span>
            <span v-if="displayedMA20 !== null"><span class="text-series-lavender">MA20</span> <span class="text-fg-strong tabular-nums">{{ displayedMA20.toFixed(2) }}</span></span>
          </div>

          <div class="flex-1 py-2 overflow-hidden min-h-0">
            <div class="border-y border-line overflow-hidden h-full">
              <MultiPaneChart :settings="indicatorSettings" :indicator-order="indicatorOrder" />
            </div>
          </div>

        </div>
      </div>
    </main>

    <IndicatorSettingsModal
      v-if="showSettings"
      v-model="indicatorSettings"
      @close="showSettings = false"
    />
  </div>
</template>
