"use client"

import * as React from "react"
import { Checkbox } from "@base-ui/react/checkbox"
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
  /** The needles pushed through, by value. */
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}

/**
 * Edge-notched cards: each needle is an attribute, and the cards notched
 * for every needle you push through drop out of the deck. AND filtering
 * you can see. Give it an aria-label.
 */
function KeysortFilter({ className, value, defaultValue = [], onValueChange, children, ...props }: KeysortFilterProps) {
  const [needles, setNeedles] = React.useState<Needle[]>([])
  const [cards, setCards] = React.useState<Record<string, string[]>>({})
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const selected = value ?? uncontrolled

  const registerNeedle = React.useCallback((needle: Needle) => {
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
        className={cn("flex w-full flex-col gap-4", className)}
        {...props}
      >
        {children}
      </div>
    </KeysortFilterContext>
  )
}

/** The needle rack: one checkbox per attribute. */
function KeysortFilterNeedles({ className, children, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset data-slot="keysort-filter-needles" className={cn("flex flex-wrap gap-2", className)} {...props}>
      <legend className="sr-only">Needles</legend>
      {children}
    </fieldset>
  )
}

type KeysortFilterNeedleProps = Omit<Checkbox.Root.Props, "value" | "children" | "checked"> & {
  value: string
  /** The attribute's name. Keep it short. */
  children: string
}

/** One needle. Pushed through, it holds back every card not notched for it. */
function KeysortFilterNeedle({ className, value, children, ...props }: KeysortFilterNeedleProps) {
  const { registerNeedle, selected, toggle } = useKeysortFilter()
  React.useEffect(() => registerNeedle({ value, label: children }), [value, children, registerNeedle])
  const checked = selected.includes(value)
  return (
    <label className="group/needle flex cursor-pointer items-center gap-2 rounded-(--bevel-radius-sm) py-1 pr-3 pl-1 text-sm font-medium has-data-checked:font-semibold">
      <Checkbox.Root
        data-slot="keysort-filter-needle"
        checked={checked}
        onCheckedChange={(on) => toggle(value, on)}
        className={cn(
          "relative flex h-5 w-10 items-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/60",
          className
        )}
        {...props}
      >
        {/* The needle: slides in through the deck when checked. */}
        <span aria-hidden className="absolute inset-y-1.5 inset-x-0 rounded-full bg-(--bevel-material-recess) shadow-(--bevel-depth-recessed)" />
        <span
          aria-hidden
          className="bevel-metal relative h-1.5 w-7 -translate-x-2 rounded-full opacity-60 transition-[translate,opacity] duration-(--bevel-duration-small) ease-(--bevel-ease-out) group-has-data-checked/needle:translate-x-3 group-has-data-checked/needle:opacity-100 motion-reduce:transition-none"
        />
        <span aria-hidden className="bevel-metal relative -ml-1 size-2.5 rounded-full" />
      </Checkbox.Root>
      {children}
    </label>
  )
}

/** The deck. */
function KeysortFilterDeck({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="keysort-filter-deck"
      className={cn("grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3 pb-(--keysort-filter-drop)", className)}
      {...props}
    />
  )
}

type KeysortFilterCardProps = React.ComponentProps<"li"> & {
  /** The attributes this card has: their holes are notched open. */
  notches: string[]
}

/** One card. It drops when it's notched for every needle pushed through. */
function KeysortFilterCard({ className, notches, children, ...props }: KeysortFilterCardProps) {
  const { needles, selected, registerCard } = useKeysortFilter()
  const id = React.useId()
  const key = notches.join("\u0000")
  React.useEffect(() => registerCard(id, key ? key.split("\u0000") : []), [id, key, registerCard])
  const match = matches(notches, selected)
  return (
    <li
      data-slot="keysort-filter-card"
      data-card={selected.length === 0 ? undefined : match ? "dropped" : "held"}
      className={cn("relative", className)}
      {...props}
    >
      <div
        className={cn(
          "bevel-paper flex min-h-24 flex-col gap-1 rounded-(--bevel-radius-xs) bg-(--keysort-filter-card) px-2 pt-1 pb-2 text-(--keysort-filter-card-foreground)",
          "transition-[translate,opacity] duration-(--bevel-duration-move) ease-(--bevel-ease-spring) motion-reduce:transition-none",
          "in-data-[card=held]:opacity-55 in-data-[card=dropped]:translate-y-(--keysort-filter-drop)"
        )}
      >
        {/* Holes along the top edge, one per needle; notched ones are cut open to the edge. */}
        <span aria-hidden className="flex gap-1.5">
          {needles.map((n) => (
            <span
              key={n.value}
              className={cn(
                "size-2 rounded-full bg-(--keysort-filter-hole)",
                notches.includes(n.value) && "-mt-1 h-3 rounded-t-none"
              )}
            />
          ))}
        </span>
        <span className="text-sm leading-snug font-semibold">{children}</span>
        <span className="sr-only">{match ? "Matches." : ""}</span>
      </div>
      {/* The needles, through the holes of cards that stay behind. */}
      <span
        aria-hidden
        className="bevel-metal pointer-events-none absolute inset-x-0 top-1.5 h-1 rounded-full opacity-0 transition-opacity duration-(--bevel-duration-small) in-data-card:opacity-100 motion-reduce:transition-none"
      />
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
    <p role="status" data-slot="keysort-filter-count" className={cn("text-sm text-muted-foreground", className)} {...props}>
      {selected.length === 0
        ? `${all.length} cards. Push a needle through to sort.`
        : `${count} of ${all.length} cards match ${list}.`}
    </p>
  )
}

export { KeysortFilter, KeysortFilterNeedles, KeysortFilterNeedle, KeysortFilterDeck, KeysortFilterCard, KeysortFilterCount }
export type { KeysortFilterProps, KeysortFilterNeedleProps, KeysortFilterCardProps }
