/**
 * Chart Input Component
 * 
 * Provides a textarea for user to enter natural language prompts
 * and a button to generate charts
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChartInputProps {
  /** Current prompt value */
  value: string;
  /** Callback when prompt changes */
  onChange: (value: string) => void;
  /** Callback when form is submitted */
  onSubmit: () => void;
  /** Loading state */
  isLoading: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
}

export function ChartInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  disabled = false,
  placeholder = '描述你想要创建的图表，例如："比较北京和上海的销售额，北京是120、130、150，上海是100、140、160"'
}: ChartInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
      onSubmit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="space-y-4">
        <div className={`
          rounded-lg border-2 transition-all duration-200
          ${isFocused ? 'border-blue-500 shadow-lg' : 'border-gray-200'}
        `}>
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            className="min-h-[120px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
            aria-label="Chart description input"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {value.length > 0 && (
              <span>{value.length} / 2000 字符</span>
            )}
            {!value.length && (
              <span>支持中文和英文，按 Ctrl+Enter 快速提交</span>
            )}
          </div>
          
          <Button
            type="submit"
            disabled={!value.trim() || isLoading || disabled}
            size="lg"
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <span className="mr-2">生成中</span>
                <span className="animate-spin">⏳</span>
              </>
            ) : (
              '生成图表'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
