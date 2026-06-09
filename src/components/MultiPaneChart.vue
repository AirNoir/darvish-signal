<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { init, dispose, registerOverlay, registerLocale, ActionType, PolygonType, LineType, TooltipShowRule, TooltipShowType } from 'klinecharts';
import type { Chart } from 'klinecharts';
import { useStockStore, type SignalMarker } from '../stores/stockStore';
import type { IndicatorSettings } from '../types';
import { registerCustomIndicators, setExtraDataMap, formatBig, type ExtraValues } from '../lib/klineIndicators';

const props = defineProps<{
  settings: IndicatorSettings;
  indicatorOrder: string[];
}>();

const store = useStockStore();
const wrapperEl = ref<HTMLDivElement | null>(null);
const containerEl = ref<HTMLDivElement | null>(null);
const containerId = `kline-${Math.random().toString(36).slice(2, 10)}`;
let chart: Chart | null = null;

const paneIndicatorMap = new Map<string, string>();

interface HoverTip {
  paneId: string;
  date: string;
  lines: string[];
  colors?: (string | undefined)[];
  x: number;
  y: number;
}

const hoverTips = ref<HoverTip[]>([]);

const tipPositionStyle = (t: HoverTip) => {
  if (!wrapperEl.value) return { display: 'none' };
  const w = wrapperEl.value.clientWidth;
  const offsetX = 12;
  const estWidth = 150;
  let left = t.x + offsetX;
  if (left + estWidth > w) left = t.x - offsetX - estWidth;
  return {
    left: left + 'px',
    top: t.y + 'px'
  };
};

const INDICATOR_NAME: Record<string, string> = {
  volume: 'VOL_BARS',
  volumeMA: 'VOL_MA',
  turnoverRate: 'TR',
  foreignNet: 'FN',
  foreignNetMA: 'FNMA',
  trustNet: 'TN',
  foreignHoldingPct: 'FHP',
  instiHoldingPct: 'IHP',
  majorRetailHolding: 'MRH',
  margin: 'MARGIN',
  short: 'SHORT',
  shortMarginRatio: 'SMR',
  bollinger: 'BB_PCT',
  rsi: 'RSI_API',
  macd: 'MACD_API',
  kd: 'KDJ'
};

const isVisible = (key: string, s: IndicatorSettings): boolean => {
  switch (key) {
    case 'volume': return s.volume;
    case 'volumeMA': return s.volumeMA;
    case 'turnoverRate': return s.turnoverRate;
    case 'foreignNet': return s.foreignNet;
    case 'foreignNetMA': return s.foreignNetMA;
    case 'trustNet': return s.trustNet;
    case 'foreignHoldingPct': return s.foreignHoldingPct;
    case 'instiHoldingPct': return s.instiHoldingPct;
    case 'majorRetailHolding': return s.majorRetailHolding;
    case 'margin': return s.marginBalance || s.marginChange;
    case 'short': return s.shortBalance || s.shortChange;
    case 'shortMarginRatio': return s.shortMarginRatio;
    case 'macd': return s.macd;
    case 'kd': return s.kd;
    case 'rsi': return s.rsi;
    case 'bollinger': return s.bollinger;
    default: return false;
  }
};

const tsOf = (date: string) => new Date(date + 'T00:00:00').getTime();

const buildKlineData = () =>
  store.stockData
    .filter(d => d.open != null && d.high != null && d.low != null && d.close != null)
    .map(d => ({
      timestamp: tsOf(d.time),
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      volume: d.volume ?? 0
    }));

