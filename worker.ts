// DarvishSignal Worker - API Proxy + Static Assets (Cloudflare Workers)

const EXTERNAL_API_BASE = 'https://twstockapi-testnet.up.railway.app';

interface Env {
  ASSETS: Fetcher;
}

// 產業地圖的程式與資料檔（companies.js、industries.js、*-data.js…）只准由本站頁面以 <script> 載入；
// 直接用 curl / wget / 爬蟲抓檔案一律 403。對應 wrangler.jsonc 的 assets.run_worker_first。
// 這只擋「整包抓走」的懶人做法，無頭瀏覽器仍拿得到；真正的保護是 LICENSE 與版權宣告。
const PROTECTED_SCRIPT = /^\/(industry-atlas|leo-atlas)\/.+\.js$/;

function isSameOriginScriptLoad(request: Request, url: URL): boolean {
  const site = request.headers.get('Sec-Fetch-Site');
  const dest = request.headers.get('Sec-Fetch-Dest');
  // 現代瀏覽器都會帶 Sec-Fetch-*：必須是同站頁面發出的 script 載入
  if (site !== null) return site === 'same-origin' && dest === 'script';
  // 沒有 Sec-Fetch-* 的舊瀏覽器（Safari < 16.4）：退而檢查 Referer 是否同站
  const referer = request.headers.get('Referer');
  if (!referer) return false;
  try {
    return new URL(referer).host === url.host;
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (PROTECTED_SCRIPT.test(url.pathname) && !isSameOriginScriptLoad(request, url)) {
      return new Response('Forbidden', {
        status: 403,
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
      });
    }

    if (url.pathname.startsWith('/api/')) {
      const externalUrl = `${EXTERNAL_API_BASE}${url.pathname}${url.search}`;
      try {
        // TWStockAPI 已啟用 JWT 驗證，Authorization header 必須原樣轉發
        const headers: Record<string, string> = { 'Accept': 'application/json' };
        const authorization = request.headers.get('Authorization');
        if (authorization) headers['Authorization'] = authorization;
        const response = await fetch(externalUrl, {
          method: request.method,
          headers,
        });
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch {
        return new Response(JSON.stringify({ error: 'Failed to fetch from external API' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return env.ASSETS.fetch(request);
  },
};
