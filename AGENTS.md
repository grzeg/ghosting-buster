# Ghosting Buster

Job-application tracker that fights ghosting: saves offers from any portal, tracks the recruitment stage, flags applications that went quiet, and drafts a follow-up. Portfolio project: code quality and clear architecture matter as much as features.

> Scope is defined in "Product decisions" below. Do not invent features beyond what is written there; ask first.

## Stack

- React + Next.js (App Router) + TypeScript (strict)
- React Server Components by default; Client Components only when needed (`"use client"` at the leaf)
- Zustand for client-only UI state; server data stays on the server (RSC / Server Actions)
- shadcn/ui + Tailwind CSS
- React Hook Form + Zod (one schema shared by form and server validation)
- Supabase (Postgres, Auth, RLS) for storage
- Storybook for UI components
- Vitest + React Testing Library for unit/component tests, Playwright for e2e
- ESLint + Prettier

## Commands

Scripts are added as the project is scaffolded. Keep these names stable:

- `pnpm dev` start dev server
- `pnpm build` production build
- `pnpm lint` ESLint
- `pnpm format` Prettier write (`pnpm format:check` for CI)
- `pnpm typecheck` `tsc --noEmit`
- `pnpm test` Vitest
- `pnpm test:e2e` Playwright
- `pnpm storybook` Storybook
- `pnpm db:start` local Supabase in Docker (`supabase start`)
- `pnpm db:reset` re-apply all migrations to the local database

Before calling any task done: `typecheck`, `lint`, and `test` must pass.

## Conventions

- TypeScript: no `any`, no non-null `!` without a comment; prefer `unknown` + Zod parsing at boundaries
- Zod schemas are the source of truth for types (`z.infer`); external data (scraped pages, LLM output, DB rows) is parsed, never trusted
- Components: small, named exports, props typed explicitly; colocate `Component.tsx`, `Component.test.tsx`, `Component.stories.tsx`
- Server vs client: fetch and mutate on the server (RSC, Server Actions); do not put Supabase service keys or secrets in client code
- Styling: Tailwind utilities + shadcn primitives; no ad-hoc CSS files unless unavoidable
- Accessibility: semantic HTML, labelled form controls, keyboard reachable; tests query by role/label (RTL), not by test id unless needed
- Database: schema changes only via Supabase migrations in `supabase/migrations`; every table has RLS enabled
- Commits: small, focused, Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`)

## Testing

- Unit/component: Vitest + RTL, behavior over implementation
- Every Zod schema and pure util gets unit tests
- Playwright covers the critical flows (add offer, status change, recheck)
- Bug fix = failing test first, then the fix

## How the agent should work here

- Language: talk to the owner in Polish; code, comments, commit messages, and docs in English
- Start with one sentence on what is about to be done, then work. No running commentary.
- For any multi-step task keep a task list and update it; the last step is always verification (run typecheck, lint, tests; open the page for UI changes)
- If a request is clear or cheap to redo, start. If it is ambiguous and expensive to redo (schema, architecture, large refactor), ask first with short multiple-choice questions
- Research before stating anything current (library versions, APIs, portal behavior); do not rely on memory for fast-changing facts
- Do not commit, push, or open PRs unless asked; never push to `main` directly, use a branch
- Do not add dependencies without saying why; prefer what is already in the stack
- Never commit secrets. `.env*` stays local; provide `.env.example` with names only
- Do not scrape portals in ways that break their terms of service; prefer public, unauthenticated pages and manual input
- When finishing: say what changed in one or two sentences, name the one sensible next step, no step-by-step recap

## Product decisions (from discovery session)

- Core problem: silence after applying (ghosting). The app answers "who has gone quiet and what do I do about it", not "scrape every portal"
- Users: the owner first, but built as a real multi-user app (Supabase Auth + RLS) so it can be demoed to others
- Ghost rule: the follow-up/ghost deadline is set per offer by the user; the app only reminds and flags
- On ghost: remind the user, and draft a follow-up message to the recruiter (user reviews and sends it themselves)
- Offers enter through a browser extension ("save this offer" from the page the user is already viewing). No server-side scraping of portals
- LLM is used for exactly two things: fit score vs the user's CV (with short reasoning) and follow-up drafts. Not for status detection
- Portfolio goals, all four: clean architecture, test/quality discipline, a real AI use case, and an app actually used daily

## Repo layout (monorepo, pnpm workspaces + Turborepo)

- `apps/web` Next.js app (RSC, Server Actions, Supabase Auth)
- `apps/extension` browser extension (Manifest V3, React + Vite; not Next.js, so RSC does not apply here)
- `packages/core` Zod schemas, domain types, ghost/status rules; pure TypeScript, no framework, no I/O. Shared by web and extension
- `packages/supabase` Supabase client factories and generated DB types
- `packages/config` shared tsconfig, ESLint, Prettier configs

Rule: `packages/core` must never import from `apps/*` or from React/Next. Dependencies point inward only.

## Delivery order

Vertical slices, each one working and tested before the next: (1) core + web CRUD for offers and statuses, (2) ghost rules and reminders, (3) extension capture, (4) LLM fit score, (5) LLM follow-up draft.

- Reminders: in-app "needs follow-up" list plus a daily email (Supabase cron)
- Extension auth: sign in inside the extension popup (supabase-js, session in `chrome.storage`)
- LLM: Claude API, called server-side only; the user's CV is pasted as text into settings and stored in Supabase

## Still open

- Extension tooling (WXT, Plasmo, or Vite + CRXJS); decide at slice 3 after a short research
- Email provider for daily reminders; decide at slice 2
