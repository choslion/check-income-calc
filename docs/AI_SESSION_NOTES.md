# AI Session Notes

Update this file after major tasks, important bug fixes, structure changes, design rule changes,
or major implementation decisions. Also update it before context compaction if possible.

---

## Latest Working Summary

- **Date:** 2026-06-04
- **Main task:** Subscription calculator (`구독 계산기`) — full implementation
- **Route:** `/tools/subscription`
- **Folder:** `src/tools/subscription/`
- **Page:** `src/pages/tools/SubscriptionPage.tsx`
- **Files added or changed:**
  - `src/tools/subscription/types.ts` — `Subscription` interface, `SubscriptionStatus`, `SubscriptionCategory`, `SubscriptionCycle`, `SUBSCRIPTION_CATEGORIES`
  - `src/tools/subscription/storage.ts` — `loadSubscriptions()` / `saveSubscriptions()` with migration (handles `price→amount`, old category names `스트리밍→OTT`, `생산성→AI`)
  - `src/tools/subscription/utils/calc.ts` — `toMonthlyCost`, `toYearlyCost`, `calcTotals`, `calcCategoryTotals`, `calcUpcomingPayments`, `sortSubscriptions`, `parseLocalDate`
  - `src/tools/subscription/data/presets.ts` — 31 quick-input presets across 6 categories
  - `src/tools/subscription/SubscriptionTool.tsx` — main component (~600 lines)
  - `src/pages/tools/SubscriptionPage.tsx` — page wrapper with `document.title`
  - `src/App.tsx` — added route `/tools/subscription`
  - `src/data/tools.ts` — added subscription tool entry
  - `index.html` — changed `<title>` from `월급 계산기` to `생활계산소`
  - All 6 page files — added `useEffect(() => { document.title = '...' }, [])` for per-page browser tab titles

- **Data model:**
  ```ts
  interface Subscription {
    id: string
    name: string
    amount: number           // monthly or yearly price
    cycle: 'monthly' | 'yearly'
    category: SubscriptionCategory
    paymentDay: number       // 1–28; used for monthly cycle only
    nextPaymentDate?: string // 'YYYY-MM-DD'; used for yearly cycle only
    status: 'active' | 'considering' | 'cancelCandidate'
    memo: string
    createdAt: string        // ISO string
    updatedAt?: string       // ISO string, set on edit
    color: string            // hex color string
  }
  ```
  - `localStorage` key: `subscriptions-v1`
  - Sort preference key: `subscription-sort-v1`

- **Calculation rules:**
  - Monthly amount from yearly: `amount / 12`
  - Yearly amount from monthly: `amount * 12`
  - `calcTotals(subs)` → `{ monthly, yearly, daily }` — only counts `active` and `considering`; daily = `yearly / 365`
  - `calcCategoryTotals(subs)` → `{ category, monthly, count }[]`, sorted by monthly descending
  - `calcUpcomingPayments(subs)` — 7-day and this-month groups:
    - Monthly: uses `paymentDay`; clamps to end-of-month; advances to next month if day has passed
    - Yearly: uses `nextPaymentDate` via `parseLocalDate`; missing dates sort to `Infinity` (shown last)
  - Cancel savings: sum of monthly-equivalent cost for all `cancelCandidate` items

- **`parseLocalDate` note:** `new Date('YYYY-MM-DD')` treats bare dates as UTC midnight, which shifts 1 day in Korea (UTC+9). Always use `parseLocalDate` which calls `new Date(y, m-1, d)` to get local midnight.

- **Preset groups shown:** `['OTT', '음악', 'AI', '쇼핑·멤버십', '클라우드', '교육']` — categories `게임`, `피트니스`, `기타` exist in the type but have no presets. Clicking a chip prefills the form (does NOT directly add).

