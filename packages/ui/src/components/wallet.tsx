"use client"

import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { Meter as MeterPrimitive } from "@base-ui/react/meter"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup } from "@base-ui/react/radio-group"
import { mergeProps } from "@base-ui/react/merge-props"
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"
import { useRender } from "@base-ui/react/use-render"
import { cn } from "cn"

type WalletVariant = "saddle" | "noir" | "oxblood"
type WalletStatus = "default" | "low" | "empty" | "insufficient"

type WalletProps = useRender.ComponentProps<"div"> & {
  /** Leather finish. */
  variant?: WalletVariant
  /** Drives the status light, meter fill and any `group-data-[status=*]/wallet` styling. */
  status?: WalletStatus
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
          "group/wallet wallet-lining relative isolate flex w-full max-w-sm flex-col rounded-2xl text-left text-(--wallet-foreground) outline-none",
          "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "before:pointer-events-none before:absolute before:inset-1.5 before:rounded-[0.8rem] before:border-[1.5px] before:wallet-stitch",
          "forced-colors:border forced-colors:border-[CanvasText]",
          className
        ),
      } as React.ComponentProps<"div">,
      props
    ),
  })
  return <WalletContext value={context}>{element}</WalletContext>
}

function cssVars(vars: Record<`--${string}`, string | number>) {
  return vars as React.CSSProperties
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
      "transition-[height] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
      // Picking needs a strip per card that stays tappable while one is pulled.
      selectable ? "[--wallet-card-step:2rem]" : "pointer-events-none [--wallet-card-step:1.25rem]",
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

type WalletCardProps = Omit<RadioPrimitive.Root.Props<string>, "value" | "style"> & {
  style?: React.CSSProperties
  /** Selection value when the cards are a radio group. Defaults to the card's position. */
  value?: string
}

function WalletCard({ className, style, value, children, ...props }: WalletCardProps) {
  const { selectable, mountedRef } = React.useContext(WalletCardsContext)
  const [enters] = React.useState(() => mountedRef.current)
  const { index, count } = React.useContext(WalletCardPositionContext)
  const fromFront = count - 1 - index
  const tone = (index % 3) + 1

  const shared = {
    "data-slot": "wallet-card",
    "data-enter": enters ? "" : undefined,
    "aria-hidden": selectable || children ? undefined : true,
    className: cn(
      "wallet-card absolute inset-x-0 top-0 flex h-32 items-start gap-2 rounded-[0.6rem] bg-(--wallet-card-bg) px-3 pt-1 text-(--wallet-card-fg) outline-none select-none",
      "[--wallet-card-lift:0px] [translate:0_calc(var(--wallet-card-index)*var(--wallet-card-step)+var(--wallet-card-lift))] rotate-(--wallet-card-tilt)",
      "transition-[translate,rotate,opacity,filter] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
      "group-hover/wallet:not-data-checked:[--wallet-card-lift:-3px] group-hover/wallet:not-data-checked:delay-[calc(var(--wallet-card-index)*30ms)]",
      "data-checked:rotate-0 data-checked:[--wallet-card-lift:calc(var(--wallet-card-pull)*-1)]",
      "data-enter:starting:opacity-0 data-enter:starting:[--wallet-card-lift:-3rem]",
      "[&[role=radio]]:cursor-pointer [&[role=radio]]:not-data-checked:brightness-[0.82]",
      "focus-visible:ring-2 focus-visible:ring-(--wallet-foreground)/80",
      "data-disabled:cursor-not-allowed data-disabled:brightness-75 data-disabled:saturate-50",
      className
    ),
    style: {
      ...cssVars({
        "--wallet-card-index": index,
        "--wallet-card-tilt": `${fromFront === 0 ? 0 : cardTilts[(fromFront - 1) % cardTilts.length]}deg`,
        "--wallet-card-bg": `var(--wallet-card-${tone})`,
        "--wallet-card-fg": `var(--wallet-card-${tone}-foreground)`,
      }),
      ...style,
    },
    children,
  }

  if (selectable) {
    return <RadioPrimitive.Root value={value ?? String(index)} {...props} {...shared} />
  }
  return <div {...(props as React.ComponentProps<"div">)} {...shared} />
}

function WalletCardBrand({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="wallet-card-brand"
      className={cn(
        "inline-flex items-center gap-1 text-[0.6875rem] leading-4 font-semibold tracking-[0.06em] uppercase [&_svg]:h-3 [&_svg]:w-auto",
        className
      )}
      {...props}
    />
  )
}

function WalletCardNumber({
  last4,
  className,
  ...props
}: { last4: string } & Omit<React.ComponentProps<"span">, "children">) {
  return (
    <span
      data-slot="wallet-card-number"
      className={cn("ms-auto font-mono text-[0.6875rem] leading-4 tabular-nums", className)}
      {...props}
    >
      <span aria-hidden>•••• </span>
      <span className="sr-only">ending in </span>
      {last4}
    </span>
  )
}

function WalletPocket({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="wallet-pocket"
      className={cn(
        "wallet-pocket relative z-10 flex flex-col gap-4 rounded-t-sm rounded-b-2xl px-5 pt-9 pb-5",
        "forced-colors:border-t forced-colors:border-[CanvasText]",
        className
      )}
      {...props}
    >
      <span
        aria-hidden
        className="wallet-stitch pointer-events-none absolute inset-x-1.5 top-0 bottom-1.5 rounded-b-[0.8rem] border-[1.5px] border-t-0"
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
        "wallet-deboss text-xs font-semibold tracking-[0.08em] text-(--wallet-muted-foreground) uppercase",
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
        "wallet-deboss inline-flex items-center gap-1.5 text-xs font-medium text-(--wallet-muted-foreground)",
        "[--wallet-led:var(--wallet-ok)] group-data-[status=low]/wallet:[--wallet-led:var(--wallet-low)]",
        "group-data-[status=empty]/wallet:[--wallet-led:var(--wallet-danger)] group-data-[status=insufficient]/wallet:[--wallet-led:var(--wallet-danger)]",
        className
      )}
      {...props}
    >
      <span aria-hidden className="wallet-led size-2 shrink-0 rounded-full" />
      {children ?? statusText[status]}
    </span>
  )
}

