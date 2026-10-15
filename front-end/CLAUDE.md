<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Rules & Skills Context

Mandatory rules for every AI agent working in this frontend project.

---

## 1. Response rules

### Opening confirmation (MANDATORY)

- **Every response** must start with a one-line greeting, then the list of rules applied to this prompt. Never skipped (even for very short answers or tool-only turns).
- Greeting: `Xin chào!`
- List only rules actually used for the current prompt. Max 8 bullets. Do not invent rule names; use the headings in this file.
- After the list, go straight to the content. This is the only exception to the "no lead-in" rule below.

### Keep it short (save quota)

- **When editing code or fixing bugs:** state the cause and the fix as briefly as possible. **NEVER** write illustrative code.
- **When explaining:** get to the point, be concise. **NO** illustrative examples.

### Language

- Always reply in Vietnamese, even if the user writes in English.
- Use English only for technical terms and code (when code output is actually needed).

### Token economy

- **No filler:** no greetings, thanks, apologies or lead-ins (except the mandatory confirmation above).
- **Don't repeat context:** don't echo the user's question or broken code. Name the function/line and the fix.

---

## 2. Codebase access

- Read only files named directly or closely tied to the module being changed (imports/exports, its types/hooks).
- Never scan the whole codebase or unrelated folders (e.g. `assets`, `docs` while fixing API logic).
- Before opening a new file, confirm the current task actually needs it.

---

## 3. UI stack and frontend rules

Use **only** Tailwind CSS (styling), shadcn/ui (components) and react-icons (icons). Add no other UI/CSS/icon library without permission.

### Tailwind CSS

- Utility classes only. **NO** plain CSS, CSS modules, styled-components or inline `style` (except dynamic values classes can't express).
- Use shadcn/brand tokens (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-main`...) instead of hard-coded colors (`bg-[#fff]`, `text-gray-500`).
- Avoid arbitrary values (`w-[137px]`); prefer the built-in scale.
- Mobile-first (`sm:`, `md:`, `lg:`). Dark mode via tokens; don't repeat `dark:` where tokens already handle it.
- Merge conditional classes with `cn()` (`@/lib/utils`), never by string concatenation.
- Consistent class order (layout → spacing → typography → color → state); `prettier-plugin-tailwindcss` if installed.

### shadcn/ui

- Prefer existing shadcn components (Button, Input, Dialog, Card, Select, Table, Form, Tabs, Sheet, Dropdown Menu, Sonner...) before writing new ones.
- Add via `npx shadcn@latest add <component>`; **DO NOT** hand-write shadcn components.
- They live in `components/ui/`. Don't edit them unless necessary; customize via `className`, `variant` (cva) or a wrapper.
- Forms: shadcn `Form` + `react-hook-form` + `zod`.
- Keep the aria/focus/keyboard attributes Radix/shadcn provide.

### react-icons

- Every icon from `react-icons`. **NO** emoji, hand-inserted SVG or other icon libraries (lucide-react, heroicons...).
- Import named icons from the exact subpath (`react-icons/lu`...), never `import *`.
- One primary set project-wide (default `react-icons/lu`); use another only if it lacks the icon.
- Size/color via Tailwind (`size-4`, `text-muted-foreground`), not `size`/`color` props.
- Decorative icons get `aria-hidden="true"`; icon-only buttons need `aria-label`.

### Code

- Function components + hooks, TypeScript, explicit prop types, `@/` import alias.
- One responsibility per component; split when a file gets long or UI repeats.
- PascalCase component names; follow existing file naming.
- Handle loading, empty and error states; responsive with keyboard/screen-reader support.

---

## 4. Design tokens & identity (Toeco)

Full design system: https://claude.ai/artifact/42kRpQ9mPJUBEZMyMF85PE (read `project/README.md`, `project/tokens.json` for detail). Tokens live in `app/globals.css`.

### Brand colors (via Tailwind classes, never hard-coded hex)

| Token     | Hex       | Role                                                                            |
| --------- | --------- | ------------------------------------------------------------------------------- |
| `main`    | `#3C3454` | Sidebar, banners, headings, emphasis text on light surfaces                     |
| `sub1`    | `#E8E5F5` | Chips, tags, "resolved" wash, text on `main`                                    |
| `sub2`    | `#8B84B8` | Secondary button, 30–60% alpha borders. Only 3.5:1 on white: not for small text |
| `sub3`    | `#F5B841` | Primary button, active/hit states. Text on it is `#333` or `main`, never white  |
| `subText` | `#5c596a` | Secondary text                                                                  |
| `success` | `#5FD99A` | Positive state, always paired with an icon or text                              |
| canvas    | `#eef0fc` | Page background and sidebar active pill (currently hard-coded `bg-[#eef0fc]`)   |

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
