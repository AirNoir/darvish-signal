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
let volumeSeries: ISeriesApi<'Histogram'> | null = null;

// Hover value and tooltip
const hoverVolume = ref<number | null>(null);
const showTooltip = ref(false);
const tooltipX = ref(0);
const tooltipY = ref(0);

const formatVolume = (vol: number) => vol.toLocaleString();

const formatLargeNumber = (price: number) => {
  const abs = Math.abs(price);
  if (abs >= 1000000) return (price / 1000000).toFixed(1) + 'M';
  if (abs >= 1000) return (price / 1000).toFixed(0) + 'K';
  return price.toFixed(0);
};

// 計算 tooltip 位置
const tooltipStyle = computed(() => {
  const containerWidth = chartContainer.value?.clientWidth ?? 800;
  const tooltipWidth = 100;

  let left = tooltipX.value + 12;
  let top = tooltipY.value - 12;

  if (left + tooltipWidth > containerWidth) {
    left = tooltipX.value - tooltipWidth - 12;
  }
  if (top < 0) top = 8;

  return { left: left + 'px', top: top + 'px' };
});

// 根據同步的時間更新 hover 數據，並計算 tooltip 位置
const updateHoverDataFromTime = (time: Time | null) => {
  if (!time) {
    hoverVolume.value = null;
    showTooltip.value = false;
    return;
  }
  const data = store.volumeData.find(d => d.time === time);
  hoverVolume.value = data?.value ?? null;

  // 計算 tooltip 位置（顯示在資料點上方）
  if (chart && volumeSeries && data?.value != null) {
    const timeCoord = chart.timeScale().timeToCoordinate(time);
    const priceCoord = volumeSeries.priceToCoordinate(data.value);
    if (timeCoord !== null && priceCoord !== null) {
      tooltipX.value = timeCoord;
      tooltipY.value = priceCoord;
      showTooltip.value = true;
    }
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
    rightPriceScale: { borderColor: '#333', scaleMargins: { top: 0.05, bottom: 0 }, minimumWidth: 70 },
    timeScale: { borderColor: '#333', visible: false, barSpacing: 12, minBarSpacing: 4, rightOffset: 0, fixLeftEdge: true, fixRightEdge: true }
  });

  volumeSeries = chart.addSeries(HistogramSeries, { priceFormat: { type: 'volume' }, priceScaleId: 'right' });

  chart.subscribeCrosshairMove((param) => {
    if (props.onCrosshairMove && chart) props.onCrosshairMove(chart, param);
    if (param.time && volumeSeries) {
      const volData = param.seriesData.get(volumeSeries) as any;
      const value = volData?.value ?? null;
      hoverVolume.value = value;

      // 計算 tooltip 位置（顯示在資料點上方）
      if (value != null) {
        const timeCoord = chart!.timeScale().timeToCoordinate(param.time);
        const priceCoord = volumeSeries!.priceToCoordinate(value);
        if (timeCoord !== null && priceCoord !== null) {
          tooltipX.value = timeCoord;
          tooltipY.value = priceCoord;
          showTooltip.value = true;
        }
      }
    } else {
      hoverVolume.value = null;
      showTooltip.value = false;
    }
  });

  if (props.onChartReady && volumeSeries) props.onChartReady(chart, volumeSeries);

  const resizeObserver = new ResizeObserver(() => {
    if (chart && chartContainer.value) {
      chart.applyOptions({ width: chartContainer.value.clientWidth, height: chartContainer.value.clientHeight });
    }
  });
  resizeObserver.observe(chartContainer.value);
  updateData();
};

const updateData = () => {
  if (!volumeSeries) return;
  volumeSeries.setData(store.volumeData as any);
};

watch(() => store.volumeData, () => updateData(), { deep: true });
onMounted(() => initChart());
onUnmounted(() => { if (chart) { chart.remove(); chart = null; } });
defineExpose({ getChart: () => chart });
</script>

<template>
  <div class="relative w-full h-full overflow-hidden">
    <div ref="chartContainer" class="w-full h-full"></div>

    <!-- 左上角 Label -->
    <div class="absolute top-1 left-1 z-10 flex items-center gap-1 text-[10px] pointer-events-none">
      <span class="text-white font-bold bg-[#1a1a1a]/80 px-1 rounded">成交量</span>
      <span v-if="hoverVolume !== null" class="text-[#26a69a] bg-[#1a1a1a]/80 px-1 rounded">{{ formatVolume(hoverVolume) }}</span>
    </div>

    <!-- Floating Tooltip (顯示在資料點上方) -->
    <div
      v-if="showTooltip && hoverVolume !== null"
      class="absolute pointer-events-none bg-[#1a1a1a] border border-[#444] rounded px-1.5 py-0.5 text-[10px] z-50 whitespace-nowrap"
      :style="tooltipStyle"
    >
      <span class="text-[#26a69a]">{{ formatVolume(hoverVolume) }}</span>
    </div>
  </div>
</template>
