"use client"

import * as React from "react"
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"

/** A small form in a dialog. Enter saves; Escape, the × or Cancel leave it as it was. */
export function DialogRename() {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("Quarterly report")
  const fieldId = React.useId()

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = new FormData(event.currentTarget).get("name")?.toString().trim()
    if (value) setName(value)
    setOpen(false)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="inline-flex h-8 items-center rounded-(--bevel-radius-sm) border bg-background px-3 text-sm font-medium outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
          Rename
        </DialogTrigger>
        <DialogContent>
          <form onSubmit={save} className="contents">
            <DialogHeader>
              <DialogTitle>Rename document</DialogTitle>
              <DialogDescription>Everyone with access sees the new name.</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium">
                Name
              </label>
              <input
                id={fieldId}
                name="name"
                defaultValue={name}
                autoComplete="off"
                className="h-9 w-full rounded-(--bevel-radius-sm) border border-current/15 bg-transparent px-3 text-base shadow-(--bevel-depth-pressed) outline-none focus-visible:ring-2 focus-visible:ring-(--bevel-pen-blue)/50 sm:text-sm"
              />
            </DialogBody>
            <DialogFooter>
              <DialogClose>Cancel</DialogClose>
              <button
                type="submit"
                className="inline-flex h-8 items-center justify-center rounded-(--bevel-radius-sm) bg-foreground px-3 text-sm font-medium text-background outline-none focus-visible:ring-2 focus-visible:ring-(--bevel-pen-blue)/60 focus-visible:ring-offset-1"
              >
                Save
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <p className="text-sm text-muted-foreground">{name}</p>
    </div>
  )
}
