import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useStockStore, type SignalMarker } from './stockStore';

// 自訂訊號：使用者自組條件（全部 AND），逐日掃描目前載入的 K 線資料，
// 命中的日子畫成 chart 上的自訂標記。啟用時取代達比 B/S 訊號（版面乾淨）。

export type CondOp = 'gt' | 'lt';

export type CondKind =
  | 'vol_ma'            // 今日成交量 vs N 日均量 × X
  | 'insti_avg'         // 外資 / 投信 N 日平均淨買賣 vs X（張）
  | 'margin_balance'    // 融資餘額 vs X（張）
  | 'short_balance'     // 融券餘額 vs X（張）
  | 'short_margin_ratio'// 券資比 vs X（%）
  | 'rsi'               // RSI9 / RSI14 vs X
  | 'macd_hist'         // MACD 柱狀 vs X
  | 'bb_percent_b'      // 布林 %b vs X
  | 'kd_k'              // KD 的 K 值 vs X
  | 'kd_cross';         // KD 黃金 / 死亡交叉

export type CondSide = 'long' | 'short';

export interface CustomCondition {
  id: string;
  side: CondSide;                   // 多方 / 空方（兩組條件各自 AND，分別產生 多/空 標記）
  kind: CondKind;
  op: CondOp;                       // kd_cross 不用
  value: number;                    // 門檻 X（vol_ma 時為倍數，可小數；kd_cross 不用）
  period?: number;                  // vol_ma: 5/10/20；insti_avg: 5/10/15/20/30；rsi: 9/14
  entity?: 'foreign' | 'trust';     // insti_avg 專用
  cross?: 'golden' | 'death';       // kd_cross 專用
}

// 各條件型別的 UI 與預設值描述（Modal 直接吃這張表渲染）
export const COND_META: Record<CondKind, {
  label: string;
  unit: string;
  periods?: number[];
  defaults: Partial<CustomCondition>;
  step?: number;
}> = {
  vol_ma: { label: '成交量 vs 均量', unit: '倍', periods: [5, 10, 20], defaults: { period: 5, op: 'gt', value: 1.5 }, step: 0.1 },
  insti_avg: { label: '外資/投信 日均買賣超', unit: '張', periods: [5, 10, 15, 20, 30], defaults: { entity: 'foreign', period: 10, op: 'gt', value: 1000 } },
  margin_balance: { label: '融資餘額', unit: '張', defaults: { op: 'gt', value: 20000 } },
  short_balance: { label: '融券餘額', unit: '張', defaults: { op: 'gt', value: 5000 } },
  short_margin_ratio: { label: '券資比', unit: '%', defaults: { op: 'gt', value: 20 }, step: 0.5 },
  rsi: { label: 'RSI', unit: '', periods: [9, 14], defaults: { period: 14, op: 'gt', value: 50 }, step: 1 },
  macd_hist: { label: 'MACD 柱狀', unit: '', defaults: { op: 'gt', value: 0 }, step: 0.1 },
  bb_percent_b: { label: '布林 %b', unit: '', defaults: { op: 'gt', value: 0.75 }, step: 0.05 },
  kd_k: { label: 'KD 的 K 值', unit: '', defaults: { op: 'gt', value: 80 }, step: 1 },
  kd_cross: { label: 'KD 交叉', unit: '', defaults: { cross: 'golden' } },
};

const STORAGE_KEY = 'kzone:custom-signal';