const buildExtras = () => {
  const records: Array<{ timestamp: number; values: ExtraValues }> = [];
  store.stockData.forEach((d, i) => {
    const ts = tsOf(d.time);
    const inst = store.institutionalData[i];
    const fnma = store.foreignNetMAData[i];
    const volMA = store.volumeMAData[i];
    const tr = store.turnoverRateData[i];
    const margin = store.marginData[i];
    const short = store.shortData[i];
    const smr = store.shortMarginRatioData[i];
    const boll = store.bollingerData[i];
    const rsi = store.rsiData[i];
    const macd = store.macdData[i];
    const fhp = store.foreignHoldingPctData[i];
    const ihp = store.instiHoldingPctData[i];
    const mrh = store.majorRetailHoldingData[i];
    records.push({
      timestamp: ts,
      values: {
        foreignNet: inst?.foreign,
        trustNet: inst?.trust,
        turnoverRate: tr?.value,
        volMa5: volMA?.ma5,
        volMa10: volMA?.ma10,
        volMa20: volMA?.ma20,
        fnAvg5: fnma?.avg5,
        fnAvg10: fnma?.avg10,
        fnAvg15: fnma?.avg15,
        fnAvg30: fnma?.avg30,
        marginBalance: margin?.balance,
        marginChange: margin?.change,
        shortBalance: short?.balance,
        shortChange: short?.change,
        shortMarginRatio: smr?.value,
        bbPercentB: boll?.percentB,
        rsi9: rsi?.rsi9,
        rsi14: rsi?.rsi14,
        macd: macd?.macd,
        macdSignal: macd?.signal,
        macdHist: macd?.histogram,
        foreignHoldingPct: fhp?.value,
        instiHoldingPct: ihp?.value,
        majorHolding: mrh?.major,
        retailHolding: mrh?.retail
      }
    });
  });
  return records;
};

const adjustCandlePaneHeight = () => {
  if (!chart) return;
  // 只設 candle pane 的 gap（保留 B/S pin 突出空間）。
  // 不手動設 indicator pane height — 讓 klinecharts 自己分配，
  // 避免破壞 pane 間 scroll 同步、導致拖曳時 K 線釘住 / indicator 跑掉。
  chart.setPaneOptions({ id: 'candle_pane', gap: { top: 50, bottom: 40 } });
};

const reconcileIndicators = () => {
  if (!chart) return;
  const all = chart.getIndicatorByPaneId() as Map<string, Map<string, unknown>> | null;
  if (all && all.forEach) {
    all.forEach((paneIndicators, paneId) => {
      if (paneId === 'candle_pane') return;
      paneIndicators.forEach((_v, name) => {
        chart!.removeIndicator(paneId, name);
      });
    });
  }
  paneIndicatorMap.clear();

  const visible = props.indicatorOrder.filter(k => isVisible(k, props.settings)).slice(0, 6);
  for (const key of visible) {
    const name = INDICATOR_NAME[key];
    if (!name) continue;
    const paneId = chart.createIndicator(name);
    if (paneId) paneIndicatorMap.set(paneId, key);
  }
  adjustCandlePaneHeight();
};

const fmt = (v: number | null | undefined, digits = 2) =>
  v == null || isNaN(v) ? '--' : v.toFixed(digits);

