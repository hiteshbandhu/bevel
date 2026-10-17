"use client"

import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cn } from "cn"
import { NumberWheel, type NumberWheelProps } from "@workspace/ui/components/number-wheel"

type MeterState = "idle" | "running" | "stopped"

const MeterContext = React.createContext<{ state: MeterState }>({ state: "idle" })

type MeterProps = useRender.ComponentProps<"div"> & {
  /** running: the reading is ticking (taxi fare, live spend). stopped: it has settled. */
  state?: MeterState
  /** Bezel finish. */
  variant?: "brass" | "graphite"
}

/**
 * A metering instrument: a bezel around a face with a rolling reading.
 * Use it for prepaid balances that count down or running totals that count up.
 */
function Meter({ className, render, state = "idle", variant = "brass", children, ...props }: MeterProps) {
  const context = React.useMemo(() => ({ state }), [state])
  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        role: "group",
        "data-slot": "meter",
        "data-state": state,
        "data-variant": variant,
        className: cn(
          "bevel-metal bevel-object relative w-full max-w-sm rounded-(--bevel-radius-lg) p-(--bevel-stitch-inset)",
          "forced-colors:border forced-colors:border-[CanvasText]",
          className
        ),
        children: (
          <div
            data-slot="meter-face"
            className="bevel-leather flex flex-col gap-4 rounded-[calc(var(--bevel-radius-lg)-var(--bevel-stitch-inset))] p-5 text-(--meter-foreground) shadow-(--bevel-depth-recessed)"
          >
            {children}
          </div>
        ),
      } as React.ComponentProps<"div">,
      props
    ),
  })
  return <MeterContext value={context}>{element}</MeterContext>
}

function MeterHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="meter-header"
      className={cn("flex items-center justify-between gap-3", className)}
      {...props}
    />
  )
}

function MeterLabel({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="meter-label"
      className={cn(
        "bevel-deboss text-(length:--bevel-label) font-semibold tracking-(--bevel-tracking-label) text-(--meter-muted-foreground) uppercase",
        className
      )}
      {...props}
    />
  )
}

const flagText: Record<MeterState, string> = { idle: "Ready", running: "Running", stopped: "Stopped" }

/** The meter's flag: a lamp that lights while the reading runs. Children replace the text. */
function MeterFlag({ className, children, ...props }: React.ComponentProps<"span">) {
  const { state } = React.useContext(MeterContext)
  return (
    <span
      data-slot="meter-flag"
      className={cn(
        "bevel-deboss inline-flex items-center gap-1.5 text-(length:--bevel-label) font-medium text-(--meter-muted-foreground)",
        className
      )}
      {...props}
    >
      <span aria-hidden className="bevel-led size-2 shrink-0 rounded-full" />
      {children ?? flagText[state]}
    </span>
  )
}

/** The rolling reading. Announces its value to screen readers only once it stops running. */
function MeterReading({ className, live, ...props }: NumberWheelProps) {
  const { state } = React.useContext(MeterContext)
  return (
    <NumberWheel
      data-meter-reading=""
      live={live ?? (state === "running" ? "off" : "polite")}
      className={cn("self-start text-(length:--bevel-amount)", className)}
      {...props}
    />
  )
}

function MeterUnit({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="meter-unit"
      className={cn("bevel-deboss text-sm text-(--meter-muted-foreground)", className)}
      {...props}
    />
  )
}

function MeterFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="meter-footer" className={cn("flex items-center gap-2", className)} {...props} />
}

/** A brass push-button on the meter. Sinks when pressed. */
function MeterButton({ className, ...props }: ButtonPrimitive.Props) {
  return (
    <ButtonPrimitive
      data-slot="meter-button"
      className={cn(
        "bevel-raised inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-(--bevel-radius-sm) px-3 text-sm font-semibold text-(--bevel-ivory-foreground) outline-none select-none",
        "transition-[translate,box-shadow] duration-(--bevel-duration-press) ease-(--bevel-ease-out) motion-reduce:transition-none",
        "active:translate-y-0.5 active:bevel-pressed data-pressed:translate-y-0.5 data-pressed:bevel-pressed",
        "focus-visible:ring-3 focus-visible:ring-(--meter-foreground)/40",
        "data-disabled:cursor-not-allowed data-disabled:opacity-60",
        "forced-colors:border forced-colors:border-[ButtonText]",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

export { Meter, MeterHeader, MeterLabel, MeterFlag, MeterReading, MeterUnit, MeterFooter, MeterButton }
export type { MeterProps, MeterState }
