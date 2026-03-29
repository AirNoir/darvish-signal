<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { IChartApi, MouseEventParams } from 'lightweight-charts';
import type { IndicatorSettings } from '../types';
import { useStockStore } from '../stores/stockStore';
import { useChartSync } from '../composables/useChartSync';
import SearchBar from '../components/SearchBar.vue';
import KLineChart from '../components/KLineChart.vue';
import VolumeChart from '../components/VolumeChart.vue';
import KDChart from '../components/KDChart.vue';
import RSIChart from '../components/RSIChart.vue';
import MACDChart from '../components/MACDChart.vue';
import BollingerChart from '../components/BollingerChart.vue';
import ForeignNetChart from '../components/ForeignNetChart.vue';
import TrustNetChart from '../components/TrustNetChart.vue';
import TurnoverRateChart from '../components/TurnoverRateChart.vue';
import VolumeMAChart from '../components/VolumeMAChart.vue';
import ForeignNetMAChart from '../components/ForeignNetMAChart.vue';
import MarginBalanceChart from '../components/MarginBalanceChart.vue';
import ShortBalanceChart from '../components/ShortBalanceChart.vue';
import ShortMarginRatioChart from '../components/ShortMarginRatioChart.vue';
import AlphaPickPanel from '../components/AlphaPickPanel.vue';
import IndicatorSettingsModal from '../components/IndicatorSettings.vue';

const router = useRouter();
const store = useStockStore();
const { addChart, syncCrosshair } = useChartSync();
const showAlphaPick = ref(false);
const showSettings = ref(false);
const showMobileMenu = ref(false);

// Navigate back to landing page
const goToHome = () => {
  router.push('/');
};

// Indicator visibility settings - 預設只開啟 3 個重要指標
const indicatorSettings = ref<IndicatorSettings>({
  // 價量指標
  volume: true,
  turnoverRate: false,
  volumeMA: false,
  // 法人買賣
  foreignNet: true,
  foreignNetMA: true,
  trustNet: false,
  // 融資融券
  marginBalance: false,
  marginChange: false,
  shortBalance: false,
  shortChange: false,
  shortMarginRatio: false,
  // 技術指標
  rsi: false,
  macd: false,
  bollinger: false,
  kd: false,
});

// 指標排序順序 - 預設重要指標在前
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
  'bollinger',
]);

// 移動指標順序
const moveIndicator = (key: string, direction: 'up' | 'down') => {
  const index = indicatorOrder.value.indexOf(key);
  if (index === -1) return;

  const newIndex = direction === 'up' ? index - 1 : index + 1;
  if (newIndex < 0 || newIndex >= indicatorOrder.value.length) return;

  const newOrder = [...indicatorOrder.value];
  const temp = newOrder[index];
  newOrder[index] = newOrder[newIndex]!;
  newOrder[newIndex] = temp!;
  indicatorOrder.value = newOrder;
};

// 計算開啟的指標數量
const enabledIndicatorCount = computed(() => {
  let count = 0;
  if (indicatorSettings.value.volume) count++;
  if (indicatorSettings.value.turnoverRate) count++;
  if (indicatorSettings.value.volumeMA) count++;
  if (indicatorSettings.value.foreignNet) count++;
  if (indicatorSettings.value.foreignNetMA) count++;
  if (indicatorSettings.value.trustNet) count++;
  if (indicatorSettings.value.marginBalance || indicatorSettings.value.marginChange) count++;
  if (indicatorSettings.value.shortBalance || indicatorSettings.value.shortChange) count++;
  if (indicatorSettings.value.shortMarginRatio) count++;
  if (indicatorSettings.value.macd) count++;
  if (indicatorSettings.value.kd) count++;
  if (indicatorSettings.value.rsi) count++;
  if (indicatorSettings.value.bollinger) count++;
  return Math.min(count, 6); // 最多 6 個
});

// 監聽視窗大小變化
const windowHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 800);
const updateWindowHeight = () => {
  windowHeight.value = window.innerHeight;
};

// K 線圖高度 - 約 1/4 螢幕高度
const klineHeight = computed(() => {
  return Math.max(200, Math.floor(windowHeight.value * 0.25));
});

