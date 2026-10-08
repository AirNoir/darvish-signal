#!/usr/bin/env node
// 主題 token 守門：npm run lint:theme（build 前自動執行）
//
// 檢查項目
//  1. token 對稱：src/styles/tokens.css 的 dark / light 區塊必須定義同一組 --ds-* token
//  2. 引用存在：任何 var(--ds-xxx) / themeColor('xxx') 都必須是已定義的 token
//  3. 禁止寫死色碼：src/ 底下（tokens.css 除外）不得出現 #hex、rgb()、hsl()、
//     Tailwind 調色盤 class（text-white、bg-gray-800、bg-[#123] …）
//     Vue scoped CSS 不得寫 `:global(...) .x`（會被編譯成只剩 :global 內的 selector）
//  4. 產業地圖（public/industry-atlas/darvish.css）同樣規則，色碼只能出現在其 token 區塊
//
// 真的需要例外時，在同一行加上註解 `theme-ignore`，並說明原因。
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const TOKENS = join(ROOT, 'src/styles/tokens.css');
const ATLAS_CSS = join(ROOT, 'public/industry-atlas/darvish.css');

const errors = [];
const fail = (file, line, msg) => errors.push(`${relative(ROOT, file)}:${line}  ${msg}`);

// ---------- helpers ----------
const blockOf = (css, selectorRe) => {
  const m = css.match(selectorRe);
  if (!m) return null;
  const start = css.indexOf('{', m.index) + 1;
  let depth = 1;
  let i = start;
  while (depth > 0 && i < css.length) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') depth--;
    i++;
  }
  return { body: css.slice(start, i - 1), start: m.index, end: i };
};
const tokenNames = (body, prefix) =>
  new Set([...body.matchAll(new RegExp(`(--${prefix}[a-z0-9-]+)\\s*:`, 'g'))].map((m) => m[1]));

const diffSets = (a, b) => [...a].filter((x) => !b.has(x));

const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(vue|ts|tsx|js|css)$/.test(name)) out.push(p);
  }
  return out;
};

const lineOf = (text, index) => text.slice(0, index).split('\n').length;

// Tailwind 調色盤 / 任意色 class（前面不能接字元或 -，避免誤判 neon-text-cyan 這類自訂 class）
const TW_PALETTE =
  /(?<![\w-])(?:bg|text|border(?:-[trblxy])?|from|via|to|ring|ring-offset|fill|stroke|shadow|outline|divide|placeholder|decoration|accent|caret)-(?:white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-\d{2,3})?(?:\/\d+)?\b/g;
