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
import type { APIRequest, APIResponse, APIErrorResponse, APISuccessResponse } from '../../lib/types';
import { getChartGenerationPrompt } from '../../lib/llm-prompts';
import { 
  validateEChartsConfig, 
  validateDataPointLimit,
  countDataPoints,
  extractChartType,
  formatEChartsConfig,
  createExtractedDataFromConfig
} from '../../lib/echarts-config';

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
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();
  
  try {
    // Parse and validate request body
    const body = await request.json() as APIRequest;
    
    console.log(`[${requestId}] Request received at ${new Date().toISOString()}`);
    console.log(`[${requestId}] Prompt length: ${body.prompt?.length || 0} chars`);
    console.log(`[${requestId}] Request body:`, JSON.stringify(body));
    
    // Validate prompt
    if (!body.prompt || typeof body.prompt !== 'string') {
      console.warn(`[${requestId}] Validation failed: Missing or invalid prompt type`);
      const errorResponse: APIErrorResponse = {
        success: false,
        error: 'invalid_request',
        message: 'Prompt is required and must be a string'
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Check prompt length
    if (body.prompt.length > CONFIG.maxPromptLength) {
      console.warn(`[${requestId}] Validation failed: Prompt length ${body.prompt.length} exceeds max ${CONFIG.maxPromptLength}`);
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
      console.warn(`[${requestId}] Validation failed: Empty prompt after trimming`);
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
    const llmStartTime = Date.now();
    try {
      console.log(`[${requestId}] Calling LLM API with model: ${CONFIG.model}`);
      completion = await client.chat.completions.create({
        model: CONFIG.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        // Note: DashScope qwen-max may not fully support response_format
        // Relying on system prompt to ensure JSON output
        max_tokens: CONFIG.maxTokens,
        temperature: CONFIG.temperature
      });
      const llmDuration = Date.now() - llmStartTime;
      console.log(`[${requestId}] LLM API responded in ${llmDuration}ms`);
      console.log(`[${requestId}] Tokens used - prompt: ${completion.usage?.prompt_tokens}, completion: ${completion.usage?.completion_tokens}, total: ${completion.usage?.total_tokens}`);
    } catch (llmError) {
      const llmDuration = Date.now() - llmStartTime;
      console.error(`[${requestId}] LLM API Error after ${llmDuration}ms:`, llmError);
      console.error(`[${requestId}] Error details:`, {
        name: llmError instanceof Error ? llmError.name : 'Unknown',
        message: llmError instanceof Error ? llmError.message : 'Unknown error',
        stack: llmError instanceof Error ? llmError.stack : undefined
      });
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
      console.error(`[${requestId}] LLM returned empty response`);
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
      console.log(`[${requestId}] Successfully parsed LLM response`);
      console.log(`[${requestId}] Response structure:`, JSON.stringify(parsedResponse, null, 2));
    } catch (parseError) {
      console.error(`[${requestId}] JSON parse error:`, parseError);
      console.error(`[${requestId}] Raw LLM response:`, responseContent);
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
      console.log(`[${requestId}] LLM returned no_data error`);
      const errorResponse: APIErrorResponse = {
        success: false,
        error: 'no_data',
        message: parsedResponse.message || '无法从输入中提取数据，请提供包含数值的描述'
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validate ECharts configuration
    const validation = validateEChartsConfig(parsedResponse);
    console.log(`[${requestId}] Validation result:`, validation);
    if (!validation.isValid) {
      console.warn(`[${requestId}] ECharts validation failed:`, validation.errors);
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
      console.warn(`[${requestId}] Data point limit exceeded:`, pointLimitValidation.errors);
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
    const totalDuration = Date.now() - startTime;
    console.log(`[${requestId}] Request completed successfully in ${totalDuration}ms`);
    console.log(`[${requestId}] Chart metadata:`, { chartType, dataPointCount, seriesCount });
    
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
    const totalDuration = Date.now() - startTime;
    console.error(`[${requestId}] Unexpected error after ${totalDuration}ms:`, error);
    console.error(`[${requestId}] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
    console.error(`[${requestId}] Request context:`, {
      timestamp: new Date().toISOString(),
      duration: totalDuration,
      errorType: error instanceof Error ? error.constructor.name : typeof error
    });
    
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
