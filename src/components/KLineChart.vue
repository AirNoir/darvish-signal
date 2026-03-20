<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { createChart, CandlestickSeries, LineSeries, CrosshairMode, createSeriesMarkers } from 'lightweight-charts';
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let markersPlugin: any = null;

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
      minimumWidth: 60 // 設定右側價格軸最小寬度，以解決對齊問題
    },
    timeScale: {
      borderColor: '#333',
      timeVisible: true,
      secondsVisible: false
    }
  });

  candlestickSeries = chart.addSeries(CandlestickSeries, {
    upColor: '#26a69a',
    downColor: '#ef5350',
    borderUpColor: '#26a69a',
    borderDownColor: '#ef5350',
    wickUpColor: '#26a69a',
    wickDownColor: '#ef5350'
  });

  ma5Series = chart.addSeries(LineSeries, {
    color: '#f59e0b',
    lineWidth: 1,
    priceLineVisible: false,
    lastValueVisible: false
  });

  ma20Series = chart.addSeries(LineSeries, {
    color: '#8b5cf6',
    lineWidth: 1,
    priceLineVisible: false,
    lastValueVisible: false
  });

  chart.subscribeCrosshairMove((param) => {
    if (props.onCrosshairMove && chart) {
      props.onCrosshairMove(chart, param);
    }
  });

  if (props.onChartReady) {
    props.onChartReady(chart);
  }

  const resizeObserver = new ResizeObserver(() => {
    if (chart && chartContainer.value) {
      chart.applyOptions({
        width: chartContainer.value.clientWidth,
        height: chartContainer.value.clientHeight
      });
    }
  });
  resizeObserver.observe(chartContainer.value);

  updateData();
};

const updateData = () => {
  if (!chart || !candlestickSeries || !ma5Series || !ma20Series) return;

  const data = store.candlestickData;
  if (!data || data.length === 0) return;

  candlestickSeries.setData(data);
  ma5Series.setData(store.ma5Data);
  ma20Series.setData(store.ma20Data);

  chart.timeScale().fitContent();
  updateMarkers();
};

const updateMarkers = () => {
  if (!candlestickSeries) return;

  const markers = store.signalMarkers.map(m => ({
    time: m.date as string,
    position: m.type === 'buy' ? ('belowBar' as const) : ('aboveBar' as const),
    color: m.type === 'buy' ? '#FFD700' : '#E040FB',
    shape: m.type === 'buy' ? ('arrowUp' as const) : ('arrowDown' as const),
    text: m.type === 'buy' ? 'B' : 'S',
  }));

  if (markersPlugin) {
    markersPlugin.setMarkers(markers);
  } else if (markers.length > 0 && candlestickSeries) {
    markersPlugin = createSeriesMarkers(candlestickSeries, markers);
  }
};

watch(
  () => store.candlestickData,
  () => {
    if (store.candlestickData && store.candlestickData.length > 0) {
      updateData();
    }
  },
  { deep: true }
);

watch(
  () => store.signalMarkers,
  () => updateMarkers(),
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
      <span class="text-[#FFD700]">▲ 買入</span>
      <span class="text-[#E040FB]">▼ 賣出</span>
      <span v-if="store.isLoadingMarkers" class="text-[#666]">載入訊號中...</span>
    </div>
  </div>
</template>
