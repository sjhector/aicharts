# AI Charts

Generate beautiful, interactive charts from natural language descriptions powered by AI.

## Features

✨ **Natural Language Input** - Describe your data in plain Chinese or English  
📊 **Multiple Chart Types** - Line, bar, pie, scatter, and area charts  
🎨 **Multi-Series Support** - Compare multiple data series with distinct colors  
🖱️ **Interactive** - Zoom, pan, and explore with tooltips  
📥 **Download** - Export charts as high-quality PNG images  
⚡ **Fast** - Chart generation in under 5 seconds  
🎯 **Smart** - AI automatically selects the best chart type for your data

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the project root:

```env
DASHSCOPE_API_KEY=your_dashscope_api_key_here
```

Get your API key from [Alibaba Cloud DashScope](https://dashscope.aliyun.com/).

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Try It Out

Enter a prompt like:

- "比较北京和上海的销售额：北京是120、130、150，上海是100、140、160"
- "用柱状图展示：1月 100，2月 150，3月 200"
- "Sales data pie chart: Product A 30%, Product B 45%, Product C 25%"

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **UI**: Tailwind CSS 4 + shadcn/ui
- **Charts**: Apache ECharts
- **AI**: OpenAI SDK + Alibaba DashScope (Qwen model)

## Project Structure

```
app/
├── api/
│   └── generate-chart/      # API route for chart generation
│       └── route.ts
├── components/               # React components
│   ├── chart-input.tsx       # Input form
│   ├── chart-display.tsx     # ECharts renderer
│   ├── chart-download.tsx    # Download functionality
│   └── loading-indicator.tsx # Loading state
├── lib/                      # Utilities
│   ├── types.ts              # TypeScript types
│   ├── api-client.ts         # API client
│   ├── llm-prompts.ts        # LLM system prompts
│   ├── echarts-config.ts     # ECharts validation
│   └── utils.ts              # Helper functions
├── layout.tsx                # Root layout
└── page.tsx                  # Homepage

components/ui/                # shadcn/ui components
lib/                          # Shared utilities
```

## Examples

### Basic Comparison
```
比较北京和上海: 北京 120、130、150, 上海 100、140、160
```

### Explicit Chart Type
```
用柱状图展示: 1月 100, 2月 150, 3月 200
```

### Multi-Series with Labels
```
Q1到Q4的销售数据: 产品A是 100、120、140、160; 产品B是 90、110、130、150
```

### Percentage Data
```
市场份额饼图: 公司A 35%, 公司B 28%, 公司C 22%, 其他 15%
```

## Constraints

- Maximum 1000 data points per chart
- Maximum 2000 characters per prompt
- Chart generation timeout: 25 seconds
- Stateless operation (no history saved)

## License

MIT

---

Built with ❤️ using Next.js, TypeScript, and AI
