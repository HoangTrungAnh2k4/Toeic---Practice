# Backend (Supabase)

Requires Docker Desktop running.

```bash
pnpm install
pnpm start          # local stack: API, Postgres, Auth, Studio (http://127.0.0.1:54323)
pnpm db:reset       # re-apply migrations + seed.sql
pnpm migration:new <name>
pnpm gen:types      # writes ../front-end/lib/database.types.ts
```

Deploy to a remote project:

```bash
pnpm exec supabase login
pnpm exec supabase link --project-ref <ref>
pnpm db:push
```

Schema changes live only in `supabase/migrations/` — never edit the remote DB by hand.