// 計算每個指標的高度
// 螢幕高度 - header - K線 - padding = 剩餘空間，除以指標數量
const indicatorHeight = computed(() => {
  const headerHeight = 40;
  const padding = 16; // p-2 = 8px * 2
  const gap = 4; // gap-1 = 4px
  const usedHeight = headerHeight + klineHeight.value + padding + (enabledIndicatorCount.value * gap);
  const remainingHeight = windowHeight.value - usedHeight;
  const count = enabledIndicatorCount.value || 1;
  return Math.max(80, Math.floor(remainingHeight / count));
});

// Computed for latest stock data
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

// Handle chart ready events - pass both chart and main series for crosshair sync
const handleChartReady = (chart: IChartApi, series?: any) => {
  addChart(chart, series);
};

// Handle crosshair move - 同步所有圖表的 tooltip
const handleCrosshairMove = (chart: IChartApi, param: MouseEventParams) => {
  syncCrosshair(chart, param);
  // 更新同步的 hover 時間（使用 store）
  store.setSyncedHoverTime(param.time ?? null);
};

// Load default stock on mount and setup resize listener
onMounted(() => {
  store.fetchStockData('2330');
  window.addEventListener('resize', updateWindowHeight);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowHeight);
});

// 取得可見的已排序指標
const sortedVisibleIndicators = computed(() => {
  return indicatorOrder.value.filter(key => {
    switch (key) {
      case 'volume': return indicatorSettings.value.volume;
      case 'turnoverRate': return indicatorSettings.value.turnoverRate;
      case 'volumeMA': return indicatorSettings.value.volumeMA;
      case 'foreignNet': return indicatorSettings.value.foreignNet;
      case 'foreignNetMA': return indicatorSettings.value.foreignNetMA;
      case 'trustNet': return indicatorSettings.value.trustNet;
      case 'margin': return indicatorSettings.value.marginBalance || indicatorSettings.value.marginChange;
      case 'short': return indicatorSettings.value.shortBalance || indicatorSettings.value.shortChange;
      case 'shortMarginRatio': return indicatorSettings.value.shortMarginRatio;
      case 'macd': return indicatorSettings.value.macd;
      case 'kd': return indicatorSettings.value.kd;
      case 'rsi': return indicatorSettings.value.rsi;
      case 'bollinger': return indicatorSettings.value.bollinger;
      default: return false;
    }
  }).slice(0, 6); // 最多 6 個
});
</script>

