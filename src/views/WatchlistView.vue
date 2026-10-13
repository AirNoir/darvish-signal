<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AppHeader from '../components/AppHeader.vue';
import WatchlistAddStockModal from '../components/WatchlistAddStockModal.vue';
import { useAuthStore } from '../stores/authStore';
import { useStockStore } from '../stores/stockStore';
import {
  useFavoritesStore,
  addResultMessage,
  renameResultMessage,
  normalizeGroupName,
  groupNameLength,
  MAX_GROUP_NAME_LENGTH
} from '../stores/favoritesStore';
import { stockApi } from '../api/stockApi';
import { trackEvent } from '../lib/analytics';

interface Quote {
  close: number | null;
  change: number | null;
  changePercent: number | null;
  volume: number | null;
}

const router = useRouter();
const auth = useAuthStore();
const stockStore = useStockStore();
const favorites = useFavoritesStore();

const showAddModal = ref(false);
const quotes = ref<Record<string, Quote>>({});
const loadingQuotes = ref(false);
const notice = ref<string | null>(null);
const pendingSymbol = ref<string | null>(null);

// 目前選中的群組（群組數、名稱、每組上限都由後端決定）
const group = computed(() => favorites.activeGroup);
const groupNo = computed(() => group.value?.group_no ?? 0);
const groupFull = computed(() => favorites.isGroupFull(groupNo.value));
const otherGroups = computed(() => favorites.groups.filter((g) => g.group_no !== groupNo.value));

// 取最近兩根日 K 算漲跌；已抓過的 symbol 不重抓（切群組時共用）
const fetchQuotes = async (symbols: string[]) => {
  const missing = symbols.filter((s) => !(s in quotes.value));
  if (missing.length === 0) return;
  loadingQuotes.value = true;
  try {
    await Promise.all(
      missing.map(async (symbol) => {
        try {
          const data = await stockApi.getStockHistory(symbol, 2); // newest-first
          const latest = data[0];
          const prev = data[1];
          const close = latest?.close ?? null;
          const prevClose = prev?.close ?? null;
          const change = close != null && prevClose != null ? close - prevClose : null;
          quotes.value[symbol] = {
            close,
            change,
            changePercent:
              change != null && prevClose ? (change / prevClose) * 100 : null,
            volume: latest?.volume ?? null
          };
        } catch {
          quotes.value[symbol] = { close: null, change: null, changePercent: null, volume: null };
        }
      })
    );
  } finally {
    loadingQuotes.value = false;
  }
};

const symbols = computed(() => group.value?.items.map((i) => i.symbol) ?? []);

watch(symbols, (s) => fetchQuotes(s), { immediate: true });

const goToStock = (symbol: string) => {
  trackEvent('watchlist_stock_click', { symbol });
  router.push(`/app/${symbol}`);
};

const removeStock = async (symbol: string) => {
  if (pendingSymbol.value) return;
  pendingSymbol.value = symbol;
  notice.value = null;
  try {
    if (!(await favorites.remove(groupNo.value, symbol))) notice.value = '移除失敗，請稍後再試';
  } finally {
    pendingSymbol.value = null;
  }
};

// 移到其他群組：先加入新群組，成功後再從目前群組移除（store.move）
const moveStock = async (symbol: string, event: Event) => {
  const select = event.target as HTMLSelectElement;
  const to = Number(select.value);
  select.value = '';
  if (!to || pendingSymbol.value) return;
  pendingSymbol.value = symbol;
  notice.value = null;
  try {
    const result = await favorites.move(groupNo.value, to, symbol);
    if (!result.ok) notice.value = addResultMessage(result, favorites.groupOf(to)?.name);
  } finally {
    pendingSymbol.value = null;
  }
};

// 群組改名：鉛筆 → 行內輸入框（Enter 儲存、Esc 取消）；成功與否都由 store 回報
const renaming = ref(false);
const renameDraft = ref('');
const renamePending = ref(false);
const renameInput = ref<HTMLInputElement | null>(null);
// 規則與後端相同（1～10 個字，以 code point 計，不含控制字元）
const renameValid = computed(() => normalizeGroupName(renameDraft.value) !== null);
const renameLength = computed(() => groupNameLength(renameDraft.value));

