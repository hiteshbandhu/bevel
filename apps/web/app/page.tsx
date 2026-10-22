import Link from "next/link"
import { CodeBlock } from "@/components/code-block"
import { ComponentTile } from "@/components/component-tile"
import { ApprovalSend } from "@/components/demos/approval-send"
import { CitationAnswer } from "@/components/demos/citation-answer"
import { CreditsCheckout } from "@/components/demos/credits-checkout"
import { DelegationBoardAgents } from "@/components/demos/delegation-board-agents"
import { LedgerHistory } from "@/components/demos/ledger-history"
import { MeterLiveUsage } from "@/components/demos/meter-live-usage"
import { TaskPlanAgent } from "@/components/demos/task-plan-agent"
import { WalletCheckout } from "@/components/demos/wallet-checkout"
import { Key } from "@workspace/ui/components/key"
import { GitHubStar } from "@/components/github-star"
import { HomeTabs } from "@/components/home-tabs"
import { InstallCommand } from "@/components/install-command"
import { JsonLd, library } from "@/components/json-ld"
import { categories, components, componentHref, componentsIn, getComponent } from "@/lib/catalog"
import { faq } from "@/lib/faq"
import { getStars } from "@/lib/github"
import { origins } from "@/lib/origins"
import { registryNamespace, registryUrl, siteUrl } from "@/lib/site"

