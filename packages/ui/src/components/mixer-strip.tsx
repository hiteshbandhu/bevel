"use client"

import * as React from "react"
import { Toggle } from "@base-ui/react/toggle"
import { cn } from "cn"
import { MotorizedFader, type MotorizedFaderProps } from "@workspace/ui/components/motorized-fader"

type MixerStripContextValue = { name: string; muted: boolean }

const MixerStripContext = React.createContext<MixerStripContextValue | null>(null)

function useMixerStrip() {
  const context = React.useContext(MixerStripContext)
  if (!context) throw new Error("MixerStrip parts must be inside <MixerStrip>")
  return context
}

/** A row of strips: one console. */
function Mixer({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="group"
      data-slot="mixer"
      className={cn("flex max-w-full gap-1 overflow-x-auto p-1", className)}
      {...props}
    />
  )
}

type MixerStripProps = React.ComponentProps<"div"> & {
  /** The channel's name: an agent, a source, a model. Names the group and its controls. */
  name: string
  /** Dims the strip. Pass the same value as MixerStripMute's pressed. */
  muted?: boolean
}

/** One channel: a name, mute and solo, and a fader. */
function MixerStrip({ className, name, muted = false, children, ...props }: MixerStripProps) {
  return (
    <MixerStripContext value={{ name, muted }}>
      <div
        role="group"
        aria-label={name}
        data-slot="mixer-strip"
        data-muted={muted ? "" : undefined}
        className={cn(
          "bevel-metal flex w-20 shrink-0 flex-col items-center gap-2 rounded-(--bevel-radius-sm) px-2 py-3",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </MixerStripContext>
  )
}

/** The scribble strip: the channel's name, lit. */
function MixerStripName({ className, ...props }: React.ComponentProps<"p">) {
  const { name } = useMixerStrip()
  return (
    <p
      aria-hidden
      data-slot="mixer-strip-name"
      className={cn(
        "w-full truncate rounded-(--bevel-radius-xs) bg-(--mixer-strip-scribble) px-1 py-1 text-center font-mono text-xs text-(--mixer-strip-scribble-foreground) shadow-(--bevel-depth-recessed)",
        "transition-opacity duration-(--bevel-duration-small) in-data-muted:opacity-40 motion-reduce:transition-none",
        className
      )}
      {...props}
    >
      {name}
    </p>
  )
}

const keyClass = cn(
  "bevel-raised h-7 w-full rounded-(--bevel-radius-xs) text-(length:--bevel-fine) font-black tracking-(--bevel-tracking-label) text-(--bevel-ivory) uppercase outline-none",
  "transition-[translate,box-shadow] duration-(--bevel-duration-press) ease-(--bevel-ease-out) motion-reduce:transition-none",
  "data-pressed:translate-y-px data-pressed:text-(--mixer-strip-lit-foreground)",
  "focus-visible:ring-3 focus-visible:ring-ring/60 data-disabled:opacity-50"
)

/** Mute: a toggle, named “Mute <name>”. */
function MixerStripMute({ className, ...props }: Toggle.Props) {
  const { name } = useMixerStrip()
  return (
    <Toggle aria-label={`Mute ${name}`} data-slot="mixer-strip-mute" className={cn(keyClass, className)} {...props}>
      M
    </Toggle>
  )
}

/** Solo: a toggle, named “Solo <name>”. What solo silences is up to you. */
function MixerStripSolo({ className, ...props }: Toggle.Props) {
  const { name } = useMixerStrip()
  return (
    <Toggle aria-label={`Solo ${name}`} data-slot="mixer-strip-solo" className={cn(keyClass, className)} {...props}>
      S
    </Toggle>
  )
}

/** The channel's motorized fader, named “<name> level”. */
function MixerStripFader({ className, ...props }: MotorizedFaderProps) {
  const { name } = useMixerStrip()
  return (
    <MotorizedFader
      aria-label={`${name} level`}
      className={cn("transition-opacity duration-(--bevel-duration-small) in-data-muted:opacity-60 motion-reduce:transition-none", className)}
      {...props}
    />
  )
}

export { Mixer, MixerStrip, MixerStripName, MixerStripMute, MixerStripSolo, MixerStripFader }
export type { MixerStripProps }
