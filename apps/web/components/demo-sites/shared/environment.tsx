import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

/**
 * Pieces of the physical environments the demos are set in. Each demo
 * mounts Bevel components on a surface; these are the surface's own parts.
 */

/** A legend engraved into the surface: names the control below it. */
export function Legend({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "text-[15px] leading-none font-semibold tracking-wide text-(--legend) [text-shadow:0_-1px_0_rgb(0_0_0/0.45),0_1px_0_rgb(255_255_255/0.08)]",
        className
      )}
      {...props}
    />
  )
}

/** A slotted screw head, for panel corners. */
export function Screw({ className, angle = 30 }: { className?: string; angle?: number }) {
  return (
    <span
      aria-hidden
      className={cn("bevel-metal absolute size-3.5 rounded-full shadow-(--bevel-depth-raised)", className)}
    >
      <span className="absolute inset-x-0.5 top-1/2 h-px -translate-y-1/2 bg-black/50" style={{ rotate: `${angle}deg` }} />
    </span>
  )
}

/** Four screws, one in each corner of a positioned panel. */
const screwCorners = {
  "2": ["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"],
  "3": ["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"],
  "4": ["top-4 left-4", "top-4 right-4", "bottom-4 left-4", "bottom-4 right-4"],
} as const

export function Screws({ inset = "3" }: { inset?: keyof typeof screwCorners }) {
  return (
    <>
      {screwCorners[inset].map((c, i) => (
        <Screw key={c} className={c} angle={[20, 75, 130, 160][i]} />
      ))}
    </>
  )
}

/** A physical key: a raised plastic button that goes down when pressed. */
export function PanelKey({ className, tone = "plain", ...props }: React.ComponentProps<"button"> & { tone?: "plain" | "go" }) {
  return (
    <button
      type="button"
      data-tone={tone}
      className={cn(
        "bevel-raised inline-flex h-11 items-center whitespace-nowrap justify-center rounded-(--bevel-radius-sm) px-5 text-[15px] font-semibold outline-none select-none",
        "[--bevel-material:#5B636B] text-[#EEF1F3] data-[tone=go]:[--bevel-material:#C9A44A] data-[tone=go]:text-[#2A2208]",
        "transition-[translate,box-shadow] duration-(--bevel-duration-press) active:translate-y-0.5 active:bevel-pressed",
        "focus-visible:ring-3 focus-visible:ring-[#E9D28A]/60 disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

/** A backlit status strip: one line of glowing text behind glass. */
export function StatusStrip({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-(--bevel-radius-sm) bg-[#0E1A17] px-4 py-3 shadow-(--bevel-depth-recessed)",
        className
      )}
    >
      <p className="text-[17px] sm:truncate tracking-wide text-[#8FF0CF] [text-shadow:0_0_8px_rgb(143_240_207/0.55)]">{children}</p>
      <span aria-hidden className="bevel-glass absolute inset-0" />
    </div>
  )
}
