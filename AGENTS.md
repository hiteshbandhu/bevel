<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Bevel — skeuomorphic component library

shadcn-style registry of tactile, skeuomorphic components built on Base UI (`@base-ui/react`) + Tailwind v4.

## Layout

- `packages/ui` — the components (`src/components/*.tsx`). This is what ships via the registry; keep it free of Storybook/test deps.
- `apps/web` — Next.js docs site; will also host the shadcn registry (`registry.json` → `shadcn build`).
- `apps/storybook` — Storybook 10 (Vite). Stories live in `src/stories`. `pnpm --filter storybook test` runs every story as a Vitest browser test (Chromium via Playwright) with a11y checks set to fail.
- `docs/reference/components-build/` — the components.build spec (shadcn + Hayden Bleasel). Read the relevant chapter before designing a component API.

## Component rules (from components.build + shadcn)

- One file per component family; export composable parts (`Root`, `Trigger`, `Thumb`…), not mega-props.
- Every rendered part sets `data-slot="<name>"`; expose state as `data-*` attributes (Base UI already emits `data-pressed`, `data-checked`, `data-disabled`, …) and style off those, not JS-switched classes.
- Use Base UI's `render` prop for polymorphism; never invent an `as`/`asChild` API.
- Spread `...props` last-but-className onto the primitive; merge classes with `cn()`; `className` always wins.
- Tokens are CSS variables in `packages/ui/src/styles/globals.css`, registered via `@theme inline`. Components never hard-code colors or shadows.
- Every component needs stories covering: default, every variant, disabled, keyboard interaction (play function), dark mode, and reduced motion.

## Skills in `.claude/skills`

`shadcn` (CLI/registry), `migrate-radix-to-base`, Emil Kowalski's `emil-design-eng`, `animate`, `review-animations`, `animation-performance`, `break-ui`, `prototype`, `pick-ui-library`, and Vercel's `web-design-guidelines`. Restore with `pnpm dlx skills experimental_install` (reads `skills-lock.json`).

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