const tipLinesForPane = (paneId: string, k: { open: number; close: number; volume?: number }, ts: number, settings: IndicatorSettings): string[] => {
  if (paneId === 'candle_pane') {
    const change = k.close - k.open;
    const changePct = k.open !== 0 ? (change / k.open) * 100 : 0;
    return [
      `${fmt(k.close)}  (${change >= 0 ? '+' : ''}${fmt(change)} / ${change >= 0 ? '+' : ''}${fmt(changePct)}%)`
    ];
  }
  const key = paneIndicatorMap.get(paneId);
  if (!key) return [];
  const idx = store.stockData.findIndex(d => new Date(d.time + 'T00:00:00').getTime() === ts);
  if (idx < 0) return [];
  switch (key) {
    case 'volume': return [`成交量 ${formatBig(store.stockData[idx]?.volume)}`];
    case 'volumeMA': {
      const m = store.volumeMAData[idx];
      return [`5MA ${formatBig(m?.ma5)}`, `10MA ${formatBig(m?.ma10)}`, `20MA ${formatBig(m?.ma20)}`];
    }
    case 'turnoverRate': return [`週轉率 ${fmt(store.turnoverRateData[idx]?.value)}%`];
    case 'foreignNet': return [`外資 ${formatBig(store.institutionalData[idx]?.foreign)}`];
    case 'foreignNetMA': {
      const f = store.foreignNetMAData[idx];
      return [`5日 ${formatBig(f?.avg5)}`, `10日 ${formatBig(f?.avg10)}`, `15日 ${formatBig(f?.avg15)}`, `30日 ${formatBig(f?.avg30)}`];
    }
    case 'trustNet': return [`投信 ${formatBig(store.institutionalData[idx]?.trust)}`];
    case 'foreignHoldingPct': return [`外資持股 ${fmt(store.foreignHoldingPctData[idx]?.value)}%`];
    case 'instiHoldingPct': return [`法人持股 ${fmt(store.instiHoldingPctData[idx]?.value)}%`];
    case 'majorRetailHolding': {
      const m = store.majorRetailHoldingData[idx];
      return [`大戶 ${fmt(m?.major)}%`, `散戶 ${fmt(m?.retail)}%`];
    }
    case 'margin': {
      const m = store.marginData[idx];
      const lines: string[] = [];
      if (settings.marginBalance) lines.push(`餘額 ${formatBig(m?.balance)}`);
      if (settings.marginChange) lines.push(`增減 ${formatBig(m?.change)}`);
      return lines;
    }
    case 'short': {
      const s = store.shortData[idx];
      const lines: string[] = [];
      if (settings.shortBalance) lines.push(`餘額 ${formatBig(s?.balance)}`);
      if (settings.shortChange) lines.push(`增減 ${formatBig(s?.change)}`);
      return lines;
    }
    case 'shortMarginRatio': return [`券資比 ${fmt(store.shortMarginRatioData[idx]?.value)}%`];
    case 'bollinger': return [`%B ${fmt(store.bollingerData[idx]?.percentB)}`];
    case 'rsi': {
      const r = store.rsiData[idx];
      return [`RSI9 ${fmt(r?.rsi9)}`, `RSI14 ${fmt(r?.rsi14)}`];
    }
    case 'macd': {
      const m = store.macdData[idx];
      return [`MACD ${fmt(m?.macd)}`, `Signal ${fmt(m?.signal)}`, `Hist ${fmt(m?.histogram)}`];
    }
    case 'kd': return ['KDJ'];
    default: return [];
  }
};

// 浮動資訊框的逐行顏色（目前只有大戶散戶需要：大戶藍 / 散戶橘），其餘維持預設色
const tipColorsForPane = (key: string | undefined): (string | undefined)[] | undefined =>
  key === 'majorRetailHolding' ? ['#3b82f6', '#f59e0b'] : undefined;

const drawSignalOverlays = () => {
  if (!chart) return;
  chart.removeOverlay({ groupId: 'signals' });
  const markers: SignalMarker[] = store.signalMarkers ?? [];
  const dataByDate = new Map(store.stockData.map(d => [d.time, d]));
  for (const m of markers) {
    const d = dataByDate.get(m.date);
    if (!d) continue;
    const value = m.type === 'buy' ? d.low : d.high;
    chart.createOverlay({
      name: 'signal_marker',
      groupId: 'signals',
      points: [{ timestamp: tsOf(m.date), value }],
      extendData: m.type,
      lock: true
    });
  }
};

const applyData = () => {
  if (!chart) return;
  setExtraDataMap(buildExtras());
  const data = buildKlineData();
  if (data.length === 0) return;
  chart.applyNewData(data);
  drawSignalOverlays();
};

