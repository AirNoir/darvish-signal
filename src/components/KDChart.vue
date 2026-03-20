<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { createChart, LineSeries, CrosshairMode } from 'lightweight-charts';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';
import { useStockStore } from '../stores/stockStore';

const props = defineProps<{
  onChartReady?: (chart: IChartApi) => void;
  onCrosshairMove?: (chart: IChartApi, param: any) => void;
}>();

const store = useStockStore();
const chartContainer = ref<HTMLElement | null>(null);
let chart: IChartApi | null = null;
let kSeries: ISeriesApi<'Line'> | null = null;
let dSeries: ISeriesApi<'Line'> | null = null;

const initChart = () => {
  if (!chartContainer.value) return;

  chart = createChart(chartContainer.value, {
    layout: {
      background: { color: '#0f0f0f' },
      textColor: '#a0a0a0'
    },
    grid: {
      vertLines: { color: '#1a1a1a' },
      horzLines: { color: '#1a1a1a' }
    },
    crosshair: {
      mode: CrosshairMode.Normal
    },
    rightPriceScale: {
      borderColor: '#333',
      scaleMargins: {
        top: 0.1,
        bottom: 0.1
      },
      minimumWidth: 60 // 設定右側價格軸最小寬度，以解決對齊問題
    },
    timeScale: {
      borderColor: '#333',
      timeVisible: true,
      secondsVisible: false
    }
  });

  // Add K line series
  kSeries = chart.addSeries(LineSeries, {
    color: '#3b82f6',
    lineWidth: 1,
    priceLineVisible: false,
    lastValueVisible: false
  });

  // Add D line series
  dSeries = chart.addSeries(LineSeries, {
    color: '#f59e0b',
    lineWidth: 1,
    priceLineVisible: false,
    lastValueVisible: false
  });

  // Subscribe to crosshair move
  chart.subscribeCrosshairMove((param) => {
    if (props.onCrosshairMove && chart) {
      props.onCrosshairMove(chart, param);
    }
  });

  // Notify parent that chart is ready
  if (props.onChartReady) {
    props.onChartReady(chart);
  }

  // Handle resize
  const resizeObserver = new ResizeObserver(() => {
    if (chart && chartContainer.value) {
      chart.applyOptions({
        width: chartContainer.value.clientWidth,
        height: chartContainer.value.clientHeight
      });
    }
  });
  resizeObserver.observe(chartContainer.value);

  // Load initial data
  updateData();
};

const updateData = () => {
  if (!kSeries || !dSeries) return;

  const kData = store.kdData.map((d) => ({ time: d.time, value: d.k }));
  const dData = store.kdData.map((d) => ({ time: d.time, value: d.d }));

  kSeries.setData(kData as any);
  dSeries.setData(dData as any);
};

// Watch for data changes
watch(
  () => store.kdData,
  () => {
    updateData();
  },
  { deep: true }
);

onMounted(() => {
  initChart();
});

onUnmounted(() => {
  if (chart) {
    chart.remove();
    chart = null;
  }
});

// Expose chart for external access
defineExpose({
  getChart: () => chart
});
</script>

<template>
  <div class="relative w-full h-full">
    <div ref="chartContainer" class="w-full h-full"></div>
    <!-- Legend -->
    <div class="absolute top-2 left-2 flex gap-4 text-xs">
      <span class="text-[#3b82f6]">K</span>
      <span class="text-[#f59e0b]">D</span>
    </div>
  </div>
</template>
