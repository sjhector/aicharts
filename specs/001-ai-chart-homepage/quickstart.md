# Quickstart Guide: AI Charts Homepage

**Feature**: 001-ai-chart-homepage  
**Date**: 2026-01-08  
**Branch**: `001-ai-chart-homepage`

## Prerequisites

- Node.js 20+ installed
- npm or pnpm package manager
- Alibaba Cloud DashScope API key
- Code editor (VS Code recommended)
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)

## Initial Setup

### 1. Clone and Install Dependencies

```bash
# Navigate to project root
cd F:\Code\Github\ai-coding\aicharts

# Ensure you're on the feature branch
git checkout 001-ai-chart-homepage

# Install dependencies
npm install

# Install additional dependencies for this feature
npm install openai echarts echarts-for-react
```

### 2. Configure Environment Variables

Create or update `.env.local` in the project root:

```bash
# .env.local
DASHSCOPE_API_KEY=your-api-key-here
```

**To get a DashScope API key**:
1. Visit https://dashscope.console.aliyun.com/
2. Sign up or log in to Alibaba Cloud
3. Create a new API key
4. Copy the key (starts with `sk-`)

### 3. Install shadcn/ui Components

```bash
# Initialize shadcn/ui (if not already done)
npx shadcn@latest init

# Install required UI components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add alert
npx shadcn@latest add input
npx shadcn@latest add textarea
```

## Project Structure Overview

```
app/
├── api/generate-chart/route.ts    # API endpoint for chart generation
├── page.tsx                        # Homepage with input and chart display
├── layout.tsx                      # Root layout
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── chart-input.tsx             # Input component
│   ├── chart-display.tsx           # ECharts wrapper
│   ├── chart-download.tsx          # Download button
│   └── loading-indicator.tsx       # Loading spinner
└── lib/
    ├── types.ts                    # TypeScript interfaces
    ├── api-client.ts               # Frontend API utilities
    ├── llm-prompts.ts              # System prompts for LLM
    └── utils.ts                    # Helper functions
```

## Development Workflow

### Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to see the homepage.

### Key Files to Implement

#### 1. API Route: `app/api/generate-chart/route.ts`

This is the core backend logic that:
- Receives user prompts
- Calls DashScope LLM via OpenAI SDK
- Returns ECharts configuration JSON

```typescript
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { APIRequest, APIResponse } from '@/lib/types';

const openai = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY!,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
});

export async function POST(request: Request) {
  try {
    const body: APIRequest = await request.json();
    
    // Call LLM with system prompt
    const completion = await openai.chat.completions.create({
      model: 'qwen3-max-preview',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: body.prompt }
      ]
    });
    
    const config = JSON.parse(completion.choices[0].message.content);
    
    // Handle errors from LLM
    if (config.error === 'no_data') {
      return NextResponse.json(
        { error: 'no_data', message: config.message },
        { status: 400 }
      );
    }
    
    // Validate and return
    return NextResponse.json({
      config,
      metadata: {
        processingTime: Date.now(),
        dataPoints: calculateDataPoints(config),
        chartType: config.series[0].type
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'server_error', message: 'Failed to generate chart' },
      { status: 500 }
    );
  }
}
```

#### 2. Homepage: `app/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import ChartInput from '@/components/chart-input';
import ChartDisplay from '@/components/chart-display';
import type { EChartsOption } from 'echarts';

