# Feature Specification: AI Charts Homepage with Natural Language Chart Generation

**Feature Branch**: `001-ai-chart-homepage`  
**Created**: 2026-01-07  
**Status**: Draft  
**Input**: User description: "我要创建一个叫做AI Charts的官网。该官网首页是一个居中输入框，用户可以输入任意和数据相关的提示词，然后发送给AI后，网站的布局就会发生变化。输入框在最底部，上方变成一个显示图表的区域。LLM能够自动的提取这段提示词中的数据和文本，选择一个最佳的图表进行渲染。如果用户指定了某个图表类型，那么就使用用户指定的该图表类型进行渲染。"

## Clarifications

### Session 2026-01-08

- Q: 3D图表的核心使用场景是什么？真3D空间数据展示 vs 伪3D视觉效果 vs 2D替代方案？ → A: 伪3D效果方案 - 使用阴影/渐变/透视增强2D图表，保持数据可读性和性能
- Q: 3D视觉效果应该应用到哪些图表类型？仅柱状图+散点图 vs 柱状图+饼图 vs 全部类型？ → A: 实现3D柱状图和3D饼图 - 这两种是3D效果最常用且视觉效果最佳的组合
- Q: 用户如何触发3D效果？关键词触发 vs 默认启用 vs 切换按钮 vs AI智能判断？ → A: 通过关键词触发 - 用户在提示词中包含"3D"、"立体"、"三维"等关键词来激活
- Q: 3D图表的性能和数据限制？保持1000点 vs 限制500点 vs 限制300点 vs 动态限制？ → A: 保持1000数据点限制 - 3D图表与2D图表使用相同的数据点上限
- Q: 3D视觉效果的具体参数？轻微3D(15°) vs 中等3D(30°) vs 强烈3D(45°) vs 用户可调？ → A: 使用中等强度3D效果 - 视角30°，柱体厚度20%，饼图厚度15%，平衡美观与可读性

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Basic Chart Generation from Natural Language (Priority: P1)

A user visits the AI Charts homepage and wants to visualize simple comparison data by typing a natural language prompt containing data points.

**Why this priority**: This is the core value proposition - enabling users to create charts instantly from natural language without learning chart syntax or tools. This delivers immediate value and validates the AI chart generation concept.

**Independent Test**: Can be fully tested by entering a text prompt with data (e.g., "Compare sales: Jan 100, Feb 150, Mar 200") and verifying a chart appears. This is the minimum viable product.

**Acceptance Scenarios**:

1. **Given** I am on the homepage with an empty centered input box, **When** I type a prompt containing numerical data and labels (e.g., "北京 120、130、150 vs 上海 100、140、160"), **Then** the input box moves to the bottom and a relevant chart appears above displaying the data
2. **Given** I have entered a data prompt, **When** the AI processes the data, **Then** I see a loading indicator while the chart is being generated
3. **Given** the AI has generated a chart, **When** I view the chart, **Then** it displays all the data points from my prompt accurately with proper labels
4. **Given** I have submitted a prompt, **When** the data cannot be parsed or is ambiguous, **Then** I see a helpful error message explaining the issue

---

### User Story 2 - Explicit Chart Type Selection (Priority: P2)

A user wants to specify which type of chart to use (line, bar, pie, scatter, etc.) rather than letting the AI choose automatically.

**Why this priority**: Gives users control over visualization style when they have specific preferences or requirements. Enhances usability but the system can function without it.

**Independent Test**: Can be tested by entering a prompt like "用柱状图展示销售数据: 1月 100, 2月 150" and verifying a bar chart is rendered instead of the AI's automatic choice.

**Acceptance Scenarios**:

1. **Given** I am entering a data prompt, **When** I specify a chart type in my text (e.g., "用折线图显示", "bar chart", "pie chart"), **Then** the system renders that specific chart type
2. **Given** I have specified a chart type, **When** the specified type is not suitable for the data (e.g., pie chart for time series), **Then** the system either adapts the visualization appropriately or warns me and suggests alternatives
3. **Given** I have specified a valid chart type, **When** the chart is rendered, **Then** it uses the requested type with appropriate default styling

---

### User Story 3 - Multi-Series Data Comparison (Priority: P2)

A user wants to compare multiple data series in a single chart (e.g., Beijing vs Shanghai sales across months).

**Why this priority**: Enables meaningful data analysis and comparison scenarios, which is a primary use case for data visualization. This adds significant analytical value.

