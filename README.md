# Portier Sync Panel

Frontend scaffold for a take-home assignment: a web app integration sync panel that surfaces sync health, previews incoming changes, and supports conflict resolution with local audit history.

## Tech stack

- React 19 + TypeScript + Vite
- Bun for package management
- React Router for navigation
- TanStack Query for live sync preview calls
- Zustand for local mocked workflow state
- Zod for API response validation
- Vitest + Testing Library for test setup

## What is scaffolded

- Integrations overview page
- Integration detail page
- Sync preview panel
- Conflict resolution panel
- Sync history/versioning panel
- Isolated API client for `Sync Now`
- Mock data for integrations, history, and preview state
- Dockerfile for local review

## Project structure

```text
src/
  app/                 # providers, layout, router
  features/
    conflicts/
    history/
    integrations/
    sync/
  pages/               # route-level pages
  shared/
    api/
    lib/
    types/
    ui/
  store/               # zustand workflow state
  test/                # vitest setup
```

## Local development

Install dependencies:

```bash
bun install
```

Start the app:

```bash
bun run dev
```

Build production assets:

```bash
bun run build
```

Run tests:

```bash
bun run test:run
```

Lint:

```bash
bun run lint
```

Full quality gate (used before shipping):

```bash
bun run lint && bun run test:run && bun run build
```

## Live sync preview API

The `Sync Now` action is wired to:

```text
GET https://portier-takehometest.onrender.com/api/v1/data/sync?application_id=<integration-id>
```

Current scaffold assumptions:

- API requires a query parameter named `application_id`
- Supported IDs confirmed during setup: `slack`, `hubspot`, `salesforce`
- `stripe` currently returns a `500` and is wired in deliberately to exercise the error banner
- Other product data remains mocked/local by design

## Workflow

1. Open an integration from the overview page.
2. Click **Sync Now** to fetch the live preview. Added rows are auto-applied; updates and deletes surface in the conflict panel.
3. For each conflict, choose the external value, keep the local value, or (for deletes) keep vs. delete the field.
4. Click **Apply merge decisions** to merge the preview, clear conflicts, bump the version, and append a merge event to sync history with an expandable per-field change list.

## Docker

Build the image:

```bash
docker build -t portier-sync-panel .
```

Run it:

```bash
docker run --rm -p 8080:80 portier-sync-panel
```

Then open `http://localhost:8080`.

## Design notes

- The live API dependency is isolated in `src/shared/api/sync-client.ts`.
- Mock state drives history, conflict decisions, and version bumps to keep the review flow demoable without backend work.
- Routing is intentionally simple so feature modules can expand without restructuring the app shell.
