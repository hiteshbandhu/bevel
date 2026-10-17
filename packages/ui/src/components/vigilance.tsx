"use client"

import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { Progress as ProgressPrimitive } from "@base-ui/react/progress"
import { cn } from "cn"

type VigilanceStage = "clear" | "warning" | "stopping" | "paused"

type VigilanceContextValue = {
  stage: VigilanceStage
  remaining: number
  interval: number
  checkIn: () => void
  resume: () => void
}

const VigilanceContext = React.createContext<VigilanceContextValue | null>(null)

function useVigilance() {
  const context = React.useContext(VigilanceContext)
  if (!context) throw new Error("Vigilance parts must be inside <Vigilance>")
  return context
}

type VigilanceProps = React.ComponentProps<"div"> & {
  /** Time allowed between check-ins, in milliseconds. */
  interval: number
  /** Share of the interval left when the warning lamp lights. */
  warnAt?: number
  /** Share left when the final warning is announced. */
  stopAt?: number
  /** Count down only while the supervised run is going. */
  running?: boolean
  /** The window ran out: pause the run. */
  onTrip?: () => void
  onCheckIn?: () => void
  onResume?: () => void
}

/**
 * A dead man's switch for a supervised run: it keeps going only while
 * someone checks in. Miss the window and it warns, then stops.
 */
