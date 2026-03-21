<script setup lang="ts">
import { onMounted, computed, ref, reactive } from 'vue';
import type { IChartApi, MouseEventParams } from 'lightweight-charts';
import type { IndicatorSettings } from './types';
import { useStockStore } from './stores/stockStore';
import { useChartSync } from './composables/useChartSync';
import SearchBar from './components/SearchBar.vue';
import KLineChart from './components/KLineChart.vue';
import VolumeChart from './components/VolumeChart.vue';
import KDChart from './components/KDChart.vue';
import RSIChart from './components/RSIChart.vue';
import MACDChart from './components/MACDChart.vue';
import BollingerChart from './components/BollingerChart.vue';
import ForeignNetChart from './components/ForeignNetChart.vue';
import TrustNetChart from './components/TrustNetChart.vue';
import TurnoverRateChart from './components/TurnoverRateChart.vue';
import VolumeMAChart from './components/VolumeMAChart.vue';
import MarginBalanceChart from './components/MarginBalanceChart.vue';
import ShortBalanceChart from './components/ShortBalanceChart.vue';
import ShortMarginRatioChart from './components/ShortMarginRatioChart.vue';
import AlphaPickPanel from './components/AlphaPickPanel.vue';
import IndicatorSettingsModal from './components/IndicatorSettings.vue';

const store = useStockStore();
const { addChart, syncCrosshair } = useChartSync();
const showAlphaPick = ref(false);
const showSettings = ref(false);
const showMobileMenu = ref(false);
const chartsContainer = ref<HTMLElement | null>(null);

// Indicator visibility settings - 預設開啟的指標
const indicatorSettings = ref<IndicatorSettings>({
  // 價量指標
  volume: true,
  turnoverRate: false,
  volumeMA: false,
  // 法人買賣
  foreignNet: true,
  trustNet: true,
  // 融資融券
  marginBalance: false,
  marginChange: false,
  shortBalance: false,
  shortChange: false,
  shortMarginRatio: false,
  // 技術指標
  rsi: true,
  macd: true,
  bollinger: true,
  kd: true,
});

// 圖表摺疊狀態 - 預設全部展開
const collapsed = reactive<Record<string, boolean>>({
  volume: false,
  turnoverRate: false,
  volumeMA: false,
  foreignNet: false,
  trustNet: false,
  margin: false,
  short: false,
  shortMarginRatio: false,
  macd: false,
  kd: false,
  rsi: false,
  bollinger: false,
});

const toggleCollapse = (key: string) => {
  collapsed[key] = !collapsed[key];
};

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

// Handle crosshair move
const handleCrosshairMove = (chart: IChartApi, param: MouseEventParams) => {
  syncCrosshair(chart, param);
};

// Scroll functions
const scrollUp = () => {
  if (chartsContainer.value) {
    chartsContainer.value.scrollBy({ top: -150, behavior: 'smooth' });
  }
};

const scrollDown = () => {
  if (chartsContainer.value) {
    chartsContainer.value.scrollBy({ top: 150, behavior: 'smooth' });
  }
};

// Load default stock on mount
onMounted(() => {
  store.fetchStockData('2330');
});
</script>

