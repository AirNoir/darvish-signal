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
let foreignSeries: ISeriesApi<'Histogram'> | null = null;
let trustSeries: ISeriesApi<'Histogram'> | null = null;
let dealerSeries: ISeriesApi<'Histogram'> | null = null;

// Crosshair tooltip
const tooltipVisible = ref(false);
const tooltipX = ref(0);
const tooltipY = ref(0);
const hoverForeign = ref<number | null>(null);
const hoverTrust = ref<number | null>(null);
const hoverDealer = ref<number | null>(null);

const formatValue = (val: number) => {
  return val.toLocaleString();
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
        bottom: 0.1
      },
      minimumWidth: 80
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

  // Foreign investors (外資)
  foreignSeries = chart.addSeries(HistogramSeries, {
    priceLineVisible: false,
    lastValueVisible: false,
    priceScaleId: 'right'
  });

  // Trust (投信) - use overlay
  trustSeries = chart.addSeries(HistogramSeries, {
    priceLineVisible: false,
    lastValueVisible: false,
    priceScaleId: 'right'
  });

  // Dealer (自營商) - use overlay
  dealerSeries = chart.addSeries(HistogramSeries, {
    priceLineVisible: false,
    lastValueVisible: false,
    priceScaleId: 'right'
  });

  chart.subscribeCrosshairMove((param) => {
    if (props.onCrosshairMove && chart) {
      props.onCrosshairMove(chart, param);
    }
    if (param.time && param.point && foreignSeries && trustSeries && dealerSeries) {
      const foreignVal = param.seriesData.get(foreignSeries) as any;
      const trustVal = param.seriesData.get(trustSeries) as any;
      const dealerVal = param.seriesData.get(dealerSeries) as any;
      hoverForeign.value = foreignVal?.value ?? null;
      hoverTrust.value = trustVal?.value ?? null;
      hoverDealer.value = dealerVal?.value ?? null;
      tooltipVisible.value = true;
      tooltipX.value = param.point.x;
      tooltipY.value = param.point.y;
    } else {
      hoverForeign.value = null;
      hoverTrust.value = null;
      hoverDealer.value = null;
      tooltipVisible.value = false;
    }
  });

  if (props.onChartReady && foreignSeries) {
    props.onChartReady(chart, foreignSeries);
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
  if (!foreignSeries || !trustSeries || !dealerSeries) return;

  const data = store.institutionalData;
  if (!data || data.length === 0) return;

  const foreignData = data.map((d) => ({
    time: d.time,
    value: d.foreign,
    color: d.foreign >= 0 ? '#ef4444' : '#22c55e'
  }));

  const trustData = data.map((d) => ({
    time: d.time,
    value: d.trust,
    color: d.trust >= 0 ? '#f97316' : '#06b6d4'
  }));

  const dealerData = data.map((d) => ({
    time: d.time,
    value: d.dealer,
    color: d.dealer >= 0 ? '#a855f7' : '#84cc16'
  }));

  foreignSeries.setData(foreignData as any);
  trustSeries.setData(trustData as any);
  dealerSeries.setData(dealerData as any);
};

watch(
  () => store.institutionalData,
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
      <span class="text-white font-bold">法人買賣</span>
      <span class="text-[#ef4444]">外資</span>
      <span class="text-[#f97316]">投信</span>
      <span class="text-[#a855f7]">自營</span>
    </div>

    <!-- Floating Tooltip -->
    <div
      v-if="tooltipVisible && (hoverForeign !== null || hoverTrust !== null || hoverDealer !== null)"
      class="absolute pointer-events-none bg-[#1a1a1a] border border-[#444] rounded px-2 py-1 text-xs z-50"
      :style="{ left: tooltipX + 15 + 'px', top: tooltipY + 15 + 'px' }"
    >
      <div class="flex flex-col gap-0.5">
        <span :class="hoverForeign !== null && hoverForeign >= 0 ? 'text-[#ef4444]' : 'text-[#22c55e]'">
          外資 {{ hoverForeign !== null ? formatValue(hoverForeign) : '-' }}
        </span>
        <span :class="hoverTrust !== null && hoverTrust >= 0 ? 'text-[#f97316]' : 'text-[#06b6d4]'">
          投信 {{ hoverTrust !== null ? formatValue(hoverTrust) : '-' }}
        </span>
        <span :class="hoverDealer !== null && hoverDealer >= 0 ? 'text-[#a855f7]' : 'text-[#84cc16]'">
          自營 {{ hoverDealer !== null ? formatValue(hoverDealer) : '-' }}
        </span>
      </div>
    </div>
  </div>
</template>
