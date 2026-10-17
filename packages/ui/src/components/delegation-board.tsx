"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "@base-ui/react/progress"
import { cn } from "cn"

/** Pigeonholes for delegated work, one per subagent. Give it an aria-label. */
function DelegationBoard({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="delegation-board"
      className={cn(
        "bevel-leather bevel-object grid w-full grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-3 rounded-(--bevel-radius-md) p-3 text-(--delegation-foreground)",
        className
      )}
      {...props}
    />
  )
}

type DelegationStatus = "pending" | "active" | "awaiting" | "error" | "complete"

const statusText: Record<DelegationStatus, string> = {
  pending: "Pending",
  active: "Working",
  awaiting: "Needs you",
  error: "Error",
  complete: "Done",
}

const SlotContext = React.createContext<DelegationStatus>("pending")

type DelegationSlotProps = React.ComponentProps<"li"> & {
  status?: DelegationStatus
}

/**
 * One subagent's cubby. Its status shows as a lamp and in words; finished
 * work rises out of the cubby.
 */
function DelegationSlot({ className, status = "pending", children, ...props }: DelegationSlotProps) {
  return (
    <SlotContext value={status}>
      <li
        data-slot="delegation-slot"
        data-status={status}
        className={cn("bevel-recessed flex flex-col gap-2 rounded-(--bevel-radius-sm) p-2.5 pt-3", className)}
        {...props}
      >
        {children}
      </li>
    </SlotContext>
  )
}

/** The agent's name and lamp across the top of the cubby. Put a NameTag in it. */
function DelegationAgent({ className, children, ...props }: React.ComponentProps<"div">) {
  const status = React.useContext(SlotContext)
  return (
    <div
      data-slot="delegation-agent"
      className={cn("flex min-w-0 items-center justify-between gap-2", className)}
      {...props}
    >
      <div className="min-w-0">{children}</div>
      <span className="bevel-deboss flex shrink-0 items-center gap-1.5 text-(length:--bevel-fine) font-semibold tracking-(--bevel-tracking-print) uppercase">
        <span aria-hidden className="bevel-led size-1.5 rounded-full" />
        {statusText[status]}
      </span>
    </div>
  )
}

/** The task slip in the cubby. Rises out when the work comes back. */
function DelegationTask({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="delegation-task"
      className={cn(
        "bevel-paper rounded-(--bevel-radius-xs) px-3 py-2 text-sm leading-snug shadow-(--bevel-depth-sheet)",
        "transition-[translate] duration-(--bevel-duration-move) ease-(--bevel-ease-spring) motion-reduce:transition-none",
        "in-data-[status=complete]:-translate-y-(--delegation-return)",
        "in-data-[status=pending]:text-(--bevel-pencil)",
        className
      )}
      {...props}
    />
  )
}

type DelegationProgressProps = Omit<ProgressPrimitive.Root.Props, "children">

/** How far along the subagent is. Name it after the agent: "Research progress". */
function DelegationProgress({
  className,
  value,
  max = 100,
  "aria-label": ariaLabel = "Progress",
  ...props
}: DelegationProgressProps) {
  return (
    <ProgressPrimitive.Root
      data-slot="delegation-progress"
      value={value}
      max={max}
      aria-label={ariaLabel}
      className={cn("px-0.5", className)}
      {...props}
    >
      <ProgressPrimitive.Track className="relative h-1 overflow-hidden rounded-full bg-(--delegation-foreground)/15">
        {/* Scaled, not resized, so progress never relays out the board. */}
        <span
          aria-hidden
          className="absolute inset-0 origin-left rounded-full bg-(--bevel-led) transition-[scale] duration-(--bevel-duration-move) ease-(--bevel-ease-out) motion-reduce:transition-none"
          style={{ scale: `${max && value !== null ? Math.min(1, (value ?? 0) / max) : 0} 1` }}
        />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  )
}

export { DelegationBoard, DelegationSlot, DelegationAgent, DelegationTask, DelegationProgress }
export type { DelegationStatus, DelegationSlotProps }
