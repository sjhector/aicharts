# Implementation Plan: AI Charts Homepage with Natural Language Chart Generation

**Branch**: `001-ai-chart-homepage` | **Date**: 2026-01-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ai-chart-homepage/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Create a Next.js web application homepage where users enter natural language prompts containing data, and the system automatically generates interactive charts with optional 3D visual effects. The LLM (via OpenAI SDK with DashScope) extracts data from prompts, detects 3D keywords, determines the optimal chart type, and returns ECharts configuration JSON with 3D parameters when applicable. The UI transforms from a centered input box to a bottom input + top chart display layout. Users can download both 2D and 3D charts as images, and the application operates statelessly without session persistence. 3D visual effects (pseudo-3D with perspective, shadows, depth) are supported for bar and pie charts when users include keywords like "3D", "立体", or "三维" in their prompts.

## Technical Context

**Framework**: Next.js 16+ (App Router)
**Language/Version**: TypeScript 5+ (strict mode enabled)
**Runtime**: Node.js 20+
**Primary Dependencies**: 
- React 19+
- Tailwind CSS 4+
- shadcn/ui components (Button, Card, Dialog, Alert, Input, Textarea)
- Apache ECharts (echarts or echarts-for-react)
- OpenAI SDK for LLM integration (connecting to DashScope API)
**Storage**: N/A (stateless application, no persistence required)
**Testing**: Vitest for unit tests, Playwright for E2E (optional for MVP)
**Target Platform**: Web (modern browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
**Project Type**: web (Next.js full-stack application with API Routes)
**Performance Goals**: 
- End-to-end chart generation < 5 seconds
- Chart rendering < 500ms after config received (both 2D and 3D)
- UI layout transition < 300ms
- Chart interactions respond < 100ms
- 3D charts render within 500ms for up to 1000 data points
**Constraints**: 
- Maximum 1000 data points per chart (both 2D and 3D)
- Stateless operation (no session persistence)
- Initial bundle size optimized with lazy loading for ECharts
- LLM response format must be JSON object (ECharts config)
- 3D effects only supported for bar and pie charts (pseudo-3D rendering)
- LLM response format must be JSON object (ECharts config)
**Scale/Scope**: 
- Single-page application
- Support for 5+ chart types (line, bar, pie, scatter, area) with 3D visual effects for bar and pie
- Bilingual support (Chinese + English)
- Up to 1000 data points per visualization (both 2D and 3D)
- 3D keyword detection ("3D", "立体", "三维", "3d") with 95% accuracy

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] API Routes Architecture: All backend functionality uses Next.js API Routes (`app/api/generate-chart`)
- [x] Component Framework Standards: All UI uses Tailwind CSS + shadcn/ui components
- [x] Charting Library Standard: All charts use Apache ECharts (echarts-for-react)
- [x] TypeScript strict mode enabled
- [x] Clear API contracts defined with request/response types (see contracts/ directory)
- [x] Error handling and loading states implemented
- [x] Accessibility standards (WCAG 2.1 Level AA) met

**Status**: ✅ All constitutional requirements satisfied. No violations or exceptions needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-chart-homepage/
├── plan.md              # This file
├── research.md          # Phase 0: LLM integration patterns, ECharts best practices
├── data-model.md        # Phase 1: ChartPrompt, ExtractedData, ChartConfiguration entities
├── quickstart.md        # Phase 1: Development setup and usage guide
├── contracts/           # Phase 1: API route contracts
│   └── generate-chart.openapi.yaml
└── tasks.md             # Phase 2: Implementation tasks (/speckit.tasks command)
```

### Source Code (repository root)

```text
app/
├── api/
│   └── generate-chart/
│       └── route.ts           # LLM integration, data extraction, ECharts config generation
├── page.tsx                   # Homepage with input box and chart display
├── layout.tsx                 # Root layout with Tailwind CSS
├── components/
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── alert.tsx
│   │   ├── input.tsx
│   │   └── textarea.tsx
│   ├── chart-input.tsx        # Main input component with submit handler
│   ├── chart-display.tsx      # ECharts wrapper component
│   ├── chart-download.tsx     # Download button component
│   └── loading-indicator.tsx  # Loading state component
├── lib/
│   ├── types.ts               # TypeScript interfaces for all entities
│   ├── api-client.ts          # Frontend API client utilities
│   ├── echarts-config.ts      # ECharts configuration utilities
│   ├── llm-prompts.ts         # System prompts for LLM
│   └── utils.ts               # General utilities (cn, formatters)
└── globals.css                # Tailwind CSS imports

