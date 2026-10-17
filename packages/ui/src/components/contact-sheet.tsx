"use client"

import * as React from "react"
import { cn } from "cn"

type Mark = "pick" | "reject"

type ContactSheetContextValue = {
  ids: string[]
  register: (id: string) => () => void
  marks: Record<string, Mark>
  setMark: (id: string, mark: Mark | null) => void
  focused: string | undefined
  setFocused: (id: string) => void
  move: (from: string, key: string) => void
}

const ContactSheetContext = React.createContext<ContactSheetContextValue | null>(null)

function useContactSheet() {
  const context = React.useContext(ContactSheetContext)
  if (!context) throw new Error("ContactSheet parts must be inside <ContactSheet>")
  return context
}

type ContactSheetProps = Omit<React.ComponentProps<"div">, "defaultValue"> & {
  /** Marks by frame id. Unmarked frames are left out. */
  value?: Record<string, Mark>
  defaultValue?: Record<string, Mark>
  onValueChange?: (value: Record<string, Mark>) => void
  /** Frames per row. Arrow keys move by row with it. */
  columns?: number
}

/**
 * A contact sheet: every frame at once, marked with a grease pencil.
 * Circle the keepers, cross out the rest. Arrow keys move between frames;
 * P picks, X rejects, Backspace clears, Enter cycles. Give it an aria-label.
 */
function ContactSheet({
  className,
  value,
  defaultValue = {},
  onValueChange,
  columns = 4,
  style,
  children,
  ...props
}: ContactSheetProps) {
  const [ids, setIds] = React.useState<string[]>([])
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const [focused, setFocused] = React.useState<string>()
  const marks = value ?? uncontrolled
  const frames = React.useRef<HTMLDivElement>(null)

  const register = React.useCallback((id: string) => {
    setIds((all) => (all.includes(id) ? all : [...all, id]))
    return () => setIds((all) => all.filter((x) => x !== id))
  }, [])
  const setMark = React.useCallback(
    (id: string, mark: Mark | null) => {
      const next = { ...marks }
      if (mark) next[id] = mark
      else delete next[id]
      setUncontrolled(next)
      onValueChange?.(next)
    },
    [marks, onValueChange]
  )
  const move = React.useCallback(
    (from: string, key: string) => {
      const i = ids.indexOf(from)
      const steps: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: columns, ArrowUp: -columns }
      const to = key === "Home" ? 0 : key === "End" ? ids.length - 1 : i + (steps[key] ?? 0)
      const id = ids[to]
      if (to < 0 || !id) return
      setFocused(id)
      frames.current?.querySelector<HTMLElement>(`[data-frame-id="${CSS.escape(id)}"]`)?.focus()
    },
    [ids, columns]
  )

  const context = React.useMemo(
    () => ({ ids, register, marks, setMark, focused: focused ?? ids[0], setFocused, move }),
    [ids, register, marks, setMark, focused, move]
  )
  const picked = Object.values(marks).filter((m) => m === "pick").length
  return (
    <ContactSheetContext value={context}>
      <div
        role="group"
        data-slot="contact-sheet"
        className={cn("bevel-paper flex w-full flex-col gap-2 rounded-(--bevel-radius-xs) p-3", className)}
        style={{ "--contact-sheet-columns": columns, ...style } as React.CSSProperties}
        {...props}
      >
        <div
          ref={frames}
          className="grid grid-cols-[repeat(var(--contact-sheet-columns),minmax(0,1fr))] gap-y-2 bg-(--contact-sheet-film) px-1 py-4 shadow-(--bevel-depth-sheet)"
        >
          {children}
        </div>
        <p role="status" className="text-xs text-(--bevel-paper-muted)">
          {picked} picked of {ids.length}
        </p>
      </div>
    </ContactSheetContext>
  )
}

type ContactSheetFrameProps = Omit<React.ComponentProps<"button">, "id"> & {
  id: string
  /** What's in the frame, for its name: “Dunes at dusk”. */
  label: string
}

