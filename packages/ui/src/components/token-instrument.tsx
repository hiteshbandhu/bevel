"use client"

import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cn } from "cn"

type TokenContextValue = {
  holder: string | null
  you: string
  take: () => void
  give: () => void
  request: () => void
  section: string
}

const TokenContext = React.createContext<TokenContextValue | null>(null)

function useToken() {
  const context = React.useContext(TokenContext)
  if (!context) throw new Error("TokenInstrument parts must be inside <TokenInstrument>")
  return context
}

type TokenInstrumentProps = React.ComponentProps<"div"> & {
  /** What the token is for: the document, lane or section it unlocks. */
  section: string
  /** Who holds the token, or null if it's in the instrument. */
  holder: string | null
  /** The current viewer's name, as holder would show it. */
  you: string
  onTake?: () => void
  onReturn?: () => void
  /** Ask the holder for the token. */
  onRequest?: (holder: string) => void
}

/**
 * One token per section: whoever holds it may proceed, and everyone can see
 * who that is. For exclusive edit locks, deploy lanes, or who's driving.
 */
function TokenInstrument({
  className,
  section,
  holder,
  you,
  onTake,
  onReturn,
  onRequest,
  children,
  ...props
}: TokenInstrumentProps) {
  const context = React.useMemo<TokenContextValue>(
    () => ({
      holder,
      you,
      section,
      take: () => onTake?.(),
      give: () => onReturn?.(),
      request: () => holder && onRequest?.(holder),
    }),
    [holder, you, section, onTake, onReturn, onRequest]
  )
  const state = holder === null ? "free" : holder === you ? "yours" : "taken"
  return (
    <TokenContext value={context}>
      <div
        role="group"
        aria-label={`${section} token`}
        data-slot="token-instrument"
        data-state={state}
        className={cn(
          "bevel-metal bevel-object flex w-60 flex-col items-center gap-3 rounded-(--bevel-radius-lg) p-4 text-(--bevel-ivory)",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </TokenContext>
  )
}

/** The window: the token sits in it while free; otherwise it shows who has it. */
function TokenInstrumentSlot({ className, ...props }: React.ComponentProps<"div">) {
  const { holder, you, section } = useToken()
  const free = holder === null
  return (
    <div
      data-slot="token-instrument-slot"
      className={cn(
        "bevel-recessed relative grid h-28 w-full place-items-center overflow-hidden rounded-(--bevel-radius-md)",
        className
      )}
      {...props}
    >
      <span
        aria-hidden
        data-slot="token-instrument-token"
        className={cn(
          "bevel-metal token-instrument-notch grid size-20 place-items-center rounded-full text-center text-(length:--bevel-fine) leading-tight font-bold tracking-(--bevel-tracking-print) text-(--bevel-ivory-foreground) uppercase",
          "transition-[translate,opacity] duration-(--bevel-duration-move) ease-(--bevel-ease-out) motion-reduce:transition-none",
          !free && "-translate-y-(--token-instrument-taken) opacity-0"
        )}
      >
        <span className="px-2">{section}</span>
      </span>
      {!free && (
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span className="rounded-(--bevel-radius-xs) bg-(--token-instrument-out) px-2 py-0.5 text-(length:--bevel-fine) font-black tracking-(--bevel-tracking-label) text-(--token-instrument-out-foreground) uppercase">
            Out
          </span>
          <span className="text-sm">{holder === you ? "You have it" : `${holder} has it`}</span>
        </span>
      )}
    </div>
  )
}

/** Who holds the token, in words. */
function TokenInstrumentStatus({ className, ...props }: React.ComponentProps<"p">) {
  const { holder, you, section } = useToken()
  return (
    <p role="status" className={cn("text-center text-sm", className)} {...props}>
      {holder === null
        ? `${section} is free to take.`
        : holder === you
          ? `You hold the ${section} token.`
          : `${holder} holds the ${section} token.`}
    </p>
  )
}

/** Take, return, or ask the holder for it. */
function TokenInstrumentAction({ className, ...props }: Omit<ButtonPrimitive.Props, "onClick" | "children">) {
  const { holder, you, take, give, request } = useToken()
  const label = holder === null ? "Take token" : holder === you ? "Return token" : `Ask ${holder}`
  return (
    <ButtonPrimitive
      data-slot="token-instrument-action"
      onClick={holder === null ? take : holder === you ? give : request}
      className={cn(
        "bevel-raised h-9 w-full rounded-(--bevel-radius-sm) text-sm font-semibold text-(--bevel-ivory-foreground) outline-none [--bevel-material:var(--bevel-brass)] [--bevel-material-edge:var(--bevel-brass-edge)]",
        "transition-[translate,box-shadow] duration-(--bevel-duration-press) ease-(--bevel-ease-out) active:translate-y-0.5 active:bevel-pressed motion-reduce:transition-none",
        "focus-visible:ring-3 focus-visible:ring-(--bevel-ivory)/50",
        className
      )}
      {...props}
    >
      {label}
    </ButtonPrimitive>
  )
}

export { TokenInstrument, TokenInstrumentSlot, TokenInstrumentStatus, TokenInstrumentAction }
export type { TokenInstrumentProps }
