/**
 * API Route: Generate Chart from Natural Language
 * 
 * POST /api/generate-chart
 * 
 * This endpoint receives natural language prompts and generates
 * ECharts configurations using DashScope/Qwen LLM.
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { EChartsOption } from 'echarts';
import type { APIRequest, APIResponse, APIErrorResponse, APISuccessResponse } from '@/app/lib/types';
import { getChartGenerationPrompt } from '@/app/lib/llm-prompts';
import { 
  validateEChartsConfig, 
  validateDataPointLimit,
  countDataPoints,
  extractChartType,
  formatEChartsConfig,
  createExtractedDataFromConfig
} from '@/app/lib/echarts-config';

// Initialize OpenAI client with DashScope configuration
const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
});

// Configuration
const CONFIG = {
  model: 'qwen-max',
  maxTokens: 4000,
  temperature: 0.7,
  timeout: 25000, // 25 seconds
  maxPromptLength: 2000,
  maxDataPoints: 1000
};

/**
 * POST handler for chart generation
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json() as APIRequest;
    
    // Validate prompt
    if (!body.prompt || typeof body.prompt !== 'string') {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: 'invalid_request',
        message: 'Prompt is required and must be a string'
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Check prompt length
    if (body.prompt.length > CONFIG.maxPromptLength) {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: 'invalid_request',
        message: `Prompt exceeds maximum length of ${CONFIG.maxPromptLength} characters`
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Trim prompt
    const userPrompt = body.prompt.trim();
    if (userPrompt.length === 0) {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: 'invalid_request',
        message: 'Prompt cannot be empty'
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Call LLM with system prompt and user input
    const systemPrompt = getChartGenerationPrompt();
    
    let completion;
    try {
      completion = await client.chat.completions.create({
        model: CONFIG.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        max_tokens: CONFIG.maxTokens,
        temperature: CONFIG.temperature
      });
    } catch (llmError) {
      console.error('LLM API Error:', llmError);
      const errorResponse: APIErrorResponse = {
        success: false,
        error: 'server_error',
        message: 'Failed to generate chart configuration',
        details: llmError instanceof Error ? llmError.message : 'Unknown LLM error'
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Extract response content
    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: 'server_error',
        message: 'LLM returned empty response'
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Parse JSON response
    let parsedResponse: any;
    try {
      parsedResponse = JSON.parse(responseContent);
    } catch (parseError) {
      console.error('Failed to parse LLM response:', responseContent);
      const errorResponse: APIErrorResponse = {
        success: false,
        error: 'server_error',
        message: 'Failed to parse chart configuration',
        details: 'Invalid JSON response from LLM'
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Check for "no_data" error from LLM
    if (parsedResponse.error === 'no_data') {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: 'no_data',
        message: parsedResponse.message || '无法从输入中提取数据，请提供包含数值的描述'
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validate ECharts configuration
    const validation = validateEChartsConfig(parsedResponse);
    if (!validation.isValid) {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: 'validation_failed',
        message: 'Generated chart configuration is invalid',
        details: validation.errors.join('; ')
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const echartsConfig = parsedResponse as EChartsOption;

    // Validate data point limit
    const pointLimitValidation = validateDataPointLimit(echartsConfig, CONFIG.maxDataPoints);
    if (!pointLimitValidation.isValid) {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: 'validation_failed',
        message: `数据点数量超过限制（最多${CONFIG.maxDataPoints}个）`,
        details: pointLimitValidation.errors.join('; ')
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Format configuration for optimal display
    const formattedConfig = formatEChartsConfig(echartsConfig);

    // Extract metadata
    const chartType = extractChartType(formattedConfig);
    const dataPointCount = countDataPoints(formattedConfig);
    const extractedData = createExtractedDataFromConfig(formattedConfig);
    const seriesCount = extractedData?.series.length || 0;

    // Prepare success response
    const successResponse: APISuccessResponse = {
      success: true,
      config: formattedConfig,
      metadata: {
        chartType: chartType || 'line' as any,
        dataPointCount,
        seriesCount,
        wasTruncated: false,
        generatedAt: new Date().toISOString()
      }
    };

    return NextResponse.json(successResponse, { status: 200 });

  } catch (error) {
    // Handle unexpected errors
    console.error('Unexpected error in generate-chart API:', error);
    
    const errorResponse: APIErrorResponse = {
      success: false,
      error: 'server_error',
      message: 'An unexpected error occurred',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * GET handler - return API documentation
 */
export async function GET() {
  return NextResponse.json({
    message: 'AI Charts API - Generate Chart Endpoint',
    method: 'POST',
    endpoint: '/api/generate-chart',
    documentation: 'Send a POST request with { prompt: string, sessionId?: string }',
    example: {
      prompt: '比较北京和上海的销售额：北京是120、130、150，上海是100、140、160'
    }
  });
}
