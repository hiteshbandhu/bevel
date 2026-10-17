---
name: new-component
description: Build a new Bevel component end to end — decompose it into independently usable parts, style it only from the design system, give every part stories and a docs page (sub-components nest under their parent), and verify it. Use whenever adding a component or a new part to an existing one in this repo.
---

# Building a Bevel component

Bevel components are physical objects built on Base UI. Every part that is a recognizable object on its own ships as its own component, and every value comes from `packages/ui/src/styles/bevel.css`. Work through these steps in order; don't skip the decomposition.

## 1. Read first

- `AGENTS.md` (component rules, design system, categories).
- The relevant chapters in `docs/reference/components-build/`: `composition.mdx`, `as-child.mdx` (we use Base UI's `render` instead), `data-attributes.mdx`, `accessibility.mdx`.
- The closest existing component: `wallet.tsx` built from `payment-card.tsx` is the reference for a parent built from an independent part.

## 2. Decompose

List the physical parts of the object. For each part, apply the **independence test**:

> Would someone want to render this without the parent? (A card without the wallet, a coin without the purse, an LED without the panel, a key without the keyboard.)

- **Yes** → it is its own component: its own `.tsx`, its own stylesheet if it has a palette, its own stories, its own catalog entry with `parent: "<parent-slug>"`. It must render correctly with **no parent context**.
- **It needs the parent's context** (position in a stack, the parent's status) → split it: a standalone visual component, plus a thin parent-specific wrapper that only adds placement or state and renders the standalone one (`WalletCard` renders `PaymentCard`; it never re-styles it).
- **No** → it is a part of the parent (`WalletPocket`, `WalletHeader`): exported from the parent's file, documented in the parent's Parts table.

Write the decomposition down (parts → component / wrapper / part) before coding, and tell the user.

## 3. Design-system rules

- Raw values live only in `bevel.css` (foundation) or as palette declarations in the component's stylesheet. Component `.tsx` files read tokens: `rounded-(--bevel-radius-md)`, `duration-(--bevel-duration-move) ease-(--bevel-ease-out)`, `text-(length:--bevel-amount)`, `tracking-(--bevel-tracking-label)`.
- Depth and materials come from the foundation utilities (`bevel-raised`, `bevel-pressed`, `bevel-recessed`, `bevel-object`, `bevel-leather`, `bevel-plastic`, `bevel-metal`, `bevel-deboss`, `bevel-stitch`, `bevel-fill`, `bevel-led`). A component stylesheet maps its palette onto `--bevel-material`, `--bevel-material-edge`, `--bevel-fill`, `--bevel-led` by `data-slot`, `data-variant` and `data-status`.
- One light source, from the top. Nested radii are concentric: inner = outer − inset.
- If a value you need doesn't exist, add a named token to `bevel.css` (with a comment saying what it's for) rather than an arbitrary value.
- Motion: CSS transitions on `transform`/`translate`/`opacity`/`filter`, durations by purpose (press, small, move, ambient), `--bevel-ease-spring` for physical settles. `motion-reduce:transition-none` on every transition. No JS animation unless it's a gesture with velocity.

## 4. Build

For each component:

1. `packages/ui/src/components/<name>.tsx` — `"use client"`, Base UI primitives, `data-slot` on every part, state as `data-*`, `render` prop via `useRender` on the root, `className` merged last with `cn`. Import other Bevel components via `@workspace/ui/components/<name>`.
2. `packages/ui/src/styles/<name>.css` if it has a palette or shape of its own; import it in `globals.css` **after** `bevel.css` and after any component it builds on.
3. Accessibility: real roles from Base UI, decorative parts `aria-hidden`, readable names (e.g. "ending in 4242"), `forced-colors:` fallbacks for edges, visible focus.

## 5. Stories (`apps/storybook/src/stories/<name>.stories.tsx`)

Title `"<Category>/<Name>"` — sub-components use their own name under the same category. Cover: default, every variant/tone, disabled, keyboard interaction (play function), edge cases (long text, zero, huge values), and for sub-components a story **used on its own**, outside the parent.

## 6. Docs (`apps/web`)

1. `lib/catalog.ts` — add the entry: `slug`, `name`, `category`, `description`, `files`, `dependencies`, `registryDependencies` (Bevel components it's built from), `parent` (for sub-components), `anatomy`, `parts`, `examples`.
2. `components/demos/<name>-<example>.tsx` — self-contained (the site shows this file as the example's code), registered in `components/demos/index.ts`.
3. `components/previews.tsx` — a still, non-interactive preview for the tile.

The registry picks the component up from the catalog: run `pnpm registry:build`, then check `npx shadcn@latest add @bevel/<slug> --dry-run` against a local app with `"@bevel": "http://localhost:3000/r/{name}.json"` in its `components.json`. Don't give a `lib/` file and a component the same base name.

Sub-components then appear nested: `/components/<parent>/<slug>`, indented in the sidebar, in the parent's "Built from" section, and with a "Part of <Parent>" line on their page.

## 7. Verify

Run all of these and fix what fails:

```bash
pnpm check:tokens
pnpm typecheck
pnpm --filter storybook test
```

Then open the pages in the browser (light, dark, 375px wide): the parent page, every sub-component page, and the sub-component's own example used without the parent. Check there's no horizontal scroll and no console errors.

## Done when

- Every independently useful part has its own component, stories and page.
- `check:tokens`, typecheck and story tests pass.
- The parent is composed from its sub-components, not re-styled copies of them.
