// Stock API Service for DarvishSignal
// Use relative URLs - works locally and on Vercel
const API_BASE_URL = '' // Empty = same origin

// Types
export interface Stock {
  symbol: string
  name?: string
  price?: number
  change?: number
  changePercent?: number
}

export interface DailyData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  symbol?: string
}

export interface AlphaPick {
  date: string
  symbol: string
  score: number
  signal: 'BUY' | 'SELL' | 'HOLD'
  reason?: string
  entryPrice?: number
  targetPrice?: number
  stopLoss?: number
}

export interface AlphaPickSummary {
  totalPicks: number
  winningPicks: number
  winRate: number
  avgReturn: number
}

// API Functions
export const stockApi = {
  // Stocks
  async getStockList(): Promise<Stock[]> {
    const res = await fetch(`${API_BASE_URL}/api/stocks`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  },

  async getStockBySymbol(symbol: string): Promise<Stock> {
    const res = await fetch(`${API_BASE_URL}/api/stocks/${symbol}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  },

  // Daily Data
  async getMarketDates(limit = 60): Promise<string[]> {
    const res = await fetch(`${API_BASE_URL}/api/daily/dates?limit=${limit}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  },

  async getDailyDataByDate(date: string): Promise<DailyData[]> {
    const res = await fetch(`${API_BASE_URL}/api/daily/${date}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  },

  async getStockHistory(symbol: string, limit = 20): Promise<DailyData[]> {
    const res = await fetch(`${API_BASE_URL}/api/daily/stock/${symbol}?limit=${limit}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  },

  // Alpha Pick (Arbitrage Signals)
  async getAlphaPickLatest(): Promise<AlphaPick[]> {
    const res = await fetch(`${API_BASE_URL}/api/alpha/pick/latest`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  },

  async getAlphaPickByDate(date: string): Promise<AlphaPick[]> {
    const res = await fetch(`${API_BASE_URL}/api/alpha/pick/${date}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  },

  async getAlphaPickDates(): Promise<string[]> {
    const res = await fetch(`${API_BASE_URL}/api/alpha/pick/dates`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  },

  // Health Check
  async checkHealth(): Promise<{ status: string; database: string }> {
    const res = await fetch(`${API_BASE_URL}/`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  }
}

export default stockApi
