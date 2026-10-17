"use client"

import * as React from "react"
import { cn } from "cn"

type MotorizedFaderProps = Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> & {
  value: number
  /** Called when you move it. Set changedBy to you when you take it. */
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  /** Who set the current value. Anyone but you, and the motor drives the cap there. */
  changedBy?: string
  /** Your name as changedBy shows it. Default "You". */
  you?: string
  /** How the value reads aloud and on the scribble strip. */
  format?: (value: number) => string
  disabled?: boolean
}

/**
 * A motorized console fader. When someone else (an agent, a teammate, an
 * automation) sets it, the cap travels there on its own and says who moved
 * it. Grab it, or use the arrow keys, and it's yours. Vertical.
 */
function MotorizedFader({
  className,
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  changedBy,
  you = "You",
  format = String,
  disabled,
  ...props
}: MotorizedFaderProps) {
  const track = React.useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = React.useState(false)
  const t = max === min ? 0 : (Math.min(Math.max(value, min), max) - min) / (max - min)
  const remote = changedBy !== undefined && changedBy !== you

  const set = (next: number) => {
    const snapped = Math.min(max, Math.max(min, Math.round((next - min) / step) * step + min))
    if (snapped !== value) onValueChange?.(snapped)
  }
  const fromPointer = (event: React.PointerEvent) => {
    const box = track.current?.getBoundingClientRect()
    if (!box) return
    set(min + (1 - (event.clientY - box.top) / box.height) * (max - min))
  }
  const onKeyDown = (event: React.KeyboardEvent) => {
    const big = Math.max(step, (max - min) / 10)
    const moves: Record<string, number> = {
      ArrowUp: value + step,
      ArrowRight: value + step,
      ArrowDown: value - step,
      ArrowLeft: value - step,
      PageUp: value + big,
      PageDown: value - big,
      Home: min,
      End: max,
    }
    if (!(event.key in moves)) return
    event.preventDefault()
    set(moves[event.key]!)
  }

  return (
    <div
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-orientation="vertical"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={`${format(value)}${changedBy ? `, set by ${changedBy}` : ""}`}
      aria-disabled={disabled || undefined}
      data-slot="motorized-fader"
      data-remote={remote ? "" : undefined}
      data-dragging={dragging ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      onKeyDown={disabled ? undefined : onKeyDown}
      onPointerDown={(event) => {
        if (disabled || event.button !== 0) return
        event.currentTarget.setPointerCapture(event.pointerId)
        setDragging(true)
        fromPointer(event)
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) fromPointer(event)
      }}
      onPointerUp={() => setDragging(false)}
      onLostPointerCapture={() => setDragging(false)}
      className={cn(
        "group relative flex h-[calc(var(--motorized-fader-travel)+var(--motorized-fader-cap))] w-14 touch-none justify-center outline-none select-none data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      {/* Scale lines either side of the slot. */}
      <span aria-hidden className="absolute inset-y-[calc(var(--motorized-fader-cap)/2)] inset-x-1 flex flex-col justify-between">
        {Array.from({ length: 11 }, (_, i) => (
          <span key={i} className={cn("h-px bg-(--bevel-shade-strong)", i % 5 === 0 ? "w-full" : "mx-2")} />
        ))}
      </span>
      <span
        ref={track}
        aria-hidden
        className="absolute inset-y-[calc(var(--motorized-fader-cap)/2)] w-1.5 rounded-full bg-(--bevel-material-recess) shadow-(--bevel-depth-recessed)"
      />
      {/* The cap: moved with translate. The motor is slow; your hand isn't. */}
      <span
        aria-hidden
        data-slot="motorized-fader-cap"
        className={cn(
          "bevel-metal absolute bottom-0 flex h-(--motorized-fader-cap) w-11 items-center justify-center rounded-(--bevel-radius-xs) shadow-(--bevel-depth-object)",
          "transition-[translate] duration-(--bevel-duration-press) ease-(--bevel-ease-out)",
          "group-data-remote:duration-(--bevel-duration-ambient) group-data-remote:ease-(--bevel-ease-in-out)",
          "group-data-dragging:duration-0 motion-reduce:transition-none",
          "group-focus-visible:ring-3 group-focus-visible:ring-ring/60"
        )}
        style={{ translate: `0 calc(var(--motorized-fader-travel) * ${-t})` }}
      >
        <span className="h-0.5 w-full bg-(--motorized-fader-line)" />
      </span>
    </div>
  )
}

type MotorizedFaderReadoutProps = React.ComponentProps<"p"> & {
  value: string
  changedBy?: string
  you?: string
}

/** A scribble strip: the value, and who set it. A lamp lights when it wasn't you. */
function MotorizedFaderReadout({ className, value, changedBy, you = "You", ...props }: MotorizedFaderReadoutProps) {
  const remote = changedBy !== undefined && changedBy !== you
  return (
    <p
      data-slot="motorized-fader-readout"
      data-remote={remote ? "" : undefined}
      className={cn("flex flex-col items-center gap-0.5 text-center text-xs", className)}
      {...props}
    >
      <span className="font-mono text-sm font-semibold tabular-nums">{value}</span>
      {changedBy && (
        <span className="flex items-center gap-1 text-muted-foreground">
          <span
            aria-hidden
            className={cn("size-1.5 rounded-full", remote ? "bevel-led [--bevel-led:var(--motorized-fader-remote)]" : "bg-(--bevel-shade-strong)")}
          />
          {changedBy}
        </span>
      )}
    </p>
  )
}

export { MotorizedFader, MotorizedFaderReadout }
export type { MotorizedFaderProps, MotorizedFaderReadoutProps }
