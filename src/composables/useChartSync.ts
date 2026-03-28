import type { IChartApi, MouseEventParams, ISeriesApi, SeriesType } from 'lightweight-charts';
import { ref, onUnmounted } from 'vue';

interface ChartWithSeries {
  chart: IChartApi;
  series: ISeriesApi<SeriesType> | null;
}

/**
 * Composable for synchronizing multiple charts
 * - Time scale sync: zoom and pan
 * - Crosshair sync: hover position (vertical line alignment)
 */
export function useChartSync() {
  const chartData = ref<ChartWithSeries[]>([]);
  let isSyncing = false;

  const addChart = (chart: IChartApi, series?: ISeriesApi<SeriesType>) => {
    const exists = chartData.value.some(cd => cd.chart === chart);
    if (!exists) {
      chartData.value.push({ chart, series: series ?? null });
      setupTimeScaleSync(chart);
    }
  };

  // Update series for existing chart (needed for crosshair sync)
  const updateChartSeries = (chart: IChartApi, series: ISeriesApi<SeriesType>) => {
    const chartEntry = chartData.value.find(cd => cd.chart === chart);
    if (chartEntry) {
      chartEntry.series = series;
    }
  };

  const removeChart = (chart: IChartApi) => {
    const index = chartData.value.findIndex(cd => cd.chart === chart);
    if (index > -1) {
      chartData.value.splice(index, 1);
    }
  };

  const setupTimeScaleSync = (sourceChart: IChartApi) => {
    const timeScale = sourceChart.timeScale();

    timeScale.subscribeVisibleLogicalRangeChange((logicalRange) => {
      if (isSyncing || !logicalRange) return;

      isSyncing = true;

      chartData.value.forEach((cd) => {
        if (cd.chart !== sourceChart) {
          cd.chart.timeScale().setVisibleLogicalRange(logicalRange);
        }
      });

      isSyncing = false;
    });
  };

  const syncCrosshair = (sourceChart: IChartApi, param: MouseEventParams) => {
    if (isSyncing) return;

    isSyncing = true;

    chartData.value.forEach((cd) => {
      if (cd.chart !== sourceChart) {
        if (param.time && cd.series) {
          // Use NaN as price to only show vertical line (not horizontal)
          cd.chart.setCrosshairPosition(NaN, param.time, cd.series);
        } else {
          cd.chart.clearCrosshairPosition();
        }
      }
    });

    isSyncing = false;
  };

  const clearAllCrosshairs = () => {
    chartData.value.forEach((cd) => {
      cd.chart.clearCrosshairPosition();
    });
  };

  onUnmounted(() => {
    chartData.value = [];
  });

  return {
    charts: chartData,
    addChart,
    updateChartSeries,
    removeChart,
    syncCrosshair,
    clearAllCrosshairs
  };
}
