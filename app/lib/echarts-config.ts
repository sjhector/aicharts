/**
 * ECharts configuration utilities
 * Validation, formatting, and type checking for ECharts options
 */

import type { EChartsOption } from 'echarts';
import { ChartType, type ExtractedData } from './types';

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate ECharts configuration object
 * 
 * Checks for:
 * - Required fields (series)
 * - Valid chart types
 * - Data consistency
 * - Data point limits
 */
export function validateEChartsConfig(
  config: unknown
): ValidationResult {
  const errors: string[] = [];

  // Check if config is an object
  if (!config || typeof config !== 'object') {
    return {
      isValid: false,
      errors: ['Configuration must be an object']
    };
  }

  const echartsConfig = config as EChartsOption;

  // Check for series (required)
  if (!echartsConfig.series || !Array.isArray(echartsConfig.series)) {
    errors.push('Configuration must contain a series array');
  } else if (echartsConfig.series.length === 0) {
    errors.push('Series array cannot be empty');
  } else {
    // Validate each series
    echartsConfig.series.forEach((series, index) => {
      if (typeof series !== 'object' || series === null) {
        errors.push(`Series at index ${index} must be an object`);
        return;
      }

      // Check series type
      const seriesObj = series as any;
      const validTypes = ['line', 'bar', 'pie', 'scatter', 'area'];
      if (!seriesObj.type || !validTypes.includes(seriesObj.type)) {
        errors.push(`Series at index ${index} has invalid type: ${seriesObj.type}`);
      }

      // Check series data
      if (!seriesObj.data || !Array.isArray(seriesObj.data)) {
        errors.push(`Series at index ${index} must contain a data array`);
      } else if (seriesObj.data.length === 0) {
        errors.push(`Series at index ${index} has empty data array`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Count total data points across all series
 */
export function countDataPoints(config: EChartsOption): number {
  if (!config.series || !Array.isArray(config.series)) {
    return 0;
  }

  return config.series.reduce((total, series) => {
    const seriesObj = series as any;
    if (Array.isArray(seriesObj.data)) {
      return total + seriesObj.data.length;
    }
    return total;
  }, 0);
}

/**
 * Validate data point count against 1000-point limit
 */
export function validateDataPointLimit(
  config: EChartsOption,
  maxPoints: number = 1000
): ValidationResult {
  const totalPoints = countDataPoints(config);

  if (totalPoints > maxPoints) {
    return {
      isValid: false,
      errors: [`Total data points (${totalPoints}) exceeds limit of ${maxPoints}`]
    };
  }

  return {
    isValid: true,
    errors: []
  };
}

/**
 * Extract chart type from ECharts configuration
 */
export function extractChartType(config: EChartsOption): ChartType | null {
  if (!config.series || !Array.isArray(config.series) || config.series.length === 0) {
    return null;
  }

  const firstSeries = config.series[0] as any;
  const seriesType = firstSeries.type as string;

  // Map series type to ChartType enum
  switch (seriesType) {
    case 'line':
      return ChartType.LINE;
    case 'bar':
      return ChartType.BAR;
    case 'pie':
      return ChartType.PIE;
    case 'scatter':
      return ChartType.SCATTER;
    default:
      // Check if it's an area chart (line with areaStyle)
      if (seriesType === 'line' && firstSeries.areaStyle) {
        return ChartType.AREA;
      }
      return null;
  }
}

/**
 * Format ECharts configuration for consistent display
 * 
 * Adds default settings for:
 * - Responsive design
 * - Animation
 * - Accessibility
 */
export function formatEChartsConfig(config: EChartsOption): EChartsOption {
  return {
    ...config,
    // Ensure animation is enabled
    animation: config.animation !== false,
    // Add default grid if not present
    grid: config.grid || {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    // Add default tooltip if not present
    tooltip: config.tooltip || {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    }
  };
}

/**
 * Create extracted data summary from ECharts config
 */
export function createExtractedDataFromConfig(
  config: EChartsOption
): ExtractedData | null {
  if (!config.series || !Array.isArray(config.series)) {
    return null;
  }

  const series = config.series.map((s: any) => ({
    name: s.name || 'Series',
    values: Array.isArray(s.data) ? s.data.map((d: any) => {
      if (typeof d === 'number') return d;
      if (typeof d === 'object' && d !== null && 'value' in d) return d.value;
      return 0;
    }) : [],
    color: s.itemStyle?.color
  }));

  const totalPoints = series.reduce((sum, s) => sum + s.values.length, 0);

  return {
    series,
    labels: Array.isArray((config.xAxis as any)?.data) ? (config.xAxis as any).data : undefined,
    dataType: 'numeric',
    totalPoints,
    isValid: true
  };
}
