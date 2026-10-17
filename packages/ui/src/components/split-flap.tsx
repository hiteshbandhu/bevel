"use client"

import * as React from "react"
import { cn } from "cn"

type SplitFlapContextValue = { changed: (row: string) => void }

const SplitFlapContext = React.createContext<SplitFlapContextValue | null>(null)
const SplitFlapRowContext = React.createContext<string>("")

function toMilliseconds(value: string, fallback: number) {
  const n = parseFloat(value)
  if (Number.isNaN(n)) return fallback
  return value.trim().endsWith("ms") ? n : n * 1000
}

/**
 * A split-flap status board. The text is the truth; the flaps only show
 * it. Changes are gathered and announced once, by row, not letter by
 * letter. Give it an aria-label.
 */
function SplitFlap({ className, children, ...props }: React.ComponentProps<"div">) {
  const [message, setMessage] = React.useState("")
  const pending = React.useRef(new Set<string>())
  const timer = React.useRef<number>(undefined)
  const root = React.useRef<HTMLDivElement>(null)

  const changed = React.useCallback((row: string) => {
    pending.current.add(row)
    if (timer.current !== undefined) return
    const wait = root.current
      ? toMilliseconds(getComputedStyle(root.current).getPropertyValue("--split-flap-announce-after"), 1200)
      : 1200
    timer.current = window.setTimeout(() => {
      setMessage(`Updated: ${[...pending.current].join(", ")}.`)
      pending.current.clear()
      timer.current = undefined
    }, wait)
  }, [])
  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <SplitFlapContext value={{ changed }}>
      <div
        ref={root}
        role="group"
        data-slot="split-flap"
        className={cn("bevel-metal bevel-object max-w-full overflow-x-auto rounded-(--bevel-radius-md) p-3", className)}
        {...props}
      >
        <ul className="flex w-max flex-col gap-1.5">{children}</ul>
        <p role="status" className="sr-only">
          {message}
        </p>
      </div>
    </SplitFlapContext>
  )
}

type SplitFlapRowProps = React.ComponentProps<"li"> & {
  /** How this row is announced when it changes: “BA 117”. */
  name: string
}

/** One line of the board. */
function SplitFlapRow({ className, name, ...props }: SplitFlapRowProps) {
  return (
    <SplitFlapRowContext value={name}>
      <li data-slot="split-flap-row" className={cn("flex items-center gap-3", className)} {...props} />
    </SplitFlapRowContext>
  )
}

type SplitFlapTextProps = Omit<React.ComponentProps<"span">, "children"> & {
  value: string
  /** Number of flaps. Shorter text is padded; longer is cut. */
  length: number
  tone?: "white" | "amber"
}

/** A run of flaps showing one value. Each character flips when it changes, left to right. */
function SplitFlapText({ className, value, length, tone = "white", ...props }: SplitFlapTextProps) {
  const context = React.useContext(SplitFlapContext)
  const row = React.useContext(SplitFlapRowContext)
  const text = value.toUpperCase().slice(0, length).padEnd(length, " ")
  const [shown, setShown] = React.useState({ text, previous: text, flips: 0 })
  if (shown.text !== text) setShown({ text, previous: shown.text, flips: shown.flips + 1 })

  const announced = React.useRef(text)
  React.useEffect(() => {
    if (announced.current === text) return
    announced.current = text
    context?.changed(row)
  }, [text, row, context])

  return (
    <span
      data-slot="split-flap-text"
      data-tone={tone}
      className={cn(
        "flex gap-px font-mono font-bold text-(--split-flap-foreground) data-[tone=amber]:text-(--split-flap-amber)",
        className
      )}
      {...props}
    >
      <span className="sr-only">{value}</span>
      {text.split("").map((char, i) => (
        <SplitFlapCell
          key={i}
          char={char}
          previous={shown.previous[i] ?? " "}
          flip={shown.previous[i] !== char ? shown.flips : 0}
          index={i}
        />
      ))}
    </span>
  )
}

function Half({ char, half, className, style }: { char: string; half: "top" | "bottom"; className?: string; style?: React.CSSProperties }) {
  return (
    <span
      className={cn(
        "absolute inset-x-0 h-1/2 overflow-hidden backface-hidden",
        half === "top" ? "top-0 rounded-t-(--bevel-radius-xs) bg-(--split-flap-flap)" : "bottom-0 rounded-b-(--bevel-radius-xs) bg-(--split-flap-flap-lower)",
        className
      )}
      style={style}
    >
      <span
        className={cn(
          "absolute inset-x-0 flex h-(--split-flap-cell-height) items-center justify-center",
          half === "top" ? "top-0" : "bottom-0"
        )}
      >
        {char}
      </span>
    </span>
  )
}

/** One character: static halves, plus a pair of flaps that fall when it changes. */
function SplitFlapCell({ char, previous, flip, index }: { char: string; previous: string; flip: number; index: number }) {
  const delay = { "--split-flap-delay": `calc(var(--bevel-stagger) * ${index})` } as React.CSSProperties
  const flipping = flip > 0
  return (
    <span
      aria-hidden
      data-slot="split-flap-cell"
      className="relative block h-(--split-flap-cell-height) w-(--split-flap-cell-width) shrink-0 perspective-(--bevel-perspective)"
    >
      <Half char={char} half="top" />
      {/* Underneath the falling flap, the old lower half shows until the new one lands. */}
      <Half char={flipping ? previous : char} half="bottom" className="motion-reduce:hidden" />
      <Half char={char} half="bottom" className="hidden motion-reduce:block" />
      {flipping && (
        <React.Fragment key={flip}>
          <Half char={previous} half="top" className="split-flap-top z-10 motion-reduce:hidden" style={delay} />
          <Half char={char} half="bottom" className="split-flap-bottom z-10 motion-reduce:hidden" style={delay} />
          {/* Reduced motion: no flaps, the new character fades in. */}
          <span className="split-flap-fade absolute inset-0 hidden motion-reduce:block">
            <Half char={char} half="top" />
            <Half char={char} half="bottom" />
          </span>
        </React.Fragment>
      )}
      <span className="absolute inset-x-0 top-1/2 z-20 h-px -translate-y-1/2 bg-(--split-flap-hinge)" />
    </span>
  )
}

export { SplitFlap, SplitFlapRow, SplitFlapText }
export type { SplitFlapRowProps, SplitFlapTextProps }
