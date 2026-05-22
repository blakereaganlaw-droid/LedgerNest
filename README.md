# LedgerNest

Private, manual-entry household budget app. Built for Vercel with Prisma Postgres, Better Auth, and Next.js App Router.

## Requirements

- Node.js **20.9+**
- pnpm 9+
- PostgreSQL (local Docker or [Vercel Prisma Postgres](https://vercel.com/marketplace/prisma))

## Local setup

1. Clone and install:

```bash
cd Projects/ledgernest
pnpm install
```

2. Copy environment:

```bash
cp .env.example .env
```

Edit `.env`:

- `DATABASE_URL` — pooled connection string (runtime)
- `DIRECT_URL` — direct connection (migrations)
- `BETTER_AUTH_SECRET` — `openssl rand -base64 32`
- `APP_URL` — `http://localhost:3000`

3. Migrate database:

```bash
pnpm db:migrate
```

4. Run dev server:

```bash
pnpm dev
```

5. Open http://localhost:3000 — first visit goes to `/setup` to create the owner account.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript check |
| `pnpm test` | Vitest unit tests |
| `pnpm test:e2e` | Playwright (run `pnpm exec playwright install chromium` once; DB-backed setup test skips if Postgres is unreachable) |
| `pnpm db:migrate` | Prisma migrate dev |
| `pnpm db:push` | Push schema without migration |

## Vercel deployment

1. Create a Vercel project linked to this repo.
2. Add **Prisma Postgres** from the Marketplace; attach `DATABASE_URL` and `DIRECT_URL`.
3. Set environment variables:
   - `BETTER_AUTH_SECRET`
   - `APP_URL` — production URL (e.g. `https://ledgernest.vercel.app`)
4. Deploy. `postinstall` runs `prisma generate` automatically.
5. Run migrations against production (CI or local with production `DIRECT_URL`):

```bash
pnpm exec prisma migrate deploy
```

6. Visit `/setup` once to create the owner; registration is then locked at the database layer.

## Security

- Argon2id password hashing
- httpOnly session cookies, SameSite=Lax
- CSP and security headers via `vercel.json`
- Server-only DAL; Zod-validated Server Actions
- Audit events for auth and critical mutations
