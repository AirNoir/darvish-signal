<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const enterApp = () => {
  router.push('/app');
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0f0f0f] text-white overflow-auto">
    <!-- Hero Section -->
    <section class="relative min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute inset-0" style="background-image: repeating-linear-gradient(0deg, transparent, transparent 50px, #3b82f6 50px, #3b82f6 51px), repeating-linear-gradient(90deg, transparent, transparent 50px, #3b82f6 50px, #3b82f6 51px);"></div>
      </div>

      <div class="relative z-10 max-w-5xl mx-auto text-center">
        <!-- Logo -->
        <div class="mb-8 flex justify-center">
          <img src="/logo.png" alt="達比 K-Zone" class="w-24 h-24 rounded-full shadow-2xl border-4 border-blue-500/30" />
        </div>

        <!-- Main Title -->
        <h1 class="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
          達比 K-Zone
        </h1>

        <!-- Tagline -->
        <p class="text-2xl md:text-3xl text-gray-300 mb-12 font-light">
          如達比修有般精準的<span class="text-blue-400 font-semibold">控球</span>，<br class="md:hidden" />
          捕捉每一個<span class="text-blue-400 font-semibold">投資訊號</span>
        </p>

        <!-- CTA Button -->
        <button
          @click="enterApp"
          class="group relative px-12 py-5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xl font-bold rounded-full shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-blue-500/50"
        >
          <span class="relative z-10">進入 K-Zone</span>
          <div class="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
        </button>

        <!-- Scroll Indicator -->
        <div class="mt-20 animate-bounce">
          <svg class="w-6 h-6 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>
    </section>

    <!-- Story Section -->
    <section class="relative py-32 px-6">
      <div class="max-w-4xl mx-auto">
        <!-- Baseball Icon -->
        <div class="text-center mb-12">
          <div class="inline-block p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full">
            <svg class="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke-width="2"></circle>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 0c2.76 0 5 2.24 5 5s-2.24 5-5 5-5-2.24-5-5 2.24-5 5-5z"></path>
            </svg>
          </div>
        </div>

        <h2 class="text-4xl md:text-5xl font-bold text-center mb-8 text-white">命名由來</h2>

        <div class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl p-10 md:p-12 border border-gray-700/50 shadow-2xl">
          <p class="text-xl md:text-2xl text-gray-300 leading-relaxed mb-6">
            「<span class="text-blue-400 font-semibold">達比</span>」源自於日本職棒傳奇投手
            <span class="text-blue-400 font-semibold">達比修有</span>（Yu Darvish）。
          </p>
          <p class="text-xl md:text-2xl text-gray-300 leading-relaxed">
            如同他在投手丘上的<span class="text-blue-400 font-semibold">精準控球</span>，
            達比 K-Zone 致力於提供<span class="text-blue-400 font-semibold">精準的市場訊號</span>，
            幫助投資者在股市中捕捉每一個關鍵時刻。
          </p>
        </div>
      </div>
    </section>

    <!-- K-Zone Concept Section -->
    <section class="relative py-32 px-6 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-4xl md:text-5xl font-bold text-center mb-16 text-white">什麼是 K-Zone？</h2>

        <div class="grid md:grid-cols-2 gap-8">
          <!-- Baseball K-Zone -->
          <div class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50 hover:border-blue-500/50 transition-all">
            <div class="text-blue-400 mb-4">
              <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" stroke-width="2"></rect>
                <circle cx="12" cy="12" r="2" fill="currentColor"></circle>
              </svg>
            </div>
            <h3 class="text-2xl font-bold mb-4 text-white">棒球好球帶</h3>
            <p class="text-gray-300 leading-relaxed">
              在棒球中，K-Zone 代表<span class="text-blue-400">好球帶</span>——
              投手必須精準控球的區域，決定每一球的成敗。
            </p>
          </div>

          <!-- Stock K-Zone -->
          <div class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50 hover:border-blue-500/50 transition-all">
            <div class="text-blue-400 mb-4">
              <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold mb-4 text-white">股市訊號區</h3>
            <p class="text-gray-300 leading-relaxed">
              在股市中，K-Zone 是<span class="text-blue-400">最佳進場時機</span>——
              透過技術指標與法人動向，精準捕捉買賣訊號。
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="relative py-32 px-6">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-4xl md:text-5xl font-bold text-center mb-16 text-white">核心功能</h2>

        <div class="grid md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50 hover:border-blue-500/50 transition-all hover:scale-105">
            <div class="w-16 h-16 mb-6 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-blue-600/30 transition-all">
              <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-3 text-white">即時 K 線圖表</h3>
            <p class="text-gray-400">整合技術指標、成交量與法人動向，一目了然掌握市場脈動</p>
          </div>

          <!-- Feature 2 -->
          <div class="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50 hover:border-blue-500/50 transition-all hover:scale-105">
            <div class="w-16 h-16 mb-6 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-blue-600/30 transition-all">
              <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-3 text-white">Alpha 訊號</h3>
            <p class="text-gray-400">精選強勢股與賣出警示，協助掌握最佳進出場時機</p>
          </div>

          <!-- Feature 3 -->
          <div class="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50 hover:border-blue-500/50 transition-all hover:scale-105">
            <div class="w-16 h-16 mb-6 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-blue-600/30 transition-all">
              <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-3 text-white">彈性指標</h3>
            <p class="text-gray-400">自由組合技術指標，打造專屬的看盤介面</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="relative py-32 px-6">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-4xl md:text-5xl font-bold mb-8 text-white">
          準備好進入 K-Zone 了嗎？
        </h2>
        <p class="text-xl text-gray-300 mb-12">
          像達比修有一樣，用精準的判斷掌握每一個投資機會
        </p>
        <button
          @click="enterApp"
          class="group relative px-12 py-5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xl font-bold rounded-full shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-blue-500/50"
        >
          <span class="relative z-10 flex items-center gap-3">
            立即開始
            <svg class="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </span>
        </button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="relative py-12 px-6 border-t border-gray-800">
      <div class="max-w-6xl mx-auto text-center text-gray-500">
        <p class="mb-4">© 2024 達比 K-Zone. All rights reserved.</p>
        <p class="text-sm">Powered by precision, inspired by excellence.</p>
      </div>
    </footer>
  </div>
</template>
