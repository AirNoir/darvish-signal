<script setup lang="ts">
// 自訂訊號設定：條件清單（全部 AND）＋啟用開關。
// 啟用時 K 線上的達比 B/S 標記會隱藏，改畫自訂 ✦ 標記。
import { ref } from 'vue';
import { useCustomSignalStore, COND_META, type CondKind } from '../stores/customSignalStore';
import { trackEvent } from '../lib/analytics';

const emit = defineEmits<{ close: [] }>();
const signal = useCustomSignalStore();

const KIND_OPTIONS = Object.entries(COND_META).map(([kind, meta]) => ({ kind: kind as CondKind, label: meta.label }));
const newKind = ref<CondKind>('vol_ma');

const addCondition = () => {
  signal.addCondition(newKind.value);
  trackEvent('custom_signal_add_condition', { kind: newKind.value });
};

const toggleEnabled = () => {
  signal.enabled = !signal.enabled;
  trackEvent('custom_signal_toggle', { enabled: String(signal.enabled), condition_count: signal.conditions.length });
};
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      <div class="absolute inset-0 bg-scrim backdrop-blur-sm" @click="emit('close')"></div>

      <div class="relative w-full sm:max-w-2xl max-h-[88vh] bg-surface border border-line rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between px-5 pt-4 pb-3 border-b border-line-subtle">
          <div>
            <h2 class="text-fg-strong text-base font-bold">自訂訊號</h2>
            <p class="text-xs text-fg-muted mt-0.5">所有條件同日成立 → K 線標記 <span class="text-series-purple">✦</span>；啟用時會隱藏達比 B/S 訊號</p>
          </div>
          <button @click="emit('close')" class="p-1 text-fg-muted hover:text-fg-strong transition-colors" aria-label="關閉">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 啟用開關 -->
        <div class="flex items-center justify-between px-5 py-3 border-b border-line-subtle">
          <div>
            <p class="text-sm text-fg">啟用自訂訊號</p>
            <p class="text-xs text-fg-subtle mt-0.5">
              {{ signal.enabled ? `目前載入範圍內命中 ${signal.matchCount} 天` : '關閉時顯示原本的達比 B/S 訊號' }}
            </p>
          </div>
          <button
            @click="toggleEnabled"
            :disabled="signal.conditions.length === 0"
            :aria-pressed="signal.enabled"
            :class="[
              'relative w-11 h-6 rounded-full transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed',
              signal.enabled ? 'bg-accent' : 'bg-control'
            ]"
            aria-label="啟用自訂訊號"
          >
            <span
              :class="[
                'absolute top-0.5 w-5 h-5 rounded-full bg-media transition-all',
                signal.enabled ? 'left-[22px]' : 'left-0.5'
              ]"
            ></span>
          </button>
        </div>

        <!-- 條件清單 -->
        <div class="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-2 min-h-[160px]">
          <p v-if="signal.conditions.length === 0" class="text-sm text-fg-subtle text-center py-8">
            還沒有條件，從下方加入第一個
          </p>

          <div
            v-for="c in signal.conditions"
            :key="c.id"
            class="rounded-xl border border-line-subtle bg-raised px-3 py-2.5"
          >
            <div class="flex items-center gap-2 flex-wrap text-sm text-fg">
              <!-- 成交量 vs 均量 -->
              <template v-if="c.kind === 'vol_ma'">
                <span>今日成交量</span>
                <select v-model="c.op" class="csel"><option value="gt">＞</option><option value="lt">＜</option></select>
                <select v-model.number="c.period" class="csel">
                  <option v-for="p in COND_META.vol_ma.periods" :key="p" :value="p">{{ p }} 日均量</option>
                </select>
                <span>×</span>
                <input v-model.number="c.value" type="number" :step="COND_META.vol_ma.step" class="cinput" />
                <span class="text-fg-muted">倍</span>
              </template>

              <!-- 外資/投信日均買賣超 -->
              <template v-else-if="c.kind === 'insti_avg'">
                <select v-model="c.entity" class="csel"><option value="foreign">外資</option><option value="trust">投信</option></select>
                <select v-model.number="c.period" class="csel">
                  <option v-for="p in COND_META.insti_avg.periods" :key="p" :value="p">{{ p }} 日均</option>
                </select>
                <span>買賣超</span>
                <select v-model="c.op" class="csel"><option value="gt">＞</option><option value="lt">＜</option></select>
                <input v-model.number="c.value" type="number" class="cinput" />
                <span class="text-fg-muted">張（賣超用負值）</span>
              </template>

              <!-- RSI -->
              <template v-else-if="c.kind === 'rsi'">
                <span>RSI</span>
                <select v-model.number="c.period" class="csel"><option :value="9">9</option><option :value="14">14</option></select>
                <select v-model="c.op" class="csel"><option value="gt">＞</option><option value="lt">＜</option></select>
                <input v-model.number="c.value" type="number" step="1" class="cinput" />
              </template>

              <!-- KD 交叉 -->
              <template v-else-if="c.kind === 'kd_cross'">
                <span>KD</span>
                <select v-model="c.cross" class="csel">
                  <option value="golden">黃金交叉（K 上穿 D）</option>
                  <option value="death">死亡交叉（K 下穿 D）</option>
                </select>
              </template>

              <!-- 其餘：單值比較 -->
              <template v-else>
                <span>{{ COND_META[c.kind].label }}</span>
                <select v-model="c.op" class="csel"><option value="gt">＞</option><option value="lt">＜</option></select>
                <input v-model.number="c.value" type="number" :step="COND_META[c.kind].step ?? 1" class="cinput" />
                <span v-if="COND_META[c.kind].unit" class="text-fg-muted">{{ COND_META[c.kind].unit }}</span>
              </template>

              <button
                @click="signal.removeCondition(c.id)"
                class="ml-auto p-1 text-fg-subtle hover:text-danger-fg transition-colors shrink-0"
                aria-label="刪除條件"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p class="text-xs text-fg-subtle mt-1.5">{{ signal.latestValues[c.id] ?? '' }}</p>
          </div>
        </div>

        <!-- 新增條件 -->
        <div class="px-5 py-3 border-t border-line-subtle flex items-center gap-2">
          <select v-model="newKind" class="csel flex-1 sm:flex-none">
            <option v-for="o in KIND_OPTIONS" :key="o.kind" :value="o.kind">{{ o.label }}</option>
          </select>
          <button
            @click="addCondition"
            class="px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-fg-on-accent text-sm font-medium transition-colors shrink-0"
          >
            ＋ 新增條件
          </button>
          <p class="hidden sm:block ml-auto text-xs text-fg-subtle">籌碼單位依資料源（張）；以載入中的 K 線範圍計算</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.csel {
  background: var(--ds-bg-control);
  border: 1px solid var(--ds-border);
  border-radius: 8px;
  color: var(--ds-fg);
  font-size: 13px;
  padding: 4px 8px;
}
.cinput {
  background: var(--ds-bg-control);
  border: 1px solid var(--ds-border);
  border-radius: 8px;
  color: var(--ds-fg);
  font-size: 13px;
  padding: 4px 8px;
  width: 6.5rem;
}
.cinput:focus, .csel:focus {
  outline: none;
  border-color: var(--ds-accent);
}
</style>
