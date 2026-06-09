<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStockStore } from '../stores/stockStore';

const store = useStockStore();

const MAJOR_COLOR = '#3b82f6'; // 大戶 (左軸) 藍
const RETAIL_COLOR = '#f59e0b'; // 散戶 (右軸) 橘

const containerEl = ref<HTMLDivElement | null>(null);
const svgEl = ref<SVGSVGElement | null>(null);
const width = ref(0);
const height = ref(0);

const pad = { top: 16, right: 42, bottom: 22, left: 42 };
const plotW = computed(() => Math.max(0, width.value - pad.left - pad.right));
const plotH = computed(() => Math.max(0, height.value - pad.top - pad.bottom));

// 只取大戶與散戶都有效的週資料點
const series = computed(() =>
  store.majorRetailHoldingData.filter(
    (d) => d.major != null && !isNaN(d.major) && d.retail != null && !isNaN(d.retail)
  ) as { time: string; major: number; retail: number }[]
);

// 「漂亮刻度」演算法：回傳 rounded 的 min/max/step + tick 陣列
function niceNum(range: number, round: boolean): number {
  const exp = Math.floor(Math.log10(range || 1));
  const frac = (range || 1) / Math.pow(10, exp);
  let nf: number;
  if (round) nf = frac < 1.5 ? 1 : frac < 3 ? 2 : frac < 7 ? 5 : 10;
  else nf = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10;
  return nf * Math.pow(10, exp);
}
function niceScale(min: number, max: number, maxTicks = 4) {
  if (!isFinite(min) || !isFinite(max)) { min = 0; max = 1; }
  if (min === max) { min -= 1; max += 1; }
  const range = niceNum(max - min, false);
  const step = niceNum(range / (maxTicks - 1), true) || 1;
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax + step * 0.5; v += step) ticks.push(Number(v.toFixed(4)));
  return { min: niceMin, max: niceMax, step, ticks };
}

const majorScale = computed(() => {
  const vals = series.value.map((d) => d.major);
  return niceScale(Math.min(...vals), Math.max(...vals), 4);
});
const retailScale = computed(() => {
  const vals = series.value.map((d) => d.retail);
  return niceScale(Math.min(...vals), Math.max(...vals), 4);
});

const xAt = (i: number): number => {
  const n = series.value.length;
  if (n <= 1) return pad.left + plotW.value / 2;
  return pad.left + (plotW.value * i) / (n - 1);
};
const yOf = (v: number, s: { min: number; max: number }): number => {
  const span = s.max - s.min || 1;
  return pad.top + plotH.value * (1 - (v - s.min) / span);
};
const yMajor = (v: number) => yOf(v, majorScale.value);
const yRetail = (v: number) => yOf(v, retailScale.value);

const pathOf = (key: 'major' | 'retail', y: (v: number) => number): string =>
  series.value
    .map((d, i) => `${i ? 'L' : 'M'}${xAt(i).toFixed(1)},${y(d[key]).toFixed(1)}`)
    .join(' ');

const majorPath = computed(() => pathOf('major', yMajor));
const retailPath = computed(() => pathOf('retail', yRetail));

const fmtTick = (v: number, step: number) =>
  Number.isInteger(step) ? v.toFixed(0) : v.toFixed(1);

const leftTicks = computed(() =>
  majorScale.value.ticks.map((v) => ({ y: yMajor(v), label: fmtTick(v, majorScale.value.step) }))
);
const rightTicks = computed(() =>
  retailScale.value.ticks.map((v) => ({ y: yRetail(v), label: fmtTick(v, retailScale.value.step) }))
);

const xLabels = computed(() => {
  const n = series.value.length;
  if (!n) return [] as { x: number; label: string }[];
  const want = Math.min(6, n);
  const out: { x: number; label: string }[] = [];
  for (let k = 0; k < want; k++) {
    const i = want === 1 ? 0 : Math.round(((n - 1) * k) / (want - 1));
    const t = series.value[i]!.time;
    const parts = t.split('-');
    out.push({ x: xAt(i), label: `${parseInt(parts[1] ?? '0')}/${parseInt(parts[2] ?? '0')}` });
  }
  return out;
});

// Hover
const hoverIdx = ref<number | null>(null);
const onMove = (e: MouseEvent) => {
  const n = series.value.length;
  if (!n || !svgEl.value) return;
  const rect = svgEl.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  let i = Math.round(((x - pad.left) / (plotW.value || 1)) * (n - 1));
  i = Math.max(0, Math.min(n - 1, i));
  hoverIdx.value = i;
};
const onLeave = () => { hoverIdx.value = null; };

