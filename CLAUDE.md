# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

DevPilot is an AI-powered developer growth / project-progress tracker (skills, projects, tasks, AI roadmaps, internship readiness score) for a Next.js + Express.js + PostgreSQL/Prisma + Firebase Auth stack. It is a two-package repo with no shared root `package.json` — `client/` and `server/` are run and installed independently.

## Commands

All commands are run from inside `client/` or `server/` respectively — there is no root-level script runner.

### Client (`client/`, Next.js 16 / React 19 / Tailwind v4)
```
npm run dev     # start Next dev server on http://localhost:3000
npm run build   # production build
npm run start   # run production build
npm run lint    # eslint (eslint-config-next core-web-vitals + typescript)
```

### Server (`server/`, Express 5 / TypeScript / Prisma 6)
```
npm run dev     # ts-node-dev, watches src/, http://localhost:5000
npm run build   # tsc -> dist/
npm run start   # node dist/server.js (run build first)
```

### Prisma (run from `server/`)
```
npx prisma generate      # regenerate client after schema changes
npx prisma migrate dev   # create/apply a migration
npx prisma studio        # DB browser
```

There is no test runner configured in either package (no jest/vitest, no `test` script) — do not assume one exists.

## Environment

- `server/.env`: `PORT`, `NODE_ENV`, `CLIENT_URL`, `DATABASE_URL` (Postgres), `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (Firebase Admin SDK creds).
- `client/.env.local`: `NEXT_PUBLIC_FIREBASE_*` (client Firebase SDK config) and `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:5000`).
- `.example` files for both exist and list the required keys; real `.env`/`.env.local` files are gitignored.

## Architecture

### Request flow and auth
`server/src/app.ts` mounts everything under `/api` (`routes/index.routes.ts`). Firebase ID tokens are verified per-request in `middleware/auth.middleware.ts`: it calls Firebase Admin's `verifyIdToken`, then `syncFirebaseUser` upserts a matching Postgres `User` row (Firebase is the identity provider; Postgres is the source of truth for app data — role, status, skills, projects, etc.). The resulting profile is attached as `req.user` (typed via `types/express.d.ts`). `authMiddleware` is applied at the router-mount level in `index.routes.ts` (e.g. `router.use("/skills", authMiddleware, skillRoutes)`), not inside individual route files.

**Important gap:** `/api/admin/*` and `/api/announcements` are mounted with no `authMiddleware` at all — anyone can hit them. `middleware/admin.middleware.ts` is an unused placeholder (exports nothing but a stub object); there is currently no role-based access check anywhere in the server. Treat any "admin-only" behavior as unenforced until this is built.

### Feature domains are at very different levels of completion — check before assuming
This repo is mid-scaffold. The routes → controller → service → Prisma layering is the intended pattern, but several domains never got past the placeholder stage. Always open the actual route file before trusting a controller/service file's name:

- **Fully wired (routes → controller → service → Prisma, with per-user ownership checks):** `skills`, `projects`, `tasks` (nested under `/api/projects/:projectId/tasks` for list/create, flat `/api/tasks/:id` for update/delete — see `routes/project.routes.ts` vs `routes/task.routes.ts`).
- **Logic lives directly in the route file, bypassing the controller/service entirely:** `routes/dashboard.routes.ts` inlines its Prisma queries and response shaping; `controllers/dashboard.controller.ts` and `services/dashboard.service.ts` are unused placeholders. It also fills `roadmaps`/`announcements` in its response from static `data/mockData.ts`, not the DB.
- **Unimplemented (route handlers return static mock data or the controller/service is an empty placeholder export):** `admin` (all six `/api/admin/*` list endpoints just return arrays from `data/mockData.ts`), `announcements`, `feedback`, `roadmaps`. `utils/calculateReadinessScore.ts` and `utils/generateMockRoadmap.ts` are also stub functions that return `0`/`[]`.
- Other placeholder files with no real behavior yet: `middleware/validate.middleware.ts`, `utils/asyncHandler.ts`, `config/env.ts` (hardcoded values, not read from `process.env` despite the name).

When asked to "implement" or "fix" one of these features, expect to be building it from near-scratch rather than extending working code.

### Data-shape normalization convention
Working services (`project.service.ts`, `task.service.ts`) share a pattern worth following for new ones: Prisma enums are stored SCREAMING_SNAKE_CASE (`IN_PROGRESS`, `HIGH`), but API responses convert them to lowercase/kebab strings the frontend expects (`in-progress`), via local `formatX`/`normalizeX` helper functions in the service file — there's no shared serialization layer. Ownership is enforced with a local `findOwnedX(userId, id)` helper that throws `"X not found."` if the row isn't scoped to the requesting user; controllers pattern-match on `error.message.includes("not found"/"required")` to pick the HTTP status (see `handleControllerError` in `project.controller.ts`) rather than using typed error classes.

### Client structure
Next.js App Router under `client/src/app/`, with route groups mirroring `constants/routes.ts` (`routes` for user pages, `adminRoutes` for `/admin/*`). `client/tsconfig.json` maps `@/*` to the **client package root**, not `src/` — imports look like `@/src/lib/api`, `@/src/types`, etc.

- `src/lib/firebase.ts` initializes the Firebase client SDK; `src/hooks/useAuth.ts` wraps `onAuthStateChanged` and exposes `getIdToken()`.
- `src/lib/api.ts` is a thin typed fetch wrapper (`api.getX()` functions hitting `NEXT_PUBLIC_API_URL`). **It does not attach the Firebase ID token to any request** — none of the `fetch` calls set an `Authorization` header, so calls to auth-protected endpoints (`/api/skills`, `/api/projects`, `/api/dashboard/stats`, etc.) will 401 as currently written. If you're wiring up a page to real data, you likely need to add the bearer token from `useAuth().getIdToken()` yourself.
- `src/components/ui/` is a small set of hand-rolled primitives (`Button`, `Card`, `Badge`, `Input`, `ProgressBar`, `StatCard`, ...) — there is no component library (no shadcn/Radix/MUI) in `client/package.json`.
- `src/data/mockData.ts` (client) and `src/types/index.ts` define the frontend's own mock/display types, separate from the Prisma-generated types on the server — the two are shape-compatible by convention (the service `formatX` helpers), not by a shared package.

### Database
`server/prisma/schema.prisma` defines `User`, `Skill`, `Project`, `Task`, `Roadmap`, `Feedback`, `Announcement`. All child records cascade-delete from `User`/`Project` and are indexed on their owning foreign key. `User.firebaseUid` and `User.email` are unique; `syncFirebaseUser` (`services/auth.service.ts`) upserts on `firebaseUid`.