/** One frame. Its picture is the children. */
function ContactSheetFrame({ className, id, label, children, onKeyDown, onFocus, ...props }: ContactSheetFrameProps) {
  const { ids, register, marks, setMark, focused, setFocused, move } = useContactSheet()
  React.useEffect(() => register(id), [id, register])
  const mark = marks[id]
  const number = ids.indexOf(id) + 1
  const cycle: Record<string, Mark | null> = { none: "pick", pick: "reject", reject: null }
  return (
    <button
      type="button"
      data-slot="contact-sheet-frame"
      data-frame-id={id}
      data-mark={mark}
      tabIndex={focused === id ? 0 : -1}
      aria-keyshortcuts="P X Backspace"
      onFocus={(event) => {
        onFocus?.(event)
        setFocused(id)
      }}
      onClick={() => setMark(id, cycle[mark ?? "none"]!)}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        const key = event.key.toLowerCase()
        if (key === "p") setMark(id, mark === "pick" ? null : "pick")
        else if (key === "x") setMark(id, mark === "reject" ? null : "reject")
        else if (event.key === "Backspace" || event.key === "Delete") setMark(id, null)
        else if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) move(id, event.key)
        else return
        event.preventDefault()
      }}
      className={cn(
        "group/frame relative flex flex-col gap-1 px-1 text-left outline-none",
        "focus-visible:ring-2 focus-visible:ring-(--contact-sheet-sprocket)",
        className
      )}
      {...props}
    >
      {/* Sprocket holes above and below, as on 35mm film. */}
      <span aria-hidden className="absolute inset-x-1 -top-3 flex justify-around">
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i} className="h-1.5 w-1 rounded-(--bevel-radius-xs) bg-(--contact-sheet-sprocket) opacity-80" />
        ))}
      </span>
      <span className="relative block aspect-[3/2] overflow-hidden bg-(--bevel-shade-strong) transition-opacity duration-(--bevel-duration-small) group-data-[mark=reject]/frame:opacity-45 motion-reduce:transition-none">
        {children}
      </span>
      {/* The edge-printed frame number starts the name: “3. Dusk, low sun, picked”. */}
      <span aria-hidden className="font-mono text-(length:--bevel-fine) text-(--contact-sheet-edge-print)">
        {number}
      </span>
      <span className="sr-only">
        {`${number}. ${label}${mark === "pick" ? ", picked" : mark === "reject" ? ", rejected" : ""}`}
      </span>
      {/* Grease pencil: a loose circle to keep, a cross to drop. */}
      <svg
        aria-hidden
        viewBox="0 0 100 70"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 -top-1 aspect-[3/2] w-full overflow-visible"
      >
        <path
          d="M14 38 C10 14 40 4 62 7 C88 10 96 30 88 50 C80 66 40 70 22 60 C10 53 8 40 18 30"
          fill="none"
          stroke="var(--contact-sheet-pick)"
          strokeWidth="4"
          strokeLinecap="round"
          className="origin-center scale-90 opacity-0 transition-[opacity,scale] duration-(--bevel-duration-small) ease-(--bevel-ease-out) group-data-[mark=pick]/frame:scale-100 group-data-[mark=pick]/frame:opacity-100 motion-reduce:transition-none"
        />
        <path
          d="M18 12 L84 60 M82 10 L20 62"
          fill="none"
          stroke="var(--contact-sheet-reject)"
          strokeWidth="4"
          strokeLinecap="round"
          className="origin-center scale-90 opacity-0 transition-[opacity,scale] duration-(--bevel-duration-small) ease-(--bevel-ease-out) group-data-[mark=reject]/frame:scale-100 group-data-[mark=reject]/frame:opacity-90 motion-reduce:transition-none"
        />
      </svg>
    </button>
  )
}

export { ContactSheet, ContactSheetFrame }
export type { ContactSheetProps, ContactSheetFrameProps }
