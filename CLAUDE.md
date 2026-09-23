# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

DevPilot is an AI-powered developer growth / project-progress tracker (skills, projects, tasks, AI roadmaps, internship readiness score) for a Next.js + Express.js + PostgreSQL/Prisma + Firebase Auth stack. It is a two-package repo with no shared root `package.json` — `client/` and `server/` are run and installed independently.

## Commands

All commands are run from inside `client/` or `server/` respectively — there is no root-level script runner.

### Client (`client/`, Next.js 16 / React 19 / Tailwind v4)
```
npm run dev      # start Next dev server on http://localhost:3000
npm run build    # production build
npm run start    # run production build
npm run lint     # eslint (eslint-config-next core-web-vitals + typescript)
npm test         # vitest run
npm run test:watch
npx tsc --noEmit # typecheck
```

### Server (`server/`, Express 5 / TypeScript / Prisma 6)
```
npm run dev      # ts-node-dev, watches src/, http://localhost:5000
npm run build    # tsc -> dist/
npm run start    # node dist/server.js (run build first)
npm test         # vitest run
npm run test:watch
npx tsc --noEmit # typecheck
```

Both packages use **Vitest**. Tests live beside the code as `*.test.ts(x)`; there is no separate test directory. Server tests mock Prisma and Firebase at the module boundary (`vi.mock("../lib/prisma", ...)`), so **no test needs a database or credentials** — keep it that way.

`.github/workflows/ci.yml` runs typecheck, tests, and a build for both packages on push and PR.

### Prisma (run from `server/`)
```
npx prisma generate      # regenerate client after schema changes
npx prisma migrate dev   # create/apply a migration
npx prisma studio        # DB browser
```

## Environment

- `server/.env`: `PORT`, `NODE_ENV`, `CLIENT_URL`, `DATABASE_URL`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `GEMINI_API_KEY` (optional), `GEMINI_MODEL` (optional), `ADMIN_EMAILS`.
- `client/.env.local`: `NEXT_PUBLIC_FIREBASE_*` and `NEXT_PUBLIC_API_URL`.
- `.example` files for both list the required keys; real `.env`/`.env.local` files are gitignored.

Deployment is documented in `DEPLOYMENT.md`, with configs in `client/vercel.json` and `server/render.yaml`.

## Architecture

### Request flow and auth

`server/src/app.ts` mounts everything under `/api` (`routes/index.routes.ts`). Firebase ID tokens are verified per-request in `middleware/auth.middleware.ts`: it calls Firebase Admin's `verifyIdToken`, then `syncFirebaseUser` upserts a matching Postgres `User` row (Firebase is the identity provider; Postgres is the source of truth for app data). The profile is attached as `req.user` (typed in `types/express.d.ts`). Deactivated accounts are rejected there, before `req.user` is populated.

`authMiddleware` is applied at the router-mount level in `index.routes.ts` (`router.use("/skills", authMiddleware, skillRoutes)`), not inside individual route files. **Every** route group is behind it, and `/admin` additionally sits behind `requireAdmin`:

```ts
router.use("/admin", authMiddleware, requireAdmin, adminRoutes);
```

No admin handler re-checks the role, so that mount is load-bearing — `middleware/admin.middleware.test.ts` exists to keep it that way.

### Admin bootstrap

Accounts are created as `USER`, and the only route that changes a role is itself behind `requireAdmin`. `ADMIN_EMAILS` (comma-separated, parsed in `config/adminEmails.ts`) is the way in: a listed address is granted `ADMIN` during `syncFirebaseUser`, on create *and* on update, so it works whether or not the account already exists.

It is **promote-only by design**. Writing `role` unconditionally on update would revert anyone promoted through the admin UI on their very next request. Do not "simplify" that conditional — `services/auth.service.test.ts` guards it.

### Feature completeness — check before assuming

Most domains are fully built (routes → controller → service → Prisma, with Zod validation and per-user ownership checks): **skills, projects, tasks, roadmaps, feedback, announcements, admin**. Tasks are nested under `/api/projects/:projectId/tasks` for list/create and flat at `/api/tasks/:id` for update/delete.

The exception worth knowing:

- **`routes/dashboard.routes.ts` inlines its own Prisma queries and response shaping.** `controllers/dashboard.controller.ts` and `services/dashboard.service.ts` are three-line placeholders wired to nothing. It does call the real `announcement`/`roadmap` services, so its data is live — but if you touch dashboard logic, it is in the route file.

### Validation and errors

