<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useStockStore } from '../stores/stockStore'
import { trackEvent } from '../lib/analytics'

const emit = defineEmits<{ stockSelected: [] }>()

const store = useStockStore()
const activeTab = ref<'buy' | 'sell'>('buy')

const onAlphaPickClick = (symbol: string, signal: 'buy' | 'sell') => {
  trackEvent('alpha_pick_select', { symbol, signal })
  store.searchStock(symbol)
  emit('stockSelected')
}

// Check localStorage immediately to avoid flash
const hasSeenDisclaimer = typeof window !== 'undefined'
  ? localStorage.getItem('alpha-disclaimer-seen') === 'true'
  : false
const showDisclaimer = ref(!hasSeenDisclaimer)

onMounted(async () => {
  await store.fetchAvailableDates()
  if (!store.selectedDate) {
    await Promise.all([
      store.fetchAlphaPicks(),
      store.fetchSellAlerts(),
    ])
  }
})

const closeDisclaimer = () => {
  showDisclaimer.value = false
  localStorage.setItem('alpha-disclaimer-seen', 'true')
}

watch(() => store.selectedDate, async (newDate) => {
  if (newDate) {
    await Promise.all([
      store.fetchAlphaPicks(newDate),
      store.fetchSellAlerts(newDate),
    ])
  }
})

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('zh-TW')
}

const fmtNum = (v: number | null | undefined, digits: number): string =>
  v == null || !Number.isFinite(v) ? '—' : v.toFixed(digits)

const fmtSigned = (v: number | null | undefined, digits: number): string =>
  v == null || !Number.isFinite(v) ? '—' : (v >= 0 ? '+' : '') + v.toFixed(digits)
</script>

