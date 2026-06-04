<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppHeader from '../components/AppHeader.vue';
import stockApi, { type TradeRecord, type TradeRecordsResponse } from '../api/stockApi';

const PAGE_SIZE = 20;

const data = ref<TradeRecordsResponse | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);
const currentPage = ref(1);

// Last 2 years from today
const today = new Date();
const twoYearsAgo = new Date(today);
twoYearsAgo.setFullYear(today.getFullYear() - 2);
const TO = today.toISOString().slice(0, 10);
const FROM = twoYearsAgo.toISOString().slice(0, 10);

onMounted(async () => {
  isLoading.value = true;
  error.value = null;
  try {
    data.value = await stockApi.getTradeRecords(FROM, TO);
  } catch (e) {
    error.value = e instanceof Error ? e.message : '載入失敗，請稍後再試';
  } finally {
    isLoading.value = false;
  }
});

const allRecords = computed<TradeRecord[]>(() => data.value?.records ?? []);
const totalPages = computed(() => Math.ceil(allRecords.value.length / PAGE_SIZE));
const pagedRecords = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return allRecords.value.slice(start, start + PAGE_SIZE);
});

const pageNumbers = computed(() => {
  const total = totalPages.value;
  const cur = currentPage.value;
  const pages: (number | '...')[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (cur > 3) pages.push('...');
    for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
    if (cur < total - 2) pages.push('...');
    pages.push(total);
  }
  return pages;
});

const formatDate = (d: string) => d.replace(/-/g, '/');

const formatPrice = (v: number | null | undefined) =>
  v == null || !Number.isFinite(v) ? '—' : v.toFixed(2);

const formatPerformance = (v: number | null | undefined) => {
  if (v == null || !Number.isFinite(v)) return null;
  const pct = (v * 100).toFixed(2);
  return v >= 0 ? `+${pct}%` : `${pct}%`;
};

const perfClass = (v: number | null) => {
  if (v === null) return 'text-gray-500';
  return v >= 0 ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold';
};

