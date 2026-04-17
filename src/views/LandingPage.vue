<script setup lang="ts">
import { useRouter } from 'vue-router';
import AppHeader from '../components/AppHeader.vue';

const router = useRouter();

const enterApp = () => {
  router.push('/app');
};
</script>

<template>
  <div class="min-h-screen bg-[#00000a] text-white overflow-auto" style="font-family: 'GuanHei', 'Noto Sans TC', sans-serif;">
    <AppHeader />

    <!-- Scanline Overlay -->
    <div class="pointer-events-none fixed inset-0 z-50 scanlines opacity-[0.03]"></div>

    <!-- Hero Section -->
    <section class="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden">

      <!-- Background -->
      <div class="absolute inset-0 bg-[#00000a]">
        <!-- Hex Grid -->
        <div class="absolute inset-0 opacity-[0.06] hex-grid"></div>

        <!-- Neon Grid Lines -->
        <div class="absolute inset-0 opacity-[0.04]" style="background-image: repeating-linear-gradient(0deg, transparent, transparent 60px, #00d4ff 60px, #00d4ff 61px), repeating-linear-gradient(90deg, transparent, transparent 60px, #00d4ff 60px, #00d4ff 61px);"></div>

        <!-- Glow Orbs -->
        <div class="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style="background: radial-gradient(circle, #00d4ff, transparent);"></div>
        <div class="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl" style="background: radial-gradient(circle, #ff006e, transparent);"></div>
        <div class="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-8 blur-3xl -translate-x-1/2 -translate-y-1/2" style="background: radial-gradient(circle, #7700ff, transparent);"></div>
      </div>

      <div class="relative z-10 max-w-5xl mx-auto text-center">
        <!-- Logo -->
        <div class="mb-8 flex justify-center">
          <div class="relative">
            <div class="absolute inset-0 rounded-full blur-md opacity-60" style="background: #00d4ff;"></div>
            <img src="/logo.png" alt="達比 K-Zone" class="relative w-24 h-24 rounded-full border-2 neon-border-cyan" />
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
        <p class="text-xl md:text-2xl mb-4 text-[#a0b0c0] font-light tracking-wide">
          如達比修有般精準的<span class="text-[#00d4ff] neon-text-cyan font-semibold">控球</span>，
          捕捉每一個<span class="text-[#ff006e] neon-text-pink font-semibold">投資訊號</span>
        </p>

        <!-- Status Bar -->
        <div class="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-12 text-xs text-[#606080] tracking-widest">
          <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-[#00ff88] inline-block animate-pulse"></span>SIGNAL ACTIVE</span>
          <span>|</span>
          <span>TWSE DATA SYNC</span>
          <span>|</span>
          <span>AI POWERED</span>
        </div>

        <!-- CTA Button -->
        <button
          @click="enterApp"
          class="group relative px-12 py-4 text-xl font-bold tracking-widest uppercase cyber-btn"
        >
          <span class="relative z-10 text-[#00d4ff]">進入 K-Zone</span>
          <span class="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00d4ff]"></span>
          <span class="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00d4ff]"></span>
          <span class="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#00d4ff]"></span>
          <span class="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00d4ff]"></span>
        </button>

        <!-- Scroll Indicator -->
        <div class="mt-20 flex flex-col items-center gap-2 opacity-40">
          <span class="text-xs tracking-widest text-[#00d4ff]">SCROLL</span>
          <div class="w-px h-12 bg-gradient-to-b from-[#00d4ff] to-transparent animate-pulse"></div>
        </div>
      </div>
    </section>

    <!-- Story Section -->
    <section class="relative py-24 px-6">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <div class="inline-flex items-center gap-3 mb-4">
            <div class="h-px w-12 bg-[#00d4ff] opacity-50"></div>
            <span class="text-xs text-[#00d4ff] tracking-[0.3em] uppercase">Origin Story</span>
            <div class="h-px w-12 bg-[#00d4ff] opacity-50"></div>
          </div>
          <h2 class="text-3xl md:text-5xl font-bold text-white tracking-wider">命名由來</h2>
        </div>

        <div class="cyber-card p-10 md:p-12">
          <p class="text-xl md:text-2xl text-[#a0b0c0] leading-relaxed mb-6">
            「<span class="text-[#00d4ff] font-semibold neon-text-cyan">達比</span>」源自於日本職棒傳奇投手
            <span class="text-[#00d4ff] font-semibold neon-text-cyan">達比修有</span>（Yu Darvish）。
          </p>
          <p class="text-xl md:text-2xl text-[#a0b0c0] leading-relaxed">
            如同他在投手丘上的<span class="text-[#ff006e] font-semibold neon-text-pink">精準控球</span>，
            達比 K-Zone 致力於提供<span class="text-[#ff006e] font-semibold neon-text-pink">精準的市場訊號</span>，
            幫助投資者在股市中捕捉每一個關鍵時刻。
          </p>
        </div>
      </div>
    </section>

    <!-- K-Zone Concept Section -->
    <section class="relative py-24 px-6">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-16">
          <div class="inline-flex items-center gap-3 mb-4">
            <div class="h-px w-12 bg-[#ff006e] opacity-50"></div>
            <span class="text-xs text-[#ff006e] tracking-[0.3em] uppercase">System Core</span>
            <div class="h-px w-12 bg-[#ff006e] opacity-50"></div>
          </div>
          <h2 class="text-3xl md:text-5xl font-bold text-white tracking-wider">什麼是 K-Zone？</h2>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <div class="cyber-card-pink p-8 group hover:scale-[1.02] transition-transform">
            <div class="text-xs text-[#ff006e] tracking-widest mb-4 uppercase">Module_01 :: Baseball</div>
            <h3 class="text-2xl font-bold mb-4 text-white">棒球好球帶</h3>
            <p class="text-[#a0b0c0] leading-relaxed">
              在棒球中，K-Zone 代表<span class="text-[#ff006e]">好球帶</span>——
              投手必須精準控球的區域，決定每一球的成敗。
            </p>
          </div>

          <div class="cyber-card p-8 group hover:scale-[1.02] transition-transform">
            <div class="text-xs text-[#00d4ff] tracking-widest mb-4 uppercase">Module_02 :: Market</div>
            <h3 class="text-2xl font-bold mb-4 text-white">股市訊號區</h3>
            <p class="text-[#a0b0c0] leading-relaxed">
              在股市中，K-Zone 是<span class="text-[#00d4ff]">最佳進場時機</span>——
              透過技術指標與法人動向，精準捕捉買賣訊號。
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
            <div class="h-px w-12 bg-[#7700ff] opacity-50"></div>
            <span class="text-xs text-[#7700ff] tracking-[0.3em] uppercase">Core Modules</span>
            <div class="h-px w-12 bg-[#7700ff] opacity-50"></div>
          </div>
          <h2 class="text-3xl md:text-5xl font-bold text-white tracking-wider">核心功能</h2>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          <div class="cyber-card-purple p-8 group hover:scale-[1.02] transition-transform">
            <div class="text-xs text-[#7700ff] tracking-widest mb-4 uppercase">func_01()</div>
            <div class="w-12 h-12 mb-4 border border-[#7700ff]/50 flex items-center justify-center" style="clip-path: polygon(0 0, 100% 0, 100% 75%, 75% 100%, 0 100%);">
              <svg class="w-6 h-6 text-[#7700ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-3 text-white">即時 K 線圖表</h3>
            <p class="text-[#606080]">整合技術指標、成交量與法人動向，一目了然掌握市場脈動</p>
          </div>

          <div class="cyber-card p-8 group hover:scale-[1.02] transition-transform">
            <div class="text-xs text-[#00d4ff] tracking-widest mb-4 uppercase">func_02()</div>
            <div class="w-12 h-12 mb-4 border border-[#00d4ff]/50 flex items-center justify-center" style="clip-path: polygon(0 0, 100% 0, 100% 75%, 75% 100%, 0 100%);">
              <svg class="w-6 h-6 text-[#00d4ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-3 text-white">Alpha 訊號</h3>
            <p class="text-[#606080]">精選強勢股與弱勢股資訊，協助觀察市場趨勢</p>
          </div>

          <div class="cyber-card-pink p-8 group hover:scale-[1.02] transition-transform">
            <div class="text-xs text-[#ff006e] tracking-widest mb-4 uppercase">func_03()</div>
            <div class="w-12 h-12 mb-4 border border-[#ff006e]/50 flex items-center justify-center" style="clip-path: polygon(0 0, 100% 0, 100% 75%, 75% 100%, 0 100%);">
              <svg class="w-6 h-6 text-[#ff006e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-3 text-white">彈性指標</h3>
            <p class="text-[#606080]">自由組合技術指標，打造專屬的看盤介面</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Detailed Features -->
    <section class="relative py-24 px-6">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-20">
          <div class="inline-flex items-center gap-3 mb-4">
            <div class="h-px w-12 bg-[#00d4ff] opacity-50"></div>
            <span class="text-xs text-[#00d4ff] tracking-[0.3em] uppercase">Full Specs</span>
            <div class="h-px w-12 bg-[#00d4ff] opacity-50"></div>
          </div>
          <h2 class="text-3xl md:text-5xl font-bold text-white tracking-wider">完整功能一覽</h2>
        </div>

        <div class="space-y-20">
          <!-- Technical Indicators -->
          <div class="flex flex-col md:flex-row gap-8 items-center">
            <div class="flex-1 order-2 md:order-1">
              <div class="text-xs text-[#00d4ff] tracking-widest mb-2 uppercase">// 技術指標</div>
              <h3 class="text-3xl font-bold mb-4 text-white">多元技術分析工具</h3>
              <p class="text-[#a0b0c0] text-lg mb-6 leading-relaxed">
                提供 MACD、KD、RSI、布林通道等經典技術指標，協助你從多個角度分析市場趨勢。
              </p>
              <ul class="space-y-3">
                <li class="flex items-center gap-3 text-[#a0b0c0]">
                  <span class="text-[#00d4ff] font-bold">›</span>MA5/MA20 移動平均線，掌握趨勢方向
                </li>
                <li class="flex items-center gap-3 text-[#a0b0c0]">
                  <span class="text-[#00d4ff] font-bold">›</span>MACD 與 KD 動能指標，判斷買賣時機
                </li>
                <li class="flex items-center gap-3 text-[#a0b0c0]">
                  <span class="text-[#00d4ff] font-bold">›</span>RSI 超買超賣指標，避免追高殺低
                </li>
                <li class="flex items-center gap-3 text-[#a0b0c0]">
                  <span class="text-[#00d4ff] font-bold">›</span>布林通道，捕捉價格波動區間
                </li>
              </ul>
            </div>
            <div class="flex-1 order-1 md:order-2">
              <div class="cyber-card p-8">
                <div class="text-xs text-[#606080] mb-4 tracking-widest">INDICATOR_STATUS</div>
                <div class="space-y-4">
                  <div class="flex items-center justify-between border-b border-[#00d4ff]/10 pb-3">
                    <span class="text-[#00d4ff] font-mono text-sm">MACD</span>
                    <span class="text-xs text-[#00ff88] tracking-widest">● ACTIVE</span>
                  </div>
                  <div class="flex items-center justify-between border-b border-[#00d4ff]/10 pb-3">
                    <span class="text-[#7700ff] font-mono text-sm">KD</span>
                    <span class="text-xs text-[#00ff88] tracking-widest">● ACTIVE</span>
                  </div>
                  <div class="flex items-center justify-between border-b border-[#00d4ff]/10 pb-3">
                    <span class="text-[#ff006e] font-mono text-sm">RSI</span>
                    <span class="text-xs text-[#00ff88] tracking-widest">● ACTIVE</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-[#00ff88] font-mono text-sm">Bollinger Bands</span>
                    <span class="text-xs text-[#00ff88] tracking-widest">● ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Institutional Data -->
          <div class="flex flex-col md:flex-row gap-8 items-center">
            <div class="flex-1">
              <div class="cyber-card-pink p-8">
                <div class="text-xs text-[#606080] mb-4 tracking-widest">INSTITUTIONAL_FLOW</div>
                <div class="space-y-4">
                  <div class="flex justify-between items-center border-b border-[#ff006e]/10 pb-3">
                    <span class="text-[#606080] text-sm">外資買賣超</span>
                    <span class="text-[#00ff88] font-semibold">+12,345 張</span>
                  </div>
                  <div class="flex justify-between items-center border-b border-[#ff006e]/10 pb-3">
                    <span class="text-[#606080] text-sm">投信買賣超</span>
                    <span class="text-[#00ff88] font-semibold">+1,234 張</span>
                  </div>
                  <div class="flex justify-between items-center border-b border-[#ff006e]/10 pb-3">
                    <span class="text-[#606080] text-sm">融資餘額</span>
                    <span class="text-[#ef5350] font-semibold">-567 張</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-[#606080] text-sm">融券餘額</span>
                    <span class="text-[#00d4ff] font-semibold">123 張</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex-1">
              <div class="text-xs text-[#ff006e] tracking-widest mb-2 uppercase">// 法人動向</div>
              <h3 class="text-3xl font-bold mb-4 text-white">追蹤大戶籌碼</h3>
              <p class="text-[#a0b0c0] text-lg mb-6 leading-relaxed">
                即時顯示外資、投信買賣超數據，以及融資融券變化，掌握主力動向。
              </p>
              <ul class="space-y-3">
                <li class="flex items-center gap-3 text-[#a0b0c0]">
                  <span class="text-[#ff006e] font-bold">›</span>外資與投信買賣超日報表
                </li>
                <li class="flex items-center gap-3 text-[#a0b0c0]">
                  <span class="text-[#ff006e] font-bold">›</span>外資買賣超移動平均（5/10/15/30日）
                </li>
                <li class="flex items-center gap-3 text-[#a0b0c0]">
                  <span class="text-[#ff006e] font-bold">›</span>融資融券餘額與變化追蹤
                </li>
                <li class="flex items-center gap-3 text-[#a0b0c0]">
                  <span class="text-[#ff006e] font-bold">›</span>券資比指標，洞察散戶信心
                </li>
              </ul>
            </div>
          </div>

          <!-- Customization -->
          <div class="flex flex-col md:flex-row gap-8 items-center">
            <div class="flex-1 order-2 md:order-1">
              <div class="text-xs text-[#7700ff] tracking-widest mb-2 uppercase">// 客製化</div>
              <h3 class="text-3xl font-bold mb-4 text-white">打造專屬看盤介面</h3>
              <p class="text-[#a0b0c0] text-lg mb-6 leading-relaxed">
                最多可同時顯示 6 個指標，自由排序與組合，建立最適合你的交易儀表板。
              </p>
              <ul class="space-y-3">
                <li class="flex items-center gap-3 text-[#a0b0c0]">
                  <span class="text-[#7700ff] font-bold">›</span>一鍵切換指標顯示/隱藏
                </li>
                <li class="flex items-center gap-3 text-[#a0b0c0]">
                  <span class="text-[#7700ff] font-bold">›</span>拖曳調整指標順序，優先顯示重要資訊
                </li>
                <li class="flex items-center gap-3 text-[#a0b0c0]">
                  <span class="text-[#7700ff] font-bold">›</span>圖表自動縮放，適應不同螢幕尺寸
                </li>
                <li class="flex items-center gap-3 text-[#a0b0c0]">
                  <span class="text-[#7700ff] font-bold">›</span>跨圖表同步 Tooltip，精準比對數據
                </li>
              </ul>
            </div>
            <div class="flex-1 order-1 md:order-2">
              <div class="cyber-card-purple p-8">
                <div class="text-xs text-[#606080] mb-4 tracking-widest">DASHBOARD_CONFIG</div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="border border-[#7700ff]/30 p-3 bg-[#7700ff]/5">
                    <div class="text-xs text-[#606080] mb-1">成交量</div>
                    <div class="text-sm text-[#00ff88] font-semibold tracking-widest">■ ON</div>
                  </div>
                  <div class="border border-[#7700ff]/30 p-3 bg-[#7700ff]/5">
                    <div class="text-xs text-[#606080] mb-1">外資買賣超</div>
                    <div class="text-sm text-[#00ff88] font-semibold tracking-widest">■ ON</div>
                  </div>
                  <div class="border border-[#7700ff]/30 p-3 bg-[#7700ff]/5">
                    <div class="text-xs text-[#606080] mb-1">MACD</div>
                    <div class="text-sm text-[#00ff88] font-semibold tracking-widest">■ ON</div>
                  </div>
                  <div class="border border-[#333]/50 p-3 bg-[#111]/50 opacity-40">
                    <div class="text-xs text-[#444] mb-1">KD</div>
                    <div class="text-sm text-[#444] font-semibold tracking-widest">□ OFF</div>
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
            <div class="h-px w-12 bg-[#00ff88] opacity-50"></div>
            <span class="text-xs text-[#00ff88] tracking-[0.3em] uppercase">Why K-Zone</span>
            <div class="h-px w-12 bg-[#00ff88] opacity-50"></div>
          </div>
          <h2 class="text-2xl sm:text-3xl md:text-5xl font-bold text-white tracking-wider">為什麼選擇達比 K-Zone？</h2>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <div class="cyber-card p-8">
            <div class="text-xs text-[#00d4ff] tracking-widest mb-4 uppercase">feature.realtime</div>
            <h3 class="text-xl font-bold mb-3 text-white">即時更新</h3>
            <p class="text-[#606080]">每日自動更新股價與法人數據，確保你看到的都是最新資訊</p>
          </div>
          <div class="cyber-card p-8">
            <div class="text-xs text-[#00d4ff] tracking-widest mb-4 uppercase">feature.trusted_data</div>
            <h3 class="text-xl font-bold mb-3 text-white">資料可信</h3>
            <p class="text-[#606080]">數據來源自台灣證券交易所公開資訊，準確度有保障</p>
          </div>
          <div class="cyber-card p-8">
            <div class="text-xs text-[#00d4ff] tracking-widest mb-4 uppercase">feature.cross_platform</div>
            <h3 class="text-xl font-bold mb-3 text-white">跨平台支援</h3>
            <p class="text-[#606080]">支援桌機、平板與手機，隨時隨地掌握市場動態</p>
          </div>
          <div class="cyber-card p-8">
            <div class="text-xs text-[#00d4ff] tracking-widest mb-4 uppercase">feature.clean_ui</div>
            <h3 class="text-xl font-bold mb-3 text-white">簡潔易用</h3>
            <p class="text-[#606080]">專注於重要資訊呈現，不被複雜功能干擾交易判斷</p>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="relative py-24 px-6">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <div class="inline-flex items-center gap-3 mb-4">
            <div class="h-px w-12 bg-[#ff006e] opacity-50"></div>
            <span class="text-xs text-[#ff006e] tracking-[0.3em] uppercase">Developer Log</span>
            <div class="h-px w-12 bg-[#ff006e] opacity-50"></div>
          </div>
          <h2 class="text-3xl md:text-5xl font-bold text-white tracking-wider">關於我</h2>
          <p class="text-lg text-[#a0b0c0] mt-4 max-w-2xl mx-auto">
            熱愛棒球與投資的獨立開發者，致力於打造簡潔實用的股市分析工具
          </p>
        </div>

        <div class="cyber-card-pink p-10 md:p-12">
          <p class="text-lg text-[#a0b0c0] leading-relaxed mb-6">
            作為一名軟體工程師與長期投資者，我深刻體會到在資訊爆炸的時代，
            投資人需要的不是更多功能，而是<span class="text-[#00d4ff] font-semibold">精準、即時、易讀</span>的關鍵資訊。
          </p>
          <p class="text-lg text-[#a0b0c0] leading-relaxed mb-10">
            達比 K-Zone 是我為自己打造的看盤工具，融合了技術分析與法人動向追蹤，
            並以達比修有的精準控球為靈感，希望每位使用者都能在股市中找到屬於自己的「好球帶」。
          </p>

          <div class="border-t border-[#ff006e]/20 pt-8">
            <div class="text-xs text-[#ff006e] tracking-widest mb-6 uppercase">// 追蹤更新與交流</div>
            <div class="flex flex-col sm:flex-row gap-4">
              <a
                href="https://www.threads.com/@darvishkzone?hl=zh-tw"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 px-6 py-3 border border-[#7700ff]/40 bg-[#7700ff]/5 hover:bg-[#7700ff]/15 transition-all group"
              >
                <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.781 3.631 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.794-1.005-.645-1.634-1.608-1.816-2.78-.351-2.262.814-4.626 3.068-6.222 1.857-1.316 4.042-1.71 6.133-1.103 1.113.323 2.05.902 2.788 1.722 1.036 1.15 1.567 2.68 1.536 4.43-.023 1.392-.372 2.647-1.038 3.731-.701 1.142-1.685 2.028-2.925 2.635-1.235.605-2.666.908-4.253.902zm-1.095-11.896c-1.394 1.013-2.23 2.56-2.016 3.733.067.368.28.712.602.968.426.341.982.485 1.555.407 1.167-.062 2.017-.51 2.528-1.332.436-.7.645-1.673.624-2.888-.014-.242-.023-.48-.032-.708-.47-.27-.983-.454-1.526-.54-.826-.128-1.636.007-2.735.36zm2.638 1.096c.012.253.024.511.036.778.095 1.006.007 1.807-.272 2.316-.28.509-.75.818-1.393.918-.428.066-.804-.047-1.06-.32-.257-.272-.357-.665-.282-1.106.133-.786.704-1.773 1.612-2.405.682-.475 1.163-.64 1.359-.18z"/>
                  </svg>
                </div>
                <div class="flex-1 text-left">
                  <div class="text-sm font-semibold text-white group-hover:text-[#7700ff] transition-colors">Threads</div>
                  <div class="text-xs text-[#606080]">@darvishkzone</div>
                </div>
              </a>

              <a
                href="https://t.me/darvishsignal"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 px-6 py-3 border border-[#00d4ff]/40 bg-[#00d4ff]/5 hover:bg-[#00d4ff]/15 transition-all group"
              >
                <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </div>
                <div class="flex-1 text-left">
                  <div class="text-sm font-semibold text-white group-hover:text-[#00d4ff] transition-colors">Telegram</div>
                  <div class="text-xs text-[#606080]">@darvishsignal</div>
                </div>
              </a>
            </div>
            <p class="text-xs text-[#606080] mt-4 tracking-widest">
              // 歡迎追蹤，獲取最新功能更新與市場觀點分享
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="relative py-32 px-6">
      <div class="max-w-4xl mx-auto text-center">
        <!-- Terminal Block -->
        <div class="inline-block text-left mb-12 p-6 border border-[#00d4ff]/20 bg-[#00d4ff]/3 w-full max-w-xl">
          <div class="text-xs text-[#606080] mb-3">terminal ~</div>
          <div class="text-sm text-[#a0b0c0] font-mono">
            <span class="text-[#00d4ff]">$</span> darvish-kzone --start<br/>
            <span class="text-[#00ff88]">✓</span> Market data loaded<br/>
            <span class="text-[#00ff88]">✓</span> Signals initialized<br/>
            <span class="text-[#00ff88]">✓</span> Ready to trade<span class="animate-pulse">_</span>
          </div>
        </div>

        <h2 class="text-2xl sm:text-4xl md:text-5xl font-bold mb-6 text-white tracking-wider">
          準備好進入 K-Zone 了嗎？
        </h2>
        <p class="text-xl text-[#a0b0c0] mb-12 tracking-wide">
          像達比修有一樣，用精準的判斷掌握每一個投資機會
        </p>

        <button
          @click="enterApp"
          class="group relative px-14 py-5 text-xl font-bold tracking-widest uppercase cyber-btn-lg"
        >
          <span class="relative z-10 text-[#00d4ff] flex items-center gap-3">
            立即開始
            <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </span>
          <span class="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00d4ff]"></span>
          <span class="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00d4ff]"></span>
          <span class="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00d4ff]"></span>
          <span class="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00d4ff]"></span>
          <div class="absolute inset-0 bg-[#00d4ff] opacity-0 group-hover:opacity-5 transition-opacity"></div>
        </button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-[#00d4ff]/10 py-8 px-6">
      <div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#606080] tracking-widest">
        <span>© 2025 DARVISH K-ZONE. ALL RIGHTS RESERVED.</span>
        <span>SYS_VERSION :: 2.0.0 | TWSE_SYNC :: DAILY</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Hex Grid */
.hex-grid {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpath d='M28 66L0 50V16L28 0l28 16v34L28 66zm0-2l26-15V18L28 2 2 18v30L28 64z' fill='%2300d4ff'/%3E%3C/svg%3E");
}

/* Scanlines */
.scanlines {
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 212, 255, 0.03) 2px,
    rgba(0, 212, 255, 0.03) 4px
  );
}

/* Neon Glow Text */
.neon-text-cyan {
  text-shadow: 0 0 10px #00d4ff, 0 0 20px #00d4ff40;
}
.neon-text-pink {
  text-shadow: 0 0 10px #ff006e, 0 0 20px #ff006e40;
}

/* Neon Border */
.neon-border-cyan {
  border-color: #00d4ff;
  box-shadow: 0 0 10px #00d4ff60, inset 0 0 10px #00d4ff10;
}

/* Cyber Cards */
.cyber-card {
  background: rgba(0, 212, 255, 0.03);
  border: 1px solid rgba(0, 212, 255, 0.2);
  position: relative;
}
.cyber-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 40px; height: 2px;
  background: #00d4ff;
}
.cyber-card::after {
  content: '';
  position: absolute;
  bottom: 0; right: 0;
  width: 40px; height: 2px;
  background: #00d4ff;
}

.cyber-card-pink {
  background: rgba(255, 0, 110, 0.03);
  border: 1px solid rgba(255, 0, 110, 0.2);
  position: relative;
}
.cyber-card-pink::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 40px; height: 2px;
  background: #ff006e;
}
.cyber-card-pink::after {
  content: '';
  position: absolute;
  bottom: 0; right: 0;
  width: 40px; height: 2px;
  background: #ff006e;
}

.cyber-card-purple {
  background: rgba(119, 0, 255, 0.03);
  border: 1px solid rgba(119, 0, 255, 0.2);
  position: relative;
}
.cyber-card-purple::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 40px; height: 2px;
  background: #7700ff;
}
.cyber-card-purple::after {
  content: '';
  position: absolute;
  bottom: 0; right: 0;
  width: 40px; height: 2px;
  background: #7700ff;
}

/* Cyber Buttons */
.cyber-btn {
  background: transparent;
  border: 1px solid rgba(0, 212, 255, 0.3);
  position: relative;
  transition: all 0.3s;
}
.cyber-btn:hover {
  background: rgba(0, 212, 255, 0.05);
  border-color: rgba(0, 212, 255, 0.8);
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.2), inset 0 0 20px rgba(0, 212, 255, 0.05);
}

.cyber-btn-lg {
  background: transparent;
  border: 1px solid rgba(0, 212, 255, 0.3);
  position: relative;
  transition: all 0.3s;
}
.cyber-btn-lg:hover {
  border-color: rgba(0, 212, 255, 0.8);
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.3), inset 0 0 30px rgba(0, 212, 255, 0.05);
}

/* Glitch Title */
.glitch-text {
  color: #00d4ff;
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
  position: relative;
  animation: glitch 4s infinite;
}

.glitch-text-en {
  color: transparent;
  -webkit-text-stroke: 1px rgba(0, 212, 255, 0.3);
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
  0%, 90%, 100% { transform: translate(0); text-shadow: 0 0 20px rgba(0, 212, 255, 0.5); }
  92% { transform: translate(-2px, 1px); text-shadow: 2px 0 #ff006e, -2px 0 #00d4ff; }
  94% { transform: translate(2px, -1px); text-shadow: -2px 0 #ff006e, 2px 0 #00d4ff; }
  96% { transform: translate(0); }
  98% { transform: translate(1px, 1px); text-shadow: -1px 0 #ff006e, 1px 0 #7700ff; }
}
</style>
