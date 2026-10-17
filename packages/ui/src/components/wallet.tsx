"use client"

import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { mergeProps } from "@base-ui/react/merge-props"
import { Meter as MeterPrimitive } from "@base-ui/react/meter"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup } from "@base-ui/react/radio-group"
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"
import { useRender } from "@base-ui/react/use-render"
import { cn } from "cn"
import { Amount } from "@workspace/ui/components/amount"
import { isDigitPart, useAmountParts, type AmountFormat } from "@workspace/ui/lib/amount"
import { PaymentCard, type PaymentCardProps, type PaymentCardTone } from "@workspace/ui/components/payment-card"

type WalletVariant = "saddle" | "noir" | "oxblood"
type WalletStatus = "default" | "low" | "empty" | "insufficient"

type WalletProps = useRender.ComponentProps<"div"> & {
  /** Leather finish. */
  variant?: WalletVariant
  /** Drives the status light, meter fill and any `group-data-[status=*]/wallet` styling. */
  status?: WalletStatus
}

function cssVars(vars: Record<`--${string}`, string | number>) {
  return vars as React.CSSProperties
}

const WalletContext = React.createContext<{ status: WalletStatus }>({ status: "default" })

function Wallet({
  className,
  render,
  variant = "saddle",
  status = "default",
  ...props
}: WalletProps) {
  const context = React.useMemo(() => ({ status }), [status])
  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        "data-slot": "wallet",
        "data-variant": variant,
        "data-status": status,
        className: cn(
          "group/wallet bevel-leather bevel-object relative isolate flex w-full max-w-sm flex-col rounded-(--bevel-radius-lg) text-left text-(--wallet-foreground) outline-none",
          "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          // Stitching follows the outline: inner radius = outer radius - inset.
          "before:bevel-stitch before:pointer-events-none before:absolute before:inset-(--bevel-stitch-inset) before:rounded-[calc(var(--bevel-radius-lg)-var(--bevel-stitch-inset))]",
          "forced-colors:border forced-colors:border-[CanvasText]",
          className
        ),
      } as React.ComponentProps<"div">,
      props
    ),
  })
  return <WalletContext value={context}>{element}</WalletContext>
}

type WalletCardsContextValue = {
  selectable: boolean
  /** True once the stack has mounted; read by each card on its first render only. */
  mountedRef: React.RefObject<boolean>
}
const WalletCardsContext = React.createContext<WalletCardsContextValue>({
  selectable: false,
  mountedRef: { current: false },
})
const WalletCardPositionContext = React.createContext({ index: 0, count: 1 })

type WalletCardsProps = Omit<RadioGroup.Props<string>, "render" | "style"> & {
  style?: React.CSSProperties
}

/**
 * The cards tucked in the wallet, back to front. Passing `value`,
 * `defaultValue` or `onValueChange` makes them a radio group: the chosen
 * card is pulled up out of the pocket.
 */
function WalletCards({
  className,
  style,
  children,
  value,
  defaultValue,
  onValueChange,
  ...props
}: WalletCardsProps) {
  const selectable = value !== undefined || defaultValue !== undefined || onValueChange !== undefined
  const items = React.Children.toArray(children)

  // Cards present on first render are already in the wallet; only cards
  // added afterwards slide in.
  const mountedRef = React.useRef(false)
  React.useEffect(() => {
    mountedRef.current = true
  }, [])
  const context = React.useMemo(() => ({ selectable, mountedRef }), [selectable])

  const shared = {
    "data-slot": "wallet-cards",
    className: cn(
      "relative mx-5 mt-4 h-[calc(var(--wallet-card-peek)+max(var(--wallet-card-count)-1,0)*var(--wallet-card-step))] shrink-0",
      "transition-[height] duration-(--bevel-duration-move) ease-(--bevel-ease-out) motion-reduce:transition-none",
      // Picking needs a strip per card that stays tappable while one is pulled.
      selectable ? "[--wallet-card-step:var(--wallet-card-step-pick)]" : "pointer-events-none",
      className
    ),
    style: { ...cssVars({ "--wallet-card-count": items.length }), ...style },
    children: items.map((child, index) => (
      <WalletCardPositionContext
        key={React.isValidElement(child) ? child.key : index}
        value={{ index, count: items.length }}
      >
        {child}
      </WalletCardPositionContext>
    )),
  }

  return (
    <WalletCardsContext value={context}>
      {selectable ? (
        <RadioGroup
          aria-label="Payment methods"
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          {...props}
          {...shared}
        />
      ) : (
        <div {...(props as React.ComponentProps<"div">)} {...shared} />
      )}
    </WalletCardsContext>
  )
}

// Resting tilt for each card behind the front one; the front card sits square.
const cardTilts = [-1.25, 0.75, -0.5, 1, -0.75]
const cardTones: PaymentCardTone[] = ["sapphire", "gold", "graphite"]

