# Research: AI Charts Homepage with Natural Language Chart Generation

**Feature**: 001-ai-chart-homepage  
**Date**: 2026-01-08  
**Purpose**: Research technical approaches for LLM integration, ECharts configuration, and data extraction patterns

## Research Areas

### 1. LLM Integration with OpenAI SDK (DashScope)

**Decision**: Use OpenAI SDK configured to connect to Alibaba Cloud DashScope API with Qwen3-Max-Preview model

**Rationale**:
- OpenAI SDK provides familiar interface with industry-standard patterns
- DashScope offers Qwen3-Max-Preview model optimized for Chinese language understanding
- JSON object response format ensures structured, parseable output
- Compatible with existing OpenAI SDK ecosystem and TypeScript types

**Implementation Pattern**:
```typescript
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
});

const completion = await openai.chat.completions.create({
    model: "qwen3-max-preview",
    response_format: { type: "json_object" },
    messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
    ]
});
```

**Alternatives Considered**:
- Direct DashScope API calls: Rejected due to lack of TypeScript types and additional HTTP client setup
- Claude API: Rejected due to project requirement for DashScope/Qwen integration
- Langchain: Rejected as over-engineered for single LLM call use case

**Best Practices**:
- Store API keys in environment variables (`.env.local`)
- Set `response_format: { type: "json_object" }` for structured output
- Include error handling for rate limits and network failures
- Validate JSON response structure before using

---

### 2. System Prompt Design for ECharts Configuration

**Decision**: Create comprehensive system prompt that instructs LLM to return complete ECharts configuration JSON directly

**Rationale**:
- Frontend can use LLM response as-is without transformation
- Reduces parsing complexity and potential errors
- Ensures consistent output format
- Leverages LLM's knowledge of ECharts configuration structure

**System Prompt Template**:
```
You are an expert data visualization assistant that generates ECharts configuration JSON.

Your task:
1. Extract all numerical data, labels, and metadata from the user's natural language prompt
2. Determine the most appropriate chart type (line, bar, pie, scatter, area) based on:
   - Data structure (time-series, categorical, comparison, composition)
   - User's explicit chart type preference if specified
   - Number of data series
3. Generate a complete, valid ECharts configuration object

Output requirements:
- Return ONLY valid JSON (no markdown, no explanations)
- Include: title, tooltip, legend, xAxis, yAxis, series, grid
- Set appropriate colors for multi-series data
- Format numbers with proper decimal places
- Handle up to 1000 data points
- If no numerical data found, return: {"error": "no_data", "message": "..."}

Supported chart types:
- line: For trends, time-series, continuous data
- bar: For comparisons, rankings, categorical data
- pie: For composition, proportions (single series only)
- scatter: For correlations, distributions
- area: For trends with magnitude emphasis

Example output structure:
{
  "title": { "text": "Chart Title" },
  "tooltip": { "trigger": "axis" },
  "legend": { "data": ["Series 1", "Series 2"] },
  "xAxis": { "type": "category", "data": ["Jan", "Feb", "Mar"] },
  "yAxis": { "type": "value" },
  "series": [
    { "name": "Series 1", "type": "line", "data": [120, 130, 150] }
  ]
}

Format the response as pure JSON without any additional text.
```

**Best Practices**:
- Be explicit about JSON-only output
- Provide example structure
- Define error response format
- List supported chart types with usage guidance
- Specify data format expectations

**Alternatives Considered**:
- Multi-step approach (extract data, then format): Rejected as it requires multiple LLM calls
- Custom data extraction rules: Rejected as less flexible than LLM understanding
- Template-based generation: Rejected as too rigid for varied user inputs

---

### 3. ECharts Integration in Next.js/React

**Decision**: Use `echarts-for-react` wrapper with dynamic imports for optimal bundle size

**Rationale**:
- Official React wrapper provides seamless integration
- Lazy loading reduces initial bundle size
- Server-side rendering compatibility with Next.js
- TypeScript support available
- Handles chart lifecycle (updates, resizing) automatically

