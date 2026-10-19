import Link from "next/link"
import { CategorySection } from "@/components/category-section"
import { CodeBlock } from "@/components/code-block"
import { ApprovalSend } from "@/components/demos/approval-send"
import { CitationAnswer } from "@/components/demos/citation-answer"
import { CreditsCheckout } from "@/components/demos/credits-checkout"
import { DelegationBoardAgents } from "@/components/demos/delegation-board-agents"
import { LedgerHistory } from "@/components/demos/ledger-history"
import { MeterLiveUsage } from "@/components/demos/meter-live-usage"
import { TaskPlanAgent } from "@/components/demos/task-plan-agent"
import { WalletCheckout } from "@/components/demos/wallet-checkout"
import { InstallCommand } from "@/components/install-command"
import { categories, components } from "@/lib/catalog"
import { xHandle, xUrl } from "@/lib/docs"
import { registryNamespace, registryUrl } from "@/lib/site"

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="grid items-center gap-12 py-16 lg:grid-cols-[1fr_auto] lg:py-24">
        <div className="min-w-0">
          <h1 className="max-w-[14ch] text-5xl leading-[1.05] font-bold tracking-tight text-balance sm:text-6xl">
            Interface parts with weight, edges and light.
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg text-muted-foreground">
            Bevel is a set of tactile React components built on Base UI and Tailwind. Add one with
            the shadcn CLI and the code is yours to change.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/components"
              className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Browse {components.length} components
            </Link>
            <InstallCommand command={`npx shadcn@latest add ${registryNamespace}/wallet`} />
          </div>
        </div>
        <div className="tray flex justify-center rounded-(--bevel-radius-xl) px-6 py-12 sm:px-12 lg:w-[30rem]">
          <div className="w-full max-w-sm">
            <WalletCheckout />
          </div>
        </div>
      </section>

      <section className="border-t py-16" aria-labelledby="assembled">
        <h2 id="assembled" className="text-2xl font-semibold tracking-tight">
          A billing screen, assembled
        </h2>
        <p className="mt-2 max-w-prose text-muted-foreground">
          Every part works on its own. Together they make the screen most products need: pick a
          pack and pay, watch a turn&apos;s cost run, and read the history. All of it is live.
        </p>
        <div className="tray mt-8 grid gap-10 rounded-(--bevel-radius-xl) p-6 sm:p-10 lg:grid-cols-[22rem_minmax(0,1fr)]">
          <CreditsCheckout />
          <div className="flex min-w-0 flex-col gap-10">
            <div className="max-w-sm">
              <MeterLiveUsage />
            </div>
            <LedgerHistory />
          </div>
        </div>
      </section>

      <section className="border-t py-16" aria-labelledby="agents-assembled">
        <h2 id="agents-assembled" className="text-2xl font-semibold tracking-tight">
          An agent at work, assembled
        </h2>
        <p className="mt-2 max-w-prose text-muted-foreground">
          The same idea for AI agents: a plan on a legal pad, subagents in their pigeonholes, an
          answer with its sources pinned in, and a seal you hold before anything leaves the firm.
        </p>
        <div className="tray mt-8 flex flex-col gap-10 rounded-(--bevel-radius-xl) p-6 sm:p-10">
          <div className="grid gap-10 lg:grid-cols-2">
            <TaskPlanAgent />
            <div className="flex flex-col gap-10">
              <CitationAnswer />
              <ApprovalSend />
            </div>
          </div>
          <DelegationBoardAgents />
        </div>
      </section>

      <section className="grid gap-10 border-t py-16 lg:grid-cols-[1fr_1fr]" aria-labelledby="install">
        <div>
          <h2 id="install" className="text-2xl font-semibold tracking-tight">
            Install once, then add what you need
          </h2>
          <p className="mt-2 max-w-prose text-muted-foreground">
            Bevel is a shadcn registry. Point your project at it once; after that each component
            arrives with the parts it&apos;s built from, its dependencies and its styles, merged
            into your global CSS. Nothing is wrapped in a package: the files are yours.
          </p>
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <CodeBlock
            lang="json"
            title="components.json"
            code={JSON.stringify({ registries: { [registryNamespace]: registryUrl } }, null, 2)}
          />
          <CodeBlock
            lang="bash"
            title="Terminal"
            code={`npx shadcn@latest add ${registryNamespace}/wallet ${registryNamespace}/receipt`}
          />
        </div>
      </section>

      <div className="flex flex-col gap-20 border-t py-16">
        {categories.map((category) => (
          <CategorySection key={category.slug} category={category} />
        ))}
      </div>

      <footer className="flex flex-wrap justify-between gap-4 border-t py-10 text-sm text-muted-foreground">
        <p>Built on Base UI and Tailwind CSS. Installs with the shadcn CLI.</p>
        <p>
          Made by{" "}
          <a
            href={xUrl}
            className="rounded-sm text-foreground underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            @{xHandle}
          </a>
        </p>
      </footer>
    </main>
  )
}
