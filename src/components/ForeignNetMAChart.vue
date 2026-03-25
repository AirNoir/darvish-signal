<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { createChart, LineSeries, CrosshairMode } from 'lightweight-charts';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';
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

const tooltipVisible = ref(false);
const tooltipX = ref(0);
const tooltipY = ref(0);
const hoverAvg5 = ref<number | null>(null);
const hoverAvg10 = ref<number | null>(null);
const hoverAvg15 = ref<number | null>(null);
const hoverAvg30 = ref<number | null>(null);

const formatValue = (val: number) => val.toLocaleString();

// Format large numbers with K/M suffix for Y-axis
const formatLargeNumber = (price: number) => {
  const abs = Math.abs(price);
  if (abs >= 1000000) return (price / 1000000).toFixed(1) + 'M';
  if (abs >= 1000) return (price / 1000).toFixed(0) + 'K';
  return price.toFixed(0);
};

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
    rightPriceScale: { borderColor: '#333', scaleMargins: { top: 0.1, bottom: 0.1 }, minimumWidth: 70 },
    timeScale: { borderColor: '#333', visible: true, barSpacing: 12, minBarSpacing: 4, rightOffset: 8, fixLeftEdge: false, fixRightEdge: false }
  });

  avg5Series = chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
  avg10Series = chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
  avg15Series = chart.addSeries(LineSeries, { color: '#8b5cf6', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
  avg30Series = chart.addSeries(LineSeries, { color: '#10b981', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });

  chart.subscribeCrosshairMove((param) => {
    if (props.onCrosshairMove && chart) props.onCrosshairMove(chart, param);
    if (param.time && param.point && avg5Series && avg10Series && avg15Series && avg30Series) {
      const v5 = param.seriesData.get(avg5Series) as any;
      const v10 = param.seriesData.get(avg10Series) as any;
      const v15 = param.seriesData.get(avg15Series) as any;
      const v30 = param.seriesData.get(avg30Series) as any;
      hoverAvg5.value = v5?.value ?? null;
      hoverAvg10.value = v10?.value ?? null;
      hoverAvg15.value = v15?.value ?? null;
      hoverAvg30.value = v30?.value ?? null;
      tooltipVisible.value = true;
      tooltipX.value = param.point.x;
      tooltipY.value = param.point.y;
    } else {
      hoverAvg5.value = null;
      hoverAvg10.value = null;
      hoverAvg15.value = null;
      hoverAvg30.value = null;
      tooltipVisible.value = false;
    }
  });

  if (props.onChartReady && avg5Series) props.onChartReady(chart, avg5Series);

  const resizeObserver = new ResizeObserver(() => {
    if (chart && chartContainer.value) {
      chart.applyOptions({ width: chartContainer.value.clientWidth, height: chartContainer.value.clientHeight });
    }
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
    <div
      v-if="tooltipVisible && (hoverAvg5 !== null || hoverAvg10 !== null || hoverAvg15 !== null || hoverAvg30 !== null)"
      class="absolute pointer-events-none bg-[#1a1a1a] border border-[#444] rounded px-2 py-1 text-xs z-50"
      :style="{ left: tooltipX + 15 + 'px', top: tooltipY + 15 + 'px' }"
    >
      <div class="flex flex-col gap-0.5">
        <span class="text-[#f59e0b]">5日 {{ hoverAvg5 !== null ? formatValue(hoverAvg5) : '-' }}</span>
        <span class="text-[#3b82f6]">10日 {{ hoverAvg10 !== null ? formatValue(hoverAvg10) : '-' }}</span>
        <span class="text-[#8b5cf6]">15日 {{ hoverAvg15 !== null ? formatValue(hoverAvg15) : '-' }}</span>
        <span class="text-[#10b981]">30日 {{ hoverAvg30 !== null ? formatValue(hoverAvg30) : '-' }}</span>
      </div>
    </div>
  </div>
</template>
