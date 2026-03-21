<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { createChart, HistogramSeries, CrosshairMode } from 'lightweight-charts';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';
import { useStockStore } from '../stores/stockStore';

const props = defineProps<{
  onChartReady?: (chart: IChartApi, series: any) => void;
  onCrosshairMove?: (chart: IChartApi, param: any) => void;
}>();

const store = useStockStore();
const chartContainer = ref<HTMLElement | null>(null);
let chart: IChartApi | null = null;
let series: ISeriesApi<'Histogram'> | null = null;

const tooltipVisible = ref(false);
const tooltipX = ref(0);
const tooltipY = ref(0);
const hoverValue = ref<number | null>(null);

const formatValue = (val: number) => val.toLocaleString();

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
    rightPriceScale: { borderColor: '#333', scaleMargins: { top: 0.1, bottom: 0.1 }, minimumWidth: 60 },
    timeScale: { borderColor: '#333', visible: true, barSpacing: 12, minBarSpacing: 4, rightOffset: 5, fixLeftEdge: true, fixRightEdge: true }
  });

  series = chart.addSeries(HistogramSeries, { priceLineVisible: false, lastValueVisible: false });

  chart.subscribeCrosshairMove((param) => {
    if (props.onCrosshairMove && chart) props.onCrosshairMove(chart, param);
    if (param.time && param.point && series) {
      const val = param.seriesData.get(series) as any;
      hoverValue.value = val?.value ?? null;
      tooltipVisible.value = true;
      tooltipX.value = param.point.x;
      tooltipY.value = param.point.y;
    } else {
      hoverValue.value = null;
      tooltipVisible.value = false;
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
  const data = store.institutionalData.map((d) => ({
    time: d.time,
    value: d.trust,
    color: d.trust >= 0 ? '#f97316' : '#06b6d4'
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
    <div
      v-if="tooltipVisible && hoverValue !== null"
      class="absolute pointer-events-none bg-[#1a1a1a] border border-[#444] rounded px-2 py-1 text-xs z-50"
      :style="{ left: tooltipX + 15 + 'px', top: tooltipY + 15 + 'px' }"
    >
      <span :class="hoverValue >= 0 ? 'text-[#f97316]' : 'text-[#06b6d4]'">{{ formatValue(hoverValue) }}</span>
    </div>
  </div>
</template>
