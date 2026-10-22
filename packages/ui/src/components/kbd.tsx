"use client"

import * as React from "react"
import { cn } from "cn"

/* Symbols people print on keycaps: the key they stand for and a name to read aloud. */
const symbols: Record<string, { key: string; name: string }> = {
  "⌘": { key: "Meta", name: "Command" },
  "⌥": { key: "Alt", name: "Option" },
  "⇧": { key: "Shift", name: "Shift" },
  "⌃": { key: "Control", name: "Control" },
  "↵": { key: "Enter", name: "Enter" },
  "⏎": { key: "Enter", name: "Return" },
  "⌫": { key: "Backspace", name: "Delete" },
  "⎋": { key: "Escape", name: "Escape" },
  "⇥": { key: "Tab", name: "Tab" },
  "↑": { key: "ArrowUp", name: "Up arrow" },
  "↓": { key: "ArrowDown", name: "Down arrow" },
  "←": { key: "ArrowLeft", name: "Left arrow" },
  "→": { key: "ArrowRight", name: "Right arrow" },
}

/* Words people print, mapped to KeyboardEvent.key. */
const aliases: Record<string, string> = {
  cmd: "meta",
  command: "meta",
  ctrl: "control",
  option: "alt",
  opt: "alt",
  esc: "escape",
  return: "enter",
  space: " ",
  del: "delete",
}

function isApple() {
  return typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
}

/** A key name as the store records it: lowercase KeyboardEvent.key, with mod resolved per platform. */
function normalize(key: string) {
  const lower = key.toLowerCase()
  if (lower === "mod") return isApple() ? "meta" : "control"
  return aliases[lower] ?? lower
}

/*
 * One keyboard listener for the page, shared by every listening cap. It
 * records the keys held down by both key and physical code, so ⇧K and ⌥K
 * still press the K cap.
 */
const held = new Set<string>()
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function isTyping(target: EventTarget | null) {
  return (
    target instanceof Element &&
    target.closest("input, textarea, select, [contenteditable='true'], [contenteditable='']") !== null
  )
}

function names(event: KeyboardEvent) {
  const out = [event.key.toLowerCase()]
  const code = /^(?:Key|Digit)(.)$/.exec(event.code)
  if (code?.[1]) out.push(code[1].toLowerCase())
  return out
}

function onKeyDown(event: KeyboardEvent) {
  if (isTyping(event.target)) return
  let changed = false
  for (const name of names(event)) {
    if (!held.has(name)) {
      held.add(name)
      changed = true
    }
  }
  if (changed) emit()
}

function onKeyUp(event: KeyboardEvent) {
  // macOS swallows the key-up of anything pressed with ⌘, so letting go of ⌘ lets go of everything.
  if (event.key === "Meta") held.clear()
  else for (const name of names(event)) held.delete(name)
  emit()
}

function releaseAll() {
  if (!held.size) return
  held.clear()
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (listeners.size === 1) {
    window.addEventListener("keydown", onKeyDown, true)
    window.addEventListener("keyup", onKeyUp, true)
    window.addEventListener("blur", releaseAll)
  }
  return () => {
    listeners.delete(listener)
    if (!listeners.size) {
      window.removeEventListener("keydown", onKeyDown, true)
      window.removeEventListener("keyup", onKeyUp, true)
      window.removeEventListener("blur", releaseAll)
      held.clear()
    }
  }
}

const noSubscribe = () => () => {}

/** Whether `key` is held down on the keyboard right now. Undefined listens to nothing. */
function useKeyHeld(key: string | undefined) {
  const name = key === undefined ? undefined : normalize(key)
  return React.useSyncExternalStore(
    name === undefined ? noSubscribe : subscribe,
    () => (name === undefined ? false : held.has(name)),
    () => false
  )
}

type KbdProps = React.ComponentProps<"kbd"> & {
  /**
   * Press the cap when the reader presses the key. true listens for the key
   * printed on it (⌘ listens for Meta); a string names the key, e.g. "k",
   * "Escape" or "mod" (⌘ on Apple, Ctrl elsewhere). Ignored while typing in a field.
   */
  listen?: boolean | string
}

/**
 * A keycap legend for shortcuts and docs. Symbols such as ⌘ are read aloud
 * by name. With `listen`, the cap goes down when you press the real key.
 */
function Kbd({ className, listen, children, ...props }: KbdProps) {
  const symbol = typeof children === "string" ? symbols[children] : undefined
  const printed = typeof children === "string" ? children : undefined
  const target = listen === true ? (symbol?.key ?? printed) : listen || undefined
  const down = useKeyHeld(target)
  return (
    <kbd
      data-slot="kbd"
      data-listening={target ? "" : undefined}
      data-pressed={down ? "" : undefined}
      className={cn(
        "group/kbd inline-flex h-5 min-w-5 shrink-0 flex-col rounded-(--bevel-radius-xs) bg-(--kbd-side) pb-(--kbd-travel) align-middle font-sans shadow-(--kbd-cast) select-none",
        "forced-colors:border forced-colors:border-[CanvasText]",
        className
      )}
      {...props}
    >
      <span
        data-slot="kbd-cap"
        className={cn(
          "flex flex-1 items-center justify-center rounded-(--bevel-radius-xs) bg-(--kbd-cap) px-1 text-(length:--bevel-label) leading-none font-medium text-(--kbd-foreground) shadow-(--kbd-cap-light)",
          "transition-transform duration-(--bevel-duration-small) ease-(--bevel-ease-spring) motion-reduce:transition-none",
          "group-data-pressed/kbd:translate-y-(--kbd-travel) group-data-pressed/kbd:duration-(--bevel-duration-press) group-data-pressed/kbd:ease-(--bevel-ease-out)",
          "[&_svg]:pointer-events-none [&_svg]:size-3 [&_svg]:shrink-0"
        )}
      >
        {symbol ? (
          <>
            <span aria-hidden>{children}</span>
            <span className="sr-only">{symbol.name}</span>
          </>
        ) : (
          children
        )}
      </span>
    </kbd>
  )
}

/** Caps pressed together, such as ⌘ K. Each cap listens for its own key. */
function KbdGroup({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-1 align-middle font-sans", className)}
      {...props}
    />
  )
}

export { Kbd, KbdGroup }
export type { KbdProps }
