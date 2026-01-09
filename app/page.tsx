'use client';

import { useState } from 'react';
import type { EChartsOption } from 'echarts';
import type { APISuccessResponse, APIErrorResponse } from './lib/types';
import { generateChart, getErrorMessage, isErrorCategory } from './lib/api-client';
import { ChartInput } from './components/chart-input';
import { ChartDisplay } from './components/chart-display';
import { LoadingIndicator } from './components/loading-indicator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function Home() {
  // State management
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<APIErrorResponse | null>(null);
  const [chartConfig, setChartConfig] = useState<EChartsOption | null>(null);
  const [metadata, setMetadata] = useState<APISuccessResponse['metadata'] | null>(null);
  const [layoutState, setLayoutState] = useState<'centered' | 'split'>('centered');

  // Handle chart generation
  const handleGenerateChart = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await generateChart({ prompt });

      if (response.success) {
        // Success - update chart config and metadata
        setChartConfig(response.config);
        setMetadata(response.metadata);
        setLayoutState('split');
        setError(null);
      } else {
        // Error response from API
        setError(response);
        setChartConfig(null);
        setMetadata(null);
      }
    } catch (err) {
      console.error('Failed to generate chart:', err);
      // Handle network or unexpected errors
      const errorResponse: APIErrorResponse = {
        success: false,
        error: 'server_error',
        message: '生成图表时发生错误，请稍后再试'
      };
      setError(errorResponse);
      setChartConfig(null);
      setMetadata(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle new chart request
  const handleNewChart = () => {
    setPrompt('');
    setChartConfig(null);
    setMetadata(null);
    setError(null);
    setLayoutState('centered');
  };

  // Determine if alert should be shown for "no_data" error
  const showNoDataAlert = error && isErrorCategory(error, 'no_data');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className={`text-center transition-all duration-300 ease-out ${layoutState === 'split' ? 'mb-6' : 'mb-12'}`}>
          <h1 className={`font-bold text-gray-800 transition-all duration-300 ease-out ${layoutState === 'split' ? 'text-3xl' : 'text-5xl mb-4'}`}>
            AI Charts
          </h1>
          {layoutState === 'centered' && (
            <p className="text-xl text-gray-600 animate-fade-in">
              用自然语言描述数据，AI 帮你生成精美图表
            </p>
          )}
        </div>

        {/* Layout Container with Transition */}
        <div className={`transition-all duration-300 ease-out will-change-[transform,opacity] ${
          layoutState === 'centered' 
            ? 'flex items-center justify-center min-h-[60vh]' 
            : 'grid grid-cols-1 lg:grid-cols-2 gap-6'
        }`}>
          {/* Input Section */}
          <div className={`transition-all duration-300 ease-out will-change-[max-width] ${
            layoutState === 'centered' 
              ? 'w-full max-w-2xl' 
              : 'w-full'
          }`}>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {layoutState === 'split' ? '调整图表' : '描述你的数据'}
              </h2>
              
              <ChartInput
                value={prompt}
                onChange={setPrompt}
                onSubmit={handleGenerateChart}
                isLoading={isLoading}
              />

              {/* No Data Alert */}
              {showNoDataAlert && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTitle>无法提取数据</AlertTitle>
                  <AlertDescription>
                    {error.message}
                  </AlertDescription>
                </Alert>
              )}

              {/* Other Errors Display */}
              {error && !showNoDataAlert && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-800">
                    {getErrorMessage(error)}
                  </p>
                  {error.details && (
                    <p className="text-xs text-red-600 mt-1">
                      {error.details}
                    </p>
                  )}
                </div>
              )}

              {/* Metadata Display */}
              {metadata && layoutState === 'split' && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">图表信息</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
                    <div>类型: {metadata.chartType}</div>
                    <div>数据点: {metadata.dataPointCount}</div>
                    <div>系列数: {metadata.seriesCount}</div>
                    <div>生成时间: {new Date(metadata.generatedAt).toLocaleTimeString('zh-CN')}</div>
                  </div>
                </div>
              )}

              {/* New Chart Button */}
              {layoutState === 'split' && (
                <Button
                  onClick={handleNewChart}
                  variant="outline"
                  className="w-full mt-4"
                >
                  创建新图表
                </Button>
              )}
            </div>

            {/* Example Prompts */}
            {layoutState === 'centered' && !isLoading && (
              <div className="mt-8 space-y-3">
                <p className="text-sm font-medium text-gray-600 text-center">试试这些示例：</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    '比较北京和上海: 北京 120、130、150, 上海 100、140、160',
                    '用柱状图展示: 1月 100, 2月 150, 3月 200',
                    '销售数据饼图: 产品A 30%, 产品B 45%, 产品C 25%'
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(example)}
                      className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    >
                      {example.length > 30 ? example.substring(0, 30) + '...' : example}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Chart Display Section */}
          {(isLoading || chartConfig || layoutState === 'split') && (
            <div className={`transition-all duration-300 ease-out delay-75 will-change-[opacity,transform] ${
              layoutState === 'centered' ? 'hidden' : 'block'
            }`}>
              {isLoading ? (
                <LoadingIndicator />
              ) : chartConfig ? (
                <ChartDisplay config={chartConfig} height="600px" />
              ) : (
                <div className="flex items-center justify-center h-[600px] bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-400">图表将在这里显示</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>支持折线图、柱状图、饼图、散点图和面积图</p>
          <p className="mt-1">最多支持 1000 个数据点 • 由 AI 驱动</p>
        </div>
      </div>
    </div>
  );
}
