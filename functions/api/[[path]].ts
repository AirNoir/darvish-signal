// DarvishSignal API - Transparent Proxy to TWStock API (Cloudflare Pages Functions)

const EXTERNAL_API_BASE = 'https://twstockapi-testnet.up.railway.app';

export async function onRequest(context: { request: Request }): Promise<Response> {
  const url = new URL(context.request.url);
  const externalUrl = `${EXTERNAL_API_BASE}${url.pathname}${url.search}`;

  try {
    const response = await fetch(externalUrl, {
      method: context.request.method,
      headers: { 'Accept': 'application/json' },
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch from external API' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
