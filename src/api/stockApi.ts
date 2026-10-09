// Stock API Service for DarvishSignal
// 驗證方式見 frontend-api-auth-integration.md：每個 /api/* request 帶
// Authorization: Bearer <token>，token 即 AccountService 登入回傳的 JWT。
import { useAuthStore } from '../stores/authStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://api.darvishkzone.com'

export const CHART_HISTORY_LIMIT = 500

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

// --- 我的最愛（/api/favorites，見 frontend-favorites-integration.md） ---
export interface FavoriteItem {
  symbol: string
  name: string
  created_time: string // RFC 3339，用 new Date() 解析
}

export interface FavoriteList {
  limit: number
  count: number
  items: FavoriteItem[]
}

// 401 專用錯誤：呼叫端可用 instanceof 區分「需要重新登入」與一般失敗。
// reason 對應後端 body：'token expired'（過期）| 'unauthorized'（沒帶 / 無效）。
export class AuthError extends Error {
  reason: 'token expired' | 'unauthorized'
  constructor(reason: 'token expired' | 'unauthorized') {
    super(reason)
    this.name = 'AuthError'
    this.reason = reason
  }
}

// 其他非 2xx：status 為 HTTP 狀態碼，body 為解析後的 JSON（可能是 null）。
// 例：加入我的最愛回 409 時，body.limit 是目前上限。
export class ApiError extends Error {
  status: number
  body: { error?: string; detail?: string; limit?: number } | null
  constructor(status: number, body: ApiError['body']) {
    super(body?.error ?? body?.detail ?? `TWStockAPI ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const auth = useAuthStore()
  const headers = new Headers(options.headers)
  // 沒 token 時不送 header，避免送出 "Bearer null"（後端一律回 401 unauthorized）
  if (auth.token) headers.set('Authorization', `Bearer ${auth.token}`)
  if (options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(url, { ...options, headers })

  // 204 沒有 body（DELETE 成功），不能呼叫 res.json()
  if (res.status === 204) return null as T
  const body = await res.json().catch(() => null)

  if (res.status === 401) {
    const reason = body?.error === 'token expired' ? 'token expired' : 'unauthorized'
    auth.handleUnauthorized(reason)
    throw new AuthError(reason)
  }
  if (!res.ok) throw new ApiError(res.status, body)
  return body as T
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

  async getStockHistory(symbol: string, limit = CHART_HISTORY_LIMIT): Promise<DailyDataItem[]> {
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

  // 我的最愛（一律需要登入；數量上限依 member_level，以 GET 回傳的 limit 為準）
  async getFavorites(): Promise<FavoriteList> {
    return apiFetch<FavoriteList>(`${API_BASE_URL}/api/favorites`)
  },

  // 201（新加入）與 200（已在清單中）都回傳該筆；409 已達上限（ApiError.body.limit）
  async addFavorite(symbol: string): Promise<FavoriteItem> {
    return apiFetch<FavoriteItem>(`${API_BASE_URL}/api/favorites`, {
      method: 'POST',
      body: JSON.stringify({ symbol })
    })
  },

  // 204；本來就不在清單中也回 204
  async removeFavorite(symbol: string): Promise<void> {
    await apiFetch<null>(`${API_BASE_URL}/api/favorites/${encodeURIComponent(symbol)}`, {
      method: 'DELETE'
    })
  },
}

export default stockApi
