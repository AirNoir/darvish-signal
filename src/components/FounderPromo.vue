<script setup lang="ts">
// 登入引導裡的創始會員誘因：官方 tag（含「創始會員」文字）加一句話。
// 放在登入 modal、K 線登入牆、我的最愛未登入頁。
// 招募截止時把 lib/badges.ts 的 FOUNDER_ENROLLMENT_OPEN 改成 false，整段就不顯示。
import FoundingBadge from './FoundingBadge.vue';
import { FOUNDER_ENROLLMENT_OPEN } from '../lib/badges';
</script>

<template>
  <div
    v-if="FOUNDER_ENROLLMENT_OPEN"
    data-founder-promo
    class="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-line bg-raised text-left"
    style="font-family: 'Noto Sans TC', system-ui, sans-serif;"
  >
    <FoundingBadge show-label class="shrink-0" />
    <p class="text-xs text-fg-secondary leading-relaxed">現在加入即成為創始會員，徽章永久保留在你的帳號上</p>
  </div>
</template>
