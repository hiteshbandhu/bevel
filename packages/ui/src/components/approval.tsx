"use client"

import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cn } from "cn"
import { Seal, Stamp } from "@workspace/ui/components/stamp"

type ApprovalState = "pending" | "approved" | "rejected"

const ApprovalContext = React.createContext<{
  state: ApprovalState
  approve: () => void
  reject: () => void
  titleId: string
}>({ state: "pending", approve: () => {}, reject: () => {}, titleId: "" })

type ApprovalProps = Omit<React.ComponentProps<"div">, "onReset"> & {
  state?: ApprovalState
  defaultState?: ApprovalState
  onApprove?: () => void
  onReject?: () => void
}

/**
 * An action waiting for a person: what it does, what it can't undo, who has
 * signed, and the seal to approve it.
 */
function Approval({
  className,
  state: stateProp,
  defaultState = "pending",
  onApprove,
  onReject,
  children,
  ...props
}: ApprovalProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultState)
  const state = stateProp ?? uncontrolled
  const titleId = React.useId()
  const context = React.useMemo(
    () => ({
      state,
      titleId,
      approve: () => {
        if (stateProp === undefined) setUncontrolled("approved")
        onApprove?.()
      },
      reject: () => {
        if (stateProp === undefined) setUncontrolled("rejected")
        onReject?.()
      },
    }),
    [state, stateProp, titleId, onApprove, onReject]
  )
  return (
    <ApprovalContext value={context}>
      <div
        role="group"
        aria-labelledby={titleId}
        data-slot="approval"
        data-state={state}
        className={cn(
          "bevel-paper relative flex w-full max-w-md flex-col gap-4 rounded-(--bevel-radius-xs) p-5 text-sm",
          className
        )}
        {...props}
      >
        {children}
        <ApprovalOutcome />
      </div>
    </ApprovalContext>
  )
}

/** The outcome pressed into the card, and announced. */
function ApprovalOutcome() {
  const { state } = React.useContext(ApprovalContext)
  return (
    <div role="status" className="pointer-events-none absolute top-4 right-4">
      {state === "approved" && (
        <>
          {/* Announce one clear word; the seal's ring text is decoration. */}
          <span className="sr-only">Approved</span>
          <Seal aria-hidden text="Approved · Approved ·" animate className="w-(--approval-seal-size)">
            OK
          </Seal>
        </>
      )}
      {state === "rejected" && (
        <Stamp tone="red" animate>
          Sent back
        </Stamp>
      )}
    </div>
  )
}

function ApprovalTitle({ className, ...props }: React.ComponentProps<"h3">) {
  const { titleId } = React.useContext(ApprovalContext)
  return (
    <h3
      id={titleId}
      data-slot="approval-title"
      className={cn("pr-24 text-base font-semibold text-(--bevel-paper-foreground)", className)}
      {...props}
    />
  )
}

/** What happens, and what can't be undone. Say it plainly. */
function ApprovalDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="approval-description"
      className={cn("pr-20 leading-relaxed text-(--bevel-paper-muted)", className)}
      {...props}
    />
  )
}

function ApprovalSignatures({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      aria-label="Signatures"
      data-slot="approval-signatures"
      className={cn("grid grid-cols-2 gap-4", className)}
      {...props}
    />
  )
}

/** A signature line. Signed names are written over it in marker. */
function ApprovalSignature({
  name,
  signed = false,
  className,
  ...props
}: { name: string; signed?: boolean } & Omit<React.ComponentProps<"li">, "children">) {
  return (
    <li data-slot="approval-signature" data-signed={signed ? "" : undefined} className={cn("flex flex-col", className)} {...props}>
      <span
        aria-hidden
        className="flex h-8 items-end border-b border-(--bevel-paper-foreground)/50 pb-0.5 font-(family-name:--bevel-font-marker) text-lg leading-none text-(--bevel-pen-blue)"
      >
        {signed ? name : ""}
      </span>
      <span className="mt-1 text-(length:--bevel-fine) text-(--bevel-paper-muted)">
        {name}
        <span className="sr-only">: {signed ? "signed" : "not signed yet"}</span>
        <span aria-hidden>{signed ? " · signed" : " · awaiting"}</span>
      </span>
    </li>
  )
}

function ApprovalActions({ className, ...props }: React.ComponentProps<"div">) {
  const { state } = React.useContext(ApprovalContext)
  if (state !== "pending") return null
  return (
    <div
      data-slot="approval-actions"
      className={cn("flex items-center justify-between gap-4 pt-1", className)}
      {...props}
    />
  )
}

