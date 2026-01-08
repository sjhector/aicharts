---
description: "Implementation tasks for AI Charts Homepage"
---

# Tasks: AI Charts Homepage with Natural Language Chart Generation

**Input**: Design documents from `/specs/001-ai-chart-homepage/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/generate-chart.openapi.yaml

**Tests**: No explicit test tasks - focus on implementation and manual testing checklist in quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js App Router**: `app/api/` for backend routes, `app/` for pages, `app/components/` for UI
- **Components**: `app/components/ui/` for shadcn/ui, `app/components/` for custom
- **Libraries**: `app/lib/` for utilities, types, API clients

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Install required npm packages: openai, echarts, echarts-for-react
- [X] T002 [P] Configure environment variables in .env.local (DASHSCOPE_API_KEY)
- [X] T003 [P] Install shadcn/ui components: button, card, alert, input, textarea
- [X] T004 [P] Create TypeScript types in app/lib/types.ts (ChartPrompt, ExtractedData, ChartConfiguration, APIRequest, APIResponse, ChartType)
- [X] T005 Create Tailwind CSS utility helpers in app/lib/utils.ts (cn function, formatters)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Create LLM system prompt in app/lib/llm-prompts.ts with comprehensive ECharts generation instructions
- [X] T007 [P] Create API client utilities in app/lib/api-client.ts (fetch wrapper, error handling)
- [X] T008 [P] Create ECharts configuration utilities in app/lib/echarts-config.ts (validation, formatting)
- [X] T009 Setup root layout in app/layout.tsx with Tailwind CSS imports and metadata
- [X] T010 Create homepage structure in app/page.tsx with state management (chartConfig, loading, error)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Basic Chart Generation from Natural Language (Priority: P1) 🎯 MVP

**Goal**: Enable users to enter natural language prompts and generate charts automatically

**Independent Test**: Enter "比较北京和上海: 北京 120、130、150, 上海 100、140、160" and verify chart appears with correct data

### Implementation for User Story 1

- [X] T011 [P] [US1] Create API route in app/api/generate-chart/route.ts - setup OpenAI client with DashScope configuration
- [X] T012 [US1] Implement POST handler in app/api/generate-chart/route.ts - parse request, validate input length
- [X] T013 [US1] Implement LLM call in app/api/generate-chart/route.ts - use system prompt, set response_format to json_object
- [X] T014 [US1] Add LLM response parsing in app/api/generate-chart/route.ts - extract ECharts config from JSON
- [X] T015 [US1] Implement "no_data" error detection in app/api/generate-chart/route.ts - check for LLM error response
- [X] T016 [US1] Add ECharts config validation in app/api/generate-chart/route.ts - validate series, chart type, data points
- [X] T017 [US1] Implement error handling in app/api/generate-chart/route.ts - rate limits, timeouts, server errors
- [X] T018 [P] [US1] Create chart input component in app/components/chart-input.tsx using shadcn/ui Textarea and Button
- [X] T019 [P] [US1] Add form submission logic to app/components/chart-input.tsx - call API client, handle loading state
- [X] T020 [P] [US1] Create loading indicator component in app/components/loading-indicator.tsx using Tailwind CSS animations
- [X] T021 [P] [US1] Create chart display component in app/components/chart-display.tsx using echarts-for-react with dynamic import
- [X] T022 [US1] Integrate chart-input and chart-display components in app/page.tsx with layout transformation logic
- [X] T023 [US1] Implement Tailwind CSS transitions in app/page.tsx for input box movement and chart area appearance
- [X] T024 [US1] Add alert dialog in app/page.tsx for "no_data" error using shadcn/ui Alert component
- [X] T025 [US1] Add error message display in app/page.tsx for other error types (validation_failed, rate_limit, server_error)

**Checkpoint**: At this point, User Story 1 should be fully functional - users can generate basic charts from natural language

---

## Phase 4: User Story 2 - Explicit Chart Type Selection (Priority: P2)

**Goal**: Allow users to specify chart type in their prompts (e.g., "用柱状图", "line chart")

**Independent Test**: Enter "用柱状图展示: 1月 100, 2月 150, 3月 200" and verify a bar chart is rendered

### Implementation for User Story 2

- [X] T026 [US2] Update LLM system prompt in app/lib/llm-prompts.ts to include chart type keywords (line, bar, pie, scatter, area) in Chinese and English
- [X] T027 [US2] Add chart type detection logic in LLM prompt - instruct LLM to respect user's explicit chart type specification
- [X] T028 [US2] Add chart type validation in app/api/generate-chart/route.ts - ensure requested type is supported
- [X] T029 [US2] Implement chart type suitability check in LLM prompt - warn when type doesn't match data (e.g., pie for time series)

**Checkpoint**: Users can now specify desired chart types explicitly in their prompts

---

## Phase 5: User Story 3 - Multi-Series Data Comparison (Priority: P2)

**Goal**: Enable comparison of multiple data series in a single chart with distinct visual markers

**Independent Test**: Enter "比较北京和上海的销售额: 北京是 120、130、150; 上海是 100、140、160" and verify both series with legend

### Implementation for User Story 3

- [X] T030 [US3] Update LLM system prompt in app/lib/llm-prompts.ts to handle multi-series data extraction
- [X] T031 [US3] Add series color assignment logic in LLM prompt - generate distinct colors for each series
- [X] T032 [US3] Add legend configuration in LLM prompt - include all series names
- [X] T033 [US3] Update ECharts validation in app/api/generate-chart/route.ts - support multiple series in config
- [X] T034 [US3] Enhance chart display component in app/components/chart-display.tsx to handle multi-series rendering with proper legend positioning

**Checkpoint**: Charts can now display multiple data series with clear visual distinction

---

## Phase 6: User Story 5 - Chart Export and Download (Priority: P2)

**Goal**: Allow users to download generated charts as PNG or SVG images

**Independent Test**: Generate any chart and click download button, verify PNG file is saved with timestamp

### Implementation for User Story 5

- [X] T035 [P] [US5] Create chart download component in app/components/chart-download.tsx using shadcn/ui Button
- [X] T036 [US5] Implement ECharts export logic in app/components/chart-download.tsx using getDataURL() method
- [X] T037 [US5] Add file download trigger in app/components/chart-download.tsx - create download link with timestamp filename
- [X] T038 [US5] Configure high-DPI export in app/components/chart-download.tsx - set pixelRatio: 2, backgroundColor: '#fff'
- [X] T039 [US5] Add download button to app/components/chart-display.tsx or app/page.tsx - position appropriately
- [X] T040 [US5] Add loading indicator for download process in app/components/chart-download.tsx

**Checkpoint**: Users can now export charts as image files for sharing and presentations

---

## Phase 7: User Story 4 - Chart Interaction and Exploration (Priority: P3)

**Goal**: Enable interactive exploration through tooltips, zooming, and panning

**Independent Test**: Generate a chart, hover for tooltips, use mouse wheel to zoom, drag to pan

### Implementation for User Story 4

- [X] T041 [P] [US4] Update LLM prompt in app/lib/llm-prompts.ts to include tooltip configuration with trigger: "axis"
- [X] T042 [P] [US4] Add zoom and pan toolbox in LLM prompt - include dataZoom feature in ECharts config
- [X] T043 [US4] Configure tooltip formatter in LLM prompt - show exact values with labels
- [X] T044 [US4] Update chart display component in app/components/chart-display.tsx to enable zoom and pan interactions
- [X] T045 [US4] Add keyboard navigation support in app/components/chart-display.tsx for accessibility (Tab, Arrow keys)
- [X] T046 [US4] Test and optimize interaction performance in app/components/chart-display.tsx - ensure <100ms response time

**Checkpoint**: Charts are now fully interactive with rich exploration features

---

## Phase 8: Data Formatting and Validation (Cross-Cutting)

**Purpose**: Implement data formatting and 1000-point limit enforcement

- [X] T047 [P] Add number formatting utilities in app/lib/utils.ts (decimal places, thousands separators, currency)
- [X] T048 Add data point counting logic in app/api/generate-chart/route.ts - sum all series data lengths
- [X] T049 Implement 1000-point limit check in app/api/generate-chart/route.ts - reject or truncate with warning
- [X] T050 Update LLM prompt in app/lib/llm-prompts.ts to include data formatting instructions (numbers, decimals, units)
- [X] T051 Add data formatting validation in app/lib/echarts-config.ts - ensure consistent number display across chart types

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final touches, optimization, and production readiness

- [X] T052 [P] Add comprehensive error logging in app/api/generate-chart/route.ts for debugging
- [ ] T053 [P] Implement input sanitization in app/api/generate-chart/route.ts to prevent injection attacks
- [ ] T054 [P] Add ARIA labels to chart components in app/components/chart-display.tsx for screen readers
- [ ] T055 [P] Optimize ECharts bundle size in app/components/chart-display.tsx - use tree shaking, lazy loading
- [ ] T056 Add responsive design handling in app/page.tsx - ensure layout works on mobile and tablet
- [ ] T057 Test and optimize layout transition timing in app/page.tsx - ensure <300ms performance
- [ ] T058 Add metadata and SEO tags in app/layout.tsx (title, description, Open Graph)
- [ ] T059 Create .env.example file with placeholder for DASHSCOPE_API_KEY
- [ ] T060 Update README.md with setup instructions and feature overview

---

## Dependencies

### User Story Completion Order

```
Phase 1 (Setup) → Phase 2 (Foundation) ──┐
                                           ├─→ Phase 3 (US1: Basic Chart) ─→ MVP Complete ✅
                                           │
                                           ├─→ Phase 4 (US2: Chart Type Selection)
                                           │
                                           ├─→ Phase 5 (US3: Multi-Series)
                                           │
                                           ├─→ Phase 6 (US5: Download)
                                           │
                                           └─→ Phase 7 (US4: Interactions)
                                           