function Vigilance({
  className,
  interval,
  warnAt = 0.4,
  stopAt = 0.15,
  running = true,
  onTrip,
  onCheckIn,
  onResume,
  children,
  ...props
}: VigilanceProps) {
  const [deadline, setDeadline] = React.useState(() => Date.now() + interval)
  const [now, setNow] = React.useState(() => Date.now())
  const [paused, setPaused] = React.useState(false)
  const tripped = React.useRef(false)

  // Stopping holds the time left; starting again carries it over, so time
  // spent stopped doesn't count against the window.
  const held = React.useRef<number | null>(null)
  React.useEffect(() => {
    const t = Date.now()
    if (!running) {
      held.current = Math.max(0, deadline - t)
    } else if (held.current !== null) {
      setDeadline(t + held.current)
      setNow(t)
      held.current = null
    }
    // Only a change of `running` moves the deadline.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  React.useEffect(() => {
    if (!running || paused) return
    const timer = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(timer)
  }, [running, paused])

  const remaining = Math.max(0, deadline - now)
  React.useEffect(() => {
    if (running && !paused && remaining === 0 && !tripped.current) {
      tripped.current = true
      setPaused(true)
      onTrip?.()
    }
  }, [remaining, running, paused, onTrip])

  const share = remaining / interval
  const stage: VigilanceStage = paused ? "paused" : share <= stopAt ? "stopping" : share <= warnAt ? "warning" : "clear"

  const context = React.useMemo<VigilanceContextValue>(
    () => ({
      stage,
      remaining,
      interval,
      checkIn: () => {
        if (paused) return
        const t = Date.now()
        setNow(t)
        setDeadline(t + interval)
        onCheckIn?.()
      },
      resume: () => {
        const t = Date.now()
        tripped.current = false
        setPaused(false)
        setNow(t)
        setDeadline(t + interval)
        onResume?.()
      },
    }),
    [stage, remaining, interval, paused, onCheckIn, onResume]
  )

  return (
    <VigilanceContext value={context}>
      <div
        role="group"
        data-slot="vigilance"
        data-stage={stage}
        className={cn(
          "bevel-metal bevel-object flex w-72 flex-col gap-4 rounded-(--bevel-radius-md) p-4 text-(--bevel-ivory)",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </VigilanceContext>
  )
}

const lamps: { stage: VigilanceStage; label: string }[] = [
  { stage: "clear", label: "Clear" },
  { stage: "warning", label: "Warning" },
  { stage: "stopping", label: "Stopping" },
]

/**
 * Three lamps and the stage in words. Steady, never flashing. The final
 * warning and the pause are announced assertively.
 */
function VigilanceLamps({ className, ...props }: React.ComponentProps<"div">) {
  const { stage, remaining } = useVigilance()
  const seconds = Math.ceil(remaining / 1000)
  const urgent = stage === "stopping" || stage === "paused"
  return (
    <div data-slot="vigilance-lamps" className={cn("flex flex-col gap-2", className)} {...props}>
      <div className="flex justify-between gap-2">
        {lamps.map((lamp) => (
          <span
            key={lamp.stage}
            data-slot="vigilance-lamp"
            data-stage={stage}
            data-lit={
              lamp.stage === stage || (lamp.stage === "stopping" && stage === "paused") ? "" : undefined
            }
            className="bevel-deboss flex items-center gap-1.5 text-(length:--bevel-fine) font-semibold tracking-(--bevel-tracking-print) uppercase"
          >
            <span aria-hidden className="bevel-led size-2.5 rounded-full" />
            {lamp.label}
          </span>
        ))}
      </div>
      <div className="flex min-h-5 items-baseline justify-between gap-3 text-sm">
        {/* Only the stage is live, so it's announced once per change, not every second. */}
        <p role={urgent ? "alert" : "status"}>
          {stage === "paused"
            ? "Paused: no check-in."
            : stage === "stopping"
              ? "Check in now or the run pauses."
              : stage === "warning"
                ? "Check in soon."
                : "Running."}
        </p>
        {stage !== "paused" && (
          <span aria-hidden className="font-mono text-(length:--bevel-fine) tabular-nums opacity-80">
            {seconds}s
          </span>
        )}
      </div>
    </div>
  )
}

/** Time left until the next check-in. */
function VigilanceTimer({ className, ...props }: Omit<ProgressPrimitive.Root.Props, "value">) {
  const { remaining, interval } = useVigilance()
  return (
    <ProgressPrimitive.Root
      value={Math.round(remaining / 1000)}
      max={Math.round(interval / 1000)}
      aria-label="Time until next check-in"
      getAriaValueText={(_, v) => `${v ?? 0} seconds left`}
      className={cn("w-full", className)}
      {...props}
    >
      <ProgressPrimitive.Track className="bevel-recessed relative h-2 overflow-hidden rounded-full">
        <span
          aria-hidden
          className="absolute inset-0 origin-left rounded-full bg-(--bevel-led) transition-[scale] duration-(--vigilance-tick) ease-linear motion-reduce:transition-none in-data-[stage=clear]:[--bevel-led:var(--vigilance-clear)] in-data-[stage=warning]:[--bevel-led:var(--vigilance-warning)] in-data-[stage=stopping]:[--bevel-led:var(--vigilance-stopping)]"
          style={{ scale: `${remaining / interval} 1` }}
        />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  )
}

/** The check-in button. While paused it becomes Resume. */
function VigilanceButton({ className, children, ...props }: Omit<ButtonPrimitive.Props, "onClick">) {
  const { stage, checkIn, resume } = useVigilance()
  const paused = stage === "paused"
  return (
    <ButtonPrimitive
      data-slot="vigilance-button"
      onClick={paused ? resume : checkIn}
      className={cn(
        "bevel-raised mx-auto grid size-20 place-items-center rounded-full text-center text-(length:--bevel-label) font-black tracking-(--bevel-tracking-label) text-(--bevel-ivory-foreground) uppercase outline-none select-none",
        "transition-[translate,box-shadow] duration-(--bevel-duration-press) ease-(--bevel-ease-out) active:translate-y-0.5 active:bevel-pressed motion-reduce:transition-none",
        "focus-visible:ring-3 focus-visible:ring-(--bevel-ivory)/50 focus-visible:ring-offset-2 focus-visible:ring-offset-(--vigilance-panel)",
        className
      )}
      {...props}
    >
      {paused ? "Resume" : (children ?? "I'm here")}
    </ButtonPrimitive>
  )
}

export { Vigilance, VigilanceLamps, VigilanceTimer, VigilanceButton }
export type { VigilanceProps, VigilanceStage }
