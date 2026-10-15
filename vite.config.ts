import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    proxy: {
      // 本機 origin 不在 TWStockAPI 的 CORS 允許清單，由 dev server 代轉（會原樣轉發 Authorization）。
      // 指向 staging：本機登入拿到的是 staging AccountService 的 token，不能跨環境打正式機。
      '/api': {
        target: 'https://twstockapi-staging.up.railway.app',
        changeOrigin: true,
      },
    },
  },
})
