"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import { cn } from "cn"

/**
 * Shares the open delay between tooltips: once one is showing, moving to the
 * next opens it at once, with no animation. Wrap a toolbar or the whole app.
 */
function TooltipProvider({ delay = 400, closeDelay = 0, ...props }: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delay={delay} closeDelay={closeDelay} {...props} />
}

/** One trigger and the label it prints. */
function Tooltip(props: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

/** What the label is about. Renders a button; pass `render` to use your own. */
function TooltipTrigger(props: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

type TooltipContentProps = TooltipPrimitive.Popup.Props &
  Pick<TooltipPrimitive.Positioner.Props, "side" | "align" | "sideOffset" | "alignOffset"> & {
    /** Tape colour. Black is the default; red and blue are for the odd label that must stand out. */
    tone?: "black" | "red" | "blue"
  }

/**
 * The label: a strip of embossing tape with raised, pale letters and a tab
 * pointing at the trigger. Feeds out a short way from the trigger's side.
 */
function TooltipContent({
  className,
  children,
  tone = "black",
  side = "top",
  align = "center",
  sideOffset = 8,
  alignOffset = 0,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className="z-50"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          data-tone={tone}
          className={cn(
            "tooltip-tape relative max-w-(--tooltip-max-width) rounded-(--bevel-radius-xs) px-2 py-1 text-(length:--tooltip-text) leading-snug font-semibold tracking-(--bevel-tracking-print) text-balance uppercase select-none",
            "transition-[translate,opacity] duration-(--bevel-duration-small) ease-(--bevel-ease-out) motion-reduce:transition-none",
            "data-starting-style:opacity-0 data-ending-style:opacity-0 data-instant:transition-none",
            "data-[side=top]:data-starting-style:translate-y-(--tooltip-slide) data-[side=bottom]:data-starting-style:-translate-y-(--tooltip-slide)",
            "data-[side=left]:data-starting-style:translate-x-(--tooltip-slide) data-[side=right]:data-starting-style:-translate-x-(--tooltip-slide)",
            "forced-colors:border forced-colors:border-[CanvasText]",
            className
          )}
          {...props}
        >
          {children}
          <TooltipPrimitive.Arrow data-slot="tooltip-tab" aria-hidden className="absolute" />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent }
export type { TooltipContentProps }
