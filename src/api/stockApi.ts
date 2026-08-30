// Stock API Service for DarvishSignal
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://api.darvishkzone.com'

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
  foreign_net_5d_avg?: number
  foreign_net_10d_avg?: number
  foreign_net_15d_avg?: number
  foreign_net_30d_avg?: number
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
  foreign_holding_pct?: number
  insti_holding_pct?: number
  price_limit_up?: boolean
  price_limit_down?: boolean
}

export type PickType = 'breakout' | 're_entry' | 'dip'

export interface AlphaPickItem {
  symbol: string
  trade_date: string
  pick_type?: PickType
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

// --- Trade Records Types ---

export interface MarketData {
  trade_date: string
  taiex_open: number
  taiex_high: number
  taiex_low: number
  taiex_close: number
  total_volume: number
  foreign_net: number
  margin_balance: number
  margin_balance_change: number
}

export interface TradeRecord {
  name: string
  performance: number | null
  price: number
  symbol: string
  trade_date: string
  type: 'BUY' | 'SELL'
}

export interface TradeRecordsResponse {
  avg_performance: number
  count: number
  loss_count: number
  profit_count: number
  records: TradeRecord[]
  win_rate: number
}

// --- 大戶 / 散戶持股 (週頻，集保戶股權分散) ---
export interface PeriodHoldingItem {
  symbol: string
  name: string
  trade_date: string
  major_ratio: number | null
  retail_ratio: number | null
}

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

  // Trade Records - robot performance
  async getTradeRecords(from: string, to: string): Promise<TradeRecordsResponse> {
    return apiFetch<TradeRecordsResponse>(`${API_BASE_URL}/api/trade/trade-records?from=${from}&to=${to}`)
  },

  // Market - TAIEX 大盤資料
  async getMarket(limit = 60): Promise<MarketData[]> {
    return apiFetch<MarketData[]>(`${API_BASE_URL}/api/market?limit=${limit}`)
  },

  // 大戶 / 散戶持股 (週頻)
  async getPeriodHolding(symbol: string): Promise<PeriodHoldingItem[]> {
    return apiFetch<PeriodHoldingItem[]>(`${API_BASE_URL}/api/period/holding/${symbol}`)
  },
}

export default stockApi
