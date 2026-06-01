# Project Structure

## Project Overview

**Name:** 생활계산소 (Living Calculator)  
**Type:** React Single Page Application (SPA)  
**Purpose:** A collection of everyday life calculators for Korean users — budgeting, resignation/severance, waste sorting, room furniture layout, and more.  
**Deployed at:** GitHub Pages, base path `/check-income-calc/`  
**Router type:** HashRouter (required for GitHub Pages static hosting)

---

## Top-Level Directory Layout

```
check-income-calc/
├── src/                    # All application source code
├── public/                 # Static assets served as-is
├── dist/                   # Build output (generated, not committed)
├── .github/workflows/      # CI/CD — GitHub Pages deploy workflow
├── CLAUDE.md               # AI assistant entry guide
├── docs/                   # Project documentation (this directory)
├── index.html              # Vite HTML entry point
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── eslint.config.js
└── README.md               # Vite template README (not project-specific)
```

---

## Source Directory Layout

```
src/
├── main.tsx                # React root — renders <App /> into #root
├── App.tsx                 # Router setup, all route definitions
├── index.css               # Global styles and CSS design tokens
├── App.css                 # Minimal global overrides
├── types.ts                # Shared global types (BudgetState, ExpenseItem, etc.)
│
├── pages/                  # Route-level page components
│   ├── HomePage.tsx        # / — hero, recent tool, budget preview, featured tools
│   ├── ToolsPage.tsx       # /tools — full tool catalog
│   ├── ComingSoonPage.tsx  # Placeholder for unreleased tools
│   └── tools/              # Individual tool page wrappers
│       ├── BudgetPage.tsx
│       ├── ResignationPage.tsx
│       ├── WasteSortingPage.tsx
│       └── RoomSimulatorPage.tsx
│
├── components/             # Shared/reusable UI components
│   ├── layout/
│   │   ├── AppLayout.tsx   # Root layout: sticky header + <main>
│   │   └── AppHeader.tsx   # Top nav bar with logo and nav links
│   ├── tools/
│   │   ├── ToolCard.tsx    # Card used in tool lists
│   │   └── ToolSection.tsx # Section wrapper for tool categories
│   ├── ads/
│   │   └── AdBannerSlot.tsx # Ad slot component (placeholder)
│   ├── ThemeSwitch.tsx     # Binance ↔ Revolut theme toggle button
│   └── [BudgetPage-specific components]
│       ├── SalaryInput.tsx
│       ├── ExpenseItem.tsx
│       ├── ExpenseList.tsx
│       ├── BudgetSummary.tsx
│       ├── BudgetFeedback.tsx
│       ├── BudgetRatioDonutChart.tsx
│       ├── SpendingHealthScore.tsx
│       ├── AnnualSavingsProjection.tsx
│       ├── GoalAchievementCalculator.tsx
│       └── SavingsTargetInput.tsx
│
├── context/                # React Context providers
│   ├── ThemeContext.tsx    # Theme state (binance | revolut), persisted to localStorage
│   └── BudgetContext.tsx   # Budget state with useReducer, persisted to localStorage
│
├── data/
│   └── tools.ts            # TOOLS array — source of truth for all tool metadata, paths, categories
│
├── lib/                    # Shared pure utilities
│   ├── calc.ts             # Budget calculation functions, formatKRW
│   └── storage.ts          # Budget localStorage load/save/clear
│
├── utils/
│   └── recentTools.ts      # Tracks last-used tool in localStorage
│
├── features/               # Framework-agnostic logic layer
│   └── room-layout/        # Room layout engine (pure TypeScript, no React)
│       ├── types.ts        # Room, Furniture, LayoutSummary, LayoutWarning types
│       ├── geometry.ts     # Collision detection, area, clearance functions
│       ├── layoutEngine.ts # Orchestrates geometry into getLayoutSummary()
│       ├── unit.ts         # Unit conversion (cm ↔ m), validation
│       ├── presets.ts      # Room and furniture presets (mm-based)
│       ├── export/
│       │   ├── exportLayoutImage.ts  # canUseNativeShare, getExportFileName, downloadLayoutImage, shareLayoutImage
│       │   └── exportSummary.ts      # getMainLayoutWarning, formatLayoutExportSummary
│       └── __tests__/
│           └── layoutEngine.test.ts
│
└── tools/                  # React UI layer for each tool
    ├── resignation/        # Severance + unemployment benefit calculator
    │   ├── ResignationCalculator.tsx  # Main component
    │   ├── components/     # Form sections, result display
    │   ├── constants/policy.ts
    │   ├── data/policy-config.json
    │   ├── storage.ts
    │   ├── types.ts
    │   └── utils/
    │       ├── calc.ts
    │       ├── policyLoader.ts
    │       └── __tests__/calc.test.ts
    │
    ├── room-simulator/     # 2D furniture layout simulator
    │   ├── RoomSimulatorTool.tsx  # 3-step wizard (room → furniture → result)
    │   ├── types.ts        # FurnitureItem, Room, ClearanceWarning (UI layer)
    │   ├── components/
    │   │   ├── RoomSetup.tsx      # Step 1: room dimensions + presets
    │   │   ├── RoomCanvas.tsx     # Step 2: interactive 2D layout canvas
    │   │   ├── FurniturePanel.tsx # Step 2: add/edit/delete furniture
    │   │   └── ResultSummary.tsx  # Step 3: occupancy stats, warnings, export
    │   ├── data/presets.ts        # Furniture presets, color palette
    │   └── utils/
    │       ├── geometry.ts        # UI-layer geometry helpers
    │       ├── formatters.ts      # Number/dimension formatting
    │       └── export.ts          # createLayoutBlob, shareOrDownload
    │
    └── waste-sorting/      # Waste disposal guide (food vs general trash)
        ├── WasteSortingTool.tsx
        ├── types.ts
        ├── components/
        ├── data/           # wasteItems, wasteCategories, disposalTips
        └── utils/          # search, chosung (Korean initial search), storage, resultConfig
```

