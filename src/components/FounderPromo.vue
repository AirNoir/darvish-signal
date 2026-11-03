<script setup lang="ts">
// 登入引導裡的創始會員誘因：官方 tag（含「創始會員」文字）加一句話。
// 放在登入 modal、K 線登入牆、我的最愛未登入頁。
// 2026/11/03 12:00 起停止申請（lib/badges.ts 的 FOUNDER_ENROLLMENT_DEADLINE），
// 介面依日期自動隱藏，不需改版。
import FoundingBadge from './FoundingBadge.vue';
import { isFounderEnrollmentOpen } from '../lib/badges';

const enrollmentOpen = isFounderEnrollmentOpen();
</script>

<template>
  <div
    v-if="enrollmentOpen"
    data-founder-promo
    class="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-line bg-raised text-left"
    style="font-family: 'Noto Sans TC', system-ui, sans-serif;"
  >
    <FoundingBadge show-label class="shrink-0" />
    <p class="text-xs text-fg-secondary leading-relaxed">現在加入即成為創始會員，徽章永久保留在你的帳號上<br /><span class="text-warning-fg">申請資格至 2026/11/3 中午 12:00 止</span></p>
  </div>
</template>
