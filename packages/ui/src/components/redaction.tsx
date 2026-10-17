"use client"

import * as React from "react"
import { cn } from "cn"

type RedactionProps = Omit<React.ComponentProps<"span">, "children"> & {
  /**
   * Show the text. Only pass `children` to viewers allowed to read it: a
   * hidden redaction never renders its text, but anything you send to the
   * browser can still be read there.
   */
  revealed?: boolean
  /** Approximate length of the withheld text, in characters, for the bar's width. */
  length?: number
  /** Why it's withheld, read to screen readers: "privileged". */
  reason?: string
  /** The withheld text. Rendered only when revealed. */
  children?: React.ReactNode
}

/**
 * A black marker bar over withheld text, read as "Redacted". When revealed
 * to someone allowed to read it, the text keeps a faint trace of the marker.
 */
function Redaction({ className, revealed = false, length = 8, reason, children, ...props }: RedactionProps) {
  if (revealed) {
    return (
      <span
        data-slot="redaction"
        data-revealed=""
        className={cn("rounded-(--bevel-radius-xs) bg-(--redaction-revealed) px-0.5 box-decoration-clone", className)}
        {...props}
      >
        <span className="sr-only">Redacted text, shown to you: </span>
        {children}
      </span>
    )
  }
  return (
    <span
      data-slot="redaction"
      className={cn(
        "redaction-bar relative inline-block h-(--redaction-height) translate-y-(--redaction-drop) rounded-(--bevel-radius-xs) align-baseline",
        "forced-colors:bg-[CanvasText]",
        className
      )}
      style={{ width: `${Math.max(1, length)}ch` }}
      {...props}
    >
      <span className="sr-only">{reason ? `Redacted: ${reason}` : "Redacted"}</span>
    </span>
  )
}

export { Redaction }
export type { RedactionProps }
