<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useStockStore } from '../stores/stockStore';

const store = useStockStore();
const expanded = ref(false);

onMounted(() => {
  if (store.marketData.length === 0) {
    store.fetchMarketData();
  }
});

// API 為新到舊；用 selectedDate 對齊，否則用最新
const currentIdx = computed(() => {
  if (store.marketData.length === 0) return -1;
  const target = store.selectedDate;
  if (target) {
    const idx = store.marketData.findIndex(d => d.trade_date === target);
    if (idx >= 0) return idx;
  }
  return 0;
});

const current = computed(() => {
  const idx = currentIdx.value;
  return idx >= 0 ? store.marketData[idx] : null;
});

const previous = computed(() => {
  const idx = currentIdx.value;
  return idx >= 0 ? store.marketData[idx + 1] ?? null : null;
});

const priceChange = computed(() => {
  if (!current.value || !previous.value) return null;
  const change = current.value.taiex_close - previous.value.taiex_close;
  const pct = (change / previous.value.taiex_close) * 100;
  return { value: change, percent: pct, isPositive: change >= 0 };
});

// Sparkline: 取 current 起算往前 20 天，反轉成由舊到新
const SPARK_W = 220;
const SPARK_H = 32;
const SPARK_LEN = 20;

const sparkline = computed(() => {
  const idx = currentIdx.value;
  if (idx < 0) return null;
  const slice = store.marketData.slice(idx, idx + SPARK_LEN).slice().reverse();
  if (slice.length < 2) return null;
  const values = slice.map(d => d.taiex_close);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * SPARK_W;
    const y = SPARK_H - ((v - min) / range) * SPARK_H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const first = values[0]!;
  const last = values[values.length - 1]!;
  const trendUp = last >= first;
  return {
    polyline: points.join(' '),
    areaPath: `M0,${SPARK_H} L${points.join(' L')} L${SPARK_W},${SPARK_H} Z`,
    trendUp,
    days: slice.length
  };
});

// 振幅 = (high - low) / open * 100
const amplitude = computed(() => {
  if (!current.value || current.value.taiex_open <= 0) return null;
  return ((current.value.taiex_high - current.value.taiex_low) / current.value.taiex_open) * 100;
});