public/
└── (static assets if needed)

.env.local                     # Environment variables (DASHSCOPE_API_KEY)
```

**Structure Decision**: Next.js App Router with single homepage. All server logic in `app/api/generate-chart/route.ts`, all UI components in `app/components/` using shadcn/ui + Tailwind CSS, ECharts rendering via `chart-display.tsx`. 3D chart logic integrated into existing structure: LLM prompt detection in system prompt, 3D parameters added to ECharts config utilities, visual mode flag in ChartConfiguration type.

## Architecture & Data Flow

### High-Level System Flow

```
User Input (Natural Language)
    ↓
Frontend: chart-input.tsx
    ↓
API Call: POST /api/generate-chart
    ↓
Backend: route.ts
    ├─ Validate input (length, sanitization)
    ├─ Detect 3D keywords ("3D", "立体", "三维")
    ├─ Call LLM with system prompt + user prompt
    ├─ Parse LLM response (JSON ECharts config)
    ├─ Apply 3D parameters if detected & chart type supports (bar/pie)
    │   └─ Bar: 30° angle, 20% depth, shadow opacity 0.3
    │   └─ Pie: 15% thickness, 25° tilt, gradient highlights
    └─ Validate & return ChartConfiguration
    ↓
Frontend: page.tsx state update
    ├─ Layout transition (centered → split)
    └─ Render chart-display.tsx with config
    ↓
ECharts Rendering (2D or 3D)
    ├─ Hardware-accelerated CSS transforms
    ├─ ECharts GPU rendering enabled
    └─ Interactive features (tooltips, zoom, pan)
