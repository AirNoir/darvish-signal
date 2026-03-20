<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useStockStore } from '../stores/stockStore'

const store = useStockStore()
const activeTab = ref<'buy' | 'sell'>('buy')

onMounted(async () => {
  await store.fetchAvailableDates()
  await Promise.all([
    store.fetchAlphaPicks(),
    store.fetchSellAlerts(),
  ])
})

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
        ▲ 買入 ({{ store.alphaPicks.length }})
      </button>
      <button
        :class="['tab', activeTab === 'sell' ? 'tab-active-sell' : '']"
        @click="activeTab = 'sell'"
      >
        ▼ 賣出 ({{ store.sellAlerts.length }})
      </button>
    </div>

    <div v-if="store.isLoading" class="loading">載入中...</div>

    <!-- BUY Picks -->
    <div v-else-if="activeTab === 'buy'" class="pick-list">
      <div v-if="store.alphaPicks.length === 0" class="empty">暫無買入訊號</div>
      <div
        v-for="pick in store.alphaPicks"
        :key="pick.symbol"
        class="pick-card pick-card-buy"
        @click="store.searchStock(pick.symbol)"
      >
        <div class="pick-header">
          <div class="symbol-group">
            <span class="symbol">{{ pick.symbol }}</span>
            <span class="name">{{ pick.name }}</span>
          </div>
          <div class="price-group">
            <span class="price">{{ pick.close }}</span>
            <span class="signal-badge buy-badge">買入</span>
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
      <div v-if="store.sellAlerts.length === 0" class="empty">暫無賣出訊號</div>
      <div
        v-for="alert in store.sellAlerts"
        :key="alert.symbol"
        class="pick-card pick-card-sell"
        @click="store.searchStock(alert.symbol)"
      >
        <div class="pick-header">
          <div class="symbol-group">
            <span class="symbol">{{ alert.symbol }}</span>
            <span class="name">{{ alert.name }}</span>
          </div>
          <div class="price-group">
            <span class="price">{{ alert.close }}</span>
            <span class="signal-badge sell-badge">賣出</span>
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
</style>
