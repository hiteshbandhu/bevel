import type { Metadata } from "next"
import Link from "next/link"
import { demoSites } from "@/lib/demos"
import { components } from "@/lib/catalog"
import { registryNamespace } from "@/lib/site"

export const metadata: Metadata = { title: "Demos" }

const nameOf = (slug: string) => components.find((c) => c.slug === slug)?.name ?? slug

export default function DemosIndex() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight">Demos</h1>
      <p className="mt-3 max-w-prose text-lg text-muted-foreground">
        Four made-up products, each built from Bevel components wired together. Everything on them
        works, and each one installs as a whole screen.
      </p>
      <ul className="mt-10 grid gap-6 sm:grid-cols-2">
        {demoSites.map((site) => (
          <li key={site.n}>
            <Link
              href={`/demo/${site.n}`}
              className="tray flex h-full flex-col gap-3 rounded-(--bevel-radius-xl) p-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="text-sm text-muted-foreground">
                {site.n}. {site.kind}
              </span>
              <span className="text-2xl font-bold tracking-tight">{site.name}</span>
              <span className="text-muted-foreground">{site.description}</span>
              <span className="mt-auto pt-2 text-sm">Built from {site.uses.map(nameOf).join(", ")}</span>
              <code className="truncate font-mono text-xs text-muted-foreground">
                npx shadcn@latest add {registryNamespace}/{site.block}
              </code>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
