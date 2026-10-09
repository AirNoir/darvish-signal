// Canvas / klinecharts 無法吃 CSS var，透過這裡把 --ds-* token 解析成實際色值。
// 主題切換時呼叫 refreshPalette()，之後的 themeColor() 會回傳新主題的值。

export type ThemeToken =
  | 'chart-grid'
  | 'chart-axis'
  | 'chart-text'
  | 'chart-crosshair'
  | 'chart-label-bg'
  | 'chart-buy'
  | 'chart-sell'
  | 'chart-marker-border'
  | 'fg-on-brand'
  | 'fg-on-accent'
  | 'accent'
  | 'market-up'
  | 'market-down'
  | 'market-flat'
  | 'series-amber'
  | 'series-blue'
  | 'series-blue-soft'
  | 'series-violet'
  | 'series-purple'
  | 'series-pink'
  | 'series-green'
  | 'series-red';

const cache = new Map<ThemeToken, string>();

export function themeColor(token: ThemeToken): string {
  const hit = cache.get(token);
  if (hit) return hit;
  const value = typeof document === 'undefined'
    ? ''
    : getComputedStyle(document.documentElement).getPropertyValue(`--ds-${token}`).trim();
  cache.set(token, value);
  return value;
}

export function refreshPalette(): void {
  cache.clear();
}
