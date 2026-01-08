/**
 * Chart Download Component
 * 
 * Provides functionality to download generated charts as PNG images
 * using ECharts' built-in export capabilities
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ChartDownloadProps {
  /** Reference to the ECharts instance (from echarts-for-react) */
  chartInstance: any;
  /** Custom filename (without extension) */
  filename?: string;
  /** Disabled state */
  disabled?: boolean;
}

export function ChartDownload({ 
  chartInstance, 
  filename = 'chart',
  disabled = false
}: ChartDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!chartInstance || disabled) return;

    setIsDownloading(true);

    try {
      // Get the ECharts instance
      const echartsInstance = chartInstance.getEchartsInstance();

      // Generate image with high DPI for better quality
      const imageDataURL = echartsInstance.getDataURL({
        type: 'png',
        pixelRatio: 2, // 2x resolution for retina displays
        backgroundColor: '#ffffff' // White background
      });

      // Create download link
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      link.download = `${filename}-${timestamp}.png`;
      link.href = imageDataURL;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Small delay to show feedback
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Failed to download chart:', error);
      alert('下载图表失败，请稍后再试');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={!chartInstance || disabled || isDownloading}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isDownloading ? (
        <>
          <span className="animate-spin">⏳</span>
          <span>下载中...</span>
        </>
      ) : (
        <>
          <span>📥</span>
          <span>下载图表</span>
        </>
      )}
    </Button>
  );
}