- **Form structure:**
  1. Name input (required)
  2. Amount + cycle toggle (월 / 연 pills)
  3. `▼ 상세 설정` collapsible — Category select, PaymentDay (monthly) or NextPaymentDate date input (yearly), Memo
  - Edit mode auto-expands advanced section if item has non-default values
  - `editingId` state distinguishes add vs. edit; `saveForm()` uses `map()` for edit, spread-append for add

- **Key decisions:**
  - `SubscriptionCategory` type and preset group names were unified — they must stay in sync. Old category names are handled in `storage.ts` migration only.
  - Status chips use inline toggle (not a form field): `updateStatus(id, status)` updates without entering edit mode.
  - Sort is display-only — `sortSubscriptions` spreads the array before sorting; stored order is unchanged.
  - `flex-shrink-0` class was replaced with Tailwind v4's `shrink-0` (two locations fixed).

- **Current issue:** None. `npx tsc --noEmit` passes clean.
- **Next steps:** Commit and push all subscription calculator work.
- **Things not to forget:**
  - Do not add new status types without updating `STATUS_CFG` in `SubscriptionTool.tsx` and `storage.ts` migration.
  - Do not rename `SubscriptionCategory` values without updating `storage.ts` migration AND all preset data.
  - `paymentDay` is only used for monthly cycle. `nextPaymentDate` is only used for yearly cycle. Keep both but only display the relevant input in the form.
  - Basic form (name + amount + cycle) must stay simple. Optional fields (category, paymentDay, nextPaymentDate, memo) must stay inside `▼ 상세 설정`.

---

## Previous Working Summary (2026-06-02) — Room simulator 3D preview

- **Main task:** Room simulator — 3D preview mode
- **Files changed:**
  - `src/tools/room-simulator/types.ts` — added `heightCm?: number` to `FurnitureItem`
  - `src/tools/room-simulator/utils/furniture3dDefaults.ts` — NEW: keyword-based height lookup
  - `src/tools/room-simulator/components/ThreePreview.tsx` — NEW: full 3D block preview using `@react-three/fiber` + `@react-three/drei`
  - `src/tools/room-simulator/RoomSimulatorTool.tsx` — added `show3D` state; 2D/3D toggle
  - `package.json` — added `three`, `@react-three/fiber`, `@react-three/drei`
- **Key decisions:**
  - 3D preview is read-only; editing only in 2D mode.
  - Heights use keyword matching against furniture name, no new input field.
  - 1 Three.js unit = 100cm; coordinate mapping: 2D x→3D X, 2D y→3D Z, height→3D Y.
  - `show3D` toggle in step 2 only appears when `furniture.length > 0`.
- **Versions installed:** `@react-three/fiber@9.6.1`, `@react-three/drei@10.7.7`, `three@0.184.0`
- **Files changed:**
  - `src/tools/room-simulator/types.ts` — added `heightCm?: number` to `FurnitureItem` (optional, used for 3D height)
  - `src/tools/room-simulator/utils/furniture3dDefaults.ts` — NEW: `getFurnitureHeightCm()` keyword-based height lookup (침대→45, 책상→72, 소파→80, 옷장→200, etc; fallback 70cm)
  - `src/tools/room-simulator/components/ThreePreview.tsx` — NEW: full 3D block preview using `@react-three/fiber` + `@react-three/drei`; room floor + semi-transparent walls, furniture as colored boxes, fixed elements as type-colored boxes, camera preset buttons (사선/위/정면), OrbitControls
  - `src/tools/room-simulator/RoomSimulatorTool.tsx` — added `show3D` state; `ViewToggle` helper component; 2D/3D toggle row in step 2 (above canvas, only when furniture exists) and step 3 (always shown); `handleReset` resets `show3D` to false
  - `package.json` — added `three`, `@react-three/fiber`, `@react-three/drei`; `@types/three` in devDependencies
