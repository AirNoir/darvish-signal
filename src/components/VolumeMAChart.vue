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
let ma5Series: ISeriesApi<'Line'> | null = null;
let ma10Series: ISeriesApi<'Line'> | null = null;
let ma20Series: ISeriesApi<'Line'> | null = null;

const tooltipVisible = ref(false);
const tooltipX = ref(0);
const tooltipY = ref(0);
const hoverMa5 = ref<number | null>(null);
const hoverMa10 = ref<number | null>(null);
const hoverMa20 = ref<number | null>(null);

const formatValue = (val: number) => val.toLocaleString();

// Format large numbers with K/M suffix for Y-axis
const formatLargeNumber = (price: number) => {
  const abs = Math.abs(price);
  if (abs >= 1000000) return (price / 1000000).toFixed(1) + 'M';
  if (abs >= 1000) return (price / 1000).toFixed(0) + 'K';
  return price.toFixed(0);
};

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
    rightPriceScale: { borderColor: '#333', scaleMargins: { top: 0.1, bottom: 0.1 }, minimumWidth: 70 },
    timeScale: { borderColor: '#333', visible: true, barSpacing: 12, minBarSpacing: 4, rightOffset: 5, fixLeftEdge: true, fixRightEdge: true }
  });

  ma5Series = chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
  ma10Series = chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
  ma20Series = chart.addSeries(LineSeries, { color: '#8b5cf6', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });

  chart.subscribeCrosshairMove((param) => {
    if (props.onCrosshairMove && chart) props.onCrosshairMove(chart, param);
    if (param.time && param.point && ma5Series && ma10Series && ma20Series) {
      const v5 = param.seriesData.get(ma5Series) as any;
      const v10 = param.seriesData.get(ma10Series) as any;
      const v20 = param.seriesData.get(ma20Series) as any;
      hoverMa5.value = v5?.value ?? null;
      hoverMa10.value = v10?.value ?? null;
      hoverMa20.value = v20?.value ?? null;
      tooltipVisible.value = true;
      tooltipX.value = param.point.x;
      tooltipY.value = param.point.y;
    } else {
      hoverMa5.value = null;
      hoverMa10.value = null;
      hoverMa20.value = null;
      tooltipVisible.value = false;
    }
  });

  if (props.onChartReady && ma5Series) props.onChartReady(chart, ma5Series);

  const resizeObserver = new ResizeObserver(() => {
    if (chart && chartContainer.value) {
      chart.applyOptions({ width: chartContainer.value.clientWidth, height: chartContainer.value.clientHeight });
    }
  });
  resizeObserver.observe(chartContainer.value);
  updateData();
};

const updateData = () => {
  if (!ma5Series || !ma10Series || !ma20Series) return;
  const data = store.volumeMAData;
  ma5Series.setData(data.filter(d => d.ma5 !== null).map(d => ({ time: d.time, value: d.ma5 as number })) as any);
  ma10Series.setData(data.filter(d => d.ma10 !== null).map(d => ({ time: d.time, value: d.ma10 as number })) as any);
  ma20Series.setData(data.filter(d => d.ma20 !== null).map(d => ({ time: d.time, value: d.ma20 as number })) as any);
};

watch(() => store.volumeMAData, () => updateData(), { deep: true });
onMounted(() => initChart());
onUnmounted(() => { if (chart) { chart.remove(); chart = null; } });
defineExpose({ getChart: () => chart });
</script>

<template>
  <div class="relative w-full h-full overflow-hidden">
    <div ref="chartContainer" class="w-full h-full"></div>
    <div
      v-if="tooltipVisible && (hoverMa5 !== null || hoverMa10 !== null || hoverMa20 !== null)"
      class="absolute pointer-events-none bg-[#1a1a1a] border border-[#444] rounded px-2 py-1 text-xs z-50"
      :style="{ left: tooltipX + 15 + 'px', top: tooltipY + 15 + 'px' }"
    >
      <div class="flex flex-col gap-0.5">
        <span class="text-[#f59e0b]">5日 {{ hoverMa5 !== null ? formatValue(hoverMa5) : '-' }}</span>
        <span class="text-[#3b82f6]">10日 {{ hoverMa10 !== null ? formatValue(hoverMa10) : '-' }}</span>
        <span class="text-[#8b5cf6]">20日 {{ hoverMa20 !== null ? formatValue(hoverMa20) : '-' }}</span>
      </div>
    </div>
  </div>
</template>
