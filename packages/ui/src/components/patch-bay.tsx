"use client"

import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cn } from "cn"
import { useBevelFeedback } from "@workspace/ui/lib/feedback"

/** One patch: a source jack's value, then a destination jack's value. */
type PatchBayRoute = [from: string, to: string]
type PatchBaySide = "source" | "destination"

type Jack = { side: PatchBaySide; value: string; label: string }
type Point = { x: number; y: number }

type PatchBayContextValue = {
  routes: PatchBayRoute[]
  jacks: Jack[]
  rows: Record<PatchBaySide, string>
  armed: { side: PatchBaySide; value: string } | null
  disabled: boolean
  sockets: React.RefObject<Map<string, HTMLElement>>
  press: (side: PatchBaySide, value: string) => void
  pull: (side: PatchBaySide, value: string) => void
  remove: (route: PatchBayRoute) => void
  register: (jack: Jack, socket: HTMLElement) => () => void
  registerRow: (side: PatchBaySide, label: string) => () => void
  setListed: (listed: boolean) => void
  labelOf: (side: PatchBaySide, value: string) => string
}

const PatchBayContext = React.createContext<PatchBayContextValue | null>(null)

function usePatchBay() {
  const context = React.useContext(PatchBayContext)
  if (!context) throw new Error("PatchBay parts must be inside <PatchBay>")
  return context
}

const keyOf = (side: PatchBaySide, value: string) => `${side}:${value}`
const same = (a: PatchBayRoute, b: PatchBayRoute) => a[0] === b[0] && a[1] === b[1]

