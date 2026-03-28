<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { createChart, LineSeries, HistogramSeries, CrosshairMode } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, Time } from 'lightweight-charts';
import { useStockStore } from '../stores/stockStore';

const props = defineProps<{
  onChartReady?: (chart: IChartApi, series: any) => void;
  onCrosshairMove?: (chart: IChartApi, param: any) => void;
}>();

const store = useStockStore();
const chartContainer = ref<HTMLElement | null>(null);
let chart: IChartApi | null = null;
let macdSeries: ISeriesApi<'Line'> | null = null;
let signalSeries: ISeriesApi<'Line'> | null = null;
let histogramSeries: ISeriesApi<'Histogram'> | null = null;


const hoverMacd = ref<number | null>(null);
const hoverSignal = ref<number | null>(null);
const hoverHist = ref<number | null>(null);
const showTooltip = ref(false);
const tooltipX = ref(0);
const tooltipY = ref(0);

const tooltipStyle = computed(() => {
  const containerWidth = chartContainer.value?.clientWidth ?? 800;
  const tooltipWidth = 160;
  let left = tooltipX.value + 12;
  let top = tooltipY.value - 12;
  if (left + tooltipWidth > containerWidth) left = tooltipX.value - tooltipWidth - 12;
  if (top < 0) top = 8;
  return { left: left + 'px', top: top + 'px' };
});

const updateHoverDataFromTime = (time: Time | null) => {
  if (!time) {
    hoverMacd.value = null; hoverSignal.value = null; hoverHist.value = null;
    showTooltip.value = false;
    return;
  }
  const data = store.macdData.find(d => d.time === time);
  if (data) {
    hoverMacd.value = data.macd;
    hoverSignal.value = data.signal;
    hoverHist.value = data.histogram;

    if (chart && macdSeries && data.macd != null) {
      const timeCoord = chart.timeScale().timeToCoordinate(time);
      const priceCoord = macdSeries.priceToCoordinate(data.macd);
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
    timeScale: { borderColor: '#333', visible: false, barSpacing: 12, minBarSpacing: 4, rightOffset: 8, fixLeftEdge: false, fixRightEdge: false }
  });

  histogramSeries = chart.addSeries(HistogramSeries, { priceLineVisible: false, lastValueVisible: false });
  macdSeries = chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
  signalSeries = chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });

  chart.subscribeCrosshairMove((param) => {
    if (props.onCrosshairMove && chart) props.onCrosshairMove(chart, param);
    if (param.time && macdSeries && signalSeries && histogramSeries) {
      const macdVal = param.seriesData.get(macdSeries) as any;
      const signalVal = param.seriesData.get(signalSeries) as any;
      const histVal = param.seriesData.get(histogramSeries) as any;
      const valueMacd = macdVal?.value ?? null;
      hoverMacd.value = valueMacd;
      hoverSignal.value = signalVal?.value ?? null;
      hoverHist.value = histVal?.value ?? null;

      if (valueMacd != null) {
        const timeCoord = chart!.timeScale().timeToCoordinate(param.time);
        const priceCoord = macdSeries!.priceToCoordinate(valueMacd);
        if (timeCoord !== null && priceCoord !== null) {
          tooltipX.value = timeCoord;
          tooltipY.value = priceCoord;
          showTooltip.value = true;
        }
      }
    } else {
      hoverMacd.value = null; hoverSignal.value = null; hoverHist.value = null;
      showTooltip.value = false;
    }
  });

  if (props.onChartReady && macdSeries) props.onChartReady(chart, macdSeries);

  const resizeObserver = new ResizeObserver(() => {
    if (chart && chartContainer.value) chart.applyOptions({ width: chartContainer.value.clientWidth, height: chartContainer.value.clientHeight });
  });
  resizeObserver.observe(chartContainer.value);
  updateData();
};

const updateData = () => {
  if (!macdSeries || !signalSeries || !histogramSeries) return;

  const macdLineData = store.macdData.filter((d) => d.macd !== null).map((d) => ({ time: d.time, value: d.macd as number }));
  const signalLineData = store.macdData.filter((d) => d.signal !== null).map((d) => ({ time: d.time, value: d.signal as number }));
  const histData = store.macdData.filter((d) => d.histogram !== null).map((d) => ({
    time: d.time, value: d.histogram as number, color: (d.histogram as number) >= 0 ? '#26a69a' : '#ef5350'
  }));

  macdSeries.setData(macdLineData as any);
  signalSeries.setData(signalLineData as any);
  histogramSeries.setData(histData as any);
};

watch(() => store.macdData, () => updateData(), { deep: true });
onMounted(() => initChart());
onUnmounted(() => { if (chart) { chart.remove(); chart = null; } });
defineExpose({ getChart: () => chart });
</script>

<template>
  <div class="relative w-full h-full overflow-hidden">
    <div ref="chartContainer" class="w-full h-full"></div>

    <div class="absolute top-1 left-1 z-10 flex items-center gap-1 text-[10px] pointer-events-none">
      <span class="text-white font-bold bg-[#1a1a1a]/80 px-1 rounded">MACD</span>
      <span v-if="hoverMacd !== null" class="text-[#3b82f6] bg-[#1a1a1a]/80 px-1 rounded">DIF {{ hoverMacd?.toFixed(2) }}</span>
      <span v-if="hoverSignal !== null" class="text-[#f59e0b] bg-[#1a1a1a]/80 px-1 rounded">DEA {{ hoverSignal?.toFixed(2) }}</span>
      <span v-if="hoverHist !== null" :class="hoverHist >= 0 ? 'text-[#26a69a]' : 'text-[#ef5350]'" class="bg-[#1a1a1a]/80 px-1 rounded">柱 {{ hoverHist?.toFixed(2) }}</span>
    </div>

    <div
      v-if="showTooltip && (hoverMacd !== null || hoverSignal !== null)"
      class="absolute pointer-events-none bg-[#1a1a1a] border border-[#444] rounded px-1.5 py-0.5 text-[10px] z-50 whitespace-nowrap"
      :style="tooltipStyle"
    >
      <span class="text-[#3b82f6]">DIF {{ hoverMacd?.toFixed(2) ?? '-' }}</span>
      <span class="text-[#f59e0b] ml-1">DEA {{ hoverSignal?.toFixed(2) ?? '-' }}</span>
    </div>
  </div>
</template>
