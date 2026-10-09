#!/usr/bin/env node
// build 後壓縮產業地圖的 JS / CSS（dist/<atlas>/），原始碼仍保持可讀，僅部署產物壓縮。
// vendor/（three.js）已是發行版，略過。
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';

const DIST = fileURLToPath(new URL('../dist', import.meta.url));
const atlases = readdirSync(DIST).filter((d) => existsSync(join(DIST, d, 'darvish.css')));

let before = 0;
let after = 0;
for (const atlas of atlases) {
  const dir = join(DIST, atlas);
  for (const name of readdirSync(dir)) {
    const file = join(dir, name);
    if (statSync(file).isDirectory()) continue; // vendor/
    const loader = name.endsWith('.js') ? 'js' : name.endsWith('.css') ? 'css' : null;
    if (!loader) continue;
    const src = readFileSync(file, 'utf8');
    const { code } = await transform(src, { loader, minify: true, legalComments: 'none', charset: 'utf8' });
    writeFileSync(file, code);
    before += src.length;
    after += code.length;
  }
}
console.log(`✔ atlas minify：${atlases.join(', ')}（${(before / 1024).toFixed(0)} KB → ${(after / 1024).toFixed(0)} KB）`);
