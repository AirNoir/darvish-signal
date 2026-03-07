<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { createChart, CandlestickSeries, LineSeries, CrosshairMode } from 'lightweight-charts';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';
import { useStockStore } from '../stores/stockStore';

const props = defineProps<{
  onChartReady?: (chart: IChartApi) => void;
  onCrosshairMove?: (chart: IChartApi, param: any) => void;
}>();

const store = useStockStore();
const chartContainer = ref<HTMLElement | null>(null);
let chart: IChartApi | null = null;
let candlestickSeries: ISeriesApi<'Candlestick'> | null = null;
let ma5Series: ISeriesApi<'Line'> | null = null;
let ma20Series: ISeriesApi<'Line'> | null = null;

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
      borderColor: '#333'
    },
    timeScale: {
      borderColor: '#333',
      timeVisible: true,
      secondsVisible: false
    }
  });

  // Add candlestick series
  candlestickSeries = chart.addSeries(CandlestickSeries, {
    upColor: '#26a69a',
    downColor: '#ef5350',
    borderUpColor: '#26a69a',
    borderDownColor: '#ef5350',
    wickUpColor: '#26a69a',
    wickDownColor: '#ef5350'
  });

  // Add MA5 series
  ma5Series = chart.addSeries(LineSeries, {
    color: '#f59e0b',
    lineWidth: 1,
    priceLineVisible: false,
    lastValueVisible: false
  });

  // Add MA20 series
  ma20Series = chart.addSeries(LineSeries, {
    color: '#8b5cf6',
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
  if (!candlestickSeries || !ma5Series || !ma20Series) return;

  candlestickSeries.setData(store.candlestickData as any);
  ma5Series.setData(store.ma5Data as any);
  ma20Series.setData(store.ma20Data as any);

  // Fit content
  if (chart) {
    chart.timeScale().fitContent();
  }
};

// Watch for data changes
watch(
  () => store.candlestickData,
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
      <span class="text-[#f59e0b]">MA5</span>
      <span class="text-[#8b5cf6]">MA20</span>
    </div>
  </div>
</template>