**Independent Test**: Can be tested by entering a prompt with multiple labeled series (e.g., "比较北京和上海的销售额: 北京是 120、130、150; 上海是 100、140、160") and verifying both series appear in the same chart with distinct visual markers.

**Acceptance Scenarios**:

1. **Given** I enter a prompt with multiple data series, **When** the prompt clearly labels each series (e.g., "北京: 120, 130" and "上海: 100, 140"), **Then** the chart displays all series with distinct colors/styles and a legend
2. **Given** multiple series are displayed, **When** I view the chart, **Then** each series is clearly distinguishable with appropriate colors and line styles
3. **Given** I have multi-series data, **When** the AI selects a chart type, **Then** it chooses a type suitable for comparison (line, bar, grouped bar, etc.)

---

### User Story 4 - Chart Interaction and Exploration (Priority: P3)

A user wants to interact with the generated chart to explore data details through tooltips, zooming, and panning.

**Why this priority**: Enhances user experience and data exploration but not essential for the core value proposition. Users can still view and understand static charts.

**Independent Test**: Can be tested by generating any chart and verifying that hovering shows tooltips, mouse wheel enables zoom, and dragging enables panning.

**Acceptance Scenarios**:

1. **Given** a chart is displayed, **When** I hover over data points or bars, **Then** a tooltip appears showing the exact value and label
2. **Given** a chart with many data points, **When** I use mouse wheel or pinch gesture, **Then** I can zoom in and out to see details
3. **Given** a zoomed chart, **When** I click and drag, **Then** I can pan to view different sections of the data
4. **Given** I am interacting with the chart, **When** I use keyboard navigation (Tab, Arrow keys), **Then** I can navigate through data points for accessibility

---

### User Story 5 - Chart Export and Download (Priority: P2)

A user wants to download the generated chart as an image file to use in presentations, reports, or share with others.

**Why this priority**: Enables users to preserve and share their visualizations beyond the web interface. This is a common expected feature for chart tools that adds significant practical value.

**Independent Test**: Can be tested by generating any chart and clicking a download button to verify that a PNG or SVG file is saved to the user's device.

**Acceptance Scenarios**:

1. **Given** a chart is displayed, **When** I click the download/export button, **Then** the chart is saved as an image file (PNG or SVG) to my device
2. **Given** I want to download a chart, **When** the download completes, **Then** the file name includes a timestamp or chart description for easy identification
3. **Given** a chart is being downloaded, **When** the export process is running, **Then** I see a brief loading indicator or confirmation message

---

### User Story 6 - 3D Visual Effects for Bar and Pie Charts (Priority: P2)

A user wants to create visually enhanced charts with 3D effects (depth, shadows, perspective) for presentations or visual impact, while maintaining data readability.

**Why this priority**: Provides visual enhancement for presentation and marketing materials. 3D effects make charts more engaging for non-technical audiences. This is an optional visual enhancement that doesn't affect core functionality.

**Independent Test**: Can be tested by entering a prompt like "用3D柱状图展示销售数据: Q1 100, Q2 150, Q3 200" and verifying a bar chart with 3D visual effects (depth, shadows, perspective angle) is rendered.

**Acceptance Scenarios**:

1. **Given** I am entering a data prompt, **When** I include 3D keywords ("3D", "立体", "三维", "3d bar chart") in my text, **Then** the system renders the chart with 3D visual effects applied
2. **Given** I have specified a 3D chart type, **When** the chart is rendered, **Then** it displays with appropriate 3D parameters: 30° viewing angle for bar charts, 15% thickness for pie charts, medium shadow intensity
3. **Given** I request a 3D chart, **When** the chart type is bar or pie, **Then** the system applies 3D effects; for other chart types (line, scatter, area), the system uses standard 2D rendering
4. **Given** I have generated a 3D chart, **When** I interact with it, **Then** all standard interactions (tooltips, zoom, pan) continue to work correctly
5. **Given** I request a 3D chart with more than 1000 data points, **When** the system processes the request, **Then** it applies the same data point limits as 2D charts

---

### Edge Cases

