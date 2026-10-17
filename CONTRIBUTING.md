# Contributing to Bevel

Thanks for helping. Bevel is small on purpose, so the bar for a new component is high and
the bar for a fix is low.

## Setup

You need Node 22+ and pnpm (the version is pinned in `package.json`; `corepack enable`
picks it up).

```bash
pnpm install
pnpm dev                                  # docs site on http://localhost:3000
pnpm storybook                            # Storybook on http://localhost:6006
pnpm --filter storybook exec playwright install chromium   # once, for story tests
```

## Before you open a pull request

All of these must pass. CI runs the same checks.

```bash
pnpm check:tokens                 # no raw colours, durations, lengths; no layout transitions
pnpm typecheck
pnpm --filter storybook test      # every story as a browser test, axe checks set to fail
pnpm --filter web build           # docs site and registry
```

## Proposing a component

Open a "Component proposal" issue before writing code. Answer three questions:

1. **What job does it do in a real product?** Name the screen it belongs on.
2. **Which existing component is closest, and why isn't it enough?** No two Bevel
   components do the same job.
3. **What does it say in words?** Everything the object shows with light or position must
   also be available as text.

A beautiful object without a job will be declined; that's not a judgement of the work.

## Building a component

Follow the checklist in [`.claude/skills/new-component/SKILL.md`](.claude/skills/new-component/SKILL.md).
It's written for agents, but it's the same checklist for people. In short:

- One file per component family in `packages/ui/src/components`, exported as parts.
- Every rendered part sets `data-slot`; state is exposed as `data-*` and styled from there.
- Polymorphism through Base UI's `render` prop; no `asChild`.
- Values come from tokens in `bevel.css`. A component's palette goes in its own stylesheet.
- Motion only on `transform`, `translate`, `opacity` and `filter`, with
  `motion-reduce:transition-none`.
- Stories: default, every variant, disabled, a keyboard play test, dark mode.
- Docs: an entry in `apps/web/lib/catalog.ts`, a self-contained demo in
  `apps/web/components/demos`, and a tile preview.

The components.build spec in `docs/reference/components-build` explains the API
conventions in depth.

## Commits and pull requests

- One logical change per commit, written in the imperative: `feat(records): …`,
  `fix(instruments): …`, `docs: …`.
- Keep pull requests focused. Screenshots or a short recording help for visual changes.
- `main` is protected: changes land through pull requests with passing checks.

## Code of conduct

By taking part you agree to follow the [code of conduct](CODE_OF_CONDUCT.md).
