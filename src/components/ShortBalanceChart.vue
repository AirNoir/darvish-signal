<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { createChart, LineSeries, HistogramSeries, CrosshairMode } from 'lightweight-charts';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';
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

const tooltipVisible = ref(false);
const tooltipX = ref(0);
const tooltipY = ref(0);
const hoverBalance = ref<number | null>(null);
const hoverChange = ref<number | null>(null);

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
    rightPriceScale: { borderColor: '#333', scaleMargins: { top: 0.1, bottom: 0.1 }, minimumWidth: 80 },
    timeScale: { borderColor: '#333', visible: true, barSpacing: 12, minBarSpacing: 4, rightOffset: 5, fixLeftEdge: true, fixRightEdge: true }
  });

  if (props.showChange !== false) {
    changeSeries = chart.addSeries(HistogramSeries, { priceLineVisible: false, lastValueVisible: false, priceScaleId: 'change' });
  }

  if (props.showBalance !== false) {
    balanceSeries = chart.addSeries(LineSeries, { color: '#06b6d4', lineWidth: 2, priceLineVisible: false, lastValueVisible: false });
  }

  chart.subscribeCrosshairMove((param) => {
    if (props.onCrosshairMove && chart) props.onCrosshairMove(chart, param);
    if (param.time && param.point) {
      if (balanceSeries) {
        const bVal = param.seriesData.get(balanceSeries) as any;
        hoverBalance.value = bVal?.value ?? null;
      }
      if (changeSeries) {
        const cVal = param.seriesData.get(changeSeries) as any;
        hoverChange.value = cVal?.value ?? null;
      }
      tooltipVisible.value = true;
      tooltipX.value = param.point.x;
      tooltipY.value = param.point.y;
    } else {
      hoverBalance.value = null;
      hoverChange.value = null;
      tooltipVisible.value = false;
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
  const data = store.shortData;
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

watch(() => store.shortData, () => updateData(), { deep: true });
onMounted(() => initChart());
onUnmounted(() => { if (chart) { chart.remove(); chart = null; } });
defineExpose({ getChart: () => chart });
</script>

<template>
  <div class="relative w-full h-full overflow-hidden">
    <div ref="chartContainer" class="w-full h-full"></div>
    <div class="absolute top-1 left-1 z-10 flex items-center gap-2 text-xs bg-[#1a1a1a] border border-[#333] px-2 py-1 rounded">
      <span class="text-white font-bold">融券</span>
      <span v-if="showBalance !== false" class="text-[#06b6d4]">餘額</span>
      <span v-if="showChange !== false" class="text-[#888]">增減</span>
    </div>
    <div
      v-if="tooltipVisible && (hoverBalance !== null || hoverChange !== null)"
      class="absolute pointer-events-none bg-[#1a1a1a] border border-[#444] rounded px-2 py-1 text-xs z-50"
      :style="{ left: tooltipX + 15 + 'px', top: tooltipY + 15 + 'px' }"
    >
      <div class="flex flex-col gap-0.5">
        <span v-if="hoverBalance !== null" class="text-[#06b6d4]">餘額 {{ formatValue(hoverBalance) }}</span>
        <span v-if="hoverChange !== null" :class="hoverChange >= 0 ? 'text-[#ef4444]' : 'text-[#22c55e]'">增減 {{ formatValue(hoverChange) }}</span>
      </div>
    </div>
  </div>
</template>
