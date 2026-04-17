<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useStockStore } from '../stores/stockStore'

const emit = defineEmits<{ stockSelected: [] }>()

const store = useStockStore()
const activeTab = ref<'buy' | 'sell'>('buy')

// Check localStorage immediately to avoid flash
const hasSeenDisclaimer = typeof window !== 'undefined'
  ? localStorage.getItem('alpha-disclaimer-seen') === 'true'
  : false
const showDisclaimer = ref(!hasSeenDisclaimer)

onMounted(async () => {
  await store.fetchAvailableDates()
  await Promise.all([
    store.fetchAlphaPicks(),
    store.fetchSellAlerts(),
  ])
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

const conditionCount = (pick: any) => {
  const keys = Object.keys(pick).filter(k => k.startsWith('cond_'))
  return keys.filter(k => pick[k] === true).length
}
</script>

<template>
  <div class="alpha-pick-panel">
    <!-- Header -->
    <div class="panel-header">
      <h2>📊 Alpha 訊號</h2>
      <select v-model="store.selectedDate" class="date-select">
        <option v-for="date in store.availableDates" :key="date" :value="date">
          {{ formatDate(date) }}
        </option>
      </select>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button
        :class="['tab', activeTab === 'buy' ? 'tab-active-buy' : '']"
        @click="activeTab = 'buy'"
      >
        ▲ 強勢股 ({{ store.alphaPicks.length }})
      </button>
      <button
        :class="['tab', activeTab === 'sell' ? 'tab-active-sell' : '']"
        @click="activeTab = 'sell'"
      >
        ▼ 弱勢股 ({{ store.sellAlerts.length }})
      </button>
    </div>

    <div v-if="store.isLoading" class="loading">載入中...</div>

    <!-- BUY Picks -->
    <div v-else-if="activeTab === 'buy'" class="pick-list">
      <div v-if="store.alphaPicks.length === 0" class="empty">暫無強勢股訊號</div>
      <div
        v-for="pick in store.alphaPicks"
        :key="pick.symbol"
        class="pick-card pick-card-buy"
        @click="store.searchStock(pick.symbol); emit('stockSelected')"
      >
        <div class="pick-header">
          <div class="symbol-group">
            <span class="symbol">{{ pick.symbol }}</span>
            <span class="name">{{ pick.name }}</span>
          </div>
          <div class="price-group">
            <span class="price">{{ pick.close }}</span>
            <span class="signal-badge buy-badge">強勢股</span>
          </div>
        </div>

        <div class="indicators">
          <span class="indicator">RSI {{ pick.rsi_14.toFixed(1) }}</span>
          <span class="indicator">MACD {{ pick.macd_hist >= 0 ? '+' : '' }}{{ pick.macd_hist.toFixed(2) }}</span>
          <span class="indicator">%B {{ pick.bb_percent_b.toFixed(2) }}</span>
          <span class="indicator">法人 {{ conditionCount(pick) }}項</span>
        </div>

        <div class="reasons">{{ pick.reasons }}</div>
      </div>
    </div>

    <!-- SELL Alerts -->
    <div v-else class="pick-list">
      <div v-if="store.sellAlerts.length === 0" class="empty">暫無弱勢股訊號</div>
      <div
        v-for="alert in store.sellAlerts"
        :key="alert.symbol"
        class="pick-card pick-card-sell"
        @click="store.searchStock(alert.symbol); emit('stockSelected')"
      >
        <div class="pick-header">
          <div class="symbol-group">
            <span class="symbol">{{ alert.symbol }}</span>
            <span class="name">{{ alert.name }}</span>
          </div>
          <div class="price-group">
            <span class="price">{{ alert.close }}</span>
            <span class="signal-badge sell-badge">弱勢股</span>
          </div>
        </div>

        <div class="indicators">
          <span class="indicator">RSI {{ alert.rsi_14.toFixed(1) }}</span>
          <span class="indicator">MACD {{ alert.macd_hist >= 0 ? '+' : '' }}{{ alert.macd_hist.toFixed(2) }}</span>
          <span class="indicator">%B {{ alert.bb_percent_b.toFixed(2) }}</span>
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
          <svg class="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <h3>⚠️ 投資風險警示與免責聲明</h3>
        </div>
        <div class="disclaimer-content">
          <p><strong>本網站提供的資訊僅供參考，不構成任何投資建議或推薦。</strong></p>
          <ul>
            <li>「強勢股」與「弱勢股」標記僅為技術指標分析結果，非交易建議。</li>
            <li>投資有風險，過去表現不代表未來結果。</li>
            <li>使用者應自行判斷並承擔所有投資決策的風險與責任。</li>
            <li>本網站對於因使用本服務所產生的任何損失，不負任何法律責任。</li>
            <li>投資前請詳閱公開說明書，並諮詢專業財務顧問。</li>
          </ul>
          <p class="disclaimer-highlight">請確認您已閱讀並理解以上聲明</p>
        </div>
        <button class="disclaimer-button" @click="closeDisclaimer">
          我已了解風險，繼續使用
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alpha-pick-panel {
  background: #1a1a2e;
  height: 100%;
  display: flex;
  flex-direction: column;
  color: #fff;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #0f3460;
}

.panel-header h2 {
  margin: 0;
  font-size: 1rem;
  color: #e0e0e0;
}

.date-select {
  background: #16213e;
  color: #fff;
  border: 1px solid #0f3460;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 0.8rem;
}

.tabs {
  display: flex;
  gap: 8px; /* 增加按鈕間距 */
  border-bottom: 1px solid #0f3460;
}

.tab {
  flex: 1;
  padding: 10px;
  font-size: 0.85rem;
  background: transparent;
  color: #888;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  background: #16213e;
  color: #fff;
}

.tab-active-buy {
  color: #26a69a;
  border-bottom: 2px solid #26a69a;
}

.tab-active-sell {
  color: #ef5350;
  border-bottom: 2px solid #ef5350;
}

.loading,
.empty {
  text-align: center;
  padding: 40px;
  color: #666;
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
  background: #16213e;
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
  border-left-color: #26a69a;
}

.pick-card-buy:hover {
  box-shadow: 0 2px 8px rgba(38, 166, 154, 0.25);
}

.pick-card-sell {
  border-left-color: #ef5350;
}

.pick-card-sell:hover {
  box-shadow: 0 2px 8px rgba(239, 83, 80, 0.25);
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
  color: #fff;
}

.name {
  font-size: 0.8rem;
  color: #888;
}

.price-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price {
  font-size: 1rem;
  font-weight: 600;
  color: #e0e0e0;
}

.signal-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.buy-badge {
  background: rgba(38, 166, 154, 0.2);
  color: #26a69a;
  border: 1px solid #26a69a;
}

.sell-badge {
  background: rgba(239, 83, 80, 0.2);
  color: #ef5350;
  border: 1px solid #ef5350;
}

.indicators {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.indicator {
  background: #0f1923;
  color: #aaa;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 4px;
}

.reasons {
  font-size: 0.75rem;
  color: #777;
  line-height: 1.5;
  word-break: break-all;
}

.footer {
  padding: 10px 16px;
  font-size: 0.75rem;
  color: #555;
  border-top: 1px solid #0f3460;
  text-align: center;
}

/* Disclaimer Modal Styles */
.disclaimer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.disclaimer-modal {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid #0f3460;
}

.disclaimer-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #0f3460;
}

.disclaimer-header svg {
  width: 32px;
  height: 32px;
  color: #f59e0b;
  flex-shrink: 0;
}

.disclaimer-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #f59e0b;
  font-weight: 600;
}

.disclaimer-content {
  color: #e0e0e0;
  line-height: 1.6;
  margin-bottom: 20px;
}

.disclaimer-content p {
  margin: 0 0 12px 0;
}

.disclaimer-content strong {
  color: #fff;
  font-size: 1.05rem;
}

.disclaimer-content ul {
  margin: 12px 0;
  padding-left: 20px;
}

.disclaimer-content li {
  margin: 8px 0;
  color: #ccc;
  font-size: 0.9rem;
}

.disclaimer-highlight {
  margin-top: 16px;
  padding: 12px;
  background: rgba(245, 158, 11, 0.1);
  border-left: 3px solid #f59e0b;
  border-radius: 4px;
  color: #fbbf24;
  font-weight: 500;
}

.disclaimer-button {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.disclaimer-button:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}
</style>