const genId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `c-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

function loadPersisted(): { enabled: boolean; conditions: CustomCondition[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { enabled: false, conditions: [] };
    const parsed = JSON.parse(raw) as { enabled?: boolean; conditions?: CustomCondition[] };
    const conditions = (parsed.conditions ?? [])
      .filter((c) => c && c.id && COND_META[c.kind])
      .map((c) => ({ ...c, side: (c as { side?: CondSide }).side ?? 'long' }));
    return { enabled: parsed.enabled === true && conditions.length > 0, conditions };
  } catch {
    return { enabled: false, conditions: [] };
  }
}

const cmp = (op: CondOp, a: number, b: number) => (op === 'gt' ? a > b : a < b);

export const useCustomSignalStore = defineStore('customSignal', () => {
  const stock = useStockStore();

  const persisted = loadPersisted();
  const enabled = ref(persisted.enabled);
  const conditions = ref<CustomCondition[]>(persisted.conditions);

  watch([enabled, conditions], () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled: enabled.value, conditions: conditions.value }));
    } catch { /* 無痕模式忽略 */ }
  }, { deep: true });

  const addCondition = (kind: CondKind, side: CondSide) => {
    conditions.value.push({ id: genId(), side, kind, op: 'gt', value: 0, ...COND_META[kind].defaults });
  };
  const removeCondition = (id: string) => {
    conditions.value = conditions.value.filter((c) => c.id !== id);
    if (conditions.value.length === 0) enabled.value = false;
  };

  // --- 逐日取值：回傳該條件在第 i 根 K 線的「觀測值」；null = 資料不足（條件視為不成立） ---
  // 以 time 對齊各指標陣列（它們與 stockData 同源同序，用 Map 保險）。
  type Ctx = {
    byTime: {
      volMA: Map<string, { ma5: number | null; ma10: number | null; ma20: number | null }>;
      margin: Map<string, number | null>;
      short: Map<string, number | null>;
      ratio: Map<string, number | null>;
      rsi: Map<string, { rsi9: number | null; rsi14: number | null }>;
      macd: Map<string, number | null>;
      bb: Map<string, number | null>;
      kd: Map<string, { k: number; d: number }>;
    };
    instiPrefix: { foreign: number[]; trust: number[]; valid: boolean[] };
    times: string[];
  };

  const buildCtx = (): Ctx => {
    const times = stock.stockData.map((d) => d.time);
    const insti = stock.institutionalData;
    // prefix sums for rolling averages（以 institutionalData 的順序為準）
    const foreign: number[] = [0];
    const trust: number[] = [0];
    const valid: boolean[] = [];
    for (const d of insti) {
      foreign.push(foreign[foreign.length - 1]! + (d.foreign ?? 0));
      trust.push(trust[trust.length - 1]! + (d.trust ?? 0));
      valid.push(d.foreign != null && d.trust != null);
    }
    return {
      times,
      instiPrefix: { foreign, trust, valid },
      byTime: {
        volMA: new Map(stock.volumeMAData.map((d) => [d.time, d])),
        margin: new Map(stock.marginData.map((d) => [d.time, d.balance])),
        short: new Map(stock.shortData.map((d) => [d.time, d.balance])),
        ratio: new Map(stock.shortMarginRatioData.map((d) => [d.time, d.value])),
        rsi: new Map(stock.rsiData.map((d) => [d.time, d])),
        macd: new Map(stock.macdData.map((d) => [d.time, d.histogram])),
        bb: new Map(stock.bollingerData.map((d) => [d.time, d.percentB])),
        kd: new Map(stock.kdData.map((d) => [d.time, d])),
      },
    };
  };

  const instiIndexByTime = computed(() => new Map(stock.institutionalData.map((d, i) => [d.time, i])));

  function passes(c: CustomCondition, i: number, ctx: Ctx): boolean {
    const t = ctx.times[i]!;
    switch (c.kind) {
      case 'vol_ma': {
        const vol = stock.stockData[i]?.volume;
        const ma = ctx.byTime.volMA.get(t);
        const base = c.period === 10 ? ma?.ma10 : c.period === 20 ? ma?.ma20 : ma?.ma5;
        if (vol == null || base == null || base <= 0) return false;
        return cmp(c.op, vol, base * c.value);
      }
      case 'insti_avg': {
        const p = c.period ?? 10;
        const idx = instiIndexByTime.value.get(t);
        if (idx == null || idx < p - 1) return false;
        const pre = c.entity === 'trust' ? ctx.instiPrefix.trust : ctx.instiPrefix.foreign;
        const avg = (pre[idx + 1]! - pre[idx + 1 - p]!) / p;
        return cmp(c.op, avg, c.value);
      }
      case 'margin_balance': {
        const v = ctx.byTime.margin.get(t);
        return v != null && cmp(c.op, v, c.value);
      }
      case 'short_balance': {
        const v = ctx.byTime.short.get(t);
        return v != null && cmp(c.op, v, c.value);
      }
      case 'short_margin_ratio': {
        const v = ctx.byTime.ratio.get(t);
        return v != null && cmp(c.op, v, c.value);
      }
      case 'rsi': {
        const r = ctx.byTime.rsi.get(t);
        const v = c.period === 9 ? r?.rsi9 : r?.rsi14;
        return v != null && cmp(c.op, v, c.value);
      }
      case 'macd_hist': {
        const v = ctx.byTime.macd.get(t);
        return v != null && cmp(c.op, v, c.value);
      }
      case 'bb_percent_b': {
        const v = ctx.byTime.bb.get(t);
        return v != null && cmp(c.op, v, c.value);
      }
      case 'kd_k': {
        const v = ctx.byTime.kd.get(t)?.k;
        return v != null && cmp(c.op, v, c.value);
      }
      case 'kd_cross': {
        const prevT = ctx.times[i - 1];
        if (!prevT) return false;
        const cur = ctx.byTime.kd.get(t);
        const prev = ctx.byTime.kd.get(prevT);
        if (!cur || !prev) return false;
        return c.cross === 'death'
          ? prev.k > prev.d && cur.k < cur.d
          : prev.k < prev.d && cur.k > cur.d;
      }
    }
  }

  // 命中日 → chart 標記：多方 / 空方各自 AND、各自產生標記（同日可同時命中）
  const markers = computed<SignalMarker[]>(() => {
    if (!enabled.value || conditions.value.length === 0 || stock.stockData.length === 0) return [];
    if (stock.isMarketView) return []; // 大盤無個股籌碼/指標資料
    const longs = conditions.value.filter((c) => c.side === 'long');
    const shorts = conditions.value.filter((c) => c.side === 'short');
    const ctx = buildCtx();
    const out: SignalMarker[] = [];
    for (let i = 0; i < ctx.times.length; i++) {
      if (longs.length > 0 && longs.every((c) => passes(c, i, ctx))) {
        out.push({ date: ctx.times[i]!, type: 'custom-long' });
      }
      if (shorts.length > 0 && shorts.every((c) => passes(c, i, ctx))) {
        out.push({ date: ctx.times[i]!, type: 'custom-short' });
      }
    }
    return out;
  });

  // 每個條件在最新一根 K 線的觀測值（Modal 顯示「今日值」幫助校準門檻）
  const latestValues = computed<Record<string, string>>(() => {
    const n = stock.stockData.length;
    if (n === 0) return {};
    const ctx = buildCtx();
    const i = n - 1;
    const t = ctx.times[i]!;
    const fmt = (v: number | null | undefined, digits = 2) =>
      v == null || !Number.isFinite(v) ? '—' : v.toLocaleString('zh-TW', { maximumFractionDigits: digits });
    const out: Record<string, string> = {};
    for (const c of conditions.value) {
      switch (c.kind) {
        case 'vol_ma': {
          const ma = ctx.byTime.volMA.get(t);
          const base = c.period === 10 ? ma?.ma10 : c.period === 20 ? ma?.ma20 : ma?.ma5;
          const vol = stock.stockData[i]?.volume;
          out[c.id] = vol != null && base ? `今日量 = 均量 × ${fmt(vol / base)}` : '今日值 —';
          break;
        }
        case 'insti_avg': {
          const p = c.period ?? 10;
          const idx = instiIndexByTime.value.get(t);
          if (idx == null || idx < p - 1) { out[c.id] = '今日值 —'; break; }
          const pre = c.entity === 'trust' ? ctx.instiPrefix.trust : ctx.instiPrefix.foreign;
          out[c.id] = `今日值 ${fmt((pre[idx + 1]! - pre[idx + 1 - p]!) / p, 0)} 張`;
          break;
        }
        case 'margin_balance': out[c.id] = `今日值 ${fmt(ctx.byTime.margin.get(t), 0)} 張`; break;
        case 'short_balance': out[c.id] = `今日值 ${fmt(ctx.byTime.short.get(t), 0)} 張`; break;
        case 'short_margin_ratio': out[c.id] = `今日值 ${fmt(ctx.byTime.ratio.get(t))} %`; break;
        case 'rsi': {
          const r = ctx.byTime.rsi.get(t);
          out[c.id] = `今日值 ${fmt(c.period === 9 ? r?.rsi9 : r?.rsi14)}`;
          break;
        }
        case 'macd_hist': out[c.id] = `今日值 ${fmt(ctx.byTime.macd.get(t))}`; break;
        case 'bb_percent_b': out[c.id] = `今日值 ${fmt(ctx.byTime.bb.get(t))}`; break;
        case 'kd_k': out[c.id] = `今日 K ${fmt(ctx.byTime.kd.get(t)?.k)}`; break;
        case 'kd_cross': {
          const cur = ctx.byTime.kd.get(t);
          out[c.id] = cur ? `今日 K ${fmt(cur.k)} / D ${fmt(cur.d)}` : '今日值 —';
          break;
        }
      }
    }
    return out;
  });

  const matchCount = computed(() => ({
    long: markers.value.filter((m) => m.type === 'custom-long').length,
    short: markers.value.filter((m) => m.type === 'custom-short').length,
  }));

  return { enabled, conditions, markers, matchCount, latestValues, addCondition, removeCondition };
});
