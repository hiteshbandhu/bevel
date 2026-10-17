"use client"

import * as React from "react"
import { cn } from "cn"

type PushToTalkContextValue = { talking: boolean; disabled: boolean; setTalking: (talking: boolean) => void }

const PushToTalkContext = React.createContext<PushToTalkContextValue | null>(null)

function usePushToTalk() {
  const context = React.useContext(PushToTalkContext)
  if (!context) throw new Error("PushToTalk parts must be inside <PushToTalk>")
  return context
}

type PushToTalkProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  /** Whether the key is held right now. Set it from onTalkingChange. */
  talking: boolean
  /** Called with true when the key goes down and false when it's let go. */
  onTalkingChange: (talking: boolean) => void
  disabled?: boolean
}

/**
 * A push-to-talk radio: it listens only while the key is held, with the
 * pointer or Space. Letting go, leaving, or losing focus stops it.
 */
function PushToTalk({ className, talking, onTalkingChange, disabled = false, children, ...props }: PushToTalkProps) {
  return (
    <PushToTalkContext value={{ talking, disabled, setTalking: onTalkingChange }}>
      <div
        data-slot="push-to-talk"
        data-talking={talking ? "" : undefined}
        className={cn(
          "bevel-plastic bevel-object flex w-56 flex-col items-center gap-4 rounded-(--bevel-radius-xl) p-5 text-(--bevel-ivory)",
          className
        )}
        {...props}
      >
        <span aria-hidden className="push-to-talk-grille h-12 w-full rounded-(--bevel-radius-md) shadow-(--bevel-depth-recessed)" />
        {children}
      </div>
    </PushToTalkContext>
  )
}

/** The key. A toggle button that's pressed only while held. */
function PushToTalkKey({ className, children = "Hold to talk", ...props }: React.ComponentProps<"button">) {
  const { talking, disabled, setTalking } = usePushToTalk()
  // Pointer up, lost capture and blur can all arrive for one release: report it once.
  const held = React.useRef(false)
  const start = () => {
    if (disabled || held.current) return
    held.current = true
    setTalking(true)
  }
  const stop = () => {
    if (!held.current) return
    held.current = false
    setTalking(false)
  }
  return (
    <button
      type="button"
      data-slot="push-to-talk-key"
      aria-pressed={talking}
      disabled={disabled}
      onPointerDown={(event) => {
        if (event.button !== 0) return
        event.currentTarget.setPointerCapture(event.pointerId)
        start()
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onLostPointerCapture={stop}
      onKeyDown={(event) => {
        if (event.key !== " ") return
        event.preventDefault()
        if (!event.repeat) start()
      }}
      onKeyUp={(event) => {
        if (event.key === " ") stop()
      }}
      // Enter can't be held the way Space can, so it does nothing.
      onClick={(event) => event.preventDefault()}
      onBlur={stop}
      onContextMenu={(event) => event.preventDefault()}
      className={cn(
        "bevel-raised flex h-24 w-full touch-none flex-col items-center justify-center gap-1 rounded-(--bevel-radius-lg) text-sm font-semibold outline-none select-none",
        "transition-[translate,box-shadow] duration-(--bevel-duration-press) ease-(--bevel-ease-out) motion-reduce:transition-none",
        "aria-pressed:translate-y-1 aria-pressed:bevel-pressed",
        "focus-visible:ring-3 focus-visible:ring-(--bevel-ivory)/50 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <span aria-hidden className="h-1 w-10 rounded-full bg-(--bevel-shade-strong)" />
      {children}
      <span aria-hidden className="h-1 w-10 rounded-full bg-(--bevel-shade-strong)" />
    </button>
  )
}

/** The on-air lamp and what it means, in words. */
function PushToTalkStatus({ className, idle = "Not listening", live = "Listening", ...props }: React.ComponentProps<"p"> & { idle?: string; live?: string }) {
  const { talking } = usePushToTalk()
  return (
    <p data-slot="push-to-talk-status" className={cn("flex items-center gap-2 text-sm", className)} {...props}>
      <span
        aria-hidden
        className={cn(
          "size-2.5 rounded-full transition-opacity duration-(--bevel-duration-press) motion-reduce:transition-none",
          talking ? "bevel-led" : "bg-(--bevel-shade-strong)"
        )}
      />
      <span role="status">{talking ? live : idle}</span>
    </p>
  )
}

export { PushToTalk, PushToTalkKey, PushToTalkStatus }
export type { PushToTalkProps }
