"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { cn } from "cn"
import { Stamp } from "@workspace/ui/components/stamp"

/** A cited source. Wraps a trigger (the exhibit sticker) and the passage it opens. */
function Citation(props: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="citation" {...props} />
}

type CitationTriggerProps = PopoverPrimitive.Trigger.Props & {
  /** Sticker colour: yellow (the default), blue, or white. */
  tone?: "yellow" | "blue" | "white"
  /** The printed prefix on the sticker. */
  abbreviation?: string
  /** The prefix in full, read by screen readers instead of the abbreviation. */
  label?: string
}

/**
 * The exhibit sticker, inline in text: "Ex. 4". Read as "Exhibit 4". Opens
 * the source on click, Enter or Space.
 */
function CitationTrigger({
  className,
  tone = "yellow",
  abbreviation = "Ex.",
  label = "Exhibit",
  children,
  ...props
}: CitationTriggerProps) {
  return (
    <PopoverPrimitive.Trigger
      data-slot="citation-trigger"
      data-tone={tone}
      className={cn(
        "mx-0.5 inline-flex -translate-y-px rotate-(--citation-tilt) items-baseline gap-0.5 rounded-(--bevel-radius-xs) bg-(--citation-sticker) px-1 py-px align-baseline text-(length:--citation-size) leading-none font-bold text-(--bevel-sticker-foreground) shadow-(--bevel-depth-sheet) outline-none select-none",
        "cursor-pointer transition-[translate,rotate] duration-(--bevel-duration-small) ease-(--bevel-ease-out) motion-reduce:transition-none",
        "hover:-translate-y-0.5 data-popup-open:rotate-0 data-popup-open:-translate-y-0.5",
        "focus-visible:ring-2 focus-visible:ring-(--bevel-pen-blue)/60 focus-visible:ring-offset-1",
        "forced-colors:border forced-colors:border-[ButtonText]",
        className
      )}
      {...props}
    >
      <span aria-hidden className="text-(length:--citation-abbreviation-size) tracking-(--bevel-tracking-print) uppercase">
        {abbreviation}
      </span>
      <span className="sr-only">{label} </span>
      <span className="tabular-nums">{children}</span>
    </PopoverPrimitive.Trigger>
  )
}

/** The paper slip the sticker opens. Grows from the sticker. */
function CitationContent({
  className,
  children,
  side = "bottom",
  align = "start",
  sideOffset = 8,
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<PopoverPrimitive.Positioner.Props, "side" | "align" | "sideOffset">) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner side={side} align={align} sideOffset={sideOffset} className="z-50">
        <PopoverPrimitive.Popup
          data-slot="citation-content"
          className={cn(
            "bevel-paper flex w-80 max-w-[calc(100vw-2rem)] origin-(--transform-origin) flex-col gap-2 rounded-(--bevel-radius-xs) p-4 text-sm outline-none",
            "transition-[scale,opacity] duration-(--bevel-duration-small) ease-(--bevel-ease-out) motion-reduce:transition-none",
            "data-starting-style:scale-(--citation-pop-scale) data-starting-style:opacity-0 data-ending-style:scale-(--citation-pop-scale) data-ending-style:opacity-0",
            className
          )}
          {...props}
        >
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

/** The source's name. Titles the slip for screen readers. */
function CitationSource({ className, ...props }: PopoverPrimitive.Title.Props) {
  return (
    <PopoverPrimitive.Title
      data-slot="citation-source"
      className={cn("font-semibold text-(--bevel-paper-foreground)", className)}
      {...props}
    />
  )
}

/** Where in the source: page, paragraph, clause. */
function CitationLocation({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="citation-location"
      className={cn("font-mono text-(length:--bevel-fine) text-(--bevel-paper-muted)", className)}
      {...props}
    />
  )
}

/** The quoted passage, highlighted as if marked up by hand. */
function CitationQuote({ className, children, ...props }: React.ComponentProps<"blockquote">) {
  return (
    <blockquote
      data-slot="citation-quote"
      className={cn(
        "border-l-2 border-(--bevel-paper-rule) pl-3 leading-relaxed text-(--bevel-paper-foreground)",
        className
      )}
      {...props}
    >
      <mark className="box-decoration-clone bg-(--citation-highlight) px-0.5 text-inherit">
        {children}
      </mark>
    </blockquote>
  )
}

const statusStamp = {
  verified: { tone: "green", text: "Verified" },
  caution: { tone: "amber", text: "Caution" },
  unverified: { tone: "red", text: "Unverified" },
} as const

type CitationStatusProps = Omit<React.ComponentProps<typeof Stamp>, "tone" | "children"> & {
  /** Whether the source checks out. Always shown in words, never colour alone. */
  status: keyof typeof statusStamp
  /** Replace the stamped word. */
  children?: React.ReactNode
}

function CitationStatus({ status, className, children, ...props }: CitationStatusProps) {
  const stamp = statusStamp[status]
  return (
    <Stamp
      data-citation-status={status}
      tone={stamp.tone}
      className={cn("self-start", className)}
      {...props}
    >
      {children ?? stamp.text}
    </Stamp>
  )
}

/** Close the slip, or link onward to the full document. */
function CitationFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="citation-footer"
      className={cn("mt-1 flex items-center justify-between gap-3", className)}
      {...props}
    />
  )
}

export {
  Citation,
  CitationTrigger,
  CitationContent,
  CitationSource,
  CitationLocation,
  CitationQuote,
  CitationStatus,
  CitationFooter,
}
export type { CitationTriggerProps, CitationStatusProps }
