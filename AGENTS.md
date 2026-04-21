# AGENTS.md

## Repo Shape
- Single-package Bun + React 19 + TypeScript + Vite app. No workspace or monorepo tooling.
- App entry chain is `src/main.tsx` -> `AppProviders` -> `AppRouter`. Routes live in `src/app/create-app-router.tsx`: `/` and `/integrations/:integrationId`; wildcard routes redirect to `/`.
- Keep boundaries intact: `src/app` shell/providers/router, `src/pages` route components, `src/features/*` feature UI/data/hooks, `src/shared/*` shared API/lib/types/ui, `src/store/sync-store.ts` central workflow state.

## Data Flow
- Only sync preview data is live. `src/shared/api/sync-client.ts` calls `GET https://portier-takehometest.onrender.com/api/v1/data/sync?application_id=<id>` and validates the response with Zod.
- Use `salesforce`, `hubspot`, or `slack` for success-path live preview work. `stripe` is a known `500` and is useful for error-state coverage.
- Everything else is local mock state. `src/store/sync-store.ts` seeds integrations, history, and previews from `src/features/*/data` and owns the workflow status transitions.
- Conflicts are derived from preview changes with type `UPDATE` or `DELETE` in `src/features/conflicts/lib/derive-conflicts.ts`. Applying resolutions in the store updates status, bumps the version, and prepends a history event.
- Integration IDs are a closed union in `src/shared/types/domain.ts`; adding one requires updating the type plus the mocked datasets/store seeds.

## Commands
- Use Bun, not npm/pnpm: `bun install`, `bun run dev`.
- Full verification: `bun run lint && bun run test:run && bun run build`.
- There is no standalone typecheck script; `bun run build` runs `tsc -b && vite build`.
- Focused test: `bun run test:run src/test/app.test.tsx`.

## Test / Runtime Quirks
- Vitest uses `jsdom`, and `src/test/setup.ts` only adds `@testing-library/jest-dom/vitest`. `msw` is installed but not configured; tests that trigger `Sync Now` should mock `fetch` or `fetchSyncPreview`.
- React Query defaults are overridden in `src/app/providers.tsx`: queries retry once, do not refetch on focus/mount/reconnect, and mutations do not retry.
- Docker builds a static SPA (`oven/bun` -> `nginx`). `nginx.conf` uses `try_files $uri $uri/ /index.html`, so client-side routes must remain SPA-safe.
