# Project Rules (Supabase Backend)

Mandatory rules for every AI agent working in this project.

---

## 1. Response rules

### Opening (MANDATORY)

- **Every response** must start with a one-line greeting, then the list of rules applied to this prompt. Never skipped (even for very short answers or tool-only turns).
- Greeting: `Xin chào! Các rule áp dụng cho yêu cầu này:`
- List format: one bullet per rule, `- §<section> <rule name>`. Rule name max 5 words, no explanation.
- List only rules actually used for the current prompt. Max 8 bullets. Do not invent rule names; use the headings in this file.
- After the list, go straight to the content. This is the only exception to the "no lead-in" rule below.

### Keep it short (save quota)

- **When editing code or fixing bugs:** state the cause and the fix as briefly as possible. **NEVER** write illustrative code.
- **When explaining:** get to the point, be concise. **NO** illustrative examples.

### Language

- Always reply in Vietnamese, even if the user writes in English.
- Use English only for technical terms and code (when code output is actually needed).

### Token economy

- **No filler:** no thanks, apologies or lead-ins (except the mandatory opening above).
- **Don't repeat context:** don't echo the user's question or broken code. Name the file/function/line and the fix.

---

## 2. Codebase access

- Read only files named directly or closely tied to the change (the migration, the function, its `_shared` imports, related types).
- Never scan the whole repo or unrelated folders (`node_modules`, `supabase/.temp`, `supabase/.branches`, old migrations, generated types) unless the task needs them.
- Never hand-edit generated files (e.g. `database.types.ts`). Change the schema and regenerate with `supabase gen types typescript`.
- Before opening a new file, confirm the current task actually needs it.

---

## 3. Supabase stack and conventions

### Stack

- Core: Postgres, Supabase Auth, Storage, Realtime, Edge Functions (Deno + TypeScript), Supabase CLI.
- Use only packages already in `deno.json` / import map. Add a new dependency only with permission.
- Core libs (fill in): client `<supabase-js>`, validation `<zod|valibot>`.

### Database & migrations

- Every schema change goes through a new migration (`supabase migration new <name>`). Never edit an applied migration.
- Never change the remote/production schema via the Dashboard; the repo is the source of truth.
- Naming: `snake_case` for tables, columns, functions. Consistent singular/plural across tables.
- Primary keys `uuid` (or `bigint identity`), timestamps `timestamptz`, `created_at`/`updated_at` on every table.
- Put integrity in the DB: `NOT NULL`, `CHECK`, `UNIQUE`, foreign keys with explicit `ON DELETE`.
- Add indexes for foreign keys and new filter/sort columns.
- Avoid N+1, no `select *`, select only needed columns, paginate list queries.
- Parameterized queries only. Never build SQL by string concatenation (including inside functions).

### Row Level Security (CRITICAL)

- Enable RLS on **every** table in exposed schemas (`public`). A table without RLS is a bug.
- Write separate policies per operation (`select`/`insert`/`update`/`delete`) and per role (`anon`/`authenticated`). Default deny.
- Use `(select auth.uid())` instead of bare `auth.uid()` in policies (performance).
- Never base authorization on `user_metadata` (user-editable). Use `app_metadata`, claims, or a roles table.
- Never use `using (true)` / `with check (true)` on non-public data.
- Views must use `security_invoker = true`.
- Add `WITH CHECK` on insert/update policies.
- Index columns used in policies.

### Database functions

- Default `SECURITY INVOKER`. Use `SECURITY DEFINER` only when required, with `set search_path = ''`, fully qualified names, and `revoke execute ... from public, anon` as needed.
- Do not put `SECURITY DEFINER` functions in exposed schemas.
- Multi-step business logic that must be atomic goes into a Postgres function (RPC) or a single transaction. Never rely on client-side multi-call sequences.

### Auth & keys

- Use Supabase Auth. No custom password/token handling or hashing.
- `service_role` key only inside Edge Functions/server env. Never in client code, logs, or commits. It bypasses RLS: use only with a stated reason.
- `anon` key is public; assume anyone has it.
- Validate JWT/claims server-side; never trust user ids from request bodies, take them from the verified token.

### Edge Functions

- One function per purpose: `supabase/functions/<name>/index.ts`. Shared code in `supabase/functions/_shared/`.
- Keep `verify_jwt = true` by default. Disable only for webhooks, and then verify the signature.
- Layering: handler (parse/validate/respond) → service (business logic) → data access. No business logic in the handler.
- Validate all input at the boundary with the project schema lib. Keep request/response DTOs separate from DB row types.
- Handle CORS and `OPTIONS` explicitly.
- Set timeouts on all external calls. Respect execution time/memory limits.
- Secrets via `supabase secrets` / env, loaded once into a typed config. No secrets in code.
- Always `await` promises; no floating promises.

### Errors & API

- Never swallow errors. Check `{ data, error }` from every Supabase call.
- Define domain errors in the service layer; map them to HTTP status only in the handler.
- One consistent JSON response/error envelope. Use correct HTTP status codes.
- Never leak internal errors, SQL errors, or stack traces to clients.
- Version Edge Function routes (`/v1/...`) when they are public APIs.
- Log OR rethrow, never both.

### Storage & Realtime

- Buckets are private by default. Public only with justification.
- Access control via policies on `storage.objects`. Validate file type and size before upload.
- Enable Realtime only on tables that need it; remember RLS applies to it.

### Logging & security

- Structured logging only (JSON, with request ID and consistent levels). No `console.log` of raw objects in production paths.
- Never log passwords, tokens, keys, or PII.
- Authn/authz in a shared middleware/helper, not scattered in handlers.

### Code style

- TypeScript `strict`. No `any` (use `unknown` + narrowing). No non-null `!` without a comment.
- Code must pass `deno fmt` and `deno lint`.
- Early return, short functions, descriptive names. Doc comments on exported identifiers.
- SQL: lowercase keywords, one statement per concern, comment non-obvious policies and functions.

---

## 4. Verification & testing

- After changing code, run only what is relevant:
    - Functions: `deno check`, `deno lint`, `deno test` on the affected function only.
    - Database: `supabase db lint`, and `supabase db reset` on the **local** stack to verify migrations apply cleanly.
    - Types: re-run `supabase gen types typescript` if the schema changed.
- Never run destructive commands (`db reset`, `db push`, truncate, delete) against a linked/production project without explicit permission.
- Only write tests for core business logic (e.g. pricing, permissions, RLS policies, data validation): pgTAP (`supabase test db`) for policies/functions, `deno test` for logic. Do not create test files for anything else unless I ask.
- Temporary check scripts go in `/tmp` and are deleted after use. Never commit them.
- Report what was run, the result, and what could not be verified.
