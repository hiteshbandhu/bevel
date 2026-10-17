"use client"

import * as React from "react"
import { cn } from "cn"

type VisibleFileContextValue = { scale: string[] }

const VisibleFileContext = React.createContext<VisibleFileContextValue | null>(null)

function useVisibleFile() {
  const context = React.useContext(VisibleFileContext)
  if (!context) throw new Error("VisibleFile parts must be inside <VisibleFile>")
  return context
}

type VisibleFileProps = React.ComponentProps<"div"> & {
  /** The positions a signal can sit at, printed across the top: months, stages, grades. */
  scale: string[]
}

/**
 * A visible-index file. Each record shows only its edge, and coloured
 * signals slide along it to mark where it stands, so a whole tray reads
 * at a glance. Give it an aria-label.
 */
function VisibleFile({ className, scale, children, ...props }: VisibleFileProps) {
  return (
    <VisibleFileContext value={{ scale }}>
      <div
        role="group"
        data-slot="visible-file"
        className={cn(
          "bevel-metal bevel-object grid w-full grid-cols-[minmax(5rem,10rem)_minmax(0,1fr)] rounded-(--bevel-radius-md) p-3 pt-2",
          className
        )}
        {...props}
      >
        <span aria-hidden />
        <span aria-hidden className="flex min-w-0 pb-1.5 text-(--bevel-ivory)">
          {scale.map((s) => (
            <span key={s} className="min-w-0 flex-1 truncate text-center text-(length:--bevel-fine) font-bold tracking-(--bevel-tracking-label) uppercase">
              {s}
            </span>
          ))}
        </span>
        <ul className="col-span-2 grid grid-cols-subgrid">{children}</ul>
      </div>
    </VisibleFileContext>
  )
}

type VisibleFileRowProps = React.ComponentProps<"li"> & {
  /** The record's name, typed on the card edge. */
  title: string
  /** A second line, like an amount or an owner. */
  detail?: string
}

/** One record's card edge, in its clear pocket. */
function VisibleFileRow({ className, title, detail, children, ...props }: VisibleFileRowProps) {
  return (
    <li
      data-slot="visible-file-row"
      className={cn(
        // Shingled: each card edge overlaps the one above, casting a little shadow up onto it.
        "relative col-span-2 -mt-px grid grid-cols-subgrid bg-(--visible-file-card) text-(--visible-file-card-foreground) shadow-(--bevel-depth-sheet) first:rounded-t-(--bevel-radius-xs) last:rounded-b-(--bevel-radius-xs)",
        className
      )}
      {...props}
    >
      <span className="flex min-w-0 flex-col justify-center border-r border-(--visible-file-rule) px-2 py-1.5">
        <span className="truncate text-sm font-semibold">{title}</span>
        {detail && <span className="truncate text-xs opacity-70">{detail}</span>}
      </span>
      <span className="relative min-h-10 overflow-hidden">{children}</span>
      <span aria-hidden className="bevel-glass pointer-events-none absolute inset-0" />
    </li>
  )
}

type VisibleFileSignalProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** Where it sits: an index into the file's scale. */
  value: number
  /** What it marks, for screen readers: “Renewal”, “Stage”. */
  label: string
  tone?: "red" | "amber" | "green" | "blue"
}

/** A signal clip on the card edge. Slides when its value changes. */
function VisibleFileSignal({ className, value, label, tone = "blue", ...props }: VisibleFileSignalProps) {
  const { scale } = useVisibleFile()
  const at = Math.min(Math.max(Math.round(value), 0), scale.length - 1)
  return (
    <span
      data-slot="visible-file-signal"
      data-tone={tone}
      className={cn(
        "absolute inset-y-0 left-0 flex w-full items-center",
        "transition-[translate] duration-(--bevel-duration-move) ease-(--bevel-ease-spring) motion-reduce:transition-none",
        className
      )}
      // A full-width rail, moved along by whole cells; the clip sits in the first cell.
      style={{ translate: `${(at / scale.length) * 100}% 0` }}
      {...props}
    >
      <span className="flex justify-center" style={{ width: `${100 / scale.length}%` }}>
        <span aria-hidden className="bevel-plastic h-5 w-3 rounded-(--bevel-radius-xs)" />
      </span>
      <span className="sr-only">
        {label}: {scale[at]}.
      </span>
    </span>
  )
}

export { VisibleFile, VisibleFileRow, VisibleFileSignal }
export type { VisibleFileProps, VisibleFileRowProps, VisibleFileSignalProps }
