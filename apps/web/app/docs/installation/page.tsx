import type { Metadata } from "next"
import { guideMetadata } from "@/lib/og"
import { CodeBlock } from "@/components/code-block"
import { Guide, Note, linkClass } from "@/components/prose"
import { registryNamespace, registryUrl, siteUrl } from "@/lib/site"

export const metadata: Metadata = guideMetadata("installation")

export default function Installation() {
  return (
    <Guide slug="installation">
      <h2>Before you start</h2>
      <p>
        Bevel needs a React 19 project with Tailwind CSS v4 and the shadcn CLI set up. Next.js and Vite
        both work. If you haven&apos;t set up shadcn yet:
      </p>
      <CodeBlock lang="bash" title="Terminal" code="npx shadcn@latest init" />

      <h2>Option 1: the @bevel namespace</h2>
      <p>
        Add the registry to <code>components.json</code> once. After that, components install by name.
      </p>
      <CodeBlock
        lang="json"
        title="components.json"
        code={JSON.stringify({ registries: { [registryNamespace]: registryUrl } }, null, 2)}
      />
      <CodeBlock lang="bash" title="Terminal" code={`npx shadcn@latest add ${registryNamespace}/wallet`} />
      <p>Add several at once by listing them:</p>
      <CodeBlock
        lang="bash"
        title="Terminal"
        code={`npx shadcn@latest add ${registryNamespace}/annunciator ${registryNamespace}/guarded-switch ${registryNamespace}/meter`}
      />

      <h2>Option 2: straight from a URL</h2>
      <p>No configuration: point the CLI at a component&apos;s JSON. Its dependencies come with it.</p>
      <CodeBlock lang="bash" title="Terminal" code={`npx shadcn@latest add ${siteUrl}/r/wallet.json`} />

      <h2>Whole screens</h2>
      <p>
        Each of the <a className={linkClass} href="/demo">demo products</a> installs as a block: its code
        lands in <code>components/bevel-demos</code>, every Bevel component it uses comes with it, and a page
        renders it. Blocks are for Next.js apps, since each product sets its type with{" "}
        <code>next/font</code>.
      </p>
      <CodeBlock lang="bash" title="Terminal" code={`npx shadcn@latest add ${registryNamespace}/agent-console`} />
      <p>
        The others are <code>billing-desk</code>, <code>release-hall</code> and <code>review-desk</code>. Treat
        them as a starting point: the data is made up, and the state lives in the files you just added.
      </p>

      <h2>What you get</h2>
      <ul>
        <li>
          The component&apos;s source in <code>components/ui</code>, and any Bevel parts it&apos;s built
          from (a <code>Wallet</code> brings <code>PaymentCard</code> and <code>Amount</code>).
        </li>
        <li>
          Its styles, merged into your global CSS: the component&apos;s palette and, the first time, the
          Bevel foundation (light, depth, materials, motion and shape tokens).
        </li>
        <li>
          Its npm dependencies: <code>@base-ui/react</code> and <code>cn</code>, which the CLI installs
          for you.
        </li>
      </ul>
      <Note>
        The files are yours. To take a later version of a component, run <code>add</code> again with{" "}
        <code>--overwrite</code> and review the diff, as you would with any shadcn component.
      </Note>

      <h2>Use it</h2>
      <CodeBlock
        lang="tsx"
        title="app/page.tsx"
        code={`import { GuardedSwitch, GuardedSwitchControl, GuardedSwitchLabel } from "@/components/ui/guarded-switch"

export default function Page() {
  return (
    <GuardedSwitch onCheckedChange={(on) => on && deploy()}>
      <GuardedSwitchLabel>Deploy to production</GuardedSwitchLabel>
      <GuardedSwitchControl />
    </GuardedSwitch>
  )
}`}
      />
      <p>
        Every component page lists its parts, its props and a working example you can copy. Dark mode
        follows a <code>.dark</code> class on <code>html</code>, the shadcn default. See{" "}
        <a className={linkClass} href="/docs/theming">
          theming
        </a>
        .
      </p>
    </Guide>
  )
}
