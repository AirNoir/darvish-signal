<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import AppHeader from '../components/AppHeader.vue';
import { trackEvent } from '../lib/analytics';

const trackThreadsProfile = () => {
  trackEvent('social_click', { social_platform: 'threads', social_location: 'feed' });
};

// 目前手動列表（@airnoir0605 達比幫手）；之後改成從 /api/threads-latest 拉
// 排序：置頂文第一篇，其餘主文依發文時間新→舊，共 20 篇（不含回覆串）。更新日期 2026-10-15
const PROFILE = 'https://www.threads.com/@airnoir0605';
const pinnedCodes = ['DdBIhmWD3BP']; // 歡迎來到達比幫手（2026-09-08）
const latestCodes = [
  'DeenbKyD2SQ', // 2026-10-14 達比日報
  'DecLvAzDyAp', // 2026-10-13 達比快報：欣興楊梅廠工安意外
  'DecC9HgD-f2', // 2026-10-13 達比日報
  'DeZc9dFjz5u', // 2026-10-12 達比日報
  'DeYVvPUDwGP', // 2026-10-12 大立光短空長多
  'DeYHzY-D2vd', // 2026-10-12 鴻海、廣達、台達電專利官司
  'DePLR18j5VD', // 2026-10-08 大立光法說會
  'DeN7ZX8kSVe', // 2026-10-08 低軌衛星產業地圖
  'DeMkWqZD_ML', // 2026-10-07 達比日報
  'DeMAwZAkYfI', // 2026-10-07 AI 產業地圖
  'DeKAZFzj-jM', // 2026-10-06 達比日報
  'DeHc2z1j1Vq', // 2026-10-05 洋基工程 6691
  'DeG7Y8Mj5nW', // 2026-10-05 台股創新高 49712
  'DeGr9jPD_oc', // 2026-10-05 帆宣 6196
  'DeGkkhaD5bS', // 2026-10-05 盤後閒聊：國巨 2327
  'DeCYjdbj_9H', // 2026-10-03 台積電 × Terafab
  'Dd_8k1CD50K', // 2026-10-02 達比日報
  'Dd-cfuNj-8x', // 2026-10-02 南茂 8150
  'Dd-a4T7D8Do', // 2026-10-02 晶系列
];
const posts = [
  ...pinnedCodes.map(code => ({ permalink: `${PROFILE}/post/${code}`, pinned: true })),
  ...latestCodes.map(code => ({ permalink: `${PROFILE}/post/${code}`, pinned: false })),
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
  <div class="min-h-screen bg-brand-bg text-fg-strong" style="font-family: 'GuanHei', 'Iansui', sans-serif;">
    <AppHeader />

    <div class="pointer-events-none fixed inset-0 z-40 scanlines opacity-[0.03]"></div>

    <section class="relative pt-24 pb-24 px-6">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style="background: radial-gradient(circle, var(--ds-brand-purple), transparent);"></div>
        <div class="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl" style="background: radial-gradient(circle, var(--ds-brand-cyan), transparent);"></div>
      </div>

      <div class="relative max-w-6xl mx-auto">
        <div class="text-center mb-12">
          <div class="inline-flex items-center gap-3 mb-4">
            <div class="h-px w-12 bg-brand-purple opacity-50"></div>
            <span class="text-xs text-brand-purple tracking-[0.3em] uppercase">Latest Posts</span>
            <div class="h-px w-12 bg-brand-purple opacity-50"></div>
          </div>
          <h1 class="text-3xl md:text-5xl font-bold text-fg-strong tracking-wider">最新動態</h1>
          <p class="text-sm text-fg-brand-body mt-4 font-noto">
            來自 Threads
            <a
              href="https://www.threads.com/@airnoir0605"
              target="_blank"
              rel="noopener noreferrer"
              @click="trackThreadsProfile"
              class="text-brand-purple hover:underline"
            >@airnoir0605</a>
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div
            v-for="(post, idx) in posts"
            :key="post.permalink"
            class="relative min-w-0 mx-auto w-full"
            style="max-width: 540px;"
          >
            <span
              v-if="post.pinned"
              class="absolute -top-3 left-3 z-10 px-2.5 py-0.5 rounded-full border border-line bg-raised text-xs text-fg-secondary tracking-widest font-noto"
              data-pinned-label
            >📌 置頂</span>
            <iframe
              :src="`${post.permalink}/embed/`"
              :data-post-idx="idx"
              :style="{ height: (heights[idx] ?? 720) + 'px' }"
              class="w-full block rounded-lg bg-media"
              style="border:0; box-shadow: 0 0 1px 0 var(--ds-bg-scrim), 0 1px 10px 0 color-mix(in srgb, var(--ds-bg-scrim) 30%, transparent);"
              scrolling="no"
              allowtransparency="true"
              allowfullscreen
              :loading="idx < 2 ? 'eager' : 'lazy'"
              :title="`Threads post ${idx + 1}`"
            ></iframe>
          </div>
        </div>

        <p class="text-xs text-fg-brand-muted tracking-widest font-noto text-center mt-12">
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
    color-mix(in srgb, var(--ds-brand-cyan) 3%, transparent) 2px,
    color-mix(in srgb, var(--ds-brand-cyan) 3%, transparent) 4px
  );
}

.font-noto {
  font-family: 'Iansui', sans-serif;
}

iframe {
  transition: height 0.3s ease;
}
</style>
