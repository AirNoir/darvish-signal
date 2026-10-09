<script setup lang="ts">
// 產業地圖（AI 晶片 / 無人機 / 機器人）共用容器：依 route meta.sector 載入對應的靜態地圖頁。
import { onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import AppHeader from '../components/AppHeader.vue';

const route = useRoute();

const PAGES = {
  ai: {
    src: '/industry-atlas/index.html',
    title: 'AI 產業地圖｜達比 K-Zone',
    label: 'AI 產業地圖：互動晶片拆解、產業鏈與台灣企業'
  },
  drone: {
    src: '/industry-atlas/drone.html',
    title: '無人機產業地圖｜達比 K-Zone',
    label: '無人機產業地圖：產業鏈拆解與台灣企業'
  },
  robot: {
    src: '/industry-atlas/robot.html',
    title: '機器人產業地圖｜達比 K-Zone',
    label: '機器人產業地圖：產業鏈拆解與台灣企業'
  }
} as const;

const page = computed(() => PAGES[(route.meta.sector as keyof typeof PAGES) ?? 'ai']);

const previousTitle = document.title;
watch(page, (p) => { document.title = p.title; });
onMounted(() => { document.title = page.value.title; });
onUnmounted(() => { document.title = previousTitle; });
</script>

<template>
  <div class="industry-atlas-page">
    <AppHeader />
    <iframe
      :src="page.src"
      :title="page.label"
      class="industry-atlas-frame"
    />
  </div>
</template>

<style scoped>
.industry-atlas-page { height: 100dvh; background: #00000a; padding-top: 56px; }
.industry-atlas-frame { display: block; width: 100%; height: 100%; border: 0; color-scheme: dark; }
</style>
