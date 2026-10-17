"use client"

import * as React from "react"
import { cn } from "cn"
import { PaymentCard, type PaymentCardProps } from "@workspace/ui/components/payment-card"

/** An access key as a plastic card with a magnetic stripe. A PaymentCard underneath. */
function Keycard({ className, children, tone = "graphite", ...props }: PaymentCardProps) {
  return (
    <PaymentCard
      tone={tone}
      data-keycard=""
      className={cn("flex-col items-stretch gap-1 pt-3", className)}
      {...props}
    >
      <span aria-hidden data-slot="keycard-stripe" className="absolute inset-x-0 bottom-[18%] h-[16%] bg-(--keycard-stripe)" />
      {children}
    </PaymentCard>
  )
}

function KeycardLabel({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="keycard-label"
      className={cn(
        "text-(length:--bevel-fine) font-semibold tracking-(--bevel-tracking-print) uppercase",
        className
      )}
      {...props}
    />
  )
}

type KeycardKeyProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** The full key. Only its prefix and last four are shown unless revealed. */
  value: string
  revealed?: boolean
}

/** The key itself, masked to its prefix and last four characters. */
function KeycardKey({ value, revealed = false, className, ...props }: KeycardKeyProps) {
  const prefix = value.match(/^[a-z]+[-_]/i)?.[0] ?? ""
  const last4 = value.slice(-4)
  return (
    <span
      data-slot="keycard-key"
      data-revealed={revealed ? "" : undefined}
      className={cn("font-mono text-(length:--bevel-fine) break-all", className)}
      {...props}
    >
      {revealed ? (
        value
      ) : (
        <>
          {prefix}
          <span aria-hidden>••••••••</span>
          <span className="sr-only">ending in </span>
          {last4}
        </>
      )}
    </span>
  )
}

type KeycardSlotProps = React.ComponentProps<"div"> & {
  /** The card is in the reader. */
  inserted?: boolean
  /** Text on the reader plate. Defaults describe whether a key is in. */
  status?: React.ReactNode
}

/** A brass card reader. Put a Keycard inside; set `inserted` and it slides into the slot. */
function KeycardSlot({ className, inserted = false, status, children, ...props }: KeycardSlotProps) {
  return (
    <div
      data-slot="keycard-slot"
      data-inserted={inserted ? "" : undefined}
      className={cn("relative w-full max-w-xs pb-(--keycard-plate-height)", className)}
      {...props}
    >
      {/* The reader hides whatever part of the card is inside it. */}
      <div className="keycard-mouth">
        <div
          className={cn(
            "transition-[translate] duration-(--bevel-duration-move) ease-(--bevel-ease-in-out) motion-reduce:transition-none",
            inserted && "translate-y-(--keycard-insert)"
          )}
        >
          {children}
        </div>
      </div>
      <div
        data-slot="keycard-reader"
        className="bevel-metal bevel-object absolute inset-x-0 bottom-0 z-10 flex h-(--keycard-plate-height) flex-col justify-end rounded-(--bevel-radius-sm) px-4 pb-3"
      >
        <span aria-hidden className="bevel-recessed absolute inset-x-3 top-2 h-1.5 rounded-full" />
        <span
          aria-live="polite"
          className="bevel-deboss flex items-center gap-1.5 text-(length:--bevel-fine) font-semibold tracking-(--bevel-tracking-print) text-(--bevel-ivory-foreground) uppercase"
        >
          <span aria-hidden className="bevel-led size-1.5 rounded-full" />
          {status ?? (inserted ? "Key in use" : "No key inserted")}
        </span>
      </div>
    </div>
  )
}

// A swipe counts once the card has travelled this share of the channel,
// or if it's flicked faster than this (px/ms), however short the drag.
const SWIPE_DISTANCE = 0.6
const SWIPE_VELOCITY = 0.11
// Resistance past either end of the channel.
const FRICTION = 0.2

/**
 * Run `then` when the element's transition ends. Falls back to a timer so a
 * hidden tab (where transitions don't run) can't leave the reader stuck.
 */
function afterTransition(element: HTMLElement, animated: boolean, then: () => void) {
  if (!animated) return then()
  let done = false
  const finish = () => {
    if (done) return
    done = true
    then()
  }
  element.addEventListener("transitionend", finish, { once: true })
  const seconds = parseFloat(getComputedStyle(element).transitionDuration) || 0
  window.setTimeout(finish, seconds * 1000 + 50)
}

type KeycardSwipeProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Called when a swipe completes, by drag, flick or keyboard. */
  onSwipe?: () => void
  /** Lights the reader lamp, e.g. once a key is accepted. */
  accepted?: boolean
  /** Text on the reader plate, announced politely. */
  status?: React.ReactNode
  /** The action, read before the card's own text: "Swipe key: Your OpenAI key…". */
  label?: string
  /** A Keycard. */
  children: React.ReactNode
}