onMounted(() => {
  if (!containerEl.value) return;
  containerEl.value.id = containerId;

  registerCustomIndicators();

  registerLocale('zh-TW', {
    time: '時間',
    open: '開',
    high: '高',
    low: '低',
    close: '收',
    volume: '量',
    change: '漲跌',
    turnover: '成交額'
  });

  registerOverlay({
    name: 'signal_marker',
    needDefaultPointFigure: false,
    needDefaultXAxisFigure: false,
    needDefaultYAxisFigure: false,
    createPointFigures: ({ overlay, coordinates }) => {
      const c = coordinates[0];
      if (!c) return [];
      const isBuy = overlay.extendData === 'buy';
      const color = isBuy ? '#00BFFF' : '#FF8C00';
      const textColor = '#1a1a1a';
      const label = isBuy ? 'B' : 'S';
      const dir = isBuy ? 1 : -1;

      const gap = 14;
      const headH = 22;
      const headHalfW = 13;

      const tipY = c.y + dir * gap;
      const baseY = tipY + dir * headH;
      const textY = (tipY + 2 * baseY) / 3;

      return [
        {
          type: 'polygon',
          attrs: {
            coordinates: [
              { x: c.x, y: tipY },
              { x: c.x - headHalfW, y: baseY },
              { x: c.x + headHalfW, y: baseY }
            ]
          },
          styles: {
            style: PolygonType.StrokeFill,
            color,
            borderColor: '#ffffff',
            borderSize: 2
          }
        },
        {
          type: 'text',
          attrs: {
            x: c.x,
            y: textY,
            text: label,
            align: 'center',
            baseline: 'middle'
          },
          styles: {
            color: textColor,
            size: 11,
            weight: 'bold',
            family: 'sans-serif',
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            borderSize: 0,
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 0,
            paddingBottom: 0
          }
        }
      ];
    }
  });

  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
  const tooltipRule = isMobile ? TooltipShowRule.None : TooltipShowRule.Always;

  chart = init(containerId, {
    styles: {
      grid: {
        horizontal: { color: '#1a1a1a' },
        vertical: { color: '#1a1a1a' }
      },
      candle: {
        bar: {
          upColor: '#ef5350',
          downColor: '#26a69a',
          upBorderColor: '#ef5350',
          downBorderColor: '#26a69a',
          upWickColor: '#ef5350',
          downWickColor: '#26a69a'
        },
        priceMark: {
          high: { color: '#a0a0a0' },
          low: { color: '#a0a0a0' },
          last: {
            upColor: '#ef5350',
            downColor: '#26a69a',
            noChangeColor: '#888'
          }
        },
        tooltip: {
          showRule: tooltipRule,
          showType: TooltipShowType.Standard
        }
      },
      indicator: {
        bars: [{ style: PolygonType.Fill }],
        lines: [{ size: 1 }],
        tooltip: {
          showRule: TooltipShowRule.Always,
          showType: TooltipShowType.Standard
        }
      },
      xAxis: {
        axisLine: { color: '#333' },
        tickLine: { color: '#333' },
        tickText: { color: '#a0a0a0' }
      },
      yAxis: {
        axisLine: { color: '#333' },
        tickLine: { color: '#333' },
        tickText: { color: '#a0a0a0' }
      },
      separator: { color: '#1a1a1a' },
      crosshair: {
        show: true,
        horizontal: {
          show: true,
          line: { show: true, color: '#888', size: 1, style: LineType.Dashed, dashedValue: [4, 2] },
          text: {
            show: true,
            color: '#fff',
            size: 11,
            family: 'sans-serif',
            weight: 'normal',
            backgroundColor: '#3b82f6',
            borderColor: '#3b82f6',
            borderSize: 1,
            borderRadius: 2,
            paddingLeft: 4,
            paddingRight: 4,
            paddingTop: 2,
            paddingBottom: 2
          }
        },
        vertical: {
          show: true,
          line: { show: true, color: '#888', size: 1, style: LineType.Dashed, dashedValue: [4, 2] },
          text: {
            show: true,
            color: '#fff',
            size: 11,
            family: 'sans-serif',
            weight: 'normal',
            backgroundColor: '#3b82f6',
            borderColor: '#3b82f6',
            borderSize: 1,
            borderRadius: 2,
            paddingLeft: 4,
            paddingRight: 4,
            paddingTop: 2,
            paddingBottom: 2
          }
        }
      },
    }
  });

  if (chart) {
    chart.setLocale('zh-TW');
    chart.setOffsetRightDistance(16);
    chart.setCustomApi({
      formatDate: (_dtf, timestamp) => {
        const d = new Date(timestamp);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      }
    });
    chart.createIndicator(
      { name: 'MA', calcParams: [5, 10, 20] },
      false,
      { id: 'candle_pane' }
    );
    reconcileIndicators();
    applyData();
    adjustCandlePaneHeight();

    const ro = new ResizeObserver(() => adjustCandlePaneHeight());
    ro.observe(containerEl.value);
    onUnmounted(() => ro.disconnect());

    chart.subscribeAction(ActionType.OnCrosshairChange, (data) => {
      const c = data as { kLineData?: { timestamp: number; open: number; close: number; high: number; low: number; volume?: number }; paneId?: string; x?: number; y?: number } | null;
      const k = c?.kLineData;
      if (!chart || !k || typeof k.timestamp !== 'number' || typeof c?.x !== 'number' || typeof c?.y !== 'number' || !c.paneId) {
        hoverTips.value = [];
        store.setSyncedHoverTime(null);
        return;
      }
      const dt = new Date(k.timestamp);
      const iso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      store.setSyncedHoverTime(iso);
      const dateLabel = new Date(k.timestamp).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });

      const cursorX = c.x;
      const activePaneId = c.paneId;
      const activeY = c.y;
      const activeBound = chart.getSize(activePaneId);
      const activeYGlobal = activeBound ? activeBound.top + activeY : activeY;
      const tips: HoverTip[] = [];

      const candleBound = chart.getSize('candle_pane');
      if (candleBound) {
        const lines = tipLinesForPane('candle_pane', k, k.timestamp, props.settings);
        const y = activePaneId === 'candle_pane' ? activeYGlobal : candleBound.top + 6;
        tips.push({ paneId: 'candle_pane', date: dateLabel, lines, x: cursorX, y });
      }

      paneIndicatorMap.forEach((key, paneId) => {
        if (!chart) return;
        const bound = chart.getSize(paneId);
        if (!bound) return;
        const lines = tipLinesForPane(paneId, k, k.timestamp, props.settings);
        if (lines.length === 0) return;
        const y = activePaneId === paneId ? activeYGlobal : bound.top + 6;
        tips.push({ paneId, date: dateLabel, lines, colors: tipColorsForPane(key), x: cursorX, y });
      });

      hoverTips.value = tips;
    });
  }
});

