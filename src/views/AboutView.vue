<script setup lang="ts">
import AppHeader from '../components/AppHeader.vue';
import { trackEvent } from '../lib/analytics';

const trackSocial = (platform: 'threads' | 'telegram' | 'line') => {
  trackEvent('social_click', { social_platform: platform, social_location: 'about' });
};
</script>

<template>
  <div class="min-h-screen bg-[#00000a] text-white" style="font-family: 'GuanHei', 'Iansui', sans-serif;">
    <AppHeader />

    <div class="pointer-events-none fixed inset-0 z-40 scanlines opacity-[0.03]"></div>

    <section class="relative pt-24 pb-24 px-6">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style="background: radial-gradient(circle, #ff006e, transparent);"></div>
        <div class="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl" style="background: radial-gradient(circle, #00d4ff, transparent);"></div>
      </div>

      <div class="relative max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <div class="inline-flex items-center gap-3 mb-4">
            <div class="h-px w-12 bg-[#ff006e] opacity-50"></div>
            <span class="text-xs text-[#ff006e] tracking-[0.3em] uppercase">Developer Log</span>
            <div class="h-px w-12 bg-[#ff006e] opacity-50"></div>
          </div>
          <h1 class="text-3xl md:text-5xl font-bold text-white tracking-wider">關於我</h1>
          <p class="text-lg text-[#a0b0c0] mt-4 max-w-2xl mx-auto font-noto">
            現職為美商量化交易工程師，熱愛棒球與投資的獨立開發者，致力於打造簡潔實用的股市分析工具
          </p>
        </div>

        <div class="cyber-card-pink p-10 md:p-12">
          <p class="text-lg text-[#a0b0c0] leading-relaxed mb-6 font-noto">
            作為一名量化交易工程師，我希望在資訊爆炸的時代，
            提供一款<span class="text-[#00d4ff] font-semibold">清晰、易讀、可自訂</span>的技術指標視覺化工具。
          </p>
          <p class="text-lg text-[#a0b0c0] leading-relaxed mb-10 font-noto">
            達比 K-Zone 是三五好友為自己打造的圖表工具，將公開市場資料整合於同一介面，
            以達比修有的精準控球為靈感命名。本網站非投顧服務，所有內容均不構成投資建議。
          </p>

          <div class="border-t border-[#ff006e]/20 pt-8">
            <div class="text-xs text-[#ff006e] tracking-widest mb-6 uppercase">// 追蹤更新與交流</div>
            <div class="grid sm:grid-cols-3 gap-4">
              <a
                href="https://www.threads.com/@darvishkzone?hl=zh-tw"
                target="_blank"
                rel="noopener noreferrer"
                @click="trackSocial('threads')"
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
                @click="trackSocial('telegram')"
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

              <a
                href="https://line.me/ti/g2/CSMMkMLIFxMCmtTrAltPuL0b4OZQUF7w4q5rfw?utm_source=invitation&utm_medium=link_copy&utm_campaign=default"
                target="_blank"
                rel="noopener noreferrer"
                @click="trackSocial('line')"
                class="flex items-center gap-3 px-6 py-3 border border-[#06C755]/40 bg-[#06C755]/5 hover:bg-[#06C755]/15 transition-all group"
              >
                <div class="w-8 h-8 bg-[#06C755] flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                  </svg>
                </div>
                <div class="flex-1 text-left">
                  <div class="text-sm font-semibold text-white group-hover:text-[#06C755] transition-colors">LINE 社群</div>
                  <div class="text-xs text-[#606080]">達比 K-Zone 台股工具交流群</div>
                </div>
              </a>
            </div>

            <div class="mt-6 flex flex-col sm:flex-row items-center gap-5 p-5 border border-[#06C755]/30 bg-[#06C755]/[0.04]">
              <div class="flex-shrink-0 p-2 bg-white">
                <img src="/images/line-qr.png" alt="LINE 社群 QR Code" class="w-32 h-32 block" />
              </div>
              <div class="text-center sm:text-left">
                <div class="text-xs text-[#06C755] tracking-widest mb-2 uppercase">// scan to join</div>
                <h4 class="text-base font-semibold text-white mb-1 font-noto">掃描加入 LINE 社群</h4>
                <p class="text-xs text-[#a0b0c0] leading-relaxed font-noto">
                  手機開啟 LINE 掃描左側 QR Code，或在電腦版直接點上方「LINE 社群」連結加入。
                </p>
              </div>
            </div>

            <p class="text-xs text-[#606080] mt-4 tracking-widest font-noto">
              // 此頻道僅做技術指標教學與工具更新公告，不推播個股買賣訊號、不提供選股建議
            </p>
          </div>
        </div>
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
</style>
