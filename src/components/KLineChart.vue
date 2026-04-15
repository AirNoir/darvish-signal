<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { createChart, CandlestickSeries, LineSeries, CrosshairMode, createSeriesMarkers } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, Time } from 'lightweight-charts';
import { useStockStore } from '../stores/stockStore';

const props = defineProps<{
  onChartReady?: (chart: IChartApi, series: any) => void;
  onCrosshairMove?: (chart: IChartApi, param: any) => void;
}>();

const store = useStockStore();
const chartContainer = ref<HTMLElement | null>(null);
let chart: IChartApi | null = null;

// Hover data for top-left info display
const hoverData = ref<{
  date: string | null;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  ma5: number | null;
  ma20: number | null;
} | null>(null);

// Tooltip position (relative to container)
const tooltipVisible = ref(false);
const tooltipX = ref(0);
const tooltipY = ref(0);

// 計算 tooltip 位置（避免超出容器邊界）
const tooltipStyle = computed(() => {
  const containerWidth = chartContainer.value?.clientWidth ?? 800;
  const containerHeight = chartContainer.value?.clientHeight ?? 400;
  const tooltipWidth = 120;
  const tooltipHeight = 24;

  let left = tooltipX.value + 12;
  let top = tooltipY.value - 12;

  // 右邊界檢查
  if (left + tooltipWidth > containerWidth) {
    left = tooltipX.value - tooltipWidth - 12;
  }
  // 上邊界檢查
  if (top < 0) {
    top = tooltipY.value + 12;
  }
  // 下邊界檢查
  if (top + tooltipHeight > containerHeight) {
    top = containerHeight - tooltipHeight - 4;
  }

  return {
    left: left + 'px',
    top: top + 'px'
  };
});

let candlestickSeries: ISeriesApi<'Candlestick'> | null = null;
let ma5Series: ISeriesApi<'Line'> | null = null;
let ma20Series: ISeriesApi<'Line'> | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let markersPlugin: any = null;

// 根據同步的時間更新 hover 數據
const updateHoverDataFromTime = (time: Time | null) => {
  if (!time || !candlestickSeries || !ma5Series || !ma20Series) {
    hoverData.value = null;
    tooltipVisible.value = false;
    return;
  }

  const candleData = store.candlestickData.find(d => d.time === time);
  const ma5Data = store.ma5Data.find(d => d.time === time);
  const ma20Data = store.ma20Data.find(d => d.time === time);

  if (candleData) {
    hoverData.value = {
      date: time as string,
      open: candleData.open,
      high: candleData.high,
      low: candleData.low,
      close: candleData.close,
      ma5: ma5Data?.value ?? null,
      ma20: ma20Data?.value ?? null
    };

    // 計算 tooltip 位置（顯示在收盤價位置）
    if (chart && candleData.close != null) {
      const timeCoord = chart.timeScale().timeToCoordinate(time);
      const priceCoord = candlestickSeries.priceToCoordinate(candleData.close);
      if (timeCoord !== null && priceCoord !== null) {
        tooltipX.value = timeCoord;
        tooltipY.value = priceCoord;
        tooltipVisible.value = true;
      }
    }
  }
};

