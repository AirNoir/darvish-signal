<script setup lang="ts">
// 第一次以創始會員身分登入時的歡迎畫面：放完整六角徽章（素材包 badge/founder-badge.svg，含「創始會員 FOUNDER」文字）。
// 一個帳號只出現一次，用 localStorage 記錄；掛在 App.vue，任何頁面登入後都會出現。
// 身分來源：auth.user.is_og_member（重整時先用 localStorage 的使用者，validate() 再向後端確認）。
import { ref, watch } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { isOgMember, founderWelcomeSeenKey } from '../lib/badges';
import { trackEvent } from '../lib/analytics';

const auth = useAuthStore();
const show = ref(false);

const hasSeen = (email: string): boolean => {
  try {
    return localStorage.getItem(founderWelcomeSeenKey(email)) === '1';
  } catch {
    return true; // localStorage 不可用時寧可不打擾
  }
};
const markSeen = (email: string) => {
  try {
    localStorage.setItem(founderWelcomeSeenKey(email), '1');
  } catch {
    /* 無痕模式 / 配額滿時忽略 */
  }
};

// 登入、重整還原、換帳號都會經過這裡；非創始會員一律 null
watch(
  () => (isOgMember(auth.user) ? (auth.user?.email ?? null) : null),
  (email) => {
    if (!email || hasSeen(email)) return;
    show.value = true;
    trackEvent('founder_welcome_view');
  },
  { immediate: true }
);

const close = () => {
  const email = auth.user?.email;
  if (email) markSeen(email);
  show.value = false;
};
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-[110] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="founder-welcome-title"
      style="font-family: 'Noto Sans TC', system-ui, sans-serif;"
    >
      <div class="absolute inset-0 bg-scrim backdrop-blur-sm" @click="close"></div>

      <div class="relative w-full max-w-sm bg-surface border border-line rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center gap-4">
        <img
          src="/badges/founder/badge/founder-badge.svg"
          alt="創始會員徽章"
          width="160"
          height="160"
          class="founder-welcome__badge select-none"
          draggable="false"
        />
        <div>
          <h2 id="founder-welcome-title" class="text-fg-strong text-lg font-bold tracking-wide">感謝你成為創始會員</h2>
          <p class="text-fg-secondary text-sm mt-2 leading-relaxed">
            你是達比 K-Zone 初期加入的首批會員，這個徽章會永久保留在你的帳號上，點開頭像隨時看得到。
          </p>
        </div>
        <button
          @click="close"
          class="mt-2 px-6 py-2 rounded-lg bg-accent hover:bg-accent-hover text-fg-on-accent text-sm font-medium transition-colors shadow-lg shadow-accent/20"
        >
          太好了
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* 徽章彈出 + 金色柔光（顏色走 token，不寫死色碼） */
@keyframes founder-pop {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.founder-welcome__badge {
  animation: founder-pop 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  filter: drop-shadow(0 0 28px color-mix(in srgb, var(--color-brand-gold) 45%, transparent));
}
@media (prefers-reduced-motion: reduce) {
  .founder-welcome__badge {
    animation: none;
  }
}
</style>
