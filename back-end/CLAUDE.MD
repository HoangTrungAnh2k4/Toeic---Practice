# Project Rules (Supabase Backend)

Project conventions for AI agents. Works alongside the `ponytail` skill (minimal-solution mindset).

## 0. Precedence

1. The user's explicit instruction in the current prompt.
2. The **non-negotiables** below. No skill may relax them:
   RLS on exposed tables, key/secret handling, validation at trust boundaries, error handling that prevents data loss, destructive-command permission (section 4).
3. Active skills (e.g. ponytail) decide **how much to build**, the workflow, and the output shape.
4. Everything else in this file is a default for how the code you write should look. It never requires writing extra code, layers, files, or docs that the task does not need.

## 1. Communication and output

- Reply in Vietnamese. Keep code, identifiers, comments, and commit messages in English.
- No greetings, thanks, apologies, or restating the question.
- Output shape: code/diff first, then at most 3 short lines covering, as relevant: root cause (for bugs), what was skipped and when to add it, what was run, what could not be verified.
- Explanations only when asked. Then be direct, with no filler and no illustrative examples.
- No demo or "for reference" snippets. Output only the actual change.
- Bug fix: find the root cause. Grep every caller of the function you are about to change. Fix once where all callers route through, not per caller.

## 2. Supabase conventions

### Database & migrations

- Every schema change is a new migration (`supabase migration new <name>`). Never edit an applied migration.
- Never change the remote/production schema via the Dashboard. The repo is the source of truth.
- Never hand-edit generated files (e.g. `database.types.ts`). Change the schema, then run `supabase gen types typescript`.
- `snake_case` for tables, columns, functions. Keep singular/plural consistent.
- Primary keys `uuid` (or `bigint identity`). Timestamps `timestamptz`. `created_at`/`updated_at` on new tables.
- Enforce integrity in the DB: `NOT NULL`, `CHECK`, `UNIQUE`, foreign keys with explicit `ON DELETE`.
- Index foreign keys and new filter/sort columns.
- No `select *`. Select needed columns, paginate lists, avoid N+1.
- Parameterized queries only. Never build SQL by string concatenation (including inside functions).
- SQL style: lowercase keywords, one statement per concern, comment non-obvious policies and functions.

### Row Level Security (non-negotiable)

- Enable RLS on every table in exposed schemas (`public`). A table without RLS is a bug.
- Separate policies per operation (`select`/`insert`/`update`/`delete`) and per role (`anon`/`authenticated`). Default deny.
- Use `(select auth.uid())`, not bare `auth.uid()`. Add `WITH CHECK` on insert/update policies.
- Never base authorization on `user_metadata` (user-editable). Use `app_metadata`, claims, or a roles table.
- No `using (true)` / `with check (true)` on non-public data.
- Views use `security_invoker = true`.
- Index columns used in policies.

### Database functions

- Default `SECURITY INVOKER`. Use `SECURITY DEFINER` only when required: `set search_path = ''`, fully qualified names, `revoke execute ... from public, anon` as needed, and never in an exposed schema.
- Atomic multi-step logic goes in a Postgres function (RPC) or one transaction, never in client-side call sequences.

### Auth & keys (non-negotiable)

- Use Supabase Auth. No custom password/token handling or hashing.
- `service_role` only inside Edge Functions/server env, with a stated reason. Never in client code, logs, or commits.
- Assume the `anon` key is public.
- Validate JWT/claims server-side. Take user ids from the verified token, never from the request body.
- Authn/authz lives in a shared helper/middleware, not scattered across handlers.
- Never log passwords, tokens, keys, or PII.

### Edge Functions

- One function per purpose: `supabase/functions/<name>/index.ts`. Shared code in `_shared/`.
- Keep `verify_jwt = true`. Disable only for webhooks, and then verify the signature.
- Validate all input at the boundary with the project's schema lib (check `deno.json`).
- Handle CORS and `OPTIONS` explicitly.
- Timeouts on every external call. Respect execution time/memory limits.
- Secrets via `supabase secrets`/env, loaded once into a typed config. None in code.
- Always `await` promises. No floating promises.

### Errors & API

- Never swallow errors. Check `{ data, error }` on every Supabase call.
- Domain errors live with the logic. Map them to HTTP status only in the handler.
- One consistent JSON response/error envelope with correct status codes.
- Never leak internal errors, SQL errors, or stack traces to clients.
- Version routes (`/v1/...`) only for public APIs.
- Log OR rethrow, never both.

## 3. Verification & testing

- Run only what is relevant to the change:
    - Functions: `deno check`, `deno lint`, `deno test` on the affected function.
    - Database: `supabase db lint`, and `supabase db reset` on the **local** stack to confirm migrations apply cleanly.
    - Schema changed: re-run `supabase gen types typescript`.
- Non-trivial logic (a branch, loop, parser, money, permissions, validation, RLS policy/function) leaves **one** minimal test behind: pgTAP (`supabase test db`) for policies/functions, `Deno.test` for logic. No frameworks, fixtures, or per-function suites unless asked. No tests for trivial code or plain CRUD wiring.
- Temporary check scripts go in `/tmp`, are deleted after use, and are never committed.

## 4. Ask before

Ask only for the items below. For anything else, choose a sensible default and note it in the closing lines instead of stopping to ask.

- Destructive commands (`db reset`, `db push`, truncate, delete) against a linked/production project.
- Adding a dependency.
- Using `service_role`, disabling `verify_jwt`, or making a bucket public.
- Editing an already-applied migration.