function list(names: string[]) {
  if (names.length < 2) return names.join("")
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`
}

type PatchBayProps = Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> & {
  /** Current patches, as [source, destination] pairs. */
  value?: PatchBayRoute[]
  defaultValue?: PatchBayRoute[]
  onValueChange?: (value: PatchBayRoute[]) => void
  disabled?: boolean
}

/**
 * A patch bay: route sources to destinations with cables. Press a jack,
 * then a jack in the other row, to patch them; patch the same pair again to
 * pull the cable. A source can feed many destinations and a destination
 * can take many sources. Put the rows in a PatchBayPanel. Give it an aria-label.
 */
function PatchBay({
  className,
  value: valueProp,
  defaultValue = [],
  onValueChange,
  disabled = false,
  children,
  ...props
}: PatchBayProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const routes = valueProp ?? uncontrolled
  const [jacks, setJacks] = React.useState<Jack[]>([])
  const [rows, setRows] = React.useState<Record<PatchBaySide, string>>({ source: "sources", destination: "destinations" })
  const [armed, setArmed] = React.useState<PatchBayContextValue["armed"]>(null)
  const [announcement, setAnnouncement] = React.useState("")
  const [listed, setListed] = React.useState(false)
  const sockets = React.useRef(new Map<string, HTMLElement>())
  const feedback = useBevelFeedback()

  const labelOf = React.useCallback(
    (side: PatchBaySide, value: string) => jacks.find((j) => j.side === side && j.value === value)?.label ?? value,
    [jacks]
  )

  const commit = React.useCallback(
    (next: PatchBayRoute[]) => {
      if (valueProp === undefined) setUncontrolled(next)
      onValueChange?.(next)
    },
    [valueProp, onValueChange]
  )

  const remove = React.useCallback(
    (route: PatchBayRoute) => {
      commit(routes.filter((r) => !same(r, route)))
      feedback.click()
      setAnnouncement(`Unpatched ${labelOf("source", route[0])} from ${labelOf("destination", route[1])}.`)
    },
    [commit, routes, feedback, labelOf]
  )

  const press = React.useCallback(
    (side: PatchBaySide, value: string) => {
      if (disabled) return
      if (!armed || armed.side === side) {
        if (armed?.value === value) {
          setArmed(null)
          setAnnouncement("Cancelled.")
          return
        }
        setArmed({ side, value })
        feedback.click()
        const other: PatchBaySide = side === "source" ? "destination" : "source"
        setAnnouncement(`Selected ${labelOf(side, value)}. Now choose one of the ${rows[other]}.`)
        return
      }
      const route: PatchBayRoute = side === "destination" ? [armed.value, value] : [value, armed.value]
      setArmed(null)
      if (routes.some((r) => same(r, route))) {
        remove(route)
        return
      }
      commit([...routes, route])
      feedback.thunk()
      setAnnouncement(`Patched ${labelOf("source", route[0])} to ${labelOf("destination", route[1])}.`)
    },
    [disabled, armed, routes, commit, remove, feedback, labelOf, rows]
  )

  const pull = React.useCallback(
    (side: PatchBaySide, value: string) => {
      if (disabled) return
      const index = side === "source" ? 0 : 1
      const pulled = routes.filter((r) => r[index] === value)
      if (!pulled.length) return
      commit(routes.filter((r) => r[index] !== value))
      feedback.click()
      setAnnouncement(`Unpatched ${labelOf(side, value)}: ${pulled.length} cable${pulled.length === 1 ? "" : "s"}.`)
    },
    [disabled, routes, commit, feedback, labelOf]
  )

  const register = React.useCallback((jack: Jack, socket: HTMLElement) => {
    const key = keyOf(jack.side, jack.value)
    sockets.current.set(key, socket)
    setJacks((all) =>
      all.some((j) => keyOf(j.side, j.value) === key)
        ? all.map((j) => (keyOf(j.side, j.value) === key ? jack : j))
        : [...all, jack]
    )
    return () => {
      sockets.current.delete(key)
      setJacks((all) => all.filter((j) => keyOf(j.side, j.value) !== key))
    }
  }, [])

  const registerRow = React.useCallback((side: PatchBaySide, label: string) => {
    setRows((r) => ({ ...r, [side]: label }))
    return () => setRows((r) => ({ ...r, [side]: side === "source" ? "sources" : "destinations" }))
  }, [])

  const context = React.useMemo(
    () => ({ routes, jacks, rows, armed, disabled, sockets, press, pull, remove, register, registerRow, setListed, labelOf }),
    [routes, jacks, rows, armed, disabled, press, pull, remove, register, registerRow, labelOf]
  )

  return (
    <PatchBayContext value={context}>
      <div
        role="group"
        data-slot="patch-bay"
        data-armed={armed ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        onKeyDown={(event) => {
          if (event.key === "Escape" && armed) {
            setArmed(null)
            setAnnouncement("Cancelled.")
          }
        }}
        className={cn(
          "flex w-full flex-col gap-4 data-disabled:opacity-60",
          className
        )}
        {...props}
      >
        {children}
        <p role="status" className="sr-only">
          {announcement}
        </p>
        {!listed && (
          <ul aria-label="Routes" className="sr-only">
            {routes.length ? (
              routes.map((route) => (
                <li key={route.join("\u0000")}>
                  {labelOf("source", route[0])} to {labelOf("destination", route[1])}
                </li>
              ))
            ) : (
              <li>No routes</li>
            )}
          </ul>
        )}
      </div>
    </PatchBayContext>
  )
}

/** The rack panel: the rows of jacks, and the cables drawn between them. */
function PatchBayPanel({ className, children, ...props }: React.ComponentProps<"div">) {
  const { routes, jacks, sockets } = usePatchBay()
  const panel = React.useRef<HTMLDivElement>(null)
  const [points, setPoints] = React.useState<Record<string, Point>>({})

  // Where each socket sits, so the cables can be drawn between them.
  const measure = React.useCallback(() => {
    const box = panel.current?.getBoundingClientRect()
    if (!box) return
    const next: Record<string, Point> = {}
    for (const [key, el] of sockets.current) {
      const r = el.getBoundingClientRect()
      next[key] = { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 }
    }
    setPoints(next)
  }, [sockets])
  React.useLayoutEffect(measure, [measure, jacks])
  React.useEffect(() => {
    const el = panel.current
    if (!el) return
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    void document.fonts?.ready.then(measure)
    return () => observer.disconnect()
  }, [measure])

  const sources = jacks.filter((j) => j.side === "source")
  return (
    <div
      ref={panel}
      data-slot="patch-bay-panel"
      className={cn(
        "bevel-metal bevel-object relative flex w-full flex-col gap-(--patch-bay-row-gap) rounded-(--bevel-radius-md) p-4 text-(--patch-bay-print)",
        className
      )}
      {...props}
    >
      {children}
      <svg aria-hidden data-slot="patch-bay-cables" className="pointer-events-none absolute inset-0 size-full overflow-visible">
        {routes.map((route) => {
          const a = points[keyOf("source", route[0])]
          const b = points[keyOf("destination", route[1])]
          if (!a || !b) return null
          const colour = Math.max(0, sources.findIndex((s) => s.value === route[0])) % 6
          // The cable drops out of the source, hangs, and comes down into the destination.
          const dy = Math.abs(b.y - a.y)
          const span = Math.abs(b.x - a.x)
          const d = `M ${a.x} ${a.y} C ${a.x} ${a.y + dy * 0.9 + span * 0.08}, ${b.x} ${b.y - dy * 0.2}, ${b.x} ${b.y}`
          return (
            <g
              key={route.join("\u0000")}
              data-slot="patch-bay-cable"
              className="transition-opacity duration-(--bevel-duration-small) ease-(--bevel-ease-out) starting:opacity-0 motion-reduce:transition-none"
              style={{ ["--patch-bay-cable" as string]: `var(--patch-bay-cable-${colour + 1})` }}
            >
              <path d={d} className="patch-bay-cable-shadow" />
              <path d={d} className="patch-bay-cable-body" />
              <circle cx={a.x} cy={a.y} className="patch-bay-plug" />
              <circle cx={b.x} cy={b.y} className="patch-bay-plug" />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

const RowContext = React.createContext<PatchBaySide>("source")

type PatchBayRowProps = React.ComponentProps<"div"> & {
  side: PatchBaySide
  /** Names the row, e.g. “Events” or “Handlers”. */
  label: string
}

/** A row of jacks. Sources sit on top with labels above; destinations below with labels underneath. */
function PatchBayRow({ className, side, label, children, ...props }: PatchBayRowProps) {
  const { registerRow } = usePatchBay()
  React.useEffect(() => registerRow(side, label), [side, label, registerRow])
  return (
    <RowContext value={side}>
      <div
        role="group"
        aria-label={label}
        data-slot="patch-bay-row"
        data-side={side}
        className={cn("flex flex-col gap-2 data-[side=destination]:flex-col-reverse", className)}
        {...props}
      >
        <span
          aria-hidden
          className="bevel-deboss text-(length:--bevel-fine) font-semibold tracking-(--bevel-tracking-label) uppercase"
        >
          {label}
        </span>
        <div className="flex justify-around gap-1.5">
          {children}
        </div>
      </div>
    </RowContext>
  )
}

type PatchBayJackProps = Omit<ButtonPrimitive.Props, "value" | "children"> & {
  value: string
  /** The jack's name, printed on its designation strip. */
  children: string
}

/**
 * One jack: a button named by its label and described by what it's patched
 * to. Press it to pick it up; Delete or Backspace pulls all its cables.
 */
function PatchBayJack({ className, value, children, onClick, onKeyDown, ...props }: PatchBayJackProps) {
  const { routes, armed, disabled, press, pull, register, labelOf } = usePatchBay()
  const side = React.useContext(RowContext)
  const socket = React.useRef<HTMLSpanElement>(null)
  const descriptionId = React.useId()
  React.useEffect(() => {
    if (!socket.current) return
    return register({ side, value, label: children }, socket.current)
  }, [side, value, children, register])

  const index = side === "source" ? 0 : 1
  const mine = routes.filter((r) => r[index] === value)
  const others = mine.map((r) => (side === "source" ? labelOf("destination", r[1]) : labelOf("source", r[0])))
  const isArmed = armed?.side === side && armed.value === value
  const description = others.length
    ? `${side === "source" ? "Patched to" : "Patched from"} ${list(others)}.`
    : "Not patched."

  return (
    <span data-slot="patch-bay-position" className="flex max-w-(--patch-bay-jack-width) min-w-0 flex-1 flex-col items-center gap-1.5 in-data-[side=destination]:flex-col-reverse">
      <span
        data-slot="patch-bay-label"
        aria-hidden
        className="bevel-paper flex h-(--patch-bay-label-height) w-full items-center justify-center overflow-hidden rounded-(--bevel-radius-xs) px-0.5 text-center text-(length:--bevel-fine) leading-tight font-semibold [overflow-wrap:anywhere]"
      >
        {/* Let dotted and snake_case names break at their separators. */}
        <span className="line-clamp-2">{children.replace(/([._/])/g, "$1\u200b")}</span>
      </span>
      <ButtonPrimitive
        data-slot="patch-bay-jack"
        data-side={side}
        data-patched={mine.length ? "" : undefined}
        aria-pressed={isArmed}
        aria-describedby={descriptionId}
        disabled={disabled}
        onClick={(event) => {
          onClick?.(event)
          press(side, value)
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (event.key === "Delete" || event.key === "Backspace") {
            event.preventDefault()
            pull(side, value)
          }
        }}
        className={cn(
          "group/jack grid size-(--patch-bay-jack-size) cursor-pointer place-items-center rounded-full outline-none",
          "focus-visible:ring-3 focus-visible:ring-(--patch-bay-focus)/70 data-disabled:cursor-not-allowed",
          className
        )}
        {...props}
      >
        <span className="sr-only">{children}</span>
        <span
          ref={socket}
          aria-hidden
          className={cn(
            "patch-bay-socket grid size-full place-items-center rounded-full",
            "transition-[scale,filter] duration-(--bevel-duration-press) ease-(--bevel-ease-out) group-active/jack:scale-95 motion-reduce:transition-none",
            "group-aria-pressed/jack:patch-bay-socket-armed"
          )}
        >
          <span className="patch-bay-hole size-(--patch-bay-hole-size) rounded-full" />
        </span>
      </ButtonPrimitive>
      <span id={descriptionId} hidden>
        {description}
      </span>
    </span>
  )
}

/** A visible list of patches, each with a button to pull it. Replaces the built-in screen-reader list. */
function PatchBayRoutes({ className, ...props }: React.ComponentProps<"ul">) {
  const { routes, remove, setListed, labelOf, disabled } = usePatchBay()
  React.useEffect(() => {
    setListed(true)
    return () => setListed(false)
  }, [setListed])
  return (
    <ul aria-label="Routes" data-slot="patch-bay-routes" className={cn("flex flex-col gap-1 text-sm", className)} {...props}>
      {routes.length === 0 && <li className="text-muted-foreground">No routes yet.</li>}
      {routes.map((route) => {
        const from = labelOf("source", route[0])
        const to = labelOf("destination", route[1])
        return (
          <li key={route.join("\u0000")} className="flex items-center justify-between gap-3">
            <span className="min-w-0 truncate">
              {from} <span aria-hidden>→</span>
              <span className="sr-only">to</span> {to}
            </span>
            <ButtonPrimitive
              data-slot="patch-bay-remove"
              aria-label={`Unpatch ${from} from ${to}`}
              disabled={disabled}
              onClick={() => remove(route)}
              className="shrink-0 rounded-(--bevel-radius-xs) px-2 py-0.5 text-xs font-medium text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-disabled:opacity-50"
            >
              Unpatch
            </ButtonPrimitive>
          </li>
        )
      })}
    </ul>
  )
}

export { PatchBay, PatchBayPanel, PatchBayRow, PatchBayJack, PatchBayRoutes }
export type { PatchBayProps, PatchBayRowProps, PatchBayJackProps, PatchBayRoute, PatchBaySide }