const hover = computed(() => {
  const i = hoverIdx.value;
  if (i == null) return null;
  const d = series.value[i];
  if (!d) return null;
  return {
    x: xAt(i),
    yMajor: yMajor(d.major),
    yRetail: yRetail(d.retail),
    date: d.time,
    major: d.major,
    retail: d.retail,
  };
});

const tipStyle = computed(() => {
  const h = hover.value;
  if (!h) return { display: 'none' };
  const estW = 130;
  let left = h.x + 10;
  if (left + estW > width.value) left = h.x - 10 - estW;
  return { left: `${Math.max(2, left)}px`, top: `${pad.top}px` };
});

let ro: ResizeObserver | null = null;
onMounted(() => {
  if (!containerEl.value) return;
  const measure = () => {
    if (!containerEl.value) return;
    width.value = containerEl.value.clientWidth;
    height.value = containerEl.value.clientHeight;
  };
  measure();
  ro = new ResizeObserver(measure);
  ro.observe(containerEl.value);
});
onUnmounted(() => { ro?.disconnect(); ro = null; });
</script>

<template>
  <div ref="containerEl" class="mrh-wrapper">
    <svg
      v-if="width > 0 && height > 0 && series.length > 0"
      ref="svgEl"
      :width="width"
      :height="height"
      @mousemove="onMove"
      @mouseleave="onLeave"
    >
      <!-- 軸標題 -->
      <text :x="pad.left" :y="10" fill="#888" font-size="10" text-anchor="start">大戶 %</text>
      <text :x="width - pad.right" :y="10" fill="#888" font-size="10" text-anchor="end">散戶 %</text>

      <!-- 水平格線 + 左軸刻度 (大戶) -->
      <g v-for="t in leftTicks" :key="'l' + t.label">
        <line :x1="pad.left" :y1="t.y" :x2="width - pad.right" :y2="t.y" stroke="#1f1f1f" stroke-width="1" />
        <text :x="pad.left - 4" :y="t.y + 3" fill="#888" font-size="9" text-anchor="end">{{ t.label }}</text>
      </g>

      <!-- 右軸刻度 (散戶) -->
      <text
        v-for="t in rightTicks"
        :key="'r' + t.label"
        :x="width - pad.right + 4"
        :y="t.y + 3"
        fill="#888"
        font-size="9"
        text-anchor="start"
      >{{ t.label }}</text>

      <!-- X 軸日期 -->
      <text
        v-for="l in xLabels"
        :key="l.label + l.x"
        :x="l.x"
        :y="height - 6"
        fill="#888"
        font-size="9"
        text-anchor="middle"
      >{{ l.label }}</text>

      <!-- 折線 -->
      <path :d="majorPath" fill="none" :stroke="MAJOR_COLOR" stroke-width="1.5" />
      <path :d="retailPath" fill="none" :stroke="RETAIL_COLOR" stroke-width="1.5" />

      <!-- Hover -->
      <g v-if="hover">
        <line :x1="hover.x" :y1="pad.top" :x2="hover.x" :y2="height - pad.bottom" stroke="#555" stroke-width="1" stroke-dasharray="3,2" />
        <circle :cx="hover.x" :cy="hover.yMajor" r="3" :fill="MAJOR_COLOR" />
        <circle :cx="hover.x" :cy="hover.yRetail" r="3" :fill="RETAIL_COLOR" />
      </g>
    </svg>

    <div v-else-if="width > 0" class="mrh-empty">尚無大戶 / 散戶持股資料</div>

    <div v-if="hover" class="mrh-tip" :style="tipStyle">
      <div class="mrh-tip-date">{{ hover.date }}</div>
      <div class="mrh-tip-line" :style="{ color: MAJOR_COLOR }">大戶 {{ hover.major.toFixed(2) }}%</div>
      <div class="mrh-tip-line" :style="{ color: RETAIL_COLOR }">散戶 {{ hover.retail.toFixed(2) }}%</div>
    </div>
  </div>
</template>

<style scoped>
.mrh-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}
.mrh-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 12px;
}
.mrh-tip {
  position: absolute;
  pointer-events: none;
  background: rgba(20, 20, 20, 0.95);
  border: 1px solid #333;
  border-radius: 4px;
  padding: 5px 8px;
  font-size: 11px;
  line-height: 1.4;
  white-space: nowrap;
  z-index: 20;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}
.mrh-tip-date {
  color: #888;
  font-size: 10px;
  margin-bottom: 2px;
}
.mrh-tip-line {
  font-variant-numeric: tabular-nums;
}
</style>
