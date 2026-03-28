<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { createChart, LineSeries, CrosshairMode } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, Time } from 'lightweight-charts';
import { useStockStore } from '../stores/stockStore';

const props = defineProps<{
  onChartReady?: (chart: IChartApi, series: any) => void;
  onCrosshairMove?: (chart: IChartApi, param: any) => void;
}>();

const store = useStockStore();
const chartContainer = ref<HTMLElement | null>(null);
let chart: IChartApi | null = null;
let series: ISeriesApi<'Line'> | null = null;


const hoverValue = ref<number | null>(null);

// 根據同步的時間更新 hover 數據
const updateHoverDataFromTime = (time: Time | null) => {
  if (!time) {
    hoverValue.value = null;
    return;
  }
  const data = store.shortMarginRatioData.find(d => d.time === time);
  hoverValue.value = data?.value ?? null;
};

// 監聯 store 中同步的 hover 時間變化
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
    grid: { vertLines: { color: '#1a1a1a' }, horzLines: { color: '#1a1a1a' } },
    crosshair: {
      mode: CrosshairMode.Normal,
      vertLine: { width: 1, color: '#505050', style: 0, labelVisible: false, labelBackgroundColor: '#3b82f6' },
      horzLine: { width: 1, color: '#505050', style: 0, labelVisible: true, labelBackgroundColor: '#3b82f6' }
    },
    rightPriceScale: { borderColor: '#333', scaleMargins: { top: 0.05, bottom: 0.05 }, minimumWidth: 70 },
    timeScale: { borderColor: '#333', visible: false, barSpacing: 12, minBarSpacing: 4, rightOffset: 8, fixLeftEdge: false, fixRightEdge: false }
  });

  series = chart.addSeries(LineSeries, { color: '#ec4899', lineWidth: 2, priceLineVisible: false, lastValueVisible: false });

  chart.subscribeCrosshairMove((param) => {
    if (props.onCrosshairMove && chart) props.onCrosshairMove(chart, param);
    if (param.time && series) {
      const val = param.seriesData.get(series) as any;
      hoverValue.value = val?.value ?? null;
    } else {
      hoverValue.value = null;
    }
  });

  if (props.onChartReady && series) props.onChartReady(chart, series);

  const resizeObserver = new ResizeObserver(() => {
    if (chart && chartContainer.value) {
      chart.applyOptions({ width: chartContainer.value.clientWidth, height: chartContainer.value.clientHeight });
    }
  });
  resizeObserver.observe(chartContainer.value);
  updateData();
};

const updateData = () => {
  if (!series) return;
  const data = store.shortMarginRatioData.filter(d => d.value !== null).map(d => ({ time: d.time, value: d.value as number }));
  series.setData(data as any);
};

watch(() => store.shortMarginRatioData, () => updateData(), { deep: true });
onMounted(() => initChart());
onUnmounted(() => { if (chart) { chart.remove(); chart = null; } });
defineExpose({ getChart: () => chart });
</script>

<template>
  <div class="relative w-full h-full overflow-visible">
    <div ref="chartContainer" class="w-full h-full"></div>

    <!-- 左上角 Label -->
    <div class="absolute top-1 left-1 z-10 flex items-center gap-1 text-[10px] pointer-events-none">
      <span class="text-white font-bold bg-[#1a1a1a]/80 px-1 rounded">券資比</span>
      <span v-if="hoverValue !== null" class="text-[#ec4899] bg-[#1a1a1a]/80 px-1 rounded">{{ hoverValue?.toFixed(2) }}%</span>
    </div>
  </div>
</template>
