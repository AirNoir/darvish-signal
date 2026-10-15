<script setup lang="ts">
// /app 側欄的我的最愛快速面板：切群組、點個股直接換圖，管理則導去 /watchlist。
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStockStore } from '../stores/stockStore';
import { useFavoritesStore } from '../stores/favoritesStore';
import { trackEvent } from '../lib/analytics';

const emit = defineEmits<{ stockSelected: [] }>();

const router = useRouter();
const store = useStockStore();
const favorites = useFavoritesStore();
const collapsed = ref(false);

const selectStock = (symbol: string) => {
  trackEvent('watchlist_stock_click', { symbol, source: 'app_panel' });
  store.searchStock(symbol);
  emit('stockSelected');
};
</script>

<template>
  <div class="border-b border-line">
    <!-- Header -->
    <div class="flex items-center justify-between px-3 py-2">
      <button
        @click="collapsed = !collapsed"
        class="flex items-center gap-1.5 text-sm font-semibold text-fg-strong"
        :aria-expanded="!collapsed"
      >
        <svg class="w-3.5 h-3.5 text-series-gold" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
        我的最愛
        <span v-if="favorites.loaded && favorites.activeGroup" class="text-[10px] text-fg-muted font-normal tabular-nums">
          {{ favorites.activeGroup.items.length }}/{{ favorites.maxPerGroup }}
        </span>
        <svg
          :class="['w-3 h-3 text-fg-muted transition-transform', collapsed ? '-rotate-90' : '']"
          fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      <button
        @click="router.push('/watchlist')"
        class="text-xs text-accent hover:text-accent-strong transition-colors"
      >
        管理
      </button>
    </div>

    <template v-if="!collapsed">
      <!-- 群組切換（名稱與數量由後端決定） -->
      <div v-if="favorites.groups.length > 0" class="px-3 pb-2 flex flex-wrap gap-1" role="tablist" aria-label="我的最愛群組">
        <button
          v-for="g in favorites.groups"
          :key="g.group_no"
          role="tab"
          :aria-selected="g.group_no === favorites.activeGroup?.group_no"
          @click="favorites.setActiveGroup(g.group_no)"
          :class="[
            'px-2 py-0.5 rounded-full text-[11px] transition-colors tabular-nums',
            g.group_no === favorites.activeGroup?.group_no
              ? 'bg-accent text-fg-strong'
              : 'bg-control text-fg-secondary hover:bg-control-hover hover:text-fg-strong'
          ]"
        >
          {{ g.name }}<span v-if="g.items.length" class="ml-0.5 opacity-70">{{ g.items.length }}</span>
        </button>
      </div>

      <!-- 目前群組的個股（依加入時間新到舊） -->
      <div v-if="!favorites.activeGroup || favorites.activeGroup.items.length === 0" class="px-3 pb-3 text-xs text-fg-subtle">
        {{ favorites.activeGroup?.name ?? '' }}還沒有個股，<button @click="router.push('/watchlist')" class="text-accent hover:underline">去加入</button>
      </div>
      <div v-else class="pb-2 max-h-44 overflow-y-auto">
        <button
          v-for="item in favorites.activeGroup.items"
          :key="item.symbol"
          @click="selectStock(item.symbol)"
          :class="[
            'w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-hover transition-colors',
            item.symbol === store.stockId ? 'bg-hover' : ''
          ]"
        >
          <span class="text-sm" :class="item.symbol === store.stockId ? 'text-series-gold' : 'text-fg'">
            {{ item.name || item.symbol }}
          </span>
          <span class="text-xs text-fg-subtle font-mono">{{ item.symbol }}</span>
        </button>
      </div>
    </template>
  </div>
</template>
