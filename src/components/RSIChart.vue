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
let rsi9Series: ISeriesApi<'Line'> | null = null;
let rsi14Series: ISeriesApi<'Line'> | null = null;

// Crosshair tooltip
const tooltipVisible = ref(false);
const tooltipX = ref(0);
const tooltipY = ref(0);
const hoverRsi9 = ref<number | null>(null);
const hoverRsi14 = ref<number | null>(null);

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
      minimumWidth: 70 // 設定較大的最小寬度以確保所有圖表對齊
    },
    timeScale: {
      borderColor: '#333',
      timeVisible: true,
      secondsVisible: false,
      barSpacing: 12,
      minBarSpacing: 4,
      rightOffset: 8,
      fixLeftEdge: false,
      fixRightEdge: false
    }
  });

  // RSI 9 line (faster)
  rsi9Series = chart.addSeries(LineSeries, {
    color: '#22c55e',
    lineWidth: 1,
    priceLineVisible: false,
    lastValueVisible: false
  });

  // RSI 14 line (slower)
  rsi14Series = chart.addSeries(LineSeries, {
    color: '#ef4444',
    lineWidth: 1,
    priceLineVisible: false,
    lastValueVisible: false
  });

  chart.subscribeCrosshairMove((param) => {
    if (props.onCrosshairMove && chart) {
      props.onCrosshairMove(chart, param);
    }
    // Update hover values and tooltip position
    if (param.time && param.point && rsi9Series && rsi14Series) {
      const rsi9Val = param.seriesData.get(rsi9Series) as any;
      const rsi14Val = param.seriesData.get(rsi14Series) as any;
      hoverRsi9.value = rsi9Val?.value ?? null;
      hoverRsi14.value = rsi14Val?.value ?? null;
      tooltipVisible.value = true;
      tooltipX.value = param.point.x;
      tooltipY.value = param.point.y;
    } else {
      hoverRsi9.value = null;
      hoverRsi14.value = null;
      tooltipVisible.value = false;
    }
  });

  if (props.onChartReady && rsi14Series) {
    props.onChartReady(chart, rsi14Series);
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
  if (!rsi9Series || !rsi14Series) return;

  const rsi9Data = store.rsiData
    .filter((d) => d.rsi9 !== null)
    .map((d) => ({ time: d.time, value: d.rsi9 as number }));

  const rsi14Data = store.rsiData
    .filter((d) => d.rsi14 !== null)
    .map((d) => ({ time: d.time, value: d.rsi14 as number }));

  rsi9Series.setData(rsi9Data as any);
  rsi14Series.setData(rsi14Data as any);
};

watch(
  () => store.rsiData,
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

    <!-- Floating Tooltip -->
    <div
      v-if="tooltipVisible && (hoverRsi9 !== null || hoverRsi14 !== null)"
      class="absolute pointer-events-none bg-[#1a1a1a] border border-[#444] rounded px-2 py-1 text-xs z-50"
      :style="{ left: tooltipX + 15 + 'px', top: tooltipY + 15 + 'px' }"
    >
      <span class="text-[#22c55e]">RSI9 {{ hoverRsi9?.toFixed(2) ?? '-' }}</span>
      <span class="text-[#ef4444] ml-2">RSI14 {{ hoverRsi14?.toFixed(2) ?? '-' }}</span>
    </div>
  </div>
</template>
