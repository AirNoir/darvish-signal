<script setup lang="ts">
import { onMounted, computed } from 'vue';
import type { IChartApi, MouseEventParams } from 'lightweight-charts';
import { useStockStore } from './stores/stockStore';
import { useChartSync } from './composables/useChartSync';
import SearchBar from './components/SearchBar.vue';
import KLineChart from './components/KLineChart.vue';
import VolumeChart from './components/VolumeChart.vue';
import KDChart from './components/KDChart.vue';

const store = useStockStore();
const { addChart, syncCrosshair } = useChartSync();

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

// Handle chart ready events
const handleChartReady = (chart: IChartApi) => {
  addChart(chart);
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
        <h1 class="text-lg font-semibold text-white">Taiwan Stock Visualizer</h1>
      </div>

      <div class="flex items-center gap-4">
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
    <main class="flex-1 flex flex-col overflow-hidden">
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
      <div v-else class="flex-1 flex flex-col p-4 gap-1">
        <!-- K-Line Chart (50%) -->
        <div class="h-[50%] border border-[#333] rounded-lg overflow-hidden">
          <KLineChart
            :on-chart-ready="handleChartReady"
            :on-crosshair-move="handleCrosshairMove"
          />
        </div>

        <!-- Volume Chart (25%) -->
        <div class="h-[25%] border border-[#333] rounded-lg overflow-hidden">
          <VolumeChart
            :on-chart-ready="handleChartReady"
            :on-crosshair-move="handleCrosshairMove"
          />
        </div>

        <!-- KD Chart (25%) -->
        <div class="h-[25%] border border-[#333] rounded-lg overflow-hidden">
          <KDChart
            :on-chart-ready="handleChartReady"
            :on-crosshair-move="handleCrosshairMove"
          />
        </div>
      </div>
    </main>
  </div>
</template>
