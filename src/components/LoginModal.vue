<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useAuthStore } from '../stores/authStore';

const auth = useAuthStore();
const buttonHost = ref<HTMLDivElement | null>(null);

// modal 打開時才渲染 GIS 官方按鈕（容器要先存在於 DOM）
watch(
  () => auth.showLoginModal,
  async (open) => {
    if (!open) return;
    await nextTick();
    if (buttonHost.value) {
      buttonHost.value.innerHTML = '';
      auth.renderGoogleButton(buttonHost.value);
    }
  },
  { immediate: true }
);
</script>

<template>
  <Teleport to="body">
    <div
      v-if="auth.showLoginModal"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style="font-family: 'GuanHei', 'Iansui', sans-serif;"
    >
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="auth.closeLogin()"></div>

      <div class="relative w-full max-w-sm bg-[#141414] border border-white/10 rounded-2xl p-8 shadow-2xl">
        <button
          @click="auth.closeLogin()"
          class="absolute top-3 right-3 p-1 text-gray-500 hover:text-white transition-colors"
          aria-label="關閉"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div class="flex flex-col items-center text-center gap-4">
          <img src="/logo.png" alt="達比 K-Zone" class="w-14 h-14 rounded-full" />
          <div>
            <h2 class="text-white text-lg font-bold tracking-wide">登入達比 K-Zone</h2>
            <p class="text-gray-400 text-sm mt-1">登入後即可使用「我的自選股」等個人化功能</p>
          </div>

          <div class="min-h-[44px] flex items-center justify-center mt-2">
            <div v-if="auth.isConfigured" ref="buttonHost"></div>
            <p v-else class="text-xs text-amber-400/90 leading-relaxed">
              尚未設定 Google OAuth Client ID<br />
              請在環境變數加入 <code class="text-amber-300">VITE_GOOGLE_CLIENT_ID</code>
            </p>
          </div>

          <p v-if="auth.authError" class="text-xs text-red-400">{{ auth.authError }}</p>

          <p class="text-[11px] text-gray-600 leading-relaxed">
            僅使用 Google 帳號識別身分，不會存取你的其他資料
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>
