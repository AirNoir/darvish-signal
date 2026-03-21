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
let percentBSeries: ISeriesApi<'Line'> | null = null;

// Crosshair tooltip
const tooltipVisible = ref(false);
const tooltipX = ref(0);
const tooltipY = ref(0);
const hoverPercentB = ref<number | null>(null);

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
      minimumWidth: 65 // 設定較大的最小寬度以確保所有圖表對齊
    },
    timeScale: {
      borderColor: '#333',
      timeVisible: true,
      secondsVisible: false,
      barSpacing: 12,
      minBarSpacing: 4,
      rightOffset: 5,
      fixLeftEdge: true,
      fixRightEdge: true
    }
  });

  // Bollinger %B line
  percentBSeries = chart.addSeries(LineSeries, {
    color: '#a855f7',
    lineWidth: 1,
    priceLineVisible: false,
    lastValueVisible: false
  });

  chart.subscribeCrosshairMove((param) => {
    if (props.onCrosshairMove && chart) {
      props.onCrosshairMove(chart, param);
    }
    // Update hover value and tooltip position
    if (param.time && param.point && percentBSeries) {
      const val = param.seriesData.get(percentBSeries) as any;
      hoverPercentB.value = val?.value ?? null;
      tooltipVisible.value = true;
      tooltipX.value = param.point.x;
      tooltipY.value = param.point.y;
    } else {
      hoverPercentB.value = null;
      tooltipVisible.value = false;
    }
  });

  if (props.onChartReady && percentBSeries) {
    props.onChartReady(chart, percentBSeries);
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
  if (!percentBSeries) return;

  const percentBData = store.bollingerData
    .filter((d) => d.percentB !== null)
    .map((d) => ({ time: d.time, value: d.percentB as number }));

  percentBSeries.setData(percentBData as any);
};

watch(
  () => store.bollingerData,
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
      v-if="tooltipVisible && hoverPercentB !== null"
      class="absolute pointer-events-none bg-[#1a1a1a] border border-[#444] rounded px-2 py-1 text-xs z-50"
      :style="{ left: tooltipX + 15 + 'px', top: tooltipY + 15 + 'px' }"
    >
      <span class="text-[#a855f7]">%B {{ hoverPercentB.toFixed(2) }}</span>
    </div>
  </div>
</template>
