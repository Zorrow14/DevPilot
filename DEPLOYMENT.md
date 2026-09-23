# Deploying DevPilot

The client (Next.js) and the server (Express) deploy independently. This guide
uses **Vercel** for the client and **Render** for the server, with **Supabase**
Postgres behind it, but nothing in the code is tied to those hosts.

Configuration lives in [`client/vercel.json`](client/vercel.json) and
[`server/render.yaml`](server/render.yaml).

---

## Before you start

Have these ready:

- A Postgres connection string (Supabase: **Project Settings → Database →
  Connection string → Transaction pooler**).
- A Firebase service account JSON (**Project Settings → Service accounts →
  Generate new private key**).
- Your Firebase web app config, for the `NEXT_PUBLIC_FIREBASE_*` values.
- Optionally a [Gemini API key](https://aistudio.google.com/apikey). Without it
  every route works except roadmap generation, which answers 503.

---

## The ordering problem

The two services reference each other:

- The server's `CLIENT_URL` is its CORS allowlist, so it must be the client's
  final URL.
- The client's `NEXT_PUBLIC_API_URL` must be the server's final URL, and Next
  inlines `NEXT_PUBLIC_*` at **build** time — changing it later needs a
  redeploy, not just an env var edit.

So deploy the server first, take its URL, then build the client with it, then
come back and set `CLIENT_URL`. Steps 1–4 below do exactly that.

---

## 1. Database

Create the Postgres instance and copy the connection string. Nothing else is
needed here — the server applies migrations itself on start.

## 2. Server → Render

Point Render at this repo as a Blueprint; it reads `server/render.yaml`. It will
prompt for every variable marked `sync: false`:

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | The pooled connection string from step 1. |
| `CLIENT_URL` | Not known yet — put `http://localhost:3000` for now and fix it in step 4. |
| `FIREBASE_PROJECT_ID` | From the service account JSON. |
| `FIREBASE_CLIENT_EMAIL` | From the service account JSON. |
| `FIREBASE_PRIVATE_KEY` | The full PEM, keeping its literal `\n` escapes. |
| `GEMINI_API_KEY` | Optional. |
| `ADMIN_EMAILS` | **Set this now** — see [Admin access](#5-admin-access). |

The blueprint builds with `npm ci && npx prisma generate && npm run build` and
starts with `npx prisma migrate deploy && npm run start`, so the schema is
applied on first boot.

Check it came up:

```bash
curl https://<your-api>.onrender.com/api/health
# {"message":"DevPilot API is running"}
```

> On Render's free plan the service sleeps when idle, and the next request pays
> a cold start of roughly 50 seconds. That is the plan, not a bug.

## 3. Client → Vercel

Import the repo and set **Root Directory** to `client` — this is a two-package
repo with no root `package.json`, and Vercel cannot infer that. `vercel.json`
handles the rest.

Set these environment variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_API_URL=https://<your-api>.onrender.com
```

`NEXT_PUBLIC_API_URL` takes no trailing slash.

## 4. Close the loop

Two things now need the real URLs:

1. Set the server's `CLIENT_URL` to the Vercel URL and let it redeploy.
   Otherwise every browser request fails CORS.
2. In **Firebase Console → Authentication → Settings → Authorized domains**,
   add the Vercel domain, or sign-in is rejected.

## 5. Admin access

Every account is created as a `USER`, and the only route that changes a role is
itself behind an admin check — so without this, nobody can open the admin
screens on a fresh database.

Set `ADMIN_EMAILS` on the server to your own address:

```env
ADMIN_EMAILS=you@example.com
```

Any address on that list is granted `ADMIN` when its token is next verified. It
works whether or not the account already exists, so you can sign up first and
set it second. Once you are in, manage roles from the admin UI.

The list is promote-only: removing an address does not demote that account, and
a user promoted through the admin UI is never reverted by it.

---

## Verifying a deploy

1. `GET /api/health` returns the running message.
2. Register an account; confirm the row lands in Postgres.
3. Sign in — the dashboard loads without a 401. A 401 here usually means the
   Firebase Admin credentials on the server do not match the web config on the
   client.
4. Create a skill and a project; both survive a refresh.
5. If `GEMINI_API_KEY` is set, generate a roadmap. Without it, expect a 503 that
   says so.
6. Open `/admin`. A 403 means `ADMIN_EMAILS` did not match — check the address
   and sign out and back in.

## Operational notes

- **Rate limits.** 600 requests per 15 minutes per account or IP across `/api`,
  and 10 roadmap generations per hour per account. Counters are in-memory and
  per-process, so they reset on deploy; running more than one instance means a
  caller gets the limit once per instance. Moving to a shared store (Redis)
  is a change to `server/src/middleware/rateLimit.middleware.ts` alone.
- **Proxies.** The server sets `trust proxy` to `1`, matching a single proxy
  hop. Behind two or more, rate limiting keys on the wrong address.
- **Migrations.** `prisma migrate deploy` applies only committed migrations and
  never generates one. If a schema change is not in `server/prisma/migrations/`,
  it will not reach production.
