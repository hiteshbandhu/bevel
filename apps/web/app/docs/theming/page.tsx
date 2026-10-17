import type { Metadata } from "next"
import { CodeBlock } from "@/components/code-block"
import { Guide, Note } from "@/components/prose"

export const metadata: Metadata = { title: "Theming" }

export default function Theming() {
  return (
    <Guide slug="theming">
      <h2>Dark mode</h2>
      <p>
        Bevel follows the shadcn convention: a <code>.dark</code> class on <code>html</code>. In the dark,
        the light dims rather than inverting. Highlights get weaker, and paper stays paper, just less lit.
        With <code>next-themes</code>, set <code>attribute=&quot;class&quot;</code> and it works.
      </p>
      <p>
        For a theme switch that feels like the lights going down, the <code>theme-transition</code> item
        runs the change through a View Transition:
      </p>
      <CodeBlock lang="bash" title="Terminal" code="npx shadcn@latest add @bevel/theme-transition" />
      <CodeBlock
        lang="tsx"
        title="theme-toggle.tsx"
        code={`import { transitionTheme } from "@/lib/theme-transition"

onClick={() => transitionTheme(next, () => setTheme(next))}`}
      />

      <h2>Change a palette</h2>
      <p>
        Each component names its colours once, as variables in its stylesheet. Override them in your own
        CSS, globally or under any selector, and the component follows. Nothing to fork.
      </p>
      <CodeBlock
        lang="css"
        title="globals.css"
        code={`/* Brand red for every alarm lamp */
:root {
  --annunciator-red: oklch(0.6 0.22 15);
}

/* A green-steel Kardex tray, only in the billing area */
.billing [data-slot="visible-file"] {
  --visible-file-tray: oklch(0.5 0.04 160);
}`}
      />

      <h2>Change the whole look</h2>
      <p>
        Foundation tokens change everything at once. A flatter, softer set needs only a few lines:
      </p>
      <CodeBlock
        lang="css"
        title="globals.css"
        code={`:root {
  --bevel-shade: oklch(0 0 0 / 0.2);        /* softer shadows */
  --bevel-radius-md: 0.875rem;               /* rounder objects */
  --bevel-duration-move: 240ms;              /* snappier motion */
}`}
      />

      <h2>One-off changes</h2>
      <p>
        Every part accepts <code>className</code>, merged last, so yours wins. Parts carry{" "}
        <code>data-slot</code> and their state as <code>data-*</code> attributes, so you can style any part
        in any state from outside:
      </p>
      <CodeBlock
        lang="tsx"
        title="page.tsx"
        code={`<AnnunciatorTile className="min-h-20 text-sm" ... />`}
      />
      <CodeBlock
        lang="css"
        title="globals.css"
        code={`[data-slot="annunciator-tile"][data-state="new"] {
  outline: 2px solid var(--annunciator-red);
}`}
      />
      <Note>
        Polymorphism uses Base UI&apos;s <code>render</code> prop, where a part supports it. There is no{" "}
        <code>asChild</code>.
      </Note>
    </Guide>
  )
}
