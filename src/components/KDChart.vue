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
let kSeries: ISeriesApi<'Line'> | null = null;
let dSeries: ISeriesApi<'Line'> | null = null;

// Crosshair tooltip
const tooltipVisible = ref(false);
const tooltipX = ref(0);
const tooltipY = ref(0);
const hoverK = ref<number | null>(null);
const hoverD = ref<number | null>(null);

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
      rightOffset: 5,
      fixLeftEdge: true,
      fixRightEdge: true
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
    // Update hover values and tooltip position
    if (param.time && param.point && kSeries && dSeries) {
      const kVal = param.seriesData.get(kSeries) as any;
      const dVal = param.seriesData.get(dSeries) as any;
      hoverK.value = kVal?.value ?? null;
      hoverD.value = dVal?.value ?? null;
      tooltipVisible.value = true;
      tooltipX.value = param.point.x;
      tooltipY.value = param.point.y;
    } else {
      hoverK.value = null;
      hoverD.value = null;
      tooltipVisible.value = false;
    }
  });

  // Notify parent that chart is ready with series for crosshair sync
  if (props.onChartReady && kSeries) {
    props.onChartReady(chart, kSeries);
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
  <div class="relative w-full h-full overflow-hidden">
    <div ref="chartContainer" class="w-full h-full"></div>

    <!-- Floating Tooltip -->
    <div
      v-if="tooltipVisible && (hoverK !== null || hoverD !== null)"
      class="absolute pointer-events-none bg-[#1a1a1a] border border-[#444] rounded px-2 py-1 text-xs z-50"
      :style="{ left: tooltipX + 15 + 'px', top: tooltipY + 15 + 'px' }"
    >
      <span class="text-[#3b82f6]">K {{ hoverK?.toFixed(2) ?? '-' }}</span>
      <span class="text-[#f59e0b] ml-2">D {{ hoverD?.toFixed(2) ?? '-' }}</span>
    </div>
  </div>
</template>