export default async function Home() {
  const stars = await getStars()
  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6">
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "WebSite", name: "Bevel", url: siteUrl },
          { "@context": "https://schema.org", ...library },
        ]}
      />
      <section className="grid items-center gap-12 py-12 lg:grid-cols-[1fr_auto] lg:py-20">
        <div className="min-w-0">
          {/* Machines carried their patent number on a brass plate; so does this. */}
          <Link
            href="#origins"
            className="group mb-7 flex w-fit max-w-full items-center gap-3 rounded-full border bg-muted/40 py-1 pr-5 pl-1 text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="bevel-metal shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold tracking-wide text-[oklch(0.32_0.05_70)] shadow-(--bevel-depth-raised) [--bevel-material:var(--bevel-brass)] [--bevel-material-edge:var(--bevel-brass-edge)] [text-shadow:0_1px_0_oklch(1_0_0/0.35)]">
              Pat. 1895–2023
            </span>
            <span className="truncate text-muted-foreground group-hover:text-foreground">
              {/* The short line where the hero column is narrow: phones, and lg before xl. */}
              <span className="sm:hidden lg:inline xl:hidden">Modelled on real patents</span>
              <span className="hidden sm:inline lg:hidden xl:inline">Every component is modelled on a real patent</span>
            </span>
            <span
              aria-hidden
              className="shrink-0 text-muted-foreground transition-transform duration-(--bevel-duration-small) ease-(--bevel-ease-out) group-hover:translate-x-0.5 group-hover:text-foreground motion-reduce:transition-none"
            >
              →
            </span>
          </Link>
          <h1 className="max-w-[14ch] text-5xl leading-[1.05] font-bold tracking-tight text-balance sm:text-6xl">
            Interface parts with weight, edges and light.
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg text-muted-foreground">
            {components.length} real objects, from label-maker tape to a cockpit&apos;s guarded switch,
            as skeuomorphic React components for shadcn. Each cites the patent or history it comes from, runs on
            Base UI and Tailwind, and installs as source you own.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Key variant="primary" size="lg" nativeButton={false} render={<Link href="/components" />}>
              Browse {components.length} components
            </Key>
            <GitHubStar stars={stars} />
            <InstallCommand command={`npx shadcn@latest add ${registryNamespace}/wallet`} />
          </div>
        </div>
        <div className="tray flex justify-center rounded-(--bevel-radius-xl) px-6 py-12 sm:px-12 lg:w-[30rem]">
          <div className="w-full max-w-sm">
            <WalletCheckout />
          </div>
        </div>
      </section>

      <section className="border-t py-12" aria-labelledby="browse">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div>
            <h2 id="browse" className="text-2xl font-semibold tracking-tight">
              Find the part you need
            </h2>
            <p className="mt-2 max-w-prose text-muted-foreground">
              {components.length} components in {categories.length} collections. Each one works on its own and
              installs with one command.
            </p>
          </div>
          <Link
            href="/components"
            className="rounded-sm text-sm font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            All components →
          </Link>
        </div>
        <div className="mt-6">
          <HomeTabs
            label="Collections"
            trackId="browse"
            items={categories.map((category) => {
              const items = componentsIn(category.slug)
              return {
                value: category.slug,
                label: category.name,
                count: items.length,
                content: (
                  <>
                    <p className="max-w-prose text-sm text-muted-foreground">{category.description}</p>
                    {/* A swipeable strip on a phone, so a collection is one row tall; a grid from sm up. */}
                    <ul className="-mx-4 mt-6 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
                      {items.map((component) => (
                        <li key={component.slug} className="w-64 shrink-0 snap-start sm:w-auto">
                          <ComponentTile component={component} compact />
                        </li>
                      ))}
                    </ul>
                  </>
                ),
              }
            })}
          />
        </div>
      </section>

      <section className="border-t py-12" aria-labelledby="assembled">
        <h2 id="assembled" className="text-2xl font-semibold tracking-tight">
          Whole screens, assembled
        </h2>
        <p className="mt-2 max-w-prose text-muted-foreground">
          The parts compose into the screens products actually need. Everything here is live.
        </p>
        <div className="mt-6">
          <HomeTabs
            label="Screens"
            trackId="assembled"
            items={[
              {
                value: "billing",
                label: "Billing",
                content: (
                  <>
                    <p className="max-w-prose text-sm text-muted-foreground">
                      Pick a pack and pay, watch a turn&apos;s cost run, and read the history.
                    </p>
                    <div className="tray mt-6 grid gap-10 rounded-(--bevel-radius-xl) p-6 sm:p-10 lg:grid-cols-[22rem_minmax(0,1fr)]">
                      <CreditsCheckout />
                      <div className="flex min-w-0 flex-col gap-10">
                        <div className="max-w-sm">
                          <MeterLiveUsage />
                        </div>
                        <LedgerHistory />
                      </div>
                    </div>
                  </>
                ),
              },
              {
                value: "agent",
                label: "An agent at work",
                content: (
                  <>
                    <p className="max-w-prose text-sm text-muted-foreground">
                      A plan on a legal pad, subagents in their pigeonholes, an answer with its sources
                      pinned in, and a seal you hold before anything leaves the firm.
                    </p>
                    <div className="tray mt-6 flex flex-col gap-10 rounded-(--bevel-radius-xl) p-6 sm:p-10">
                      <div className="grid gap-10 lg:grid-cols-2">
                        <TaskPlanAgent />
                        <div className="flex flex-col gap-10">
                          <CitationAnswer />
                          <ApprovalSend />
                        </div>
                      </div>
                      <DelegationBoardAgents />
                    </div>
                  </>
                ),
              },
            ]}
          />
        </div>
      </section>

      <section className="border-t py-12" aria-labelledby="origins">
        <h2 id="origins" className="text-2xl font-semibold tracking-tight">
          Every component has a patent, or a past
        </h2>
        <p className="mt-2 max-w-prose text-muted-foreground">
          Each one is modelled on a real object, and its page cites where that object came from: a
          cyclometer from 1895, a postage meter from 1902, a departure board from Udine.
        </p>
        <ul className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {["number-wheel", "meter", "visible-file", "keysort-filter", "split-flap", "guarded-switch"].map((slug) => {
            const origin = origins[slug]!
            const component = getComponent(slug)!
            return (
              <li key={slug} className="flex flex-col gap-2">
                <span className="bevel-metal self-start rounded-(--bevel-radius-sm) px-3 py-1.5 font-mono text-xs font-semibold tracking-wide text-[oklch(0.32_0.05_70)] shadow-(--bevel-depth-raised) [--bevel-material:var(--bevel-brass)] [--bevel-material-edge:var(--bevel-brass-edge)]">
                  {origin.kind === "patent" ? origin.label.replace(/^([A-Z]{2}) /, "Pat. $1 ") : origin.relation}, {origin.year}
                </span>
                <Link
                  href={componentHref(component)}
                  className="self-start rounded-sm font-semibold outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {component.name}
                </Link>
                <p className="line-clamp-2 text-sm text-muted-foreground">{origin.note}</p>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="grid gap-10 border-t py-12 lg:grid-cols-[1fr_1fr]" aria-labelledby="install">
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

      <section className="border-t py-12" aria-labelledby="faq">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map(({ q, a }) => ({
              "@type": "Question",
              name: q,
              acceptedAnswer: { "@type": "Answer", text: a },
            })),
          }}
        />
        <h2 id="faq" className="text-2xl font-semibold tracking-tight">
          Questions
        </h2>
        {/* Closed by default; the answers stay in the page for search and answer engines. */}
        <div className="mt-6 grid gap-x-12 md:grid-cols-2">
          {faq.map(({ q, a }) => (
            <details key={q} className="group border-b py-4">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                {q}
                <span
                  aria-hidden
                  className="mt-0.5 shrink-0 text-muted-foreground transition-transform duration-(--bevel-duration-small) ease-(--bevel-ease-out) group-open:rotate-45 motion-reduce:transition-none"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </section>

    </main>
  )
}
