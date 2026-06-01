# AI Session Notes

Update this file after major tasks, important bug fixes, structure changes, design rule changes,
or major implementation decisions. Also update it before context compaction if possible.

---

## Latest Working Summary

- **Date:** 2026-06-01
- **Main task:** Room simulator — layout version compare + fixed element labels/rename
- **Files changed:**
  - `src/tools/room-simulator/types.ts` — added `LayoutVersion`, `LayoutVersionSummary` types
  - `src/tools/room-simulator/utils/geometry.ts` — added `getMinimumClearanceCm`
  - `src/tools/room-simulator/utils/versions.ts` — NEW: `createLayoutVersion`, `duplicateLayoutVersion`, `getVersionName`, `generateId`, `getLayoutVersionSummaries`
  - `src/tools/room-simulator/components/VersionTabs.tsx` — NEW: horizontal scrollable tab switcher with rename/duplicate/delete actions
  - `src/tools/room-simulator/components/CompareView.tsx` — NEW: 2-column compare cards with mini preview (CSS divs, no canvas), occupancy/clearance/warning stats, recommendation badge
  - `src/tools/room-simulator/components/FixedElementPanel.tsx` — added `onRename` prop + inline text editing for element names
  - `src/tools/room-simulator/RoomSimulatorTool.tsx` — replaced `room/furniture/fixedElements` state with `SimState { versions, activeVersionId }`, added all version management handlers, added VersionTabs and compare mode toggle
  - `src/tools/room-simulator/utils/export.ts` — added `layoutVersionName` param; header shows "방 가구 배치 · A안" when name present
  - `src/tools/room-simulator/components/ResultSummary.tsx` — added `layoutVersionName` prop, passed to `createLayoutBlob`
- **Key decisions:**
  - Version state is `{ versions: LayoutVersion[], activeVersionId: string }` combined in one `useState` to avoid bootstrap ID mismatch between two separate states.
  - `patchActive(updates)` helper mutates the active version; uses functional update so React batching is safe.
  - CompareView uses `MiniRoomPreview` (plain divs, not `RoomCanvas`) to avoid ResizeObserver and pointer-event overhead inside comparison cards.
  - Fixed element labels on canvas were already implemented in `RoomCanvas.tsx` (`FixedElementRect` renders `{el.name}` when `pxW > 24 && pxH > 14`).
  - Recommendation score = `overlapWarnings*1000 + fixedConflicts*200 + warnings*10 + occupancy% − minClearance*0.5`; no recommendation shown when only 1 version.
- **Current issue:** None. `npx tsc --noEmit` passes clean.
- **Next steps:** Verify compare view and version tabs visually on mobile.
- **Things not to forget:**
  - `VersionTabs` inline menu (rename/duplicate/delete) only shows when active tab is tapped; auto-closes on version switch.
  - Rename of fixed element: tap the element name text in the `FixedElementPanel` list to enter inline edit mode.
  - `getLayoutVersionSummaries` is called only when `versions.length > 1` or `showCompare` is true (avoids redundant recalculation).

---

## Recent Changes

- **2026-06-01** — Layout version compare + fixed element labels/rename (this session)
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
