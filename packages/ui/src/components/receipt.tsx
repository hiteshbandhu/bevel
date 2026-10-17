"use client"

import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cn } from "cn"

type ReceiptProps = useRender.ComponentProps<"div"> & {
  /** "carbon" adds the yellow copy behind, offset like a carbon book. */
  variant?: "thermal" | "carbon"
}

const ReceiptContext = React.createContext<{ mountedRef: React.RefObject<boolean> }>({
  mountedRef: { current: false },
})

/** A strip of thermal paper. Lines added after it renders print in. */
function Receipt({ className, render, variant = "thermal", children, ...props }: ReceiptProps) {
  const mountedRef = React.useRef(false)
  React.useEffect(() => {
    mountedRef.current = true
  }, [])
  const context = React.useMemo(() => ({ mountedRef }), [])

  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        "data-slot": "receipt",
        "data-variant": variant,
        className: cn("receipt-shadow relative isolate w-full max-w-xs", className),
        children: (
          <>
            {variant === "carbon" && (
              <div
                aria-hidden
                data-slot="receipt-carbon"
                className="receipt-edges absolute inset-0 -z-10 translate-x-(--receipt-carbon-offset) translate-y-(--receipt-carbon-offset) rotate-1 bg-(--receipt-carbon)"
              />
            )}
            <div
              data-slot="receipt-paper"
              className="bevel-paper receipt-edges flex flex-col gap-3 px-5 py-7 font-mono text-sm shadow-none"
            >
              {children}
            </div>
          </>
        ),
      } as React.ComponentProps<"div">,
      props
    ),
  })
  return <ReceiptContext value={context}>{element}</ReceiptContext>
}

function ReceiptHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="receipt-header"
      className={cn("flex flex-col items-center gap-0.5 text-center", className)}
      {...props}
    />
  )
}

function ReceiptTitle({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="receipt-title"
      className={cn("font-bold tracking-(--bevel-tracking-label) uppercase", className)}
      {...props}
    />
  )
}

function ReceiptMeta({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="receipt-meta"
      className={cn("text-(length:--bevel-fine) text-(--bevel-paper-muted)", className)}
      {...props}
    />
  )
}

function ReceiptItems({ className, ...props }: React.ComponentProps<"dl">) {
  return <dl data-slot="receipt-items" className={cn("flex flex-col gap-1", className)} {...props} />
}

/** One line. Lines added after the receipt renders print in from above. */
function ReceiptItem({ className, ...props }: React.ComponentProps<"div">) {
  const { mountedRef } = React.useContext(ReceiptContext)
  const [prints] = React.useState(() => mountedRef.current)
  return (
    <div
      data-slot="receipt-item"
      data-enter={prints ? "" : undefined}
      className={cn(
        "flex items-baseline gap-2",
        "transition-[translate,opacity] duration-(--bevel-duration-move) ease-(--bevel-ease-out) motion-reduce:transition-none",
        "data-enter:starting:-translate-y-(--receipt-print-in) data-enter:starting:opacity-0",
        className
      )}
      {...props}
    />
  )
}

/** The item's name, followed by a dotted leader to the value. */
function ReceiptLabel({ className, ...props }: React.ComponentProps<"dt">) {
  return (
    <dt
      data-slot="receipt-label"
      className={cn(
        "flex min-w-0 flex-1 items-baseline gap-2 after:min-w-4 after:flex-1 after:border-b after:border-dotted after:border-current/40 after:content-['']",
        className
      )}
      {...props}
    />
  )
}

function ReceiptValue({ className, ...props }: React.ComponentProps<"dd">) {
  return <dd data-slot="receipt-value" className={cn("whitespace-nowrap", className)} {...props} />
}

function ReceiptSeparator({ className, ...props }: React.ComponentProps<"hr">) {
  return (
    <hr
      data-slot="receipt-separator"
      className={cn("border-0 border-t border-dashed border-current/40", className)}
      {...props}
    />
  )
}

/** The total line: same parts as an item, printed bold. A list of its own. */
function ReceiptTotal({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <dl data-slot="receipt-total">
      <ReceiptItem
        className={cn("text-base font-bold [&_[data-slot=receipt-label]]:after:border-transparent", className)}
        {...props}
      />
    </dl>
  )
}

function ReceiptFooter({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="receipt-footer"
      className={cn("text-center text-(length:--bevel-fine) text-(--bevel-paper-muted)", className)}
      {...props}
    />
  )
}

/** Holds a Stamp or Seal over the receipt, where an attendant would press it. */
function ReceiptMark({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="receipt-mark"
      className={cn("pointer-events-none absolute right-6 bottom-12 z-10", className)}
      {...props}
    />
  )
}

export {
  Receipt,
  ReceiptHeader,
  ReceiptTitle,
  ReceiptMeta,
  ReceiptItems,
  ReceiptItem,
  ReceiptLabel,
  ReceiptValue,
  ReceiptSeparator,
  ReceiptTotal,
  ReceiptFooter,
  ReceiptMark,
}
export type { ReceiptProps }
