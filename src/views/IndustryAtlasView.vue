<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import AppHeader from '../components/AppHeader.vue';
const previousTitle = document.title;
onMounted(() => { document.title = 'AI 產業地圖｜達比 K-Zone'; });
onUnmounted(() => { document.title = previousTitle; });
</script>

<template>
  <div class="industry-atlas-page">
    <AppHeader />
    <iframe
      src="/industry-atlas/index.html"
      title="AI 產業地圖：互動晶片拆解、產業鏈與台灣企業"
      class="industry-atlas-frame"
    />
  </div>
</template>

<style scoped>
.industry-atlas-page { height: 100dvh; background: #00000a; padding-top: 56px; }
.industry-atlas-frame { display: block; width: 100%; height: 100%; border: 0; color-scheme: dark; }
</style>
