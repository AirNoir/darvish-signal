<script setup lang="ts">
import { useRouter } from 'vue-router';
import AppHeader from '../components/AppHeader.vue';
import { trackEvent } from '../lib/analytics';

const router = useRouter();

const enterApp = (location: 'hero' | 'footer') => {
  trackEvent('cta_click', { cta_id: 'enter_kzone', cta_location: location });
  router.push('/app');
};

const trackSocial = (platform: 'threads' | 'telegram' | 'line') => {
  trackEvent('social_click', { social_platform: platform, social_location: 'hero' });
};
</script>

<template>
  <div class="min-h-screen bg-brand-bg text-fg-strong overflow-auto" style="font-family: 'GuanHei', 'Iansui', sans-serif;">
    <AppHeader />

    <!-- Scanline Overlay -->
    <div class="pointer-events-none fixed inset-0 z-50 scanlines opacity-[0.03]"></div>

    <!-- Hero Section -->
    <section class="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden">

      <!-- Background -->
      <div class="absolute inset-0 bg-brand-bg">
        <!-- Hex Grid -->
        <div class="absolute inset-0 opacity-[0.06] hex-grid"></div>

        <!-- Neon Grid Lines -->
        <div class="absolute inset-0 opacity-[0.04]" style="background-image: repeating-linear-gradient(0deg, transparent, transparent 60px, var(--ds-brand-cyan) 60px, var(--ds-brand-cyan) 61px), repeating-linear-gradient(90deg, transparent, transparent 60px, var(--ds-brand-cyan) 60px, var(--ds-brand-cyan) 61px);"></div>

        <!-- Glow Orbs -->
        <div class="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style="background: radial-gradient(circle, var(--ds-brand-cyan), transparent);"></div>
        <div class="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl" style="background: radial-gradient(circle, var(--ds-brand-pink), transparent);"></div>
        <div class="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-8 blur-3xl -translate-x-1/2 -translate-y-1/2" style="background: radial-gradient(circle, var(--ds-brand-purple), transparent);"></div>
      </div>

      <div class="relative z-10 max-w-5xl mx-auto text-center">
        <!-- Logo -->
        <div class="mb-8 flex justify-center">
          <div class="relative">
            <div class="absolute inset-0 rounded-full blur-md opacity-60 logo-glow" style="background: var(--ds-brand-cyan);"></div>
            <img src="/logo.png" alt="達比 K-Zone" class="relative w-24 h-24 rounded-full border-2 logo-neon-edge" />
          </div>
        </div>

        <!-- Main Title with Glitch -->
        <h1 class="text-5xl sm:text-6xl md:text-8xl font-bold mb-2 glitch-text" data-text="達比 K-Zone">
          達比 K-Zone
        </h1>
        <h1 class="text-5xl sm:text-6xl md:text-8xl font-bold mb-6 glitch-text-en" data-text="DARVISH K-ZONE">
          DARVISH K-ZONE
        </h1>

        <!-- Tagline -->
        <p class="text-xl md:text-2xl mb-4 text-fg-brand-body font-light tracking-wide font-noto">
          如達比修有般精準的<span class="text-brand-cyan neon-glow-cyan font-semibold">控球</span><span class="hidden md:inline">，</span><br class="md:hidden" />
          清晰呈現每一個<span class="text-brand-pink neon-glow-pink font-semibold">技術指標</span>
        </p>

        <!-- Notice Bar -->
        <p class="mb-6 text-xs text-fg-brand-muted tracking-widest font-noto">
          ※ 本網站為技術指標視覺化工具，所有內容均非投資建議
        </p>

        <!-- Status Bar -->
        <div class="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-12 text-xs text-fg-brand-muted tracking-widest">
          <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-brand-green inline-block animate-pulse"></span>CHART READY</span>
          <span>|</span>
          <span>TWSE PUBLIC DATA</span>
          <span>|</span>
          <span>VISUALIZATION TOOL</span>
        </div>

        <!-- CTA Button -->
        <button
          @click="enterApp('hero')"
          class="group relative px-12 py-4 text-xl font-bold tracking-widest uppercase cyber-btn"
        >
          <span class="relative z-10 text-brand-cyan">進入 K-Zone</span>
          <span class="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-brand-cyan"></span>
          <span class="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-brand-cyan"></span>
          <span class="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-brand-cyan"></span>
          <span class="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-brand-cyan"></span>
        </button>

        <!-- Social Quick Links (visible in first viewport) -->
        <div class="mt-10">
          <div class="flex items-center justify-center gap-3 mb-4 opacity-70">
            <div class="h-px w-8 bg-brand-cyan/40"></div>
            <span class="text-[10px] sm:text-xs text-brand-cyan tracking-[0.3em] uppercase">Follow & Join</span>
            <div class="h-px w-8 bg-brand-cyan/40"></div>
          </div>
          <div class="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://www.threads.com/@scout.darvi?hl=zh-tw"
              target="_blank"
              rel="noopener noreferrer"
              @click="trackSocial('threads')"
              class="flex items-center gap-2 px-4 py-2 border border-brand-purple/40 bg-brand-purple/5 hover:bg-brand-purple/15 hover:border-brand-purple/70 transition-all group"
            >
              <svg class="w-4 h-4 text-brand-purple-fg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.781 3.631 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.794-1.005-.645-1.634-1.608-1.816-2.78-.351-2.262.814-4.626 3.068-6.222 1.857-1.316 4.042-1.71 6.133-1.103 1.113.323 2.05.902 2.788 1.722 1.036 1.15 1.567 2.68 1.536 4.43-.023 1.392-.372 2.647-1.038 3.731-.701 1.142-1.685 2.028-2.925 2.635-1.235.605-2.666.908-4.253.902zm-1.095-11.896c-1.394 1.013-2.23 2.56-2.016 3.733.067.368.28.712.602.968.426.341.982.485 1.555.407 1.167-.062 2.017-.51 2.528-1.332.436-.7.645-1.673.624-2.888-.014-.242-.023-.48-.032-.708-.47-.27-.983-.454-1.526-.54-.826-.128-1.636.007-2.735.36zm2.638 1.096c.012.253.024.511.036.778.095 1.006.007 1.807-.272 2.316-.28.509-.75.818-1.393.918-.428.066-.804-.047-1.06-.32-.257-.272-.357-.665-.282-1.106.133-.786.704-1.773 1.612-2.405.682-.475 1.163-.64 1.359-.18z"/>
              </svg>
              <span class="text-xs sm:text-sm text-fg-strong group-hover:text-brand-purple-fg transition-colors tracking-wide">Threads</span>
            </a>

            <a
              href="https://t.me/darvishsignal"
              target="_blank"
              rel="noopener noreferrer"
              @click="trackSocial('telegram')"
              class="flex items-center gap-2 px-4 py-2 border border-brand-cyan/40 bg-brand-cyan/5 hover:bg-brand-cyan/15 hover:border-brand-cyan/70 transition-all group"
            >
              <svg class="w-4 h-4 text-brand-cyan" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              <span class="text-xs sm:text-sm text-fg-strong group-hover:text-brand-cyan transition-colors tracking-wide">Telegram</span>
            </a>

            <a
              href="https://line.me/ti/g2/CSMMkMLIFxMCmtTrAltPuL0b4OZQUF7w4q5rfw?utm_source=invitation&utm_medium=link_copy&utm_campaign=default"
              target="_blank"
              rel="noopener noreferrer"
              @click="trackSocial('line')"
              class="flex items-center gap-2 px-4 py-2 border border-brand-line/40 bg-brand-line/5 hover:bg-brand-line/15 hover:border-brand-line/70 transition-all group"
            >
              <svg class="w-4 h-4 text-brand-line" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
              <span class="text-xs sm:text-sm text-fg-strong group-hover:text-brand-line transition-colors tracking-wide">LINE 社群</span>
            </a>
          </div>
        </div>

        <!-- Scroll Indicator -->
        <div class="mt-10 flex flex-col items-center gap-2 opacity-40">
          <span class="text-xs tracking-widest text-brand-cyan">SCROLL</span>
          <div class="w-px h-12 bg-gradient-to-b from-brand-cyan to-transparent animate-pulse"></div>
        </div>
      </div>
    </section>

    <!-- Story Section -->
    <section class="relative py-24 px-6">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <div class="inline-flex items-center gap-3 mb-4">
            <div class="h-px w-12 bg-brand-cyan opacity-50"></div>
            <span class="text-xs text-brand-cyan tracking-[0.3em] uppercase">Origin Story</span>
            <div class="h-px w-12 bg-brand-cyan opacity-50"></div>
          </div>
          <h2 class="text-3xl md:text-5xl font-bold text-fg-strong tracking-wider">命名由來</h2>
        </div>

        <div class="cyber-card p-10 md:p-12">
          <p class="text-xl md:text-2xl text-fg-brand-body leading-relaxed mb-6">
            「<span class="text-brand-cyan font-semibold neon-glow-cyan">達比</span>」源自於日本職棒傳奇投手
            <span class="text-brand-cyan font-semibold neon-glow-cyan">達比修有</span>（Yu Darvish）。
          </p>
          <p class="text-xl md:text-2xl text-fg-brand-body leading-relaxed font-noto">
            如同他在投手丘上的<span class="text-brand-pink font-semibold neon-glow-pink">精準控球</span>，
            達比 K-Zone 致力於將<span class="text-brand-pink font-semibold neon-glow-pink">公開市場資料</span>
            以清晰、可自訂的圖表方式呈現，協助使用者建立屬於自己的觀察介面。
          </p>
        </div>
      </div>
    </section>

    <!-- K-Zone Concept Section -->
    <section class="relative py-24 px-6">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-16">
          <div class="inline-flex items-center gap-3 mb-4">
            <div class="h-px w-12 bg-brand-pink opacity-50"></div>
            <span class="text-xs text-brand-pink tracking-[0.3em] uppercase">System Core</span>
            <div class="h-px w-12 bg-brand-pink opacity-50"></div>
          </div>
          <h2 class="text-3xl md:text-5xl font-bold text-fg-strong tracking-wider">什麼是 K-Zone？</h2>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <div class="cyber-card-pink p-8 group hover:scale-[1.02] transition-transform">
            <div class="text-xs text-brand-pink tracking-widest mb-4 uppercase">Module_01 :: Baseball</div>
            <h3 class="text-2xl font-bold mb-4 text-fg-strong">棒球好球帶</h3>
            <p class="text-fg-brand-body leading-relaxed font-noto">
              在棒球中，K-Zone 代表<span class="text-brand-pink">好球帶</span>——
              投手必須精準控球的區域，決定每一球的成敗。
            </p>
          </div>

          <div class="cyber-card p-8 group hover:scale-[1.02] transition-transform">
            <div class="text-xs text-brand-cyan tracking-widest mb-4 uppercase">Module_02 :: Charting</div>
            <h3 class="text-2xl font-bold mb-4 text-fg-strong">技術圖表區</h3>
            <p class="text-fg-brand-body leading-relaxed font-noto">
              在股市中，K-Zone 是<span class="text-brand-cyan">資料聚合的觀察區</span>——
              將技術指標與公開籌碼資料整合於同一畫面，僅供參考、非投資建議。
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="relative py-24 px-6">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <div class="inline-flex items-center gap-3 mb-4">
            <div class="h-px w-12 bg-brand-purple opacity-50"></div>
            <span class="text-xs text-brand-purple tracking-[0.3em] uppercase">Core Modules</span>
            <div class="h-px w-12 bg-brand-purple opacity-50"></div>
          </div>
          <h2 class="text-3xl md:text-5xl font-bold text-fg-strong tracking-wider">核心功能</h2>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          <div class="cyber-card-purple p-8 group hover:scale-[1.02] transition-transform">
            <div class="text-xs text-brand-purple tracking-widest mb-4 uppercase">func_01()</div>
            <div class="w-12 h-12 mb-4 border border-brand-purple/50 flex items-center justify-center" style="clip-path: polygon(0 0, 100% 0, 100% 75%, 75% 100%, 0 100%);">
              <svg class="w-6 h-6 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-3 text-fg-strong">K 線圖表呈現</h3>
            <p class="text-fg-brand-muted">技術指標、成交量與公開籌碼資料以圖表方式呈現於同一畫面</p>
          </div>

          <div class="cyber-card p-8 group hover:scale-[1.02] transition-transform">
            <div class="text-xs text-brand-cyan tracking-widest mb-4 uppercase">func_02()</div>
            <div class="w-12 h-12 mb-4 border border-brand-cyan/50 flex items-center justify-center" style="clip-path: polygon(0 0, 100% 0, 100% 75%, 75% 100%, 0 100%);">
              <svg class="w-6 h-6 text-brand-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-3 text-fg-strong">技術條件清單</h3>
            <p class="text-fg-brand-muted">依預設技術指標規則對個股做條件比對的視覺化結果，非選股推薦</p>
          </div>

          <div class="cyber-card-pink p-8 group hover:scale-[1.02] transition-transform">
            <div class="text-xs text-brand-pink tracking-widest mb-4 uppercase">func_03()</div>
            <div class="w-12 h-12 mb-4 border border-brand-pink/50 flex items-center justify-center" style="clip-path: polygon(0 0, 100% 0, 100% 75%, 75% 100%, 0 100%);">
              <svg class="w-6 h-6 text-brand-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-3 text-fg-strong">彈性指標</h3>
            <p class="text-fg-brand-muted">自由組合技術指標，打造專屬的看盤介面</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Detailed Features -->
    <section class="relative py-24 px-6">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-20">
          <div class="inline-flex items-center gap-3 mb-4">
            <div class="h-px w-12 bg-brand-cyan opacity-50"></div>
            <span class="text-xs text-brand-cyan tracking-[0.3em] uppercase">Full Specs</span>
            <div class="h-px w-12 bg-brand-cyan opacity-50"></div>
          </div>
          <h2 class="text-3xl md:text-5xl font-bold text-fg-strong tracking-wider">完整功能一覽</h2>
        </div>

        <div class="space-y-20">
          <!-- Technical Indicators -->
          <div class="flex flex-col md:flex-row gap-8 items-center">
            <div class="flex-1 order-2 md:order-1">
              <div class="text-xs text-brand-cyan tracking-widest mb-2 uppercase">// 技術指標</div>
              <h3 class="text-3xl font-bold mb-4 text-fg-strong">多元技術分析工具</h3>
              <p class="text-fg-brand-body text-lg mb-6 leading-relaxed font-noto">
                提供 MACD、KD、RSI、布林通道等經典技術指標，協助你從多個角度分析市場趨勢。
              </p>
              <ul class="space-y-3">
                <li class="flex items-center gap-3 text-fg-brand-body font-noto">
                  <span class="text-brand-cyan font-bold">›</span>MA5/MA20 移動平均線，掌握趨勢方向
                </li>
                <li class="flex items-center gap-3 text-fg-brand-body font-noto">
                  <span class="text-brand-cyan font-bold">›</span>MACD 與 KD 動能指標，判斷買賣時機
                </li>
                <li class="flex items-center gap-3 text-fg-brand-body font-noto">
                  <span class="text-brand-cyan font-bold">›</span>RSI 超買超賣指標，避免追高殺低
                </li>
                <li class="flex items-center gap-3 text-fg-brand-body font-noto">
                  <span class="text-brand-cyan font-bold">›</span>布林通道，捕捉價格波動區間
                </li>
              </ul>
            </div>
            <div class="flex-1 order-1 md:order-2">
              <div class="cyber-card p-8">
                <div class="text-xs text-fg-brand-muted mb-4 tracking-widest">INDICATOR_STATUS</div>
                <div class="space-y-4">
                  <div class="flex items-center justify-between border-b border-brand-cyan/10 pb-3">
                    <span class="text-brand-cyan font-mono text-sm">MACD</span>
                    <span class="text-xs text-brand-green tracking-widest">● ACTIVE</span>
                  </div>
                  <div class="flex items-center justify-between border-b border-brand-cyan/10 pb-3">
                    <span class="text-brand-purple font-mono text-sm">KD</span>
                    <span class="text-xs text-brand-green tracking-widest">● ACTIVE</span>
                  </div>
                  <div class="flex items-center justify-between border-b border-brand-cyan/10 pb-3">
                    <span class="text-brand-pink font-mono text-sm">RSI</span>
                    <span class="text-xs text-brand-green tracking-widest">● ACTIVE</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-brand-green font-mono text-sm">Bollinger Bands</span>
                    <span class="text-xs text-brand-green tracking-widest">● ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Institutional Data -->
          <div class="flex flex-col md:flex-row gap-8 items-center">
            <div class="flex-1">
              <div class="cyber-card-pink p-8">
                <div class="text-xs text-fg-brand-muted mb-4 tracking-widest">INSTITUTIONAL_FLOW</div>
                <div class="space-y-4">
                  <div class="flex justify-between items-center border-b border-brand-pink/10 pb-3">
                    <span class="text-fg-brand-muted text-sm">外資買賣超</span>
                    <span class="text-brand-green font-semibold">+12,345 張</span>
                  </div>
                  <div class="flex justify-between items-center border-b border-brand-pink/10 pb-3">
                    <span class="text-fg-brand-muted text-sm">投信買賣超</span>
                    <span class="text-brand-green font-semibold">+1,234 張</span>
                  </div>
                  <div class="flex justify-between items-center border-b border-brand-pink/10 pb-3">
                    <span class="text-fg-brand-muted text-sm">融資餘額</span>
                    <span class="text-market-up font-semibold">-567 張</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-fg-brand-muted text-sm">融券餘額</span>
                    <span class="text-brand-cyan font-semibold">123 張</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex-1">
              <div class="text-xs text-brand-pink tracking-widest mb-2 uppercase">// 公開籌碼資料</div>
              <h3 class="text-3xl font-bold mb-4 text-fg-strong">籌碼資料圖表化</h3>
              <p class="text-fg-brand-body text-lg mb-6 leading-relaxed font-noto">
                將 TWSE 公開的外資、投信買賣超與融資融券資料以圖表方式呈現，僅做資料視覺化，不做任何解讀或建議。
              </p>
              <ul class="space-y-3">
                <li class="flex items-center gap-3 text-fg-brand-body font-noto">
                  <span class="text-brand-pink font-bold">›</span>外資與投信買賣超日資料圖表
                </li>
                <li class="flex items-center gap-3 text-fg-brand-body font-noto">
                  <span class="text-brand-pink font-bold">›</span>外資買賣超移動平均（5/10/15/30日）
                </li>
                <li class="flex items-center gap-3 text-fg-brand-body font-noto">
                  <span class="text-brand-pink font-bold">›</span>融資融券餘額與變化呈現
                </li>
                <li class="flex items-center gap-3 text-fg-brand-body font-noto">
                  <span class="text-brand-pink font-bold">›</span>券資比資料圖表
                </li>
              </ul>
            </div>
          </div>

          <!-- Customization -->
          <div class="flex flex-col md:flex-row gap-8 items-center">
            <div class="flex-1 order-2 md:order-1">
              <div class="text-xs text-brand-purple tracking-widest mb-2 uppercase">// 客製化</div>
              <h3 class="text-3xl font-bold mb-4 text-fg-strong">打造專屬看盤介面</h3>
              <p class="text-fg-brand-body text-lg mb-6 leading-relaxed font-noto">
                最多可同時顯示 6 個指標，自由排序與組合，建立最適合你的交易儀表板。
              </p>
              <ul class="space-y-3">
                <li class="flex items-center gap-3 text-fg-brand-body font-noto">
                  <span class="text-brand-purple font-bold">›</span>一鍵切換指標顯示/隱藏
                </li>
                <li class="flex items-center gap-3 text-fg-brand-body font-noto">
                  <span class="text-brand-purple font-bold">›</span>拖曳調整指標順序，優先顯示重要資訊
                </li>
                <li class="flex items-center gap-3 text-fg-brand-body font-noto">
                  <span class="text-brand-purple font-bold">›</span>圖表自動縮放，適應不同螢幕尺寸
                </li>
                <li class="flex items-center gap-3 text-fg-brand-body font-noto">
                  <span class="text-brand-purple font-bold">›</span>跨圖表同步 Tooltip，精準比對數據
                </li>
              </ul>
            </div>
            <div class="flex-1 order-1 md:order-2">
              <div class="cyber-card-purple p-8">
                <div class="text-xs text-fg-brand-muted mb-4 tracking-widest">DASHBOARD_CONFIG</div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="border border-brand-purple/30 p-3 bg-brand-purple/5">
                    <div class="text-xs text-fg-brand-muted mb-1">成交量</div>
                    <div class="text-sm text-brand-green font-semibold tracking-widest">■ ON</div>
                  </div>
                  <div class="border border-brand-purple/30 p-3 bg-brand-purple/5">
                    <div class="text-xs text-fg-brand-muted mb-1">外資買賣超</div>
                    <div class="text-sm text-brand-green font-semibold tracking-widest">■ ON</div>
                  </div>
                  <div class="border border-brand-purple/30 p-3 bg-brand-purple/5">
                    <div class="text-xs text-fg-brand-muted mb-1">MACD</div>
                    <div class="text-sm text-brand-green font-semibold tracking-widest">■ ON</div>
                  </div>
                  <div class="border border-line/50 p-3 bg-canvas/50 opacity-40">
                    <div class="text-xs text-fg-subtle mb-1">KD</div>
                    <div class="text-sm text-fg-subtle font-semibold tracking-widest">□ OFF</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Choose Us -->
    <section class="relative py-24 px-6">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-16">
          <div class="inline-flex items-center gap-3 mb-4">
            <div class="h-px w-12 bg-brand-green opacity-50"></div>
            <span class="text-xs text-brand-green tracking-[0.3em] uppercase">Why K-Zone</span>
            <div class="h-px w-12 bg-brand-green opacity-50"></div>
          </div>
          <h2 class="text-2xl sm:text-3xl md:text-5xl font-bold text-fg-strong tracking-wider">為什麼選擇達比 K-Zone？</h2>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <div class="cyber-card p-8">
            <div class="text-xs text-brand-cyan tracking-widest mb-4 uppercase">feature.realtime</div>
            <h3 class="text-xl font-bold mb-3 text-fg-strong">即時更新</h3>
            <p class="text-fg-brand-muted font-noto">每日自動更新股價與法人數據，確保你看到的都是最新資訊</p>
          </div>
          <div class="cyber-card p-8">
            <div class="text-xs text-brand-cyan tracking-widest mb-4 uppercase">feature.trusted_data</div>
            <h3 class="text-xl font-bold mb-3 text-fg-strong">資料可信</h3>
            <p class="text-fg-brand-muted font-noto">數據來源自台灣證券交易所公開資訊，準確度有保障</p>
          </div>
          <div class="cyber-card p-8">
            <div class="text-xs text-brand-cyan tracking-widest mb-4 uppercase">feature.cross_platform</div>
            <h3 class="text-xl font-bold mb-3 text-fg-strong">跨平台支援</h3>
            <p class="text-fg-brand-muted font-noto">支援桌機、平板與手機，隨時隨地掌握市場動態</p>
          </div>
          <div class="cyber-card p-8">
            <div class="text-xs text-brand-cyan tracking-widest mb-4 uppercase">feature.clean_ui</div>
            <h3 class="text-xl font-bold mb-3 text-fg-strong">簡潔易用</h3>
            <p class="text-fg-brand-muted font-noto">專注於重要資訊呈現，不被複雜功能干擾交易判斷</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="relative py-32 px-6">
      <div class="max-w-4xl mx-auto text-center">
        <!-- Terminal Block -->