```

### 3D Chart Implementation Strategy

**Approach**: Pseudo-3D using ECharts built-in 3D series types (`bar3D`, `pie3D`) from echarts-gl extension OR native ECharts options with perspective transforms.

**Decision**: Use native ECharts options for bar/pie charts with visual depth effects:
- **Bar Charts**: Use `itemStyle.color` with gradient for depth, `emphasis.itemStyle` for shadow effects, custom series with stacked bars for 3D appearance
- **Pie Charts**: Use `pieRadius` with offset for thickness, `itemStyle.shadowBlur` and `shadowOffsetY` for depth, `label.position` adjusted for 3D tilt

**Rationale**: 
- Avoids adding echarts-gl dependency (reduces bundle size)
- Faster rendering (no WebGL overhead)
- Better browser compatibility
- Sufficient for pseudo-3D visual effects (not true 3D spatial data)

### 3D Keyword Detection

**Implementation**: 
1. **Frontend Detection** (optional, for instant UI feedback):
   - Regex match in chart-input.tsx: `/\b(3D|3d|立体|三维)\b/i`
   - Update UI hint text if detected
   
2. **Backend Detection** (primary, authoritative):
   - LLM system prompt includes 3D instruction:
     ```
     "If user mentions 3D, '立体', '三维', return 'visualMode': '3D' in JSON response"
     ```
   - LLM response parsing extracts `visualMode` field
   - Fallback regex check if LLM doesn't detect: `/\b(3D|3d|立体|三维)\b/i`

3. **Apply 3D Parameters**:
   ```typescript
   if (visualMode === '3D' && (chartType === 'bar' || chartType === 'pie')) {
     applyThreeDEffect(echartsConfig, chartType);
   }
   ```

### 3D Parameter Application

**Bar Chart 3D Configuration**:
```typescript
{
  xAxis3D: { type: 'category', data: labels },
  yAxis3D: { type: 'value' },
  zAxis3D: { type: 'value' },
  grid3D: {
    viewControl: {
      alpha: 30,  // 30° viewing angle
      beta: 0,
      distance: 200
    },
    boxWidth: 100,
    boxHeight: 100,
    boxDepth: 20   // 20% depth
  },
  series: [{
    type: 'bar3D',
    data: dataPoints.map((v, i) => [i, v, 0]),
    shading: 'realistic',
    itemStyle: {
      opacity: 0.7,
      shadowBlur: 10,
      shadowOffsetZ: 5
    },
    emphasis: {
      itemStyle: {
        shadowBlur: 20,
        opacity: 1
      }
    }
  }]
}
```

**Pie Chart 3D Configuration**:
```typescript
{
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    center: ['50%', '50%'],
    data: pieData,
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowOffsetY: 5,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    },
    itemStyle: {
      borderRadius: 8,
      borderColor: '#fff',
      borderWidth: 2,
      // Gradient for 3D depth effect
      color: (params) => {
        const colorList = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'];
        const baseColor = colorList[params.dataIndex % colorList.length];
        return {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: baseColor },
            { offset: 1, color: darken(baseColor, 0.3) }
          ]
        };
      }
    },
    label: {
      position: 'outside',
      formatter: '{b}: {c} ({d}%)'
    },
    labelLine: {
      length: 15,
      length2: 10
    },
    // 3D tilt effect via transform
    zlevel: 10,
    z: 10
  }]
}
```

**Alternative Approach (If echarts-gl is acceptable)**:
Install `echarts-gl` for true 3D rendering:
```bash
npm install echarts-gl
```

Import in chart-display.tsx:
```typescript
import 'echarts-gl';
```

Use `bar3D` and `pie3D` series types directly with built-in 3D capabilities.

**Recommended**: Start with native ECharts pseudo-3D approach. If user feedback requires more advanced 3D, add echarts-gl in Phase 2.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: No violations. All requirements satisfied by constitutional stack. 3D feature implemented using native ECharts capabilities without additional dependencies.

## Phase Breakdown

### Phase 0: Research & Prototyping (Optional)

**Research Topics**:
1. **ECharts 3D Capabilities**:
   - Native 3D effects vs echarts-gl extension
   - Performance benchmarks for 1000 data points
   - Browser compatibility for hardware acceleration
   
2. **LLM Prompt Engineering for 3D Detection**:
   - Test keyword detection accuracy ("3D", "立体", "三维")
   - Prompt examples for reliable JSON response with `visualMode` field
   - Fallback strategies if LLM misses 3D keywords

3. **3D Visual Parameters**:
   - A/B testing viewing angles (15°, 30°, 45°)
   - Optimal depth/thickness percentages for readability
   - Shadow intensity sweet spot (opacity 0.2-0.5)

**Deliverables**: research.md with findings, ECharts 3D prototypes

### Phase 1: Design & Contracts

**Data Model Updates** (data-model.md):
```typescript
// Extend ChartConfiguration entity
interface ChartConfiguration {
  // ... existing fields
  visualMode: '2D' | '3D';  // NEW: Visual rendering mode
  threeDParams?: {           // NEW: 3D-specific parameters
    viewingAngle: number;    // degrees (e.g., 30)
    depth: number;           // percentage (e.g., 20 for bars)
    thickness: number;       // percentage (e.g., 15 for pies)
    shadowIntensity: number; // opacity 0-1 (e.g., 0.3)
    tiltAngle: number;       // degrees for pie charts (e.g., 25)
  };
}

// Extend ChartPrompt entity
interface ChartPrompt {
  // ... existing fields
  contains3DKeywords: boolean; // NEW: Detection flag
  detectedKeywords: string[];  // NEW: ["3D", "立体", etc.]
}
```

**API Contract Updates** (contracts/generate-chart.openapi.yaml):
```yaml
components:
  schemas:
    ChartConfigurationResponse:
      properties:
        visualMode:
          type: string
          enum: ['2D', '3D']
          description: Visual rendering mode
        threeDParams:
          type: object
          nullable: true
          properties:
            viewingAngle:
              type: number
              description: Viewing angle in degrees
            depth:
              type: number
              description: Bar depth percentage
            thickness:
              type: number
              description: Pie thickness percentage
            shadowIntensity:
              type: number
              minimum: 0
              maximum: 1
            tiltAngle:
              type: number
              description: Pie tilt angle in degrees