**Implementation Pattern**:
```typescript
import dynamic from 'next/dynamic';
import type { EChartsOption } from 'echarts';

// Lazy load ECharts component
const ReactECharts = dynamic(() => import('echarts-for-react'), {
  ssr: false,
  loading: () => <div>Loading chart...</div>
});

export function ChartDisplay({ config }: { config: EChartsOption }) {
  return (
    <ReactECharts
      option={config}
      style={{ height: '500px', width: '100%' }}
      opts={{ renderer: 'canvas' }}
      notMerge={true}
      lazyUpdate={false}
    />
  );
}
```

**Best Practices**:
- Use `next/dynamic` for code splitting
- Set `ssr: false` to avoid server-side rendering issues
- Specify chart dimensions explicitly
- Use canvas renderer for performance
- Set `notMerge: true` for fresh renders on config change

**Alternatives Considered**:
- Vanilla ECharts: Rejected due to manual lifecycle management complexity
- Chart.js: Rejected as violates constitution (ECharts required)
- Recharts: Rejected as violates constitution and less feature-rich

---

### 4. Data Extraction and Validation

**Decision**: Let LLM handle data extraction, implement validation on API route response

**Rationale**:
- LLM excels at understanding varied natural language formats
- Reduces custom parsing logic complexity
- Validation ensures data integrity before sending to frontend
- Separation of concerns: LLM extracts, API validates

**Validation Checklist**:
```typescript
function validateChartConfig(config: any): { valid: boolean; error?: string } {
  // Check for error response from LLM
  if (config.error) {
    return { valid: false, error: config.message };
  }
  
  // Validate required ECharts fields
  if (!config.series || !Array.isArray(config.series)) {
    return { valid: false, error: "Invalid series data" };
  }
  
  // Check data point limit (max 1000)
  const totalPoints = config.series.reduce((sum, s) => sum + (s.data?.length || 0), 0);
  if (totalPoints > 1000) {
    return { valid: false, error: "Data exceeds 1000 point limit" };
  }
  
  // Validate chart type
  const validTypes = ['line', 'bar', 'pie', 'scatter', 'area'];
  const hasValidType = config.series.every(s => validTypes.includes(s.type));
  if (!hasValidType) {
    return { valid: false, error: "Invalid chart type" };
  }
  
  return { valid: true };
}
```

**Best Practices**:
- Validate both LLM response structure and ECharts configuration format
- Check data point limits before rendering
- Sanitize user input before sending to LLM
- Return clear error messages for user feedback

**Alternatives Considered**:
- Regex-based parsing: Rejected as too brittle for varied input formats
- JSON schema validation: Considered for future enhancement but not MVP requirement
- Custom DSL: Rejected as defeats purpose of natural language interface

---

### 5. Chart Download Functionality

**Decision**: Use ECharts built-in `saveAsImage` toolbox feature + custom download button

**Rationale**:
- ECharts provides native image export capability
- Supports PNG and SVG formats
- No additional libraries required
- Works client-side without server processing

**Implementation Pattern**:
```typescript
import { useRef } from 'react';
import type { EChartsInstance } from 'echarts-for-react';

export function ChartDownload({ chartRef }: { chartRef: React.RefObject<any> }) {
  const handleDownload = () => {
    const instance: EChartsInstance = chartRef.current?.getEchartsInstance();
    if (instance) {
      const url = instance.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#fff'
      });
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `chart-${Date.now()}.png`;
      link.click();
    }
  };
  
  return <Button onClick={handleDownload}>Download Chart</Button>;
}
```

**Best Practices**:
- Use `pixelRatio: 2` for high-DPI displays
- Set white background for better print/presentation quality
- Include timestamp in filename for uniqueness
- Provide visual feedback during download

**Alternatives Considered**:
- html2canvas: Rejected as ECharts has native support
- Server-side rendering: Rejected as unnecessarily complex and violates stateless principle
- PDF export: Deferred to future enhancement (out of scope for MVP)

---

### 6. Error Handling and User Feedback

**Decision**: Implement three-tier error handling: LLM, API validation, and UI feedback

**Rationale**:
- Multiple failure points require comprehensive error handling
- Users need clear, actionable feedback
- Prevent silent failures

**Error Categories**:

1. **No Data Found**: LLM detects no extractable numerical data
   - Response: `{ "error": "no_data", "message": "..." }`
   - UI Action: Display alert dialog with guidance
   
2. **Data Limit Exceeded**: More than 1000 data points
   - Response: HTTP 400 with error message
   - UI Action: Show error message, suggest truncation
   
