# Bevel

Tactile, skeuomorphic React components for real product work. Built on
[Base UI](https://base-ui.com) and Tailwind CSS v4, installed with the shadcn CLI.

**[bevel-ui.vercel.app](https://bevel-ui.vercel.app)**: docs, every component, and live demos.

Each component is a physical object that does a real job in a modern app: a cover over a
deploy switch, alarm lamps that latch until someone sees them, a fader an agent can move and
you can take back, a library slip for an expiring API key. Like shadcn/ui, it isn't a
package: the source lands in your project and it's yours.

## Install

Add the registry to `components.json` once:

```json
{
  "registries": {
    "@bevel": "https://bevel-ui.vercel.app/r/{name}.json"
  }
}
```

Then add components by name:

```bash
npx shadcn@latest add @bevel/guarded-switch @bevel/annunciator
```

Or skip the setup and install straight from a URL:

```bash
npx shadcn@latest add https://bevel-ui.vercel.app/r/wallet.json
```

You need React 19, Tailwind CSS v4 and a project set up with `npx shadcn@latest init`. See
the [installation guide](https://bevel-ui.vercel.app/docs/installation).

## What's inside

| Category | Components |
| --- | --- |
| Money | Wallet, Payment card, Amount, Meter, Receipt, Ticket sheet, Ledger, Keycard |
| Instruments | Number wheel, Gauge and dial, Breaker, Engine telegraph, Annunciator, Detent knob, Push to talk, Motorized fader, Mixer strip |
| Coordination | Guarded switch, Dead man's switch, Lockout, Take a number |
| Records | Keysort filter, Visible file, Contact sheet, Split-flap board, Due-date slip |
| Agents | Name tag, Task plan, Activity log, Approval, Delegation board |
| Documents | Citation, Redline |
| Marks | Stamp and seal, Redaction |

## Principles

- **A real job first.** If a plain control does the job as well, it isn't in Bevel.
- **Composable parts**, never mega-props. A part that works alone is its own component.
- **Tokens, not values.** Components read one foundation stylesheet; a lint fails on raw
  colours, durations or lengths.
- **One light, from above**, so every highlight and shadow agrees.
- **State in words.** What an object shows with light or position, it also says in text.
- **Compositor-only motion.** Transform, opacity and filter; never layout.

Read more in the [design system](https://bevel-ui.vercel.app/docs/design-system) and
[accessibility](https://bevel-ui.vercel.app/docs/accessibility) guides.

## Repository

```
packages/ui      the components and their stylesheets (what ships)
apps/web         docs site; also serves the registry at /r/{name}.json
apps/storybook   stories, run as browser tests with axe checks
scripts          registry build and the token lint
```

```bash
pnpm install
pnpm dev                          # docs site on :3000
pnpm storybook                    # Storybook on :6006
pnpm --filter storybook test      # every story as a browser test
pnpm check:tokens                 # design-system lint
```

## Contributing

Issues and pull requests are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.
New components especially need a clear job that no existing component already does.

## License

[MIT](LICENSE). `docs/reference/components-build` is a copy of the components.build spec
under Apache 2.0; see its own license.
