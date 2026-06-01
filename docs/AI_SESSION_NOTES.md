# AI Session Notes

Update this file after major tasks, important bug fixes, structure changes, design rule changes,
or major implementation decisions. Also update it before context compaction if possible.

---

## Latest Working Summary

- **Date:** 2026-06-01
- **Main task:** Room simulator — save/share layout as image (export feature)
- **Files changed:**
  - `src/tools/room-simulator/components/ResultSummary.tsx` — wired up proper export pipeline with loading/error state, adaptive "공유하기"/"이미지 저장" button label
  - `src/tools/room-simulator/utils/geometry.ts` — removed old basic `exportRoomAsImage` function (superseded)
  - `CLAUDE.md`, `docs/` — created AI documentation system (this session)
- **Key decisions:**
  - The good export implementation (`createLayoutBlob` in `utils/export.ts`, 1080px PNG with header/footer/summary) already existed but was not connected to any button. The button was calling a simpler legacy function (`exportRoomAsImage` in `geometry.ts`) that only exported the raw canvas.
  - Connected `ResultSummary` to `createLayoutBlob` + `shareOrDownload`. Removed the legacy function.
  - Button label is adaptive: shows "공유하기" when `navigator.share` + `navigator.canShare` are available (mobile), "이미지 저장" otherwise.
- **Current issue:** None known. TypeScript passes with no errors.
- **Next steps:** Verify export visually in browser (image quality, warning text, share sheet on mobile).
- **Things not to forget:**
  - `createLayoutBlob` uses `checkClearances` from the tool-layer geometry (not the feature-layer geometry). The tool-layer warnings use `ClearanceWarning { id, message }` types.
  - Export image is always dark-themed regardless of the user's selected UI theme (`binance`/`revolut`).

---

## Recent Changes

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
