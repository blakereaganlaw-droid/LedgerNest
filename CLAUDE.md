# LedgerNest Development Rules

- Enforce complete structural type safety with TypeScript; no `any` types.
- All monetary values use **BigInt integer cents**. Floating-point is prohibited at the persistence layer.
- Data access is restricted to the **server-only DAL** (`import "server-only"` in every `src/lib/dal/*` file).
- Re-check authentication inside **every** Server Action and route handler via `verifySession()`.
- Never rely on page layout guards alone for security.
- Validate all Server Action and route inputs with **Zod**.
- No secrets in `NEXT_PUBLIC_*` environment variables.
- Tests: `pnpm test` and `pnpm test:e2e`. Do not push failing tests.