- What happens when the user enters a prompt with no discernible numerical data? → **System must display an alert message prompting user to enter content with data**
- How does the system handle datasets exceeding 1000 data points? → **System should either truncate with a warning or reject the prompt**
- What happens when the user enters mixed languages (Chinese and English) in the same prompt?
- How does the system handle ambiguous data formats (e.g., "100-200" - is this a range or two values)?
- What happens when the user specifies a chart type that doesn't exist (e.g., "quantum chart")?
- How does the system handle special characters or malformed input in the prompt?
- What happens when the AI service is unavailable or times out?
- What happens when the user tries to download a chart before it's fully rendered?
- What happens when the user requests 3D effects for unsupported chart types (line, scatter, area)? → **System should fall back to standard 2D rendering**
- What happens when the user specifies both 2D and 3D keywords in the same prompt (e.g., "flat 3D bar chart")? → **3D keywords take precedence**
- How does 3D rendering perform on low-end devices or older browsers? → **System uses hardware-accelerated CSS transforms and ECharts GPU rendering**

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a homepage with a centered text input box for entering natural language prompts
- **FR-002**: System MUST accept natural language prompts in multiple languages (at minimum: English and Chinese)
- **FR-003**: API Route MUST extract numerical data, labels, and metadata from user prompts using LLM
- **FR-004**: API Route MUST determine the optimal chart type based on data structure and user intent when no explicit type is specified
- **FR-005**: System MUST support explicit chart type specification within the prompt (e.g., "bar chart", "line chart", "pie chart", "柱状图", "折线图")
- **FR-006**: System MUST transform the homepage layout after chart generation: input box moves to bottom, chart area appears at top
- **FR-007**: System MUST render charts using Apache ECharts with the extracted data and selected chart type
- **FR-008**: System MUST support multi-series data visualization (comparing multiple datasets in one chart)
- **FR-009**: UI MUST display loading states while the AI processes the prompt and generates the chart
- **FR-010**: UI MUST display clear error messages when data cannot be parsed or chart cannot be generated
- **FR-011**: System MUST display an alert dialog when user input contains no extractable numerical data, prompting them to enter content with data
- **FR-012**: System MUST reject or truncate prompts containing more than 1000 data points with appropriate warning message
- **FR-013**: System MUST provide data formatting capabilities to ensure consistent display of numbers (decimal places, thousands separators, currency symbols)
- **FR-014**: System MUST provide chart download functionality allowing users to export charts as image files (PNG or SVG format)
- **FR-015**: Charts MUST include interactive features: tooltips on hover, zoom capability, and pan functionality
- **FR-016**: System MUST validate and sanitize all user input before processing to prevent injection attacks
- **FR-017**: Charts MUST include ARIA labels and support keyboard navigation for accessibility (WCAG 2.1 Level AA)
- **FR-018**: System MUST handle prompts with time-series data (dates, months, years) and format axes appropriately
- **FR-019**: API Route MUST return structured chart configuration (chart type, data series, labels, colors) to the frontend
- **FR-020**: System operates as a stateless one-time application with no chart history or session persistence
- **FR-021**: System MUST support 3D visual effects for bar charts and pie charts when user includes 3D keywords ("3D", "立体", "三维") in the prompt
- **FR-022**: 3D bar charts MUST render with 30° viewing angle, 20% column depth, and medium shadow intensity (opacity 0.3)
- **FR-023**: 3D pie charts MUST render with 15% thickness (based on radius), 25° tilt angle, and gradient highlights
- **FR-024**: System MUST apply the same 1000 data point limit to both 2D and 3D charts
- **FR-025**: When user requests 3D effects for unsupported chart types (line, scatter, area), system MUST render standard 2D chart without error

### Key Entities

