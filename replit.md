# UPSC PYQ Master

A static UPSC previous-year-question practice app with subject browsing, prelims papers, test mode, results, and Firebase authentication.

## Run & Operate

- `pnpm install --frozen-lockfile` — install the imported workspace dependencies
- `PORT=5173 BASE_PATH=/ pnpm --filter @workspace/upsc-pyq run dev` — run the website locally
- `pnpm --filter @workspace/upsc-pyq run build` — build the static website for publishing
- The Replit workflow `UPSC PYQ` runs the website on port 5173.
- Firebase configuration is provided by `firebase-applet-config.json`.

## Stack

- pnpm workspaces, Node.js 20, TypeScript 5.9
- React 19 + Vite 7
- Tailwind CSS 4
- Firebase Authentication and Firestore

## Where things live

- `artifacts/upsc-pyq/src/` — website source
- `artifacts/upsc-pyq/public/data/` — question and subject data
- `artifacts/upsc-pyq/src/pages/` — app pages and practice flows
- `artifacts/upsc-pyq/src/lib/` — Firebase, authentication, and theme helpers
- `attached_assets/` — imported UPSC PDF reference files
- `firebase-applet-config.json` and `firestore.rules` — Firebase project configuration

## Architecture decisions

- The website is a static Vite build and does not require a backend service to run.
- The app uses the root URL (`/`) for Replit preview and publishing.
- Public question data is loaded from files under the app's public data directory.

## Product

Users can browse UPSC subjects and previous-year prelims papers, take timed practice tests, review results, and sign in with Google to use Firebase-backed account features.

## User preferences

Keep the imported GitHub project unchanged apart from the minimum Replit setup and documentation needed to run and publish it.

## Gotchas

- Run `pnpm install --frozen-lockfile` after importing the repository if workspace dependencies are missing.
- Keep `BASE_PATH=/` for the current root-mounted Replit artifact.

## Pointers

- The production output is `artifacts/upsc-pyq/dist/public`.