type WalletCardProps = Omit<PaymentCardProps, "render"> & {
  /** Selection value when the cards are a radio group. Defaults to the card's position. */
  value?: string
  disabled?: boolean
}

/** A PaymentCard placed in the wallet's stack. */
function WalletCard({ className, style, value, disabled, tone, children, ...props }: WalletCardProps) {
  const { selectable, mountedRef } = React.useContext(WalletCardsContext)
  const { index, count } = React.useContext(WalletCardPositionContext)
  const [enters] = React.useState(() => mountedRef.current)
  const fromFront = count - 1 - index

  return (
    <PaymentCard
      tone={tone ?? cardTones[index % cardTones.length]}
      render={
        selectable ? (
          <RadioPrimitive.Root value={value ?? String(index)} disabled={disabled} />
        ) : undefined
      }
      aria-hidden={selectable || children ? undefined : true}
      data-wallet-card=""
      data-enter={enters ? "" : undefined}
      className={cn(
        // Only the top strip shows above the pocket, so the card is shorter than a real one.
        "absolute inset-x-0 top-0 aspect-auto h-32",
        "[translate:0_calc(var(--wallet-card-index)*var(--wallet-card-step)+var(--wallet-card-lift))] rotate-(--wallet-card-tilt)",
        "transition-[translate,rotate,opacity,filter] duration-(--bevel-duration-move) ease-(--bevel-ease-out) motion-reduce:transition-none",
        "group-hover/wallet:not-data-checked:[--wallet-card-lift:calc(var(--bevel-lift)*-1)] group-hover/wallet:not-data-checked:delay-[calc(var(--wallet-card-index)*var(--bevel-stagger))]",
        // Pulled out with a spring; it straightens as it comes up.
        "data-checked:rotate-0 data-checked:ease-(--bevel-ease-spring) data-checked:[--wallet-card-lift:calc(var(--wallet-card-pull)*-1)]",
        "data-enter:starting:opacity-0 data-enter:starting:[--wallet-card-lift:calc(var(--wallet-card-enter)*-1)]",
        "[&[role=radio]]:cursor-pointer [&[role=radio]]:not-data-checked:brightness-(--bevel-dim)",
        className
      )}
      style={{
        ...cssVars({
          "--wallet-card-index": index,
          "--wallet-card-tilt": `${fromFront === 0 ? 0 : cardTilts[(fromFront - 1) % cardTilts.length]}deg`,
        }),
        ...style,
      }}
      {...props}
    >
      {children}
    </PaymentCard>
  )
}

function WalletPocket({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="wallet-pocket"
      className={cn(
        "wallet-pocket relative z-10 flex flex-col gap-4 rounded-t-(--bevel-radius-xs) rounded-b-(--bevel-radius-lg) px-5 pt-9 pb-5",
        "forced-colors:border-t forced-colors:border-[CanvasText]",
        className
      )}
      {...props}
    >
      {/* The pocket's top is a fold, so it is stitched on three sides only. */}
      <span
        aria-hidden
        className="bevel-stitch pointer-events-none absolute inset-x-(--bevel-stitch-inset) top-0 bottom-(--bevel-stitch-inset) rounded-b-[calc(var(--bevel-radius-lg)-var(--bevel-stitch-inset))] border-t-0"
      />
      {children}
    </div>
  )
}

function WalletHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="wallet-header"
      className={cn("flex items-center justify-between gap-3", className)}
      {...props}
    />
  )
}

function WalletLabel({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="wallet-label"
      className={cn(
        "bevel-deboss text-(length:--bevel-label) font-semibold tracking-(--bevel-tracking-label) text-(--wallet-muted-foreground) uppercase",
        className
      )}
      {...props}
    />
  )
}

const statusText: Record<WalletStatus, string> = {
  default: "Active",
  low: "Low balance",
  empty: "Empty",
  insufficient: "Insufficient",
}

/** Status light. Reads the wallet's `status`; pass children to override the text. */
function WalletStatusLight({ className, children, ...props }: React.ComponentProps<"span">) {
  const { status } = React.useContext(WalletContext)
  return (
    <span
      data-slot="wallet-status"
      className={cn(
        "bevel-deboss inline-flex items-center gap-1.5 text-(length:--bevel-label) font-medium text-(--wallet-muted-foreground)",
        className
      )}
      {...props}
    >
      <span aria-hidden className="bevel-led size-2 shrink-0 rounded-full" />
      {children ?? statusText[status]}
    </span>
  )
}

const isMinor = (type: Intl.NumberFormatPartTypes) =>
  type === "currency" || type === "decimal" || type === "fraction" || type === "literal"
const isMuted = (type: Intl.NumberFormatPartTypes) =>
  type === "currency" || type === "decimal" || type === "fraction"

