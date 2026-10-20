import type { Origin } from "@/lib/origins"

/**
 * Where a component comes from, in the form old machines carried it: a
 * brass plate stamped with the patent number, and the story beside it.
 */
export function OriginPlate({ origin }: { origin: Origin }) {
  const stamp = origin.kind === "patent" ? origin.label.replace(/^([A-Z]{2}) /, "Pat. $1 ") : origin.relation
  return (
    <aside aria-label="Where it comes from" className="mt-8 flex max-w-2xl flex-col gap-4 sm:flex-row sm:items-start">
      <div
        aria-hidden
        className="bevel-metal flex shrink-0 flex-col items-center justify-center gap-0.5 self-start rounded-(--bevel-radius-sm) px-4 py-2.5 text-center text-[oklch(0.32_0.05_70)] shadow-(--bevel-depth-raised) [--bevel-material:var(--bevel-brass)] [--bevel-material-edge:var(--bevel-brass-edge)] [text-shadow:0_1px_0_oklch(1_0_0/0.35)]"
      >
        <span className="font-mono text-sm font-semibold tracking-wide whitespace-nowrap">{stamp}</span>
        {origin.year && <span className="font-mono text-xs">{origin.year}</span>}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">
          {origin.relation}:{" "}
          <a
            href={origin.url}
            className="rounded-sm font-medium text-foreground underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {origin.kind === "patent" ? `${origin.label}, “${origin.title}”` : origin.label}
          </a>
          , {origin.who}
          {origin.year ? `, ${origin.year}` : ""}.
        </p>
        <p className="mt-1.5 text-[15px] leading-relaxed">{origin.note}</p>
      </div>
    </aside>
  )
}