<h2 class="text-2xl sm:text-4xl md:text-5xl font-bold mb-6 text-fg-strong tracking-wider font-noto">
          準備好進入 K-Zone 了嗎？
        </h2>
        <p class="text-xl text-fg-brand-body mb-4 tracking-wide font-noto">
          以客觀的技術指標與公開資料，建立屬於你的觀察介面
        </p>
        <p class="text-xs text-fg-brand-muted mb-12 tracking-widest font-noto">
          ※ 本網站為技術指標視覺化工具，所有內容均非投資建議
        </p>

        <button
          @click="enterApp('footer')"
          class="group relative px-14 py-5 text-xl font-bold tracking-widest uppercase cyber-btn-lg"
        >
          <span class="relative z-10 text-brand-cyan flex items-center gap-3">
            立即開始
            <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </span>
          <span class="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-brand-cyan"></span>
          <span class="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-brand-cyan"></span>
          <span class="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-brand-cyan"></span>
          <span class="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-brand-cyan"></span>
          <div class="absolute inset-0 bg-brand-cyan opacity-0 group-hover:opacity-5 transition-opacity"></div>
        </button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-brand-cyan/10 pt-8 pb-10 px-6">
      <div class="max-w-6xl mx-auto space-y-6">
        <!-- Legal Notice -->
        <div class="border border-warning/20 bg-warning/[0.03] p-5">
          <div class="text-sm text-warning-fg tracking-widest mb-3 uppercase">// 投資警語 INVESTMENT NOTICE</div>
          <p class="text-base text-fg leading-relaxed font-noto mb-3">
            <strong class="text-warning-fg">本網站為技術指標視覺化工具，並非證券投資顧問業務。</strong>
            網站之 K 線圖、技術指標、條件清單、回測模擬等內容，均屬公開資料的圖表化呈現，
            <strong class="text-warning-fg">不構成個股推介、選股建議或任何投資意見</strong>，
            亦非《證券投資信託及顧問法》第 4 條所定義之分析意見或推介建議。
          </p>
          <p class="text-sm text-fg-brand-body leading-relaxed font-noto">
            投資有風險，過去績效不代表未來表現。任何投資決策請使用者依自身判斷與風險承受能力為之，
            必要時請諮詢領有合格證照之專業投顧人員。本網站對使用者依本網站資訊交易產生之任何損失，不負任何法律責任。
          </p>
        </div>
        <!-- Data Source -->
        <div class="border border-brand-cyan/10 bg-brand-cyan/[0.02] p-5">
          <div class="text-sm text-fg-strong tracking-widest mb-3 uppercase">// 資料來源 DATA SOURCE</div>
          <p class="text-base text-fg-brand-body leading-relaxed font-noto">
            本網站圖表資料來源為臺灣證券交易所（TWSE）、櫃買中心（GTSM）等公開資訊。
            使用者須遵守 TWSE《交易資訊使用管理辦法》等相關規定，
            所有資訊以主管機關公告為主。本網站不保證資料之即時性、完整性與正確性，
            如因傳輸延遲或中斷造成之任何損失，本網站不負任何責任。
          </p>
        </div>
        <!-- Bottom Bar -->
        <div class="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-fg-subtle tracking-widest">
          <span>© 2025 DARVISH K-ZONE. ALL RIGHTS RESERVED.</span>
          <span>VISUALIZATION TOOL :: NOT INVESTMENT ADVICE</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Hex Grid（以 mask 繪製，顏色跟隨 theme token） */
