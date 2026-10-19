import Link from "next/link"
import { DemoInstall } from "@/components/demo-install"
import { DemoTracker } from "@/components/demo-tracker"
import { demoSites } from "@/lib/demos"

/** A thin strip above each demo: which demo this is, and the way to the others. */
export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav aria-label="Demos" className="border-b bg-card">
        <div className="mx-auto flex h-11 max-w-7xl items-center gap-4 overflow-x-auto px-4 text-sm sm:px-6">
          <Link href="/demo" className="shrink-0 font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">
            Demos
          </Link>
          {demoSites.map((site) => (
            <Link
              key={site.n}
              href={`/demo/${site.n}`}
              className="shrink-0 rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              {site.n}. {site.name}
            </Link>
          ))}
          <DemoInstall />
        </div>
      </nav>
      <DemoTracker>{children}</DemoTracker>
    </>
  )
}