export default function HomePage() {
  const [chartConfig, setChartConfig] = useState<EChartsOption | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (prompt: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      const data = await response.json();
      
      if (data.error) {
        alert(data.message); // Show error alert
      } else {
        setChartConfig(data.config);
      }
    } catch (error) {
      alert('Failed to generate chart');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {chartConfig && (
        <div className="flex-1 p-8">
          <ChartDisplay config={chartConfig} />
        </div>
      )}
      
      <div className={chartConfig ? 'p-4' : 'flex-1 flex items-center justify-center'}>
        <ChartInput onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}
```

#### 3. Chart Display: `app/components/chart-display.tsx`

```typescript
import dynamic from 'next/dynamic';
import type { EChartsOption } from 'echarts';

const ReactECharts = dynamic(() => import('echarts-for-react'), {
  ssr: false,
  loading: () => <div className="animate-pulse">Loading chart...</div>
});

export default function ChartDisplay({ config }: { config: EChartsOption }) {
  return (
    <div className="w-full h-[500px]">
      <ReactECharts
        option={config}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
}
```

## Testing the Feature

### Test Cases

1. **Basic Chart Generation**:
   ```
   Input: "北京 120、130、150 vs 上海 100、140、160"
   Expected: Line or bar chart with two series
   ```

2. **Explicit Chart Type**:
   ```
   Input: "用柱状图展示销售额: 1月 100, 2月 150, 3月 200"
   Expected: Bar chart with one series
   ```

3. **No Data Error**:
   ```
   Input: "Hello, how are you?"
   Expected: Alert dialog with error message
   ```

4. **Multi-Series Comparison**:
   ```
   Input: "比较今年一到六月，北京和上海的月度销售额: 北京是 120、130、150、170、180、200; 上海是 100、140、160、150、190、210"
   Expected: Multi-series line chart
   ```

### Manual Testing Checklist

- [ ] Homepage loads with centered input box
- [ ] Can type in input box
- [ ] Submit button triggers API call
- [ ] Loading indicator appears during processing
- [ ] Chart displays after successful generation
- [ ] Input box moves to bottom when chart appears
- [ ] Chart is interactive (tooltips, zoom, pan)
- [ ] Download button exports chart as PNG
- [ ] Alert shows when no data found
- [ ] Error message shows on API failure
- [ ] Layout transition is smooth (<300ms)

## Troubleshooting

### API Key Not Found

**Error**: `Error: OpenAI API key not configured`

**Solution**: Ensure `.env.local` exists and contains valid `DASHSCOPE_API_KEY`

```bash
# Check if file exists
cat .env.local

# Restart dev server after adding key
npm run dev
```

### ECharts Not Rendering

**Error**: Chart area is blank or shows error

**Solution**: 
1. Check browser console for errors
2. Verify ECharts config is valid JSON
3. Ensure `echarts-for-react` is installed
4. Check that `ssr: false` is set in dynamic import

### LLM Returns Invalid JSON

**Error**: `SyntaxError: Unexpected token`

**Solution**:
1. Check system prompt includes "return ONLY valid JSON"
2. Verify `response_format: { type: 'json_object' }` is set
3. Add JSON validation before parsing

### CORS Errors

**Error**: `CORS policy blocked`

**Solution**: In development, Next.js handles CORS automatically. If issues persist:
- Ensure API route is in `app/api/` directory
- Check that fetch URL starts with `/api/` (relative path)

## Development Tips

1. **Use TypeScript strict mode**: Catch errors at compile time
2. **Test with varied prompts**: Chinese, English, mixed languages
3. **Monitor API usage**: DashScope has rate limits
4. **Check browser console**: For frontend errors
5. **Use Next.js DevTools**: For component inspection

## Performance Optimization

- **Lazy load ECharts**: Use `next/dynamic` with `ssr: false`
- **Debounce input**: Prevent excessive API calls
- **Cache LLM responses**: Consider Redis for repeated prompts (future)
- **Optimize bundle size**: Import only needed ECharts components

## Next Steps

After quickstart setup:
1. Implement all components from project structure
2. Test with various data formats
3. Implement download functionality
4. Add accessibility features (keyboard navigation)
5. Optimize performance for 1000 data points

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [ECharts Documentation](https://echarts.apache.org/en/option.html)
- [DashScope API](https://help.aliyun.com/zh/dashscope/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Support

For questions or issues:
1. Check [research.md](./research.md) for technical decisions
2. Review [data-model.md](./data-model.md) for type definitions
3. Consult [contracts/generate-chart.openapi.yaml](./contracts/generate-chart.openapi.yaml) for API spec
