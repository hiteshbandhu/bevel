import Link from "next/link"
import { Screws } from "@/components/demo-sites/shared/environment"
import { InstallCommand } from "@/components/install-command"
import { componentHref, components, getComponent } from "@/lib/catalog"
import { guideHref, repoUrl, xHandle, xUrl } from "@/lib/docs"
import { origins } from "@/lib/origins"
import { registryNamespace } from "@/lib/site"

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Library",
    links: [
      { label: "Components", href: "/components" },
      { label: "Themes", href: "/themes" },
      { label: "Demos", href: "/demo" },
      { label: "Sound and haptics", href: guideHref("sound") },
    ],
  },
  {
    title: "Docs",
    links: [
      { label: "Introduction", href: guideHref("") },
      { label: "Installation", href: guideHref("installation") },
      { label: "Use with AI", href: guideHref("ai") },
      { label: "Theming", href: guideHref("theming") },
      { label: "Accessibility", href: guideHref("accessibility") },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "llms.txt", href: "/llms.txt" },
      { label: "Registry index", href: "/r/registry.json" },
      { label: "Sitemap", href: "/sitemap.xml" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "GitHub", href: repoUrl },
      { label: "Issues", href: `${repoUrl}/issues` },
      { label: `@${xHandle} on X`, href: xUrl },
      { label: "21st.dev", href: "https://21st.dev/@bandhuhitesh52003" },
    ],
  },
]

/** The patents behind the library, oldest first: the line a machine's rating plate carries. */
const patents = Object.entries(origins)
  .filter(([, o]) => o.kind === "patent")
  .sort(([, a], [, b]) => (a.year ?? 0) - (b.year ?? 0))
  .map(([slug, o]) => ({ slug, number: o.label.replace(/^[A-Z]{2} /, ""), country: o.label.slice(0, 2), year: o.year, component: getComponent(slug) }))
  .filter((p) => p.component)

const linkClass =
  "rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"

/**
 * Link columns, then the rating plate: the brass plate on the back of an
 * instrument that names its maker, model and licence and lists the patents it
 * was built under. Here each patent number links to the component it became.
 */
export function SiteFooter() {
  const count = components.length
  return (
    <footer className="mt-24 border-t">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]">
          <div className="col-span-2 flex flex-col items-start gap-4 lg:col-span-1">
            <Link
              href="/"
              className="wordmark flex items-center gap-2 rounded-sm text-lg font-extrabold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <img src="/logo.png" alt="" width={24} height={24} className="size-6" />
              Bevel
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              {count} skeuomorphic React components for shadcn, each modelled on a real object. Open source.
            </p>
            <InstallCommand command={`npx shadcn@latest add ${registryNamespace}/meter`} />
          </div>
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title} className="flex flex-col gap-3 text-sm">
              <h2 className="font-semibold">{column.title}</h2>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    {/* Files (sitemap.xml, registry.json) and other sites aren't pages to prefetch. */}
                    {link.href.startsWith("http") || /\.\w+$/.test(link.href) ? (
                      <a href={link.href} className={linkClass}>
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className={linkClass}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div
          className="bevel-metal relative mt-14 rounded-(--bevel-radius-sm) px-8 py-5 text-[oklch(0.3_0.05_70)] shadow-(--bevel-depth-raised) [--bevel-material:var(--bevel-brass)] [--bevel-material-edge:var(--bevel-brass-edge)] [text-shadow:0_1px_0_oklch(1_0_0/0.35)]"
        >
          <Screws inset="2" />
          <p className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 font-mono text-xs font-semibold tracking-[0.12em] uppercase">
            <span>Bevel · Skeuomorphic components</span>
            <span>MIT licence</span>
            <span>
              Made by{" "}
              <a href={xUrl} className="rounded-sm underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.3_0.05_70)]">
                @{xHandle}
              </a>
            </span>
          </p>
          <p className="mt-3 border-t border-[oklch(0.3_0.05_70)]/25 pt-3 font-mono text-[11px] leading-relaxed tracking-wide">
            <span className="font-semibold">PAT.</span>{" "}
            {patents.map((p, i) => (
              <span key={p.slug}>
                <Link
                  href={componentHref(p.component!)}
                  title={`${p.component!.name}: ${p.country} ${p.number}, ${p.year}`}
                  className="rounded-sm outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[oklch(0.3_0.05_70)]"
                >
                  {p.country} {p.number}
                </Link>
                {i < patents.length - 1 ? " · " : ""}
              </span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  )
}
