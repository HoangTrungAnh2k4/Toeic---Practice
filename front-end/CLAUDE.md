# Project Rules & Skills Context

Mandatory rules for every AI agent working in this frontend project.

---

## 1. Core rules

- Reply in Vietnamese; English only for technical terms and code. No filler, no echoing the question. Fix/cause in one or two lines.
- Every task that changes code ends with a written "Lưu ý" list in the reply text: what was skipped or not tested, and risks the user must know (e.g. breaking changes on deploy). It must be the LAST visible message of the turn: call the closing/next-step summary tool (wrap_up) WITHOUT a question/buttons, then write the final message with the "Lưu ý" list, and put any question (commit?...) as its last line. Never write the list before that tool call (it gets collapsed with the work log) and never leave it only inside the summary box.
- Before finishing a code task: run `npm run lint` and `npx tsc --noEmit`, fix errors you introduced.
- UI stack: ONLY Tailwind, shadcn/ui, react-icons (`react-icons/lu` by default). No other UI/CSS/icon library, no emoji or raw SVG icons, no inline style or CSS modules. Add shadcn via `npx shadcn@latest add`, never hand-write it.
- Use brand tokens (`bg-main`, `text-subText`...) instead of hex or arbitrary values.
- Precedence with ponytail: ponytail governs logic and code volume; this file governs UI. Table and dropdown: ALWAYS shadcn (`Table`, `DropdownMenu`, `Select`), never raw `<table>`/`<select>` or custom dropdowns, even when ponytail says "use native". All other components: follow ponytail (native HTML elements + Tailwind are fine). Never drop for brevity: loading/empty/error states, aria/keyboard support, Form + zod, design tokens. Do not use ponytail "ultra" mode.
- Search by name to find reusable components before creating new ones; don't scan unrelated folders.

---

## 2. Server vs Client Components

- Default to Server Components. `page.tsx`/`layout.tsx` stay server and fetch shared content (`lib/data/content.ts`) there.
- Add `'use client'` only for state, effects, event handlers or browser APIs, and push it down to the smallest leaf (button, input, results list), not the whole page.
- Need server-rendered content inside a client wrapper (Dialog, Tabs, Collapsible)? Pass it as `children`/props from the server file; never import it inside the client file (that turns it client too).
- Session lives in cookies (`@supabase/ssr`); `proxy.ts` refreshes it and redirects guests away from protected routes. Per-user data (`lib/data/user-data.ts`) stays client-side (guest mode uses `localStorage`). Server-side auth/role checks use `createServerSupabase()` (`lib/supabase-server.ts`) inside `<Suspense>`; the shared `supabase` client is anon on the server.
- Interaction-heavy screens (exam rooms: timer, recording, editor) may be one client tree; don't split them just to shrink the client.

---

## 3. Design tokens & identity (Toeco)

### Brand colors (via Tailwind classes, never hard-coded hex)

| Token     | Hex       | Role                                                                            |
| --------- | --------- | ------------------------------------------------------------------------------- |
| `main`    | `#3C3454` | Sidebar, banners, headings, emphasis text on light surfaces                     |
| `sub1`    | `#E8E5F5` | Chips, tags, "resolved" wash, text on `main`                                    |
| `sub2`    | `#8B84B8` | Secondary button, 30–60% alpha borders. Only 3.5:1 on white: not for small text |
| `sub3`    | `#F5B841` | Primary button, active/hit states. Text on it is `#333` or `main`, never white  |
| `subText` | `#5c596a` | Secondary text                                                                  |
| `success` | `#5FD99A` | Positive state, always paired with an icon or text                              |
| `canvas`  | `#eef0fc` | Page background and sidebar active pill (`bg-canvas`)                           |

- When touching code with `text-[#3C3454]`, `bg-[#F5B841]`..., switch to `text-main`, `bg-sub3`.
- Never distinguish states by color alone.

### Type & shape

- Fonts: Roboto (`font-sans`), Geist Mono (`font-mono`). Headings 700 + `tracking-tight`; card titles 600 in `main`; descriptions `text-sm font-medium text-subText`; badges/tags `text-[0.6875rem] font-semibold tracking-wider`.
- Button (`components/ui/button.tsx`): neo-brutalist, 2px black border, 4px hard shadow, hover shifts (2,2), active shifts (4,4). Don't override shadow/border. Variants: `primary`, `secondary`, `third`, `outline`; sizes `sm`/`md`/`lg`.
- Card: `bg-card`, `border-sub2/30`, `rounded-xl`, `shadow-sm hover:shadow-md`, 6px left accent bar by skill (Speaking `bg-main`, Writing `bg-sub2`).
- Radius: base `--radius` 0.625rem; buttons/inputs `rounded-lg`, tags `rounded-md`, cards `rounded-xl`, banners `rounded-2xl`.
- Spacing on the Tailwind scale; page gutter `px-4 sm:px-8`.
- Logos (`public/img/logo.png`, `sub_logo.png`) are white text: place only on `main` or dark backgrounds.
- UI copy is Vietnamese, short and action-oriented; keep English for Speaking/Writing/Part/TOEIC.
