import type { StockData, KDData } from '../types';

/**
 * Calculate Moving Average
 */
export function calculateMA(data: StockData[], period: number): (number | null)[] {
  const result: (number | null)[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        const item = data[i - j];
        if (item) {
          sum += item.close;
        }
      }
      result.push(parseFloat((sum / period).toFixed(2)));
    }
  }

  return result;
}

/**
 * Calculate KD Indicator (9, 3, 3)
 * RSV = (Close - L9) / (H9 - L9) * 100
 * K = K(t-1) * 2/3 + RSV * 1/3
 * D = D(t-1) * 2/3 + K * 1/3
 * Initial K, D = 50
 */
export function calculateKD(
  data: StockData[],
  rsvPeriod: number = 9,
  kSmooth: number = 3,
  dSmooth: number = 3
): KDData[] {
  const result: KDData[] = [];
  let prevK = 50;
  let prevD = 50;

  for (let i = 0; i < data.length; i++) {
    const currentData = data[i];
    if (!currentData) continue;

    if (i < rsvPeriod - 1) {
      // Not enough data for RSV calculation, use initial values
      result.push({
        time: currentData.time,
        k: 50,
        d: 50
      });
      continue;
    }

    // Calculate highest high and lowest low in the period
    let highestHigh = -Infinity;
    let lowestLow = Infinity;

    for (let j = 0; j < rsvPeriod; j++) {
      const idx = i - j;
      const item = data[idx];
      if (item) {
        highestHigh = Math.max(highestHigh, item.high);
        lowestLow = Math.min(lowestLow, item.low);
      }
    }

    // Calculate RSV
    const currentClose = currentData.close;
    const range = highestHigh - lowestLow;
    const rsv = range === 0 ? 50 : ((currentClose - lowestLow) / range) * 100;

    // Calculate K and D with smoothing
    // K = prevK * (kSmooth - 1) / kSmooth + RSV * 1 / kSmooth
    // D = prevD * (dSmooth - 1) / dSmooth + K * 1 / dSmooth
    const k = prevK * ((kSmooth - 1) / kSmooth) + rsv * (1 / kSmooth);
    const d = prevD * ((dSmooth - 1) / dSmooth) + k * (1 / dSmooth);

    result.push({
      time: currentData.time,
      k: parseFloat(k.toFixed(2)),
      d: parseFloat(d.toFixed(2))
    });

    prevK = k;
    prevD = d;
  }

  return result;
}

/**
 * Composable for technical analysis
 */
export function useTechnicalAnalysis() {
  const computeIndicators = (data: StockData[]) => {
    return {
      ma5: calculateMA(data, 5),
      ma20: calculateMA(data, 20),
      kd: calculateKD(data, 9, 3, 3)
    };
  };

  return {
    calculateMA,
    calculateKD,
    computeIndicators
  };
}
