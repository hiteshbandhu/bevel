"use client"

import * as React from "react"
import { Radio } from "@base-ui/react/radio"
import { RadioGroup } from "@base-ui/react/radio-group"
import { cn } from "cn"

type Order = { value: string; label: string }

type EngineTelegraphContextValue = {
  orders: Order[]
  register: (order: Order) => () => void
  value: string
  confirmed: string
  statusId: string
}

const EngineTelegraphContext = React.createContext<EngineTelegraphContextValue | null>(null)

function useEngineTelegraph() {
  const context = React.useContext(EngineTelegraphContext)
  if (!context) throw new Error("EngineTelegraph parts must be inside <EngineTelegraph>")
  return context
}

/* Orders spread over the top of the dial, from -70° to 70°. */
const SPREAD = 140

function angleOf(orders: Order[], value: string) {
  const i = orders.findIndex((o) => o.value === value)
  if (i === -1 || orders.length < 2) return 0
  return -SPREAD / 2 + (SPREAD * i) / (orders.length - 1)
}

type EngineTelegraphProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  /** The order you've set. */
  value: string
  onValueChange: (value: string) => void
  /** The order the other side has acknowledged. Differs from value while an order is pending. */
  confirmed: string
}

/**
 * An engine order telegraph. You set an order; the other side (an agent,
 * a service, a teammate) answers by confirming it. Both pointers show on
 * one dial, so a pending order is visible at a glance.
 */
function EngineTelegraph({ className, value, onValueChange, confirmed, children, ...props }: EngineTelegraphProps) {
  const [orders, setOrders] = React.useState<Order[]>([])
  const statusId = React.useId()
  const register = React.useCallback((order: Order) => {
    // Orders keep the order they mounted in, which is their order on the dial.
    setOrders((all) =>
      all.some((o) => o.value === order.value)
        ? all.map((o) => (o.value === order.value ? order : o))
        : [...all, order]
    )
    return () => setOrders((all) => all.filter((o) => o.value !== order.value))
  }, [])
  const context = React.useMemo(
    () => ({ orders, register, value, confirmed, statusId }),
    [orders, register, value, confirmed, statusId]
  )
  return (
    <EngineTelegraphContext value={context}>
      <div
        role="group"
        data-slot="engine-telegraph"
        data-pending={value !== confirmed ? "" : undefined}
        className={cn("flex w-full max-w-sm flex-col items-center gap-4", className)}
        {...props}
      >
        <RadioGroup
          value={value}
          onValueChange={(next) => onValueChange(next as string)}
          aria-describedby={statusId}
          className="contents"
        >
          {children}
        </RadioGroup>
      </div>
    </EngineTelegraphContext>
  )
}

/** The dial: your handle and the answering pointer, over the orders. */
function EngineTelegraphDial({ className, ...props }: React.ComponentProps<"div">) {
  const { orders, value, confirmed } = useEngineTelegraph()
  return (
    <div
      aria-hidden
      data-slot="engine-telegraph-dial"
      className={cn("bevel-metal w-full rounded-t-full p-2 pb-0 shadow-(--bevel-depth-object)", className)}
      {...props}
    >
      <div className="relative overflow-hidden rounded-t-full bg-(--bevel-ivory) text-(--bevel-ivory-foreground) shadow-(--bevel-depth-recessed)">
        <svg viewBox="0 0 100 60" className="block w-full">
          {orders.map((order) => {
            const angle = angleOf(orders, order.value)
            return (
              <g key={order.value} transform={`rotate(${angle} 50 56)`}>
                <line x1="50" y1="6" x2="50" y2="12" stroke="currentColor" strokeWidth="0.8" />
                <text x="50" y="19" textAnchor="middle" fontSize="4.6" fontWeight="700" fill="currentColor">
                  {order.label.toUpperCase()}
                </text>
              </g>
            )
          })}
          {/* The answer pointer: short and red, moved by the other side. */}
          <g
            className="origin-(--engine-telegraph-pivot) transition-[rotate] duration-(--bevel-duration-ambient) ease-(--bevel-ease-spring) motion-reduce:transition-none"
            style={{ rotate: `${angleOf(orders, confirmed)}deg` }}
          >
            <path d="M48.6 56 L50 26 L51.4 56 Z" fill="var(--engine-telegraph-answer)" />
          </g>
          {/* Your handle: long and dark, moved by you. */}
          <g
            className="origin-(--engine-telegraph-pivot) transition-[rotate] duration-(--bevel-duration-move) ease-(--bevel-ease-out) motion-reduce:transition-none"
            style={{ rotate: `${angleOf(orders, value)}deg` }}
          >
            <path d="M49.2 56 L50 22 L50.8 56 Z" fill="currentColor" />
            <rect x="47.5" y="21" width="5" height="3" rx="1" fill="currentColor" />
          </g>
          <circle cx="50" cy="56" r="4" fill="var(--bevel-brass)" stroke="var(--bevel-brass-edge)" strokeWidth="0.6" />
        </svg>
        <span className="bevel-glass absolute inset-0" />
      </div>
    </div>
  )
}

/** The orders you can give: a row of plates. */
function EngineTelegraphOrders({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="engine-telegraph-orders" className={cn("flex flex-wrap justify-center gap-2", className)} {...props} />
}

type EngineTelegraphOrderProps = Omit<Radio.Root.Props, "value" | "children"> & {
  value: string
  /** Shown on the plate and the dial. Keep it to a word. */
  children: string
}

/** One order. A radio: arrow keys move between orders. */
function EngineTelegraphOrder({ className, value, children, ...props }: EngineTelegraphOrderProps) {
  const { register, confirmed } = useEngineTelegraph()
  React.useEffect(() => register({ value, label: children }), [value, children, register])
  return (
    <Radio.Root
      value={value}
      data-slot="engine-telegraph-order"
      data-confirmed={confirmed === value ? "" : undefined}
      className={cn(
        "bevel-raised flex h-9 min-w-14 items-center justify-center rounded-(--bevel-radius-sm) px-3 text-xs font-bold tracking-(--bevel-tracking-label) text-(--bevel-ivory-foreground) uppercase outline-none select-none",
        "transition-[translate,box-shadow] duration-(--bevel-duration-press) ease-(--bevel-ease-out) motion-reduce:transition-none",
        "data-checked:translate-y-0.5 data-checked:bevel-pressed",
        "focus-visible:ring-3 focus-visible:ring-ring/60 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </Radio.Root>
  )
}

/** Whether the other side has answered, in words. Announced when that changes. */
function EngineTelegraphStatus({ className, ...props }: React.ComponentProps<"p">) {
  const { orders, value, confirmed, statusId } = useEngineTelegraph()
  const label = (v: string) => orders.find((o) => o.value === v)?.label ?? v
  return (
    <p
      id={statusId}
      role="status"
      data-slot="engine-telegraph-status"
      className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}
      {...props}
    >
      <span aria-hidden className="bevel-led size-2 rounded-full" />
      {value === confirmed
        ? `Confirmed: ${label(confirmed)}.`
        : `Ordered: ${label(value)}. Waiting for confirmation (now at ${label(confirmed)}).`}
    </p>
  )
}

export { EngineTelegraph, EngineTelegraphDial, EngineTelegraphOrders, EngineTelegraphOrder, EngineTelegraphStatus }
export type { EngineTelegraphProps, EngineTelegraphOrderProps }
