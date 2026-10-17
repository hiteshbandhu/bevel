"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

type PanelProps = Omit<React.ComponentProps<"section">, "title"> & {
  title: string
  description?: React.ReactNode
  /** Classes for the tray the physical object sits in. */
  trayClassName?: string
  /** Text under the tray: what the object means for the run right now. */
  footer?: React.ReactNode
}

/** One dashboard panel: a heading, a line of context, and a tray holding the object. */
export function Panel({ title, description, trayClassName, footer, className, children, ...props }: PanelProps) {
  const id = React.useId()
  return (
    <section
      aria-labelledby={id}
      className={cn("flex min-w-0 flex-col gap-3 rounded-xl border bg-card p-4 sm:p-5", className)}
      {...props}
    >
      <div className="flex flex-col gap-1">
        <h2 id={id} className="text-base font-semibold tracking-tight">
          {title}
        </h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className={cn("tray flex min-w-0 justify-center rounded-lg p-3 sm:p-4", trayClassName)}>{children}</div>
      {footer && <div className="text-sm text-muted-foreground">{footer}</div>}
    </section>
  )
}