// 監聽 store 中同步的 hover 時間變化
watch(
  () => store.syncedHoverTime,
  (newTime) => {
    updateHoverDataFromTime(newTime);
  },
  { immediate: true }
);

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
      minimumWidth: 70,
      scaleMargins: {
        top: 0.02,
        bottom: 0.02
      }
    },
    timeScale: {
      borderColor: '#333',
      timeVisible: true,
      secondsVisible: false,
      barSpacing: 12,
      minBarSpacing: 4,
      rightOffset: 0,
      fixLeftEdge: true,
      fixRightEdge: true
    }
  });

  candlestickSeries = chart.addSeries(CandlestickSeries, {
    upColor: '#ef5350',
    downColor: '#26a69a',
    borderUpColor: '#ef5350',
    borderDownColor: '#26a69a',
    wickUpColor: '#ef5350',
    wickDownColor: '#26a69a'
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
    // Update hover data
    if (param.time && candlestickSeries && ma5Series && ma20Series) {
      const ohlc = param.seriesData.get(candlestickSeries) as any;
      const ma5Val = param.seriesData.get(ma5Series) as any;
      const ma20Val = param.seriesData.get(ma20Series) as any;
      const closePrice = ohlc?.close ?? null;
      if (ohlc) {
        hoverData.value = {
          date: param.time as string,
          open: ohlc.open ?? null,
          high: ohlc.high ?? null,
          low: ohlc.low ?? null,
          close: closePrice,
          ma5: ma5Val?.value ?? null,
          ma20: ma20Val?.value ?? null
        };

        // 計算 tooltip 位置（顯示在收盤價位置）
        if (closePrice != null) {
          const timeCoord = chart!.timeScale().timeToCoordinate(param.time);
          const priceCoord = candlestickSeries!.priceToCoordinate(closePrice);
          if (timeCoord !== null && priceCoord !== null) {
            tooltipX.value = timeCoord;
            tooltipY.value = priceCoord;
            tooltipVisible.value = true;
          }
        }
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

  const validDates = new Set(store.candlestickData.map(d => d.time));

  const markers = store.signalMarkers
    .filter(m => validDates.has(m.date))
    .map(m => ({
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

    <!-- 左上角固定資訊顯示 -->
    <div class="absolute top-1 left-1 z-10 flex items-center gap-1 text-[10px] pointer-events-none">
      <span class="text-white font-bold bg-[#1a1a1a]/80 px-1 rounded">K線</span>
      <span class="text-[#f59e0b] bg-[#1a1a1a]/80 px-1 rounded">MA5</span>
      <span class="text-[#8b5cf6] bg-[#1a1a1a]/80 px-1 rounded">MA20</span>
      <span v-if="store.isLoadingMarkers" class="text-[#666] bg-[#1a1a1a]/80 px-1 rounded">載入中...</span>
    </div>

    <!-- Hover 時顯示的詳細資訊 (左上角第二行) -->
    <div
      v-if="hoverData"
      class="absolute top-5 left-1 z-10 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] pointer-events-none bg-[#1a1a1a]/90 px-1.5 py-0.5 rounded border border-[#333]"
    >
      <span class="text-[#3b82f6]">{{ hoverData.date }}</span>
      <span><span class="text-[#888]">開</span> <span class="text-white">{{ hoverData.open?.toFixed(2) }}</span></span>
      <span><span class="text-[#888]">高</span> <span class="text-[#26a69a]">{{ hoverData.high?.toFixed(2) }}</span></span>
      <span><span class="text-[#888]">低</span> <span class="text-[#ef5350]">{{ hoverData.low?.toFixed(2) }}</span></span>
      <span><span class="text-[#888]">收</span> <span class="text-white">{{ hoverData.close?.toFixed(2) }}</span></span>
      <span class="text-[#f59e0b]">MA5 {{ hoverData.ma5?.toFixed(2) ?? '-' }}</span>
      <span class="text-[#8b5cf6]">MA20 {{ hoverData.ma20?.toFixed(2) ?? '-' }}</span>
    </div>

    <!-- Floating Tooltip - 跟隨滑鼠 -->
    <div
      v-if="tooltipVisible && hoverData"
      class="absolute pointer-events-none bg-[#1a1a1a] border border-[#444] rounded px-1.5 py-0.5 text-[10px] z-50 whitespace-nowrap"
      :style="tooltipStyle"
    >
      <span class="text-[#3b82f6]">{{ hoverData.date }}</span>
      <span class="text-white ml-1">{{ hoverData.close?.toFixed(2) }}</span>
    </div>
  </div>
</template>
