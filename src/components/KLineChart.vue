<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { createChart, CandlestickSeries, LineSeries, CrosshairMode, createSeriesMarkers } from 'lightweight-charts';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';
import { useStockStore } from '../stores/stockStore';

const props = defineProps<{
  onChartReady?: (chart: IChartApi, series: any) => void;
  onCrosshairMove?: (chart: IChartApi, param: any) => void;
}>();

const store = useStockStore();
const chartContainer = ref<HTMLElement | null>(null);
let chart: IChartApi | null = null;

// Crosshair tooltip
const tooltipVisible = ref(false);
const tooltipX = ref(0);
const tooltipY = ref(0);
const hoverData = ref<{
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  ma5: number | null;
  ma20: number | null;
} | null>(null);
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
      mode: CrosshairMode.Normal,
      vertLine: {
        width: 1,
        color: '#505050',
        style: 0, // Solid line
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
      minimumWidth: 80 // 設定較大的最小寬度以確保所有圖表對齊
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
    // Update hover data and tooltip position
    if (param.time && param.point && candlestickSeries && ma5Series && ma20Series) {
      const ohlc = param.seriesData.get(candlestickSeries) as any;
      const ma5Val = param.seriesData.get(ma5Series) as any;
      const ma20Val = param.seriesData.get(ma20Series) as any;
      if (ohlc) {
        hoverData.value = {
          open: ohlc.open ?? null,
          high: ohlc.high ?? null,
          low: ohlc.low ?? null,
          close: ohlc.close ?? null,
          ma5: ma5Val?.value ?? null,
          ma20: ma20Val?.value ?? null
        };
        tooltipVisible.value = true;
        tooltipX.value = param.point.x;
        tooltipY.value = param.point.y;
      }
    } else {
      hoverData.value = null;
      tooltipVisible.value = false;
    }
  });

  if (props.onChartReady && candlestickSeries) {
    props.onChartReady(chart, candlestickSeries);
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
  <div class="relative w-full h-full overflow-hidden">
    <div ref="chartContainer" class="w-full h-full"></div>

    <!-- Fixed Title -->
    <div class="absolute top-1 left-1 z-10 flex items-center gap-2 text-xs bg-[#1a1a1a] border border-[#333] px-2 py-1 rounded">
      <span class="text-white font-bold">K線圖</span>
      <span class="text-[#f59e0b]">MA5</span>
      <span class="text-[#8b5cf6]">MA20</span>
      <span class="text-[#FFD700]">▲買</span>
      <span class="text-[#E040FB]">▼賣</span>
      <span v-if="store.isLoadingMarkers" class="text-[#666]">載入中...</span>
    </div>

    <!-- Floating Tooltip -->
    <div
      v-if="tooltipVisible && hoverData"
      class="absolute pointer-events-none bg-[#1a1a1a] border border-[#444] rounded px-2 py-1 text-xs z-50 whitespace-nowrap"
      :style="{ left: tooltipX + 15 + 'px', top: tooltipY + 15 + 'px' }"
    >
      <div class="flex flex-col gap-0.5">
        <div class="flex gap-2">
          <span class="text-[#888]">開</span><span class="text-white">{{ hoverData.open?.toFixed(2) }}</span>
          <span class="text-[#888]">高</span><span class="text-[#26a69a]">{{ hoverData.high?.toFixed(2) }}</span>
        </div>
        <div class="flex gap-2">
          <span class="text-[#888]">低</span><span class="text-[#ef5350]">{{ hoverData.low?.toFixed(2) }}</span>
          <span class="text-[#888]">收</span><span class="text-white">{{ hoverData.close?.toFixed(2) }}</span>
        </div>
        <div class="flex gap-2 border-t border-[#333] pt-0.5 mt-0.5">
          <span class="text-[#f59e0b]">MA5 {{ hoverData.ma5?.toFixed(2) ?? '-' }}</span>
          <span class="text-[#8b5cf6]">MA20 {{ hoverData.ma20?.toFixed(2) ?? '-' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
