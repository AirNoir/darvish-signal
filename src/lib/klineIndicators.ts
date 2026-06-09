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
  majorHolding?: number | null;
  retailHolding?: number | null;
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


// 「漂亮刻度」：回傳落在 [min,max] 內的整齊刻度值
function niceTicks(min: number, max: number, count = 4): number[] {
  if (!isFinite(min) || !isFinite(max) || min === max) return isFinite(min) ? [min] : [];
  const niceNum = (range: number, round: boolean): number => {
    const exp = Math.floor(Math.log10(range));
    const frac = range / Math.pow(10, exp);
    let nf: number;
    if (round) nf = frac < 1.5 ? 1 : frac < 3 ? 2 : frac < 7 ? 5 : 10;
    else nf = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10;
    return nf * Math.pow(10, exp);
  };
  const step = niceNum((max - min) / (count - 1), true) || 1;
  const out: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + step * 0.001; v += step) out.push(Number(v.toFixed(4)));
  return out;
}
const fmtPct = (v: number): string => (Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1));

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
      { key: 'ma5', type: 'line', styles: () => ({ color: '#f59e0b' }) },
      { key: 'ma10', type: 'line', styles: () => ({ color: '#3b82f6' }) },
      { key: 'ma20', type: 'line', styles: () => ({ color: '#8b5cf6' }) }
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
      { key: 'value', type: 'bar', styles: () => ({ color: '#8b5cf6' }) }
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
      { key: 'avg5', type: 'line', styles: () => ({ color: '#f59e0b' }) },
      { key: 'avg10', type: 'line', styles: () => ({ color: '#3b82f6' }) },
      { key: 'avg15', type: 'line', styles: () => ({ color: '#8b5cf6' }) },
      { key: 'avg30', type: 'line', styles: () => ({ color: '#ec4899' }) }
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
      { key: 'balance', type: 'line', styles: () => ({ color: '#3b82f6' }) },
      {
        key: 'change',
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
      { key: 'balance', type: 'line', styles: () => ({ color: '#ec4899' }) },
      {
        key: 'change',
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
      { key: 'value', type: 'line', styles: () => ({ color: '#ec4899' }) }
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
      { key: 'value', type: 'line', styles: () => ({ color: '#a855f7' }) }
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
      { key: 'rsi9', type: 'line', styles: () => ({ color: '#22c55e' }) },
      { key: 'rsi14', type: 'line', styles: () => ({ color: '#ef4444' }) }
    ],
    calc: (dataList) => dataList.map((d) => ({ rsi9: get(d, 'rsi9'), rsi14: get(d, 'rsi14') }))
  });

  // 外資持股占比 (%)
  registerIndicator<{ value: number | null }>({
    name: 'FHP',
    shortName: '外資持股',
    precision: 2,
    figures: [
      { key: 'value', type: 'line', styles: () => ({ color: '#3b82f6' }) }
    ],
    calc: (dataList) => dataList.map((d) => ({ value: get(d, 'foreignHoldingPct') }))
  });

  // 三大法人持股占比 (%)
  registerIndicator<{ value: number | null }>({
    name: 'IHP',
    shortName: '法人持股',
    precision: 2,
    figures: [
      { key: 'value', type: 'line', styles: () => ({ color: '#f59e0b' }) }
    ],
    calc: (dataList) => dataList.map((d) => ({ value: get(d, 'instiHoldingPct') }))
  });

  // 大戶 / 散戶持股 (%) — 雙軸交錯：
  // 散戶走原生右軸(橘線)，大戶用 custom draw 換算到散戶範圍後疊上(藍線)+ 左側自繪刻度
  registerIndicator<{ major: number | null; retail: number | null }>({
    name: 'MRH',
    shortName: '大戶散戶',
    precision: 1,
    figures: [
      { key: 'retail', type: 'line', styles: () => ({ color: '#f59e0b' }) }
    ],
    calc: (dataList) => dataList.map((d) => ({ major: get(d, 'majorHolding'), retail: get(d, 'retailHolding') })),
    draw: ({ ctx, kLineDataList, visibleRange, bounding, xAxis, yAxis }) => {
      const { from, to } = visibleRange;
      let majMin = Infinity, majMax = -Infinity, sanMin = Infinity, sanMax = -Infinity;
      for (let i = from; i < to; i++) {
        const d = kLineDataList[i];
        if (!d) continue;
        const maj = get(d, 'majorHolding');
        const san = get(d, 'retailHolding');
        if (maj != null) { if (maj < majMin) majMin = maj; if (maj > majMax) majMax = maj; }
        if (san != null) { if (san < sanMin) sanMin = san; if (san > sanMax) sanMax = san; }
      }
      if (!isFinite(majMin) || !isFinite(sanMin)) return false;
      if (majMin === majMax) { majMin -= 1; majMax += 1; }
      if (sanMin === sanMax) { sanMin -= 1; sanMax += 1; }
      // 把大戶值換算到散戶數值範圍 → 兩條線占同一個 pixel 區間，才會交錯
      const toSan = (maj: number) => sanMin + ((maj - majMin) / (majMax - majMin)) * (sanMax - sanMin);

      ctx.save();
      // 大戶折線 (藍)
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1;
      ctx.beginPath();
      let started = false;
      for (let i = from; i < to; i++) {
        const d = kLineDataList[i];
        if (!d) { started = false; continue; }
        const maj = get(d, 'majorHolding');
        if (maj == null) { started = false; continue; }
        const x = xAxis.convertToPixel(i);
        const y = yAxis.convertToPixel(toSan(maj));
        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 大戶左側刻度（線貼到最左，標籤加底色避免被蓋住）
      const left = bounding.left ?? 0;
      ctx.font = '9px sans-serif';
      ctx.textBaseline = 'middle';
      for (const tv of niceTicks(majMin, majMax, 4)) {
        const y = yAxis.convertToPixel(toSan(tv));
        ctx.fillStyle = 'rgba(15,15,15,0.6)';
        ctx.fillRect(left, y - 6, 24, 12);
        ctx.fillStyle = '#7faaff';
        ctx.textAlign = 'left';
        ctx.fillText(fmtPct(tv), left + 2, y);
      }
      ctx.restore();
      // 回傳 false：讓 klinecharts 仍照常畫原生 figure（散戶橘線）；
      // 大戶藍線已在上方自繪完成（return true 會蓋掉預設 figure → 散戶會消失）
      return false;
    },
    createTooltipDataSource: ({ kLineDataList, crosshair }) => {
      const i = crosshair?.dataIndex;
      const d = i != null ? kLineDataList[i] : undefined;
      const maj = d ? get(d, 'majorHolding') : null;
      const san = d ? get(d, 'retailHolding') : null;
      return {
        name: '大戶散戶',
        calcParamsText: '',
        icons: [],
        values: [
          { title: { text: '大戶 ', color: '#3b82f6' }, value: { text: maj != null ? maj.toFixed(2) + '%' : '--', color: '#3b82f6' } },
          { title: { text: '散戶 ', color: '#f59e0b' }, value: { text: san != null ? san.toFixed(2) + '%' : '--', color: '#f59e0b' } }
        ]
      };
    }
  });

  // MACD（用 store 已算好的值）
  registerIndicator<{ dif: number | null; dea: number | null; hist: number | null }>({
    name: 'MACD_API',
    shortName: 'MACD',
    precision: 2,
    figures: [
      {
        key: 'hist',
        type: 'bar',
        baseValue: 0,
        styles: ({ current }) => ({ color: histColor(current.indicatorData?.hist) })
      },
      { key: 'dif', type: 'line', styles: () => ({ color: '#3b82f6' }) },
      { key: 'dea', type: 'line', styles: () => ({ color: '#f59e0b' }) }
    ],
    calc: (dataList) =>
      dataList.map((d) => ({ dif: get(d, 'macd'), dea: get(d, 'macdSignal'), hist: get(d, 'macdHist') }))
  });
}

// Helper used by callers/tooltips
export { formatBig };
