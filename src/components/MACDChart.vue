<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { createChart, LineSeries, HistogramSeries, CrosshairMode } from 'lightweight-charts';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';
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

// Crosshair tooltip
const tooltipVisible = ref(false);
const tooltipX = ref(0);
const tooltipY = ref(0);
const hoverMacd = ref<number | null>(null);
const hoverSignal = ref<number | null>(null);
const hoverHist = ref<number | null>(null);

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
      mode: CrosshairMode.Normal,
      vertLine: {
        width: 1,
        color: '#505050',
        style: 0,
        labelVisible: false,
        labelBackgroundColor: '#3b82f6'
      },
      horzLine: {
        width: 1,
        color: '#505050',
        style: 0,
        labelVisible: true,
        labelBackgroundColor: '#3b82f6'
      }
    },
    rightPriceScale: {
      borderColor: '#333',
      scaleMargins: {
        top: 0.1,
        bottom: 0.1
      },
      minimumWidth: 80 // 設定較大的最小寬度以確保所有圖表對齊
    },
    timeScale: {
      borderColor: '#333',
      timeVisible: true,
      secondsVisible: false,
      barSpacing: 8,
      minBarSpacing: 4
    }
  });

  // MACD histogram (bars)
  histogramSeries = chart.addSeries(HistogramSeries, {
    priceLineVisible: false,
    lastValueVisible: false
  });

  // MACD line
  macdSeries = chart.addSeries(LineSeries, {
    color: '#3b82f6',
    lineWidth: 1,
    priceLineVisible: false,
    lastValueVisible: false
  });

  // Signal line
  signalSeries = chart.addSeries(LineSeries, {
    color: '#f59e0b',
    lineWidth: 1,
    priceLineVisible: false,
    lastValueVisible: false
  });

  chart.subscribeCrosshairMove((param) => {
    if (props.onCrosshairMove && chart) {
      props.onCrosshairMove(chart, param);
    }
    // Update hover values and tooltip position
    if (param.time && param.point && macdSeries && signalSeries && histogramSeries) {
      const macdVal = param.seriesData.get(macdSeries) as any;
      const signalVal = param.seriesData.get(signalSeries) as any;
      const histVal = param.seriesData.get(histogramSeries) as any;
      hoverMacd.value = macdVal?.value ?? null;
      hoverSignal.value = signalVal?.value ?? null;
      hoverHist.value = histVal?.value ?? null;
      tooltipVisible.value = true;
      tooltipX.value = param.point.x;
      tooltipY.value = param.point.y;
    } else {
      hoverMacd.value = null;
      hoverSignal.value = null;
      hoverHist.value = null;
      tooltipVisible.value = false;
    }
  });

  if (props.onChartReady && macdSeries) {
    props.onChartReady(chart, macdSeries);
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
  if (!macdSeries || !signalSeries || !histogramSeries) return;

  const macdLineData = store.macdData
    .filter((d) => d.macd !== null)
    .map((d) => ({ time: d.time, value: d.macd as number }));

  const signalLineData = store.macdData
    .filter((d) => d.signal !== null)
    .map((d) => ({ time: d.time, value: d.signal as number }));

  const histData = store.macdData
    .filter((d) => d.histogram !== null)
    .map((d) => ({
      time: d.time,
      value: d.histogram as number,
      color: (d.histogram as number) >= 0 ? '#26a69a' : '#ef5350'
    }));

  macdSeries.setData(macdLineData as any);
  signalSeries.setData(signalLineData as any);
  histogramSeries.setData(histData as any);
};

watch(
  () => store.macdData,
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

defineExpose({
  getChart: () => chart
});
</script>

<template>
  <div class="relative w-full h-full overflow-hidden">
    <div ref="chartContainer" class="w-full h-full"></div>

    <!-- Fixed Title -->
    <div class="absolute top-1 left-1 z-10 flex items-center gap-2 text-xs bg-[#1a1a1a] border border-[#333] px-2 py-1 rounded">
      <span class="text-white font-bold">MACD</span>
      <span class="text-[#3b82f6]">DIF</span>
      <span class="text-[#f59e0b]">DEA</span>
      <span class="text-[#888]">柱</span>
    </div>

    <!-- Floating Tooltip -->
    <div
      v-if="tooltipVisible && (hoverMacd !== null || hoverSignal !== null)"
      class="absolute pointer-events-none bg-[#1a1a1a] border border-[#444] rounded px-2 py-1 text-xs z-50"
      :style="{ left: tooltipX + 15 + 'px', top: tooltipY + 15 + 'px' }"
    >
      <span class="text-[#3b82f6]">DIF {{ hoverMacd?.toFixed(2) ?? '-' }}</span>
      <span class="text-[#f59e0b] ml-2">DEA {{ hoverSignal?.toFixed(2) ?? '-' }}</span>
      <span :class="hoverHist !== null && hoverHist >= 0 ? 'text-[#26a69a]' : 'text-[#ef5350]'" class="ml-2">
        柱 {{ hoverHist?.toFixed(2) ?? '-' }}
      </span>
    </div>
  </div>
</template>
