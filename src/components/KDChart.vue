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
let kSeries: ISeriesApi<'Line'> | null = null;
let dSeries: ISeriesApi<'Line'> | null = null;


const hoverK = ref<number | null>(null);
const hoverD = ref<number | null>(null);
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
  if (!time) { hoverK.value = null; hoverD.value = null; showTooltip.value = false; return; }
  const data = store.kdData.find(d => d.time === time);
  if (data) {
    hoverK.value = data.k;
    hoverD.value = data.d;

    if (chart && kSeries && data.k != null) {
      const timeCoord = chart.timeScale().timeToCoordinate(time);
      const priceCoord = kSeries.priceToCoordinate(data.k);
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

  kSeries = chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
  dSeries = chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });

  chart.subscribeCrosshairMove((param) => {
    if (props.onCrosshairMove && chart) props.onCrosshairMove(chart, param);
    if (param.time && kSeries && dSeries) {
      const kVal = param.seriesData.get(kSeries) as any;
      const dVal = param.seriesData.get(dSeries) as any;
      const valueK = kVal?.value ?? null;
      hoverK.value = valueK;
      hoverD.value = dVal?.value ?? null;

      if (valueK != null) {
        const timeCoord = chart!.timeScale().timeToCoordinate(param.time);
        const priceCoord = kSeries!.priceToCoordinate(valueK);
        if (timeCoord !== null && priceCoord !== null) {
          tooltipX.value = timeCoord;
          tooltipY.value = priceCoord;
          showTooltip.value = true;
        }
      }
    } else {
      hoverK.value = null; hoverD.value = null;
      showTooltip.value = false;
    }
  });

  if (props.onChartReady && kSeries) props.onChartReady(chart, kSeries);

  const resizeObserver = new ResizeObserver(() => {
    if (chart && chartContainer.value) chart.applyOptions({ width: chartContainer.value.clientWidth, height: chartContainer.value.clientHeight });
  });
  resizeObserver.observe(chartContainer.value);
  updateData();
};

const updateData = () => {
  if (!kSeries || !dSeries) return;
  const kData = store.kdData.map((d) => ({ time: d.time, value: d.k }));
  const dData = store.kdData.map((d) => ({ time: d.time, value: d.d }));
  kSeries.setData(kData as any);
  dSeries.setData(dData as any);
};

watch(() => store.kdData, () => updateData(), { deep: true });
onMounted(() => initChart());
onUnmounted(() => { if (chart) { chart.remove(); chart = null; } });
defineExpose({ getChart: () => chart });
</script>

<template>
  <div class="relative w-full h-full overflow-hidden">
    <div ref="chartContainer" class="w-full h-full"></div>

    <div class="absolute top-1 left-1 z-10 flex items-center gap-1 text-[10px] pointer-events-none">
      <span class="text-white font-bold bg-[#1a1a1a]/80 px-1 rounded">KD</span>
      <span v-if="hoverK !== null" class="text-[#3b82f6] bg-[#1a1a1a]/80 px-1 rounded">K {{ hoverK?.toFixed(2) }}</span>
      <span v-if="hoverD !== null" class="text-[#f59e0b] bg-[#1a1a1a]/80 px-1 rounded">D {{ hoverD?.toFixed(2) }}</span>
    </div>

    <div
      v-if="showTooltip && (hoverK !== null || hoverD !== null)"
      class="absolute pointer-events-none bg-[#1a1a1a] border border-[#444] rounded px-1.5 py-0.5 text-[10px] z-50 whitespace-nowrap"
      :style="tooltipStyle"
    >
      <span class="text-[#3b82f6]">K {{ hoverK?.toFixed(2) ?? '-' }}</span>
      <span class="text-[#f59e0b] ml-1">D {{ hoverD?.toFixed(2) ?? '-' }}</span>
    </div>
  </div>
</template>