.hex-grid {
  background-color: var(--ds-brand-cyan);
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpath d='M28 66L0 50V16L28 0l28 16v34L28 66zm0-2l26-15V18L28 2 2 18v30L28 64z' fill='black'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpath d='M28 66L0 50V16L28 0l28 16v34L28 66zm0-2l26-15V18L28 2 2 18v30L28 64z' fill='black'/%3E%3C/svg%3E");
}

/* Noto Sans TC override for elements containing 準 */
.font-noto {
  font-family: 'Iansui', sans-serif;
}

/* Scanlines */
.scanlines {
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    color-mix(in srgb, var(--ds-brand-cyan) 3%, transparent) 2px,
    color-mix(in srgb, var(--ds-brand-cyan) 3%, transparent) 4px
  );
}

/* Neon Glow Text */
.neon-glow-cyan {
  text-shadow:
    0 0 10px var(--ds-brand-cyan),
    0 0 20px color-mix(in srgb, var(--ds-brand-cyan) 25%, transparent);
}
.neon-glow-pink {
  text-shadow:
    0 0 10px var(--ds-brand-pink),
    0 0 20px color-mix(in srgb, var(--ds-brand-pink) 25%, transparent);
}

/* Neon Border */
.logo-neon-edge {
  border-color: var(--ds-brand-cyan);
  box-shadow:
    0 0 10px color-mix(in srgb, var(--ds-brand-cyan) 38%, transparent),
    inset 0 0 10px color-mix(in srgb, var(--ds-brand-cyan) 6%, transparent);
}

