const profiles = window.COMPANY_PROFILES;
// 衛星六層資料在 layers.js（window.LEO_LAYERS）；公司以股票代碼對應 companies.js
const layers = window.LEO_LAYERS;
const refs = layers.map((l) => l.refs || []);

let selected = 0;
const layerHost = document.querySelector("#layers");
layers.forEach((l, i) => {
  const b = document.createElement("button");
  b.className = "layer";
  b.innerHTML = `<span class="num">0${i + 1}</span><span><strong>${l.zh}</strong><small>${l.en}</small></span><span class="dot">●</span>`;
  b.onclick = () => selectLayer(i);
  layerHost.append(b);
});
function selectLayer(i, extract = true) {
  selected = i;
  const l = layers[i];
  document.querySelectorAll(".layer").forEach((b, j) => {
    b.classList.toggle("selected", i === j);
    b.setAttribute("aria-pressed", i === j);
  });
  document.querySelector("#extracted-name").textContent = l.zh;
  document.querySelector("#selection-caption").textContent = extract
    ? "已抽出 · " + l.zh
    : "展開全貌 · 點選任一層抽出";
  if (extract)
    window.dispatchEvent(new CustomEvent("chip-layer-select", { detail: i }));
  const stocks = [
    ...(l.codes || [])
      .map((code) => profiles.find((c) => c.code === code))
      .filter(Boolean)
      .map((c) => [c.name, c.market + " " + c.code]),
    ...(l.foreign || []),
  ];
  document.querySelector("#detail").innerHTML =
    `<div class="tag">LAYER 0${i + 1} / 06</div><div class="symbol">${l.icon}</div><h2>${l.zh}</h2><div class="english">${l.en}</div><p>${l.desc}</p><div class="tech-tags">${l.tags.map((t) => `<span>${t}</span>`).join("")}</div><div class="related"><div class="related-label">${!(l.codes || []).length ? "GLOBAL PLAYERS" : l.foreign ? "相關企業" : "關鍵台灣企業"}</div>${stocks.map((s) => `<button class="stock" data-code="${s[1].split(" ").pop()}" aria-label="查看 ${s[0]} 公司簡介"><span>${s[0]}</span><code>${s[1]} ↗</code></button>`).join("")}</div>${l.note ? `<div class="detail-foot">${l.note}</div>` : ""}<div class="model-reference"><div>REFERENCE / 圖像依據</div>${refs[i].map((r) => `<a href="${r.url}" target="_blank" rel="noopener">${r.name} ↗</a>`).join("")}<small>依官方照片與結構圖建模，卡通渲染；非產品精確複刻。</small></div>`;
}
window.selectChipLayer = selectLayer;
selectLayer(0, false);

const categories = [
  "全部企業",
  ...new Set(profiles.filter((c) => c.taiwan).map((c) => c.category)),
];
let activeCategory = "全部企業";
function renderCompanies(category) {
  activeCategory = category;
  const query = document
    .querySelector("#company-search")
    .value.trim()
    .toLowerCase();
  const list = profiles.filter(
    (c) =>
      c.taiwan &&
      (category === "全部企業" || c.category === category) &&
      (!query ||
        [c.name, c.en, c.code, c.brief]
          .join(" ")
          .toLowerCase()
          .includes(query)),
  );
  document.querySelector("#company-count").textContent =
    `${list.length} / ${profiles.filter((c) => c.taiwan).length} 家台股企業`;
  document.querySelector("#companies").innerHTML =
    list
      .map(
        (c) =>
          `<button class="company" data-code="${c.code}" aria-label="查看 ${c.name} ${c.code} 的歷史簡介"><span class="company-top"><span>${c.category}</span>${c.market}</span><span class="company-name">${c.name}<code>${c.code}</code></span><span class="en">${c.en}</span><span class="company-brief">${c.brief}</span><span class="company-link">認識這家公司 <b>↗</b></span></button>`,
      )
      .join("") || '<p class="empty">沒有符合的公司，試試其他名稱或代碼。</p>';
}
categories.forEach((c, i) => {
  const b = document.createElement("button");
  b.className = "filter" + (!i ? " selected" : "");
  b.textContent = c;
  b.setAttribute("aria-pressed", !i);
  b.onclick = () => {
    document.querySelectorAll(".filter").forEach((x) => {
      x.classList.toggle("selected", x === b);
      x.setAttribute("aria-pressed", x === b);
    });
    renderCompanies(c);
  };
  document.querySelector("#filters").append(b);
});
document
  .querySelector("#company-search")
  .addEventListener("input", () => renderCompanies(activeCategory));