- **Key decisions:**
  - 3D preview is read-only: no furniture editing inside the 3D scene; user must return to 2D for edits.
  - Heights use keyword matching against furniture name (not a new UI input field), keeping the feature additive without complicating FurniturePanel.
  - Fixed elements use their 2D footprint + a type-specific height and color; wall-mounted elements (door, window) are rendered at their 2D floor position — sufficient for spatial understanding.
  - 1 Three.js unit = 100cm; coordinate mapping: 2D x→3D X, 2D y→3D Z, height→3D Y.
  - Camera presets: '사선' (isometric default), '위' (top-down), '정면' (front); CameraRig component watches preset and room size changes and repositions camera + OrbitControls target.
  - `show3D` toggle in step 2 only appears when `furniture.length > 0` (no empty-room 3D view).
  - In step 2, 3D preview replaces only the canvas; FurniturePanel, FixedElementPanel remain visible below for editing.
- **Versions installed:** `@react-three/fiber@9.6.1`, `@react-three/drei@10.7.7`, `three@0.184.0`
- **Current issue:** None. `npx tsc --noEmit` passes clean. 168 tests pass.
- **Next steps:** Verify 3D preview on mobile touch devices. Consider adding furniture labels (name text floating above each block) as a future enhancement.
- **Things not to forget:**
  - `@react-three/fiber` extends JSX namespace globally via type augmentation; no special tsconfig changes needed.
  - Wall transparency (`opacity: 0.4`) is intentional so camera can see inside the room from all angles.
  - Camera initial position is set via Canvas `camera` prop (mount-time only); subsequent preset changes go through `CameraRig` useEffect + OrbitControls ref.

---

## Recent Changes

- **2026-06-04** — Subscription calculator full implementation: types, storage, calc utils, presets, UI
- **2026-06-04** — Browser tab titles added to all page files; `index.html` title updated to `생활계산소`
- **2026-06-02** — 3D block preview mode: ThreePreview component, 2D/3D toggle, furniture height defaults
- **2026-06-02** — Canvas readability refactor: CanvasDisplayOptions, warning icons (⚠), size-label gating, display chips
- **2026-06-01** — Layout version compare + fixed element labels/rename
- **2026-06-01** — Fixed elements feature (doors, windows, built-in closets, obstacles) — 7 files
- **2026-06-01** — Room preset dimensions fixed (all 원룸 presets now match labeled 평수)
- **2026-06-01** — Room simulator export: wired `ResultSummary` to full export pipeline, removed legacy `exportRoomAsImage`
- **2026-06-01** — Created AI documentation system (`CLAUDE.md`, `docs/`)
- **Prior** — Added room simulator tool (`/tools/room-simulator`)
- **Prior** — Added waste sorting tool (`/tools/waste-sorting`)
- **Prior** — Fixed resignation calculator: result section moved to page bottom, fallback to latest policy when no resignation date

---

## Known Issues

- No E2E tests written yet (Playwright is installed but unused).
- The exported layout image does not reflect the user's current UI theme — it always uses the dark export theme. This is by design for now.
- `AdBannerSlot` is a placeholder with no actual ad integration.

---

## Pending Questions

- Will a `date` calculator need server-side logic or is it fully client-side?
- Should the `resignation` tool's policy config (`data/policy-config.json`) be versioned or updatable from a remote source?

---

## Important Project Rules

- **Two-layer architecture:** Pure logic in `src/features/`, React UI in `src/tools/`. Never import React into `src/features/`.
- **CSS tokens only:** All colors, radii, and font stacks must use `var(--token)` from `src/index.css`. Do not hardcode these values in components.
- **HashRouter only:** The app is deployed to GitHub Pages and requires HashRouter. Do not switch to BrowserRouter.
- **`src/data/tools.ts` is the source of truth** for all tool metadata (id, path, title, status). Always add new tools there.
- **TypeScript is strict:** `noUnusedLocals` and `noUnusedParameters` are enabled. Run `npx tsc --noEmit` before declaring a task done.
- **No login, no server:** All features must work without authentication or server-side storage for MVP scope.
