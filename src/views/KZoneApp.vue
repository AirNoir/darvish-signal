<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { IndicatorSettings } from '../types';
import { useStockStore } from '../stores/stockStore';
import SearchBar from '../components/SearchBar.vue';
import MultiPaneChart from '../components/MultiPaneChart.vue';
import AlphaPickPanel from '../components/AlphaPickPanel.vue';
import IndicatorSettingsModal from '../components/IndicatorSettings.vue';

const router = useRouter();
const store = useStockStore();
const showMobileAlphaPick = ref(false);
const showSettings = ref(false);
const showMobileMenu = ref(false);

const goToHome = () => {
  router.push('/');
};

const onAlphaStockSelected = () => {
  if (window.innerWidth < 768) {
    showMobileAlphaPick.value = false;
  }
};

const indicatorSettings = ref<IndicatorSettings>({
  volume: true,
  turnoverRate: false,
  volumeMA: false,
  foreignNet: true,
  foreignNetMA: true,
  trustNet: false,
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

onMounted(() => {
  store.fetchStockData('2330');
});
</script>

<template>
  <div class="relative flex flex-col h-screen bg-[#0f0f0f] overflow-hidden" style="height: 100vh;">
    <!-- Header -->
    <header class="h-10 min-h-[40px] flex items-center justify-between px-3 border-b border-[#333] bg-[#1a1a1a] flex-shrink-0">
      <div class="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity" @click="goToHome">
        <img src="/logo.png" alt="達比 K-Zone" class="w-7 h-7 rounded-full" />
        <h1 class="text-sm font-semibold text-white hidden sm:block">達比 K-Zone</h1>
      </div>

      <div v-if="latestData" class="flex items-center gap-1.5 text-xs">
        <span class="text-[#3b82f6] font-medium">{{ store.stockId }}</span>
        <span v-if="store.stockName" class="text-[#888]">{{ store.stockName }}</span>
        <span class="text-white">{{ latestData.close.toFixed(2) }}</span>
        <span
          v-if="priceChange"
          :class="[priceChange.isPositive ? 'text-[#ef5350]' : 'text-[#26a69a]']"
        >
          {{ priceChange.isPositive ? '+' : '' }}{{ priceChange.value.toFixed(2) }}
          ({{ priceChange.percent.toFixed(2) }}%)
        </span>
      </div>

      <div class="hidden md:flex items-center gap-2">
        <button
          @click="showSettings = true"
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
      <SearchBar />
      <button
        @click="showSettings = true; showMobileMenu = false"
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
    </div>

    <!-- Main Content -->
    <main class="flex-1 flex overflow-hidden">
      <!-- Alpha Pick Panel -->
      <div
        :class="[
          'w-72 border-r border-[#333] overflow-y-auto flex-shrink-0 md:block',
          showMobileAlphaPick ? 'block' : 'hidden'
        ]"
      >
        <AlphaPickPanel @stock-selected="onAlphaStockSelected" />
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

        <div v-else class="flex-1 p-2 overflow-hidden">
          <div class="border border-[#333] rounded overflow-hidden h-full">
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
