# Ghosting Buster

Job-application tracker that fights recruiter ghosting. See [AGENTS.md](./AGENTS.md) for stack, conventions and product decisions.

## Status

Slice 1 in progress: monorepo skeleton, `packages/core` (stage machine, Zod schemas), first Supabase migration. `apps/web` is next.

## Setup

Requirements: Node 22+, pnpm, Docker (for the local Supabase stack), Supabase CLI.

Dependencies are not installed yet. Run once from the repo root:

```bash
pnpm add -D -w turbo prettier typescript eslint vitest
pnpm --filter @ghosting-buster/config add @eslint/js typescript-eslint eslint
pnpm --filter @ghosting-buster/core add zod            # needs Zod 4 (z.url, z.uuid)
pnpm --filter @ghosting-buster/core add -D '@ghosting-buster/config@workspace:*' typescript eslint vitest
```

Database:

```bash
supabase init          # once; generates supabase/config.toml
pnpm db:start          # local Supabase in Docker
pnpm db:reset          # re-applies supabase/migrations
```

Remote project (when ready): `supabase link --project-ref <ref>` then `supabase db push`.

Copy `.env.example` to `apps/web/.env.local` and fill it in. Never commit real keys.

## Checks

```bash
pnpm typecheck && pnpm lint && pnpm test
```
