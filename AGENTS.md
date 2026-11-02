<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Studiospace

Single Next.js 16.4.3 app (not a monorepo). No test framework, no CI, no env files yet — don't invent one.

## Commands

- `npm run dev` / `npm run build` / `npm run lint` (lint is plain ESLint 9 flat config, `eslint.config.mjs` — no `next lint`)
- No typecheck script: use `npx tsc --noEmit`. `npm run build` also runs the TS check.
- Verify changes in order: `npm run lint` → `npx tsc --noEmit` → `npm run build`.
- Install with `npm ci` (npm, `package-lock.json`).

## Next.js 16 specifics

- Bundled version-matched docs live at `node_modules/next/dist/docs/` (see managed block above). They supersede your training data and external nextjs.org pages.
- `next.config.ts` enables `cacheComponents`, `partialPrefetching`, and `reactCompiler`. Caching/rendering semantics differ from older Next.js — check the bundled docs before using route segment config, data fetching, or caching APIs.
- React Compiler is on: don't hand-add `memo`/`useMemo`/`useCallback`.

## UI / styling

- Tailwind CSS v4, CSS-first: there is no `tailwind.config`. Theme tokens are in `src/app/globals.css` (`@theme inline` + CSS variables); CSS is compiled via the `@tailwindcss/turbopack` loader rule in `next.config.ts`.
- shadcn style is `base-nova` on **Base UI** (`@base-ui/react`), not Radix — see `components.json`. Match that when adding components.
- The `cn` helper comes from the `cn` npm package: `import { cn } from "cn"` (`src/lib/utils.ts` re-exports it). Do not replace it with the usual clsx + tailwind-merge implementation.

## Layout

- App Router source is under `src/`: `src/app` (pages, `layout.tsx`, `globals.css`), `src/components/ui` (shadcn components), `src/lib`.
- Path alias `@/*` → `./src/*` (tsconfig).
- Root layout uses the generated `LayoutProps<"/">` type — keep it rather than a hand-written props type.
