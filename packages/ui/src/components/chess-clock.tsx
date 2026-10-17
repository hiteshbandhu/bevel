"use client"

import * as React from "react"
import { cn } from "cn"

type Side = 0 | 1

type ChessClockContextValue = {
  names: [string, string]
  total: number
  remaining: [number, number]
  active: Side | null
  flagged: Side | null
  press: (side: Side) => void
}

const ChessClockContext = React.createContext<ChessClockContextValue | null>(null)

function useChessClock() {
  const context = React.useContext(ChessClockContext)
  if (!context) throw new Error("ChessClock parts must be inside <ChessClock>")
  return context
}

type ChessClockProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  /** The two players. */
  names: [string, string]
  /** Each side's time budget, in milliseconds. */
  time: number
  /** Whose clock runs first; null until someone starts. */
  defaultActive?: Side | null
  /** Called when a side ends their turn: the other side is now active. */
  onTurn?: (active: Side) => void
  /** Called when a side's time runs out. */
  onFlag?: (side: Side) => void
}

/**
 * Two clocks on one rocker: ending your turn stops your clock and starts
 * the other, so exactly one runs. For turn-taking with time budgets.
 */
function ChessClock({
  className,
  names,
  time,
  defaultActive = null,
  onTurn,
  onFlag,
  children,
  ...props
}: ChessClockProps) {
  const [remaining, setRemaining] = React.useState<[number, number]>([time, time])
  const [active, setActive] = React.useState<Side | null>(defaultActive)
  const [flagged, setFlagged] = React.useState<Side | null>(null)
  const last = React.useRef(Date.now())

  React.useEffect(() => {
    if (active === null || flagged !== null) return
    last.current = Date.now()
    const timer = window.setInterval(() => {
      const now = Date.now()
      const spent = now - last.current
      last.current = now
      setRemaining((r) => {
        const next: [number, number] = [...r]
        next[active] = Math.max(0, r[active] - spent)
        return next
      })
    }, 200)
    return () => window.clearInterval(timer)
  }, [active, flagged])

  React.useEffect(() => {
    if (active !== null && flagged === null && remaining[active] === 0) {
      setFlagged(active)
      onFlag?.(active)
    }
  }, [remaining, active, flagged, onFlag])

  const context = React.useMemo<ChessClockContextValue>(
    () => ({
      names,
      total: time,
      remaining,
      active,
      flagged,
      press: (side) => {
        if (flagged !== null || (active !== null && active !== side)) return
        // Before play, a side's button starts its own clock; after, it ends its turn.
        const next: Side = active === null ? side : side === 0 ? 1 : 0
        setActive(next)
        onTurn?.(next)
      },
    }),
    [names, time, remaining, active, flagged, onTurn]
  )

  return (
    <ChessClockContext value={context}>
      <div
        role="group"
        data-slot="chess-clock"
        className={cn(
          "bevel-leather bevel-object flex w-full max-w-md flex-col gap-4 rounded-(--bevel-radius-lg) p-5 text-(--bevel-ivory)",
          className
        )}
        {...props}
      >
        {children}
        <ChessClockAnnouncer />
      </div>
    </ChessClockContext>
  )
}

/** Announces turns and fallen flags; not every second. */
function ChessClockAnnouncer() {
  const { names, active, flagged } = useChessClock()
  return (
    <p role="status" className="sr-only">
      {flagged !== null
        ? `Flag fell: ${names[flagged]} is out of time.`
        : active !== null
          ? `Turn: ${names[active]}.`
          : ""}
    </p>
  )
}

