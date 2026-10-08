# AI 產業地圖

Self-contained, same-origin interactive viewer for the Vue route `/industry-map`.
The shared AppHeader owns navigation; the route lazily loads an iframe using bundled
local assets, not the former hosted Site. Removing the route destroys the browsing
context, including WebGL render loops and document-level event listeners. This keeps
the viewer's legacy global CSS/DOM handlers isolated from existing Vue pages.

- `index.html`, `app.js`: chip exploration and company profiles.
- `chain.js`, `industries.js`: 16 industry categories across four models.
- `model.js`, `industry-model.js`: Three.js interactive technical diagrams.
- `companies.js`: 60 Taiwan companies plus two foreign HBM manufacturers.
- `style.css`: viewer layout; `darvish.css`: local fonts and Darvish dark theme.
- `vendor/`: Three.js r170 and OrbitControls, MIT licensed.

## Geometry and scale

The fabrication model is a facility cutaway containing equipment rows, overhead
transport rails and utilities below the floor. Materials, processed wafers and the
die floorplan are separate enlarged specimens; they do not share one physical scale.
IC design is represented by compute/cache/interconnect regions on a die, not a
monitor. These are explanatory industry diagrams, not replicas or proof of supply
relationships. All original company codes and role mappings are preserved.

Primary references:
- TSMC fab interiors: https://pr.tsmc.com/chinese/gallery-fabs-inside
- Intel fab hierarchy: https://virtualmuseum.intel.com/fabtour/building-layout-contruction.html
- TI fab floor / utilities: https://www.ti.com/about-ti/manufacturing.html
- NVIDIA die layout: https://developer.nvidia.com/blog/nvidia-hopper-architecture-in-depth/
- Remaining model references are linked in each category and chip-layer panel.

Company basic information is a 2026-10-06 snapshot from TWSE t187ap03_L and
MOPS t187ap03_O, with legal incorporation distinguished from brand history.
This page contains no live pricing or recommendation engine.

## Release scope and validation

Created from main c1719c56bbcd29ffe26860f19746a41ae64a2d80.
No develop commits or configuration were merged. Existing Worker, API proxy,
K-Zone features and production deployment configuration are unchanged.

Run `npm run build` for TypeScript and production bundling. Browser checks cover
home navigation, direct route, return navigation, WebGL models, company dialogs,
search, and mobile menu / immediate stock dialog at 390px.

## 低軌衛星產業地圖（/leo-map）

`public/leo-atlas/` 由本地圖複製後改寫，Vue 端共用 `IndustryAtlasView.vue`（router props 指定 `mapId` / `src`），
Three.js 共用 `public/industry-atlas/vendor/`。

- `layers.js`：衛星六層（`window.LEO_LAYERS`），公司以股票代碼對應
- `model.js`：分層展開的平板式低軌通訊衛星；`industry-model.js`：16 個構件、四組 lab
- `industries.js`：16 環節（可選 `note` 欄位顯示於構件說明下方）
- `companies.js`：30 家台股企業 ＋ 5 家國際業者（`taiwan:false`），基本資料為 2026-10-08
  TWSE t187ap03_L / MOPS t187ap03_O 快照；部分企業角色仍屬開發或專案階段，已於內容中註明
- GA：兩張地圖共用 `analytics.js`，事件帶 `map_id`（ai / leo）
