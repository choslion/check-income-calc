# Development Guide

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| React | 19 | UI framework |
| TypeScript | ~6.0 | Type safety |
| Vite | 8 | Dev server and bundler |
| Tailwind CSS | 4 (Vite plugin) | Utility-class styling |
| React Router DOM | 7 (HashRouter) | Client-side routing |
| Vitest | 4 | Unit testing |
| ESLint | 10 | Linting |
| Playwright | 1.60 | (Available, no tests written yet) |

---

## Package Manager

**npm** (confirmed via `package-lock.json`).

---

## Install

```bash
npm install
```

Uses `npm ci` in CI (see `.github/workflows/deploy.yml`).

---

## Development Server

```bash
npm run dev
```

Starts Vite dev server with HMR. Default port is `5173`.  
The app is available at `http://localhost:5173/check-income-calc/`.

> Note: `base` in `vite.config.ts` is `/check-income-calc/`. If you navigate to `http://localhost:5173/` directly, you will get a 404 — use the full base path.

---

## Build

```bash
npm run build
```

Runs `tsc -b` (TypeScript type-check + build info) then `vite build`.  
Output goes to `dist/`.

---

## Preview Production Build Locally

```bash
npm run preview
```

Serves the `dist/` folder locally to verify the production build.

---

## Type Check (without emitting)

```bash
npx tsc --noEmit
```

Run this before finishing any task to verify no TypeScript errors.  
`npm run build` also runs `tsc -b` but exits faster when there are errors.

---

## Tests

```bash
npm run test          # Run all tests once
npm run test:watch    # Watch mode
```

Uses Vitest with `environment: 'node'` (no DOM, no jsdom).  
Test files live alongside the code they test in `__tests__/` subdirectories.

Current test files:
- `src/features/room-layout/__tests__/layoutEngine.test.ts` — geometry and layout engine
- `src/tools/resignation/utils/__tests__/calc.test.ts` — resignation calculation logic

---

## Lint

```bash
npm run lint
```

Uses ESLint 10 with `@typescript-eslint`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`.

---

## TypeScript Configuration

Three `tsconfig` files:

| File | Scope |
|------|-------|
| `tsconfig.json` | References the other two |
| `tsconfig.app.json` | `src/` — strict linting, `noUnusedLocals`, `noUnusedParameters` |
| `tsconfig.node.json` | `vite.config.ts` — Vite/Node config files |

Key strict options in `tsconfig.app.json`:
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`
- `erasableSyntaxOnly: true`

---

## Environment Variables

No `.env` file is required for local development. There are no API keys or server-side secrets.

The app is fully client-side. All state is in `localStorage` or in-memory.

---

## Deployment

Deployment is automated via GitHub Actions:

- **Trigger:** Push to `main` branch (or manual `workflow_dispatch`)
- **Workflow:** `.github/workflows/deploy.yml`
- **Steps:** `npm ci` → `npm run build` → upload `dist/` → deploy to GitHub Pages
- **Node version in CI:** 20

The deployed URL follows the pattern:  
`https://<github-username>.github.io/check-income-calc/`

---

## Local Development Requirements

- Node.js 20+ (matches CI)
- npm (comes with Node)
- No Docker required
- No backend required

---

## Common Troubleshooting

**TypeScript error: unused variable**  
`noUnusedLocals` and `noUnusedParameters` are enabled. Prefix with `_` if intentionally unused, or remove the variable.

**Build fails with `tsc -b` errors but `npx tsc --noEmit` passes**  
Check that `tsconfig.json` references both `tsconfig.app.json` and `tsconfig.node.json`. `tsc -b` uses the composite/reference build mode.

**`npm run dev` shows blank page at `localhost:5173`**  
Navigate to `http://localhost:5173/check-income-calc/` — the app is served under the base path.

**App routes return 404 on GitHub Pages after direct navigation**  
This is expected because GitHub Pages does not support SPA fallback routing. The app uses `HashRouter` to avoid this. Never switch to `BrowserRouter` without adding a 404 redirect.

---

## Missing Development Information

- No `.nvmrc` or `engines` field in `package.json`. Node 20 is implied from CI config but not enforced locally.
- No Playwright tests are written yet (Playwright is installed as a dev dependency).
- No staging environment or preview deployment is configured.
