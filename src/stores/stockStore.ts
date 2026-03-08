import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import type { StockData, FinMindResponse, TechnicalIndicators, CandlestickData, LineData, VolumeData, KDData } from '../types';
import { useTechnicalAnalysis } from '../composables/useTechnicalAnalysis';
import { stockApi, type AlphaPick, type Stock } from '../api/stockApi';

const FINMIND_API_BASE = 'https://api.finmindtrade.com/api/v4/data';

// API Source toggle
export type ApiSource = 'finmind' | 'darvish'

export const useStockStore = defineStore('stock', () => {
  // State
  const stockId = ref<string>('2330');
  const stockData = ref<StockData[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const indicators = ref<TechnicalIndicators | null>(null);
  
  // API Source
  const apiSource = ref<ApiSource>('darvish');
  
  // DarvishSignal API State
  const stockList = ref<Stock[]>([]);
  const alphaPicks = ref<AlphaPick[]>([]);
  const availableDates = ref<string[]>([]);
  const selectedDate = ref<string>('');

  // Technical analysis composable
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

  // Computed: Arbitrage opportunities from Alpha Picks
  const arbitrageOpportunities = computed(() => {
    return alphaPicks.value.filter(pick => pick.signal === 'BUY');
  });

  // Actions
  const fetchStockData = async (id: string, startDate?: string) => {
    isLoading.value = true;
    error.value = null;

    if (apiSource.value === 'darvish') {
      // Use DarvishSignal API
      try {
        const data = await stockApi.getStockHistory(id, 60);
        stockData.value = data.map((item) => ({
          time: item.date,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume
        }));
        stockId.value = id;
        indicators.value = computeIndicators(stockData.value);
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

        stockData.value = response.data.data.map((item) => ({
          time: item.date,
          open: item.open,
          high: item.max,
          low: item.min,
          close: item.close,
          volume: item.Trading_Volume
        }));

        stockId.value = id;
        indicators.value = computeIndicators(stockData.value);
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
      if (date) {
        alphaPicks.value = await stockApi.getAlphaPickByDate(date);
      } else {
        alphaPicks.value = await stockApi.getAlphaPickLatest();
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch Alpha Picks';
      console.error('Error fetching Alpha Picks:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchAvailableDates = async () => {
    try {
      availableDates.value = await stockApi.getAlphaPickDates();
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

  // Helper function to get default start date (1 year ago)
  const getDefaultStartDate = (): string => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    const isoString = date.toISOString();
    return isoString.split('T')[0] ?? isoString.substring(0, 10);
  };

  return {
    // State
    stockId,
    stockData,
    isLoading,
    error,
    indicators,
    apiSource,
    stockList,
    alphaPicks,
    availableDates,
    selectedDate,
    // Computed
    candlestickData,
    volumeData,
    ma5Data,
    ma20Data,
    kdData,
    arbitrageOpportunities,
    // Actions
    fetchStockData,
    searchStock,
    fetchStockList,
    fetchAlphaPicks,
    fetchAvailableDates,
    setApiSource
  };
});
