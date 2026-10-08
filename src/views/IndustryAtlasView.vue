<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import AppHeader from '../components/AppHeader.vue';
import { useTheme } from '../theme/useTheme';
import { trackEvent } from '../lib/analytics';
const previousTitle = document.title;
onMounted(() => {
  document.title = 'AI 產業地圖｜達比 K-Zone';
  // 進站來源：站內上一頁路徑，直接開網址 / 外部連結進來則為 direct
  const back = window.history.state?.back;
  trackEvent('industry_map_view', { entry_from: typeof back === 'string' ? back : 'direct' });
});
onUnmounted(() => { document.title = previousTitle; });

// 產業地圖是同源 iframe：首次載入自己讀 localStorage，之後切換主題由這裡通知
const { theme } = useTheme();
const frameEl = ref<HTMLIFrameElement | null>(null);
watch(theme, (next) => {
  frameEl.value?.contentWindow?.postMessage({ type: 'kzone:theme', theme: next }, window.location.origin);
});
</script>

<template>
  <div class="industry-atlas-page">
    <AppHeader />
    <iframe
      ref="frameEl"
      src="/industry-atlas/index.html"
      title="AI 產業地圖：互動晶片拆解、產業鏈與台灣企業"
      class="industry-atlas-frame"
    />
  </div>
</template>

<style scoped>
.industry-atlas-page { height: 100dvh; background: var(--ds-bg-brand); padding-top: 56px; }
.industry-atlas-frame { display: block; width: 100%; height: 100%; border: 0; }
</style>
