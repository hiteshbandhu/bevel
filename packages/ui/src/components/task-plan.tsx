"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "@base-ui/react/progress"
import { cn } from "cn"

/** An agent's plan on a legal pad. Each row sits on a rule. */
function TaskPlan({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="task-plan"
      className={cn(
        "bevel-ruled relative w-full max-w-md overflow-hidden rounded-b-(--bevel-radius-xs) pt-(--bevel-rule-height) pb-(--bevel-rule-height) text-sm",
        className
      )}
      {...props}
    >
      <span
        aria-hidden
        data-slot="task-plan-binding"
        className="absolute inset-x-0 top-0 h-3 bg-(--task-plan-binding) shadow-(--bevel-depth-flush)"
      />
      {children}
    </div>
  )
}

/** Title and progress, two rules tall. */
function TaskPlanHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="task-plan-header"
      className={cn(
        "flex h-[calc(var(--bevel-rule-height)*2)] flex-col justify-end gap-1 pr-4 pb-1.5 pl-(--task-plan-indent)",
        className
      )}
      {...props}
    />
  )
}

function TaskPlanTitle({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="task-plan-title" className={cn("font-semibold", className)} {...props} />
}

type TaskPlanProgressProps = Omit<ProgressPrimitive.Root.Props, "children"> & {
  /** Visible text; defaults to "3 of 7 done". */
  children?: React.ReactNode
}

/** How far along the plan is, as a pencil line inked in. */
function TaskPlanProgress({
  className,
  value,
  max = 100,
  children,
  "aria-label": ariaLabel = "Plan progress",
  ...props
}: TaskPlanProgressProps) {
  return (
    <ProgressPrimitive.Root
      data-slot="task-plan-progress"
      value={value}
      max={max}
      aria-label={ariaLabel}
      getAriaValueText={(_, v) => `${v ?? 0} of ${max} done`}
      className={cn("flex items-center gap-3", className)}
      {...props}
    >
      <ProgressPrimitive.Track className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-(--bevel-pencil)/35">
        {/* Inked in with scale, not width, so progress never relays out the page. */}
        <span
          aria-hidden
          className="absolute inset-0 origin-left rounded-full bg-(--bevel-pen-blue) transition-[scale] duration-(--bevel-duration-move) ease-(--bevel-ease-out) motion-reduce:transition-none"
          style={{ scale: `${max ? Math.min(1, (value ?? 0) / max) : 0} 1` }}
        />
      </ProgressPrimitive.Track>
      <span className="text-(length:--bevel-fine) text-(--bevel-paper-muted) tabular-nums">
        {children ?? `${value ?? 0} of ${max} done`}
      </span>
    </ProgressPrimitive.Root>
  )
}

function TaskPlanSteps({ className, ...props }: React.ComponentProps<"ol">) {
  return <ol data-slot="task-plan-steps" className={cn("flex flex-col", className)} {...props} />
}

type TaskPlanStatus = "done" | "current" | "pending" | "error" | "skipped"

const statusText: Record<TaskPlanStatus, string> = {
  done: "Done",
  current: "In progress",
  pending: "Not started",
  error: "Failed",
  skipped: "Skipped",
}

type TaskPlanStepProps = React.ComponentProps<"li"> & {
  status?: TaskPlanStatus
}

/**
 * One step, written on its rule. Done steps get a tick in ink, the current
 * one is underlined in red pen, and steps not reached yet are in pencil.
 */
function TaskPlanStep({ className, status = "pending", children, ...props }: TaskPlanStepProps) {
  return (
    <li
      data-slot="task-plan-step"
      data-status={status}
      aria-current={status === "current" ? "step" : undefined}
      className={cn(
        "relative min-h-(--bevel-rule-height) pr-4 pl-(--task-plan-indent) leading-(--bevel-rule-height) text-(--task-plan-ink)",
        "data-[status=skipped]:line-through",
        className
      )}
      {...props}
    >
      <span
        aria-hidden
        className="absolute top-0 left-0 flex h-(--bevel-rule-height) w-(--bevel-rule-margin) translate-y-(--task-plan-sink) items-center justify-center"
      >
        <StepMark status={status} />
      </span>
      <span className="sr-only">{statusText[status]}: </span>
      {/* Written on the line, not floating between lines. */}
      <span
        className={cn(
          "block translate-y-(--task-plan-sink)",
          status === "current" &&
            "underline decoration-(--bevel-pen-red) decoration-2 underline-offset-4"
        )}
      >
        {children}
      </span>
    </li>
  )
}

/** The mark in the margin. The tick draws itself when a step is finished. */
function StepMark({ status }: { status: TaskPlanStatus }) {
  if (status === "current") {
    return (
      <svg viewBox="0 0 16 16" className="size-4 text-(--bevel-pen-red)">
        <path d="M2 8h10M8 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (status === "error") {
    return (
      <svg viewBox="0 0 16 16" className="size-4 text-(--bevel-pen-red)">
        <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 16 16" className="size-4 text-(--bevel-pen-blue)">
      <path
        d="M2.5 8.5l3.5 3.5 7.5-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={24}
        className="transition-[stroke-dashoffset] duration-(--bevel-duration-move) ease-(--bevel-ease-out) [stroke-dasharray:var(--task-plan-check-length)] motion-reduce:transition-none"
        style={{ strokeDashoffset: status === "done" ? 0 : "var(--task-plan-check-length)" }}
      />
    </svg>
  )
}

export {
  TaskPlan,
  TaskPlanHeader,
  TaskPlanTitle,
  TaskPlanProgress,
  TaskPlanSteps,
  TaskPlanStep,
}
export type { TaskPlanStatus, TaskPlanStepProps }
