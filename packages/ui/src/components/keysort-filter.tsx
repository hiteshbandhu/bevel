"use client"

import * as React from "react"
import { Toggle } from "@base-ui/react/toggle"
import { cn } from "cn"

type Needle = { value: string; label: string }

type KeysortFilterContextValue = {
  needles: Needle[]
  registerNeedle: (needle: Needle) => () => void
  selected: string[]
  toggle: (value: string, on: boolean) => void
  cards: Record<string, string[]>
  registerCard: (id: string, notches: string[]) => () => void
}

const KeysortFilterContext = React.createContext<KeysortFilterContextValue | null>(null)

function useKeysortFilter() {
  const context = React.useContext(KeysortFilterContext)
  if (!context) throw new Error("KeysortFilter parts must be inside <KeysortFilter>")
  return context
}

function matches(notches: string[], selected: string[]) {
  return selected.length > 0 && selected.every((s) => notches.includes(s))
}

type KeysortFilterProps = Omit<React.ComponentProps<"div">, "defaultValue"> & {
  /** The needles pushed in, by value. */
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}

/**
 * Edge-notched cards. Each column of holes is an attribute; push needles
 * down the columns and the cards notched for all of them fall free. AND
 * filtering you can see. Give it an aria-label.
 */
function KeysortFilter({ className, value, defaultValue = [], onValueChange, style, children, ...props }: KeysortFilterProps) {
  const [needles, setNeedles] = React.useState<Needle[]>([])
  const [cards, setCards] = React.useState<Record<string, string[]>>({})
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const selected = value ?? uncontrolled

  const registerNeedle = React.useCallback((needle: Needle) => {
    // Needles keep the order they mounted in, which is their column order.
    setNeedles((all) =>
      all.some((n) => n.value === needle.value)
        ? all.map((n) => (n.value === needle.value ? needle : n))
        : [...all, needle]
    )
    return () => setNeedles((all) => all.filter((n) => n.value !== needle.value))
  }, [])
  const registerCard = React.useCallback((id: string, notches: string[]) => {
    setCards((all) => ({ ...all, [id]: notches }))
    return () =>
      setCards((all) => {
        const next = { ...all }
        delete next[id]
        return next
      })
  }, [])
  const toggle = React.useCallback(
    (needle: string, on: boolean) => {
      const next = on ? [...selected.filter((s) => s !== needle), needle] : selected.filter((s) => s !== needle)
      setUncontrolled(next)
      onValueChange?.(next)
    },
    [selected, onValueChange]
  )

  const context = React.useMemo(
    () => ({ needles, registerNeedle, selected, toggle, cards, registerCard }),
    [needles, registerNeedle, selected, toggle, cards, registerCard]
  )
  return (
    <KeysortFilterContext value={context}>
      <div
        role="group"
        data-slot="keysort-filter"
        data-sorting={selected.length ? "" : undefined}
        className={cn(
          "grid w-full grid-cols-[minmax(6rem,1fr)_repeat(var(--keysort-filter-needles),var(--keysort-filter-column))] gap-y-3",
          className
        )}
        style={{ "--keysort-filter-needles": Math.max(needles.length, 1), ...style } as React.CSSProperties}
        {...props}
      >
        {children}
      </div>
    </KeysortFilterContext>
  )
}

/** The needle handles, one above each column of holes. */
function KeysortFilterNeedles({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="group"
      aria-label="Needles"
      data-slot="keysort-filter-needles"
      className={cn("col-span-full grid grid-cols-subgrid items-end", className)}
      {...props}
    >
      <span aria-hidden />
      {children}
    </div>
  )
}

type KeysortFilterNeedleProps = Omit<Toggle.Props, "value" | "children" | "pressed"> & {
  value: string
  /** The attribute's name. Keep it to a word or two. */
  children: string
}

/** One needle: a toggle. Pushed in, it catches every card not notched for it. */
function KeysortFilterNeedle({ className, value, children, ...props }: KeysortFilterNeedleProps) {
  const { registerNeedle, selected, toggle } = useKeysortFilter()
  React.useEffect(() => registerNeedle({ value, label: children }), [value, children, registerNeedle])
  return (
    <Toggle
      data-slot="keysort-filter-needle"
      pressed={selected.includes(value)}
      onPressedChange={(on) => toggle(value, on)}
      className={cn(
        "group/needle flex flex-col items-center gap-1 rounded-(--bevel-radius-sm) px-0.5 pb-1 text-center text-(length:--bevel-fine) leading-tight sm:text-xs font-medium outline-none",
        "focus-visible:ring-3 focus-visible:ring-ring/60 data-pressed:font-semibold",
        className
      )}
      {...props}
    >
      {children}
      {/* The ring handle: it sinks as the needle goes in. */}
      <span
        aria-hidden
        className="bevel-metal size-4 rounded-full border-3 border-(--keysort-filter-needle-edge) bg-transparent transition-[translate] duration-(--bevel-duration-small) ease-(--bevel-ease-spring) group-data-pressed/needle:translate-y-1.5 motion-reduce:transition-none"
      />
    </Toggle>
  )
}

