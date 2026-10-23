"use client"

import * as React from "react"
import { Field } from "@base-ui/react/field"
import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "cn"
import { useBevelFeedback } from "@workspace/ui/lib/feedback"

type ToggleLeverProps = Omit<SwitchPrimitive.Root.Props, "children"> & {
  /** md prints OFF and ON on the plate; sm is the lever and lamp alone, for dense rows. */
  size?: "sm" | "md"
}

/**
 * An everyday on/off switch, as a bat-handle toggle on a small plate. The
 * lever swings through the bushing toward the side that's on, settling with
 * a little spring, and a lamp beside it lights. A Base UI Switch: Space
 * flips it.
 */
function ToggleLever({ className, size = "md", onCheckedChange, ...props }: ToggleLeverProps) {
  const feedback = useBevelFeedback()
  return (
    <SwitchPrimitive.Root
      data-slot="toggle-lever"
      data-size={size}
      onCheckedChange={(checked, details) => {
        feedback.toggle()
        onCheckedChange?.(checked, details)
      }}
      className={cn(
        "bevel-metal inline-flex h-6 shrink-0 cursor-pointer items-center gap-1.5 rounded-(--bevel-radius-xs) px-1.5 select-none",
        "outline-none focus-visible:ring-2 focus-visible:ring-(--toggle-lever-focus) focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "data-disabled:cursor-not-allowed data-disabled:opacity-60",
        "in-data-[slot=toggle-lever-field]:col-start-2 in-data-[slot=toggle-lever-field]:row-span-2 in-data-[slot=toggle-lever-field]:row-start-1 in-data-[slot=toggle-lever-field]:self-center",
        className
      )}
      {...props}
    >
      {size === "md" && (
        <span aria-hidden data-slot="toggle-lever-legend" data-side="off" className="toggle-lever-print">
          Off
        </span>
      )}
      <span aria-hidden data-slot="toggle-lever-throw" className="relative h-full w-(--toggle-lever-throw)">
        <SwitchPrimitive.Thumb
          data-slot="toggle-lever-bat"
          className={cn(
            "toggle-lever-bat absolute top-1/2 left-1/2 flex h-2 w-(--toggle-lever-reach) origin-left -translate-y-1/2 items-center",
            // Off points left, on points right: the bat swings out toward you and over, foreshortening on the way.
            "-scale-x-100 data-checked:scale-x-100",
            "transition-[scale] duration-(--bevel-duration-move) ease-(--bevel-ease-spring) motion-reduce:transition-none"
          )}
        >
          <span className="h-1 flex-1 rounded-full bg-(--toggle-lever-chrome-shaft)" />
          <span className="toggle-lever-ball size-2 shrink-0 rounded-full" />
        </SwitchPrimitive.Thumb>
        <span data-slot="toggle-lever-bushing" className="toggle-lever-bushing absolute top-1/2 left-1/2 size-2.5 -translate-1/2 rounded-full" />
      </span>
      {size === "md" && (
        <span aria-hidden data-slot="toggle-lever-legend" data-side="on" className="toggle-lever-print">
          On
        </span>
      )}
      <span aria-hidden data-slot="toggle-lever-lamp" className="bevel-led size-1.5 shrink-0 rounded-full" />
    </SwitchPrimitive.Root>
  )
}

/**
 * A settings row: label and description on the left, the lever on the right.
 * Base UI Field, so the label names the switch and the description describes it.
 */
function ToggleLeverField({ className, ...props }: Field.Root.Props) {
  return (
    <Field.Root
      data-slot="toggle-lever-field"
      className={cn("grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-0.5", className)}
      {...props}
    />
  )
}

function ToggleLeverLabel({ className, ...props }: Field.Label.Props) {
  return (
    <Field.Label
      data-slot="toggle-lever-label"
      className={cn("col-start-1 text-sm font-medium text-foreground", className)}
      {...props}
    />
  )
}

function ToggleLeverDescription({ className, ...props }: Field.Description.Props) {
  return (
    <Field.Description
      data-slot="toggle-lever-description"
      className={cn("col-start-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

export { ToggleLever, ToggleLeverField, ToggleLeverLabel, ToggleLeverDescription }
export type { ToggleLeverProps }