<template>
  <div class="relative flex flex-col h-screen bg-[#0f0f0f] overflow-hidden" style="height: 100vh;">
    <!-- Header - 縮小高度 -->
    <header class="h-10 min-h-[40px] flex items-center justify-between px-3 border-b border-[#333] bg-[#1a1a1a] flex-shrink-0">
      <!-- Left: Logo & Title -->
      <div class="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity" @click="goToHome">
        <img src="/logo.png" alt="達比 K-Zone" class="w-7 h-7 rounded-full" />
        <h1 class="text-sm font-semibold text-white hidden sm:block">達比 K-Zone</h1>
      </div>

      <!-- Center: Current Stock Info -->
      <div v-if="latestData" class="flex items-center gap-1.5 text-xs">
        <span class="text-[#3b82f6] font-medium">{{ store.stockId }}</span>
        <span v-if="store.stockName" class="text-[#888] hidden sm:inline">{{ store.stockName }}</span>
        <span class="text-white">{{ latestData.close.toFixed(2) }}</span>
        <span
          v-if="priceChange"
          :class="[
            priceChange.isPositive ? 'text-[#26a69a]' : 'text-[#ef5350]'
          ]"
        >
          {{ priceChange.isPositive ? '+' : '' }}{{ priceChange.value.toFixed(2) }}
          ({{ priceChange.percent.toFixed(2) }}%)
        </span>
      </div>

      <!-- Right: Desktop Menu -->
      <div class="hidden md:flex items-center gap-2">
        <!-- Indicator Settings Toggle -->
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

        <!-- Alpha Signal Toggle -->
        <button
          @click="showAlphaPick = !showAlphaPick"
          :class="[
            'px-2 py-1 text-xs font-medium rounded transition-colors',
            showAlphaPick ? 'bg-[#e94560] text-white' : 'bg-[#333] text-[#aaa] hover:bg-[#444]'
          ]"
        >
          Alpha
        </button>

        <SearchBar />
      </div>

      <!-- Right: Mobile Hamburger -->
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
        @click="showAlphaPick = !showAlphaPick; showMobileMenu = false"
        :class="[
          'w-full px-3 py-1.5 text-xs font-medium rounded transition-colors text-left',
          showAlphaPick ? 'bg-[#e94560] text-white' : 'bg-[#333] text-[#aaa] hover:bg-[#444]'
        ]"
      >
        Alpha 訊號
      </button>
    </div>

    <!-- Main Content -->
    <main class="flex-1 flex overflow-hidden">
      <!-- Alpha Pick Panel (Left Sidebar) -->
      <div
        v-if="showAlphaPick"
        class="w-72 border-r border-[#333] overflow-y-auto flex-shrink-0"
      >
        <AlphaPickPanel />
      </div>

      <!-- Charts Area -->
      <div class="flex-1 flex flex-col overflow-hidden relative">
        <!-- Error Message -->
        <div
          v-if="store.error"
          class="mx-2 mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs"
        >
          {{ store.error }}
        </div>

        <!-- Loading State -->
        <div
          v-if="store.isLoading && store.stockData.length === 0"
          class="flex-1 flex items-center justify-center"
        >
          <div class="flex flex-col items-center gap-2">
            <svg
              class="w-6 h-6 text-[#3b82f6] animate-spin"
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
            <span class="text-[#a0a0a0] text-xs">Loading...</span>
          </div>
        </div>

        <!-- Charts Container - 無捲動，高度自適應 -->
        <div v-else ref="chartsContainer" class="flex-1 flex flex-col p-2 gap-1 overflow-hidden">
          <!-- K-Line Chart (main chart) - 縮小高度 -->
          <div class="border border-[#333] rounded overflow-hidden flex-shrink-0" :style="{ height: klineHeight + 'px', minHeight: klineHeight + 'px' }">
            <KLineChart
              :on-chart-ready="handleChartReady"
              :on-crosshair-move="handleCrosshairMove"
            />
          </div>

          <!-- 動態排序的指標列表 -->
          <template v-for="(key, index) in sortedVisibleIndicators" :key="key">
            <!-- 成交量 -->
            <div v-if="key === 'volume'" class="border border-[#333] rounded overflow-visible flex-shrink-0 relative group" :style="{ height: indicatorHeight + 'px' }">
              <VolumeChart :on-chart-ready="handleChartReady" :on-crosshair-move="handleCrosshairMove" />
              <!-- 排序按鈕 -->
              <div class="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button v-if="index > 0" @click.stop="moveIndicator('volume', 'up')" class="w-5 h-5 bg-[#333] hover:bg-[#444] rounded flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
                </button>
                <button v-if="index < sortedVisibleIndicators.length - 1" @click.stop="moveIndicator('volume', 'down')" class="w-5 h-5 bg-[#333] hover:bg-[#444] rounded flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
              </div>
            </div>

            <!-- 週轉率 -->
            <div v-else-if="key === 'turnoverRate'" class="border border-[#333] rounded overflow-visible flex-shrink-0 relative group" :style="{ height: indicatorHeight + 'px' }">
              <TurnoverRateChart :on-chart-ready="handleChartReady" :on-crosshair-move="handleCrosshairMove" />
              <div class="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button v-if="index > 0" @click.stop="moveIndicator('turnoverRate', 'up')" class="w-5 h-5 bg-[#333] hover:bg-[#444] rounded flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
                </button>
                <button v-if="index < sortedVisibleIndicators.length - 1" @click.stop="moveIndicator('turnoverRate', 'down')" class="w-5 h-5 bg-[#333] hover:bg-[#444] rounded flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
              </div>
            </div>

            <!-- 成交均量 -->
            <div v-else-if="key === 'volumeMA'" class="border border-[#333] rounded overflow-visible flex-shrink-0 relative group" :style="{ height: indicatorHeight + 'px' }">
              <VolumeMAChart :on-chart-ready="handleChartReady" :on-crosshair-move="handleCrosshairMove" />
              <div class="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button v-if="index > 0" @click.stop="moveIndicator('volumeMA', 'up')" class="w-5 h-5 bg-[#333] hover:bg-[#444] rounded flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
                </button>
                <button v-if="index < sortedVisibleIndicators.length - 1" @click.stop="moveIndicator('volumeMA', 'down')" class="w-5 h-5 bg-[#333] hover:bg-[#444] rounded flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
              </div>
            </div>

            <!-- 外資買賣超 -->
            <div v-else-if="key === 'foreignNet'" class="border border-[#333] rounded overflow-visible flex-shrink-0 relative group" :style="{ height: indicatorHeight + 'px' }">
              <ForeignNetChart :on-chart-ready="handleChartReady" :on-crosshair-move="handleCrosshairMove" />
              <div class="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button v-if="index > 0" @click.stop="moveIndicator('foreignNet', 'up')" class="w-5 h-5 bg-[#333] hover:bg-[#444] rounded flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
                </button>
                <button v-if="index < sortedVisibleIndicators.length - 1" @click.stop="moveIndicator('foreignNet', 'down')" class="w-5 h-5 bg-[#333] hover:bg-[#444] rounded flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
              </div>
            </div>

            <!-- 外資買超均線 -->
            <div v-else-if="key === 'foreignNetMA'" class="border border-[#333] rounded overflow-visible flex-shrink-0 relative group" :style="{ height: indicatorHeight + 'px' }">
              <ForeignNetMAChart :on-chart-ready="handleChartReady" :on-crosshair-move="handleCrosshairMove" />
              <div class="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button v-if="index > 0" @click.stop="moveIndicator('foreignNetMA', 'up')" class="w-5 h-5 bg-[#333] hover:bg-[#444] rounded flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
                </button>
                <button v-if="index < sortedVisibleIndicators.length - 1" @click.stop="moveIndicator('foreignNetMA', 'down')" class="w-5 h-5 bg-[#333] hover:bg-[#444] rounded flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
              </div>
            </div>

            <!-- 投信買賣超 -->
            <div v-else-if="key === 'trustNet'" class="border border-[#333] rounded overflow-visible flex-shrink-0 relative group" :style="{ height: indicatorHeight + 'px' }">
              <TrustNetChart :on-chart-ready="handleChartReady" :on-crosshair-move="handleCrosshairMove" />
              <div class="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button v-if="index > 0" @click.stop="moveIndicator('trustNet', 'up')" class="w-5 h-5 bg-[#333] hover:bg-[#444] rounded flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
                </button>
                <button v-if="index < sortedVisibleIndicators.length - 1" @click.stop="moveIndicator('trustNet', 'down')" class="w-5 h-5 bg-[#333] hover:bg-[#444] rounded flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
              </div>
            </div>

            <!-- 融資 -->
            <div v-else-if="key === 'margin'" class="border border-[#333] rounded overflow-visible flex-shrink-0 relative group" :style="{ height: indicatorHeight + 'px' }">
              <MarginBalanceChart
                :on-chart-ready="handleChartReady"
                :on-crosshair-move="handleCrosshairMove"
                :show-balance="indicatorSettings.marginBalance"
                :show-change="indicatorSettings.marginChange"
              />
              <div class="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button v-if="index > 0" @click.stop="moveIndicator('margin', 'up')" class="w-5 h-5 bg-[#333] hover:bg-[#444] rounded flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
                </button>
                <button v-if="index < sortedVisibleIndicators.length - 1" @click.stop="moveIndicator('margin', 'down')" class="w-5 h-5 bg-[#333] hover:bg-[#444] rounded flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
              </div>
            </div>

            <!-- 融券 -->
            <div v-else-if="key === 'short'" class="border border-[#333] rounded overflow-visible flex-shrink-0 relative group" :style="{ height: indicatorHeight + 'px' }">
              <ShortBalanceChart
                :on-chart-ready="handleChartReady"
                :on-crosshair-move="handleCrosshairMove"
                :show-balance="indicatorSettings.shortBalance"
                :show-change="indicatorSettings.shortChange"
              />
              <div class="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button v-if="index > 0" @click.stop="moveIndicator('short', 'up')" class="w-5 h-5 bg-[#333] hover:bg-[#444] rounded flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
                </button>
                <button v-if="index < sortedVisibleIndicators.length - 1" @click.stop="moveIndicator('short', 'down')" class="w-5 h-5 bg-[#333] hover:bg-[#444] rounded flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
              </div>
            </div>

            <!-- 券資比 -->
            <div v-else-if="key === 'shortMarginRatio'" class="border border-[#333] rounded overflow-visible flex-shrink-0 relative group" :style="{ height: indicatorHeight + 'px' }">
              <ShortMarginRatioChart :on-chart-ready="handleChartReady" :on-crosshair-move="handleCrosshairMove" />
              <div class="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button v-if="index > 0" @click.stop="moveIndicator('shortMarginRatio', 'up')" class="w-5 h-5 bg-[#333] hover:bg-[#444] rounded flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
                </button>
                <button v-if="index < sortedVisibleIndicators.length - 1" @click.stop="moveIndicator('shortMarginRatio', 'down')" class="w-5 h-5 bg-[#333] hover:bg-[#444] rounded flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
              </div>
            </div>

            <!-- MACD -->
            <div v-else-if="key === 'macd'" class="border border-[#333] rounded overflow-visible flex-shrink-0 relative group" :style="{ height: indicatorHeight + 'px' }">
              <MACDChart :on-chart-ready="handleChartReady" :on-crosshair-move="handleCrosshairMove" />
              <div class="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button v-if="index > 0" @click.stop="moveIndicator('macd', 'up')" class="w-5 h-5 bg-[#333] hover:bg-[#444] rounded flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
                </button>
                <button v-if="index < sortedVisibleIndicators.length - 1" @click.stop="moveIndicator('macd', 'down')" class="w-5 h-5 bg-[#333] hover:bg-[#444] rounded flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
              </div>
            </div>

            <!-- KD -->
            <div v-else-if="key === 'kd'" class="border border-[#333] rounded overflow-visible flex-shrink-0 relative group" :style="{ height: indicatorHeight + 'px' }">
              <KDChart :on-chart-ready="handleChartReady" :on-crosshair-move="handleCrosshairMove" />
              <div class="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button v-if="index > 0" @click.stop="moveIndicator('kd', 'up')" class="w-5 h-5 bg-[#333] hover:bg-[#444] rounded flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
                </button>
                <button v-if="index < sortedVisibleIndicators.length - 1" @click.stop="moveIndicator('kd', 'down')" class="w-5 h-5 bg-[#333] hover:bg-[#444] rounded flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
              </div>
            </div>

            <!-- RSI -->
            <div v-else-if="key === 'rsi'" class="border border-[#333] rounded overflow-visible flex-shrink-0 relative group" :style="{ height: indicatorHeight + 'px' }">
              <RSIChart :on-chart-ready="handleChartReady" :on-crosshair-move="handleCrosshairMove" />
              <div class="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button v-if="index > 0" @click.stop="moveIndicator('rsi', 'up')" class="w-5 h-5 bg-[#333] hover:bg-[#444] rounded flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
                </button>
                <button v-if="index < sortedVisibleIndicators.length - 1" @click.stop="moveIndicator('rsi', 'down')" class="w-5 h-5 bg-[#333] hover:bg-[#444] rounded flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
              </div>
            </div>

            <!-- 布林通道 -->
            <div v-else-if="key === 'bollinger'" class="border border-[#333] rounded overflow-visible flex-shrink-0 relative group" :style="{ height: indicatorHeight + 'px' }">
              <BollingerChart :on-chart-ready="handleChartReady" :on-crosshair-move="handleCrosshairMove" />
              <div class="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button v-if="index > 0" @click.stop="moveIndicator('bollinger', 'up')" class="w-5 h-5 bg-[#333] hover:bg-[#444] rounded flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
                </button>
                <button v-if="index < sortedVisibleIndicators.length - 1" @click.stop="moveIndicator('bollinger', 'down')" class="w-5 h-5 bg-[#333] hover:bg-[#444] rounded flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </main>

    <!-- Indicator Settings Modal -->
    <IndicatorSettingsModal
      v-if="showSettings"
      v-model="indicatorSettings"
      @close="showSettings = false"
    />
  </div>
</template>