function WalletBalance({
  value,
  currency,
  locale,
  format,
  className,
  ...props
}: AmountFormat & Omit<React.ComponentProps<"p">, "children">) {
  const parts = useAmountParts({ value, currency, locale, format })
  return (
    <p
      data-slot="wallet-balance"
      className={cn("bevel-deboss flex items-baseline font-semibold tracking-tight", className)}
      {...props}
    >
      {parts.map((part, i) => (
        <span
          key={i}
          data-part={part.type}
          className={cn(
            "text-(length:--bevel-amount) leading-none",
            isDigitPart(part.type) && "tabular-nums",
            isMinor(part.type) && "text-(length:--bevel-amount-minor)",
            isMuted(part.type) && "text-(--wallet-muted-foreground)",
            part.type === "currency" && "mr-0.5 self-start pt-1",
            part.type === "minusSign" && "mr-0.5"
          )}
        >
          {part.value}
        </span>
      ))}
    </p>
  )
}

/** Inline amount for detail rows; same formatting as the balance. */
function WalletAmount(props: React.ComponentProps<typeof Amount>) {
  return <Amount data-wallet-amount="" {...props} />
}

function WalletDetails({ className, ...props }: React.ComponentProps<"dl">) {
  return (
    <dl data-slot="wallet-details" className={cn("flex flex-col gap-1.5 text-sm", className)} {...props} />
  )
}

function WalletDetail({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="wallet-detail"
      className={cn("bevel-deboss flex items-baseline justify-between gap-4", className)}
      {...props}
    />
  )
}

function WalletDetailLabel({ className, ...props }: React.ComponentProps<"dt">) {
  return (
    <dt
      data-slot="wallet-detail-label"
      className={cn("text-(--wallet-muted-foreground)", className)}
      {...props}
    />
  )
}

function WalletDetailValue({ className, ...props }: React.ComponentProps<"dd">) {
  return <dd data-slot="wallet-detail-value" className={cn("font-medium", className)} {...props} />
}

function WalletSeparator({ className, ...props }: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      data-slot="wallet-separator"
      className={cn("bevel-stitch -mx-1 border-x-0 border-b-0", className)}
      {...props}
    />
  )
}

function WalletMeter({ className, children, ...props }: MeterPrimitive.Root.Props) {
  return (
    <MeterPrimitive.Root
      data-slot="wallet-meter"
      className={cn("grid grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-2", className)}
      {...props}
    >
      {children}
      <MeterPrimitive.Track
        data-slot="wallet-meter-track"
        className="bevel-recessed col-span-full h-2 overflow-hidden rounded-full p-px"
      >
        <MeterPrimitive.Indicator
          data-slot="wallet-meter-indicator"
          className="bevel-fill h-full rounded-full forced-colors:bg-[Highlight]"
        />
      </MeterPrimitive.Track>
    </MeterPrimitive.Root>
  )
}

function WalletMeterLabel({ className, ...props }: MeterPrimitive.Label.Props) {
  return (
    <MeterPrimitive.Label
      data-slot="wallet-meter-label"
      className={cn("bevel-deboss text-sm text-(--wallet-muted-foreground)", className)}
      {...props}
    />
  )
}

function WalletMeterValue({ className, ...props }: MeterPrimitive.Value.Props) {
  return (
    <MeterPrimitive.Value
      data-slot="wallet-meter-value"
      className={cn("bevel-deboss text-sm font-medium tabular-nums", className)}
      {...props}
    />
  )
}

function WalletFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="wallet-footer" className={cn("flex items-center gap-2", className)} {...props} />
  )
}

function WalletAction({ className, ...props }: ButtonPrimitive.Props) {
  return (
    <ButtonPrimitive
      data-slot="wallet-action"
      className={cn(
        "bevel-raised bevel-deboss inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-(--bevel-radius-sm) px-3 text-sm font-medium text-(--wallet-foreground) outline-none select-none",
        "transition-[translate,box-shadow] duration-(--bevel-duration-press) ease-(--bevel-ease-out) motion-reduce:transition-none",
        "active:translate-y-0.5 active:bevel-pressed data-pressed:translate-y-0.5 data-pressed:bevel-pressed",
        "focus-visible:ring-3 focus-visible:ring-(--wallet-foreground)/40",
        "data-disabled:cursor-not-allowed data-disabled:opacity-60 data-disabled:active:translate-y-0",
        "forced-colors:border forced-colors:border-[ButtonText]",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

export {
  Wallet,
  WalletCards,
  WalletCard,
  WalletPocket,
  WalletHeader,
  WalletLabel,
  WalletStatusLight as WalletStatus,
  WalletBalance,
  WalletAmount,
  WalletDetails,
  WalletDetail,
  WalletDetailLabel,
  WalletDetailValue,
  WalletSeparator,
  WalletMeter,
  WalletMeterLabel,
  WalletMeterValue,
  WalletFooter,
  WalletAction,
}
export type {
  WalletProps,
  WalletCardsProps,
  WalletCardProps,
  WalletVariant,
  WalletStatus as WalletStatusValue,
}