---

## Routing

All routes are defined in [src/App.tsx](../src/App.tsx).  
HashRouter is used — URLs look like `/#/tools/budget`.

| Path | Component | Status |
|------|-----------|--------|
| `/` | `HomePage` | Available |
| `/tools` | `ToolsPage` | Available |
| `/tools/budget` | `BudgetPage` | Available |
| `/tools/resignation` | `ResignationPage` | Available |
| `/tools/waste-sorting` | `WasteSortingPage` | Available |
| `/tools/room-simulator` | `RoomSimulatorPage` | Available |
| `/tools/subscription` | `ComingSoonPage` | Coming soon |
| `/tools/savings-goal` | `ComingSoonPage` | Coming soon |
| `/tools/retirement` | `ComingSoonPage` | Coming soon |
| `/tools/date` | `ComingSoonPage` | Coming soon |
| `/tools/work-schedule` | `ComingSoonPage` | Coming soon |

Adding a new tool requires changes in four places:
1. New route in `src/App.tsx`
2. New page in `src/pages/tools/`
3. New tool entry in `src/data/tools.ts`
4. New tool implementation in `src/tools/<tool-name>/`

---

## Architecture: Two-Layer Pattern

Tools that involve non-trivial logic use a two-layer architecture:

**Feature layer** (`src/features/<name>/`)
- Pure TypeScript — no React imports
- Framework-agnostic, fully testable without DOM
- Defines core types, algorithms, and calculations
- Currently only `room-layout/` uses this pattern

**Tool layer** (`src/tools/<name>/`)
- React components and hooks
- Uses the feature layer for logic
- Manages UI state, user interaction, rendering

Simpler tools (waste-sorting, resignation) keep logic inside `src/tools/` directly.

---

## State Management

| Scope | Mechanism | Persistence |
|-------|-----------|-------------|
| Budget data | `BudgetContext` (useReducer) | `localStorage` key `budget-calculator-v1` |
| Theme | `ThemeContext` (useState) | `localStorage` key `budget-theme` |
| Room simulator | Local `useState` in `RoomSimulatorTool` | None (session only) |
| Waste sorting recent | Direct localStorage calls | `localStorage` |
| Recent tool used | `src/utils/recentTools.ts` | `localStorage` |

---

## Key Entry Files

| File | Role |
|------|------|
| `src/main.tsx` | React root mount |
| `src/App.tsx` | Router and all routes |
| `src/index.css` | All CSS design tokens and global styles |
| `src/data/tools.ts` | Central tool registry |
| `src/types.ts` | Shared global types |

---

## Naming Conventions

- **Files:** `camelCase.ts` for utilities, `PascalCase.tsx` for React components
- **Directories:** `kebab-case` (e.g., `room-simulator`, `waste-sorting`)
- **Components:** Named exports (no default exports for components)
- **Pages:** Default exports
- **Types:** `PascalCase` interfaces and types
- **IDs:** `crypto.randomUUID()` or `Math.random().toString(36).slice(2, 9)`

---

## Areas Requiring Caution

- **`src/data/tools.ts`** — Changing a tool's `path` or `id` breaks routing and localStorage recent-tool tracking.
- **`src/index.css`** — CSS custom property names are used across every component. Renaming a token requires a global search-and-replace.
- **Room layout geometry** — Clearance threshold (60 cm) is hardcoded in `checkClearances()`. If the threshold changes, update both the logic and any UI copy that references it.
- **HashRouter base** — `vite.config.ts` sets `base: '/check-income-calc/'`. Changing this breaks GitHub Pages deployment.
- **`src/features/room-layout/`** — Pure logic layer. Never import React here.
