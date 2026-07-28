# UPSC Study Studio

A full-stack web app for UPSC exam preparation — PYQ practice, prelims year-wise tests (1995–2025), articles, mock tests, and an admin dashboard.

## Stack

- **Frontend**: React 19 + Vite + Tailwind CSS v4 + shadcn/ui (`artifacts/upsc-pyq`)
- **Backend**: Express 5 API server (`artifacts/api-server`)
- **Auth**: Firebase (Google Sign-In) + custom HMAC admin tokens
- **Database**: Drizzle ORM (PostgreSQL via `lib/db`)
- **Monorepo**: pnpm workspaces

## Running the project

Two workflows must both be running:

| Workflow | Command | Port |
|---|---|---|
| `UPSC PYQ` | `PORT=5173 BASE_PATH=/ pnpm --filter @workspace/upsc-pyq run dev` | 5173 → external 80 |
| `API Server` | `PORT=8080 pnpm --filter @workspace/api-server run dev` | 8080 |

The frontend proxies `/api/*` to the API server on port 8080 (configured in `artifacts/upsc-pyq/vite.config.ts`).

## Admin login

Go to `/admin`. Default password: `upsc@admin`  
Set the `ADMIN_PASSWORD` environment variable to change it.  
The `SESSION_SECRET` secret is used to sign admin tokens (already configured).

## Firebase config

`firebase-applet-config.json` at the root holds the Firebase project settings (project ID, API key, etc.). Update this file to point to a different Firebase project.

## Key directories

```
artifacts/upsc-pyq/       Frontend React app
artifacts/api-server/     Express API server
lib/db/                   Drizzle ORM schema & migrations
lib/api-spec/             OpenAPI spec + codegen config
lib/api-client-react/     Generated React Query hooks
```

## User preferences

- Keep the existing monorepo structure and stack — do not restructure or migrate.
