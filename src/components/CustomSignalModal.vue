<script setup lang="ts">
// 自訂訊號設定：多方 / 空方兩組條件（各自 AND、各自產生標記）＋啟用開關。
// 啟用時 K 線上的達比 B/S 標記會隱藏，改畫自訂 多（紅）/ 空（綠）標記。
import { reactive, computed } from 'vue';
import { useCustomSignalStore, COND_META, type CondKind, type CondSide, type CustomCondition } from '../stores/customSignalStore';
import { trackEvent } from '../lib/analytics';

const emit = defineEmits<{ close: [] }>();
const signal = useCustomSignalStore();

const KIND_OPTIONS = Object.entries(COND_META).map(([kind, meta]) => ({ kind: kind as CondKind, label: meta.label }));

const SIDES: { key: CondSide; label: string; markClass: string; mark: string }[] = [
  { key: 'long', label: '多方條件', markClass: 'text-market-up', mark: '多' },
  { key: 'short', label: '空方條件', markClass: 'text-market-down', mark: '空' },
];

const newKind = reactive<Record<CondSide, CondKind>>({ long: 'vol_ma', short: 'vol_ma' });

const bySide = computed<Record<CondSide, CustomCondition[]>>(() => ({
  long: signal.conditions.filter((c) => c.side === 'long'),
  short: signal.conditions.filter((c) => c.side === 'short'),
}));

const addCondition = (side: CondSide) => {
  signal.addCondition(newKind[side], side);
  trackEvent('custom_signal_add_condition', { kind: newKind[side], side });
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
            <p class="text-xs text-fg-muted mt-0.5">
              多方 / 空方各自全部成立 → 標記 <span class="text-market-up">多</span> / <span class="text-market-down">空</span>；啟用時隱藏達比 B/S
            </p>
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
              <template v-if="signal.enabled">
                載入範圍內命中：<span class="text-market-up">多 {{ signal.matchCount.long }} 天</span>
                ・<span class="text-market-down">空 {{ signal.matchCount.short }} 天</span>
              </template>
              <template v-else>關閉時顯示原本的達比 B/S 訊號</template>
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

        <!-- 多方 / 空方 兩區 -->
        <div class="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-4 min-h-[200px]">
          <section v-for="side in SIDES" :key="side.key">
            <div class="flex items-center gap-2 mb-2">
              <span :class="['text-sm font-bold', side.markClass]">{{ side.label }}</span>
              <span class="text-xs text-fg-subtle">全部成立才標記「{{ side.mark }}」</span>
            </div>

            <p v-if="bySide[side.key].length === 0" class="text-xs text-fg-subtle rounded-xl border border-dashed border-line-subtle px-3 py-3 mb-2">
              尚無{{ side.label }}，不會產生「{{ side.mark }}」標記
            </p>

            <div
              v-for="c in bySide[side.key]"
              :key="c.id"
              class="rounded-xl border border-line-subtle bg-raised px-3 py-2.5 mb-2"
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

            <!-- 該側新增 -->
            <div class="flex items-center gap-2">
              <select v-model="newKind[side.key]" class="csel flex-1 sm:flex-none">
                <option v-for="o in KIND_OPTIONS" :key="o.kind" :value="o.kind">{{ o.label }}</option>
              </select>
              <button
                @click="addCondition(side.key)"
                class="px-3 py-1.5 rounded-lg bg-control hover:bg-control-hover text-fg text-sm font-medium transition-colors shrink-0"
              >
                ＋ 加入{{ side.label }}
              </button>
            </div>
          </section>
        </div>

        <!-- 單位說明 -->
        <div class="px-5 py-2.5 border-t border-line-subtle">
          <p class="text-xs text-fg-subtle">
            單位：量/均量為倍數、券資比與 %b 為指標原值；外資/投信與融資券以「張」輸入。
            調整門檻前先看每條條件下方的「今日值」確認量級。
          </p>
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