<template>
  <div class="alpha-pick-panel">
    <!-- Header -->
    <div class="panel-header">
      <h2>📊 技術條件清單</h2>
      <select v-model="store.selectedDate" class="date-select">
        <option v-for="date in store.availableDates" :key="date" :value="date">
          {{ formatDate(date) }}
        </option>
      </select>
    </div>
    <div class="panel-notice">
      ※ 以下清單為技術指標條件比對之視覺化結果，<strong>非個股推介或投資建議</strong>。
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button
        :class="['tab', activeTab === 'buy' ? 'tab-active-buy' : '']"
        @click="activeTab = 'buy'"
      >
        ▲ 多方條件 ({{ store.alphaPicks.length }})
      </button>
      <button
        :class="['tab', activeTab === 'sell' ? 'tab-active-sell' : '']"
        @click="activeTab = 'sell'"
      >
        ▼ 空方條件 ({{ store.sellAlerts.length }})
      </button>
    </div>

    <div v-if="store.isPicksLoading" class="loading">載入中...</div>

    <!-- BUY Picks -->
    <div v-else-if="activeTab === 'buy'" class="pick-list">
      <div v-if="store.alphaPicks.length === 0" class="empty">無符合多方條件的個股</div>
      <div
        v-for="pick in store.alphaPicks"
        :key="pick.symbol"
        class="pick-card pick-card-buy"
        @click="onAlphaPickClick(pick.symbol, 'buy')"
      >
        <div class="pick-header">
          <div class="symbol-group">
            <span class="symbol">{{ pick.symbol }}</span>
            <span class="name">{{ pick.name }}</span>
          </div>
          <div class="price-group">
            <span class="price">{{ pick.close }}</span>
            <span class="signal-badge buy-badge">多方</span>
          </div>
        </div>

        <div class="indicators">
          <span class="indicator">RSI {{ fmtNum(pick.rsi_14, 1) }}</span>
          <span class="indicator">MACD {{ fmtSigned(pick.macd_hist, 2) }}</span>
          <span class="indicator">%B {{ fmtNum(pick.bb_percent_b, 2) }}</span>
        </div>

        <div class="reasons">{{ pick.reasons }}</div>
      </div>
    </div>

    <!-- SELL Alerts -->
    <div v-else class="pick-list">
      <div v-if="store.sellAlerts.length === 0" class="empty">無符合空方條件的個股</div>
      <div
        v-for="alert in store.sellAlerts"
        :key="alert.symbol"
        class="pick-card pick-card-sell"
        @click="onAlphaPickClick(alert.symbol, 'sell')"
      >
        <div class="pick-header">
          <div class="symbol-group">
            <span class="symbol">{{ alert.symbol }}</span>
            <span class="name">{{ alert.name }}</span>
          </div>
          <div class="price-group">
            <span class="price">{{ alert.close }}</span>
            <span class="signal-badge sell-badge">空方</span>
          </div>
        </div>

        <div class="indicators">
          <span class="indicator">RSI {{ fmtNum(alert.rsi_14, 1) }}</span>
          <span class="indicator">MACD {{ fmtSigned(alert.macd_hist, 2) }}</span>
          <span class="indicator">%B {{ fmtNum(alert.bb_percent_b, 2) }}</span>
          <span class="indicator">條件 {{ alert.conditions_met }}項</span>
        </div>

        <div class="reasons">{{ alert.reasons }}</div>
      </div>
    </div>

    <!-- Date info -->
    <div class="footer" v-if="store.alphaPickDate">
      資料日期：{{ formatDate(store.alphaPickDate) }}
    </div>

    <!-- Disclaimer Modal -->
    <div v-if="showDisclaimer" class="disclaimer-overlay" @click="closeDisclaimer">
      <div class="disclaimer-modal" @click.stop>
        <div class="disclaimer-header">
          <svg class="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <h3>⚠️ 工具性質聲明與投資警語</h3>
        </div>
        <div class="disclaimer-content">
          <p><strong>本網站為技術指標視覺化工具，所有內容均非投資建議、推介或選股服務。</strong></p>
          <ul>
            <li>「多方條件」與「空方條件」清單僅為預設技術指標規則對公開資料比對後的視覺化結果，並非個股推介或交易建議。</li>
            <li>本網站之內容不構成《證券投資信託及顧問法》第 4 條所定義之分析意見或推介建議。</li>
            <li>投資有風險，過去表現不代表未來結果。</li>
            <li>使用者應自行判斷並承擔所有投資決策的風險與責任，必要時應諮詢具合格證照之專業顧問。</li>
            <li>本網站對於因使用本服務所產生的任何損失，不負任何法律責任。</li>
          </ul>
          <p class="disclaimer-highlight">請確認您已閱讀並理解以上聲明</p>
        </div>
        <button class="disclaimer-button" @click="closeDisclaimer">
          我已了解，繼續使用工具
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alpha-pick-panel {
  background: var(--ds-bg-brand-panel-alt);
  height: 100%;
  display: flex;
  flex-direction: column;
  color: var(--ds-fg-strong);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--ds-border-brand);
}

.panel-header h2 {
  margin: 0;
  font-size: 1rem;
  color: var(--ds-fg);
}

.panel-notice {
  padding: 8px 16px;
  font-size: 0.8125rem;
  line-height: 1.7;
  color: var(--ds-fg-gold-muted);
  background: color-mix(in srgb, var(--ds-warning) 6%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--ds-warning) 15%, transparent);
}

.panel-notice strong {
  color: var(--ds-brand-gold);
  font-weight: 600;
}

.date-select {
  background: var(--ds-bg-brand-panel);
  color: var(--ds-fg-strong);
  border: 1px solid var(--ds-border-brand);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 0.8rem;
}

.tabs {
  display: flex;
  gap: 8px; /* 增加按鈕間距 */
  border-bottom: 1px solid var(--ds-border-brand);
}

.tab {
  flex: 1;
  padding: 10px;
  font-size: 0.85rem;
  background: transparent;
  color: var(--ds-fg-label);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  background: var(--ds-bg-brand-panel);
  color: var(--ds-fg-strong);
}

.tab-active-buy {
  color: var(--ds-market-down);
  border-bottom: 2px solid var(--ds-market-down);
}