- **ChartPrompt**: User's natural language input containing data and visualization intent; attributes include raw text, language, timestamp, user session identifier, 3D effect indicators (keywords like "3D", "立体", "三维")
- **ExtractedData**: Structured data parsed from the prompt; attributes include data series (array of values), labels (array of strings), data types (numerical, categorical, temporal), series names
- **ChartConfiguration**: Complete specification for rendering a chart; attributes include chart type (line, bar, pie, scatter, etc.), data series, axis labels, title, colors, interaction settings, visual mode (2D or 3D), 3D parameters (viewing angle, depth, shadow intensity)
- **ChartType**: The visualization format; supported types include line chart, bar chart (2D/3D), pie chart (2D/3D), scatter plot, area chart, stacked bar, grouped bar (extensible list)
- **VisualMode3D**: 3D rendering parameters; attributes include viewing angle (degrees), depth/thickness (percentage), shadow intensity (opacity 0-1), tilt angle (for pie charts)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can generate a chart from a natural language prompt within 5 seconds end-to-end (including AI processing time)
- **SC-002**: AI successfully extracts data and generates appropriate charts for 90% of well-formed prompts containing numerical data
- **SC-003**: Charts render and become interactive within 500ms after receiving chart configuration from the API
- **SC-004**: UI layout transition (input box moving to bottom, chart appearing at top) completes within 300ms
- **SC-005**: All chart interactions (hover tooltips, zoom, pan) respond within 100ms of user action
- **SC-006**: System handles prompts with up to 1000 data points total without performance degradation
- **SC-007**: Alert messages are displayed immediately when user input contains no extractable data
- **SC-008**: Error messages are displayed within 2 seconds when data cannot be parsed for other reasons
- **SC-009**: Chart download completes within 2 seconds and produces a valid image file
- **SC-010**: All interactive elements (input box, chart controls, download button) are accessible via keyboard navigation
- **SC-011**: Users can successfully specify chart types in prompts with 95% accuracy when using supported keywords
- **SC-012**: Data formatting displays numbers consistently and correctly across all chart types
- **SC-013**: 3D charts render within 500ms for datasets up to 1000 data points on standard hardware
- **SC-014**: AI successfully detects 3D keywords ("3D", "立体", "三维") with 95% accuracy when present in prompts
- **SC-015**: 3D visual effects apply correctly to bar and pie charts while maintaining all interactive features (tooltips, zoom, pan)

## Assumptions *(optional)*

- Users have modern web browsers with JavaScript enabled (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+) and hardware acceleration support for 3D rendering
- LLM service (e.g., OpenAI GPT, Claude, or similar) is available via API for natural language processing
- Users will primarily enter prompts with structured data (numbers + labels) rather than requesting data retrieval from external sources
- Initial version will focus on common chart types (line, bar, pie, scatter, area) with 3D visual effects available for bar and pie charts
- Prompts will typically contain between 2 and 1000 data points total (hard limit enforced for both 2D and 3D charts)
- Users understand basic data visualization concepts (what a bar chart vs line chart represents)
- 3D effects use pseudo-3D rendering (perspective, shadows, depth) rather than true 3D space with Z-axis data
- Application is designed as a one-time use tool - no session persistence, history tracking, or user accounts
- Each chart generation is independent with no state carried between sessions
- Users will download charts if they want to preserve them - no server-side storage provided

## Scope & Boundaries *(optional)*

### In Scope

- Natural language prompt processing for chart generation
- Support for Chinese and English language prompts
- Basic chart types: line, bar, pie, scatter, area charts
- 3D visual effects for bar charts and pie charts (pseudo-3D with perspective, shadows, depth)
- Multi-series data visualization (up to 1000 total data points for both 2D and 3D charts)
- Interactive chart features (tooltips, zoom, pan) working with both 2D and 3D charts
- Chart download/export as image files (PNG/SVG) including 3D rendered charts
- Data formatting for consistent number display
- Alert dialog when no extractable data is found in user input
- Responsive layout transformation (centered input → bottom input + chart area)
- Error handling and loading states
- Accessibility features for keyboard navigation
- Stateless one-time operation (no history or session persistence)

### Out of Scope (Future Enhancements)

- User authentication and saved charts
- Chart history or session persistence between page reloads
- Real-time collaborative editing
- Data source integrations (uploading CSV, connecting to databases)
- True 3D charts with Z-axis data (spatial coordinates, volumetric data)
- 3D effects for line charts, scatter plots, and area charts (only bar and pie charts supported initially)
- Advanced chart types (map visualizations, network graphs, heatmaps, treemaps)
- Interactive 3D rotation controls or adjustable viewing angles (fixed perspective angles used)
- Interactive chart customization UI (colors, fonts, themes) beyond AI suggestions
- Multiple charts on the same page
- Chart editing after generation (regenerate from scratch instead)
- Mobile app version (initial focus is web)
- PDF export format (only PNG/SVG initially)

## Dependencies *(optional)*

- **LLM API Service**: Requires access to a language model API (OpenAI, Anthropic Claude, or similar) for natural language understanding and data extraction
- **Next.js Framework**: Application built on Next.js 16+ with App Router
- **Apache ECharts**: Chart rendering library
- **Tailwind CSS + shadcn/ui**: UI component framework for consistent styling
- **TypeScript**: Type-safe development environment
