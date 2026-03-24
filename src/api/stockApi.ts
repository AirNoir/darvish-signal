// Stock API Service for DarvishSignal
const API_BASE_URL = '' // Empty = same origin (Vercel proxy)

// --- Types ---

export interface Stock {
  symbol: string
  name: string
  enabled: boolean
  issued_shares: number
}

export interface DailyDataItem {
  trade_date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  turnover_rate?: number
  foreign_net?: number
  trust_net?: number
  dealer_net?: number
  institutional_investors_net?: number
  margin_balance?: number
  short_balance?: number
  short_margin_ratio?: number
  vol_ma5?: number
  vol_ma10?: number
  vol_ma20?: number
  rsi_9?: number
  rsi_14?: number
  macd?: number
  macd_signal?: number
  macd_hist?: number
  bb_upper?: number
  bb_middle?: number
  bb_lower?: number
  bb_percent_b?: number
  bb_bandwidth?: number
}

export interface AlphaPickItem {
  symbol: string
  trade_date: string
  name: string
  close: number
  volume: number
  vol_ma5?: number
  vol_ma10?: number
  vol_ma20?: number
  rsi_14: number
  macd: number
  macd_signal: number
  macd_hist: number
  bb_upper?: number
  bb_bandwidth?: number
  bb_percent_b: number
  insti_net_5d_sum: number
  insti_net_5d_avg: number
  insti_net_10d_sum: number
  insti_net_10d_avg: number
  insti_net_15d_sum: number
  insti_net_15d_avg: number
  insti_net_30d_sum: number
  insti_net_30d_avg: number
  cond_insti: boolean
  cond_insti_bullish: boolean
  cond_rsi: boolean
  cond_macd: boolean
  cond_vol_ma10: boolean
  cond_vol_ma20: boolean
  cond_bb_narrow: boolean
  cond_bb_near_upper: boolean
  cond_turnover_surge: boolean
  reasons: string
}

export interface AlphaPickResponse {
  trade_date: string
  count: number
  picks: AlphaPickItem[]
}

export interface AlphaPickSummaryItem {
  symbol: string
  name: string
  pick_count: number
  first_date: string
  last_date: string
}

export interface SellAlertItem {
  symbol: string
  trade_date: string
  name: string
  close: number
  volume: number
  vol_ma10?: number
  rsi_14: number
  macd_hist: number
  bb_percent_b: number
  foreign_net_5d_sum?: number
  foreign_net_5d_avg?: number
  foreign_net_10d_sum?: number
  foreign_net_10d_avg?: number
  foreign_net_15d_sum?: number
  foreign_net_15d_avg?: number
  foreign_net_30d_sum?: number
  foreign_net_30d_avg?: number
  trust_net_5d_sum?: number
  trust_net_5d_avg?: number
  trust_net_10d_sum?: number
  trust_net_10d_avg?: number
  trust_net_15d_sum?: number
  trust_net_15d_avg?: number
  trust_net_30d_sum?: number
  trust_net_30d_avg?: number
  conditions_met: number
  cond_foreign_sell?: boolean
  cond_foreign_accel?: boolean
  cond_trust_sell?: boolean
  cond_trust_accel?: boolean
  cond_high_black?: boolean
  cond_price_up_vol_down?: boolean
  cond_rsi_overbought?: boolean
  cond_rsi_divergence?: boolean
  cond_macd_turn_neg?: boolean
  cond_macd_divergence?: boolean
  cond_bb_below?: boolean
  cond_macd_death_cross?: boolean
  cond_margin_surge?: boolean
  cond_turnover_surge?: boolean
  cond_vol_surge_flat?: boolean
  reasons: string
}

export interface SellAlertResponse {
  trade_date: string
  count: number
  sells: SellAlertItem[]
}

export interface StockSignalResponse<T> {
  symbol: string
  count: number
  records: T[]
}

// --- API Functions ---

async function apiFetch<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`)
  return res.json()
}

export const stockApi = {
  // Stocks
  async getStockList(enabledOnly = true): Promise<Stock[]> {
    const url = enabledOnly
      ? `${API_BASE_URL}/api/stocks?enabled=true`
      : `${API_BASE_URL}/api/stocks`
    return apiFetch<Stock[]>(url)
  },

  async getStockBySymbol(symbol: string): Promise<Stock> {
    return apiFetch<Stock>(`${API_BASE_URL}/api/stocks/${symbol}`)
  },

  // Daily Data
  async getMarketDates(limit = 60): Promise<string[]> {
    return apiFetch<string[]>(`${API_BASE_URL}/api/daily/dates?limit=${limit}`)
  },

  async getDailyDataByDate(date: string): Promise<DailyDataItem[]> {
    return apiFetch<DailyDataItem[]>(`${API_BASE_URL}/api/daily/${date}`)
  },

  async getStockHistory(symbol: string, limit = 60): Promise<DailyDataItem[]> {
    return apiFetch<DailyDataItem[]>(`${API_BASE_URL}/api/daily/stock/${symbol}?limit=${limit}`)
  },

  // Alpha Pick - BUY signals
  async getAlphaPickLatest(): Promise<AlphaPickResponse> {
    return apiFetch<AlphaPickResponse>(`${API_BASE_URL}/api/alpha/pick/latest`)
  },

  async getAlphaPickByDate(date: string): Promise<AlphaPickResponse> {
    return apiFetch<AlphaPickResponse>(`${API_BASE_URL}/api/alpha/pick/${date}`)
  },

  async getAlphaPickDates(limit = 30): Promise<string[]> {
    return apiFetch<string[]>(`${API_BASE_URL}/api/alpha/pick/dates?limit=${limit}`)
  },

  async getAlphaPickSummary(): Promise<AlphaPickSummaryItem[]> {
    return apiFetch<AlphaPickSummaryItem[]>(`${API_BASE_URL}/api/alpha/pick/summary`)
  },

  async getAlphaPickByStock(symbol: string): Promise<StockSignalResponse<AlphaPickItem>> {
    return apiFetch<StockSignalResponse<AlphaPickItem>>(`${API_BASE_URL}/api/alpha/pick/stock/${symbol}`)
  },

  // Sell Alerts - SELL signals
  async getSellLatest(): Promise<SellAlertResponse> {
    return apiFetch<SellAlertResponse>(`${API_BASE_URL}/api/alpha/sell/latest`)
  },

  async getSellByDate(date: string): Promise<SellAlertResponse> {
    return apiFetch<SellAlertResponse>(`${API_BASE_URL}/api/alpha/sell/${date}`)
  },

  async getSellSummary(): Promise<AlphaPickSummaryItem[]> {
    return apiFetch<AlphaPickSummaryItem[]>(`${API_BASE_URL}/api/alpha/sell/summary`)
  },

  async getSellByStock(symbol: string): Promise<StockSignalResponse<SellAlertItem>> {
    return apiFetch<StockSignalResponse<SellAlertItem>>(`${API_BASE_URL}/api/alpha/sell/stock/${symbol}`)
  },
}

export default stockApi
