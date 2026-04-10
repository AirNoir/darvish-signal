<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { createChart, HistogramSeries, CrosshairMode } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, Time } from 'lightweight-charts';
import { useStockStore } from '../stores/stockStore';

const props = defineProps<{
  onChartReady?: (chart: IChartApi, series: any) => void;
  onCrosshairMove?: (chart: IChartApi, param: any) => void;
}>();

const store = useStockStore();
const chartContainer = ref<HTMLElement | null>(null);
let chart: IChartApi | null = null;
let series: ISeriesApi<'Histogram'> | null = null;

const hoverValue = ref<number | null>(null);
const showTooltip = ref(false);
const tooltipX = ref(0);
const tooltipY = ref(0);

const formatValue = (val: number) => val.toLocaleString();

const formatLargeNumber = (price: number) => {
  const abs = Math.abs(price);
  if (abs >= 1000000) return (price / 1000000).toFixed(1) + 'M';
  if (abs >= 1000) return (price / 1000).toFixed(0) + 'K';
  return price.toFixed(0);
};

const tooltipStyle = computed(() => {
  const containerWidth = chartContainer.value?.clientWidth ?? 800;
  const tooltipWidth = 100;
  let left = tooltipX.value + 12;
  let top = tooltipY.value - 12;
  if (left + tooltipWidth > containerWidth) left = tooltipX.value - tooltipWidth - 12;
  if (top < 0) top = 8;
  return { left: left + 'px', top: top + 'px' };
});

const updateHoverDataFromTime = (time: Time | null) => {
  if (!time) { hoverValue.value = null; showTooltip.value = false; return; }
  const data = store.institutionalData.find(d => d.time === time);
  hoverValue.value = data?.foreign ?? null;

  // 計算 tooltip 位置
  if (chart && series && data?.foreign != null) {
    const timeCoord = chart.timeScale().timeToCoordinate(time);
    const priceCoord = series.priceToCoordinate(data.foreign);
    if (timeCoord !== null && priceCoord !== null) {
      tooltipX.value = timeCoord;
      tooltipY.value = priceCoord;
      showTooltip.value = true;
    }
  }
};

watch(
  () => store.syncedHoverTime,
  (newTime) => updateHoverDataFromTime(newTime),
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

  series = chart.addSeries(HistogramSeries, { priceLineVisible: false, lastValueVisible: false });

  chart.subscribeCrosshairMove((param) => {
    if (props.onCrosshairMove && chart) props.onCrosshairMove(chart, param);
    if (param.time && series) {
      const val = param.seriesData.get(series) as any;
      const value = val?.value ?? null;
      hoverValue.value = value;

      if (value != null) {
        const timeCoord = chart!.timeScale().timeToCoordinate(param.time);
        const priceCoord = series!.priceToCoordinate(value);
        if (timeCoord !== null && priceCoord !== null) {
          tooltipX.value = timeCoord;
          tooltipY.value = priceCoord;
          showTooltip.value = true;
        }
      }
    } else {
      hoverValue.value = null;
      showTooltip.value = false;
    }
  });

  if (props.onChartReady && series) props.onChartReady(chart, series);

  const resizeObserver = new ResizeObserver(() => {
    if (chart && chartContainer.value) chart.applyOptions({ width: chartContainer.value.clientWidth, height: chartContainer.value.clientHeight });
  });
  resizeObserver.observe(chartContainer.value);
  updateData();
};

const updateData = () => {
  if (!series) return;
  const data = store.institutionalData.map((d) => ({
    time: d.time, value: d.foreign, color: d.foreign >= 0 ? '#ef4444' : '#22c55e'
  }));
  series.setData(data as any);
};

watch(() => store.institutionalData, () => updateData(), { deep: true });
onMounted(() => initChart());
onUnmounted(() => { if (chart) { chart.remove(); chart = null; } });
defineExpose({ getChart: () => chart });
</script>

<template>
  <div class="relative w-full h-full overflow-hidden">
    <div ref="chartContainer" class="w-full h-full"></div>

    <div class="absolute top-1 left-1 z-10 flex items-center gap-1 text-[10px] pointer-events-none">
      <span class="text-white font-bold bg-[#1a1a1a]/80 px-1 rounded">外資買賣超</span>
      <span v-if="hoverValue !== null" :class="hoverValue >= 0 ? 'text-[#ef4444]' : 'text-[#22c55e]'" class="bg-[#1a1a1a]/80 px-1 rounded">{{ formatValue(hoverValue) }}</span>
    </div>

    <div
      v-if="showTooltip && hoverValue !== null"
      class="absolute pointer-events-none bg-[#1a1a1a] border border-[#444] rounded px-1.5 py-0.5 text-[10px] z-50 whitespace-nowrap"
      :style="tooltipStyle"
    >
      <span :class="hoverValue >= 0 ? 'text-[#ef4444]' : 'text-[#22c55e]'">{{ formatValue(hoverValue) }}</span>
    </div>
  </div>
</template>