const winRatePct = computed(() =>
  data.value && Number.isFinite(data.value.win_rate)
    ? (data.value.win_rate * 100).toFixed(1)
    : '--'
);
const avgPerfPct = computed(() =>
  data.value && Number.isFinite(data.value.avg_performance)
    ? (data.value.avg_performance * 100).toFixed(2)
    : '--'
);
const avgPerfPositive = computed(() => (data.value?.avg_performance ?? 0) >= 0);
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0f0f0f] text-white">
    <AppHeader />

    <main class="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <!-- Page Title -->
      <div class="mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold text-white mb-1">策略回測模擬</h1>
        <p class="text-gray-400 text-sm">技術條件機械式回測示例 · {{ FROM }} ～ {{ TO }}</p>
      </div>

      <!-- Simulation Warning Banner -->
      <div class="mb-8 rounded-xl overflow-hidden border border-amber-500/30 bg-gradient-to-r from-amber-500/[0.08] via-amber-500/[0.04] to-transparent">
        <div class="flex items-start gap-3 sm:gap-4 p-4 sm:p-5">
          <div class="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xl">
            ⚠️
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1.5">
              <span class="text-amber-400 font-bold text-sm sm:text-base tracking-wide">回測模擬資料</span>
              <span class="text-amber-500/40 text-xs">‧</span>
              <span class="text-amber-400/80 text-xs sm:text-sm font-semibold">非真實交易、非投資建議</span>
            </div>
            <p class="text-gray-300 text-xs sm:text-sm leading-relaxed">
              本頁為依預設技術條件對歷史公開資料機械式比對的模擬結果，並非實盤下單，亦非個股推介或選股建議。
              本網站不揭露任何具名個股之未來預期績效，數據僅供工具測試與技術指標研究之用。
            </p>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex items-center justify-center py-24">
        <div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="ml-3 text-gray-400 text-sm">載入中...</span>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-24">
        <p class="text-red-400 text-sm">{{ error }}</p>
      </div>

      <template v-else-if="data">
        <!-- Summary Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div class="bg-white/5 border border-white/10 rounded-xl p-4">
            <p class="text-xs text-gray-500 mb-1">總交易筆數</p>
            <p class="text-2xl font-bold text-white">{{ data.count }}</p>
          </div>
          <div class="bg-white/5 border border-white/10 rounded-xl p-4">
            <p class="text-xs text-gray-500 mb-1">勝率</p>
            <p class="text-2xl font-bold text-emerald-400">{{ winRatePct }}%</p>
          </div>
          <div class="bg-white/5 border border-white/10 rounded-xl p-4">
            <p class="text-xs text-gray-500 mb-1">獲利 / 虧損</p>
            <p class="text-2xl font-bold">
              <span class="text-emerald-400">{{ data.profit_count }}</span>
              <span class="text-gray-600 mx-1">/</span>
              <span class="text-red-400">{{ data.loss_count }}</span>
            </p>
          </div>
          <div class="bg-white/5 border border-white/10 rounded-xl p-4">
            <p class="text-xs text-gray-500 mb-1">平均績效</p>
            <p class="text-2xl font-bold" :class="avgPerfPositive ? 'text-emerald-400' : 'text-red-400'">
              {{ avgPerfPositive ? '+' : '' }}{{ avgPerfPct }}%
            </p>
          </div>
        </div>

        <!-- Table -->
        <div class="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-white/10 text-gray-500 text-xs uppercase tracking-wider">
                  <th class="text-left px-4 py-3 font-medium">日期</th>
                  <th class="text-left px-4 py-3 font-medium">股票</th>
                  <th class="text-left px-4 py-3 font-medium">代號</th>
                  <th class="text-left px-4 py-3 font-medium">方向</th>
                  <th class="text-left px-4 py-3 font-medium">價格</th>
                  <th class="text-left px-4 py-3 font-medium">績效</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(rec, idx) in pagedRecords"
                  :key="`${rec.symbol}-${rec.trade_date}-${idx}`"
                  class="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td class="px-4 py-3 text-gray-300 whitespace-nowrap">{{ formatDate(rec.trade_date) }}</td>
                  <td class="px-4 py-3 text-white font-medium">{{ rec.name }}</td>
                  <td class="px-4 py-3 text-gray-400">{{ rec.symbol }}</td>
                  <td class="px-4 py-3">
                    <span
                      :class="rec.type === 'BUY'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/15 text-red-400 border border-red-500/30'"
                      class="inline-block px-2 py-0.5 rounded text-xs font-semibold"
                    >
                      {{ rec.type === 'BUY' ? '買入' : '賣出' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-gray-300">{{ formatPrice(rec.price) }}</td>
                  <td class="px-4 py-3">
                    <span v-if="rec.performance !== null" :class="perfClass(rec.performance)">
                      {{ formatPerformance(rec.performance) }}
                    </span>
                    <span v-else class="text-gray-600">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <p class="text-xs text-gray-500">
              第 {{ (currentPage - 1) * PAGE_SIZE + 1 }}–{{ Math.min(currentPage * PAGE_SIZE, allRecords.length) }} 筆，共 {{ allRecords.length }} 筆
            </p>
            <div class="flex items-center gap-1">
              <button
                :disabled="currentPage === 1"
                @click="currentPage--"
                class="px-2 py-1 rounded text-xs text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                &lsaquo;
              </button>
              <template v-for="p in pageNumbers" :key="p">
                <span v-if="p === '...'" class="px-1 text-gray-600 text-xs">…</span>
                <button
                  v-else
                  @click="currentPage = p as number"
                  :class="[
                    'px-2.5 py-1 rounded text-xs transition-colors',
                    currentPage === p
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  ]"
                >
                  {{ p }}
                </button>
              </template>
              <button
                :disabled="currentPage === totalPages"
                @click="currentPage++"
                class="px-2 py-1 rounded text-xs text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                &rsaquo;
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- Disclaimer Section -->
      <section class="mt-10 rounded-xl border border-white/10 bg-white/[0.03]">
        <header class="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-white/10">
          <span class="inline-block w-1 h-5 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></span>
          <h2 class="text-sm sm:text-base font-semibold text-white tracking-wide">回測模擬說明與免責聲明</h2>
        </header>
        <ul class="px-5 sm:px-6 py-5 space-y-3 text-xs sm:text-sm text-gray-400 leading-relaxed">
          <li class="flex gap-3">
            <span class="flex-shrink-0 text-blue-400/60 font-mono select-none">01</span>
            <span>本頁所列之資料為對歷史公開資料以預設技術條件機械式比對的模擬結果，<strong class="text-gray-300">並非真實帳戶下單紀錄、亦非個股推介或選股建議</strong>。</span>
          </li>
          <li class="flex gap-3">
            <span class="flex-shrink-0 text-blue-400/60 font-mono select-none">02</span>
            <span>買進條件依據 <code class="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs">技術多方條件</code> 觸發（近 4 個交易日中至少 3 日符合）。</span>
          </li>
          <li class="flex gap-3">
            <span class="flex-shrink-0 text-blue-400/60 font-mono select-none">03</span>
            <span>賣出條件依據 <code class="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-xs">技術空方條件</code> 觸發（近 5 個交易日中至少 2 日符合）。</span>
          </li>
          <li class="flex gap-3">
            <span class="flex-shrink-0 text-blue-400/60 font-mono select-none">04</span>
            <span>模擬價格採用條件觸發次一交易日之 <span class="text-gray-300 font-mono text-xs">(開盤價 + 收盤價) / 2</span>，未計入手續費、交易稅與滑價。</span>
          </li>
          <li class="flex gap-3">
            <span class="flex-shrink-0 text-blue-400/60 font-mono select-none">05</span>
            <span>本頁績效數據為「假設完全依條件機械式進出」之理論值，實際投資將受成交量、流動性、個人判斷等因素影響。</span>
          </li>
          <li class="flex gap-3">
            <span class="flex-shrink-0 text-blue-400/60 font-mono select-none">06</span>
            <span class="text-gray-300">過去績效不代表未來表現。本頁內容不構成《證券投資信託及顧問法》第 4 條所定義之投資分析意見或推介建議。<span class="text-amber-400/90 font-semibold">投資決策請自行判斷並承擔全部風險，必要時請諮詢具合格證照之專業顧問。</span></span>
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>