type AmountFormat = {
  value: number
  /** ISO 4217 code. Omit for a plain number (credits, tokens…). */
  currency?: string
  /** Fixed by default so server and client render the same string. */
  locale?: Intl.LocalesArgument
  /** Merged over the currency defaults. */
  format?: Intl.NumberFormatOptions
}

function useAmountParts({ value, currency, locale = "en-US", format }: AmountFormat) {
  return React.useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        ...(currency ? { style: "currency", currency } : { maximumFractionDigits: 0 }),
        ...format,
      }).formatToParts(value),
    [value, currency, locale, format]
  )
}

function WalletBalance({
  value,
  currency,
  locale,
  format,
  className,
  ...props
}: AmountFormat & Omit<React.ComponentProps<"p">, "children">) {
  const parts = useAmountParts({ value, currency, locale, format })
  const isDecimal = (type: Intl.NumberFormatPartTypes) => type === "decimal" || type === "fraction"
  return (
    <p
      data-slot="wallet-balance"
      className={cn(
        "wallet-deboss flex items-baseline font-semibold tracking-tight tabular-nums",
        className
      )}
      {...props}
    >
      {parts.map((part, i) => (
        <span
          key={i}
          data-part={part.type}
          className={cn(
            "text-4xl leading-none",
            part.type === "currency" && "mr-0.5 self-start pt-1 text-xl text-(--wallet-muted-foreground)",
            isDecimal(part.type) && "text-xl text-(--wallet-muted-foreground)",
            part.type === "literal" && "text-xl",
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
function WalletAmount({
  value,
  currency,
  locale,
  format,
  className,
  ...props
}: AmountFormat & Omit<React.ComponentProps<"span">, "children">) {
  const parts = useAmountParts({ value, currency, locale, format })
  return (
    <span data-slot="wallet-amount" className={cn("tabular-nums", className)} {...props}>
      {parts.map((part) => part.value).join("")}
    </span>
  )
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
      className={cn("wallet-deboss flex items-baseline justify-between gap-4", className)}
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
  return (
    <dd data-slot="wallet-detail-value" className={cn("font-medium tabular-nums", className)} {...props} />
  )
}

function WalletSeparator({ className, ...props }: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      data-slot="wallet-separator"
      className={cn("wallet-stitch -mx-1 border-t-[1.5px]", className)}
      {...props}
    />
  )
}

function WalletMeter({ className, children, ...props }: MeterPrimitive.Root.Props) {
  return (
    <MeterPrimitive.Root
      data-slot="wallet-meter"
      className={cn(
        "grid grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-2",
        "group-data-[status=low]/wallet:[--wallet-fill:var(--wallet-low)]",
        "group-data-[status=empty]/wallet:[--wallet-fill:var(--wallet-danger)] group-data-[status=insufficient]/wallet:[--wallet-fill:var(--wallet-danger)]",
        className
      )}
      {...props}
    >
      {children}
      <MeterPrimitive.Track
        data-slot="wallet-meter-track"
        className="wallet-groove col-span-full h-2 overflow-hidden rounded-full p-px"
      >
        <MeterPrimitive.Indicator
          data-slot="wallet-meter-indicator"
          className="wallet-fill h-full rounded-full forced-colors:bg-[Highlight]"
        />
      </MeterPrimitive.Track>
    </MeterPrimitive.Root>
  )
}

function WalletMeterLabel({ className, ...props }: MeterPrimitive.Label.Props) {
  return (
    <MeterPrimitive.Label
      data-slot="wallet-meter-label"
      className={cn("wallet-deboss text-sm text-(--wallet-muted-foreground)", className)}
      {...props}
    />
  )
}

function WalletMeterValue({ className, ...props }: MeterPrimitive.Value.Props) {
  return (
    <MeterPrimitive.Value
      data-slot="wallet-meter-value"
      className={cn("wallet-deboss text-sm font-medium tabular-nums", className)}
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
        "wallet-raised wallet-deboss inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium text-(--wallet-foreground) outline-none select-none",
        "transition-[translate,box-shadow] duration-100 ease-out motion-reduce:transition-none",
        "active:translate-y-0.5 active:wallet-sunken data-pressed:translate-y-0.5 data-pressed:wallet-sunken",
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
  WalletCardBrand,
  WalletCardNumber,
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
export type { WalletProps, WalletCardsProps, WalletCardProps, WalletVariant, WalletStatus as WalletStatusValue }
