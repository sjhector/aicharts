/**
 * API Client utilities for frontend-backend communication
 * Provides type-safe fetch wrappers and error handling
 */

import type { APIRequest, APIResponse, APIErrorResponse } from './types';

/**
 * Base API configuration
 */
const API_CONFIG = {
  baseUrl: '/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json'
  }
};

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public errorResponse: APIErrorResponse,
    message?: string
  ) {
    super(message || errorResponse.message);
    this.name = 'APIError';
  }
}

/**
 * Fetch wrapper with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

/**
 * Generate chart from natural language prompt
 * 
 * @param request - API request with prompt and optional sessionId
 * @returns API response with chart config or error
 * @throws APIError if request fails
 */
export async function generateChart(request: APIRequest): Promise<APIResponse> {
  try {
    const response = await fetchWithTimeout(
      `${API_CONFIG.baseUrl}/generate-chart`,
      {
        method: 'POST',
        headers: API_CONFIG.headers,
        body: JSON.stringify(request)
      },
      API_CONFIG.timeout
    );

    const data = await response.json();

    if (!response.ok) {
      throw new APIError(
        response.status,
        data as APIErrorResponse,
        `API request failed with status ${response.status}`
      );
    }

    return data as APIResponse;
  } catch (error) {
    // Handle network errors, timeout, or JSON parsing errors
    if (error instanceof APIError) {
      throw error;
    }

    // Convert other errors to APIErrorResponse format
    const errorResponse: APIErrorResponse = {
      success: false,
      error: 'server_error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error instanceof Error ? error.stack : undefined
    };

    throw new APIError(500, errorResponse);
  }
}

/**
 * Check if error is a specific error category
 */
export function isErrorCategory(
  error: APIErrorResponse,
  category: APIErrorResponse['error']
): boolean {
  return error.error === category;
}

/**
 * Get user-friendly error message based on error category
 */
export function getErrorMessage(error: APIErrorResponse): string {
  switch (error.error) {
    case 'no_data':
      return '无法从输入中提取数据。请提供包含数值的描述，例如："比较北京和上海的销售额，北京是120、130、150，上海是100、140、160"';
    case 'validation_failed':
      return '数据验证失败。请检查输入数据格式是否正确。';
    case 'rate_limit':
      return '请求过于频繁，请稍后再试。';
    case 'timeout':
      return '请求超时，请稍后再试。';
    case 'invalid_request':
      return '请求格式不正确，请检查输入。';
    case 'server_error':
    default:
      return error.message || '服务器错误，请稍后再试。';
  }
}
