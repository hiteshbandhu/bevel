"use client"

import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cn } from "cn"

type Selections = Record<string, string[]>

type BallotContextValue = {
  selections: Selections
  toggle: (race: string, value: string, max: number) => void
  commit: () => void
  committed: number | null
}

const BallotContext = React.createContext<BallotContextValue | null>(null)
const RaceContext = React.createContext<{ name: string; max: number } | null>(null)

function useBallot() {
  const context = React.useContext(BallotContext)
  if (!context) throw new Error("Ballot parts must be inside <BallotBoard>")
  return context
}

type BallotBoardProps = Omit<React.ComponentProps<"div">, "onSubmit"> & {
  /** Every choice, by race, at the moment the commit lever is pulled. */
  onCommit?: (selections: Selections) => void
}

/**
 * Many choices, one commit. Nothing counts until the big lever is pulled;
 * then the board resets. Races refuse choices past their limit.
 */
function BallotBoard({ className, onCommit, children, ...props }: BallotBoardProps) {
  const [selections, setSelections] = React.useState<Selections>({})
  const [committed, setCommitted] = React.useState<number | null>(null)

  const context = React.useMemo<BallotContextValue>(
    () => ({
      selections,
      committed,
      toggle: (race, value, max) => {
        setCommitted(null)
        setSelections((all) => {
          const current = all[race] ?? []
          if (current.includes(value)) return { ...all, [race]: current.filter((v) => v !== value) }
          if (max === 1) return { ...all, [race]: [value] }
          if (current.length >= max) return all
          return { ...all, [race]: [...current, value] }
        })
      },
      commit: () => {
        const count = Object.values(selections).reduce((n, v) => n + v.length, 0)
        onCommit?.(selections)
        setCommitted(count)
        setSelections({})
      },
    }),
    [selections, committed, onCommit]
  )

  return (
    <BallotContext value={context}>
      <div
        data-slot="ballot-board"
        className={cn(
          "bevel-metal bevel-object flex w-full max-w-md flex-col gap-4 rounded-(--bevel-radius-md) p-5 text-(--bevel-ivory)",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </BallotContext>
  )
}

type BallotRaceProps = React.ComponentProps<"fieldset"> & {
  name: string
  label: React.ReactNode
  /** How many levers may be down at once. 1 behaves like a radio group. */
  max?: number
}

/** One question. A row of levers; past the limit the rest lock. */
function BallotRace({ className, name, label, max = 1, children, ...props }: BallotRaceProps) {
  const { selections } = useBallot()
  const count = (selections[name] ?? []).length
  const labelId = React.useId()
  return (
    <RaceContext value={{ name, max }}>
      <fieldset
        data-slot="ballot-race"
        role={max === 1 ? "radiogroup" : "group"}
        aria-labelledby={labelId}
        className={cn("flex flex-col gap-2 border-0 p-0", className)}
        {...props}
      >
        <legend className="mb-2 flex w-full items-baseline justify-between gap-3 text-sm font-semibold">
          <span id={labelId}>{label}</span>
          {max > 1 && (
            <span className="text-(length:--bevel-fine) font-normal tabular-nums opacity-80">
              {count} of {max}
            </span>
          )}
        </legend>
        <div className="flex flex-wrap gap-2">{children}</div>
      </fieldset>
    </RaceContext>
  )
}

/** One lever. Flipped down, it points at its choice. */
function BallotLever({
  className,
  value,
  children,
  ...props
}: { value: string } & Omit<React.ComponentProps<"button">, "value" | "onClick">) {
  const { selections, toggle } = useBallot()
  const race = React.useContext(RaceContext)
  if (!race) throw new Error("BallotLever must be inside <BallotRace>")
  const chosen = (selections[race.name] ?? []).includes(value)
  const full = race.max > 1 && (selections[race.name] ?? []).length >= race.max
  const locked = !chosen && full
  return (
    <button
      type="button"
      role={race.max === 1 ? "radio" : "checkbox"}
      aria-checked={chosen}
      aria-disabled={locked || undefined}
      data-slot="ballot-lever"
      data-chosen={chosen ? "" : undefined}
      onClick={() => !locked && toggle(race.name, value, race.max)}
      onKeyDown={(event) => {
        // Arrow keys move between the levers of one race, as in a radio group.
        const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
        if (!step) return
        event.preventDefault()
        const levers = [
          ...(event.currentTarget.closest("[data-slot=ballot-race]")?.querySelectorAll<HTMLElement>(
            "[data-slot=ballot-lever]"
          ) ?? []),
        ]
        const i = levers.indexOf(event.currentTarget)
        levers[(i + step + levers.length) % levers.length]?.focus()
      }}
      className={cn(
        "flex min-w-24 flex-col items-center gap-2 rounded-(--bevel-radius-sm) px-2 pt-2 pb-2.5 text-sm outline-none select-none",
        "focus-visible:ring-3 focus-visible:ring-(--bevel-ivory)/50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <span aria-hidden className="bevel-recessed flex h-8 w-14 items-start justify-center rounded-full pt-1 perspective-(--bevel-perspective)">
        <span
          data-slot="ballot-lever-handle"
          className="bevel-raised block h-6 w-3 origin-bottom rounded-full transition-[rotate] duration-(--bevel-duration-small) ease-(--bevel-ease-spring) in-data-chosen:[rotate:x_var(--ballot-flip)] motion-reduce:transition-none"
        />
      </span>
      <span className={cn("leading-tight", chosen && "font-semibold")}>{children}</span>
    </button>
  )
}

/** The big lever: counts every choice and resets the board. */
function BallotCommit({ className, children, ...props }: Omit<ButtonPrimitive.Props, "onClick">) {
  const { selections, commit, committed } = useBallot()
  const count = Object.values(selections).reduce((n, v) => n + v.length, 0)
  return (
    <div className="flex items-center justify-between gap-4 border-t border-(--bevel-ivory)/15 pt-4">
      <p role="status" className="text-sm opacity-90">
        {committed !== null
          ? `Cast ${committed} choice${committed === 1 ? "" : "s"}. The board is reset.`
          : count === 0
            ? "Nothing chosen yet."
            : `${count} choice${count === 1 ? "" : "s"}, not cast yet.`}
      </p>
      <ButtonPrimitive
        data-slot="ballot-commit"
        disabled={count === 0}
        onClick={commit}
        className={cn(
          "bevel-raised h-11 shrink-0 rounded-(--bevel-radius-sm) px-5 text-sm font-black tracking-(--bevel-tracking-label) text-(--bevel-ivory) uppercase outline-none",
          "transition-[translate,box-shadow] duration-(--bevel-duration-press) ease-(--bevel-ease-out) active:translate-y-0.5 active:bevel-pressed motion-reduce:transition-none",
          "focus-visible:ring-3 focus-visible:ring-(--bevel-ivory)/50 data-disabled:cursor-not-allowed data-disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children ?? "Cast"}
      </ButtonPrimitive>
    </div>
  )
}

export { BallotBoard, BallotRace, BallotLever, BallotCommit }
export type { BallotBoardProps, BallotRaceProps }
