<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import AppHeader from '../components/AppHeader.vue';
import { trackEvent } from '../lib/analytics';

const trackThreadsProfile = () => {
  trackEvent('social_click', { social_platform: 'threads', social_location: 'feed' });
};

// 目前手動列表；之後改成從 /api/threads-latest 拉
const posts = [
  'https://www.threads.com/@scout.darvi/post/DcSbsNWk046',
  'https://www.threads.com/@scout.darvi/post/DcSBc6oE-Ke',
  'https://www.threads.com/@scout.darvi/post/DcQfNhqk3kn',
  'https://www.threads.com/@scout.darvi/post/DcPdOp1E2Bd',
];

// 直接用 /embed/ URL 嵌 iframe，繞過 Threads embed.js（多篇時會 race）。
// 自己接 postMessage 來動態調高度（Threads iframe 會發 resize 訊息）。
const heights = ref<Record<number, number>>({});

const onMessage = (e: MessageEvent) => {
  if (!e.origin.includes('threads.com')) return;
  // Threads iframe 直接送 number（高度 px）
  const data: any = e.data;
  let height: number | undefined;
  if (typeof data === 'number') height = data;
  else if (data && typeof data === 'object') height = data.height ?? data?.data?.height;
  if (typeof height !== 'number' || height <= 0) return;
  const iframes = [...document.querySelectorAll<HTMLIFrameElement>('iframe[data-post-idx]')];
  const idx = iframes.findIndex(f => f.contentWindow === e.source);
  if (idx >= 0) heights.value[idx] = height;
};

onMounted(() => window.addEventListener('message', onMessage));
onBeforeUnmount(() => window.removeEventListener('message', onMessage));
</script>

<template>
  <div class="min-h-screen bg-[#00000a] text-white" style="font-family: 'GuanHei', 'Iansui', sans-serif;">
    <AppHeader />

    <div class="pointer-events-none fixed inset-0 z-40 scanlines opacity-[0.03]"></div>

    <section class="relative pt-24 pb-24 px-6">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style="background: radial-gradient(circle, #7700ff, transparent);"></div>
        <div class="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl" style="background: radial-gradient(circle, #00d4ff, transparent);"></div>
      </div>

      <div class="relative max-w-6xl mx-auto">
        <div class="text-center mb-12">
          <div class="inline-flex items-center gap-3 mb-4">
            <div class="h-px w-12 bg-[#7700ff] opacity-50"></div>
            <span class="text-xs text-[#7700ff] tracking-[0.3em] uppercase">Latest Posts</span>
            <div class="h-px w-12 bg-[#7700ff] opacity-50"></div>
          </div>
          <h1 class="text-3xl md:text-5xl font-bold text-white tracking-wider">最新動態</h1>
          <p class="text-sm text-[#a0b0c0] mt-4 font-noto">
            來自 Threads
            <a
              href="https://www.threads.com/@scout.darvi"
              target="_blank"
              rel="noopener noreferrer"
              @click="trackThreadsProfile"
              class="text-[#7700ff] hover:underline"
            >@scout.darvi</a>
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div
            v-for="(permalink, idx) in posts"
            :key="permalink"
            class="min-w-0 mx-auto w-full"
            style="max-width: 540px;"
          >
            <iframe
              :src="`${permalink}/embed/`"
              :data-post-idx="idx"
              :style="{ height: (heights[idx] ?? 720) + 'px' }"
              class="w-full block rounded-lg bg-white"
              style="border:0; box-shadow: 0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15);"
              scrolling="no"
              allowtransparency="true"
              allowfullscreen
              :loading="idx < 2 ? 'eager' : 'lazy'"
              :title="`Threads post ${idx + 1}`"
            ></iframe>
          </div>
        </div>

        <p class="text-xs text-[#606080] tracking-widest font-noto text-center mt-12">
          // 內容僅為技術指標討論與工具更新，不推播個股買賣訊號、不提供選股建議
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.scanlines {
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 212, 255, 0.03) 2px,
    rgba(0, 212, 255, 0.03) 4px
  );
}

.font-noto {
  font-family: 'Iansui', sans-serif;
}

iframe {
  transition: height 0.3s ease;
}
</style>
