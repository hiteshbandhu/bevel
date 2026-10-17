"use client"

import * as React from "react"
import { cn } from "cn"

type NameTagVariant = "sticker" | "visitor" | "plain"

type NameTagProps = React.ComponentProps<"div"> & {
  /** sticker: "HELLO my name is". visitor: a clip-on guest badge. plain: compact, for dense lists. */
  variant?: NameTagVariant
  /** The printed greeting. Translate it: "Hola", "Bonjour". */
  greeting?: string
  /** The line under the greeting on the sticker. */
  caption?: string
}

/**
 * Says who someone is: an agent, a person, a guest. The printed greeting is
 * decoration; screen readers hear only the name and detail.
 */
function NameTag({
  className,
  variant = "sticker",
  greeting,
  caption,
  children,
  ...props
}: NameTagProps) {
  return (
    <div
      data-slot="name-tag"
      data-variant={variant}
      className={cn(
        "relative not-italic select-none",
        variant === "sticker" &&
          "name-tag-sticker flex w-56 flex-col overflow-hidden rounded-(--bevel-radius-md) pb-2",
        variant === "visitor" &&
          "bevel-plastic flex w-52 flex-col items-center overflow-visible rounded-(--bevel-radius-md) bg-(--name-tag-card) pb-4 [--bevel-material:var(--name-tag-card)]",
        variant === "plain" &&
          "inline-flex max-w-full items-baseline gap-1.5 rounded-(--bevel-radius-xs) border-l-4 border-(--name-tag-band) bg-(--name-tag-card) py-0.5 pr-2 pl-1.5 shadow-(--bevel-depth-sheet)",
        "forced-colors:border forced-colors:border-[CanvasText]",
        className
      )}
      {...props}
    >
      {variant === "visitor" && (
        <span
          aria-hidden
          data-slot="name-tag-clip"
          className="bevel-metal absolute -top-2 left-1/2 h-4 w-10 -translate-x-1/2 rounded-(--bevel-radius-xs)"
        />
      )}
      {variant !== "plain" && (
        <span
          aria-hidden
          data-slot="name-tag-band"
          className={cn(
            "flex w-full flex-col items-center pt-2 pb-1.5 text-(--name-tag-band-foreground) uppercase",
            variant === "visitor" && "rounded-t-(--bevel-radius-md) bg-(--name-tag-band) pt-4"
          )}
        >
          <span className="text-2xl leading-none font-black tracking-(--bevel-tracking-label)">
            {greeting ?? (variant === "sticker" ? "Hello" : "Visitor")}
          </span>
          {variant === "sticker" && (
            <span className="mt-0.5 text-(length:--bevel-fine) font-semibold tracking-(--bevel-tracking-print) normal-case">
              {caption ?? "my name is"}
            </span>
          )}
        </span>
      )}
      {variant === "sticker" ? (
        <span
          data-slot="name-tag-body"
          className="mx-2 flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-(--bevel-radius-xs) bg-(--name-tag-card) px-3 py-2 text-center text-(--name-tag-ink)"
        >
          {children}
        </span>
      ) : variant === "visitor" ? (
        <span
          data-slot="name-tag-body"
          className="flex flex-col items-center gap-0.5 px-4 pt-3 text-center text-(--name-tag-ink)"
        >
          {children}
        </span>
      ) : (
        children
      )}
    </div>
  )
}

/** The name, written in marker on the sticker and badge; set plainly on the plain tag. */
function NameTagName({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="name-tag-name"
      className={cn(
        "max-w-full truncate leading-tight text-(length:--name-tag-name-size) text-(--name-tag-ink)",
        "in-data-[variant=sticker]:font-(family-name:--bevel-font-marker) in-data-[variant=sticker]:-rotate-1",
        "in-data-[variant=visitor]:font-(family-name:--bevel-font-marker)",
        "in-data-[variant=plain]:font-semibold",
        className
      )}
      {...props}
    />
  )
}

/** A second line: a role, or who the agent acts for. */
function NameTagDetail({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="name-tag-detail"
      className={cn(
        "max-w-full truncate text-(length:--bevel-fine) text-(--bevel-paper-muted)",
        className
      )}
      {...props}
    />
  )
}

/** Write a new name on the tag. Labelled "Name" unless you pass aria-label. */
function NameTagInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="name-tag-input"
      aria-label="Name"
      className={cn(
        "w-full min-w-0 rounded-(--bevel-radius-xs) bg-transparent text-center leading-tight text-(length:--name-tag-name-size) text-(--name-tag-ink) outline-none",
        "font-(family-name:--bevel-font-marker) placeholder:text-(--bevel-pencil)",
        "focus-visible:ring-2 focus-visible:ring-(--name-tag-band)/50",
        className
      )}
      {...props}
    />
  )
}

export { NameTag, NameTagName, NameTagDetail, NameTagInput }
export type { NameTagProps, NameTagVariant }
