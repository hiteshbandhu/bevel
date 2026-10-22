import Link from "next/link"
import { CopyPage } from "@/components/copy-page"
import { cn } from "@workspace/ui/lib/utils"
import { guideHref, guides } from "@/lib/docs"

/** A written guide: title, lead, body, and the next guide at the end. */
export function Guide({ slug, children }: { slug: (typeof guides)[number]["slug"]; children: React.ReactNode }) {
  const i = guides.findIndex((g) => g.slug === slug)
  const guide = guides[i]!
  const next = guides[i + 1]
  return (
    <article className="max-w-3xl">
      <p className="text-sm text-muted-foreground">Get started</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <h1 className="text-4xl font-bold tracking-tight">{guide.title}</h1>
        <CopyPage />
      </div>
      <p className="mt-3 max-w-prose text-lg text-muted-foreground">{guide.description}</p>
      <div className="prose-guide mt-10">{children}</div>
      {next && (
        <Link
          href={guideHref(next.slug)}
          className="mt-16 flex flex-col gap-1 rounded-xl border p-4 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="text-sm text-muted-foreground">Next</span>
          <span className="font-semibold">{next.title}</span>
        </Link>
      )}
    </article>
  )
}

/** A short aside: a rule, a warning, a tip. */
export function Note({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border bg-card px-4 py-3 text-sm", className)}>{children}</div>
}

export const linkClass =
  "rounded-sm font-medium underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
