/*
 * AI 產業地圖 GA 追蹤
 * 地圖跑在 K-Zone 的同源 iframe 裡，GTM 只裝在外層頁面 → 事件推到 parent 的 dataLayer。
 * 單一事件名稱 industry_map_click，用 map_action 區分動作（對應 GTM Custom Event regex 白名單）。
 *
 * 參數
 *   map_action  動作代號（見下方 classify）
 *   map_target  點擊對象名稱（層名、產業名、公司名、按鈕文字…）
 *   stock_code  有關聯公司時的股票代碼
 *   map_section 所在區塊：chip_lab / industry_lab / companies / company_dialog / nav
 *   map_id      哪一張地圖：ai（/industry-atlas）或 leo（/leo-atlas）
 */
(function () {
  var host;
  try {
    host = window.parent && window.parent !== window && window.parent.location.origin === location.origin ? window.parent : window;
  } catch (e) {
    host = window;
  }

  var mapId = location.pathname.indexOf('/leo-atlas/') === 0 ? 'leo' : 'ai';

  function push(params) {
    host.dataLayer = host.dataLayer || [];
    host.dataLayer.push(Object.assign({ event: 'industry_map_click', map_id: mapId }, params));
  }

  function text(el) {
    return el ? el.textContent.replace(/\s+/g, ' ').trim().slice(0, 60) : undefined;
  }

  function sectionOf(el) {
    if (el.closest('#company-dialog')) return 'company_dialog';
    if (el.closest('#industry-dialog, #industry, #industry-workspace, #mobile-workspace')) return 'industry_lab';
    if (el.closest('#explore')) return 'chip_lab';
    if (el.closest('#supply, #companies, #filters')) return 'companies';
    if (el.closest('.atlas-nav')) return 'nav';
    return 'other';
  }

  // 回傳 { map_action, map_target, stock_code }；不追蹤的點擊回傳 null
  function classify(t) {
    var el;
    if ((el = t.closest('.atlas-nav a'))) return { map_action: 'nav_anchor', map_target: text(el) };
    if ((el = t.closest('.wish-btn'))) return { map_action: 'wish_toggle', map_target: el.getAttribute('aria-expanded') === 'true' ? 'close' : 'open', stock_code: el.closest('.wish').dataset.wishCode };
    if ((el = t.closest('.wish-line'))) return { map_action: 'wish_line_click', stock_code: el.closest('.wish').dataset.wishCode };
    if ((el = t.closest('.chart-link'))) return { map_action: 'company_chart_link', map_target: text(el.firstChild), stock_code: el.getAttribute('href').split('/').pop() };
    if ((el = t.closest('#layers .layer'))) return { map_action: 'chip_layer_select', map_target: text(el.querySelector('strong')) };
    if ((el = t.closest('#model-labels .model-label'))) return { map_action: 'chip_label_select', map_target: (text(el) || '').replace(/^\d+\s*/, '') };
    if ((el = t.closest('[data-mode]'))) return { map_action: 'chip_mode', map_target: el.dataset.mode };
    if ((el = t.closest('#solo'))) return { map_action: 'chip_solo', map_target: el.getAttribute('aria-pressed') === 'true' ? 'off' : 'on' };
    if ((el = t.closest('#reset-view'))) return { map_action: 'chip_reset' };
    if ((el = t.closest('[data-industry]'))) return { map_action: 'industry_select', map_target: text(el.querySelector('strong')) };
    if ((el = t.closest('[data-model-part]'))) return { map_action: 'industry_label_select', map_target: text(el.querySelector('strong')) };
    if ((el = t.closest('button[data-lab]'))) return { map_action: 'industry_lab_tab', map_target: text(el) };
    if ((el = t.closest('#lab-assemble'))) return { map_action: 'industry_assemble', map_target: text(el) };
    if ((el = t.closest('#lab-solo'))) return { map_action: 'industry_solo', map_target: el.getAttribute('aria-pressed') === 'true' ? 'off' : 'on' };
    if ((el = t.closest('#lab-reset'))) return { map_action: 'industry_reset' };
    if ((el = t.closest('#filters .filter'))) return { map_action: 'company_filter', map_target: text(el) };
    if ((el = t.closest('[data-code]'))) {
      var name = el.querySelector('.company-name') || el.querySelector('strong') || el.querySelector('span');
      return {
        map_action: el.classList.contains('stock') ? 'chip_stock_open' : el.classList.contains('company') ? 'company_open' : 'industry_company_open',
        map_target: name ? text(name).replace(el.dataset.code, '').trim() : undefined,
        stock_code: el.dataset.code
      };
    }
    if ((el = t.closest('#history-close, #industry-close'))) return { map_action: 'dialog_close', map_target: el.id };
    if ((el = t.closest('a[target="_blank"]'))) return { map_action: 'source_link', map_target: text(el) };
    return null;
  }

  // capture 階段：在原本 handler 改寫 DOM 之前讀取點擊目標
  document.addEventListener('click', function (e) {
    var t = e.target instanceof Element ? e.target : null;
    if (!t) return;
    var info = classify(t);
    if (info) push(Object.assign({ map_section: sectionOf(t) }, info));
  }, true);

  // 3D 模型直接點選零件：pointerup 後由模型程式更新面板，下一個 frame 再讀選中的名稱
  function track3d(stageSel, action, readName) {
    var down = null;
    document.addEventListener('pointerdown', function (e) {
      down = e.target instanceof Element && e.target.closest(stageSel) && e.target.tagName === 'CANVAS' ? { x: e.clientX, y: e.clientY } : null;
    }, true);
    document.addEventListener('pointerup', function (e) {
      if (!down) return;
      var moved = Math.abs(e.clientX - down.x) + Math.abs(e.clientY - down.y);
      down = null;
      if (moved > 6) return; // 拖曳旋轉不算點選
      var before = readName();
      requestAnimationFrame(function () {
        var after = readName();
        if (after && after !== before) push({ map_action: action, map_target: after, map_section: action.indexOf('chip') === 0 ? 'chip_lab' : 'industry_lab' });
      });
    }, true);
  }
  track3d('#chip-stage', 'chip_3d_pick', function () { return text(document.querySelector('#detail h2')); });
  track3d('#industry-stage', 'industry_3d_pick', function () { return text(document.querySelector('#chain-detail h3')); });

  // 公司搜尋：停止輸入 1 秒後送一次
  var searchTimer;
  document.addEventListener('input', function (e) {
    if (!(e.target instanceof Element) || e.target.id !== 'company-search') return;
    clearTimeout(searchTimer);
    var value = e.target.value.trim();
    searchTimer = setTimeout(function () {
      if (value) push({ map_action: 'company_search', map_target: value.slice(0, 40), map_section: 'companies' });
    }, 1000);
  }, true);
})();
