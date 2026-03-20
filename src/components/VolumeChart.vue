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
let volumeSeries: ISeriesApi<'Histogram'> | null = null;

// Crosshair tooltip
const tooltipVisible = ref(false);
const tooltipX = ref(0);
const tooltipY = ref(0);
const hoverVolume = ref<number | null>(null);

const formatVolume = (vol: number) => {
  return vol.toLocaleString();
};

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
        bottom: 0
      },
      minimumWidth: 80 // 設定較大的最小寬度以確保所有圖表對齊
    },
    timeScale: {
      borderColor: '#333',
      visible: true,
      barSpacing: 12,
      minBarSpacing: 4,
      rightOffset: 5,
      fixLeftEdge: true,
      fixRightEdge: true
    }
  });

  // Add volume histogram series
  volumeSeries = chart.addSeries(HistogramSeries, {
    priceFormat: {
      type: 'volume'
    },
    priceScaleId: 'right'
  });

  // Subscribe to crosshair move
  chart.subscribeCrosshairMove((param) => {
    if (props.onCrosshairMove && chart) {
      props.onCrosshairMove(chart, param);
    }
    // Update hover value and tooltip position
    if (param.time && param.point && volumeSeries) {
      const volData = param.seriesData.get(volumeSeries) as any;
      hoverVolume.value = volData?.value ?? null;
      tooltipVisible.value = true;
      tooltipX.value = param.point.x;
      tooltipY.value = param.point.y;
    } else {
      hoverVolume.value = null;
      tooltipVisible.value = false;
    }
  });

  // Notify parent that chart is ready with series for crosshair sync
  if (props.onChartReady && volumeSeries) {
    props.onChartReady(chart, volumeSeries);
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
  if (!volumeSeries) return;
  volumeSeries.setData(store.volumeData as any);
};

// Watch for data changes
watch(
  () => store.volumeData,
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

    <!-- Fixed Title -->
    <div class="absolute top-1 left-1 z-10 text-xs bg-[#1a1a1a] border border-[#333] px-2 py-1 rounded">
      <span class="text-white font-bold">成交量</span>
    </div>

    <!-- Floating Tooltip -->
    <div
      v-if="tooltipVisible && hoverVolume !== null"
      class="absolute pointer-events-none bg-[#1a1a1a] border border-[#444] rounded px-2 py-1 text-xs z-50"
      :style="{ left: tooltipX + 15 + 'px', top: tooltipY + 15 + 'px' }"
    >
      <span class="text-[#26a69a]">{{ formatVolume(hoverVolume) }}</span>
    </div>
  </div>
</template>
