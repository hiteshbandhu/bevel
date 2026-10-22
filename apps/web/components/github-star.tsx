import { cn } from "@workspace/ui/lib/utils"
import { repoUrl } from "@/lib/docs"

/** Below this, a count reads as "nobody's here yet", so the button just says Star. */
const showCountFrom = 10

const format = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 })

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={className} fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

/**
 * Star the repo. `size="sm"` sits in the header; the default sits beside the
 * hero's primary button.
 */
export function GitHubStar({
  stars,
  size = "default",
  className,
}: {
  stars: number | null
  size?: "default" | "sm"
  className?: string
}) {
  const count = stars !== null && stars >= showCountFrom ? format.format(stars) : null
  return (
    <a
      href={repoUrl}
      data-size={size}
      className={cn(
        "group inline-flex shrink-0 items-center rounded-lg border bg-background font-medium shadow-xs outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        size === "sm" ? "h-8 text-[13px]" : "h-10 text-sm",
        className
      )}
    >
      <span className={cn("flex items-center gap-2", size === "sm" ? "px-2.5" : "px-3.5")}>
        <GitHubMark className="size-4" />
        <span>{size === "sm" ? "Star" : "Star on GitHub"}</span>
      </span>
      {count && (
        <span
          className={cn(
            "flex h-full items-center border-l font-mono text-xs text-muted-foreground tabular-nums group-hover:text-foreground",
            size === "sm" ? "px-2" : "px-3"
          )}
        >
          <span className="sr-only">, </span>
          {count}
          <span className="sr-only"> stars</span>
        </span>
      )}
    </a>
  )
}
