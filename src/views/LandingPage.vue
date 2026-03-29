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
    <section class="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
      <!-- Animated Background with Stock Chart & Baseball Theme -->
      <div class="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#0f0f1a]">
        <!-- Grid Pattern -->
        <div class="absolute inset-0 opacity-[0.03]">
          <div class="absolute inset-0" style="background-image: repeating-linear-gradient(0deg, transparent, transparent 40px, #3b82f6 40px, #3b82f6 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, #3b82f6 40px, #3b82f6 41px);"></div>
        </div>

        <!-- Stock Chart Lines Pattern -->
        <svg class="absolute inset-0 w-full h-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="chart-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <!-- Candlestick 1 -->
              <rect x="20" y="80" width="12" height="40" fill="#26a69a" opacity="0.6"/>
              <line x1="26" y1="60" x2="26" y2="80" stroke="#26a69a" stroke-width="2" opacity="0.6"/>
              <line x1="26" y1="120" x2="26" y2="140" stroke="#26a69a" stroke-width="2" opacity="0.6"/>

              <!-- Candlestick 2 -->
              <rect x="50" y="70" width="12" height="50" fill="#ef5350" opacity="0.6"/>
              <line x1="56" y1="50" x2="56" y2="70" stroke="#ef5350" stroke-width="2" opacity="0.6"/>
              <line x1="56" y1="120" x2="56" y2="150" stroke="#ef5350" stroke-width="2" opacity="0.6"/>

              <!-- Candlestick 3 -->
              <rect x="80" y="90" width="12" height="30" fill="#26a69a" opacity="0.6"/>
              <line x1="86" y1="70" x2="86" y2="90" stroke="#26a69a" stroke-width="2" opacity="0.6"/>
              <line x1="86" y1="120" x2="86" y2="135" stroke="#26a69a" stroke-width="2" opacity="0.6"/>

              <!-- Moving Average Line -->
              <polyline points="10,100 40,85 70,95 100,80 130,90 160,75 190,85"
                        fill="none" stroke="#3b82f6" stroke-width="2" opacity="0.4"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#chart-pattern)"/>
        </svg>

        <!-- Baseball Stitching Pattern -->
        <svg class="absolute top-20 right-20 w-64 h-64 opacity-[0.05]" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" stroke-width="0.5"/>
          <path d="M 30,20 Q 35,25 30,30 Q 25,35 30,40 Q 35,45 30,50" fill="none" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M 70,50 Q 65,55 70,60 Q 75,65 70,70 Q 65,75 70,80" fill="none" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round"/>
        </svg>

        <svg class="absolute bottom-32 left-32 w-48 h-48 opacity-[0.05] transform rotate-45" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" stroke-width="0.5"/>
          <path d="M 35,25 Q 40,30 35,35 Q 30,40 35,45" fill="none" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M 65,55 Q 60,60 65,65 Q 70,70 65,75" fill="none" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round"/>
        </svg>

        <!-- Floating Particles -->
        <div class="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-20 animate-pulse"></div>
        <div class="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-blue-300 rounded-full opacity-30 animate-pulse" style="animation-delay: 0.5s;"></div>
        <div class="absolute bottom-1/4 left-1/3 w-1 h-1 bg-blue-500 rounded-full opacity-25 animate-pulse" style="animation-delay: 1s;"></div>
        <div class="absolute top-2/3 right-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-20 animate-pulse" style="animation-delay: 1.5s;"></div>
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

    <!-- Detailed Features Section -->
    <section class="relative py-32 px-6 bg-gradient-to-b from-transparent via-blue-950/5 to-transparent">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-4xl md:text-5xl font-bold text-center mb-20 text-white">完整功能一覽</h2>

        <div class="space-y-16">
          <!-- Technical Indicators -->
          <div class="flex flex-col md:flex-row gap-8 items-center">
            <div class="flex-1 order-2 md:order-1">
              <div class="inline-block px-4 py-1 bg-blue-500/20 rounded-full text-blue-400 text-sm font-semibold mb-4">技術指標</div>
              <h3 class="text-3xl font-bold mb-4 text-white">多元技術分析工具</h3>
              <p class="text-gray-300 text-lg mb-6">
                提供 MACD、KD、RSI、布林通道等經典技術指標，協助你從多個角度分析市場趨勢。
              </p>
              <ul class="space-y-3 text-gray-400">
                <li class="flex items-start gap-2">
                  <svg class="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                  <span>MA5/MA20 移動平均線，掌握趨勢方向</span>
                </li>
                <li class="flex items-start gap-2">
                  <svg class="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                  <span>MACD 與 KD 動能指標，判斷買賣時機</span>
                </li>
                <li class="flex items-start gap-2">
                  <svg class="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                  <span>RSI 超買超賣指標，避免追高殺低</span>
                </li>
                <li class="flex items-start gap-2">
                  <svg class="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                  <span>布林通道，捕捉價格波動區間</span>
                </li>
              </ul>
            </div>
            <div class="flex-1 order-1 md:order-2">
              <div class="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-3xl p-8 border border-blue-500/20">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                  <div class="text-blue-400 text-sm font-mono">MACD</div>
                </div>
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-3 h-3 rounded-full bg-purple-500"></div>
                  <div class="text-purple-400 text-sm font-mono">KD</div>
                </div>
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div class="text-amber-400 text-sm font-mono">RSI</div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-3 h-3 rounded-full bg-green-500"></div>
                  <div class="text-green-400 text-sm font-mono">Bollinger Bands</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Institutional Data -->
          <div class="flex flex-col md:flex-row gap-8 items-center">
            <div class="flex-1">
              <div class="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-3xl p-8 border border-purple-500/20">
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <span class="text-gray-400">外資買賣超</span>
                    <span class="text-green-400 font-semibold">+12,345 張</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-gray-400">投信買賣超</span>
                    <span class="text-green-400 font-semibold">+1,234 張</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-gray-400">融資餘額</span>
                    <span class="text-red-400 font-semibold">-567 張</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-gray-400">融券餘額</span>
                    <span class="text-blue-400 font-semibold">123 張</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex-1">
              <div class="inline-block px-4 py-1 bg-purple-500/20 rounded-full text-purple-400 text-sm font-semibold mb-4">法人動向</div>
              <h3 class="text-3xl font-bold mb-4 text-white">追蹤大戶籌碼</h3>
              <p class="text-gray-300 text-lg mb-6">
                即時顯示外資、投信買賣超數據，以及融資融券變化，掌握主力動向。
              </p>
              <ul class="space-y-3 text-gray-400">
                <li class="flex items-start gap-2">
                  <svg class="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                  <span>外資與投信買賣超日報表</span>
                </li>
                <li class="flex items-start gap-2">
                  <svg class="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                  <span>外資買賣超移動平均（5/10/15/30日）</span>
                </li>
                <li class="flex items-start gap-2">
                  <svg class="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                  <span>融資融券餘額與變化追蹤</span>
                </li>
                <li class="flex items-start gap-2">
                  <svg class="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                  <span>券資比指標，洞察散戶信心</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Customization -->
          <div class="flex flex-col md:flex-row gap-8 items-center">
            <div class="flex-1 order-2 md:order-1">
              <div class="inline-block px-4 py-1 bg-amber-500/20 rounded-full text-amber-400 text-sm font-semibold mb-4">客製化</div>
              <h3 class="text-3xl font-bold mb-4 text-white">打造專屬看盤介面</h3>
              <p class="text-gray-300 text-lg mb-6">
                最多可同時顯示 6 個指標，自由排序與組合，建立最適合你的交易儀表板。
              </p>
              <ul class="space-y-3 text-gray-400">
                <li class="flex items-start gap-2">
                  <svg class="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                  <span>一鍵切換指標顯示/隱藏</span>
                </li>
                <li class="flex items-start gap-2">
                  <svg class="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                  <span>拖曳調整指標順序，優先顯示重要資訊</span>
                </li>
                <li class="flex items-start gap-2">
                  <svg class="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                  <span>圖表自動縮放，適應不同螢幕尺寸</span>
                </li>
                <li class="flex items-start gap-2">
                  <svg class="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                  <span>跨圖表同步 Tooltip，精準比對數據</span>
                </li>
              </ul>
            </div>
            <div class="flex-1 order-1 md:order-2">
              <div class="bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-3xl p-8 border border-amber-500/20">
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div class="text-xs text-gray-500 mb-1">成交量</div>
                    <div class="text-sm text-white font-semibold">ON</div>
                  </div>
                  <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div class="text-xs text-gray-500 mb-1">外資買賣超</div>
                    <div class="text-sm text-white font-semibold">ON</div>
                  </div>
                  <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div class="text-xs text-gray-500 mb-1">MACD</div>
                    <div class="text-sm text-white font-semibold">ON</div>
                  </div>
                  <div class="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50 opacity-50">
                    <div class="text-xs text-gray-600 mb-1">KD</div>
                    <div class="text-sm text-gray-600 font-semibold">OFF</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Choose Us Section -->
    <section class="relative py-32 px-6">
      <div class="max-w-5xl mx-auto text-center">
        <h2 class="text-4xl md:text-5xl font-bold mb-12 text-white">為什麼選擇達比 K-Zone？</h2>

        <div class="grid md:grid-cols-2 gap-6 mb-12">
          <div class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 text-left">
            <div class="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-3 text-white">即時更新</h3>
            <p class="text-gray-400">每日自動更新股價與法人數據，確保你看到的都是最新資訊</p>
          </div>

          <div class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 text-left">
            <div class="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-3 text-white">資料可信</h3>
            <p class="text-gray-400">數據來源自台灣證券交易所公開資訊，準確度有保障</p>
          </div>

          <div class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 text-left">
            <div class="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-3 text-white">跨平台支援</h3>
            <p class="text-gray-400">支援桌機、平板與手機，隨時隨地掌握市場動態</p>
          </div>

          <div class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 text-left">
            <div class="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-3 text-white">簡潔易用</h3>
            <p class="text-gray-400">專注於重要資訊呈現，不被複雜功能干擾交易判斷</p>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="relative py-32 px-6 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <div class="inline-block p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full mb-6">
            <svg class="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <h2 class="text-4xl md:text-5xl font-bold mb-6 text-white">關於我</h2>
          <p class="text-xl text-gray-300 max-w-2xl mx-auto">
            熱愛棒球與投資的獨立開發者，致力於打造簡潔實用的股市分析工具
          </p>
        </div>

        <div class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl p-10 md:p-12 border border-gray-700/50 shadow-2xl">
          <div class="prose prose-invert max-w-none">
            <p class="text-lg text-gray-300 leading-relaxed mb-6">
              作為一名軟體工程師與長期投資者，我深刻體會到在資訊爆炸的時代，
              投資人需要的不是更多功能，而是<span class="text-blue-400 font-semibold">精準、即時、易讀</span>的關鍵資訊。
            </p>
            <p class="text-lg text-gray-300 leading-relaxed mb-8">
              達比 K-Zone 是我為自己打造的看盤工具，融合了技術分析與法人動向追蹤，
              並以達比修有的精準控球為靈感，希望每位使用者都能在股市中找到屬於自己的「好球帶」。
            </p>

            <div class="border-t border-gray-700 pt-8">
              <h3 class="text-xl font-bold mb-6 text-white flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                </svg>
                追蹤更新與交流
              </h3>
              <div class="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://www.threads.com/@darvishkzone?hl=zh-tw"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-xl transition-all group"
                >
                  <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.781 3.631 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.794-1.005-.645-1.634-1.608-1.816-2.78-.351-2.262.814-4.626 3.068-6.222 1.857-1.316 4.042-1.71 6.133-1.103 1.113.323 2.05.902 2.788 1.722 1.036 1.15 1.567 2.68 1.536 4.43-.023 1.392-.372 2.647-1.038 3.731-.701 1.142-1.685 2.028-2.925 2.635-1.235.605-2.666.908-4.253.902zm-1.095-11.896c-1.394 1.013-2.23 2.56-2.016 3.733.067.368.28.712.602.968.426.341.982.485 1.555.407 1.167-.062 2.017-.51 2.528-1.332.436-.7.645-1.673.624-2.888-.014-.242-.023-.48-.032-.708-.47-.27-.983-.454-1.526-.54-.826-.128-1.636.007-2.735.36zm2.638 1.096c.012.253.024.511.036.778.095 1.006.007 1.807-.272 2.316-.28.509-.75.818-1.393.918-.428.066-.804-.047-1.06-.32-.257-.272-.357-.665-.282-1.106.133-.786.704-1.773 1.612-2.405.682-.475 1.163-.64 1.359-.18z"/>
                    </svg>
                  </div>
                  <div class="flex-1 text-left">
                    <div class="text-sm font-semibold text-white group-hover:text-purple-400 transition-colors">Threads</div>
                    <div class="text-xs text-gray-400">@darvishkzone</div>
                  </div>
                  <svg class="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                </a>

                <a
                  href="https://t.me/darvishsignal"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-500/30 rounded-xl transition-all group"
                >
                  <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                  </div>
                  <div class="flex-1 text-left">
                    <div class="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">Telegram</div>
                    <div class="text-xs text-gray-400">@darvishsignal</div>
                  </div>
                  <svg class="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                </a>

                <a
                  href="https://www.instagram.com/darvishkzone/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-pink-500/20 to-orange-500/20 hover:from-pink-500/30 hover:to-orange-500/30 border border-pink-500/30 rounded-xl transition-all group"
                >
                  <div class="w-8 h-8 bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <div class="flex-1 text-left">
                    <div class="text-sm font-semibold text-white group-hover:text-pink-400 transition-colors">Instagram</div>
                    <div class="text-xs text-gray-400">@darvishkzone</div>
                  </div>
                  <svg class="w-4 h-4 text-gray-500 group-hover:text-pink-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                </a>
              </div>
              <p class="text-sm text-gray-500 mt-4">
                歡迎追蹤，獲取最新功能更新與市場觀點分享
              </p>
            </div>
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
