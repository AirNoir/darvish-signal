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
import { trackEvent } from '../lib/analytics';

const router = useRouter();
const route = useRoute();
const store = useStockStore();
const showMobileAlphaPick = ref(false);
const showSettings = ref(false);
const showMobileMenu = ref(false);

const openIndicatorSettings = (source: 'desktop' | 'mobile') => {
  showSettings.value = true;
  showMobileMenu.value = false;
  trackEvent('indicator_settings_open', { source });
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

const indicatorSettings = ref<IndicatorSettings>({
  volume: true,
  turnoverRate: false,
  volumeMA: false,
  foreignNet: true,
  foreignNetMA: true,
  trustNet: false,
  foreignHoldingPct: false,
  instiHoldingPct: false,
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

const indicatorOrder = ref<string[]>([
  'volume',
  'foreignNet',
  'foreignNetMA',
  'volumeMA',
  'turnoverRate',
  'trustNet',
  'foreignHoldingPct',
  'instiHoldingPct',
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
  const change = latestData.value.close - previousData.value.close;
  const changePercent = (change / previousData.value.close) * 100;
  return {
    value: change,
    percent: changePercent,
    isPositive: change >= 0
  };
});

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
  <div class="relative flex flex-col h-screen bg-[#0f0f0f] overflow-hidden" style="height: 100vh; font-family: 'Noto Sans TC', system-ui, sans-serif;">
    <!-- Header -->
    <header class="h-14 min-h-[56px] md:h-10 md:min-h-[40px] flex items-center px-3 border-b border-[#333] bg-[#1a1a1a] flex-shrink-0 gap-2">
      <div class="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity" @click="goToHome">
        <img src="/logo.png" alt="達比 K-Zone" class="w-7 h-7 rounded-full" />
        <h1 class="text-sm font-semibold text-white hidden sm:block">達比 K-Zone</h1>
      </div>

      <div v-if="latestData" class="ml-auto flex items-center gap-x-2 gap-y-0 flex-wrap justify-end min-w-0">
        <span class="text-[#3b82f6] font-semibold text-sm">{{ store.stockId }}</span>
        <span
          v-if="store.stockName"
          class="text-[#f5b840] font-semibold text-base"
          style="text-shadow: 0 0 8px rgba(245, 184, 64, 0.35);"
        >{{ store.stockName }}</span>
        <span class="text-white text-sm font-medium">{{ latestData.close.toFixed(2) }}</span>
        <span
          v-if="priceChange"
          class="text-sm font-medium"
          :class="[priceChange.isPositive ? 'text-[#ef5350]' : 'text-[#26a69a]']"
        >
          {{ priceChange.isPositive ? '+' : '' }}{{ priceChange.value.toFixed(2) }}
          ({{ priceChange.percent.toFixed(2) }}%)
        </span>
      </div>

      <div :class="['hidden md:flex items-center gap-2', !latestData && 'ml-auto']">
        <button
          @click="openIndicatorSettings('desktop')"
          class="px-2 py-1 text-xs font-medium rounded transition-colors bg-[#333] text-[#aaa] hover:bg-[#444]"
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
        class="md:hidden p-1 text-[#aaa] hover:text-white transition-colors"
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
      class="md:hidden absolute top-10 left-0 right-0 bg-[#1a1a1a] border-b border-[#333] z-50 p-3 flex flex-col gap-2"
    >
      <SearchBar @stock-selected="showMobileMenu = false" />
      <button
        @click="openIndicatorSettings('mobile')"
        class="w-full px-3 py-1.5 text-xs font-medium rounded transition-colors bg-[#333] text-[#aaa] hover:bg-[#444] text-left"
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
          'w-full px-3 py-1.5 text-xs font-medium rounded transition-colors text-left',
          showMobileAlphaPick ? 'bg-[#e94560] text-white' : 'bg-[#333] text-[#aaa] hover:bg-[#444]'
        ]"
      >
        技術條件清單
      </button>

      <button
        @click="showMobileMenu = false"
        class="w-full mt-1 px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-medium rounded-lg transition-colors"
      >
        完成
      </button>
    </div>

    <!-- Main Content -->
    <main class="flex-1 flex overflow-hidden">
      <!-- Mobile Backdrop -->
      <div
        v-if="showMobileAlphaPick"
        class="md:hidden fixed inset-0 z-30 bg-black/40"
        @click="closeMobileAlphaPanel"
      ></div>

      <!-- Alpha Pick Panel -->
      <div
        :class="[
          'w-72 border-r border-[#333] flex-col flex-shrink-0 md:flex relative z-40 bg-[#0f0f0f]',
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
          class="mx-2 mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs"
        >
          {{ store.error }}
        </div>

        <div
          v-if="store.isLoading && store.stockData.length === 0"
          class="flex-1 flex items-center justify-center"
        >
          <div class="flex flex-col items-center gap-2">
            <svg class="w-6 h-6 text-[#3b82f6] animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-[#a0a0a0] text-xs">Loading...</span>
          </div>
        </div>

        <div v-else class="flex-1 py-2 overflow-hidden">
          <div class="border-y border-[#333] overflow-hidden h-full">
            <MultiPaneChart :settings="indicatorSettings" :indicator-order="indicatorOrder" />
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
