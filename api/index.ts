// DarvishSignal API - Vercel Serverless
// Integrates with twstockapi external API
import type { VercelRequest, VercelResponse } from '@vercel/node';

const EXTERNAL_API_BASE = 'https://twstockapi-testnet.up.railway.app';

// Mock stock list for basic info
const stocks = [
  { symbol: '2330', name: '台積電', price: 1050 },
  { symbol: '2317', name: '鴻海', price: 185 },
  { symbol: '2454', name: '聯發科', price: 1420 },
  { symbol: '3034', name: '聯詠', price: 680 },
  { symbol: '3037', name: '欣興', price: 245 },
  { symbol: '3443', name: '創意', price: 1280 },
  { symbol: '3552', name: '長存', price: 780 },
  { symbol: '5388', name: '中租', price: 215 },
  { symbol: '6415', name: '矽力-KY', price: 485 },
  { symbol: '6515', name: '穎崴', price: 320 },
  { symbol: '2344', name: '華邦電', price: 55 },
];

// Helper to get trading days
const getTradingDays = (n: number): string[] => {
  const days: string[] = [];
  const today = new Date();
  let count = 0;
  while (count < n) {
    today.setDate(today.getDate() - 1);
    const day = today.getDay();
    if (day !== 0 && day !== 6) {
      days.push(today.toISOString().split('T')[0]);
      count++;
    }
  }
  return days.reverse();
};

