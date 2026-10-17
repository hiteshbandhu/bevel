"use client"

import * as React from "react"
import { cn } from "cn"

type StampProps = React.ComponentProps<"span"> & {
  tone?: "red" | "blue" | "green" | "black"
  shape?: "rect" | "round"
  /** Land with a press when it appears. Use for the moment something happens, not for lists. */
  animate?: boolean
}

/** A rubber-stamp impression: inked text that soaks into the surface. */
function Stamp({ className, tone = "red", shape = "rect", animate, ...props }: StampProps) {
  return (
    <span
      data-slot="stamp"
      data-tone={tone}
      data-shape={shape}
      data-animate={animate ? "" : undefined}
      className={cn(
        "bevel-ink inline-flex flex-col items-center justify-center gap-0.5 border-(length:--stamp-border) border-double px-2 py-1 text-center text-(length:--bevel-label) leading-none font-black tracking-(--bevel-tracking-label) uppercase select-none",
        "rotate-(--stamp-tilt) data-[shape=rect]:rounded-(--bevel-radius-xs) data-[shape=round]:aspect-square data-[shape=round]:rounded-full data-[shape=round]:p-3",
        "data-animate:transition-[scale,opacity] data-animate:duration-(--bevel-duration-move) data-animate:ease-(--bevel-ease-spring)",
        "data-animate:starting:scale-(--stamp-land-scale) data-animate:starting:opacity-0 motion-reduce:transition-none",
        "forced-colors:mix-blend-normal forced-colors:mask-none",
        className
      )}
      {...props}
    />
  )
}

/** A second, smaller line on a stamp: a date or reference. */
function StampDetail({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="stamp-detail"
      className={cn("text-(length:--bevel-fine) font-bold tracking-(--bevel-tracking-print)", className)}
      {...props}
    />
  )
}

type SealProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** Text set around the rim. */
  text: string
  /** A short mark in the centre. */
  children?: React.ReactNode
  /** Press it into the paper when it appears. */
  animate?: boolean
}

/** An embossed seal pressed into paper: colourless relief, readable by its shadow. */
function Seal({ className, text, children, animate, ...props }: SealProps) {
  const id = React.useId()
  return (
    <span
      data-slot="seal"
      role="img"
      aria-label={typeof children === "string" ? `${text}, ${children}` : text}
      data-animate={animate ? "" : undefined}
      className={cn(
        "seal-relief relative inline-flex aspect-square w-28 items-center justify-center select-none",
        "data-animate:transition-[scale,opacity] data-animate:duration-(--bevel-duration-move) data-animate:ease-(--bevel-ease-spring)",
        "data-animate:starting:scale-(--stamp-land-scale) data-animate:starting:opacity-0 motion-reduce:transition-none",
        className
      )}
      {...props}
    >
      <svg viewBox="0 0 100 100" aria-hidden className="absolute inset-0 size-full">
        <defs>
          <path id={id} d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0" />
        </defs>
        <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="27" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <text fill="currentColor" fontSize="9" fontWeight="700" letterSpacing="2">
          <textPath href={`#${id}`}>{text.toUpperCase()}</textPath>
        </text>
      </svg>
      <span
        aria-hidden
        className="relative text-(length:--bevel-label) font-black tracking-(--bevel-tracking-label) uppercase"
      >
        {children}
      </span>
    </span>
  )
}

export { Stamp, StampDetail, Seal }
export type { StampProps, SealProps }
