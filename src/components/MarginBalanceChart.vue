<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { createChart, LineSeries, HistogramSeries, CrosshairMode } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, Time } from 'lightweight-charts';
import { useStockStore } from '../stores/stockStore';

const props = defineProps<{
  onChartReady?: (chart: IChartApi, series: any) => void;
  onCrosshairMove?: (chart: IChartApi, param: any) => void;
  showBalance?: boolean;
  showChange?: boolean;
}>();

const store = useStockStore();
const chartContainer = ref<HTMLElement | null>(null);
let chart: IChartApi | null = null;
let balanceSeries: ISeriesApi<'Line'> | null = null;
let changeSeries: ISeriesApi<'Histogram'> | null = null;


const hoverBalance = ref<number | null>(null);
const hoverChange = ref<number | null>(null);

const formatValue = (val: number) => val.toLocaleString();

// Format large numbers with K/M suffix for Y-axis
const formatLargeNumber = (price: number) => {
  const abs = Math.abs(price);
  if (abs >= 1000000) return (price / 1000000).toFixed(1) + 'M';
  if (abs >= 1000) return (price / 1000).toFixed(0) + 'K';
  return price.toFixed(0);
};

// 根據同步的時間更新 hover 數據
const updateHoverDataFromTime = (time: Time | null) => {
  if (!time) {
    hoverBalance.value = null;
    hoverChange.value = null;
    return;
  }
  const data = store.marginData.find(d => d.time === time);
  if (data) {
    hoverBalance.value = data.balance;
    hoverChange.value = data.change;
  }
};

// 監聽 store 中同步的 hover 時間變化
watch(
  () => store.syncedHoverTime,
  (newTime) => {
    updateHoverDataFromTime(newTime);
  },
  { immediate: true }
);

const initChart = () => {
  if (!chartContainer.value) return;

  chart = createChart(chartContainer.value, {
    layout: { background: { color: '#0f0f0f' }, textColor: '#a0a0a0' },
    localization: { priceFormatter: formatLargeNumber },
    grid: { vertLines: { color: '#1a1a1a' }, horzLines: { color: '#1a1a1a' } },
    crosshair: {
      mode: CrosshairMode.Normal,
      vertLine: { width: 1, color: '#505050', style: 0, labelVisible: false, labelBackgroundColor: '#3b82f6' },
      horzLine: { width: 1, color: '#505050', style: 0, labelVisible: true, labelBackgroundColor: '#3b82f6' }
    },
    rightPriceScale: { borderColor: '#333', scaleMargins: { top: 0.05, bottom: 0.05 }, minimumWidth: 70 },
    timeScale: { borderColor: '#333', visible: false, barSpacing: 12, minBarSpacing: 4, rightOffset: 0, fixLeftEdge: true, fixRightEdge: true }
  });

  if (props.showChange !== false) {
    changeSeries = chart.addSeries(HistogramSeries, { priceLineVisible: false, lastValueVisible: false, priceScaleId: 'change' });
  }

  if (props.showBalance !== false) {
    balanceSeries = chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 2, priceLineVisible: false, lastValueVisible: false });
  }

  chart.subscribeCrosshairMove((param) => {
    if (props.onCrosshairMove && chart) props.onCrosshairMove(chart, param);
    if (param.time) {
      if (balanceSeries) {
        const bVal = param.seriesData.get(balanceSeries) as any;
        hoverBalance.value = bVal?.value ?? null;
      }
      if (changeSeries) {
        const cVal = param.seriesData.get(changeSeries) as any;
        hoverChange.value = cVal?.value ?? null;
      }
    } else {
      hoverBalance.value = null;
      hoverChange.value = null;
    }
  });

  if (props.onChartReady && (balanceSeries || changeSeries)) props.onChartReady(chart, balanceSeries || changeSeries);

  const resizeObserver = new ResizeObserver(() => {
    if (chart && chartContainer.value) {
      chart.applyOptions({ width: chartContainer.value.clientWidth, height: chartContainer.value.clientHeight });
    }
  });
  resizeObserver.observe(chartContainer.value);
  updateData();
};

const updateData = () => {
  const data = store.marginData;
  if (balanceSeries) {
    balanceSeries.setData(data.filter(d => d.balance !== null).map(d => ({ time: d.time, value: d.balance as number })) as any);
  }
  if (changeSeries) {
    changeSeries.setData(data.map(d => ({
      time: d.time,
      value: d.change ?? 0,
      color: (d.change ?? 0) >= 0 ? '#ef4444' : '#22c55e'
    })) as any);
  }
};

watch(() => store.marginData, () => updateData(), { deep: true });
onMounted(() => initChart());
onUnmounted(() => { if (chart) { chart.remove(); chart = null; } });
defineExpose({ getChart: () => chart });
</script>

<template>
  <div class="relative w-full h-full overflow-visible">
    <div ref="chartContainer" class="w-full h-full"></div>

    <!-- 左上角 Label -->
    <div class="absolute top-1 left-1 z-10 flex items-center gap-1 text-[10px] pointer-events-none flex-wrap">
      <span class="text-white font-bold bg-[#1a1a1a]/80 px-1 rounded">融資</span>
      <span v-if="hoverBalance !== null && showBalance !== false" class="text-[#f59e0b] bg-[#1a1a1a]/80 px-1 rounded">餘額 {{ formatValue(hoverBalance) }}</span>
      <span v-if="hoverChange !== null && showChange !== false" :class="hoverChange >= 0 ? 'text-[#ef4444]' : 'text-[#22c55e]'" class="bg-[#1a1a1a]/80 px-1 rounded">增減 {{ formatValue(hoverChange) }}</span>
    </div>
  </div>
</template>
