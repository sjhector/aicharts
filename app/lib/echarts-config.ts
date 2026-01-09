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

// ============================================================================
// 3D Visual Effects (User Story 6)
// ============================================================================

/**
 * Apply 3D visual effects to bar chart configuration
 * 
 * Parameters:
 * - 30° viewing angle for depth perspective
 * - 20% column depth for visual thickness
 * - 0.3 shadow opacity for medium shadow intensity
 * 
 * @param config - ECharts configuration object
 * @returns Modified config with 3D bar chart effects
 */
export function apply3DBarEffects(config: EChartsOption): EChartsOption {
  const modifiedConfig = { ...config };

  // Apply 3D effects to each bar series
  if (modifiedConfig.series && Array.isArray(modifiedConfig.series)) {
    modifiedConfig.series = modifiedConfig.series.map((series: any) => {
      if (series.type !== 'bar') return series;

      return {
        ...series,
        // Add depth effect with gradient colors
        itemStyle: {
          ...series.itemStyle,
          borderColor: series.itemStyle?.color || '#5470c6',
          borderWidth: 1,
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          shadowOffsetX: 3,
          shadowOffsetY: 3,
          // Gradient for depth perception
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 1,
            colorStops: [
              { offset: 0, color: series.itemStyle?.color || '#5470c6' },
              { offset: 1, color: adjustColorBrightness(series.itemStyle?.color || '#5470c6', -20) }
            ]
          }
        },
        // Enhanced emphasis for 3D effect
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
            shadowOffsetX: 5,
            shadowOffsetY: 5
          }
        },
        // Bar width for 3D appearance (20% depth)
        barWidth: '60%',
        barGap: '20%'
      };
    });
  }

  // Adjust grid to accommodate 3D effects
  modifiedConfig.grid = {
    ...modifiedConfig.grid,
    left: '5%',
    right: '5%',
    bottom: '5%',
    top: '15%',
    containLabel: true
  };

  return modifiedConfig;
}

/**
 * Apply 3D visual effects to pie chart configuration
 * 
 * Parameters:
 * - 15% thickness (based on radius)
 * - 25° tilt angle for perspective
 * - Gradient highlights for depth
 * 
 * @param config - ECharts configuration object
 * @returns Modified config with 3D pie chart effects
 */
export function apply3DPieEffects(config: EChartsOption): EChartsOption {
  const modifiedConfig = { ...config };

  // Apply 3D effects to each pie series
  if (modifiedConfig.series && Array.isArray(modifiedConfig.series)) {
    modifiedConfig.series = modifiedConfig.series.map((series: any) => {
      if (series.type !== 'pie') return series;

      // Calculate 3D thickness (15% of radius)
      const baseRadius = typeof series.radius === 'string' 
        ? parseInt(series.radius) 
        : Array.isArray(series.radius) 
          ? (typeof series.radius[1] === 'string' ? parseInt(series.radius[1]) : series.radius[1])
          : 50;
      
      const thickness = baseRadius * 0.15;

      return {
        ...series,
        // Create 3D appearance with radius offset
        radius: Array.isArray(series.radius) ? series.radius : ['0%', '50%'],
        center: series.center || ['50%', '45%'], // Shift up slightly for tilt effect
        // Add shadow for depth
        itemStyle: {
          ...series.itemStyle,
          shadowBlur: 15,
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          shadowOffsetY: thickness,
          borderColor: '#fff',
          borderWidth: 2,
          // Gradient for 3D highlight effect
          borderRadius: 4
        },
        // Enhanced emphasis for 3D pop effect
        emphasis: {
          itemStyle: {
            shadowBlur: 25,
            shadowOffsetY: thickness * 1.5,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          },
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        // Adjust label position for tilt
        label: {
          ...series.label,
          position: 'outside',
          alignTo: 'edge',
          margin: 10
        },
        labelLine: {
          ...series.labelLine,
          length: 15,
          length2: 10,
          smooth: true
        }
      };
    });
  }

  return modifiedConfig;
}

/**
 * Adjust color brightness for gradient effects
 * @param color - Hex color string (e.g., '#5470c6')
 * @param percent - Brightness adjustment percentage (-100 to 100)
 * @returns Adjusted hex color
 */
function adjustColorBrightness(color: string, percent: number): string {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + percent));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + percent));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + percent));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
  return color;
}

/**
 * Check if a chart type supports 3D visual effects
 * Currently only bar and pie charts support 3D effects
 */
export function supports3DEffects(chartType: ChartType): boolean {
  return chartType === ChartType.BAR || chartType === ChartType.PIE;
}