// 注音、倉頡等輸入法組字時按的 Enter 是選字，不能送出：
// Chrome 給 isComposing，Safari 只能靠 keyCode 229。這裡一律擋掉表單的隱式送出，再自己決定要不要存
const onRenameEnter = (e: KeyboardEvent) => {
  e.preventDefault();
  if (e.isComposing || e.keyCode === 229) return;
  void commitRename();
};

const startRename = async () => {
  if (!group.value) return;
  renameDraft.value = group.value.name;
  notice.value = null;
  renaming.value = true;
  await nextTick();
  renameInput.value?.focus();
  renameInput.value?.select();
};

const cancelRename = () => {
  renaming.value = false;
  renameDraft.value = '';
};

const commitRename = async () => {
  if (!group.value || renamePending.value || !renameValid.value) return;
  renamePending.value = true;
  try {
    const result = await favorites.rename(groupNo.value, renameDraft.value);
    notice.value = renameResultMessage(result);
    if (result.ok) cancelRename();
  } finally {
    renamePending.value = false;
  }
};

// 切換群組時放棄未儲存的改名
watch(groupNo, cancelRename);

const formatPrice = (v: number | null): string =>
  v == null || !Number.isFinite(v) ? '—' : v.toFixed(2);

const formatVolume = (v: number | null): string => {
  if (v == null || !Number.isFinite(v)) return '—';
  // 股 → 張
  const lots = v / 1000;
  if (lots >= 1e4) return (lots / 1e4).toFixed(1) + ' 萬張';
  return Math.round(lots).toLocaleString() + ' 張';
};

onMounted(() => {
  if (stockStore.stockList.length === 0) {
    stockStore.fetchStockList();
  }
});
</script>

