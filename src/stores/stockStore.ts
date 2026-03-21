import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import type { StockData, FinMindResponse, TechnicalIndicators, CandlestickData, LineData, VolumeData, KDData, RSIData, MACDData, BollingerData, InstitutionalData, TurnoverRateData, VolumeMAData, MarginData, ShortData, ShortMarginRatioData } from '../types';
import { useTechnicalAnalysis } from '../composables/useTechnicalAnalysis';
import { stockApi, type AlphaPickItem, type SellAlertItem, type Stock } from '../api/stockApi';

const FINMIND_API_BASE = 'https://api.finmindtrade.com/api/v4/data';

export type ApiSource = 'finmind' | 'darvish'
export type TimeInterval = 'daily' | 'weekly' | 'monthly'

export interface SignalMarker {
  date: string
  type: 'buy' | 'sell'
}

// Helper: Get ISO week number
function getWeekKey(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const firstDayOfYear = new Date(year, 0, 1);
  const dayOfYear = Math.floor((date.getTime() - firstDayOfYear.getTime()) / 86400000) + 1;
  const weekNumber = Math.ceil((dayOfYear + firstDayOfYear.getDay()) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

// Helper: Get month key
function getMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7); // "2024-03"
}

// Helper: Aggregate daily data into period data
function aggregateData<T extends { time: string }>(
  data: T[],
  interval: TimeInterval,
  aggregator: (items: T[], periodKey: string) => T | null
): T[] {
  if (interval === 'daily') return data;

  const getKey = interval === 'weekly' ? getWeekKey : getMonthKey;
  const groups = new Map<string, T[]>();

  for (const item of data) {
    const key = getKey(item.time);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }

  const result: T[] = [];
  for (const [key, items] of groups) {
    const aggregated = aggregator(items, key);
    if (aggregated) result.push(aggregated);
  }
  return result;
}