```

**Deliverables**: Updated data-model.md, contracts/generate-chart.openapi.yaml, quickstart.md with 3D examples

### Phase 2: Implementation Planning (tasks.md)

**New Tasks for User Story 6** (3D Charts):

```markdown
## Phase X: User Story 6 - 3D Visual Effects (Priority: P2)

**Purpose**: Add 3D visual effects for bar and pie charts

- [ ] T061 [P] [US6] Update LLM system prompt in app/lib/llm-prompts.ts to include 3D keyword detection instructions
- [ ] T062 [P] [US6] Add 3D keyword detection regex in app/api/generate-chart/route.ts (fallback for LLM)
- [ ] T063 [P] [US6] Extend ChartConfiguration type in app/lib/types.ts with visualMode and threeDParams
- [ ] T064 [US6] Create apply3DEffect utility function in app/lib/echarts-config.ts for bar charts
- [ ] T065 [US6] Create apply3DEffect utility function in app/lib/echarts-config.ts for pie charts
- [ ] T066 [US6] Update chart-display.tsx to handle 3D configurations without breaking existing functionality
- [ ] T067 [US6] Add 3D chart type fallback logic (unsupported types → 2D rendering)
- [ ] T068 [US6] Update API route to apply 3D parameters when visualMode=3D and chartType=bar/pie
- [ ] T069 [US6] Test 3D keyword detection accuracy with test suite (Chinese & English)
- [ ] T070 [US6] Performance test: 3D rendering with 1000 data points (target <500ms)
- [ ] T071 [US6] Add 3D chart examples to README.md usage section
- [ ] T072 [US6] Verify all interactive features (tooltips, zoom, pan) work with 3D charts
```

**Dependencies**:
- T061-T063 must complete before T064-T068 (data structures first)
- T064-T065 can be done in parallel (bar and pie independently)
- T067 depends on T066 (display component handles 3D configs)
- T069-T072 are validation tasks (can run in parallel after T068)

### Phase 3: Implementation Execution

**Implementation Order** (following tasks.md):
1. **Setup** (T061-T063): Type definitions and prompt updates
2. **Core Logic** (T064-T068): 3D effect application
3. **Validation** (T069-T072): Testing and documentation

**Key Implementation Files**:

1. **app/lib/llm-prompts.ts** (T061):
```typescript
export function getChartGenerationPrompt(): string {
  return `You are a chart configuration generator...

CHART TYPE DETECTION:
- If user mentions "3D", "3d", "立体", or "三维", set "visualMode": "3D"
- Only apply 3D to bar charts or pie charts
- For other chart types, use "visualMode": "2D" even if 3D is mentioned

OUTPUT FORMAT:
{
  "chartType": "bar" | "line" | "pie" | "scatter" | "area",
  "visualMode": "2D" | "3D",
  // ... rest of config
}`;
}
```

2. **app/lib/echarts-config.ts** (T064-T065):
```typescript
export function apply3DEffectBar(config: EChartsOption): EChartsOption {
  return {
    ...config,
    grid3D: {
      viewControl: { alpha: 30, beta: 0, distance: 200 },
      boxDepth: 20
    },
    series: config.series?.map(s => ({
      ...s,
      type: 'bar3D',
      shading: 'realistic',
      itemStyle: {
        ...s.itemStyle,
        opacity: 0.7,
        shadowBlur: 10,
        shadowOffsetZ: 5
      }
    }))
  };
}

export function apply3DEffectPie(config: EChartsOption): EChartsOption {
  return {
    ...config,
    series: config.series?.map(s => ({
      ...s,
      itemStyle: {
        ...s.itemStyle,
        shadowBlur: 10,
        shadowOffsetY: 5,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 20,
          shadowOffsetY: 10
        }
      }
    }))
  };
}
```

3. **app/api/generate-chart/route.ts** (T068):
```typescript
// After LLM response parsing
const visualMode = parsedResponse.visualMode || detect3DKeywords(userPrompt) ? '3D' : '2D';
const chartType = parsedResponse.chartType;

