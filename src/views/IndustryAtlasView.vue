<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import AppHeader from '../components/AppHeader.vue';
import { useTheme } from '../theme/useTheme';
import { trackEvent } from '../lib/analytics';
import { useStockStore } from '../stores/stockStore';

// 產業地圖共用外框：AI 產業地圖、低軌衛星地圖都是 public/ 下的同源靜態頁，以 iframe 載入
const props = defineProps<{
  mapId: string;
  src: string;
  pageTitle: string;
  frameTitle: string;
}>();

const previousTitle = document.title;
onMounted(() => {
  document.title = props.pageTitle;
  // 進站來源：站內上一頁路徑，直接開網址 / 外部連結進來則為 direct
  const back = window.history.state?.back;
  trackEvent('industry_map_view', { map_id: props.mapId, entry_from: typeof back === 'string' ? back : 'direct' });
});
onUnmounted(() => {
  document.title = previousTitle;
  window.removeEventListener('message', onAtlasMessage);
});

// 地圖首次載入自己讀 localStorage，之後切換主題由這裡通知
const { theme } = useTheme();
const frameEl = ref<HTMLIFrameElement | null>(null);
watch(theme, (next) => {
  frameEl.value?.contentWindow?.postMessage({ type: 'kzone:theme', theme: next }, window.location.origin);
});

// 地圖載入後回報 ready → 回傳達比訊號已收錄的股票代碼，地圖據此決定顯示「查看達比訊號」或「許願收錄」
const store = useStockStore();
async function onAtlasMessage(e: MessageEvent) {
  if (e.origin !== window.location.origin || e.data?.type !== 'kzone:atlas-ready') return;
  if (e.source !== frameEl.value?.contentWindow) return;
  if (store.stockList.length === 0) await store.fetchStockList();
  const symbols = store.stockList.map((s) => s.symbol);
  frameEl.value?.contentWindow?.postMessage({ type: 'kzone:stocks', symbols }, window.location.origin);
}
window.addEventListener('message', onAtlasMessage);
</script>

<template>
  <div class="industry-atlas-page">
    <AppHeader />
    <iframe
      :key="props.src"
      ref="frameEl"
      :src="props.src"
      :title="props.frameTitle"
      class="industry-atlas-frame"
    />
  </div>
</template>

<style scoped>
.industry-atlas-page { height: 100dvh; background: var(--ds-bg-brand); padding-top: 56px; }
.industry-atlas-frame { display: block; width: 100%; height: 100%; border: 0; }
</style>
