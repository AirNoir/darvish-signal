// Stock data interface - compatible with future backend
export interface StockData {
  time: string;    // Format: YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Technical analysis results
export interface TechnicalIndicators {
  ma5: (number | null)[];
  ma20: (number | null)[];
  kd: KDData[];
}

export interface KDData {
  time: string;
  k: number;
  d: number;
}

export interface RSIData {
  time: string;
  rsi9: number | null;
  rsi14: number | null;
}

export interface MACDData {
  time: string;
  macd: number | null;
  signal: number | null;
  histogram: number | null;
}

export interface BollingerData {
  time: string;
  upper: number | null;
  middle: number | null;
  lower: number | null;
  percentB: number | null;
}

// FinMind API response
export interface FinMindResponse {
  msg: string;
  status: number;
  data: FinMindStockData[];
}

export interface FinMindStockData {
  date: string;
  stock_id: string;
  Trading_Volume: number;
  Trading_money: number;
  open: number;
  max: number;
  min: number;
  close: number;
  spread: number;
  Trading_turnover: number;
}

// Chart data types for lightweight-charts
export interface CandlestickData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface LineData {
  time: string;
  value: number;
}

export interface VolumeData {
  time: string;
  value: number;
  color: string;
}
