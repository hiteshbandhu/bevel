"use client"

import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cn } from "cn"

type LockInfo = { owner: string }

type LockoutContextValue = {
  locks: Record<string, LockInfo>
  register: (id: string, info: LockInfo) => () => void
  reasonId: string
}

const LockoutContext = React.createContext<LockoutContextValue | null>(null)

function useLockout() {
  const context = React.useContext(LockoutContext)
  if (!context) throw new Error("Lockout parts must be inside <Lockout>")
  return context
}

/**
 * A lockout hasp. Each person working on something hangs their own lock;
 * the action can't start until every lock is off. Give it an aria-label.
 */
function Lockout({ className, children, ...props }: React.ComponentProps<"div">) {
  const [locks, setLocks] = React.useState<Record<string, LockInfo>>({})
  const reasonId = React.useId()
  const register = React.useCallback((id: string, info: LockInfo) => {
    setLocks((all) => ({ ...all, [id]: info }))
    return () =>
      setLocks((all) => {
        const next = { ...all }
        delete next[id]
        return next
      })
  }, [])
  const context = React.useMemo(() => ({ locks, register, reasonId }), [locks, register, reasonId])
  return (
    <LockoutContext value={context}>
      <div
        role="group"
        data-slot="lockout"
        data-locked={Object.keys(locks).length ? "" : undefined}
        className={cn("flex w-full max-w-md flex-col gap-4", className)}
        {...props}
      >
        {children}
      </div>
    </LockoutContext>
  )
}

/** The hasp the locks hang from. */
function LockoutHasp({ className, children, ...props }: React.ComponentProps<"ul">) {
  return (
    <div className="flex flex-col">
      <span aria-hidden className="bevel-metal bevel-object relative z-10 h-4 rounded-full" />
      <ul
        aria-label="Locks"
        data-slot="lockout-hasp"
        className={cn("-mt-1 flex min-h-36 flex-wrap justify-center gap-4 px-2", className)}
        {...props}
      >
        {children}
      </ul>
    </div>
  )
}

type LockoutLockProps = Omit<React.ComponentProps<"li">, "id"> & {
  id: string
  /** Whose lock it is. Shown on the tag. */
  owner: string
  /** Why it's locked. Shown on the tag. */
  reason?: string
  /** Only the owner can remove a lock: pass onRemove only for the current user's lock. */
  onRemove?: () => void
}

/** A padlock with its owner's tag. */
function LockoutLock({ className, id, owner, reason, onRemove, ...props }: LockoutLockProps) {
  const { register } = useLockout()
  React.useEffect(() => register(id, { owner }), [id, owner, register])
  return (
    <li data-slot="lockout-lock" className={cn("flex w-28 flex-col items-center", className)} {...props}>
      <span aria-hidden className="h-6 w-8 rounded-t-full border-4 border-b-0 border-(--lockout-shackle)" />
      <span
        aria-hidden
        data-slot="lockout-lock-body"
        className="bevel-metal grid h-9 w-11 place-items-center rounded-(--bevel-radius-sm)"
      >
        <span className="size-2 rounded-full bg-(--bevel-shade-strong)" />
      </span>
      <span className="mt-1.5 flex w-full flex-col items-center gap-0.5 rounded-(--bevel-radius-xs) bg-(--lockout-tag) px-1.5 py-1 text-center text-(--lockout-tag-foreground) shadow-(--bevel-depth-sheet)">
        <span className="text-(length:--bevel-fine) font-black tracking-(--bevel-tracking-label) uppercase">Danger</span>
        <span className="text-xs font-semibold">{owner}</span>
        {reason && <span className="text-(length:--bevel-fine) leading-tight">{reason}</span>}
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="mt-1.5 h-7 rounded-(--bevel-radius-sm) px-2 text-xs font-medium underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Remove my lock
        </button>
      )}
    </li>
  )
}

/** The action the locks hold. Disabled while any lock remains, and says whose. */
function LockoutAction({ className, children, ...props }: ButtonPrimitive.Props) {
  const { locks, reasonId } = useLockout()
  const owners = Object.values(locks).map((l) => l.owner)
  const locked = owners.length > 0
  return (
    <div className="flex flex-col items-center gap-2">
      <ButtonPrimitive
        data-slot="lockout-action"
        disabled={locked}
        focusableWhenDisabled
        aria-describedby={reasonId}
        className={cn(
          "bevel-raised h-10 rounded-(--bevel-radius-sm) px-5 text-sm font-semibold outline-none [--bevel-material:var(--lockout-clear)]",
          "transition-[translate,box-shadow] duration-(--bevel-duration-press) ease-(--bevel-ease-out) active:translate-y-0.5 active:bevel-pressed motion-reduce:transition-none",
          "focus-visible:ring-3 focus-visible:ring-ring/60 data-disabled:cursor-not-allowed data-disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </ButtonPrimitive>
      <p id={reasonId} role="status" className="text-center text-sm text-muted-foreground">
        {locked ? `Locked by ${owners.length}: ${owners.join(", ")}` : "No locks. Ready to start."}
      </p>
    </div>
  )
}

export { Lockout, LockoutHasp, LockoutLock, LockoutAction }
export type { LockoutLockProps }
