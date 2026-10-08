# 主題 Token（深色 / 淺色）

全站支援深色（預設）與淺色兩種主題，透過 `<html data-theme="dark|light">` 切換，使用者選擇存在 `localStorage['kzone:theme']`。

## 檔案

| 檔案 | 角色 |
|------|------|
| `src/styles/tokens.css` | **唯一允許寫色碼的地方**：`--ds-*` token 的 dark / light 值 + Tailwind `@theme inline` 映射 |
| `src/theme/useTheme.ts` | 主題狀態、切換、寫回 localStorage、GA `theme_toggle` 事件 |
| `src/theme/palette.ts` | `themeColor('market-up')`：給 canvas / klinecharts 用的 token 解析 |
| `src/components/ThemeToggle.vue` | 切換按鈕（AppHeader、K-Zone header 已放） |
| `index.html` | 首次繪製前套用主題，避免閃爍 |
| `public/industry-atlas/darvish.css` | 產業地圖（iframe）自己的 `--at-*` token，同樣分 dark / light |
| `scripts/check-theme.mjs` | 守門腳本，`npm run build` 前自動執行 |

## 怎麼用

| 情境 | 寫法 |
|------|------|
| Tailwind class | `bg-surface` `text-fg-strong` `border-line` `bg-brand-cyan/10` `text-market-up` |
| `<style>` / inline style | `var(--ds-bg-surface)`；半透明用 `color-mix(in srgb, var(--ds-brand-cyan) 30%, transparent)` |
| Canvas / klinecharts | `themeColor('series-blue')`（主題切換時 `useTheme` 會清快取，圖表 watch `theme` 後 `setStyles`） |

不要寫：`#hex`、`rgb()`、`hsl()`、`text-white`、`bg-gray-800`、`bg-[#1a1a1a]`。

## 新增 token

1. 在 `tokens.css` 的 **dark 與 light 兩個區塊都加**（只加一邊 build 會失敗）
2. 需要 Tailwind class → 在 `@theme inline` 加 `--color-<name>: var(--ds-<name>);`
3. 要給 canvas 用 → 在 `palette.ts` 的 `ThemeToken` 型別加上名稱

## 守門規則（`npm run lint:theme`）

1. dark / light token 集合必須一致
2. `var(--ds-*)`、`themeColor('*')` 引用的 token 必須存在
3. `src/` 底下（`tokens.css` 除外）不得出現寫死色碼或 Tailwind 調色盤 class
4. 產業地圖 `darvish.css` 色碼只能出現在 `--at-*` token 區塊

真的需要例外時，在同一行加 `theme-ignore` 註解並寫原因。