<template>
  <div class="min-h-screen bg-brand-bg text-fg-strong" style="font-family: 'GuanHei', 'Iansui', sans-serif;">
    <AppHeader />

    <main class="max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-16">
      <!-- 未登入 -->
      <div v-if="!auth.isLoggedIn" class="flex flex-col items-center justify-center py-24 text-center gap-4">
        <svg class="w-12 h-12 text-series-gold" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
        <h1 class="text-xl font-bold">我的最愛</h1>
        <p class="text-fg-secondary text-sm">登入後即可將個股分組收藏，快速追蹤你關注的個股</p>
        <button
          @click="auth.openLogin('watchlist_page')"
          class="mt-2 px-6 py-2 rounded-lg bg-accent hover:bg-accent-hover text-fg-strong text-sm font-medium transition-colors shadow-lg shadow-accent/20"
        >
          使用 Google 帳號登入
        </button>
      </div>

      <!-- 已登入 -->
      <template v-else>
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-baseline gap-2">
            <h1 class="text-xl font-bold">我的最愛</h1>
            <span v-if="favorites.loaded" class="text-sm text-fg-muted tabular-nums">
              共 {{ favorites.totalCount }} 檔・每組最多 {{ favorites.maxPerGroup }} 檔
            </span>
          </div>
          <button
            @click="showAddModal = true"
            :disabled="!favorites.loaded || groupFull"
            :title="groupFull && group ? `${group.name}已滿（每組 ${favorites.maxPerGroup} 檔）` : undefined"
            class="px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-fg-strong text-sm font-medium transition-colors flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            新增個股
          </button>
        </div>

        <!-- 群組分頁（名稱與數量由後端決定；手機可橫向捲動） -->
        <div
          v-if="favorites.loaded"
          class="flex gap-1.5 overflow-x-auto pb-1 mb-3 -mx-1 px-1"
          role="tablist"
          aria-label="我的最愛群組"
        >
          <button
            v-for="g in favorites.groups"
            :key="g.group_no"
            role="tab"
            :aria-selected="g.group_no === groupNo"
            @click="favorites.setActiveGroup(g.group_no)"
            :class="[
              'shrink-0 px-3 py-1.5 rounded-full text-sm transition-colors tabular-nums',
              g.group_no === groupNo
                ? 'bg-accent text-fg-strong'
                : 'bg-control text-fg-secondary hover:bg-control-hover hover:text-fg-strong'
            ]"
          >
            {{ g.name }} <span class="text-xs opacity-80">{{ g.items.length }}/{{ favorites.maxPerGroup }}</span>
          </button>
          <!-- 重新命名目前群組（不是分頁，放在 tablist 之外的同一列） -->
          <button
            v-if="group && !renaming"
            type="button"
            @click="startRename"
            aria-label="重新命名群組"
            :title="`重新命名${group.name}`"
            class="shrink-0 p-1.5 rounded-full text-fg-subtle hover:text-fg-strong hover:bg-control transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536M4 20h4l10.5-10.5a2.5 2.5 0 00-3.536-3.536L4 16v4z" />
            </svg>
          </button>
        </div>

        <!-- 改名表單 -->
        <form v-if="renaming && group" @submit.prevent="commitRename" class="flex items-center gap-2 mb-3">
          <input
            ref="renameInput"
            v-model="renameDraft"
            type="text"
            :placeholder="group.name"
            aria-label="群組名稱"
            @keydown.enter="onRenameEnter"
            @keydown.esc.prevent="cancelRename"
            class="w-40 px-2.5 py-1.5 rounded-lg bg-control text-sm text-fg-strong border border-line focus:outline-none focus:border-accent"
          />
          <!-- 字數以 code point 計（maxlength 以 UTF-16 計會提早擋下 emoji），超過時標示 -->
          <span
            class="text-[11px] tabular-nums"
            :class="renameLength > MAX_GROUP_NAME_LENGTH ? 'text-warning-fg' : 'text-fg-muted'"
            aria-live="polite"
          >{{ renameLength }}/{{ MAX_GROUP_NAME_LENGTH }}</span>
          <button
            type="submit"
            :disabled="!renameValid || renamePending"
            class="px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-fg-strong text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            儲存
          </button>
          <button
            type="button"
            @click="cancelRename"
            :disabled="renamePending"
            class="px-3 py-1.5 rounded-lg bg-hover hover:bg-control-hover text-fg text-sm transition-colors disabled:opacity-40"
          >
            取消
          </button>
        </form>

        <p v-if="groupFull && group" class="text-xs text-warning-fg mb-3">
          {{ group.name }}已滿（每組 {{ favorites.maxPerGroup }} 檔），移除或移至其他群組後才能再加入
        </p>
        <p v-if="notice" class="text-xs text-warning-fg mb-3">{{ notice }}</p>

        <!-- 載入中 -->
        <div v-if="favorites.isLoading && !favorites.loaded" class="py-20 text-center text-sm text-fg-muted">
          載入中…
        </div>

        <!-- 空群組 -->
        <div
          v-else-if="!group || group.items.length === 0"
          class="flex flex-col items-center justify-center py-20 text-center gap-3 border border-dashed border-line rounded-2xl"
        >
          <p class="text-fg-muted text-sm">{{ group?.name ?? '這個群組' }}還沒有加入任何個股</p>
          <button
            @click="showAddModal = true"
            class="px-4 py-1.5 rounded-lg bg-hover hover:bg-control-hover text-fg hover:text-fg-strong text-sm transition-colors"
          >
            ＋ 用代碼或名稱搜尋加入
          </button>
        </div>

        <!-- 個股清單（依加入時間新到舊，由後端排序） -->
        <div v-else class="rounded-2xl border border-line-subtle overflow-hidden">
          <!-- 表頭 -->
          <div class="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1.2fr_1fr_1fr_1fr_auto] items-center gap-2 px-4 py-2 bg-raised text-xs text-fg-muted">
            <span>個股</span>
            <span class="text-right w-20 sm:w-auto">股價</span>
            <span class="text-right w-24 sm:w-auto">漲跌</span>
            <span class="hidden sm:block text-right">成交量</span>
            <span class="hidden sm:block w-28"></span>
          </div>

          <div
            v-for="item in group.items"
            :key="item.symbol"
            class="relative group border-t border-line-subtle"
          >
            <button
              @click="goToStock(item.symbol)"
              class="w-full grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1.2fr_1fr_1fr_1fr_auto] items-center gap-2 px-4 py-3 hover:bg-hover transition-colors text-left"
            >
              <!-- 代碼 + 名稱（名稱以後端回傳為準） -->
              <div class="min-w-0">
                <p class="text-sm font-medium text-fg-strong truncate">{{ item.name || item.symbol }}</p>
                <p class="text-xs text-fg-muted font-mono">{{ item.symbol }}</p>
              </div>

              <!-- 股價 -->
              <span class="text-sm text-fg-strong tabular-nums text-right w-20 sm:w-auto">
                {{ formatPrice(quotes[item.symbol]?.close ?? null) }}
              </span>

              <!-- 漲跌（台股慣例：紅漲綠跌，同 KZoneApp） -->
              <span
                class="text-sm tabular-nums text-right w-24 sm:w-auto"
                :class="
                  (quotes[item.symbol]?.change ?? 0) > 0
                    ? 'text-market-up'
                    : (quotes[item.symbol]?.change ?? 0) < 0
                      ? 'text-market-down'
                      : 'text-fg-secondary'
                "
              >
                <template v-if="quotes[item.symbol]?.change != null">
                  {{ (quotes[item.symbol]!.change! > 0 ? '+' : '') + quotes[item.symbol]!.change!.toFixed(2) }}
                  ({{ quotes[item.symbol]!.changePercent!.toFixed(2) }}%)
                </template>
                <template v-else>—</template>
              </span>

              <!-- 成交量（桌面） -->
              <span class="hidden sm:block text-sm text-fg-secondary tabular-nums text-right">
                {{ formatVolume(quotes[item.symbol]?.volume ?? null) }}
              </span>

              <!-- 操作欄位的佔位（實際按鈕在下方，避免巢狀互動元素） -->
              <span class="hidden sm:block w-28"></span>
            </button>

            <!-- 操作（桌面，hover 或鍵盤聚焦時顯示）：移至其他群組、從這個群組移除 -->
            <div class="hidden sm:flex items-center justify-end gap-1 absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              <select
                :value="''"
                @change="moveStock(item.symbol, $event)"
                :disabled="pendingSymbol === item.symbol || otherGroups.length === 0"
                aria-label="移至其他群組"
                class="text-xs bg-control text-fg-secondary border border-line rounded-md px-1.5 py-1 focus:outline-none focus:border-accent disabled:opacity-40"
              >
                <option value="" disabled>移至…</option>
                <option
                  v-for="g in otherGroups"
                  :key="g.group_no"
                  :value="g.group_no"
                  :disabled="favorites.isInGroup(g.group_no, item.symbol) || favorites.isGroupFull(g.group_no)"
                >
                  {{ g.name }}{{ favorites.isInGroup(g.group_no, item.symbol) ? '（已在）' : favorites.isGroupFull(g.group_no) ? '（已滿）' : '' }}
                </option>
              </select>
              <button
                @click="removeStock(item.symbol)"
                :disabled="pendingSymbol === item.symbol"
                class="p-1 text-fg-subtle hover:text-danger-fg transition-colors disabled:opacity-40"
                aria-label="移除"
                :title="`從${group.name}移除`"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <p v-if="loadingQuotes" class="text-xs text-fg-subtle mt-3 text-center">報價載入中…</p>
        <p class="text-[11px] text-fg-subtle mt-6 text-center">
          報價為日 K 收盤資料，非即時行情；點擊個股可進入 K-Zone 查看完整技術分析
        </p>
      </template>
    </main>

    <WatchlistAddStockModal v-if="showAddModal" @close="showAddModal = false" />
  </div>
</template>
