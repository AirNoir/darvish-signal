<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import type { IChartApi, MouseEventParams } from 'lightweight-charts';
import { useStockStore } from './stores/stockStore';
import { useChartSync } from './composables/useChartSync';
import SearchBar from './components/SearchBar.vue';
import KLineChart from './components/KLineChart.vue';
import VolumeChart from './components/VolumeChart.vue';
import KDChart from './components/KDChart.vue';
import RSIChart from './components/RSIChart.vue';
import MACDChart from './components/MACDChart.vue';
import BollingerChart from './components/BollingerChart.vue';
import InstitutionalChart from './components/InstitutionalChart.vue';
import AlphaPickPanel from './components/AlphaPickPanel.vue';
import IndicatorSettings from './components/IndicatorSettings.vue';

const store = useStockStore();
const { addChart, syncCrosshair } = useChartSync();
const showAlphaPick = ref(false);
const showSettings = ref(false);

// Indicator visibility settings
const indicatorSettings = ref({
  volume: true,
  institutional: true,
  macd: true,
  kd: true,
  rsi: true,
  bollinger: true,
});

// Count visible indicators for height calculation
const visibleIndicatorCount = computed(() => {
  return Object.values(indicatorSettings.value).filter(Boolean).length;
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

// Handle crosshair move
const handleCrosshairMove = (chart: IChartApi, param: MouseEventParams) => {
  syncCrosshair(chart, param);
};

// Load default stock on mount
onMounted(() => {
  store.fetchStockData('2330');
});
</script>

<template>
  <div class="flex flex-col h-screen bg-[#0f0f0f]">
    <!-- Header -->
    <header class="h-14 min-h-[56px] flex items-center justify-between px-4 border-b border-[#333] bg-[#1a1a1a]">
      <div class="flex items-center gap-3">
        <svg class="w-8 h-8 text-[#3b82f6]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 17L9 11L13 15L21 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M17 7H21V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h1 class="text-lg font-semibold text-white">大筆訊號</h1>
      </div>

      <div class="flex items-center gap-4">
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

        <!-- Current Stock Info -->
        <div v-if="latestData" class="flex items-center gap-2 text-sm">
          <span class="text-[#3b82f6] font-medium">{{ store.stockId }}</span>
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
        <SearchBar />
      </div>
    </header>

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
      <div class="flex-1 flex flex-col overflow-hidden">
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
      <div v-else class="flex-1 flex flex-col p-4 gap-1 overflow-y-auto">
        <!-- K-Line Chart (main chart) - always visible -->
        <div class="min-h-[280px] h-[35%] border border-[#333] rounded-lg overflow-hidden flex-shrink-0">
          <KLineChart
            :on-chart-ready="handleChartReady"
            :on-crosshair-move="handleCrosshairMove"
          />
        </div>

        <!-- Volume Chart -->
        <div
          v-if="indicatorSettings.volume"
          class="min-h-[100px] h-[13%] border border-[#333] rounded-lg overflow-hidden flex-shrink-0"
        >
          <VolumeChart
            :on-chart-ready="handleChartReady"
            :on-crosshair-move="handleCrosshairMove"
          />
        </div>

        <!-- Institutional Chart (法人買賣) -->
        <div
          v-if="indicatorSettings.institutional"
          class="min-h-[100px] h-[13%] border border-[#333] rounded-lg overflow-hidden flex-shrink-0"
        >
          <InstitutionalChart
            :on-chart-ready="handleChartReady"
            :on-crosshair-move="handleCrosshairMove"
          />
        </div>

        <!-- MACD Chart -->
        <div
          v-if="indicatorSettings.macd"
          class="min-h-[100px] h-[13%] border border-[#333] rounded-lg overflow-hidden flex-shrink-0"
        >
          <MACDChart
            :on-chart-ready="handleChartReady"
            :on-crosshair-move="handleCrosshairMove"
          />
        </div>

        <!-- KD Chart -->
        <div
          v-if="indicatorSettings.kd"
          class="min-h-[100px] h-[13%] border border-[#333] rounded-lg overflow-hidden flex-shrink-0"
        >
          <KDChart
            :on-chart-ready="handleChartReady"
            :on-crosshair-move="handleCrosshairMove"
          />
        </div>

        <!-- RSI Chart -->
        <div
          v-if="indicatorSettings.rsi"
          class="min-h-[100px] h-[13%] border border-[#333] rounded-lg overflow-hidden flex-shrink-0"
        >
          <RSIChart
            :on-chart-ready="handleChartReady"
            :on-crosshair-move="handleCrosshairMove"
          />
        </div>

        <!-- Bollinger %B Chart -->
        <div
          v-if="indicatorSettings.bollinger"
          class="min-h-[100px] h-[13%] border border-[#333] rounded-lg overflow-hidden flex-shrink-0"
        >
          <BollingerChart
            :on-chart-ready="handleChartReady"
            :on-crosshair-move="handleCrosshairMove"
          />
        </div>
      </div>
      </div>
    </main>

    <!-- Indicator Settings Modal -->
    <IndicatorSettings
      v-if="showSettings"
      v-model="indicatorSettings"
      @close="showSettings = false"
    />
  </div>
</template>