3. **LLM Service Error**: API timeout, rate limit, or network failure
   - Response: HTTP 500/503 with generic error
   - UI Action: Show retry button, suggest trying again later
   
4. **Invalid Chart Config**: LLM returns malformed ECharts config
   - Response: HTTP 500 with validation error
   - UI Action: Show error message, log for debugging

**Implementation Pattern**:
```typescript
// API Route error handling
try {
  const completion = await openai.chat.completions.create({...});
  const config = JSON.parse(completion.choices[0].message.content);
  
  if (config.error === "no_data") {
    return NextResponse.json(
      { error: "no_data", message: config.message },
      { status: 400 }
    );
  }
  
  const validation = validateChartConfig(config);
  if (!validation.valid) {
    return NextResponse.json(
      { error: "validation_failed", message: validation.error },
      { status: 400 }
    );
  }
  
  return NextResponse.json(config);
} catch (error) {
  if (error.code === 'rate_limit_exceeded') {
    return NextResponse.json(
      { error: "rate_limit", message: "Too many requests. Please try again in a moment." },
      { status: 429 }
    );
  }
  return NextResponse.json(
    { error: "server_error", message: "Failed to generate chart" },
    { status: 500 }
  );
}
```

**Best Practices**:
- Use appropriate HTTP status codes
- Provide user-friendly error messages
- Log technical errors for debugging
- Implement retry logic for transient failures

---

### 7. UI Layout Transformation

**Decision**: Use Tailwind CSS transitions and conditional rendering for layout animation

**Rationale**:
- CSS transitions provide smooth, performant animations
- Conditional rendering based on state is simple and predictable
- Meets SC-004 requirement (<300ms transition)
- No animation library needed

**Implementation Pattern**:
```typescript
export default function HomePage() {
  const [chartConfig, setChartConfig] = useState<EChartsOption | null>(null);
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Chart area - only visible when config exists */}
      <div className={cn(
        "flex-1 transition-all duration-300",
        chartConfig ? "opacity-100" : "opacity-0 h-0"
      )}>
        {chartConfig && <ChartDisplay config={chartConfig} />}
      </div>
      
      {/* Input area - transitions from center to bottom */}
      <div className={cn(
        "transition-all duration-300",
        chartConfig 
          ? "p-4" 
          : "flex-1 flex items-center justify-center"
      )}>
        <ChartInput onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
```

**Best Practices**:
- Use Tailwind's transition utilities
- Set explicit duration (300ms) to meet success criteria
- Use flexbox for natural layout flow
- Preserve input component (don't unmount) for better UX

**Alternatives Considered**:
- Framer Motion: Rejected as over-engineered for simple layout shift
- CSS Grid: Rejected as flexbox is simpler for this use case
- React Spring: Rejected as unnecessary dependency

---

## Summary of Technical Decisions

| Component | Technology | Key Reason |
|-----------|-----------|------------|
| LLM Integration | OpenAI SDK + DashScope | Standard interface, TypeScript support, JSON output |
| Model | Qwen3-Max-Preview | Chinese language optimization, structured output |
| Chart Library | echarts-for-react | Constitution requirement, React integration |
| UI Framework | Tailwind CSS + shadcn/ui | Constitution requirement, rapid development |
| Data Extraction | LLM-powered | Flexible, handles varied formats |
| Error Handling | Three-tier (LLM/API/UI) | Comprehensive, user-friendly |
| Chart Download | ECharts native export | Built-in, no additional libraries |
| Layout Animation | Tailwind transitions | Simple, performant, meets timing requirements |

## Dependencies Required

```json
{
  "dependencies": {
    "next": "^16.1.1",
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "openai": "^4.0.0",
    "echarts": "^5.4.3",
    "echarts-for-react": "^3.0.2",
    "@tailwindcss/postcss": "^4.0.0",
    "tailwindcss": "^4.0.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5"
  }
}
```

## Environment Variables

```bash
# .env.local
DASHSCOPE_API_KEY=sk-xxx  # Alibaba Cloud DashScope API key
```

## Next Steps

This research informs the implementation plan. Proceed to:
1. **data-model.md**: Define TypeScript interfaces for all entities
2. **contracts/**: Define API route request/response schemas
3. **quickstart.md**: Document development setup procedures
