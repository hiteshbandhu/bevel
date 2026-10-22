"use client"

import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip"

const key =
  "inline-flex h-8 items-center justify-center rounded-(--bevel-radius-sm) border bg-background px-3 text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"

/** Black tape for everyday labels; red and blue for the one that must stand out. Each feeds out from its own side. */
export function TooltipTapes() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-center">
      <Tooltip>
        <TooltipTrigger className={key}>Top</TooltipTrigger>
        <TooltipContent side="top">Saved 2 min ago</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger className={key}>Bottom</TooltipTrigger>
        <TooltipContent side="bottom">Shared with 4 people</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger className={key}>Red tape</TooltipTrigger>
        <TooltipContent tone="red">Deletes for everyone</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger className={key}>Blue tape</TooltipTrigger>
        <TooltipContent tone="blue" side="right">
          New
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