/**
 * A swipe reader: drag the card left to right through the channel. A long
 * enough drag or a quick flick completes the swipe; a short one springs
 * back. Enter or Space swipes from the keyboard.
 */
function KeycardSwipe({
  className,
  onSwipe,
  accepted = false,
  status,
  label = "Swipe key",
  children,
  ...props
}: KeycardSwipeProps) {
  const trackRef = React.useRef<HTMLDivElement>(null)
  const cardRef = React.useRef<HTMLDivElement>(null)
  const drag = React.useRef<{ pointerId: number; startX: number; startTime: number; x: number } | null>(null)
  const busy = React.useRef(false)
  const position = React.useRef(0)
  const statusId = React.useId()

  const travel = () => (trackRef.current?.clientWidth ?? 0) - (cardRef.current?.offsetWidth ?? 0)
  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

  // Position is written straight to the element so dragging never re-renders.
  const moveTo = (x: number, transition: "none" | "through" | "back" | "spring", then?: () => void) => {
    const card = cardRef.current
    if (!card) return
    const animated = transition !== "none" && !reducedMotion() && position.current !== x
    position.current = x
    card.style.transition = animated
      ? {
          through: "translate var(--bevel-duration-move) var(--bevel-ease-out)",
          back: "translate var(--bevel-duration-ambient) var(--bevel-ease-in-out)",
          spring: "translate var(--bevel-duration-move) var(--bevel-ease-spring)",
          none: "none",
        }[transition]
      : "none"
    card.style.translate = `${x}px 0`
    if (then) afterTransition(card, animated, then)
  }

  const swipe = () => {
    if (busy.current) return
    busy.current = true
    // The swipe is decided now; state doesn't wait for the animation.
    onSwipe?.()
    moveTo(travel(), "through", () =>
      // Then the card comes back out of the reader, slower than it went through.
      moveTo(0, "back", () => {
        busy.current = false
      })
    )
  }

  return (
    <div
      ref={trackRef}
      data-slot="keycard-swipe"
      data-accepted={accepted ? "" : undefined}
      className={cn("relative w-full max-w-sm pb-[calc(var(--keycard-plate-height)-var(--keycard-swipe-overlap))]", className)}
      {...props}
    >
      <div
        ref={cardRef}
        role="button"
        tabIndex={0}
        aria-describedby={statusId}
        data-slot="keycard-swipe-card"
        className="relative w-[72%] cursor-grab touch-pan-y rounded-(--bevel-radius-md) outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:cursor-grabbing"
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return
          event.preventDefault()
          swipe()
        }}
        onPointerDown={(event) => {
          // One finger at a time; a second touch mid-drag is ignored.
          if (drag.current || busy.current || event.button !== 0) return
          event.currentTarget.setPointerCapture(event.pointerId)
          drag.current = { pointerId: event.pointerId, startX: event.clientX, startTime: event.timeStamp, x: 0 }
        }}
        onPointerMove={(event) => {
          const d = drag.current
          if (!d || d.pointerId !== event.pointerId) return
          const raw = event.clientX - d.startX
          const max = travel()
          // Friction past either end instead of a hard stop.
          d.x = raw < 0 ? raw * FRICTION : raw > max ? max + (raw - max) * FRICTION : raw
          moveTo(d.x, "none")
        }}
        onPointerUp={(event) => {
          const d = drag.current
          if (!d || d.pointerId !== event.pointerId) return
          drag.current = null
          const velocity = d.x / Math.max(1, event.timeStamp - d.startTime)
          if (d.x >= travel() * SWIPE_DISTANCE || velocity > SWIPE_VELOCITY) swipe()
          else moveTo(0, "spring")
        }}
        onPointerCancel={() => {
          drag.current = null
          moveTo(0, "spring")
        }}
      >
        {/* The action leads the name; the card's visible text follows, so voice users can say what they see. */}
        <span className="sr-only">{label}: </span>
        {children}
      </div>
      <div
        data-slot="keycard-reader"
        className="bevel-metal bevel-object absolute inset-x-0 bottom-0 z-10 flex h-(--keycard-plate-height) flex-col justify-end rounded-(--bevel-radius-sm) px-4 pb-3"
      >
        <span aria-hidden className="bevel-recessed absolute inset-x-0 top-0 h-2 rounded-t-(--bevel-radius-sm)" />
        <span
          id={statusId}
          aria-live="polite"
          className="bevel-deboss flex items-center gap-1.5 text-(length:--bevel-fine) font-semibold tracking-(--bevel-tracking-print) text-(--bevel-ivory-foreground) uppercase"
        >
          <span aria-hidden className="bevel-led size-1.5 rounded-full" />
          {status ?? (accepted ? "Key accepted" : "Swipe the card to the right")}
        </span>
      </div>
    </div>
  )
}

export { Keycard, KeycardLabel, KeycardKey, KeycardSlot, KeycardSwipe }
export type { KeycardKeyProps, KeycardSlotProps, KeycardSwipeProps }
