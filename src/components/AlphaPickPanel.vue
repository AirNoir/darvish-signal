<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useStockStore } from '../stores/stockStore'

const store = useStockStore()

onMounted(async () => {
  await store.fetchAvailableDates()
  await store.fetchAlphaPicks()
})

// Watch for date changes
watch(() => store.selectedDate, async (newDate) => {
  if (newDate) {
    await store.fetchAlphaPicks(newDate)
  }
})

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-TW')
}

const getSignalClass = (signal: string) => {
  switch (signal) {
    case 'BUY': return 'signal-buy'
    case 'SELL': return 'signal-sell'
    default: return 'signal-hold'
  }
}

const getSignalLabel = (signal: string) => {
  switch (signal) {
    case 'BUY': return '買入'
    case 'SELL': return '賣出'
    default: return '觀望'
  }
}
</script>

<template>
  <div class="alpha-pick-panel">
    <div class="panel-header">
      <h2>🎯 Alpha Pick 套利信號</h2>
      
      <select v-model="store.selectedDate" class="date-select">
        <option v-for="date in store.availableDates" :key="date" :value="date">
          {{ formatDate(date) }}
        </option>
      </select>
    </div>

    <div v-if="store.isLoading" class="loading">
      載入中...
    </div>

    <div v-else-if="store.alphaPicks.length === 0" class="empty">
      暫無數據
    </div>

    <div v-else class="pick-list">
      <div 
        v-for="(pick, index) in store.alphaPicks" 
        :key="index" 
        class="pick-card"
        @click="store.searchStock(pick.symbol)"
      >
        <div class="pick-header">
          <span class="symbol">{{ pick.symbol }}</span>
          <span :class="['signal-badge', getSignalClass(pick.signal)]">
            {{ getSignalLabel(pick.signal) }}
          </span>
        </div>
        
        <div class="pick-details">
          <div class="detail-row">
            <span class="label">分數:</span>
            <span class="value score">{{ pick.score.toFixed(2) }}</span>
          </div>
          
          <template v-if="pick.signal === 'BUY'">
            <div class="detail-row" v-if="pick.entryPrice">
              <span class="label">進場價:</span>
              <span class="value">{{ pick.entryPrice }}</span>
            </div>
            <div class="detail-row" v-if="pick.targetPrice">
              <span class="label">目標價:</span>
              <span class="value target">{{ pick.targetPrice }}</span>
            </div>
            <div class="detail-row" v-if="pick.stopLoss">
              <span class="label">停損價:</span>
              <span class="value stop-loss">{{ pick.stopLoss }}</span>
            </div>
          </template>
        </div>

        <div class="pick-reason" v-if="pick.reason">
          {{ pick.reason }}
        </div>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="summary" v-if="store.alphaPicks.length > 0">
      <div class="stat">
        <span class="stat-label">買入信號</span>
        <span class="stat-value buy">
          {{ store.alphaPicks.filter(p => p.signal === 'BUY').length }}
        </span>
      </div>
      <div class="stat">
        <span class="stat-label">賣出信號</span>
        <span class="stat-value sell">
          {{ store.alphaPicks.filter(p => p.signal === 'SELL').length }}
        </span>
      </div>
      <div class="stat">
        <span class="stat-label">平均分數</span>
        <span class="stat-value">
          {{ (store.alphaPicks.reduce((sum, p) => sum + p.score, 0) / store.alphaPicks.length).toFixed(2) }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alpha-pick-panel {
  background: #1a1a2e;
  border-radius: 12px;
  padding: 20px;
  color: #fff;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #e94560;
}

.date-select {
  background: #16213e;
  color: #fff;
  border: 1px solid #0f3460;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.9rem;
}

.loading, .empty {
  text-align: center;
  padding: 40px;
  color: #666;
}

.pick-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pick-card {
  background: #16213e;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.pick-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(233, 69, 96, 0.3);
}

.pick-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.symbol {
  font-size: 1.3rem;
  font-weight: bold;
  color: #fff;
}

.signal-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.signal-buy {
  background: #26a69a;
  color: #fff;
}

.signal-sell {
  background: #ef5350;
  color: #fff;
}

.signal-hold {
  background: #ffc107;
  color: #333;
}

.pick-details {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 8px;
}

.detail-row {
  display: flex;
  gap: 8px;
}

.label {
  color: #888;
  font-size: 0.85rem;
}

.value {
  font-weight: 600;
}

.value.score {
  color: #7c4dff;
}

.value.target {
  color: #26a69a;
}

.value.stop-loss {
  color: #ef5350;
}

.pick-reason {
  font-size: 0.85rem;
  color: #aaa;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #0f3460;
}

.summary {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #0f3460;
}

.stat {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  color: #888;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
}

.stat-value.buy {
  color: #26a69a;
}

.stat-value.sell {
  color: #ef5350;
}
</style>
