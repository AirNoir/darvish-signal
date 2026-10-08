/*
 * 公司簡介的「查看達比訊號」／「許願收錄」切換
 * 外層 K-Zone（IndustryAtlasView）會 postMessage 已收錄的股票代碼清單過來；
 * 台股公司若不在清單內，改顯示許願按鈕，展開後提供 LINE 社群連結與加入密碼。
 * 清單尚未收到（例如單獨開啟此頁）時一律顯示「查看達比訊號」，避免誤擋。
 */
(function () {
  var LINE_URL = 'https://line.me/ti/g2/CSMMkMLIFxMCmtTrAltPuL0b4OZQUF7w4q5rfw?utm_source=invitation&utm_medium=link_copy&utm_campaign=default';
  var LINE_PASSWORD = '50000';
  var listed = null;

  window.addEventListener('message', function (e) {
    if (e.origin !== location.origin || !e.data || e.data.type !== 'kzone:stocks') return;
    if (Array.isArray(e.data.symbols) && e.data.symbols.length) listed = new Set(e.data.symbols);
  });
  // 告訴外層「我準備好了」，外層收到後回傳清單（iframe 晚於清單載入時也能拿到）
  try { if (window.parent !== window) window.parent.postMessage({ type: 'kzone:atlas-ready' }, location.origin); } catch (e) {}

  window.kzoneChartLink = function (c) {
    var code = encodeURIComponent(c.code);
    if (!listed || listed.has(c.code)) {
      return '<a class="chart-link" href="/app/' + code + '" target="_top" aria-label="查看 ' + c.name + ' ' + c.code + ' 的達比訊號">查看達比訊號 <span>' + c.code + ' · K-Zone</span></a>';
    }
    return '<div class="wish" data-wish-code="' + c.code + '">' +
      '<button type="button" class="wish-btn" aria-expanded="false">許願收錄 ' + c.name + ' <span>尚未收錄於達比訊號 · 告訴管理員</span></button>' +
      '<div class="wish-panel" hidden>' +
        '<img src="/images/line-qr.png" alt="LINE 社群 QR Code" width="112" height="112">' +
        '<div><p>這檔股票目前還沒有收錄在達比訊號。加入 LINE 社群，留言告訴管理員想看的股票代碼：<b>' + c.code + ' ' + c.name + '</b></p>' +
        '<a class="wish-line" href="' + LINE_URL + '" target="_blank" rel="noopener">加入 LINE 社群許願 ↗</a>' +
        '<div class="wish-password">加入密碼：<strong>' + LINE_PASSWORD + '</strong></div></div>' +
      '</div></div>';
  };

  document.addEventListener('click', function (e) {
    var btn = e.target instanceof Element && e.target.closest('.wish-btn');
    if (!btn) return;
    var panel = btn.parentElement.querySelector('.wish-panel');
    var open = panel.hidden;
    panel.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
  });
})();