/** The deck. The needles run down it, behind the cards. */
function KeysortFilterDeck({ className, children, ...props }: React.ComponentProps<"ul">) {
  const { needles, selected } = useKeysortFilter()
  return (
    <ul
      data-slot="keysort-filter-deck"
      className={cn("relative col-span-full grid grid-cols-subgrid gap-y-1.5", className)}
      {...props}
    >
      {needles.map((n, i) => (
        <span
          key={n.value}
          aria-hidden
          data-in={selected.includes(n.value) ? "" : undefined}
          className="bevel-metal pointer-events-none absolute -top-2 bottom-0 w-1 origin-top scale-y-0 rounded-full transition-[scale] duration-(--bevel-duration-move) ease-(--bevel-ease-out) data-in:scale-y-100 motion-reduce:transition-none"
          style={{ right: `calc(var(--keysort-filter-column) * ${needles.length - 1 - i} + var(--keysort-filter-column) / 2 - var(--spacing) / 2)` }}
        />
      ))}
      {children}
    </ul>
  )
}

type KeysortFilterCardProps = React.ComponentProps<"li"> & {
  /** The attributes this card has: their holes are notched open. */
  notches: string[]
}

/** One card. It falls free when it's notched for every needle in, and says so. */
function KeysortFilterCard({ className, notches, children, ...props }: KeysortFilterCardProps) {
  const { needles, selected, registerCard } = useKeysortFilter()
  const id = React.useId()
  const key = notches.join("\u0000")
  React.useEffect(() => registerCard(id, key ? key.split("\u0000") : []), [id, key, registerCard])
  const match = matches(notches, selected)
  return (
    <li
      data-slot="keysort-filter-card"
      data-card={selected.length === 0 ? undefined : match ? "match" : "held"}
      className={cn(
        "bevel-paper relative col-span-full grid grid-cols-subgrid items-center rounded-(--bevel-radius-xs) bg-(--keysort-filter-card) py-2 text-(--keysort-filter-card-foreground)",
        "data-[card=held]:bg-(--keysort-filter-card-held) data-[card=held]:shadow-none",
        className
      )}
      {...props}
    >
      <span className="flex min-w-0 items-center gap-2 pl-3">
        {/* A tab marks the cards that fell free. */}
        <span
          aria-hidden
          className="h-4 w-1 shrink-0 scale-y-0 rounded-full bg-(--keysort-filter-match) transition-[scale] duration-(--bevel-duration-small) ease-(--bevel-ease-spring) in-data-[card=match]:scale-y-100 motion-reduce:transition-none"
        />
        <span className="line-clamp-2 text-sm leading-tight font-semibold">{children}</span>
        <span className="sr-only">{match ? "Matches." : ""}</span>
      </span>
      {needles.map((n) => {
        const notched = notches.includes(n.value)
        const caught = selected.includes(n.value) && !notched
        return (
          <span key={n.value} aria-hidden className="relative flex h-full justify-center">
            {/* A notched hole is cut open to the top edge; a caught card has the needle through its hole. */}
            {notched ? (
              <span className="absolute -top-2 h-4 w-2.5 rounded-b-full bg-(--keysort-filter-hole)" />
            ) : (
              <span className={cn("size-2.5 rounded-full", caught ? "bevel-metal" : "bg-(--keysort-filter-hole)")} />
            )}
          </span>
        )
      })}
    </li>
  )
}

/** “3 of 12 cards match NDA and Signed.” Announced as needles go in and out. */
function KeysortFilterCount({ className, ...props }: React.ComponentProps<"p">) {
  const { needles, selected, cards } = useKeysortFilter()
  const all = Object.values(cards)
  const count = all.filter((n) => matches(n, selected)).length
  const names = selected.map((s) => needles.find((n) => n.value === s)?.label ?? s)
  const list = names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names[0]
  return (
    <p
      role="status"
      data-slot="keysort-filter-count"
      className={cn("col-span-full text-sm text-muted-foreground", className)}
      {...props}
    >
      {selected.length === 0
        ? `${all.length} cards. Push a needle in to sort.`
        : `${count} of ${all.length} cards match ${list}.`}
    </p>
  )
}

export { KeysortFilter, KeysortFilterNeedles, KeysortFilterNeedle, KeysortFilterDeck, KeysortFilterCard, KeysortFilterCount }
export type { KeysortFilterProps, KeysortFilterNeedleProps, KeysortFilterCardProps }
