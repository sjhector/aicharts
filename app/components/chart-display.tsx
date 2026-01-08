/**
 * Chart Display Component
 * 
 * Renders ECharts visualization using echarts-for-react
 * with dynamic import for bundle optimization
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import type { EChartsOption } from 'echarts';
import { ChartDownload } from './chart-download';

interface ChartDisplayProps {
  /** ECharts configuration object */
  config: EChartsOption;
  /** Height of the chart container */
  height?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: string | null;
  /** Show download button */
  showDownload?: boolean;
}

export function ChartDisplay({ 
  config, 
  height = '500px',
  isLoading = false,
  error = null,
  showDownload = true
}: ChartDisplayProps) {
  const [ReactECharts, setReactECharts] = useState<any>(null);
  const [chartInstance, setChartInstance] = useState<any>(null);
  const chartRef = useRef<any>(null);

  // Dynamically import echarts-for-react for code splitting
  useEffect(() => {
    import('echarts-for-react').then((module) => {
      setReactECharts(() => module.default);
    });
  }, []);

  // Resize chart on window resize
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        const instance = chartRef.current.getEchartsInstance();
        if (instance) {
          instance.resize();
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (error) {
      return (
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-center text-red-500">
            <p className="font-medium">图表加载失败</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-center text-gray-500">
            <div className="animate-spin text-4xl mb-2">⏳</div>
            <p>加载图表中...</p>
          </div>
        </div>
      );
    }

    if (!ReactECharts) {
      return (
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-gray-500">加载图表组件中...</div>
        </div>
      );
    }

    return (
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Download button */}
        {showDownload && (
          <div className="flex justify-end p-4 border-b border-gray-100">
            <ChartDownload chartInstance={chartInstance} filename="ai-chart" />
          </div>
        )}
        
        {/* Chart container */}
        <div className="p-4">
          <ReactECharts
            ref={(e: any) => {
              if (e) {
                chartRef.current = e;
                setChartInstance(e); // Update state when chart mounts
              }
            }}
            option={config}
            style={{ height, width: '100%' }}
            opts={{
              renderer: 'canvas',
              locale: 'ZH'
            }}
            notMerge={true}
            lazyUpdate={true}
          />
        </div>
      </div>
    );
}
