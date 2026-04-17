// DarvishSignal API - Transparent Proxy to TWStock API
import type { VercelRequest, VercelResponse } from '@vercel/node';

const EXTERNAL_API_BASE = 'https://api.darvishkzone.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = req.url || '';

  try {
    const externalUrl = `${EXTERNAL_API_BASE}${path}`;
    const response = await fetch(externalUrl, {
      method: req.method || 'GET',
      headers: { 'Accept': 'application/json' },
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch from external API' });
  }
}
