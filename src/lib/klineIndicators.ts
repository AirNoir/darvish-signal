import { registerIndicator } from 'klinecharts';
import type { KLineData } from 'klinecharts';

export interface ExtraValues {
  foreignNet?: number | null;
  trustNet?: number | null;
  turnoverRate?: number | null;
  volMa5?: number | null;
  volMa10?: number | null;
  volMa20?: number | null;
  fnAvg5?: number | null;
  fnAvg10?: number | null;
  fnAvg15?: number | null;
  fnAvg30?: number | null;
  marginBalance?: number | null;
  marginChange?: number | null;
  shortBalance?: number | null;
  shortChange?: number | null;
  shortMarginRatio?: number | null;
  bbPercentB?: number | null;
  rsi9?: number | null;
  rsi14?: number | null;
  macd?: number | null;
  macdSignal?: number | null;
  macdHist?: number | null;
  foreignHoldingPct?: number | null;
  instiHoldingPct?: number | null;
}

const lookup = new Map<number, ExtraValues>();

export function setExtraDataMap(records: Array<{ timestamp: number; values: ExtraValues }>) {
  lookup.clear();
  for (const r of records) lookup.set(r.timestamp, r.values);
}

const get = (d: KLineData, key: keyof ExtraValues): number | null => {
  const v = lookup.get(d.timestamp)?.[key];
  return v == null ? null : v;
};

const histColor = (v: number | null | undefined) => ((v ?? 0) >= 0 ? '#ef5350' : '#26a69a');

const formatBig = (v: number | null | undefined): string => {
  if (v == null || isNaN(v)) return '--';
  const abs = Math.abs(v);
  if (abs >= 1e8) return (v / 1e8).toFixed(2) + '億';
  if (abs >= 1e4) return (v / 1e4).toFixed(2) + '萬';
  return v.toFixed(0);
};


let registered = false;