function format(ms: number) {
  const s = Math.ceil(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
}

/** The two faces side by side. */
function ChessClockFaces({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("grid grid-cols-2 gap-4", className)} {...props} />
}

/** One side's dial: the hand climbs to twelve as time runs out, where the flag falls. */
function ChessClockFace({ side, className }: { side: Side; className?: string }) {
  const { names, total, remaining, active, flagged } = useChessClock()
  const left = remaining[side]
  const angle = 360 * (1 - left / total)
  const fell = flagged === side
  return (
    <div
      data-slot="chess-clock-face"
      data-active={active === side ? "" : undefined}
      data-flagged={fell ? "" : undefined}
      className={cn("flex flex-col items-center gap-2", className)}
    >
      <div className="bevel-metal relative aspect-square w-full max-w-36 rounded-full p-1.5 [--bevel-material:var(--bevel-brass)] [--bevel-material-edge:var(--bevel-brass-edge)]">
        <div className="relative size-full rounded-full bg-(--bevel-ivory) shadow-(--bevel-depth-recessed)">
          <svg viewBox="0 0 100 100" aria-hidden className="absolute inset-0 size-full text-(--bevel-ivory-foreground)">
            {Array.from({ length: 12 }, (_, i) => (
              <line key={i} x1="50" y1="8" x2="50" y2={i % 3 === 0 ? 16 : 13} stroke="currentColor" strokeWidth={i % 3 === 0 ? 2 : 1} transform={`rotate(${i * 30} 50 50)`} />
            ))}
            {/* The flag sits on the hand's path just before twelve; it falls when the hand reaches it. */}
            <g
              className="origin-(--chess-clock-flag-pivot) transition-[rotate] duration-(--bevel-duration-move) ease-(--bevel-ease-spring) motion-reduce:transition-none"
              style={{ rotate: fell ? "75deg" : "0deg" }}
            >
              <path d="M58 6 L72 10 L58 14 Z" fill="var(--chess-clock-flag)" />
            </g>
          </svg>
          <span
            aria-hidden
            className="absolute inset-0 transition-[rotate] duration-(--chess-clock-tick) ease-linear motion-reduce:transition-none"
            style={{ rotate: `${angle}deg` }}
          >
            <svg viewBox="0 0 100 100" className="size-full">
              <path d="M49 50 L50 14 L51 50 Z" fill="currentColor" className="text-(--bevel-ivory-foreground)" />
            </svg>
          </span>
          <span aria-hidden className="bevel-metal absolute top-1/2 left-1/2 size-3 -translate-1/2 rounded-full" />
        </div>
      </div>
      <p className="flex items-center gap-1.5 text-sm font-semibold">
        <span
          aria-hidden
          className={cn("size-2 rounded-full", active === side && !fell ? "bg-(--chess-clock-active)" : "bg-(--bevel-shade-strong)")}
        />
        {names[side]}
      </p>
      <p role="timer" aria-label={`Time left: ${names[side]}`} className="font-mono text-lg tabular-nums">
        {fell ? "Flag fell" : format(left)}
      </p>
    </div>
  )
}

/** The rocker: each side's button ends that side's turn (before play, starts it). */
function ChessClockRocker({ className, ...props }: React.ComponentProps<"div">) {
  const { names, active, flagged, press } = useChessClock()
  return (
    <div className={cn("grid grid-cols-2 gap-4", className)} {...props}>
      {([0, 1] as Side[]).map((side) => {
        const waiting = active !== null && active !== side
        return (
          <button
            key={side}
            type="button"
            data-slot="chess-clock-button"
            data-down={waiting ? "" : undefined}
            disabled={flagged !== null || waiting}
            onClick={() => press(side)}
            className={cn(
              "bevel-raised h-10 rounded-(--bevel-radius-sm) text-sm font-semibold text-(--bevel-ivory-foreground) outline-none",
              "transition-[translate,box-shadow] duration-(--bevel-duration-press) ease-(--bevel-ease-out) motion-reduce:transition-none",
              "data-down:translate-y-(--chess-clock-rocker-travel) data-down:bevel-pressed",
              "focus-visible:ring-3 focus-visible:ring-(--bevel-ivory)/50 disabled:cursor-not-allowed",
              className
            )}
          >
            {active === null ? `${names[side]} first` : `End turn: ${names[side]}`}
          </button>
        )
      })}
    </div>
  )
}

export { ChessClock, ChessClockFaces, ChessClockFace, ChessClockRocker }
export type { ChessClockProps }