watch(() => store.stockData, () => applyData(), { deep: false });
watch(() => store.signalMarkers, () => drawSignalOverlays(), { deep: false });
watch(
  () => [props.settings, props.indicatorOrder] as const,
  () => reconcileIndicators(),
  { deep: true }
);

onUnmounted(() => {
  if (chart) {
    chart.unsubscribeAction(ActionType.OnCrosshairChange);
  }
  dispose(containerId);
  chart = null;
});
</script>

<template>
  <div ref="wrapperEl" class="chart-wrapper">
    <div ref="containerEl" class="multi-pane-chart"></div>
    <div
      v-for="tip in hoverTips"
      :key="tip.paneId"
      class="hover-tip"
      :style="tipPositionStyle(tip)"
    >
      <div class="tip-date">{{ tip.date }}</div>
      <div v-for="(line, i) in tip.lines" :key="i" class="tip-line" :style="tip.colors && tip.colors[i] ? { color: tip.colors[i] } : undefined">{{ line }}</div>
    </div>
  </div>
</template>

<style scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}
.multi-pane-chart {
  width: 100%;
  height: 100%;
}
.hover-tip {
  position: absolute;
  pointer-events: none;
  background: rgba(20, 20, 20, 0.95);
  border: 1px solid #333;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 11px;
  line-height: 1.4;
  color: #e0e0e0;
  white-space: nowrap;
  z-index: 50;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}
.tip-date {
  color: #888;
  font-size: 10px;
  margin-bottom: 2px;
}
.tip-line {
  color: #e0e0e0;
}
</style>