Routes validate with `validate(schema, "body" | "query")` from `middleware/validate.middleware.ts`, using Zod schemas in `validators/`. Shared field primitives live in `validators/common.ts` — the API accepts the frontend's lowercase/kebab forms (`"in-progress"`) and normalizes to SCREAMING_SNAKE Prisma enums on the way in.

Services throw typed errors from `utils/errors.ts` (`NotFoundError`, `ValidationError`, `ForbiddenError`, `ServiceUnavailableError`); `middleware/error.middleware.ts` maps them to status codes centrally. Don't add per-controller status mapping or `error.message.includes(...)` checks — that pattern was removed. `routes/errorContract.test.ts` asserts the HTTP contract end to end.

### Data-shape normalization convention

Prisma enums are stored SCREAMING_SNAKE (`IN_PROGRESS`, `HIGH`) but API responses convert to the lowercase/kebab strings the frontend expects, via local `formatX`/`normalizeX` helpers in each service file — there is no shared serialization layer. Ownership is enforced with a local `findOwnedX(userId, id)` helper that throws `NotFoundError` if the row isn't scoped to the requesting user.

### Pagination

Admin listings (`getUsers`, `getProjects`, `getSkills`) return `{ data, pagination: { page, pageSize, total, totalPages } }` via `services/pagination.ts`, not bare arrays. `MAX_PAGE_SIZE` is the point of that module — an uncapped `pageSize` restores the unbounded query.

These listings read across every user, so **scope any per-row lookup to the ids on the page**. `getUsers` passes its page's user ids into both the task query and `getRoadmapActivityByUser(userIds)`; without that, scoring 25 users reads every task and every roadmap on the platform, roadmaps including their full JSON content.

`getOverview` takes a bounded first page of each list and unwraps `.data`, so the overview response shape stays flat.

### Rate limiting

`middleware/rateLimit.middleware.ts`: 600 requests / 15 min across `/api`, and 10 / hour on `POST /api/roadmaps/generate`. Both key on **account** (falling back to IP), because an IP key would lump everyone behind one NAT into a single bucket. The store is in-memory and per-process, so a second instance means the limit applies once per instance.

`app.ts` sets `trust proxy` to `1` — one hop, matching a managed host. `true` would let a client spoof `X-Forwarded-For` and mint a fresh bucket per request.

### Client structure

Next.js App Router under `client/src/app/`, with route groups mirroring `constants/routes.ts`. `client/tsconfig.json` maps `@/*` to the **client package root**, not `src/` — imports look like `@/src/lib/api`.

- `src/lib/firebase.ts` initializes the client SDK; `src/hooks/useAuth.ts` wraps `onAuthStateChanged`.
- `src/lib/authToken.ts` reads the ID token outside React, awaiting `authStateReady()` first. `src/lib/api.ts` attaches it as a bearer token and retries once with a forced refresh on 401 — **it does handle auth**, so don't add per-call token plumbing.
- `src/hooks/useApiResource.ts` is the standard fetch-on-mount hook (keyed refetch + `reload()`); use it rather than hand-rolling `useState`/`useEffect`/try-catch on a new page.
- `src/components/ui/` is a set of hand-rolled primitives — there is no component library (no shadcn/Radix/MUI).
- The UI is a single dark "cockpit" theme defined as Tailwind v4 `@theme` tokens in `src/app/globals.css`. **The stock Tailwind palette is deliberately deleted there (`--color-*: initial`), so a stray `bg-slate-800` fails to compile.** Use the project tokens (`panel`, `console`, `bezel`, `ink`, `beacon`, `nominal`, `alert`, `ai`) and the `molded` / `carved` / `letterpress` utilities. The README's "UI Theme" section is the reference.
- ESLint enforces `react-hooks/set-state-in-effect`: reset dependent state from the event that caused it, not from an effect.

### Database

`server/prisma/schema.prisma` defines `User`, `Skill`, `Project`, `Task`, `Roadmap`, `Feedback`, `Announcement`. All child records cascade-delete from `User`/`Project` and are indexed on their owning foreign key. `User.firebaseUid` and `User.email` are unique; `syncFirebaseUser` upserts on `firebaseUid`.

### AI roadmaps

Gemini via `@google/genai`, configured in `config/gemini.ts`. The client is created lazily so a deployment without `GEMINI_API_KEY` still boots and serves every other route, answering 503 only on generation. `GEMINI_MODEL` is pinned to a version rather than a `-latest` alias on purpose — the alias silently changes which model runs. Responses are validated against a Zod schema in `services/roadmap.content.ts`.