<template>
  <div class="relative flex flex-col h-screen bg-[#0f0f0f]">
    <!-- Header -->
    <header class="h-14 min-h-[56px] flex items-center justify-between px-4 border-b border-[#333] bg-[#1a1a1a]">
      <!-- Left: Logo & Title -->
      <div class="flex items-center gap-3">
        <svg class="w-8 h-8 text-[#3b82f6]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 17L9 11L13 15L21 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M17 7H21V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h1 class="text-lg font-semibold text-white hidden sm:block">達比訊號</h1>
      </div>

      <!-- Center: Current Stock Info + Time Interval -->
      <div class="flex items-center gap-3">
        <div v-if="latestData" class="flex items-center gap-2 text-sm">
          <span class="text-[#3b82f6] font-medium">{{ store.stockId }}</span>
          <span v-if="store.stockName" class="text-[#888] hidden sm:inline">{{ store.stockName }}</span>
          <span class="text-white">{{ latestData.close.toFixed(2) }}</span>
          <span
            v-if="priceChange"
            :class="[
              'text-xs',
              priceChange.isPositive ? 'text-[#26a69a]' : 'text-[#ef5350]'
            ]"
          >
            {{ priceChange.isPositive ? '+' : '' }}{{ priceChange.value.toFixed(2) }}
            ({{ priceChange.percent.toFixed(2) }}%)
          </span>
        </div>
        <!-- Time Interval Selector -->
        <div class="flex items-center bg-[#252525] rounded-lg p-0.5">
          <button
            v-for="interval in (['daily', 'weekly', 'monthly'] as const)"
            :key="interval"
            @click="store.setTimeInterval(interval)"
            :class="[
              'px-2 py-1 text-xs font-medium rounded transition-colors',
              store.timeInterval === interval
                ? 'bg-[#3b82f6] text-white'
                : 'text-[#888] hover:text-white'
            ]"
          >
            {{ interval === 'daily' ? '日' : interval === 'weekly' ? '週' : '月' }}
          </button>
        </div>
      </div>

      <!-- Right: Desktop Menu -->
      <div class="hidden md:flex items-center gap-4">
        <!-- Indicator Settings Toggle -->
        <button
          @click="showSettings = true"
          class="px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-[#333] text-[#aaa] hover:bg-[#444]"
        >
          <span class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            指標設定
          </span>
        </button>

        <!-- Alpha Signal Toggle -->
        <button
          @click="showAlphaPick = !showAlphaPick"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            showAlphaPick ? 'bg-[#e94560] text-white' : 'bg-[#333] text-[#aaa] hover:bg-[#444]'
          ]"
        >
          Alpha 訊號
        </button>

        <SearchBar />
      </div>

      <!-- Right: Mobile Hamburger -->
      <button
        @click="showMobileMenu = !showMobileMenu"
        class="md:hidden p-2 text-[#aaa] hover:text-white transition-colors"
      >
        <svg v-if="!showMobileMenu" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </header>

    <!-- Mobile Menu Dropdown -->
    <div
      v-if="showMobileMenu"
      class="md:hidden absolute top-14 left-0 right-0 bg-[#1a1a1a] border-b border-[#333] z-50 p-4 flex flex-col gap-3"
    >
      <SearchBar />
      <!-- Time Interval Selector (Mobile) -->
      <div class="flex items-center justify-center bg-[#252525] rounded-lg p-1">
        <button
          v-for="interval in (['daily', 'weekly', 'monthly'] as const)"
          :key="interval"
          @click="store.setTimeInterval(interval); showMobileMenu = false"
          :class="[
            'flex-1 px-3 py-2 text-sm font-medium rounded transition-colors',
            store.timeInterval === interval
              ? 'bg-[#3b82f6] text-white'
              : 'text-[#888] hover:text-white'
          ]"
        >
          {{ interval === 'daily' ? '日線' : interval === 'weekly' ? '週線' : '月線' }}
        </button>
      </div>
      <button
        @click="showSettings = true; showMobileMenu = false"
        class="w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-[#333] text-[#aaa] hover:bg-[#444] text-left"
      >
        <span class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          指標設定
        </span>
      </button>
      <button
        @click="showAlphaPick = !showAlphaPick; showMobileMenu = false"
        :class="[
          'w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors text-left',
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
        class="w-80 border-r border-[#333] overflow-y-auto"
      >
        <AlphaPickPanel />
      </div>

      <!-- Charts Area -->
      <div class="flex-1 flex flex-col overflow-hidden relative">
        <!-- Error Message -->
        <div
          v-if="store.error"
          class="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
        >
          {{ store.error }}
        </div>

        <!-- Loading State -->
        <div
          v-if="store.isLoading && store.stockData.length === 0"
          class="flex-1 flex items-center justify-center"
        >
          <div class="flex flex-col items-center gap-3">
            <svg
              class="w-8 h-8 text-[#3b82f6] animate-spin"
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
            <span class="text-[#a0a0a0] text-sm">Loading stock data...</span>
          </div>
        </div>

        <!-- Charts Container -->
        <div v-else ref="chartsContainer" class="flex-1 flex flex-col p-4 gap-1 overflow-y-auto">
          <!-- K-Line Chart (main chart) - always visible, not collapsible -->
          <div class="min-h-[280px] h-[280px] border border-[#333] rounded-lg overflow-hidden flex-shrink-0">
            <KLineChart
              :on-chart-ready="handleChartReady"
              :on-crosshair-move="handleCrosshairMove"
            />
          </div>

          <!-- 成交量 -->
          <div v-if="indicatorSettings.volume" class="border border-[#333] rounded-lg overflow-hidden flex-shrink-0">
            <div
              class="flex items-center justify-between px-3 py-1.5 bg-[#1a1a1a] cursor-pointer hover:bg-[#222] transition-colors select-none"
              @click="toggleCollapse('volume')"
            >
              <div class="flex items-center gap-2 text-xs">
                <span class="text-white font-bold">成交量</span>
              </div>
              <svg :class="['w-4 h-4 text-[#666] transition-transform', collapsed.volume ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </div>
            <div v-show="!collapsed.volume" class="h-[120px]">
              <VolumeChart :on-chart-ready="handleChartReady" :on-crosshair-move="handleCrosshairMove" />
            </div>
          </div>

          <!-- 週轉率 -->
          <div v-if="indicatorSettings.turnoverRate" class="border border-[#333] rounded-lg overflow-hidden flex-shrink-0">
            <div
              class="flex items-center justify-between px-3 py-1.5 bg-[#1a1a1a] cursor-pointer hover:bg-[#222] transition-colors select-none"
              @click="toggleCollapse('turnoverRate')"
            >
              <div class="flex items-center gap-2 text-xs">
                <span class="text-white font-bold">週轉率</span>
                <span class="text-[#8b5cf6]">%</span>
              </div>
              <svg :class="['w-4 h-4 text-[#666] transition-transform', collapsed.turnoverRate ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </div>
            <div v-show="!collapsed.turnoverRate" class="h-[120px]">
              <TurnoverRateChart :on-chart-ready="handleChartReady" :on-crosshair-move="handleCrosshairMove" />
            </div>
          </div>

          <!-- 成交均量 -->
          <div v-if="indicatorSettings.volumeMA" class="border border-[#333] rounded-lg overflow-hidden flex-shrink-0">
            <div
              class="flex items-center justify-between px-3 py-1.5 bg-[#1a1a1a] cursor-pointer hover:bg-[#222] transition-colors select-none"
              @click="toggleCollapse('volumeMA')"
            >
              <div class="flex items-center gap-2 text-xs">
                <span class="text-white font-bold">成交均量</span>
                <span class="text-[#f59e0b]">5日</span>
                <span class="text-[#3b82f6]">10日</span>
                <span class="text-[#8b5cf6]">20日</span>
              </div>
              <svg :class="['w-4 h-4 text-[#666] transition-transform', collapsed.volumeMA ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </div>
            <div v-show="!collapsed.volumeMA" class="h-[120px]">
              <VolumeMAChart :on-chart-ready="handleChartReady" :on-crosshair-move="handleCrosshairMove" />
            </div>
          </div>

          <!-- 外資買賣超 -->
          <div v-if="indicatorSettings.foreignNet" class="border border-[#333] rounded-lg overflow-hidden flex-shrink-0">
            <div
              class="flex items-center justify-between px-3 py-1.5 bg-[#1a1a1a] cursor-pointer hover:bg-[#222] transition-colors select-none"
              @click="toggleCollapse('foreignNet')"
            >
              <div class="flex items-center gap-2 text-xs">
                <span class="text-white font-bold">外資買賣超</span>
              </div>
              <svg :class="['w-4 h-4 text-[#666] transition-transform', collapsed.foreignNet ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </div>
            <div v-show="!collapsed.foreignNet" class="h-[120px]">
              <ForeignNetChart :on-chart-ready="handleChartReady" :on-crosshair-move="handleCrosshairMove" />
            </div>
          </div>

          <!-- 投信買賣超 -->
          <div v-if="indicatorSettings.trustNet" class="border border-[#333] rounded-lg overflow-hidden flex-shrink-0">
            <div
              class="flex items-center justify-between px-3 py-1.5 bg-[#1a1a1a] cursor-pointer hover:bg-[#222] transition-colors select-none"
              @click="toggleCollapse('trustNet')"
            >
              <div class="flex items-center gap-2 text-xs">
                <span class="text-white font-bold">投信買賣超</span>
              </div>
              <svg :class="['w-4 h-4 text-[#666] transition-transform', collapsed.trustNet ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </div>
            <div v-show="!collapsed.trustNet" class="h-[120px]">
              <TrustNetChart :on-chart-ready="handleChartReady" :on-crosshair-move="handleCrosshairMove" />
            </div>
          </div>

          <!-- 融資 -->
          <div v-if="indicatorSettings.marginBalance || indicatorSettings.marginChange" class="border border-[#333] rounded-lg overflow-hidden flex-shrink-0">
            <div
              class="flex items-center justify-between px-3 py-1.5 bg-[#1a1a1a] cursor-pointer hover:bg-[#222] transition-colors select-none"
              @click="toggleCollapse('margin')"
            >
              <div class="flex items-center gap-2 text-xs">
                <span class="text-white font-bold">融資</span>
                <span v-if="indicatorSettings.marginBalance" class="text-[#f59e0b]">餘額</span>
                <span v-if="indicatorSettings.marginChange" class="text-[#888]">增減</span>
              </div>
              <svg :class="['w-4 h-4 text-[#666] transition-transform', collapsed.margin ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </div>
            <div v-show="!collapsed.margin" class="h-[120px]">
              <MarginBalanceChart
                :on-chart-ready="handleChartReady"
                :on-crosshair-move="handleCrosshairMove"
                :show-balance="indicatorSettings.marginBalance"
                :show-change="indicatorSettings.marginChange"
              />
            </div>
          </div>

          <!-- 融券 -->
          <div v-if="indicatorSettings.shortBalance || indicatorSettings.shortChange" class="border border-[#333] rounded-lg overflow-hidden flex-shrink-0">
            <div
              class="flex items-center justify-between px-3 py-1.5 bg-[#1a1a1a] cursor-pointer hover:bg-[#222] transition-colors select-none"
              @click="toggleCollapse('short')"
            >
              <div class="flex items-center gap-2 text-xs">
                <span class="text-white font-bold">融券</span>
                <span v-if="indicatorSettings.shortBalance" class="text-[#06b6d4]">餘額</span>
                <span v-if="indicatorSettings.shortChange" class="text-[#888]">增減</span>
              </div>
              <svg :class="['w-4 h-4 text-[#666] transition-transform', collapsed.short ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </div>
            <div v-show="!collapsed.short" class="h-[120px]">
              <ShortBalanceChart
                :on-chart-ready="handleChartReady"
                :on-crosshair-move="handleCrosshairMove"
                :show-balance="indicatorSettings.shortBalance"
                :show-change="indicatorSettings.shortChange"
              />
            </div>
          </div>

          <!-- 券資比 -->
          <div v-if="indicatorSettings.shortMarginRatio" class="border border-[#333] rounded-lg overflow-hidden flex-shrink-0">
            <div
              class="flex items-center justify-between px-3 py-1.5 bg-[#1a1a1a] cursor-pointer hover:bg-[#222] transition-colors select-none"
              @click="toggleCollapse('shortMarginRatio')"
            >
              <div class="flex items-center gap-2 text-xs">
                <span class="text-white font-bold">券資比</span>
                <span class="text-[#ec4899]">%</span>
              </div>
              <svg :class="['w-4 h-4 text-[#666] transition-transform', collapsed.shortMarginRatio ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </div>
            <div v-show="!collapsed.shortMarginRatio" class="h-[120px]">
              <ShortMarginRatioChart :on-chart-ready="handleChartReady" :on-crosshair-move="handleCrosshairMove" />
            </div>
          </div>

          <!-- MACD -->
          <div v-if="indicatorSettings.macd" class="border border-[#333] rounded-lg overflow-hidden flex-shrink-0">
            <div
              class="flex items-center justify-between px-3 py-1.5 bg-[#1a1a1a] cursor-pointer hover:bg-[#222] transition-colors select-none"
              @click="toggleCollapse('macd')"
            >
              <div class="flex items-center gap-2 text-xs">
                <span class="text-white font-bold">MACD</span>
                <span class="text-[#3b82f6]">DIF</span>
                <span class="text-[#f59e0b]">DEA</span>
                <span class="text-[#888]">柱</span>
              </div>
              <svg :class="['w-4 h-4 text-[#666] transition-transform', collapsed.macd ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </div>
            <div v-show="!collapsed.macd" class="h-[120px]">
              <MACDChart :on-chart-ready="handleChartReady" :on-crosshair-move="handleCrosshairMove" />
            </div>
          </div>

          <!-- KD -->
          <div v-if="indicatorSettings.kd" class="border border-[#333] rounded-lg overflow-hidden flex-shrink-0">
            <div
              class="flex items-center justify-between px-3 py-1.5 bg-[#1a1a1a] cursor-pointer hover:bg-[#222] transition-colors select-none"
              @click="toggleCollapse('kd')"
            >
              <div class="flex items-center gap-2 text-xs">
                <span class="text-white font-bold">KD</span>
                <span class="text-[#3b82f6]">K</span>
                <span class="text-[#f59e0b]">D</span>
              </div>
              <svg :class="['w-4 h-4 text-[#666] transition-transform', collapsed.kd ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </div>
            <div v-show="!collapsed.kd" class="h-[120px]">
              <KDChart :on-chart-ready="handleChartReady" :on-crosshair-move="handleCrosshairMove" />
            </div>
          </div>

          <!-- RSI -->
          <div v-if="indicatorSettings.rsi" class="border border-[#333] rounded-lg overflow-hidden flex-shrink-0">
            <div
              class="flex items-center justify-between px-3 py-1.5 bg-[#1a1a1a] cursor-pointer hover:bg-[#222] transition-colors select-none"
              @click="toggleCollapse('rsi')"
            >
              <div class="flex items-center gap-2 text-xs">
                <span class="text-white font-bold">RSI</span>
                <span class="text-[#22c55e]">9</span>
                <span class="text-[#ef4444]">14</span>
              </div>
              <svg :class="['w-4 h-4 text-[#666] transition-transform', collapsed.rsi ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </div>
            <div v-show="!collapsed.rsi" class="h-[120px]">
              <RSIChart :on-chart-ready="handleChartReady" :on-crosshair-move="handleCrosshairMove" />
            </div>
          </div>

          <!-- 布林通道 -->
          <div v-if="indicatorSettings.bollinger" class="border border-[#333] rounded-lg overflow-hidden flex-shrink-0">
            <div
              class="flex items-center justify-between px-3 py-1.5 bg-[#1a1a1a] cursor-pointer hover:bg-[#222] transition-colors select-none"
              @click="toggleCollapse('bollinger')"
            >
              <div class="flex items-center gap-2 text-xs">
                <span class="text-white font-bold">布林通道</span>
                <span class="text-[#a855f7]">%B</span>
              </div>
              <svg :class="['w-4 h-4 text-[#666] transition-transform', collapsed.bollinger ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </div>
            <div v-show="!collapsed.bollinger" class="h-[120px]">
              <BollingerChart :on-chart-ready="handleChartReady" :on-crosshair-move="handleCrosshairMove" />
            </div>
          </div>
        </div>

        <!-- Scroll Buttons -->
        <div class="absolute right-6 bottom-6 flex flex-col gap-2">
          <button
            @click="scrollUp"
            class="w-10 h-10 rounded-full bg-[#333] hover:bg-[#444] text-white flex items-center justify-center shadow-lg transition-colors"
            title="向上滾動"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            @click="scrollDown"
            class="w-10 h-10 rounded-full bg-[#333] hover:bg-[#444] text-white flex items-center justify-center shadow-lg transition-colors"
            title="向下滾動"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
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
