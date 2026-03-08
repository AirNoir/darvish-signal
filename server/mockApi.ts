// Mock API Server for DarvishSignal
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Helper: Generate realistic Taiwan stock prices
const generatePrice = (base: number) => {
  const variance = base * 0.03; // 3% variance
  return base + (Math.random() - 0.5) * variance;
};

// Helper: Get last N trading days
const getTradingDays = (n: number): string[] => {
  const days: string[] = [];
  const today = new Date();
  let count = 0;
  
  while (count < n) {
    today.setDate(today.getDate() - 1);
    const day = today.getDay();
    if (day !== 0 && day !== 6) { // Skip weekends
      days.push(today.toISOString().split('T')[0]);
      count++;
    }
  }
  return days.reverse();
};

// Mock Stock List
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
];

// Generate daily data for a stock
const generateDailyData = (symbol: string, days: number) => {
  const stock = stocks.find(s => s.symbol === symbol) || { price: 100 };
  const tradingDays = getTradingDays(days);
  
  return tradingDays.map((date, i) => {
    const open = generatePrice(stock.price);
    const close = generatePrice(stock.price);
    const high = Math.max(open, close) * 1.02;
    const low = Math.min(open, close) * 0.98;
    const volume = Math.floor(Math.random() * 50000000) + 10000000;
    
    return {
      date,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
      symbol
    };
  });
};

// Generate Alpha Picks
const generateAlphaPicks = () => {
  const tradingDays = getTradingDays(30);
  const latestDate = tradingDays[tradingDays.length - 1];
  
  // Random 5-8 stocks picked
  const numPicks = Math.floor(Math.random() * 4) + 5;
  const pickedStocks = [...stocks].sort(() => Math.random() - 0.5).slice(0, numPicks);
  
  return pickedStocks.map(stock => {
    const signal = Math.random() > 0.4 ? 'BUY' : (Math.random() > 0.5 ? 'SELL' : 'HOLD');
    const score = Number((Math.random() * 30 + 70).toFixed(2)); // 70-100
    const entryPrice = stock.price;
    const targetPrice = signal === 'BUY' ? Number((entryPrice * 1.15).toFixed(2)) : null;
    const stopLoss = signal === 'BUY' ? Number((entryPrice * 0.95).toFixed(2)) : null;
    
    const reasons = [
      'KD黃金交叉，短期動能強',
      '法人連續買超3天',
      '突破月線壓力',
      '營收創新高',
      '本益比低於產業平均',
    ];
    
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
};

// API Routes

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', database: 'connected' });
});

// Stocks
app.get('/api/stocks', (req, res) => {
  const stockList = stocks.map(s => ({
    symbol: s.symbol,
    name: s.name,
    price: s.price
  }));
  res.json(stockList);
});

app.get('/api/stocks/:symbol', (req, res) => {
  const stock = stocks.find(s => s.symbol === req.params.symbol);
  if (!stock) {
    return res.status(404).json({ error: 'Stock not found' });
  }
  res.json({
    symbol: stock.symbol,
    name: stock.name,
    price: stock.price
  });
});

// Daily data
app.get('/api/daily/dates', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 60;
  res.json(getTradingDays(limit));
});

app.get('/api/daily/:date', (req, res) => {
  // Return all stocks for a given date
  const date = req.params.date;
  const data = stocks.map(stock => {
    const open = generatePrice(stock.price);
    const close = generatePrice(stock.price);
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
  res.json(data);
});

app.get('/api/daily/stock/:symbol', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const data = generateDailyData(req.params.symbol, limit);
  res.json(data);
});

// Alpha Pick
app.get('/api/alpha/pick/latest', (req, res) => {
  res.json(generateAlphaPicks());
});

app.get('/api/alpha/pick/:date', (req, res) => {
  // For any date, generate picks
  const picks = generateAlphaPicks().map(p => ({ ...p, date: req.params.date }));
  res.json(picks);
});

app.get('/api/alpha/pick/dates', (req, res) => {
  res.json(getTradingDays(30));
});

app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
});