export const useStockStore = defineStore('stock', () => {
  // State
  const stockId = ref<string>('2330');
  const stockName = ref<string>('');
  const rawStockData = ref<StockData[]>([]); // Raw daily data from API
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const indicators = ref<TechnicalIndicators | null>(null);

  // Time interval for chart display
  const timeInterval = ref<TimeInterval>('daily');

  // API Source
  const apiSource = ref<ApiSource>('darvish');

  // Get fetch limit based on interval
  const getFetchLimit = () => {
    switch (timeInterval.value) {
      case 'weekly': return 250; // ~1 year of weekly data
      case 'monthly': return 500; // ~2 years of monthly data
      default: return 120; // ~6 months of daily data
    }
  };

  // Computed: Aggregated stock data based on interval
  const stockData = computed<StockData[]>(() => {
    return aggregateData(rawStockData.value, timeInterval.value, (items) => {
      if (items.length === 0) return null;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      return {
        time: last.time, // Use last day of period as time
        open: first.open,
        high: Math.max(...items.map(d => d.high)),
        low: Math.min(...items.map(d => d.low)),
        close: last.close,
        volume: items.reduce((sum, d) => sum + d.volume, 0)
      };
    });
  });

  // DarvishSignal API State
  const stockList = ref<Stock[]>([]);
  const alphaPicks = ref<AlphaPickItem[]>([]);
  const sellAlerts = ref<SellAlertItem[]>([]);
  const availableDates = ref<string[]>([]);
  const selectedDate = ref<string>('');
  const alphaPickDate = ref<string>('');
  const signalMarkers = ref<SignalMarker[]>([]);
  const isLoadingMarkers = ref<boolean>(false);

  const { computeIndicators } = useTechnicalAnalysis();

  // Computed: Candlestick data for K-line chart
  const candlestickData = computed<CandlestickData[]>(() => {
    return stockData.value.map((d) => ({
      time: d.time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close
    }));
  });

  // Computed: Volume data with colors
  const volumeData = computed<VolumeData[]>(() => {
    return stockData.value.map((d) => ({
      time: d.time,
      value: d.volume,
      color: d.close >= d.open ? '#26a69a' : '#ef5350'
    }));
  });

  // Computed: MA5 line data
  const ma5Data = computed<LineData[]>(() => {
    if (!indicators.value) return [];
    return stockData.value
      .map((d, i) => ({
        time: d.time,
        value: indicators.value!.ma5[i]
      }))
      .filter((d): d is LineData => d.value !== null);
  });

  // Computed: MA20 line data
  const ma20Data = computed<LineData[]>(() => {
    if (!indicators.value) return [];
    return stockData.value
      .map((d, i) => ({
        time: d.time,
        value: indicators.value!.ma20[i]
      }))
      .filter((d): d is LineData => d.value !== null);
  });

  // Computed: KD data
  const kdData = computed<KDData[]>(() => {
    return indicators.value?.kd ?? [];
  });

  // API-provided indicators (computed from raw stockData with API fields)
  const rsiData = ref<RSIData[]>([]);
  const macdData = ref<MACDData[]>([]);
  const bollingerData = ref<BollingerData[]>([]);
  const institutionalData = ref<InstitutionalData[]>([]);
  const turnoverRateData = ref<TurnoverRateData[]>([]);
  const volumeMAData = ref<VolumeMAData[]>([]);
  const marginData = ref<MarginData[]>([]);
  const shortData = ref<ShortData[]>([]);
  const shortMarginRatioData = ref<ShortMarginRatioData[]>([]);

  // Actions
  const fetchStockData = async (id: string, startDate?: string) => {
    isLoading.value = true;
    error.value = null;
    signalMarkers.value = [];
    stockName.value = '';

    if (apiSource.value === 'darvish') {
      try {
        const limit = getFetchLimit();
        // Fetch stock info and history in parallel
        const [stockInfo, data] = await Promise.all([
          stockApi.getStockBySymbol(id).catch(() => null),
          stockApi.getStockHistory(id, limit)
        ]);

        if (stockInfo) {
          stockName.value = stockInfo.name;
        }
        // API returns newest-first, reverse to oldest-first for the chart
        const sorted = [...data].reverse();
        rawStockData.value = sorted.map((item) => ({
          time: item.trade_date,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume
        }));
        stockId.value = id;
        indicators.value = computeIndicators(rawStockData.value);

        // Extract API-provided indicators
        rsiData.value = sorted.map((item) => ({
          time: item.trade_date,
          rsi9: item.rsi_9 ?? null,
          rsi14: item.rsi_14 ?? null
        }));

        macdData.value = sorted.map((item) => ({
          time: item.trade_date,
          macd: item.macd ?? null,
          signal: item.macd_signal ?? null,
          histogram: item.macd_hist ?? null
        }));

        bollingerData.value = sorted.map((item) => ({
          time: item.trade_date,
          upper: item.bb_upper ?? null,
          middle: item.bb_middle ?? null,
          lower: item.bb_lower ?? null,
          percentB: item.bb_percent_b ?? null
        }));

        institutionalData.value = sorted.map((item) => ({
          time: item.trade_date,
          foreign: item.foreign_net ?? 0,
          trust: item.trust_net ?? 0,
          dealer: item.dealer_net ?? 0
        }));

        turnoverRateData.value = sorted.map((item) => ({
          time: item.trade_date,
          value: item.turnover_rate ?? null
        }));

        volumeMAData.value = sorted.map((item) => ({
          time: item.trade_date,
          ma5: item.vol_ma5 ?? null,
          ma10: item.vol_ma10 ?? null,
          ma20: item.vol_ma20 ?? null
        }));

        marginData.value = sorted.map((item) => ({
          time: item.trade_date,
          balance: item.margin_balance ?? null,
          change: null // API doesn't provide change, would need to calculate
        }));

        shortData.value = sorted.map((item) => ({
          time: item.trade_date,
          balance: item.short_balance ?? null,
          change: null // API doesn't provide change, would need to calculate
        }));

        shortMarginRatioData.value = sorted.map((item) => ({
          time: item.trade_date,
          value: item.short_margin_ratio ?? null
        }));

        // Fetch signal markers in background
        fetchSignalMarkers(id);
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to fetch from DarvishSignal API';
        console.error('Error fetching from DarvishSignal:', err);
      } finally {
        isLoading.value = false;
      }
    } else {
      // Use FinMind API
      const start = startDate ?? getDefaultStartDate();
      try {
        const response = await axios.get<FinMindResponse>(FINMIND_API_BASE, {
          params: {
            dataset: 'TaiwanStockPrice',
            data_id: id,
            start_date: start
          }
        });

        if (response.data.status !== 200) {
          throw new Error(response.data.msg || 'API request failed');
        }

        rawStockData.value = response.data.data.map((item) => ({
          time: item.date,
          open: item.open,
          high: item.max,
          low: item.min,
          close: item.close,
          volume: item.Trading_Volume
        }));

        stockId.value = id;
        indicators.value = computeIndicators(rawStockData.value);
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to fetch stock data';
        console.error('Error fetching stock data:', err);
      } finally {
        isLoading.value = false;
      }
    }
  };

  const searchStock = async (id: string) => {
    const trimmedId = id.trim();
    if (!trimmedId) return;
    await fetchStockData(trimmedId);
  };

  // Fetch buy/sell signal markers for the K-line chart
  const fetchSignalMarkers = async (symbol: string) => {
    isLoadingMarkers.value = true;
    try {
      const dates = await stockApi.getAlphaPickDates(30);

      // Fetch picks and sells for all dates in parallel
      const results = await Promise.all(
        dates.map(async (date) => {
          const [picksResp, sellsResp] = await Promise.all([
            stockApi.getAlphaPickByDate(date).catch(() => null),
            stockApi.getSellByDate(date).catch(() => null),
          ]);
          const isBuy = picksResp?.picks.some(p => p.symbol === symbol) ?? false;
          const isSell = sellsResp?.sells.some(s => s.symbol === symbol) ?? false;
          return { date, isBuy, isSell };
        })
      );

      const markers: SignalMarker[] = [];
      for (const r of results) {
        if (r.isBuy) markers.push({ date: r.date, type: 'buy' });
        else if (r.isSell) markers.push({ date: r.date, type: 'sell' });
      }
      // Sort by date ascending for the chart
      markers.sort((a, b) => a.date.localeCompare(b.date));
      signalMarkers.value = markers;
    } catch (err) {
      console.error('Error fetching signal markers:', err);
    } finally {
      isLoadingMarkers.value = false;
    }
  };

  // DarvishSignal API Actions
  const fetchStockList = async () => {
    try {
      stockList.value = await stockApi.getStockList();
    } catch (err) {
      console.error('Error fetching stock list:', err);
    }
  };

  const fetchAlphaPicks = async (date?: string) => {
    isLoading.value = true;
    try {
      const resp = date
        ? await stockApi.getAlphaPickByDate(date)
        : await stockApi.getAlphaPickLatest();
      alphaPicks.value = resp.picks;
      alphaPickDate.value = resp.trade_date;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch Alpha Picks';
      console.error('Error fetching Alpha Picks:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchSellAlerts = async (date?: string) => {
    try {
      const resp = date
        ? await stockApi.getSellByDate(date)
        : await stockApi.getSellLatest();
      sellAlerts.value = resp.sells;
    } catch (err) {
      console.error('Error fetching Sell Alerts:', err);
    }
  };

  const fetchAvailableDates = async () => {
    try {
      availableDates.value = await stockApi.getAlphaPickDates(60);
      if (availableDates.value.length > 0) {
        selectedDate.value = availableDates.value[0] as string;
      }
    } catch (err) {
      console.error('Error fetching available dates:', err);
    }
  };

  const setApiSource = (source: ApiSource) => {
    apiSource.value = source;
  };

  const setTimeInterval = async (interval: TimeInterval) => {
    if (timeInterval.value === interval) return;
    timeInterval.value = interval;
    // Refetch data with new limit if needed
    if (stockId.value) {
      await fetchStockData(stockId.value);
    }
  };

  const getDefaultStartDate = (): string => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return date.toISOString().split('T')[0] ?? '';
  };

  return {
    // State
    stockId,
    stockName,
    stockData,
    timeInterval,
    isLoading,
    isLoadingMarkers,
    error,
    indicators,
    apiSource,
    stockList,
    alphaPicks,
    sellAlerts,
    availableDates,
    selectedDate,
    alphaPickDate,
    signalMarkers,
    // Computed
    candlestickData,
    volumeData,
    ma5Data,
    ma20Data,
    kdData,
    rsiData,
    macdData,
    bollingerData,
    institutionalData,
    turnoverRateData,
    volumeMAData,
    marginData,
    shortData,
    shortMarginRatioData,
    // Actions
    fetchStockData,
    searchStock,
    fetchStockList,
    fetchAlphaPicks,
    fetchSellAlerts,
    fetchAvailableDates,
    setApiSource,
    setTimeInterval,
    fetchSignalMarkers,
  };
});