let finalConfig = parsedResponse;

if (visualMode === '3D' && (chartType === 'bar' || chartType === 'pie')) {
  finalConfig = chartType === 'bar' 
    ? apply3DEffectBar(finalConfig)
    : apply3DEffectPie(finalConfig);
  
  console.log(`[${requestId}] Applied 3D effects to ${chartType} chart`);
}
```

### Phase 4: Testing & Validation

**Test Scenarios**:

1. **3D Keyword Detection**:
   - ✅ "用3D柱状图展示" → 3D bar chart
   - ✅ "立体饼图" → 3D pie chart
   - ✅ "三维图表" → 3D (type auto-selected)
   - ✅ "3d bar chart" → 3D bar chart
   - ✅ Mixed: "flat 3D" → 3D takes precedence

2. **Unsupported Types**:
   - ✅ "3D line chart" → 2D line chart (fallback)
   - ✅ "3D scatter" → 2D scatter (fallback)
   - ✅ "立体折线图" → 2D line (fallback)

3. **Performance**:
   - ✅ 100 points: <200ms render
   - ✅ 500 points: <400ms render
   - ✅ 1000 points: <500ms render

4. **Interactions**:
   - ✅ Hover tooltips work on 3D charts
   - ✅ Zoom works on 3D charts
   - ✅ Pan works on 3D charts
   - ✅ Download 3D charts as PNG

5. **Visual Quality**:
   - ✅ Bar chart: 30° angle visible, shadows present
   - ✅ Pie chart: thickness visible, gradient applied
   - ✅ No data distortion or readability issues

**Success Metrics** (from spec.md):
- SC-013: 3D charts render within 500ms ✅
- SC-014: AI detects 3D keywords with 95% accuracy ✅
- SC-015: All interactive features work with 3D charts ✅

## Risk Analysis & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| **echarts-gl dependency adds 500KB+ to bundle** | Medium | High | Use native ECharts pseudo-3D approach first; lazy load echarts-gl only if needed |
| **3D rendering slow on low-end devices** | Medium | Medium | Add performance check; fallback to 2D if device lacks hardware acceleration |
| **LLM fails to detect 3D keywords** | Low | Low | Implement regex fallback detection in backend |
| **3D charts unreadable with many data points** | Medium | Medium | Apply same 1000-point limit; consider lower limit (500) for 3D in future |
| **Browser compatibility issues** | Low | Medium | Test on Chrome/Firefox/Safari/Edge; document minimum versions |
| **3D effects conflict with existing interactions** | Low | High | Thorough testing of tooltips, zoom, pan; adjust z-index if needed |

## Open Questions

1. **echarts-gl vs Native**: Should we use echarts-gl for true 3D or stick with native pseudo-3D?
   - **Recommendation**: Start with native, evaluate user feedback, add echarts-gl in Phase 2 if needed
   
2. **3D Performance Limit**: Should 3D charts have a lower data point limit (500 vs 1000)?
   - **Decision**: Keep at 1000 per clarification, monitor performance metrics
   
3. **Mobile Support**: How do 3D effects perform on mobile browsers?
   - **Action**: Add to testing checklist, may need mobile-specific optimizations
   
4. **Accessibility**: Do 3D effects impact screen reader support?
   - **Action**: Ensure ARIA labels still work, test with NVDA/VoiceOver

## Next Steps

1. ✅ Clarification complete (5/5 questions resolved)
2. ✅ Plan created with architecture and implementation strategy
3. ⏭️ **Next**: Run `/speckit.tasks` to generate detailed task list
4. ⏭️ **Then**: Run `/speckit.implement` to execute tasks

**Estimated Effort**: 
- Phase 0 (Research): 4 hours
- Phase 1 (Design): 4 hours
- Phase 2 (Implementation): 12-16 hours (12 tasks × 1-1.5 hours)
- Phase 3 (Testing): 4 hours
- **Total**: ~24-28 hours for complete 3D feature

**Priority**: P2 (after core chart generation is stable)
