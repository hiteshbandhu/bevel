"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "cn"

type GuardedSwitchContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  disabled: boolean
  checked: boolean
  setChecked: (checked: boolean) => void
  touch: () => void
  ids: { control: string; label: string }
}

const GuardedSwitchContext = React.createContext<GuardedSwitchContextValue | null>(null)

function useGuardedSwitch() {
  const context = React.useContext(GuardedSwitchContext)
  if (!context) throw new Error("GuardedSwitch parts must be inside <GuardedSwitch>")
  return context
}

/** Browsers may report a custom-property duration as "8000ms" or "8s". */
function toMilliseconds(value: string, fallback: number) {
  const n = parseFloat(value)
  if (Number.isNaN(n)) return fallback
  return /ms\s*$/.test(value) ? n : /s\s*$/.test(value) ? n * 1000 : n
}

type GuardedSwitchProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  /** Closing the cover turns the switch off. Leave on for anything dangerous to leave running. */
  safeOnClose?: boolean
  /** Close the cover after --guarded-switch-close-after of no interaction. */
  autoClose?: boolean
  /** Locks the cover shut. Say why with aria-describedby on the root. */
  disabled?: boolean
}

/**
 * A critical switch under a flip-up cover. Lift the cover, then flip the
 * switch: two deliberate steps. Closing the cover returns it to safe.
 */
function GuardedSwitch({
  className,
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  safeOnClose = true,
  autoClose = true,
  disabled = false,
  children,
  ...props
}: GuardedSwitchProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultChecked)
  const checked = checkedProp ?? uncontrolled
  const [open, setOpenState] = React.useState(false)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const timer = React.useRef<number | undefined>(undefined)
  const control = React.useId()
  const label = React.useId()

  const setChecked = React.useCallback(
    (next: boolean) => {
      if (checkedProp === undefined) setUncontrolled(next)
      onCheckedChange?.(next)
    },
    [checkedProp, onCheckedChange]
  )

  const setOpen = React.useCallback(
    (next: boolean) => {
      setOpenState(next)
      if (!next && safeOnClose && checked) setChecked(false)
    },
    [safeOnClose, checked, setChecked]
  )

  const touch = React.useCallback(() => {
    window.clearTimeout(timer.current)
    if (!autoClose || !rootRef.current) return
    const ms = toMilliseconds(
      getComputedStyle(rootRef.current).getPropertyValue("--guarded-switch-close-after"),
      8000
    )
    timer.current = window.setTimeout(() => setOpen(false), ms)
  }, [autoClose, setOpen])

  React.useEffect(() => {
    if (open) touch()
    else window.clearTimeout(timer.current)
    return () => window.clearTimeout(timer.current)
  }, [open, touch])

  const context = React.useMemo(
    () => ({ open, setOpen, disabled, checked, setChecked, touch, ids: { control, label } }),
    [open, setOpen, disabled, checked, setChecked, touch, control, label]
  )

  return (
    <GuardedSwitchContext value={context}>
      <div
        ref={rootRef}
        role="group"
        aria-labelledby={label}
        data-slot="guarded-switch"
        data-open={open ? "" : undefined}
        data-checked={checked ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        className={cn(
          "bevel-metal bevel-object inline-flex w-44 flex-col items-center gap-3 rounded-(--bevel-radius-md) p-4 text-(--guarded-switch-lever)",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </GuardedSwitchContext>
  )
}

function GuardedSwitchLabel({ className, ...props }: React.ComponentProps<"span">) {
  const { ids } = useGuardedSwitch()
  return (
    <span
      id={ids.label}
      data-slot="guarded-switch-label"
      className={cn(
        "bevel-deboss text-center text-(length:--bevel-label) font-semibold tracking-(--bevel-tracking-label) uppercase",
        className
      )}
      {...props}
    />
  )
}

/** The cover and the switch beneath it. */
function GuardedSwitchControl({ className }: { className?: string }) {
  const { open, setOpen, disabled, checked, setChecked, touch, ids } = useGuardedSwitch()
  return (
    <div
      data-slot="guarded-switch-housing"
      className={cn("relative mt-5 grid h-28 w-20 place-items-center perspective-(--bevel-perspective)", className)}
    >
      {/* Cover first: it is the first step, in focus order too. */}
      <button
        type="button"
        data-slot="guarded-switch-cover"
        aria-expanded={open}
        aria-controls={ids.control}
        disabled={disabled && !open}
        onClick={() => setOpen(!open)}
        className={cn(
          "guarded-switch-cover absolute inset-x-0 top-0 z-10 h-24 origin-top cursor-pointer rounded-(--bevel-radius-sm) outline-none",
          "transition-[rotate] duration-(--bevel-duration-move) ease-(--bevel-ease-out) motion-reduce:transition-none",
          "focus-visible:ring-3 focus-visible:ring-(--guarded-switch-on)/60 disabled:cursor-not-allowed",
          open ? "[rotate:x_var(--guarded-switch-open-angle)]" : "[rotate:x_0deg]"
        )}
      >
        <span className="sr-only">{open ? "Close the cover" : "Lift the cover"}</span>
      </button>
      <SwitchPrimitive.Root
        id={ids.control}
        data-slot="guarded-switch-switch"
        checked={checked}
        disabled={!open || disabled}
        aria-labelledby={ids.label}
        onCheckedChange={(next) => {
          setChecked(next)
          touch()
        }}
        className="bevel-recessed relative flex h-20 w-10 items-center justify-center rounded-(--bevel-radius-sm) outline-none focus-visible:ring-3 focus-visible:ring-(--guarded-switch-on)/60 data-disabled:cursor-not-allowed"
      >
        <SwitchPrimitive.Thumb
          data-slot="guarded-switch-lever"
          className="bevel-raised block h-8 w-5 translate-y-(--guarded-switch-throw) rounded-full transition-[translate] duration-(--bevel-duration-small) ease-(--bevel-ease-spring) data-checked:-translate-y-(--guarded-switch-throw) motion-reduce:transition-none"
        />
      </SwitchPrimitive.Root>
    </div>
  )
}

/** Lamp and words: Off, Armed (cover up), On. */
function GuardedSwitchStatus({ className, ...props }: React.ComponentProps<"span">) {
  const { open, checked, disabled } = useGuardedSwitch()
  return (
    <span
      role="status"
      data-slot="guarded-switch-status"
      className={cn(
        "bevel-deboss flex items-center gap-1.5 text-(length:--bevel-fine) font-semibold tracking-(--bevel-tracking-print) uppercase",
        className
      )}
      {...props}
    >
      <span aria-hidden className="bevel-led size-1.5 rounded-full" />
      {checked ? "On" : disabled ? "Locked" : open ? "Cover open" : "Off, guarded"}
    </span>
  )
}

export { GuardedSwitch, GuardedSwitchLabel, GuardedSwitchControl, GuardedSwitchStatus }
export type { GuardedSwitchProps }
