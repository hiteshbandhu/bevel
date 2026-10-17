"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "cn"

type LeverInfo = { label: string; requires: string[] }

type InterlockContextValue = {
  values: Record<string, boolean>
  setValue: (id: string, value: boolean) => void
  levers: Record<string, LeverInfo>
  register: (id: string, info: LeverInfo) => () => void
}

const InterlockContext = React.createContext<InterlockContextValue | null>(null)

function useInterlock() {
  const context = React.useContext(InterlockContext)
  if (!context) throw new Error("InterlockLever must be inside <Interlock>")
  return context
}

type InterlockProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  values?: Record<string, boolean>
  defaultValues?: Record<string, boolean>
  onValuesChange?: (values: Record<string, boolean>) => void
}

/**
 * A lever frame. Levers that depend on others stay locked until those are
 * pulled; a lever can't go back while anything depending on it is pulled.
 * Give it an aria-label.
 */
function Interlock({
  className,
  values: valuesProp,
  defaultValues = {},
  onValuesChange,
  ...props
}: InterlockProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValues)
  const values = valuesProp ?? uncontrolled
  const [levers, setLevers] = React.useState<Record<string, LeverInfo>>({})

  const register = React.useCallback((id: string, info: LeverInfo) => {
    setLevers((all) => ({ ...all, [id]: info }))
    return () =>
      setLevers((all) => {
        const next = { ...all }
        delete next[id]
        return next
      })
  }, [])

  const context = React.useMemo<InterlockContextValue>(
    () => ({
      values,
      levers,
      register,
      setValue: (id, value) => {
        const next = { ...values, [id]: value }
        if (valuesProp === undefined) setUncontrolled(next)
        onValuesChange?.(next)
      },
    }),
    [values, levers, register, valuesProp, onValuesChange]
  )

  return (
    <InterlockContext value={context}>
      <div
        role="group"
        data-slot="interlock"
        className={cn(
          "bevel-leather bevel-object inline-flex gap-3 rounded-(--bevel-radius-md) p-4 text-(--bevel-ivory)",
          className
        )}
        {...props}
      />
    </InterlockContext>
  )
}

type InterlockLeverProps = {
  id: string
  /** What the lever does. Shown on its brass plate. */
  label: string
  /** Levers that must be pulled before this one can be. */
  requires?: string[]
  /** Handle colour, by railway convention: red signals, black points, blue locks, yellow distant. */
  tone?: "red" | "black" | "blue" | "yellow"
  /** Number on the plate. */
  number?: number
  className?: string
}

/** One lever. Locked levers say what they're waiting for, or what's holding them. */
function InterlockLever({ id, label, requires = [], tone = "black", number, className }: InterlockLeverProps) {
  const { values, setValue, levers, register } = useInterlock()
  const requiresKey = requires.join("|")
  React.useEffect(() => register(id, { label, requires }), [id, label, requiresKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const pulled = values[id] ?? false
  const unmet = requires.filter((r) => !values[r])
  const holding = Object.entries(levers)
    .filter(([other, info]) => values[other] && info.requires.includes(id))
    .map(([other]) => other)
  const nameOf = (other: string) => levers[other]?.label ?? other
  const reason = !pulled && unmet.length
    ? `Locked until: ${unmet.map(nameOf).join(", ")}`
    : pulled && holding.length
      ? `Held by: ${holding.map(nameOf).join(", ")}`
      : undefined
  const locked = reason !== undefined
  const reasonId = React.useId()

  return (
    <div
      data-slot="interlock-lever"
      data-tone={tone}
      data-locked={locked ? "" : undefined}
      data-pulled={pulled ? "" : undefined}
      className={cn("flex w-24 flex-col items-center gap-2 text-center", className)}
    >
      <SwitchPrimitive.Root
        checked={pulled}
        disabled={locked}
        onCheckedChange={(next) => setValue(id, next)}
        aria-label={label}
        aria-describedby={reason ? reasonId : undefined}
        className="bevel-recessed relative flex h-28 w-7 cursor-pointer justify-center rounded-full pt-2 outline-none focus-visible:ring-3 focus-visible:ring-(--bevel-ivory)/50 data-disabled:cursor-not-allowed"
      >
        <SwitchPrimitive.Thumb
          className={cn(
            "block h-14 w-3 rounded-full bg-(--interlock-handle) shadow-(--bevel-depth-raised)",
            "transition-[translate] duration-(--bevel-duration-move) ease-(--bevel-ease-spring) data-checked:translate-y-(--interlock-throw) motion-reduce:transition-none"
          )}
        />
        {locked && (
          <span
            aria-hidden
            className="bevel-metal absolute top-1/2 left-1/2 h-3 w-9 -translate-1/2 rounded-(--bevel-radius-xs) [--bevel-material:var(--bevel-brass)]"
          />
        )}
      </SwitchPrimitive.Root>
      <span className="bevel-metal flex min-h-12 w-full flex-col items-center justify-center rounded-(--bevel-radius-xs) px-1.5 py-1 text-(--interlock-plate-foreground) [--bevel-material:var(--bevel-brass)]">
        {number !== undefined && <span className="text-(length:--bevel-fine) font-black tabular-nums">{number}</span>}
        <span className="text-(length:--bevel-fine) leading-tight font-semibold">{label}</span>
      </span>
      <span
        id={reasonId}
        className="min-h-8 text-(length:--bevel-fine) leading-tight text-(--bevel-ivory)/80"
      >
        {reason ?? (pulled ? "Pulled" : "Free")}
      </span>
    </div>
  )
}

export { Interlock, InterlockLever }
export type { InterlockProps, InterlockLeverProps }