.tab-active-sell {
  color: var(--ds-market-up);
  border-bottom: 2px solid var(--ds-market-up);
}

.loading,
.empty {
  text-align: center;
  padding: 40px;
  color: var(--ds-fg-subtle);
  font-size: 0.9rem;
}

.pick-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pick-card {
  background: var(--ds-bg-brand-panel);
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  border-left: 3px solid transparent;
}

.pick-card:hover {
  transform: translateX(2px);
}

.pick-card-buy {
  border-left-color: var(--ds-market-down);
}

.pick-card-buy:hover {
  box-shadow: 0 2px 8px color-mix(in srgb, var(--ds-market-down) 25%, transparent);
}

.pick-card-sell {
  border-left-color: var(--ds-market-up);
}

.pick-card-sell:hover {
  box-shadow: 0 2px 8px color-mix(in srgb, var(--ds-market-up) 25%, transparent);
}

.pick-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.symbol-group {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.symbol {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--ds-fg-strong);
}

.name {
  font-size: 0.8rem;
  color: var(--ds-fg-label);
}

.price-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price {
  font-size: 1rem;
  font-weight: 600;
  color: var(--ds-fg);
}

.signal-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8125rem;
  font-weight: 600;
}

.buy-badge {
  background: color-mix(in srgb, var(--ds-market-down) 20%, transparent);
  color: var(--ds-market-down);
  border: 1px solid var(--ds-market-down);
}

.sell-badge {
  background: color-mix(in srgb, var(--ds-market-up) 20%, transparent);
  color: var(--ds-market-up);
  border: 1px solid var(--ds-market-up);
}

.indicators {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.indicator {
  background: var(--ds-bg-canvas);
  color: var(--ds-fg-secondary);
  font-size: 0.8125rem;
  padding: 2px 6px;
  border-radius: 4px;
}

.reasons {
  font-size: 0.8125rem;
  color: var(--ds-fg-label);
  line-height: 1.7;
  word-break: break-all;
}

.footer {
  padding: 10px 16px;
  font-size: 0.8125rem;
  color: var(--ds-fg-label);
  border-top: 1px solid var(--ds-border-brand);
  text-align: center;
}

/* Disclaimer Modal Styles */
.disclaimer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: color-mix(in srgb, var(--ds-bg-canvas) 85%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.disclaimer-modal {
  background: linear-gradient(135deg, var(--ds-bg-brand-panel-alt) 0%, var(--ds-bg-brand-panel) 100%);
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  padding: 24px;
  box-shadow: 0 20px 60px var(--ds-bg-scrim);
  border: 1px solid var(--ds-border-brand);
}

.disclaimer-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--ds-border-brand);
}

.disclaimer-header svg {
  width: 32px;
  height: 32px;
  color: var(--ds-warning);
  flex-shrink: 0;
}

.disclaimer-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--ds-warning-fg);
  font-weight: 600;
}

.disclaimer-content {
  color: var(--ds-fg);
  line-height: 1.6;
  margin-bottom: 20px;
}

.disclaimer-content p {
  margin: 0 0 12px 0;
}

.disclaimer-content strong {
  color: var(--ds-fg-strong);
  font-size: 1.05rem;
}

.disclaimer-content ul {
  margin: 12px 0;
  padding-left: 20px;
}

.disclaimer-content li {
  margin: 8px 0;
  color: var(--ds-fg);
  font-size: 0.9rem;
}

.disclaimer-highlight {
  margin-top: 16px;
  padding: 12px;
  background: color-mix(in srgb, var(--ds-warning) 10%, transparent);
  border-left: 3px solid var(--ds-warning);
  border-radius: 4px;
  color: var(--ds-warning-fg);
  font-weight: 500;
}

.disclaimer-button {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, var(--ds-accent), var(--ds-accent-hover));
  color: var(--ds-fg-on-accent);
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.disclaimer-button:hover {
  background: linear-gradient(135deg, var(--ds-accent-hover), var(--ds-accent-strong));
  transform: translateY(-2px);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--ds-accent) 40%, transparent);
}
</style>
