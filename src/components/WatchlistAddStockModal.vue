<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useStockStore } from '../stores/stockStore';
import { useFavoritesStore, addResultMessage } from '../stores/favoritesStore';

const emit = defineEmits<{ close: [] }>();

const stockStore = useStockStore();
const favorites = useFavoritesStore();
const query = ref('');
const inputRef = ref<HTMLInputElement | null>(null);
const pendingSymbol = ref<string | null>(null);
const notice = ref<string | null>(null);

// 要加入的群組與我的最愛頁目前選的群組同步：在這裡切換，後面的清單也跟著換
const target = computed(() => favorites.activeGroup);
const targetNo = computed(() => target.value?.group_no ?? 0);
const targetFull = computed(() => favorites.isGroupFull(targetNo.value));

// 代碼或名稱模糊搜尋；未輸入時顯示全部（上限 50 筆避免過長）
const results = computed(() => {
  const q = query.value.trim().toLowerCase();
  const list = q
    ? stockStore.stockList.filter(
        (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
      )
    : stockStore.stockList;
  return list.slice(0, 50);
});

// 這檔已在哪些「其他」群組（提示用）
const otherGroupNames = (symbol: string) =>
  favorites
    .groupsContaining(symbol)
    .filter((no) => no !== targetNo.value)
    .map((no) => favorites.groupOf(no)?.name ?? `群組 ${no}`)
    .join('、');

const toggle = async (symbol: string) => {
  if (pendingSymbol.value || !targetNo.value) return;
  pendingSymbol.value = symbol;
  notice.value = null;
  try {
    const result = await favorites.toggleInGroup(targetNo.value, symbol);
    if (typeof result === 'object' && !result.ok) {
      notice.value = addResultMessage(result, target.value?.name);
    } else if (result === false) {
      notice.value = '操作失敗，請稍後再試';
    }
  } finally {
    pendingSymbol.value = null;
  }
};

onMounted(async () => {
  if (stockStore.stockList.length === 0) {
    await stockStore.fetchStockList();
  }
  inputRef.value?.focus();
});
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      <div class="absolute inset-0 bg-scrim backdrop-blur-sm" @click="emit('close')"></div>

      <div class="relative w-full sm:max-w-md max-h-[85vh] bg-surface border border-line rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between px-5 pt-4 pb-3 border-b border-line-subtle">
          <div>
            <h2 class="text-fg-strong text-base font-bold">新增個股</h2>
            <p class="text-xs text-fg-muted mt-0.5 tabular-nums">
              加入 {{ target?.name ?? '我的最愛' }}（{{ target?.items.length ?? 0 }}/{{ favorites.maxPerGroup }}）
            </p>
          </div>
          <button @click="emit('close')" class="p-1 text-fg-muted hover:text-fg-strong transition-colors" aria-label="關閉">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 群組選擇（名稱與數量由後端決定） -->
        <div class="px-5 pt-3 flex gap-1.5 overflow-x-auto" role="tablist" aria-label="選擇群組">
          <button
            v-for="g in favorites.groups"
            :key="g.group_no"
            role="tab"
            :aria-selected="g.group_no === targetNo"
            @click="favorites.setActiveGroup(g.group_no)"
            :class="[
              'shrink-0 px-2.5 py-1 rounded-full text-xs transition-colors tabular-nums',
              g.group_no === targetNo
                ? 'bg-accent text-fg-strong'
                : 'bg-control text-fg-secondary hover:bg-control-hover hover:text-fg-strong'
            ]"
          >
            {{ g.name }} {{ g.items.length }}/{{ favorites.maxPerGroup }}
          </button>
        </div>

        <!-- Search input -->
        <div class="px-5 py-3">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              placeholder="輸入股票代碼或名稱（例：2330 / 台積電）"
              class="w-full pl-9 pr-3 py-2 bg-raised border border-line rounded-lg text-base md:text-sm text-fg-strong placeholder:text-fg-subtle focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <p v-if="notice" class="mt-2 text-xs text-warning-fg">{{ notice }}</p>
          <p v-else-if="targetFull && target" class="mt-2 text-xs text-warning-fg">
            {{ target.name }}已滿（每組 {{ favorites.maxPerGroup }} 檔），可以切換到其他群組或先移除
          </p>
        </div>

        <!-- Results -->
        <div class="flex-1 overflow-y-auto px-2 pb-4 min-h-[200px]">
          <p v-if="results.length === 0" class="px-4 py-6 text-center text-sm text-fg-muted">
            找不到符合的股票
          </p>
          <div
            v-for="stock in results"
            :key="stock.symbol"
            class="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-hover transition-colors"
          >
            <div class="flex items-center gap-3 min-w-0">
              <span class="font-mono text-accent text-sm w-14 shrink-0">{{ stock.symbol }}</span>
              <span class="min-w-0">
                <span class="block text-sm text-fg truncate">{{ stock.name }}</span>
                <span v-if="otherGroupNames(stock.symbol)" class="block text-[10px] text-fg-subtle truncate">
                  也在 {{ otherGroupNames(stock.symbol) }}
                </span>
              </span>
            </div>
            <button
              @click="toggle(stock.symbol)"
              :disabled="pendingSymbol === stock.symbol || (!favorites.isInGroup(targetNo, stock.symbol) && targetFull)"
              :class="[
                'px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed',
                favorites.isInGroup(targetNo, stock.symbol)
                  ? 'bg-control text-fg-secondary hover:bg-danger/20 hover:text-danger-fg'
                  : 'bg-accent text-fg-strong hover:bg-accent-hover'
              ]"
            >
              {{ favorites.isInGroup(targetNo, stock.symbol) ? '已加入' : '＋ 加入' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
