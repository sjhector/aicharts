/**
 * Loading Indicator Component
 * 
 * Displays an animated loading state during chart generation
 */

'use client';

export function LoadingIndicator() {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      {/* Animated spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
      </div>
      
      {/* Loading text */}
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-gray-700">
          正在生成图表...
        </p>
        <p className="text-sm text-gray-500">
          AI 正在分析您的数据并创建可视化
        </p>
      </div>

      {/* Animated dots */}
      <div className="flex space-x-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}
