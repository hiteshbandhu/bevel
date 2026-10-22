"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { cn } from "cn"

/** A trigger and the sheet it lifts. */
function Popover(props: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

/** Opens the sheet. Renders a button; pass `render` to use your own. */
function PopoverTrigger(props: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

type PopoverContentProps = PopoverPrimitive.Popup.Props &
  Pick<PopoverPrimitive.Positioner.Props, "side" | "align" | "sideOffset" | "alignOffset" | "collisionPadding"> & {
    /** Leave out the folded tab, e.g. when the sheet hangs off a wide toolbar. */
    tab?: boolean
  }

/**
 * The sheet: panel stock lifted off the page on the shared light, with a
 * folded tab at the trigger. It lifts toward you and settles.
 */
function PopoverContent({
  className,
  children,
  side = "bottom",
  align = "center",
  sideOffset = 10,
  alignOffset = 0,
  collisionPadding = 8,
  tab = true,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        className="z-50"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "popover-sheet relative flex w-(--popover-width) max-w-(--available-width) origin-(--transform-origin) flex-col gap-3 rounded-(--bevel-radius-md) p-4 text-sm outline-none",
            "transition-[translate,scale,opacity] duration-(--bevel-duration-move) ease-(--bevel-ease-spring) motion-reduce:transition-none",
            "data-starting-style:scale-(--popover-lift-scale) data-starting-style:opacity-0",
            "data-ending-style:scale-(--popover-lift-scale) data-ending-style:opacity-0 data-ending-style:duration-(--bevel-duration-small) data-ending-style:ease-(--bevel-ease-out)",
            "data-[side=bottom]:data-starting-style:-translate-y-(--popover-lift) data-[side=top]:data-starting-style:translate-y-(--popover-lift)",
            "data-[side=left]:data-starting-style:translate-x-(--popover-lift) data-[side=right]:data-starting-style:-translate-x-(--popover-lift)",
            "focus-visible:ring-2 focus-visible:ring-(--bevel-pen-blue)/50",
            "forced-colors:border forced-colors:border-[CanvasText]",
            className
          )}
          {...props}
        >
          {tab && <PopoverPrimitive.Arrow data-slot="popover-tab" aria-hidden className="absolute" />}
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

/** Title and description, with room on the right for a close button. */
function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-1 has-data-[slot=popover-close]:pr-8", className)}
      {...props}
    />
  )
}

/** Names the sheet for screen readers. */
function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn("text-sm leading-tight font-semibold", className)}
      {...props}
    />
  )
}

function PopoverDescription({ className, ...props }: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn("text-sm text-(--popover-sheet-muted)", className)}
      {...props}
    />
  )
}

/** Closes the sheet. With no children, a small × in the top corner, labelled "Close". */
function PopoverClose({ className, children, ...props }: PopoverPrimitive.Close.Props) {
  const corner = children === undefined
  return (
    <PopoverPrimitive.Close
      data-slot="popover-close"
      aria-label={corner ? "Close" : undefined}
      className={cn(
        corner &&
          "absolute top-3 right-3 inline-flex size-6 items-center justify-center rounded-(--bevel-radius-xs) text-(--popover-sheet-muted) outline-none hover:text-(--popover-sheet-foreground) focus-visible:ring-2 focus-visible:ring-(--bevel-pen-blue)/50",
        className
      )}
      {...props}
    >
      {corner ? (
        <svg aria-hidden viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      ) : (
        children
      )}
    </PopoverPrimitive.Close>
  )
}

export { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription, PopoverClose }
export type { PopoverContentProps }
