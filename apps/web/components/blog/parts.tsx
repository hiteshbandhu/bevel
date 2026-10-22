import { cn } from "@workspace/ui/lib/utils"
import { CodeBlock } from "@/components/code-block"

/**
 * A control built from plain HTML and CSS. Like LabRow, both strings are
 * shown and both run: the page renders `html` as markup and puts `css` in a
 * style tag, so the demo can't drift from its code. Selectors are global, so
 * give every part's classes distinct names.
 */
export type Part = {
  label: string
  css: string
  html: string
  /** A background for this part's cell. Without one, the part sits in a tray. */
  surface?: string
}

/** Parts side by side. `css` is shared setup (tokens, a skeleton) that every part reads. */
export function PartRow({
  parts,
  css = "",
  className,
  caption,
}: {
  parts: Part[]
  css?: string
  /** Classes for the grid, e.g. the container class the shared tokens live on. */
  className?: string
  caption?: string
}) {
  return (
    <figure data-llm="omit" className="my-6">
      <style>{[css, ...parts.map((p) => p.css)].join("\n")}</style>
      <div
        className={cn(
          "grid grid-cols-1 gap-3 min-[420px]:grid-cols-2",
          parts.length === 3 && "sm:grid-cols-3",
          parts.length >= 4 && "md:grid-cols-4",
          className,
        )}
      >
        {parts.map((part) => (
          <div
            key={part.label}
            className={cn(
              "flex min-h-40 flex-col items-center justify-center gap-5 rounded-(--bevel-radius-xl) px-4 py-8",
              !part.surface && "tray",
            )}
            style={part.surface ? { background: part.surface } : undefined}
          >
            <div className="flex justify-center" dangerouslySetInnerHTML={{ __html: part.html }} />
            <span
              className={cn(
                "text-xs",
                part.surface ? "rounded-full bg-black/55 px-2 py-0.5 text-white" : "text-muted-foreground",
              )}
            >
              {part.label}
            </span>
          </div>
        ))}
      </div>
      {caption && <figcaption className="mt-2 text-sm text-muted-foreground">{caption}</figcaption>}
    </figure>
  )
}

/** A part's CSS and HTML, as shown in the text. Pass `markup={false}` to show only the CSS. */
export function PartCode({ part, markup = true }: { part: Pick<Part, "css" | "html">; markup?: boolean }) {
  return (
    <>
      <CodeBlock lang="css" title="styles.css" code={part.css.trim()} />
      {markup && <CodeBlock lang="html" title="index.html" code={part.html.trim()} />}
    </>
  )
}
