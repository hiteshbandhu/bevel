import type { Metadata } from "next"
import { CodeBlock } from "@/components/code-block"
import { Guide, Note } from "@/components/prose"
import { readFoundationTokens } from "@/lib/tokens"

export const metadata: Metadata = { title: "Design system" }

export default async function DesignSystem() {
  const groups = await readFoundationTokens()
  return (
    <Guide slug="design-system">
      <p>
        Bevel looks like one set because every component reads the same few dozen tokens. They live in
        one stylesheet, <code>bevel.css</code>, which arrives with your first component.
      </p>

      <h2>Three layers</h2>
      <ol>
        <li>
          <strong>Foundation</strong> (<code>bevel.css</code>): light, depth, materials, motion and shape.
          The only place raw values live.
        </li>
        <li>
          <strong>Component stylesheet</strong> (<code>wallet.css</code>, <code>annunciator.css</code>…):
          the component&apos;s own palette and geometry, mapped onto the foundation&apos;s variables by{" "}
          <code>data-slot</code>, <code>data-variant</code> and <code>data-status</code>.
        </li>
        <li>
          <strong>Component</strong> (<code>.tsx</code>): Tailwind classes that only read tokens.
        </li>
      </ol>
      <p>Each layer reads only from the one below it. In practice:</p>
      <CodeBlock
        lang="css"
        title="annunciator.css"
        code={`:root {
  --annunciator-amber: oklch(0.8 0.16 75); /* a palette value, named once */
}
[data-slot="annunciator-tile"] {
  --annunciator-lamp: var(--annunciator-amber);
}`}
      />
      <CodeBlock
        lang="tsx"
        title="annunciator.tsx"
        code={`<span className="bg-(--annunciator-lamp) rounded-(--bevel-radius-xs)
  transition-opacity duration-(--bevel-duration-small)" />`}
      />

      <h2>Utilities</h2>
      <p>The foundation turns tokens into a few utilities, so components describe objects, not shadows.</p>
      <ul>
        <li>
          <strong>Depth:</strong> <code>bevel-recessed</code>, <code>bevel-flush</code>,{" "}
          <code>bevel-raised</code>, <code>bevel-pressed</code>, <code>bevel-object</code>.
        </li>
        <li>
          <strong>Materials:</strong> <code>bevel-leather</code>, <code>bevel-plastic</code>,{" "}
          <code>bevel-metal</code>, <code>bevel-paper</code>. Each reads <code>--bevel-material</code> and{" "}
          <code>--bevel-material-edge</code>, so one utility makes walnut, brass or steel.
        </li>
        <li>
          <strong>Details:</strong> <code>bevel-deboss</code>, <code>bevel-stitch</code>,{" "}
          <code>bevel-fill</code>, <code>bevel-led</code>, <code>bevel-ink</code>, <code>bevel-glass</code>,{" "}
          <code>bevel-ruled</code>.
        </li>
      </ul>

      <h2>Rules</h2>
      <ul>
        <li>One light source, from above. Highlights on upper edges, shadows below.</li>
        <li>
          Nested radii are concentric: an inner radius is the outer radius minus the inset between them.
        </li>
        <li>If a value doesn&apos;t exist, add a named token with a comment, not an arbitrary value.</li>
        <li>
          Don&apos;t add <code>--text-*</code> theme keys: Tailwind&apos;s class merging reads unknown{" "}
          <code>text-*</code> classes as colours.
        </li>
      </ul>
      <Note>
        In the Bevel repo, <code>pnpm check:tokens</code> enforces this: it fails on raw colours,
        durations, easings or lengths in components, and on any transition of a layout property.
      </Note>

      <h2>Foundation tokens</h2>
      <p>Read straight from bevel.css, light mode. Dark mode redefines the light and paper tokens.</p>
      {groups.map((group) => (
        <section key={group.title} aria-labelledby={`tokens-${group.title}`} className="mt-4">
          <h3 id={`tokens-${group.title}`} className="font-semibold">
            {group.title}
          </h3>
          <div className="mt-2 overflow-x-auto rounded-xl border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Token
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Value
                  </th>
                  <th scope="col" className="hidden px-3 py-2 font-medium sm:table-cell">
                    For
                  </th>
                </tr>
              </thead>
              <tbody>
                {group.tokens.map((token) => (
                  <tr key={token.name} className="border-t align-top">
                    <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">{token.name}</td>
                    <td className="max-w-56 truncate px-3 py-2 font-mono text-xs text-muted-foreground" title={token.value}>
                      {token.value}
                    </td>
                    <td className="hidden px-3 py-2 text-muted-foreground sm:table-cell">{token.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </Guide>
  )
}