/* Cyber Cards */
.cyber-card,
.cyber-card-pink,
.cyber-card-purple {
  --card-accent: var(--ds-brand-cyan);
  background: color-mix(in srgb, var(--card-accent) 3%, transparent);
  border: 1px solid color-mix(in srgb, var(--card-accent) 20%, transparent);
  position: relative;
}
.cyber-card-pink {
  --card-accent: var(--ds-brand-pink);
}
.cyber-card-purple {
  --card-accent: var(--ds-brand-purple);
}
.cyber-card::before,
.cyber-card-pink::before,
.cyber-card-purple::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 40px; height: 2px;
  background: var(--card-accent);
}
.cyber-card::after,
.cyber-card-pink::after,
.cyber-card-purple::after {
  content: '';
  position: absolute;
  bottom: 0; right: 0;
  width: 40px; height: 2px;
  background: var(--card-accent);
}

/* Cyber Buttons */
.cyber-btn {
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--ds-brand-cyan) 30%, transparent);
  position: relative;
  transition: all 0.3s;
}
.cyber-btn:hover {
  background: color-mix(in srgb, var(--ds-brand-cyan) 5%, transparent);
  border-color: color-mix(in srgb, var(--ds-brand-cyan) 80%, transparent);
  box-shadow:
    0 0 20px color-mix(in srgb, var(--ds-brand-cyan) 20%, transparent),
    inset 0 0 20px color-mix(in srgb, var(--ds-brand-cyan) 5%, transparent);
}

