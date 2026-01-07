<!--
Sync Impact Report:
- Version: NEW → 1.0.0 (Initial ratification)
- Modified principles: N/A (Initial creation)
- Added sections: Core Principles (3), Technology Stack Requirements, Development Standards, Governance
- Removed sections: N/A
- Templates requiring updates:
  ✅ plan-template.md (Technical Context updated to reflect Next.js + React architecture)
  ✅ spec-template.md (Requirements aligned with API Routes + UI component standards)
  ✅ tasks-template.md (Sample tasks reflect frontend/backend separation)
- Follow-up TODOs: None
-->

# AICharts Constitution

## Core Principles

### I. API Routes Architecture

All backend functionality MUST be implemented using Next.js API Routes within the `app/api/` directory. Frontend components MUST call backend APIs rather than directly accessing data sources or performing server-side logic. This ensures:

- Clear separation between client and server concerns
- Type-safe API contracts using TypeScript
- Consistent request/response patterns across all features
- Proper error handling and status codes
- Testable API endpoints independent of UI

**Rationale**: API Routes provide a full-stack framework with built-in optimization, TypeScript support, and seamless integration with Next.js features like Server Actions and caching.

### II. Component Framework Standards

All frontend UI components MUST be built using Tailwind CSS for styling and shadcn/ui for component primitives. Direct use of inline styles, CSS modules, or alternative UI libraries is prohibited unless explicitly justified. Components MUST:

- Use Tailwind utility classes for all styling
- Leverage shadcn/ui components (Button, Card, Dialog, etc.) as building blocks
- Maintain consistent design tokens (colors, spacing, typography)
- Support responsive design using Tailwind breakpoints
- Follow accessibility best practices provided by shadcn/ui

**Rationale**: Tailwind CSS + shadcn/ui provides a cohesive, maintainable styling system with excellent TypeScript support, accessibility defaults, and rapid development velocity.

### III. Charting Library Standard

All data visualization and charting components MUST use Apache ECharts. No alternative charting libraries (Chart.js, Recharts, D3.js, etc.) are permitted without constitutional amendment. Chart implementations MUST:

- Use the official `echarts` or `echarts-for-react` package
- Declare chart options using TypeScript types
- Support responsive sizing and theme customization
- Handle loading states and error scenarios
- Document chart configuration and data format requirements

**Rationale**: ECharts provides enterprise-grade charting capabilities with extensive chart types, high performance for large datasets, and strong TypeScript support, ensuring consistency across all visualizations.

## Technology Stack Requirements

**Framework**: Next.js 16+ (App Router)
**Language**: TypeScript 5+
**Runtime**: Node.js 20+
**Styling**: Tailwind CSS 4+ with shadcn/ui components
**Charts**: Apache ECharts (echarts or echarts-for-react)
**State Management**: React hooks (useState, useContext, etc.) or Zustand if global state needed
**API Layer**: Next.js API Routes (`app/api/**/*.ts`)
**Testing**: Vitest or Jest for unit tests, Playwright for E2E tests (when applicable)
**Linting/Formatting**: ESLint + Prettier with Next.js configuration

**Project Structure**:

```
app/
├── api/              # All backend API routes
│   └── [feature]/
│       └── route.ts
├── [feature]/        # Frontend pages
│   └── page.tsx
├── components/       # Reusable UI components (shadcn/ui + custom)
├── lib/              # Utilities, helpers, types
└── globals.css       # Tailwind CSS imports

public/               # Static assets
```

## Development Standards

**Type Safety**: All code MUST use TypeScript strict mode. No `any` types except when interfacing with untyped third-party libraries (document with comment).

**API Contracts**: API Routes MUST define clear request/response types. Use Zod or similar for runtime validation when handling user input.

**Component Design**: React components MUST be functional components using hooks. Class components are prohibited. Prefer composition over prop drilling (use Context or composition patterns).

**Error Handling**: API Routes MUST return appropriate HTTP status codes and structured error messages. Frontend MUST handle loading, error, and empty states for all async operations.

**Performance**: Leverage Next.js optimizations (Server Components, streaming, caching). Lazy load ECharts components to minimize initial bundle size.

**Accessibility**: All interactive UI MUST meet WCAG 2.1 Level AA standards. Use shadcn/ui components' built-in accessibility features.

## Governance

This constitution supersedes all other development practices and guidelines. Amendments require:

1. Documented justification and impact analysis
2. Update to this constitution with version increment
3. Migration plan for affected code if applicable
4. Approval before merging changes

**Version Increment Rules**:

- MAJOR: Breaking changes to core principles (e.g., changing framework or charting library)
- MINOR: New principles added or significant expansions
- PATCH: Clarifications, examples, or non-semantic refinements

**Compliance**: All feature specifications, plans, and pull requests MUST verify compliance with these principles. Violations must be justified in writing and approved before implementation.

**Version**: 1.0.0 | **Ratified**: 2026-01-07 | **Last Amended**: 2026-01-07
