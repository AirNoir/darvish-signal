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
let avg5Series: ISeriesApi<'Line'> | null = null;
let avg10Series: ISeriesApi<'Line'> | null = null;
let avg15Series: ISeriesApi<'Line'> | null = null;
let avg30Series: ISeriesApi<'Line'> | null = null;


const hoverAvg5 = ref<number | null>(null);
const hoverAvg10 = ref<number | null>(null);
const hoverAvg15 = ref<number | null>(null);
const hoverAvg30 = ref<number | null>(null);
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
  const tooltipWidth = 180;
  let left = tooltipX.value + 12;
  let top = tooltipY.value - 12;
  if (left + tooltipWidth > containerWidth) left = tooltipX.value - tooltipWidth - 12;
  if (top < 0) top = 8;
  return { left: left + 'px', top: top + 'px' };
});

const updateHoverDataFromTime = (time: Time | null) => {
  if (!time) {
    hoverAvg5.value = null; hoverAvg10.value = null; hoverAvg15.value = null; hoverAvg30.value = null;
    showTooltip.value = false;
    return;
  }
  const data = store.foreignNetMAData.find(d => d.time === time);
  if (data) {
    hoverAvg5.value = data.avg5;
    hoverAvg10.value = data.avg10;
    hoverAvg15.value = data.avg15;
    hoverAvg30.value = data.avg30;

    if (chart && avg5Series && data.avg5 != null) {
      const timeCoord = chart.timeScale().timeToCoordinate(time);
      const priceCoord = avg5Series.priceToCoordinate(data.avg5);
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
    localization: { priceFormatter: formatLargeNumber },
    grid: { vertLines: { color: '#1a1a1a' }, horzLines: { color: '#1a1a1a' } },
    crosshair: {
      mode: CrosshairMode.Normal,
      vertLine: { width: 1, color: '#505050', style: 0, labelVisible: false, labelBackgroundColor: '#3b82f6' },
      horzLine: { width: 1, color: '#505050', style: 0, labelVisible: true, labelBackgroundColor: '#3b82f6' }
    },
    rightPriceScale: { borderColor: '#333', scaleMargins: { top: 0.05, bottom: 0.05 }, minimumWidth: 70 },
    timeScale: { borderColor: '#333', visible: false, barSpacing: 12, minBarSpacing: 4, rightOffset: 8, fixLeftEdge: false, fixRightEdge: false }
  });

  avg5Series = chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
  avg10Series = chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
  avg15Series = chart.addSeries(LineSeries, { color: '#8b5cf6', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
  avg30Series = chart.addSeries(LineSeries, { color: '#10b981', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });

  chart.subscribeCrosshairMove((param) => {
    if (props.onCrosshairMove && chart) props.onCrosshairMove(chart, param);
    if (param.time && avg5Series && avg10Series && avg15Series && avg30Series) {
      const v5 = param.seriesData.get(avg5Series) as any;
      const v10 = param.seriesData.get(avg10Series) as any;
      const v15 = param.seriesData.get(avg15Series) as any;
      const v30 = param.seriesData.get(avg30Series) as any;
      const value5 = v5?.value ?? null;
      hoverAvg5.value = value5;
      hoverAvg10.value = v10?.value ?? null;
      hoverAvg15.value = v15?.value ?? null;
      hoverAvg30.value = v30?.value ?? null;

      if (value5 != null) {
        const timeCoord = chart!.timeScale().timeToCoordinate(param.time);
        const priceCoord = avg5Series!.priceToCoordinate(value5);
        if (timeCoord !== null && priceCoord !== null) {
          tooltipX.value = timeCoord;
          tooltipY.value = priceCoord;
          showTooltip.value = true;
        }
      }
    } else {
      hoverAvg5.value = null; hoverAvg10.value = null; hoverAvg15.value = null; hoverAvg30.value = null;
      showTooltip.value = false;
    }
  });

  if (props.onChartReady && avg5Series) props.onChartReady(chart, avg5Series);

  const resizeObserver = new ResizeObserver(() => {
    if (chart && chartContainer.value) chart.applyOptions({ width: chartContainer.value.clientWidth, height: chartContainer.value.clientHeight });
  });
  resizeObserver.observe(chartContainer.value);
  updateData();
};

const updateData = () => {
  if (!avg5Series || !avg10Series || !avg15Series || !avg30Series) return;
  const data = store.foreignNetMAData;
  avg5Series.setData(data.filter(d => d.avg5 !== null).map(d => ({ time: d.time, value: d.avg5 as number })) as any);
  avg10Series.setData(data.filter(d => d.avg10 !== null).map(d => ({ time: d.time, value: d.avg10 as number })) as any);
  avg15Series.setData(data.filter(d => d.avg15 !== null).map(d => ({ time: d.time, value: d.avg15 as number })) as any);
  avg30Series.setData(data.filter(d => d.avg30 !== null).map(d => ({ time: d.time, value: d.avg30 as number })) as any);
};

watch(() => store.foreignNetMAData, () => updateData(), { deep: true });
onMounted(() => initChart());
onUnmounted(() => { if (chart) { chart.remove(); chart = null; } });
defineExpose({ getChart: () => chart });
</script>

<template>
  <div class="relative w-full h-full overflow-hidden">
    <div ref="chartContainer" class="w-full h-full"></div>

    <div class="absolute top-1 left-1 z-10 flex items-center gap-1 text-[10px] pointer-events-none flex-wrap">
      <span class="text-white font-bold bg-[#1a1a1a]/80 px-1 rounded">外資均線</span>
      <span v-if="hoverAvg5 !== null" class="text-[#f59e0b] bg-[#1a1a1a]/80 px-1 rounded">5日 {{ formatValue(hoverAvg5) }}</span>
      <span v-if="hoverAvg10 !== null" class="text-[#3b82f6] bg-[#1a1a1a]/80 px-1 rounded">10日 {{ formatValue(hoverAvg10) }}</span>
      <span v-if="hoverAvg15 !== null" class="text-[#8b5cf6] bg-[#1a1a1a]/80 px-1 rounded">15日 {{ formatValue(hoverAvg15) }}</span>
      <span v-if="hoverAvg30 !== null" class="text-[#10b981] bg-[#1a1a1a]/80 px-1 rounded">30日 {{ formatValue(hoverAvg30) }}</span>
    </div>

    <div
      v-if="showTooltip && (hoverAvg5 !== null || hoverAvg10 !== null)"
      class="absolute pointer-events-none bg-[#1a1a1a] border border-[#444] rounded px-1.5 py-0.5 text-[10px] z-50 whitespace-nowrap"
      :style="tooltipStyle"
    >
      <span class="text-[#f59e0b]">5日 {{ hoverAvg5 !== null ? formatValue(hoverAvg5) : '-' }}</span>
      <span class="text-[#3b82f6] ml-1">10日 {{ hoverAvg10 !== null ? formatValue(hoverAvg10) : '-' }}</span>
    </div>
  </div>
</template>