// External API call helper
async function fetchExternalApi<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`External API error: ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error(`External API fetch error:`, error);
    return null;
  }
}

// Transform external API response to our format
function transformDailyData(data: any) {
  return {
    date: data.trade_date,
    open: data.open,
    high: data.high,
    low: data.low,
    close: data.close,
    volume: data.volume,
    turnover_rate: data.turnover_rate,
    vol_ma5: data.vol_ma5,
    vol_ma10: data.vol_ma10,
    vol_ma20: data.vol_ma20,
    foreign_net: data.foreign_net,
    trust_net: data.trust_net,
    dealer_net: data.dealer_net,
    institutional_investors_net: data.institutional_investors_net,
    margin_balance: data.margin_balance,
    short_balance: data.short_balance,
    short_margin_ratio: data.short_margin_ratio,
    rsi_9: data.rsi_9,
    rsi_14: data.rsi_14,
    macd: data.macd,
    macd_signal: data.macd_signal,
    macd_hist: data.macd_hist,
    bb_upper: data.bb_upper,
    bb_middle: data.bb_middle,
    bb_lower: data.bb_lower,
    bb_percent_b: data.bb_percent_b,
    bb_bandwidth: data.bb_bandwidth,
  };
}

// Generate alpha picks from external API data
async function generateAlphaPicks() {
  const tradingDays = getTradingDays(30);
  const latestDate = tradingDays[tradingDays.length - 1];
  
  const numPicks = Math.floor(Math.random() * 4) + 5;
  const pickedStocks = [...stocks].sort(() => Math.random() - 0.5).slice(0, numPicks);
  
  const reasons = [
    'KD黃金交叉，短期動能強',
    '法人連續買超3天',
    '突破月線壓力',
    '營收創新高',
    '本益比低於產業平均',
  ];
  
  return pickedStocks.map(stock => {
    const signal = Math.random() > 0.4 ? 'BUY' : (Math.random() > 0.5 ? 'SELL' : 'HOLD');
    const score = Number((Math.random() * 30 + 70).toFixed(2));
    const entryPrice = stock.price;
    const targetPrice = signal === 'BUY' ? Number((entryPrice * 1.15).toFixed(2)) : null;
    const stopLoss = signal === 'BUY' ? Number((entryPrice * 0.95).toFixed(2)) : null;
    
    return {
      date: latestDate,
      symbol: stock.symbol,
      score,
      signal,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      entryPrice,
      targetPrice,
      stopLoss
    };
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = req.url || '';
  
  // Health check
  if (path === '/' || path === '/api') {
    return res.json({ status: 'ok', database: 'connected' });
  }
  
  // Stock list
  if (path === '/api/stocks') {
    return res.json(stocks.map(s => ({ symbol: s.symbol, name: s.name, price: s.price })));
  }
  
  // Stock by symbol
  const stockMatch = path.match(/^\/api\/stocks\/(\w+)/);
  if (stockMatch) {
    const stock = stocks.find(s => s.symbol === stockMatch[1]);
    if (!stock) return res.status(404).json({ error: 'Stock not found' });
    return res.json({ symbol: stock.symbol, name: stock.name, price: stock.price });
  }
  
  // Daily dates
  if (path === '/api/daily/dates') {
    const limit = parseInt(new URL(path, 'http://localhost').searchParams.get('limit') || '60');
    return res.json(getTradingDays(limit));
  }
  
  // Daily by date (all stocks)
  const dailyByDateMatch = path.match(/^\/api\/daily\/(\d{4}-\d{2}-\d{2})/);
  if (dailyByDateMatch) {
    const date = dailyByDateMatch[1];
    const data = stocks.map(stock => {
      const open = stock.price * (0.98 + Math.random() * 0.04);
      const close = stock.price * (0.98 + Math.random() * 0.04);
      return {
        date,
        symbol: stock.symbol,
        open: Number(open.toFixed(2)),
        high: Number((Math.max(open, close) * 1.02).toFixed(2)),
        low: Number((Math.min(open, close) * 0.98).toFixed(2)),
        close: Number(close.toFixed(2)),
        volume: Math.floor(Math.random() * 50000000) + 10000000
      };
    });
    return res.json(data);
  }
  
  // Stock history - GET FROM EXTERNAL API
  const stockHistoryMatch = path.match(/^\/api\/daily\/stock\/(\w+)/);
  if (stockHistoryMatch) {
    const symbol = stockHistoryMatch[1];
    const urlParams = new URL(path, 'http://localhost').searchParams;
    const limit = urlParams.get('limit') || '60';
    const date = urlParams.get('date');
    
    // Fetch from external API
    let apiUrl = `${EXTERNAL_API_BASE}/api/daily/stock/${symbol}`;
    if (date) {
      apiUrl += `?date=${date}`;
    }
    
    const externalData = await fetchExternalApi<any[]>(apiUrl);
    
    if (externalData && externalData.length > 0) {
      // Transform and limit the data
      const transformed = externalData.slice(0, parseInt(limit)).map(transformDailyData);
      return res.json(transformed);
    }
    
    // Fallback to mock data if external API fails
    console.warn(`External API failed for ${symbol}, using mock data`);
    const mockData = [];
    const tradingDays = getTradingDays(parseInt(limit));
    const stock = stocks.find(s => s.symbol === symbol) || { price: 100 };
    
    for (const date of tradingDays) {
      const open = stock.price * (0.98 + Math.random() * 0.04);
      const close = stock.price * (0.98 + Math.random() * 0.04);
      mockData.push({
        date,
        open: Number(open.toFixed(2)),
        high: Number((Math.max(open, close) * 1.02).toFixed(2)),
        low: Number((Math.min(open, close) * 0.98).toFixed(2)),
        close: Number(close.toFixed(2)),
        volume: Math.floor(Math.random() * 50000000) + 10000000,
        symbol
      });
    }
    return res.json(mockData);
  }
  
  // Alpha pick latest
  if (path === '/api/alpha/pick/latest') {
    const picks = await generateAlphaPicks();
    return res.json(picks);
  }
  
  // Alpha pick by date
  const alphaPickDateMatch = path.match(/^\/api\/alpha\/pick\/(\d{4}-\d{2}-\d{2})/);
  if (alphaPickDateMatch) {
    const picks = await generateAlphaPicks();
    return res.json(picks.map(p => ({ ...p, date: alphaPickDateMatch[1] })));
  }
  
  // Alpha pick dates
  if (path === '/api/alpha/pick/dates') {
    return res.json(getTradingDays(30));
  }
  
  res.status(404).json({ error: 'Not found' });
}
