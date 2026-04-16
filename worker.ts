// DarvishSignal Worker - API Proxy + Static Assets (Cloudflare Workers)

const EXTERNAL_API_BASE = 'https://twstockapi-testnet.up.railway.app';

interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      const externalUrl = `${EXTERNAL_API_BASE}${url.pathname}${url.search}`;
      try {
        const response = await fetch(externalUrl, {
          method: request.method,
          headers: { 'Accept': 'application/json' },
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
