# LedgerNest — Agent Instructions

Production personal budget app (manual entry, single household, Vercel + Prisma Postgres + Better Auth).

## Architecture

- **DAL/DTO**: `src/lib/dal/*` — server-only, explicit selects, no raw Prisma models to client components.
- **Auth**: Better Auth with Argon2id (`@node-rs/argon2`), owner-only signup via `databaseHooks.user.create.before`.
- **Money**: BigInt cents everywhere in Prisma; format only at UI boundary.
- **Categories**: 3-level tree; flat fetch + in-memory build in `categories.ts`.
- **Widgets**: Predefined templates + `WidgetConfigSchema` (Zod); no arbitrary config keys in render path.

## Commands

```bash
pnpm install
pnpm db:migrate
pnpm dev
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

## Env

See `.env.example`: `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, `APP_URL`.