const dialog = document.querySelector("#company-dialog");
function openCompany(code) {
  const c = profiles.find((c) => c.code === code);
  if (!c) return;
  const mappings = (window.INDUSTRIES || []).filter((x) =>
      x.codes.includes(code),
    ),
    basic = c.basic;
  const representative =
    mappings.find((x) => x.name === c.category) || mappings[0];
  const thumb =
    representative &&
    document.querySelector(
      `[data-sketch="${window.INDUSTRIES.indexOf(representative)}"]`,
    );
  const facts = basic
    ? [
        ["公司全名", basic.legalName],
        ["法人設立", basic.established],
        ["上市／上櫃", basic.listed],
        ["董事長", basic.chairman],
        ["總經理", basic.generalManager],
        [
          "實收資本額",
          `${(Number(basic.capital) / 100000000).toLocaleString("zh-TW", { maximumFractionDigits: 2 })} 億元`,
        ],
        ["登記地址", basic.address],
      ]
    : [];
  document.querySelector("#company-history").innerHTML =
    `<div class="eyebrow">COMPANY ARCHIVE / ${c.market}</div><h2 id="history-title">${c.name} <code>${c.code}</code></h2><div class="english">${c.en}</div><div class="history-category">${c.category}</div>${c.taiwan?window.kzoneChartLink(c):''}${basic ? `<section class="archive-section archive-basics"><h3>基本資料</h3><dl class="company-facts">${facts.map(([label, value]) => `<div><dt>${label}</dt><dd>${value || "—"}</dd></div>`).join("")}</dl><div class="registry-date">基本資料快照：${basic.asOf} · 法人設立日期與品牌創業年份可能不同。</div></section>` : `<div class="global-origin">${c.founded} · 公司起源</div>`}<div class="archive-body"><div class="archive-narrative"><section class="archive-section"><h3>公司做什麼</h3><p>${c.overview || c.brief}</p></section><section class="archive-section"><h3>主要產品與服務</h3><div class="product-list">${(c.products || []).map((x) => `<span>${x}</span>`).join("")}</div></section><section class="archive-section"><h3>成立與發展</h3><p>${c.history}</p></section></div><section class="archive-section archive-role"><h3>在低軌衛星產業鏈中的角色</h3>${thumb && thumb.src ? `<figure class="history-sketch"><img src="${thumb.src}" alt="${representative.component} 的手繪風格模型"><figcaption>${representative.component} · 產業構件示意</figcaption></figure>` : ""}<p>${c.brief}</p><div class="history-mappings">${mappings.map((x) => `<span>${x.name} · ${x.component}</span>`).join("")}</div></section></div><section class="archive-section history-source"><h3>參考來源與圖像說明</h3><a href="${c.source}" target="_blank" rel="noopener">官方公司介紹與沿革 ↗</a>${basic ? `<a href="${basic.registrySource}" target="_blank" rel="noopener">證交所／櫃買中心基本資料 ↗</a>` : ""}<small>產品角色為產業關聯整理；構件圖為依原廠資料製作的教學模型。</small></section>`;
  dialog.showModal();
  dialog.scrollTop = 0;
}
document.addEventListener("click", (e) => {
  const trigger = e.target.closest("[data-code]");
  if (trigger) openCompany(trigger.dataset.code);
});
document.querySelector("#history-close").onclick = () => dialog.close();
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) dialog.close();
});
renderCompanies("全部企業");