const formatTaiex = (v: number) =>
  v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatYi = (v: number): string => {
  const yi = v / 1e8;
  const abs = Math.abs(yi);
  const decimals = abs >= 100 ? 0 : 2;
  return yi.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const formatVolume = (v: number): string => {
  if (v >= 1e12) {
    return (v / 1e12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' 兆';
  }
  return (v / 1e8).toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' 億';
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('zh-TW');
};

const upColor = '#ef5350';
const downColor = '#26a69a';
const flowColor = (v: number) => (v >= 0 ? upColor : downColor);
</script>

<template>
  <div class="market-card" v-if="current">
    <div
      class="card-header clickable"
      @click="expanded = !expanded"
      :title="expanded ? '收合' : '展開 OHLC 詳情'"
    >
      <span class="label">加權指數 TAIEX</span>
      <span class="header-right">
        <span class="date">{{ formatDate(current.trade_date) }}</span>
        <svg
          class="chevron"
          :class="{ 'chevron-open': expanded }"
          width="10" height="10" viewBox="0 0 10 10"
        >
          <path d="M2 4l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    </div>

    <div class="price-block">
      <div class="price">{{ formatTaiex(current.taiex_close) }}</div>
      <div
        v-if="priceChange"
        class="change"
        :style="{ color: priceChange.isPositive ? upColor : downColor }"
      >
        <span class="arrow">{{ priceChange.isPositive ? '▲' : '▼' }}</span>
        {{ priceChange.isPositive ? '+' : '' }}{{ formatTaiex(priceChange.value) }}
        ({{ priceChange.isPositive ? '+' : '' }}{{ priceChange.percent.toFixed(2) }}%)
      </div>
    </div>

    <!-- Sparkline -->
    <div v-if="sparkline" class="sparkline-wrap">
      <svg :viewBox="`0 0 ${SPARK_W} ${SPARK_H}`" :width="SPARK_W" :height="SPARK_H" preserveAspectRatio="none">
        <path
          :d="sparkline.areaPath"
          :fill="sparkline.trendUp ? upColor : downColor"
          opacity="0.12"
        />
        <polyline
          :points="sparkline.polyline"
          fill="none"
          :stroke="sparkline.trendUp ? upColor : downColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span class="spark-label">近 {{ sparkline.days }} 日走勢</span>
    </div>

    <!-- Expandable: OHLC + 振幅 -->
    <div v-if="expanded" class="ohlc-block">
      <div class="ohlc-row">
        <span class="stat-label">開盤</span>
        <span class="stat-value">{{ formatTaiex(current.taiex_open) }}</span>
      </div>
      <div class="ohlc-row">
        <span class="stat-label">最高</span>
        <span class="stat-value" :style="{ color: upColor }">{{ formatTaiex(current.taiex_high) }}</span>
      </div>
      <div class="ohlc-row">
        <span class="stat-label">最低</span>
        <span class="stat-value" :style="{ color: downColor }">{{ formatTaiex(current.taiex_low) }}</span>
      </div>
      <div class="ohlc-row" v-if="amplitude !== null">
        <span class="stat-label">振幅</span>
        <span class="stat-value">{{ amplitude.toFixed(2) }}%</span>
      </div>
    </div>

    <div class="stats">
      <div class="stat-row">
        <span class="stat-label">成交金額</span>
        <span class="stat-value">
          <span class="num">{{ formatVolume(current.total_volume).split(' ')[0] }}</span>
          <span class="unit">{{ formatVolume(current.total_volume).split(' ')[1] }}</span>
        </span>
      </div>
      <div class="stat-row">
        <span class="stat-label">外資買賣</span>
        <span class="stat-value" :style="{ color: flowColor(current.foreign_net) }">
          <span class="num">{{ current.foreign_net >= 0 ? '+' : '' }}{{ formatYi(current.foreign_net) }}</span>
          <span class="unit">億</span>
        </span>
      </div>
      <div class="stat-row">
        <span class="stat-label">融資增減</span>
        <span class="stat-value" :style="{ color: flowColor(current.margin_balance_change) }">
          <span class="num">{{ current.margin_balance_change >= 0 ? '+' : '' }}{{ formatYi(current.margin_balance_change) }}</span>
          <span class="unit">億</span>
        </span>
      </div>
      <div class="stat-row">
        <span class="stat-label">融資餘額</span>
        <span class="stat-value">
          <span class="num">{{ formatYi(current.margin_balance) }}</span>
          <span class="unit">億</span>
        </span>
      </div>
    </div>
  </div>

  <div v-else class="market-card market-card-loading">
    <div class="card-header">
      <span class="label">加權指數 TAIEX</span>
    </div>
    <div class="loading-text">載入中...</div>
  </div>
</template>

<style scoped>
.market-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-bottom: 1px solid #0f3460;
  padding: 12px 16px;
  color: #e0e0e0;
  flex-shrink: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-header.clickable {
  cursor: pointer;
  user-select: none;
}

.card-header.clickable:hover .label {
  color: #f5b840;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.label {
  font-size: 0.75rem;
  color: #c0a060;
  letter-spacing: 0.05em;
  font-weight: 600;
  transition: color 0.15s;
}

.date {
  font-size: 0.7rem;
  color: #b8c4d4;
}

.chevron {
  color: #b8c4d4;
  transition: transform 0.2s;
}

.chevron-open {
  transform: rotate(180deg);
}

.price-block {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  font-variant-numeric: tabular-nums;
}

.change {
  font-size: 0.85rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.arrow {
  font-size: 0.7rem;
  margin-right: 2px;
}

.sparkline-wrap {
  position: relative;
  margin-bottom: 12px;
  padding-bottom: 14px;
}

.sparkline-wrap svg {
  display: block;
  width: 100%;
}

.spark-label {
  position: absolute;
  bottom: 0;
  right: 0;
  font-size: 0.65rem;
  color: #a0aab8;
  white-space: nowrap;
}

.ohlc-block {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 12px;
  padding: 8px 0;
  margin-bottom: 4px;
  border-top: 1px solid rgba(15, 52, 96, 0.5);
  border-bottom: 1px solid rgba(15, 52, 96, 0.5);
}

.ohlc-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.78rem;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-top: 1px solid rgba(15, 52, 96, 0.5);
  padding-top: 8px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.78rem;
}

.stat-label {
  color: #b8c4d4;
}

.stat-value {
  color: #d0d0d0;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  display: inline-flex;
  align-items: baseline;
  gap: 3px;
}

.stat-value .num {
  text-align: right;
}

.stat-value .unit {
  font-size: 0.7rem;
  color: #a0aab8;
  font-weight: 400;
  min-width: 1.5em;
  text-align: left;
}

.market-card-loading {
  text-align: center;
}

.loading-text {
  font-size: 0.8rem;
  color: #a0aab8;
  padding: 8px 0;
}
</style>