const TW_ARBITRARY_COLOR = /(?<![\w-])[a-z-]+-\[(?:#|rgb|hsl)[^\]]*\]/g;
const RAW_COLOR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(/g;
// 這些不是顏色：SVG id 參照、URL fragment、HTML entity
const RAW_COLOR_FALSE_POSITIVE = /url\(#|href="#|&#/;

function scanText(file, text, { allowRanges = [] } = {}) {
  const lines = text.split('\n');
  let offset = 0;
  lines.forEach((line, idx) => {
    const lineStart = offset;
    offset += line.length + 1;
    if (line.includes('theme-ignore')) return;
    const report = (re, kind) => {
      for (const m of line.matchAll(re)) {
        const abs = lineStart + m.index;
        if (allowRanges.some(([s, e]) => abs >= s && abs < e)) continue;
        if (kind === 'raw' && RAW_COLOR_FALSE_POSITIVE.test(line.slice(Math.max(0, m.index - 6), m.index + 1))) continue;
        fail(file, idx + 1, `${kind === 'raw' ? '寫死色碼' : 'Tailwind 調色盤 class'} "${m[0]}" → 請改用 theme token`);
      }
    };
    report(RAW_COLOR, 'raw');
    // Vue scoped CSS 會把 `:global(A) .b` 編成只剩 `A`，主題覆寫會整個套到 :root（例如整頁 opacity）
    if (/\.vue$/.test(file) && /:global\([^)]*\)\s*[.#\w[]/.test(line)) {
      fail(file, idx + 1, '`:global(...) .x` 在 scoped CSS 會吃掉後半段 selector → 主題覆寫請直接寫 `:root[data-theme=\'light\'] .x`');
    }
    if (/\.(vue|ts|tsx|js)$/.test(file)) {
      report(TW_PALETTE, 'tw');
      report(TW_ARBITRARY_COLOR, 'tw');
    }
  });
}

// ---------- 1. token 對稱 ----------
const tokensCss = readFileSync(TOKENS, 'utf8');
const dark = blockOf(tokensCss, /:root,\s*:root\[data-theme='dark'\]\s*\{/);
const light = blockOf(tokensCss, /:root\[data-theme='light'\]\s*\{/);
if (!dark || !light) {
  fail(TOKENS, 1, '找不到 dark 或 light token 區塊');
} else {
  const darkSet = tokenNames(dark.body, 'ds-');
  const lightSet = tokenNames(light.body, 'ds-');
  for (const t of diffSets(darkSet, lightSet)) fail(TOKENS, lineOf(tokensCss, light.start), `${t} 只有 dark，缺 light 值`);
  for (const t of diffSets(lightSet, darkSet)) fail(TOKENS, lineOf(tokensCss, dark.start), `${t} 只有 light，缺 dark 值`);

  // ---------- 2. 引用存在 ----------
  const defined = new Set([...darkSet, ...lightSet]);
  const files = walk(join(ROOT, 'src'));
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(/var\((--ds-[a-z0-9-]+)/g)) {
      if (!defined.has(m[1])) fail(file, lineOf(text, m.index), `未定義的 token ${m[1]}`);
    }
    for (const m of text.matchAll(/themeColor\('([a-z0-9-]+)'\)/g)) {
      if (!defined.has(`--ds-${m[1]}`)) fail(file, lineOf(text, m.index), `未定義的 token --ds-${m[1]}`);
    }
  }

  // ---------- 3. 禁止寫死色碼 ----------
  for (const file of files) {
    if (file === TOKENS) continue;
    scanText(file, readFileSync(file, 'utf8'));
  }
}

// ---------- 4. 產業地圖 ----------
const atlasCss = readFileSync(ATLAS_CSS, 'utf8');
const atlasDark = blockOf(atlasCss, /:root,\s*:root\[data-theme='dark'\]\s*\{/);
const atlasLight = blockOf(atlasCss, /:root\[data-theme='light'\]\s*\{/);
if (!atlasDark || !atlasLight) {
  fail(ATLAS_CSS, 1, '找不到產業地圖 dark 或 light token 區塊');
} else {
  const d = tokenNames(atlasDark.body, 'at-');
  const l = tokenNames(atlasLight.body, 'at-');
  for (const t of diffSets(d, l)) fail(ATLAS_CSS, lineOf(atlasCss, atlasLight.start), `${t} 只有 dark，缺 light 值`);
  for (const t of diffSets(l, d)) fail(ATLAS_CSS, lineOf(atlasCss, atlasDark.start), `${t} 只有 light，缺 dark 值`);
  const defined = new Set([...d, ...l]);
  for (const m of atlasCss.matchAll(/var\((--at-[a-z0-9-]+)/g)) {
    if (!defined.has(m[1])) fail(ATLAS_CSS, lineOf(atlasCss, m.index), `未定義的 token ${m[1]}`);
  }
  scanText(ATLAS_CSS, atlasCss, {
    allowRanges: [
      [atlasDark.start, atlasDark.end],
      [atlasLight.start, atlasLight.end]
    ]
  });
}

if (errors.length) {
  console.error(`✖ theme check 失敗（${errors.length} 處）\n`);
  for (const e of errors) console.error('  ' + e);
  console.error('\n請改用 src/styles/tokens.css 定義的 token；新增 token 時 dark / light 都要填。');
  process.exit(1);
}
console.log('✔ theme check 通過：所有色彩皆走 token，dark / light 對稱');
