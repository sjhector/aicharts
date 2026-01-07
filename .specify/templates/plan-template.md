# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Framework**: Next.js 16+ (App Router)
**Language/Version**: TypeScript 5+
**Runtime**: Node.js 20+
**Primary Dependencies**: React, Tailwind CSS 4+, shadcn/ui, Apache ECharts
**Storage**: [if applicable, e.g., PostgreSQL, MongoDB, Redis, or N/A]
**Testing**: Vitest/Jest for unit tests, Playwright for E2E [or NEEDS CLARIFICATION]
**Target Platform**: Web (modern browsers)
**Project Type**: web (Next.js full-stack application)
**Performance Goals**: [domain-specific, e.g., <3s initial load, <100ms chart rendering, or NEEDS CLARIFICATION]
**Constraints**: [domain-specific, e.g., <500KB initial JS bundle, responsive design required, or NEEDS CLARIFICATION]
**Scale/Scope**: [domain-specific, e.g., 10k concurrent users, 100+ chart types, or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [ ] API Routes Architecture: All backend functionality uses Next.js API Routes (`app/api/`)
- [ ] Component Framework Standards: All UI uses Tailwind CSS + shadcn/ui components
- [ ] Charting Library Standard: All charts use Apache ECharts (no alternative libraries)
- [ ] TypeScript strict mode enabled
- [ ] Clear API contracts defined with request/response types
- [ ] Error handling and loading states implemented
- [ ] Accessibility standards (WCAG 2.1 Level AA) met

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., app/api/charts, app/dashboard). The delivered plan must
  not include Option labels.
-->

```text
# Next.js App Router Structure (DEFAULT for this project)
app/
├── api/              # Backend API Routes (ALL server logic goes here)
│   └── [feature]/
│       └── route.ts
├── [feature]/        # Frontend pages
│   ├── page.tsx
│   └── layout.tsx
├── components/       # Reusable UI components (shadcn/ui + custom)
│   ├── ui/          # shadcn/ui components
│   └── charts/      # ECharts wrapper components
├── lib/             # Utilities, helpers, types, API clients
│   ├── utils.ts
│   ├── types.ts
│   └── api.ts
└── globals.css      # Tailwind CSS imports

public/              # Static assets (images, fonts)

tests/               # Test files (if applicable)
├── unit/
└── e2e/
```

**Structure Decision**: Next.js App Router with integrated frontend/backend. All server logic in `app/api/` routes, all UI in page components using shadcn/ui + Tailwind CSS, all charts using ECharts.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., Using Chart.js instead of ECharts] | [specific technical requirement] | [why ECharts cannot fulfill the need] |
| [e.g., CSS Modules instead of Tailwind] | [specific justification] | [why Tailwind + shadcn/ui insufficient] |