.cyber-btn-lg {
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--ds-brand-cyan) 30%, transparent);
  position: relative;
  transition: all 0.3s;
}
.cyber-btn-lg:hover {
  border-color: color-mix(in srgb, var(--ds-brand-cyan) 80%, transparent);
  box-shadow:
    0 0 30px color-mix(in srgb, var(--ds-brand-cyan) 30%, transparent),
    inset 0 0 30px color-mix(in srgb, var(--ds-brand-cyan) 5%, transparent);
}

/* Glitch Title */
.glitch-text {
  --glitch-glow: color-mix(in srgb, var(--ds-brand-cyan) 50%, transparent);
  color: var(--ds-brand-cyan);
  text-shadow: 0 0 20px var(--glitch-glow);
  position: relative;
  animation: glitch 4s infinite;
}

.glitch-text-en {
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in srgb, var(--ds-brand-cyan) 30%, transparent);
  font-size: 1.1rem;
  letter-spacing: 0.25em;
  position: relative;
}

@media (min-width: 640px) {
  .glitch-text-en {
    font-size: 2rem;
    letter-spacing: 0.5em;
  }
}

@keyframes glitch {
  0%, 90%, 100% { transform: translate(0); text-shadow: 0 0 20px var(--glitch-glow); }
  92% { transform: translate(-2px, 1px); text-shadow: 2px 0 var(--ds-brand-pink), -2px 0 var(--ds-brand-cyan); }
  94% { transform: translate(2px, -1px); text-shadow: -2px 0 var(--ds-brand-pink), 2px 0 var(--ds-brand-cyan); }
  96% { transform: translate(0); }
  98% { transform: translate(1px, 1px); text-shadow: -1px 0 var(--ds-brand-pink), 1px 0 var(--ds-brand-purple); }
}