export function registerCustomIndicators() {
  if (registered) return;
  registered = true;

  // 成交量 (僅往上長，紅綠靠顏色區分)
  registerIndicator<{ value: number | null }>({
    name: 'VOL_BARS',
    shortName: '成交量',
    precision: 0,
    minValue: 0,
    shouldFormatBigNumber: true,
    figures: [
      {
        key: 'value',
        title: '成交量: ',
        type: 'bar',
        baseValue: 0,
        styles: ({ current }) => ({
          color: (current.kLineData?.close ?? 0) >= (current.kLineData?.open ?? 0) ? '#ef5350' : '#26a69a'
        })
      }
    ],
    calc: (dataList) => dataList.map((d) => ({ value: d.volume ?? 0 }))
  });

  // 成交均量
  registerIndicator<{ ma5: number | null; ma10: number | null; ma20: number | null }>({
    name: 'VOL_MA',
    shortName: '成交均量',
    precision: 0,
    minValue: 0,
    shouldFormatBigNumber: true,
    figures: [
      { key: 'ma5', title: 'MA5: ', type: 'line', styles: () => ({ color: '#f59e0b' }) },
      { key: 'ma10', title: 'MA10: ', type: 'line', styles: () => ({ color: '#3b82f6' }) },
      { key: 'ma20', title: 'MA20: ', type: 'line', styles: () => ({ color: '#8b5cf6' }) }
    ],
    calc: (dataList) =>
      dataList.map((d) => ({
        ma5: get(d, 'volMa5'),
        ma10: get(d, 'volMa10'),
        ma20: get(d, 'volMa20')
      }))
  });

  // 週轉率
  registerIndicator<{ value: number | null }>({
    name: 'TR',
    shortName: '週轉率',
    precision: 2,
    figures: [
      { key: 'value', title: '週轉率: ', type: 'bar', styles: () => ({ color: '#8b5cf6' }) }
    ],
    calc: (dataList) => dataList.map((d) => ({ value: get(d, 'turnoverRate') }))
  });

  // 外資買賣超
  registerIndicator<{ value: number | null }>({
    name: 'FN',
    shortName: '外資買賣超',
    precision: 0,
    shouldFormatBigNumber: true,
    figures: [
      {
        key: 'value',
        title: '外資: ',
        type: 'bar',
        baseValue: 0,
        styles: ({ current }) => ({ color: histColor(current.indicatorData?.value) })
      }
    ],
    calc: (dataList) => dataList.map((d) => ({ value: get(d, 'foreignNet') }))
  });

  // 外資買超均線
  registerIndicator<{ avg5: number | null; avg10: number | null; avg15: number | null; avg30: number | null }>({
    name: 'FNMA',
    shortName: '外資均線',
    precision: 0,
    shouldFormatBigNumber: true,
    figures: [
      { key: 'avg5', title: '5日: ', type: 'line', styles: () => ({ color: '#f59e0b' }) },
      { key: 'avg10', title: '10日: ', type: 'line', styles: () => ({ color: '#3b82f6' }) },
      { key: 'avg15', title: '15日: ', type: 'line', styles: () => ({ color: '#8b5cf6' }) },
      { key: 'avg30', title: '30日: ', type: 'line', styles: () => ({ color: '#ec4899' }) }
    ],
    calc: (dataList) =>
      dataList.map((d) => ({
        avg5: get(d, 'fnAvg5'),
        avg10: get(d, 'fnAvg10'),
        avg15: get(d, 'fnAvg15'),
        avg30: get(d, 'fnAvg30')
      }))
  });

  // 投信買賣超
  registerIndicator<{ value: number | null }>({
    name: 'TN',
    shortName: '投信買賣超',
    precision: 0,
    shouldFormatBigNumber: true,
    figures: [
      {
        key: 'value',
        title: '投信: ',
        type: 'bar',
        baseValue: 0,
        styles: ({ current }) => ({ color: histColor(current.indicatorData?.value) })
      }
    ],
    calc: (dataList) => dataList.map((d) => ({ value: get(d, 'trustNet') }))
  });

  // 融資 (餘額 + 增減)
  registerIndicator<{ balance: number | null; change: number | null }>({
    name: 'MARGIN',
    shortName: '融資',
    precision: 0,
    shouldFormatBigNumber: true,
    figures: [
      { key: 'balance', title: '融資餘額: ', type: 'line', styles: () => ({ color: '#3b82f6' }) },
      {
        key: 'change',
        title: '融資增減: ',
        type: 'bar',
        baseValue: 0,
        styles: ({ current }) => ({ color: histColor(current.indicatorData?.change) })
      }
    ],
    calc: (dataList) =>
      dataList.map((d) => ({ balance: get(d, 'marginBalance'), change: get(d, 'marginChange') }))
  });

  // 融券 (餘額 + 增減)
  registerIndicator<{ balance: number | null; change: number | null }>({
    name: 'SHORT',
    shortName: '融券',
    precision: 0,
    shouldFormatBigNumber: true,
    figures: [
      { key: 'balance', title: '融券餘額: ', type: 'line', styles: () => ({ color: '#ec4899' }) },
      {
        key: 'change',
        title: '融券增減: ',
        type: 'bar',
        baseValue: 0,
        styles: ({ current }) => ({ color: histColor(current.indicatorData?.change) })
      }
    ],
    calc: (dataList) =>
      dataList.map((d) => ({ balance: get(d, 'shortBalance'), change: get(d, 'shortChange') }))
  });

  // 券資比
  registerIndicator<{ value: number | null }>({
    name: 'SMR',
    shortName: '券資比',
    precision: 2,
    figures: [
      { key: 'value', title: '券資比: ', type: 'line', styles: () => ({ color: '#ec4899' }) }
    ],
    calc: (dataList) => dataList.map((d) => ({ value: get(d, 'shortMarginRatio') }))
  });

  // 布林 %B (replaces band view with the existing %B sub-pane behavior)
  registerIndicator<{ value: number | null }>({
    name: 'BB_PCT',
    shortName: '布林 %B',
    precision: 2,
    minValue: -0.5,
    maxValue: 1.5,
    figures: [
      { key: 'value', title: '%B: ', type: 'line', styles: () => ({ color: '#a855f7' }) }
    ],
    calc: (dataList) => dataList.map((d) => ({ value: get(d, 'bbPercentB') }))
  });

  // RSI 9 + 14（用 store 已算好的值，避免演算法差異）
  registerIndicator<{ rsi9: number | null; rsi14: number | null }>({
    name: 'RSI_API',
    shortName: 'RSI',
    precision: 2,
    minValue: 0,
    maxValue: 100,
    figures: [
      { key: 'rsi9', title: 'RSI9: ', type: 'line', styles: () => ({ color: '#22c55e' }) },
      { key: 'rsi14', title: 'RSI14: ', type: 'line', styles: () => ({ color: '#ef4444' }) }
    ],
    calc: (dataList) => dataList.map((d) => ({ rsi9: get(d, 'rsi9'), rsi14: get(d, 'rsi14') }))
  });

  // 外資持股占比 (%)
  registerIndicator<{ value: number | null }>({
    name: 'FHP',
    shortName: '外資持股',
    precision: 2,
    figures: [
      { key: 'value', title: '外資持股: ', type: 'line', styles: () => ({ color: '#3b82f6' }) }
    ],
    calc: (dataList) => dataList.map((d) => ({ value: get(d, 'foreignHoldingPct') }))
  });

  // 三大法人持股占比 (%)
  registerIndicator<{ value: number | null }>({
    name: 'IHP',
    shortName: '法人持股',
    precision: 2,
    figures: [
      { key: 'value', title: '法人持股: ', type: 'line', styles: () => ({ color: '#f59e0b' }) }
    ],
    calc: (dataList) => dataList.map((d) => ({ value: get(d, 'instiHoldingPct') }))
  });

  // MACD（用 store 已算好的值）
  registerIndicator<{ dif: number | null; dea: number | null; hist: number | null }>({
    name: 'MACD_API',
    shortName: 'MACD',
    precision: 2,
    figures: [
      {
        key: 'hist',
        title: 'MACD: ',
        type: 'bar',
        baseValue: 0,
        styles: ({ current }) => ({ color: histColor(current.indicatorData?.hist) })
      },
      { key: 'dif', title: 'DIF: ', type: 'line', styles: () => ({ color: '#3b82f6' }) },
      { key: 'dea', title: 'DEA: ', type: 'line', styles: () => ({ color: '#f59e0b' }) }
    ],
    calc: (dataList) =>
      dataList.map((d) => ({ dif: get(d, 'macd'), dea: get(d, 'macdSignal'), hist: get(d, 'macdHist') }))
  });
}

// Helper used by callers/tooltips
export { formatBig };
