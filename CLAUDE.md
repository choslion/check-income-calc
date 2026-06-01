# CLAUDE.md — AI Assistant Entry Guide

This file is the starting point for any AI assistant working in this repository.
Read it before making any code changes.

## Required Reading Order

Before modifying code, read these files first:

1. [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)
2. [docs/DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md)
3. [docs/DESIGN_GUIDE.md](docs/DESIGN_GUIDE.md)
4. [docs/AI_SESSION_NOTES.md](docs/AI_SESSION_NOTES.md)

Do not make large implementation changes before understanding the project structure,
development commands, design rules, and recent session notes.

## Documentation Map

| File | Purpose |
|------|---------|
| `CLAUDE.md` | This file — entry point and rules |
| `docs/PROJECT_STRUCTURE.md` | Folder layout, routing, architecture |
| `docs/DEVELOPMENT_GUIDE.md` | Install, run, build, test commands |
| `docs/DESIGN_GUIDE.md` | Design tokens, UI patterns, component rules |
| `docs/AI_SESSION_NOTES.md` | Recent changes, decisions, pending work |

## General Rules for AI Assistants

- Read the project structure before proposing new files or directories.
- Use the established two-layer architecture: pure logic in `src/features/`, React UI in `src/tools/`.
- All styling must use CSS custom properties (design tokens) defined in `src/index.css`. Do not hardcode colors or radii outside those tokens.
- Do not introduce new state management libraries. Use React Context for shared state.
- Do not install new dependencies without a clear reason. Check if a built-in or existing utility already covers the need.
- All new tools follow the page pattern: a page in `src/pages/tools/`, a route in `src/App.tsx`, a tool entry in `src/data/tools.ts`, and the tool implementation in `src/tools/<tool-name>/`.
- Keep TypeScript strict: `noUnusedLocals` and `noUnusedParameters` are enabled.
- Run `npx tsc --noEmit` to verify types before finishing a task.

## Rules for Avoiding Assumptions

- Do not assume a component exists without checking the file tree first.
- Do not assume a design token exists without checking `src/index.css`.
- Do not assume a utility function exists without checking `src/lib/` and the relevant tool's `utils/` directory.
- When a warning or clearance threshold appears (e.g., 60 cm), check the geometry utility for the actual value rather than guessing.

## Documentation Update Rules

- Update `docs/PROJECT_STRUCTURE.md` when folder structure, routing, architecture, or major modules change.
- Update `docs/DEVELOPMENT_GUIDE.md` when commands, dependencies, environment variables, build process, or deployment process change.
- Update `docs/DESIGN_GUIDE.md` when UI rules, component patterns, layout patterns, or design tokens change.
- Update `docs/AI_SESSION_NOTES.md` after major tasks, bug fixes, key decisions, or before context compaction.
- Do not document assumptions as confirmed facts.
- Separate confirmed information from inferred or missing information.
