import { readonly, ref } from 'vue';
import { trackEvent } from '../lib/analytics';
import { refreshPalette } from './palette';

export type Theme = 'dark' | 'light';

// 與 index.html 的 pre-paint script、public/industry-atlas/index.html 共用同一個 key
export const THEME_STORAGE_KEY = 'kzone:theme';
export const DEFAULT_THEME: Theme = 'dark';

const isTheme = (v: unknown): v is Theme => v === 'dark' || v === 'light';

const readInitialTheme = (): Theme => {
  if (typeof document === 'undefined') return DEFAULT_THEME;
  // index.html 已在首次繪製前設定 data-theme，這裡以它為準
  const attr = document.documentElement.dataset.theme;
  return isTheme(attr) ? attr : DEFAULT_THEME;
};

const theme = ref<Theme>(readInitialTheme());

const applyTheme = (next: Theme) => {
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    /* 無痕模式 / 配額滿時忽略 */
  }
};

export function useTheme() {
  const setTheme = (next: Theme) => {
    if (next === theme.value) return;
    applyTheme(next);
    // 先換 data-theme、清 canvas 色票快取，再觸發 watcher，圖表重畫時才會拿到新色
    refreshPalette();
    theme.value = next;
  };

  const toggleTheme = (source: string) => {
    const next: Theme = theme.value === 'dark' ? 'light' : 'dark';
    setTheme(next);
    trackEvent('theme_toggle', { theme: next, source });
  };

  return { theme: readonly(theme), setTheme, toggleTheme };
}
