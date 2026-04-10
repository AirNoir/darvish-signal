<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
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
let rsi9Series: ISeriesApi<'Line'> | null = null;
let rsi14Series: ISeriesApi<'Line'> | null = null;


const hoverRsi9 = ref<number | null>(null);
const hoverRsi14 = ref<number | null>(null);
const showTooltip = ref(false);
const tooltipX = ref(0);
const tooltipY = ref(0);

const tooltipStyle = computed(() => {
  const containerWidth = chartContainer.value?.clientWidth ?? 800;
  const tooltipWidth = 120;
  let left = tooltipX.value + 12;
  let top = tooltipY.value - 12;
  if (left + tooltipWidth > containerWidth) left = tooltipX.value - tooltipWidth - 12;
  if (top < 0) top = 8;
  return { left: left + 'px', top: top + 'px' };
});

const updateHoverDataFromTime = (time: Time | null) => {
  if (!time) { hoverRsi9.value = null; hoverRsi14.value = null; showTooltip.value = false; return; }
  const data = store.rsiData.find(d => d.time === time);
  if (data) {
    hoverRsi9.value = data.rsi9;
    hoverRsi14.value = data.rsi14;

    if (chart && rsi9Series && data.rsi9 != null) {
      const timeCoord = chart.timeScale().timeToCoordinate(time);
      const priceCoord = rsi9Series.priceToCoordinate(data.rsi9);
      if (timeCoord !== null && priceCoord !== null) {
        tooltipX.value = timeCoord;
        tooltipY.value = priceCoord;
        showTooltip.value = true;
      }
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
    grid: { vertLines: { color: '#1a1a1a' }, horzLines: { color: '#1a1a1a' } },
    crosshair: {
      mode: CrosshairMode.Normal,
      vertLine: { width: 1, color: '#505050', style: 0, labelVisible: false, labelBackgroundColor: '#3b82f6' },
      horzLine: { width: 1, color: '#505050', style: 0, labelVisible: true, labelBackgroundColor: '#3b82f6' }
    },
    rightPriceScale: { borderColor: '#333', scaleMargins: { top: 0.05, bottom: 0.05 }, minimumWidth: 70 },
    timeScale: { borderColor: '#333', visible: false, barSpacing: 12, minBarSpacing: 4, rightOffset: 0, fixLeftEdge: true, fixRightEdge: true }
  });

  rsi9Series = chart.addSeries(LineSeries, { color: '#22c55e', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
  rsi14Series = chart.addSeries(LineSeries, { color: '#ef4444', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });

  chart.subscribeCrosshairMove((param) => {
    if (props.onCrosshairMove && chart) props.onCrosshairMove(chart, param);
    if (param.time && rsi9Series && rsi14Series) {
      const rsi9Val = param.seriesData.get(rsi9Series) as any;
      const rsi14Val = param.seriesData.get(rsi14Series) as any;
      const value9 = rsi9Val?.value ?? null;
      hoverRsi9.value = value9;
      hoverRsi14.value = rsi14Val?.value ?? null;

      if (value9 != null) {
        const timeCoord = chart!.timeScale().timeToCoordinate(param.time);
        const priceCoord = rsi9Series!.priceToCoordinate(value9);
        if (timeCoord !== null && priceCoord !== null) {
          tooltipX.value = timeCoord;
          tooltipY.value = priceCoord;
          showTooltip.value = true;
        }
      }
    } else {
      hoverRsi9.value = null; hoverRsi14.value = null;
      showTooltip.value = false;
    }
  });

  if (props.onChartReady && rsi14Series) props.onChartReady(chart, rsi14Series);

  const resizeObserver = new ResizeObserver(() => {
    if (chart && chartContainer.value) chart.applyOptions({ width: chartContainer.value.clientWidth, height: chartContainer.value.clientHeight });
  });
  resizeObserver.observe(chartContainer.value);
  updateData();
};

const updateData = () => {
  if (!rsi9Series || !rsi14Series) return;
  const rsi9Data = store.rsiData.filter((d) => d.rsi9 !== null).map((d) => ({ time: d.time, value: d.rsi9 as number }));
  const rsi14Data = store.rsiData.filter((d) => d.rsi14 !== null).map((d) => ({ time: d.time, value: d.rsi14 as number }));
  rsi9Series.setData(rsi9Data as any);
  rsi14Series.setData(rsi14Data as any);
};

watch(() => store.rsiData, () => updateData(), { deep: true });
onMounted(() => initChart());
onUnmounted(() => { if (chart) { chart.remove(); chart = null; } });
defineExpose({ getChart: () => chart });
</script>

<template>
  <div class="relative w-full h-full overflow-hidden">
    <div ref="chartContainer" class="w-full h-full"></div>

    <div class="absolute top-1 left-1 z-10 flex items-center gap-1 text-[10px] pointer-events-none">
      <span class="text-white font-bold bg-[#1a1a1a]/80 px-1 rounded">RSI</span>
      <span v-if="hoverRsi9 !== null" class="text-[#22c55e] bg-[#1a1a1a]/80 px-1 rounded">9 {{ hoverRsi9?.toFixed(2) }}</span>
      <span v-if="hoverRsi14 !== null" class="text-[#ef4444] bg-[#1a1a1a]/80 px-1 rounded">14 {{ hoverRsi14?.toFixed(2) }}</span>
    </div>

    <div
      v-if="showTooltip && (hoverRsi9 !== null || hoverRsi14 !== null)"
      class="absolute pointer-events-none bg-[#1a1a1a] border border-[#444] rounded px-1.5 py-0.5 text-[10px] z-50 whitespace-nowrap"
      :style="tooltipStyle"
    >
      <span class="text-[#22c55e]">RSI9 {{ hoverRsi9?.toFixed(2) ?? '-' }}</span>
      <span class="text-[#ef4444] ml-1">RSI14 {{ hoverRsi14?.toFixed(2) ?? '-' }}</span>
    </div>
  </div>
</template>
