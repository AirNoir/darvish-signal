<script setup lang="ts">
// 創始會員（FOUNDER）徽章 — V2 官方素材（vector-first，public/badges/founder/）。
// 預設輸出小尺寸皇冠盾牌 icon（SVG，任何螢幕密度都銳利）；
// showLabel 時輸出官方 tag：CSS pill + HTML 原生文字（官方建議，文字交給瀏覽器渲染）。
// 注意：素材包 tag / 完整徽章的「PNG」版本中文字是豆腐框（出圖缺中文字型），web 一律用 SVG。
withDefaults(
  defineProps<{ size?: 16 | 24 | 32; showLabel?: boolean; dark?: boolean }>(),
  { size: 24, showLabel: false, dark: true }
);
</script>

<template>
  <span
    v-if="showLabel"
    class="founder-badge"
    :class="{ 'founder-badge--dark': dark }"
    title="創始會員 — 網站初期加入的首批會員"
  >
    <img src="/badges/founder/icon/founder-icon.svg" alt="" class="founder-badge__icon" />
    <span>創始會員</span>
  </span>
  <img
    v-else
    src="/badges/founder/icon/founder-icon.svg"
    :width="size"
    :height="size"
    alt="創始會員"
    title="創始會員 — 網站初期加入的首批會員"
    class="shrink-0 select-none"
    draggable="false"
  />
</template>

<style scoped>
/* 官方 tag/founder-badge.css 原樣 inline（避免 runtime @import public 路徑） */
.founder-badge{--gold:#D8AB52;--gold-soft:#F3D28B;--dark:#0B2E2A;display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px 0 5px;border:1px solid var(--gold);border-radius:999px;background:#fff4db;color:#19150f;font-size:13px;font-weight:700;line-height:1;white-space:nowrap}
.founder-badge--dark{background:var(--dark);color:var(--gold-soft)}
.founder-badge__icon{width:20px;height:20px;display:block}
@media(max-width:640px){.founder-badge{height:26px;padding-right:8px;font-size:12px;gap:4px}.founder-badge__icon{width:18px;height:18px}}
</style>