/** Send it back without approving. A plain, single press. */
function ApprovalReject({ className, onClick, ...props }: ButtonPrimitive.Props) {
  const { reject } = React.useContext(ApprovalContext)
  return (
    <ButtonPrimitive
      data-slot="approval-reject"
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) reject()
      }}
      className={cn(
        "h-9 rounded-(--bevel-radius-sm) border border-(--bevel-paper-foreground)/30 px-3 text-sm font-medium text-(--bevel-paper-foreground) outline-none",
        "hover:bg-(--bevel-paper-foreground)/5 focus-visible:ring-2 focus-visible:ring-(--bevel-pen-blue)/50",
        className
      )}
      {...props}
    />
  )
}

/** Browsers may report a custom-property duration as "1200ms" or "1.2s". */
function toMilliseconds(value: string) {
  const n = parseFloat(value)
  if (Number.isNaN(n)) return 1200
  return /ms\s*$/.test(value) ? n : /s\s*$/.test(value) ? n * 1000 : n
}

type ApprovalSealProps = Omit<ButtonPrimitive.Props, "onClick"> & {
  /** Press and hold to approve (the default), or a single press. */
  requireHold?: boolean
}

/**
 * The brass embosser. Press and hold (pointer, Enter or Space) until it
 * seals; letting go early springs it back. The hold is deliberate on
 * purpose: approving is hard to undo.
 */
function ApprovalSeal({ className, requireHold = true, children, ...props }: ApprovalSealProps) {
  const { approve } = React.useContext(ApprovalContext)
  const [holding, setHolding] = React.useState(false)
  const timer = React.useRef<number | undefined>(undefined)
  const ref = React.useRef<HTMLButtonElement>(null)
  const hintId = React.useId()

  const start = () => {
    if (!requireHold) return approve()
    if (timer.current !== undefined) return
    const ms = toMilliseconds(getComputedStyle(ref.current!).getPropertyValue("--approval-hold"))
    setHolding(true)
    timer.current = window.setTimeout(() => {
      timer.current = undefined
      setHolding(false)
      approve()
    }, ms)
  }
  const cancel = () => {
    if (timer.current !== undefined) window.clearTimeout(timer.current)
    timer.current = undefined
    setHolding(false)
  }
  React.useEffect(() => cancel, [])

  return (
    <div className="flex items-center gap-3">
      <span id={hintId} className="text-right text-(length:--bevel-fine) text-(--bevel-paper-muted)">
        {requireHold ? "Press and hold to approve" : "Press to approve"}
      </span>
      <ButtonPrimitive
        ref={ref}
        data-slot="approval-seal"
        data-holding={holding ? "" : undefined}
        aria-describedby={hintId}
        onPointerDown={(event) => {
          if (event.button !== 0) return
          event.currentTarget.setPointerCapture(event.pointerId)
          start()
        }}
        onPointerUp={cancel}
        onPointerCancel={cancel}
        onLostPointerCapture={cancel}
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") && !event.repeat) {
            event.preventDefault()
            start()
          }
        }}
        onKeyUp={(event) => {
          if (event.key === "Enter" || event.key === " ") cancel()
        }}
        className={cn(
          "bevel-metal bevel-object relative grid size-16 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full text-(length:--bevel-fine) font-bold tracking-(--bevel-tracking-print) text-(--bevel-ivory-foreground) uppercase outline-none select-none",
          "transition-[translate] duration-(--bevel-duration-press) ease-(--bevel-ease-out) data-holding:translate-y-0.5 motion-reduce:transition-none",
          "focus-visible:ring-3 focus-visible:ring-(--bevel-pen-blue)/50 focus-visible:ring-offset-2",
          className
        )}
        {...props}
      >
        {/* Fills slowly while held; drains fast on release. */}
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 bg-(--approval-press-fill)",
            holding
              ? "[clip-path:inset(0_0_0_0)] transition-[clip-path] duration-(--approval-hold) ease-linear"
              : "[clip-path:inset(100%_0_0_0)] transition-[clip-path] duration-(--approval-release) ease-(--bevel-ease-out)",
            "motion-reduce:transition-none"
          )}
        />
        <span className="relative">{children ?? "Seal"}</span>
      </ButtonPrimitive>
    </div>
  )
}

export {
  Approval,
  ApprovalTitle,
  ApprovalDescription,
  ApprovalSignatures,
  ApprovalSignature,
  ApprovalActions,
  ApprovalReject,
  ApprovalSeal,
}
export type { ApprovalProps, ApprovalState, ApprovalSealProps }
