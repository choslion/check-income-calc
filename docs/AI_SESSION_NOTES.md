# AI Session Notes

Update this file after major tasks, important bug fixes, structure changes, design rule changes,
or major implementation decisions. Also update it before context compaction if possible.

---

## Latest Working Summary

- **Date:** 2026-06-02
- **Main task:** Room simulator — 3D preview mode
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
