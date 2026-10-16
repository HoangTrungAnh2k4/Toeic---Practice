# Project Rules & Skills Context

Mandatory rules for every AI agent working in this frontend project.

---

## 1. Core rules

- Reply in Vietnamese; English only for technical terms and code. No filler, no echoing the question. Fix/cause in one or two lines.
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

Design system reference (local): `docs/design-system/README.md` and `docs/design-system/tokens.json`. Read them only when the table below is not enough. Tokens live in `app/globals.css`.

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

---

## 4. Feature planning (PRD)

Trigger: the user asks to plan/spec a NEW feature, or says "PRD", "lên kế hoạch", "viết spec" before coding.
Do NOT trigger for bug fixes or small tweaks (≤ 3 files). Just do them.

### Process

1. **Ask first.** Before writing anything, send ONE batch of at most 5 questions: user problem, who uses it, success metric, constraints (deadline/data/API), what is out of scope. Skip any question the codebase or this file already answers. If the user says "tùy bạn", pick a sensible default and record it under "Giả định".
2. **Read minimally.** Only routes, components, types and hooks related to the feature (section 3 exception applies for finding reusable pieces).
3. **Write the PRD** to `docs/prd/<feature-slug>.md` (Vietnamese, technical terms in English, max ~1 page, NO code), using this template:
    - **Vấn đề**: 1-3 sentences.
    - **Mục tiêu & chỉ số thành công**: measurable.
    - **User stories**: max 5, "Là …, tôi muốn …, để …".
    - **Trong phạm vi / Ngoài phạm vi**: keep the MVP tight; park nice-to-haves under "Ngoài phạm vi".
    - **Thiết kế kỹ thuật**: routes, shadcn components to reuse or add, data/state, API. No code.
    - **Trạng thái UI**: loading, empty, error.
    - **Kiểm thử**: only critical logic (auth, payment, scoring...).
    - **Các bước thực hiện**: ordered small tasks, each shippable on its own.
    - **Giả định & câu hỏi mở**.
4. **Stop and wait for approval.** Do not write implementation code until the user approves the PRD.
5. **When implementing** a feature that has a PRD, read it first and follow its task order. If reality contradicts the PRD, say so briefly and update the PRD.