/* Light theme：霓虹光暈在淺底上收斂，避免文字糊掉 */
:root[data-theme='light'] .neon-glow-cyan {
  text-shadow: 0 0 8px color-mix(in srgb, var(--ds-brand-cyan) 18%, transparent);
}
:root[data-theme='light'] .neon-glow-pink {
  text-shadow: 0 0 8px color-mix(in srgb, var(--ds-brand-pink) 18%, transparent);
}
:root[data-theme='light'] .logo-neon-edge {
  box-shadow: 0 0 8px color-mix(in srgb, var(--ds-brand-cyan) 20%, transparent);
}
:root[data-theme='light'] .logo-glow {
  opacity: 0.25;
}
:root[data-theme='light'] .glitch-text {
  --glitch-glow: color-mix(in srgb, var(--ds-brand-cyan) 15%, transparent);
}
:root[data-theme='light'] .glitch-text-en {
  -webkit-text-stroke-color: color-mix(in srgb, var(--ds-brand-cyan) 45%, transparent);
}
:root[data-theme='light'] .cyber-card,
:root[data-theme='light'] .cyber-card-pink,
:root[data-theme='light'] .cyber-card-purple {
  background: color-mix(in srgb, var(--card-accent) 4%, var(--ds-bg-brand-panel));
  border-color: color-mix(in srgb, var(--card-accent) 25%, transparent);
}
:root[data-theme='light'] .cyber-btn:hover {
  box-shadow: 0 0 12px color-mix(in srgb, var(--ds-brand-cyan) 15%, transparent);
}
:root[data-theme='light'] .cyber-btn-lg:hover {
  box-shadow: 0 0 16px color-mix(in srgb, var(--ds-brand-cyan) 18%, transparent);
}
</style>
