# AI Charts

Generate beautiful, interactive charts from natural language descriptions powered by AI.

## 🚀 Features

✨ **Natural Language Input** - Describe your data in plain Chinese or English  
📊 **Multiple Chart Types** - Line, bar, pie, scatter, and area charts  
🎨 **Multi-Series Support** - Compare multiple data series with distinct colors  
🖱️ **Interactive** - Zoom, pan, and explore with tooltips  
📥 **Download** - Export charts as high-quality PNG images  
⚡ **Fast** - Chart generation in under 5 seconds  
🎯 **Smart** - AI automatically selects the best chart type for your data

## 📋 Prerequisites

Before getting started, ensure you have:

- **Node.js 18+** - [Download Node.js](https://nodejs.org/)
- **npm** or **pnpm** - Package manager (comes with Node.js)
- **DashScope API Key** - [Get free API key](https://dashscope.aliyun.com/) from Alibaba Cloud

## 🛠️ Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd aicharts
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Or using pnpm:
```bash
pnpm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
DASHSCOPE_API_KEY=your_dashscope_api_key_here
```

**Getting Your API Key:**
1. Visit [Alibaba Cloud DashScope](https://dashscope.aliyun.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env.local` file

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 5. Build for Production

```bash
npm run build
npm start
```

## 💡 Usage Examples

### Basic Line Chart
```
比较北京和上海的销售额：北京是120、130、150，上海是100、140、160
```

### Bar Chart with Specific Type
```
用柱状图展示：1月 100，2月 150，3月 200
```

### Multi-Series Comparison
```
Q1到Q4的销售数据: 产品A是 100、120、140、160; 产品B是 90、110、130、150
```

### Pie Chart with Percentages
```
市场份额饼图: 公司A 35%, 公司B 28%, 公司C 22%, 其他 15%
```

### English Input
```
Sales comparison: Product A 30%, Product B 45%, Product C 25%
```

## 🏗️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Charts**: [Apache ECharts](https://echarts.apache.org/)
- **AI**: OpenAI SDK + [Alibaba DashScope](https://dashscope.aliyun.com/) (Qwen model)
- **Development**: Turbopack for fast bundling

## 📁 Project Structure

```
aicharts/
├── app/
│   ├── api/
│   │   └── generate-chart/
│   │       └── route.ts          # Chart generation API endpoint
│   ├── components/
│   │   ├── chart-input.tsx       # User input form
│   │   ├── chart-display.tsx     # ECharts renderer with interactions
│   │   ├── chart-download.tsx    # PNG download functionality
│   │   └── loading-indicator.tsx # Loading spinner
│   ├── lib/
│   │   ├── types.ts              # TypeScript type definitions
│   │   ├── api-client.ts         # API client with error handling
│   │   ├── llm-prompts.ts        # AI prompt engineering
│   │   ├── echarts-config.ts     # Chart validation & formatting
│   │   └── utils.ts              # Utility functions
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Main homepage
│   └── globals.css               # Global styles
├── components/ui/                # shadcn/ui components
├── lib/                          # Shared utilities
├── public/                       # Static assets
├── .env.local                    # Environment variables (create this)
├── .env.example                  # Environment template
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
└── tsconfig.json                 # TypeScript configuration
```

## 🔧 Configuration

### API Settings

Located in `app/api/generate-chart/route.ts`:

```typescript
const CONFIG = {
  model: 'qwen-max',          // AI model
  maxTokens: 4000,            // Max response tokens
  temperature: 0.7,           // Creativity (0-1)
  timeout: 25000,             // Request timeout (ms)
  maxPromptLength: 2000,      // Max input characters
  maxDataPoints: 1000         // Max chart data points
};
```

### Chart Display Settings

Customize in `app/components/chart-display.tsx`:
- Default height: 600px
- Responsive sizing enabled
- Interactive features: zoom, pan, tooltips
- Animation duration: 750ms

## 🎨 Supported Chart Types

| Type | Keywords | Use Case |
|------|----------|----------|
| **Line** | 线图, line, trend | Time series, trends |
| **Bar** | 柱状图, bar, column | Comparisons, categories |
| **Pie** | 饼图, pie | Proportions, percentages |
| **Scatter** | 散点图, scatter | Correlations, distributions |
| **Area** | 面积图, area | Cumulative trends |

AI automatically selects the best type based on your description.

## ⚙️ Performance Optimizations

- **Bundle Splitting**: ECharts loaded on-demand
- **Tree Shaking**: Only used chart types included
- **Hardware Acceleration**: GPU-accelerated transitions (<300ms)
- **Lazy Loading**: Components loaded as needed
- **Response Streaming**: Fast time-to-first-byte
- **Optimized Images**: Automatic format selection

## 🔒 Security Features

- Input sanitization to prevent XSS attacks
- Request validation and rate limiting ready
- Secure environment variable handling
- CORS protection enabled
- Content Security Policy headers

## 📊 API Response Format

### Success Response
```json
{
  "success": true,
  "config": { /* ECharts configuration */ },
  "metadata": {
    "chartType": "line",
    "dataPointCount": 6,
    "seriesCount": 2,
    "generatedAt": "2026-01-08T10:30:00.000Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "validation_failed",
  "message": "Generated chart configuration is invalid",
  "details": "Missing required field: series"
}
```

## 🚨 Error Handling

The application handles these error types:
- `invalid_request` - Bad input format
- `no_data` - Cannot extract data from prompt
- `validation_failed` - Invalid chart configuration
- `server_error` - API or network issues

Each error displays user-friendly messages in Chinese.

## 🌐 Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DASHSCOPE_API_KEY` | ✅ Yes | Alibaba Cloud DashScope API key | `sk-xxx...` |
| `NODE_ENV` | No | Environment mode | `production` |
| `PORT` | No | Server port | `3000` |

## 📏 Constraints & Limits

- **Maximum Data Points**: 1,000 per chart
- **Maximum Prompt Length**: 2,000 characters
- **Request Timeout**: 25 seconds
- **Concurrent Requests**: No server-side rate limiting (add as needed)
- **Data Persistence**: Stateless (no history saved)

## 🐛 Troubleshooting

### Issue: Charts not rendering
**Solution**: Check browser console for errors. Ensure ECharts is loaded correctly.

### Issue: API key error
**Solution**: Verify `.env.local` file exists with valid `DASHSCOPE_API_KEY`.

### Issue: Slow chart generation
**Solution**: Check network connection. DashScope API may have regional latency.

### Issue: Build errors
**Solution**: Clear cache and reinstall dependencies:
```bash
rm -rf .next node_modules
npm install
npm run build
```

## 🧪 Development Scripts

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run TypeScript type checking
npm run type-check

# Lint code
npm run lint
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 Roadmap

- [ ] Add more chart types (heatmap, treemap, radar)
- [ ] User authentication and chart saving
- [ ] Export to multiple formats (SVG, PDF, Excel)
- [ ] Collaborative chart editing
- [ ] Chart templates library
- [ ] Mobile app version

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [ECharts](https://echarts.apache.org/) - Chart library
- [Alibaba Cloud DashScope](https://dashscope.aliyun.com/) - AI services
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

## 📧 Support

For issues and questions:
- Open an [Issue](https://github.com/yourusername/aicharts/issues)
- Email: support@example.com
- Documentation: [Wiki](https://github.com/yourusername/aicharts/wiki)

---

**Built with ❤️ using Next.js, TypeScript, and AI**

*Last updated: January 2026*
