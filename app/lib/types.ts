/**
 * TypeScript type definitions for AI Charts application
 * Based on data-model.md specifications
 */

import type { EChartsOption } from 'echarts';

// ============================================================================
// Chart Type Enumeration
// ============================================================================

/**
 * Supported chart types for AI-generated visualizations
 */
export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  PIE = 'pie',
  SCATTER = 'scatter',
  AREA = 'area'
}

// ============================================================================
// Core Data Structures
// ============================================================================

/**
 * User input containing the natural language prompt for chart generation
 */
export interface ChartPrompt {
  /** The natural language text describing desired chart and data */
  text: string;
  /** Language of the prompt (e.g., 'zh-CN', 'en-US') */
  language?: string;
  /** Timestamp when prompt was submitted */
  timestamp: Date;
  /** Optional session identifier (for stateless tracking) */
  sessionId?: string;
}

/**
 * Single data series with name and values
 */
export interface DataSeries {
  /** Name of the series (e.g., "北京", "上海") */
  name: string;
  /** Array of numeric values for the series */
  values: number[];
  /** Optional color assignment for the series */
  color?: string;
}

/**
 * Extracted and parsed data from user prompt
 */
export interface ExtractedData {
  /** Array of data series extracted from the prompt */
  series: DataSeries[];
  /** Optional labels for x-axis or categories */
  labels?: string[];
  /** Detected data type (numeric, categorical, time-series) */
  dataType: 'numeric' | 'categorical' | 'time-series';
  /** Total number of data points across all series */
  totalPoints: number;
  /** Validation status of extracted data */
  isValid: boolean;
  /** Error messages if validation fails */
  validationErrors?: string[];
}

/**
 * Complete ECharts configuration object
 * Extends EChartsOption from echarts library
 */
export interface ChartConfiguration {
  /** ECharts configuration object */
  config: EChartsOption;
  /** Detected or specified chart type */
  chartType: ChartType;
  /** Original extracted data used to generate config */
  extractedData: ExtractedData;
  /** Additional metadata */
  metadata: {
    /** Total data points in visualization */
    dataPointCount: number;
    /** Number of series displayed */
    seriesCount: number;
    /** Whether data was truncated due to 1000-point limit */
    wasTruncated: boolean;
    /** Generation timestamp */
    generatedAt: Date;
  };
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * Request payload for chart generation API
 */
export interface APIRequest {
  /** Natural language prompt from user */
  prompt: string;
  /** Optional session ID for tracking */
  sessionId?: string;
}

/**
 * Successful API response with chart configuration
 */
export interface APISuccessResponse {
  /** Success status */
  success: true;
  /** Generated ECharts configuration */
  config: EChartsOption;
  /** Metadata about the generated chart */
  metadata: {
    chartType: ChartType;
    dataPointCount: number;
    seriesCount: number;
    wasTruncated: boolean;
    generatedAt: string; // ISO date string
  };
}

/**
 * Error categories for API responses
 */
export type APIErrorCategory = 
  | 'no_data'           // No extractable data in prompt
  | 'validation_failed' // Data validation failed
  | 'rate_limit'        // Rate limit exceeded
  | 'server_error'      // Internal server error
  | 'timeout'           // Request timeout
  | 'invalid_request';  // Malformed request

/**
 * Error API response
 */
export interface APIErrorResponse {
  /** Error status */
  success: false;
  /** Error category */
  error: APIErrorCategory;
  /** Human-readable error message */
  message: string;
  /** Optional additional error details */
  details?: string;
}

/**
 * Union type for all API responses
 */
export type APIResponse = APISuccessResponse | APIErrorResponse;

// ============================================================================
// UI State Types
// ============================================================================

/**
 * Application state for the homepage
 */
export interface AppState {
  /** Current user prompt */
  prompt: string;
  /** Loading state during API call */
  isLoading: boolean;
  /** Error state */
  error: APIErrorResponse | null;
  /** Generated chart configuration */
  chartConfig: EChartsOption | null;
  /** Metadata from successful generation */
  metadata: APISuccessResponse['metadata'] | null;
  /** Layout state (input-centered vs split-view) */
  layoutState: 'centered' | 'split';
}

// ============================================================================
// Utility Type Guards
// ============================================================================

/**
 * Type guard to check if API response is successful
 */
export function isSuccessResponse(response: APIResponse): response is APISuccessResponse {
  return response.success === true;
}

/**
 * Type guard to check if API response is an error
 */
export function isErrorResponse(response: APIResponse): response is APIErrorResponse {
  return response.success === false;
}

/**
 * Validate that a chart type string is a valid ChartType enum value
 */
export function isValidChartType(type: string): type is ChartType {
  return Object.values(ChartType).includes(type as ChartType);
}
