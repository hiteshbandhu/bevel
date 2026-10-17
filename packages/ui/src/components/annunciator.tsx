"use client"

import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cn } from "cn"

type AnnunciatorContextValue = {
  /** Alarms nobody has acknowledged yet, by id. */
  unacked: Record<string, string>
  raise: (id: string, label: string) => void
  acknowledge: (id?: string) => void
  message: string
  announce: (message: string) => void
}

const AnnunciatorContext = React.createContext<AnnunciatorContextValue | null>(null)

function useAnnunciator() {
  const context = React.useContext(AnnunciatorContext)
  if (!context) throw new Error("Annunciator parts must be inside <Annunciator>")
  return context
}

/**
 * A panel of alarm lamps. Each new alarm flashes until acknowledged, then
 * stays lit while its condition lasts. Give it an aria-label.
 */
function Annunciator({ className, children, ...props }: React.ComponentProps<"div">) {
  const [unacked, setUnacked] = React.useState<Record<string, string>>({})
  const [message, announce] = React.useState("")
  const raise = React.useCallback((id: string, label: string) => {
    setUnacked((all) => ({ ...all, [id]: label }))
  }, [])
  const acknowledge = React.useCallback((id?: string) => {
    setUnacked((all) => {
      if (id === undefined) return {}
      const next = { ...all }
      delete next[id]
      return next
    })
  }, [])
  const context = React.useMemo(
    () => ({ unacked, raise, acknowledge, message, announce }),
    [unacked, raise, acknowledge, message]
  )
  return (
    <AnnunciatorContext value={context}>
      <div
        role="group"
        data-slot="annunciator"
        data-alarm={Object.keys(unacked).length ? "" : undefined}
        className={cn(
          "bevel-metal bevel-object flex w-full max-w-md flex-col gap-3 rounded-(--bevel-radius-md) p-3",
          className
        )}
        {...props}
      >
        {children}
        <p role="status" className="sr-only">
          {message}
        </p>
      </div>
    </AnnunciatorContext>
  )
}

/** The grid of lamp windows. */
function AnnunciatorPanel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="annunciator-panel"
      className={cn(
        "grid grid-cols-2 gap-1.5 rounded-(--bevel-radius-sm) bg-(--bevel-material-edge) p-1.5 shadow-(--bevel-depth-recessed) sm:grid-cols-3",
        className
      )}
      {...props}
    />
  )
}

type AnnunciatorTileProps = Omit<React.ComponentProps<"button">, "children"> & {
  id: string
  /** Whether the condition is happening now. */
  active: boolean
  /** Lamp colour. Red for warnings, amber for cautions. */
  tone?: "red" | "amber" | "green" | "white"
  /** The engraved legend. Keep it short. */
  children: string
}

/** One lamp window. Press it to acknowledge its alarm. */
function AnnunciatorTile({ className, id, active, tone = "amber", children, onClick, ...props }: AnnunciatorTileProps) {
  const { unacked, raise, acknowledge, announce } = useAnnunciator()
  const previous = React.useRef(false)
  React.useEffect(() => {
    if (active && !previous.current) {
      raise(id, children)
      announce(`Alarm: ${children}.`)
    } else if (!active && previous.current) {
      announce(`Cleared: ${children}.`)
    }
    previous.current = active
  }, [active, id, children, raise, announce])

  const isNew = id in unacked
  const state = isNew ? "new" : active ? "acknowledged" : "normal"
  return (
    <button
      type="button"
      data-slot="annunciator-tile"
      data-tone={tone}
      data-state={state}
      aria-label={`${children}: ${state === "new" ? (active ? "new alarm" : "cleared, not yet seen") : state === "acknowledged" ? "active, acknowledged" : "normal"}`}
      onClick={(event) => {
        onClick?.(event)
        if (isNew) acknowledge(id)
      }}
      className={cn(
        "relative flex min-h-14 items-center justify-center overflow-hidden rounded-(--bevel-radius-xs) bg-(--annunciator-off) px-2 py-2 text-center text-xs leading-tight font-bold tracking-(--bevel-tracking-label) text-(--annunciator-off-foreground) uppercase outline-none",
        "focus-visible:ring-3 focus-visible:ring-(--annunciator-white)/60",
        className
      )}
      {...props}
    >
      {/* The lamp behind the legend: lit while active or unseen, flashing while unseen. */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 bg-(--annunciator-lamp) opacity-0 shadow-(--bevel-depth-recessed) transition-opacity duration-(--bevel-duration-small) motion-reduce:transition-none",
          "in-data-[state=acknowledged]:opacity-100 in-data-[state=new]:opacity-100 in-data-[state=new]:annunciator-flash motion-reduce:in-data-[state=new]:animate-none"
        )}
      />
      <span className="relative in-data-[state=acknowledged]:text-(--annunciator-lit-foreground) in-data-[state=new]:text-(--annunciator-lit-foreground)">
        {children}
      </span>
      {/* Without flashing, a corner mark says it's new. */}
      <span
        aria-hidden
        className="absolute top-1 right-1 hidden size-1.5 rounded-full bg-(--annunciator-lit-foreground) motion-reduce:in-data-[state=new]:block"
      />
      <span aria-hidden className="bevel-glass absolute inset-0" />
    </button>
  )
}

/** Acknowledges every unseen alarm at once. */
function AnnunciatorAcknowledge({ className, children, ...props }: ButtonPrimitive.Props) {
  const { unacked, acknowledge } = useAnnunciator()
  const count = Object.keys(unacked).length
  return (
    <ButtonPrimitive
      data-slot="annunciator-acknowledge"
      disabled={count === 0}
      focusableWhenDisabled
      onClick={() => acknowledge()}
      className={cn(
        "bevel-raised h-10 self-end rounded-(--bevel-radius-sm) px-4 text-sm font-semibold text-(--annunciator-white) outline-none [--bevel-material:var(--annunciator-off)]",
        "transition-[translate,box-shadow] duration-(--bevel-duration-press) ease-(--bevel-ease-out) active:translate-y-0.5 active:bevel-pressed motion-reduce:transition-none",
        "focus-visible:ring-3 focus-visible:ring-(--annunciator-white)/60 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children ?? (count ? `Acknowledge ${count}` : "Nothing to acknowledge")}
    </ButtonPrimitive>
  )
}

export { Annunciator, AnnunciatorPanel, AnnunciatorTile, AnnunciatorAcknowledge }
export type { AnnunciatorTileProps }
