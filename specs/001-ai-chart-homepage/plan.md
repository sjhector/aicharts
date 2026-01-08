# Implementation Plan: AI Charts Homepage with Natural Language Chart Generation

**Branch**: `001-ai-chart-homepage` | **Date**: 2026-01-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ai-chart-homepage/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Create a Next.js web application homepage where users enter natural language prompts containing data, and the system automatically generates interactive charts. The LLM (via OpenAI SDK with DashScope) extracts data from prompts, determines the optimal chart type, and returns ECharts configuration JSON. The UI transforms from a centered input box to a bottom input + top chart display layout. Users can download charts as images, and the application operates statelessly without session persistence.

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
- Chart rendering < 500ms after config received
- UI layout transition < 300ms
- Chart interactions respond < 100ms
**Constraints**: 
- Maximum 1000 data points per chart
- Stateless operation (no session persistence)
- Initial bundle size optimized with lazy loading for ECharts
- LLM response format must be JSON object (ECharts config)
**Scale/Scope**: 
- Single-page application
- Support for 5+ chart types (line, bar, pie, scatter, area)
- Bilingual support (Chinese + English)
- Up to 1000 data points per visualization

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

**Structure Decision**: Next.js App Router with single homepage. All server logic in `app/api/generate-chart/route.ts`, all UI components in `app/components/` using shadcn/ui + Tailwind CSS, ECharts rendering via `chart-display.tsx`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: No violations. All requirements satisfied by constitutional stack.