Phase 8 (Data Formatting) - Can run parallel to US2-US5
Phase 9 (Polish) - After all user stories complete
```

### Critical Path

1. **T001-T010**: Setup + Foundation (blocking)
2. **T011-T025**: User Story 1 (MVP)
3. **T026-T029**: User Story 2 (parallel to US3, US5)
4. **T030-T034**: User Story 3 (parallel to US2, US5)
5. **T035-T040**: User Story 5 (parallel to US2, US3)
6. **T041-T046**: User Story 4
7. **T047-T051**: Data Formatting
8. **T052-T060**: Polish

### Parallel Execution Opportunities

**After Foundation (T010 complete)**:
- Can work on T011-T017 (API route) AND T018-T021 (UI components) simultaneously
- Different files, no dependencies

**After User Story 1 (T025 complete)**:
- Can work on US2 (T026-T029), US3 (T030-T034), and US5 (T035-T040) in parallel
- Each story modifies different aspects

**During Polish**:
- Tasks T052-T060 can mostly run in parallel (different files)

---

## Implementation Strategy

### MVP Scope (Week 1)
- **Phase 1**: Setup (T001-T005)
- **Phase 2**: Foundation (T006-T010)
- **Phase 3**: User Story 1 (T011-T025)
- **Phase 8**: Basic data validation (T048-T049)

**Deliverable**: Working homepage where users can generate charts from natural language prompts

### Enhancement Scope (Week 2)
- **Phase 4**: User Story 2 (T026-T029)
- **Phase 5**: User Story 3 (T030-T034)
- **Phase 6**: User Story 5 (T035-T040)
- **Phase 8**: Full data formatting (T047, T050-T051)

**Deliverable**: Multi-series charts, chart type control, download functionality

### Polish Scope (Week 3)
- **Phase 7**: User Story 4 (T041-T046)
- **Phase 9**: Polish (T052-T060)

**Deliverable**: Production-ready application with full interactivity and optimizations

---

## Task Statistics

- **Total Tasks**: 60
- **Setup**: 5 tasks (T001-T005)
- **Foundation**: 5 tasks (T006-T010)
- **User Story 1 (P1)**: 15 tasks (T011-T025) - MVP
- **User Story 2 (P2)**: 4 tasks (T026-T029)
- **User Story 3 (P2)**: 5 tasks (T030-T034)
- **User Story 5 (P2)**: 6 tasks (T035-T040)
- **User Story 4 (P3)**: 6 tasks (T041-T046)
- **Data Formatting**: 5 tasks (T047-T051)
- **Polish**: 9 tasks (T052-T060)

**Parallel Opportunities**: 23 tasks marked with [P] can be executed simultaneously with others

**Independent Test Criteria**: Each user story phase has clear test scenarios for validation

---

## Validation Checklist

- [x] All user stories from spec.md have implementation tasks
- [x] Tasks follow strict checklist format: `- [ ] [ID] [P?] [Story?] Description with path`
- [x] Each task includes specific file path
- [x] Tasks organized by user story for independent implementation
- [x] MVP scope clearly identified (Phase 3 - User Story 1)
- [x] Dependencies documented showing completion order
- [x] Parallel execution opportunities identified
- [x] Constitution requirements addressed: API Routes (T011-T017), shadcn/ui (T003, T018), ECharts (T021), TypeScript (T004)
- [x] All functional requirements mapped to tasks
- [x] Data validation tasks included (T048-T049, T051)
- [x] Error handling tasks included (T015, T017, T024-T025)
- [x] Accessibility tasks included (T045, T054)
- [x] Performance optimization tasks included (T055, T057)
