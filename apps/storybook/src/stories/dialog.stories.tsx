import type * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, waitFor, within } from "storybook/test"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
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

const trigger =
  "inline-flex h-8 items-center rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"

type Args = React.ComponentProps<typeof DialogContent> & { defaultOpen?: boolean; disabled?: boolean }

const meta: Meta<Args> = {
  title: "Essentials/Dialog",
  component: DialogContent,
  parameters: { layout: "centered" },
  args: { fasteners: "screws", align: "center", showCloseButton: true },
  argTypes: {
    fasteners: { control: "inline-radio", options: ["screws", "stitch", "none"] },
    align: { control: "inline-radio", options: ["center", "top"] },
  },
  render: ({ defaultOpen, disabled, ...args }) => (
    <Dialog defaultOpen={defaultOpen}>
      <DialogTrigger className={trigger} disabled={disabled}>
        Rename
      </DialogTrigger>
      <DialogContent {...args}>
        <DialogHeader>
          <DialogTitle>Rename document</DialogTitle>
          <DialogDescription>Everyone with access sees the new name.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Name
            <input defaultValue="Quarterly report" className="h-9 rounded-md border px-3 font-normal" />
          </label>
        </DialogBody>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
          <DialogClose>Save</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export default meta
type Story = StoryObj<Args>

const body = () => within(document.body)

/** The lights go down and the panel comes up; the corner × puts it away and focus returns. */
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const open = canvas.getByRole("button", { name: "Rename" })
    await userEvent.click(open)
    const panel = await waitFor(() => body().getByRole("dialog", { name: "Rename document" }))
    await expect(panel.querySelectorAll(".dialog-screw")).toHaveLength(4)
    await expect(document.querySelector("[data-slot=dialog-backdrop]")).not.toBeNull()
    await userEvent.click(within(panel).getByRole("button", { name: "Close" }))
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(open).toHaveFocus())
  },
}

/** Keyboard only: Enter opens, focus moves inside and is trapped, Escape closes and returns focus. */
export const Keyboard: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab()
    const open = canvas.getByRole("button", { name: "Rename" })
    await userEvent.keyboard("{Enter}")
    const panel = await waitFor(() => body().getByRole("dialog"))
    await waitFor(() => expect(panel.contains(document.activeElement)).toBe(true))
    for (let i = 0; i < 6; i++) {
      await userEvent.tab()
      // The trap's focus guards hand focus back a tick later, so wait for it to land.
      await waitFor(() => expect(panel.contains(document.activeElement)).toBe(true))
    }
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(open).toHaveFocus())
  },
}

export const Stitched: Story = { args: { fasteners: "stitch", defaultOpen: true } }

/** A command palette: top-aligned, no fasteners, no corner ×, no padding imposed. */
export const Palette: Story = {
  args: { defaultOpen: true },
  render: ({ defaultOpen }) => (
    <Dialog defaultOpen={defaultOpen}>
      <DialogTrigger className={trigger}>Search</DialogTrigger>
      <DialogContent align="top" fasteners="none" showCloseButton={false} className="max-w-lg">
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <input aria-label="Search commands" placeholder="Search commands…" className="h-12 border-b bg-transparent px-4 outline-none" />
        <ul className="p-2 text-sm">
          {["New document", "Open recent", "Settings"].map((c) => (
            <li key={c} className="rounded-md px-3 py-2">
              {c}
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  ),
  play: async () => {
    const panel = await waitFor(() => body().getByRole("dialog", { name: "Command palette" }))
    await expect(panel.querySelector("[data-slot=dialog-screws]")).toBeNull()
    await expect(within(panel).queryByRole("button", { name: "Close" })).toBeNull()
    await expect(panel.closest("[data-slot=dialog-viewport]")).toHaveAttribute("data-align", "top")
  },
}

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Rename" })).toBeDisabled()
  },
}

/** Delete confirmation. Cancel takes focus; the red key runs the action and closes. */
export const Alert: StoryObj<{ onDelete: () => void }> = {
  args: { onDelete: fn() },
  render: ({ onDelete }) => (
    <AlertDialog>
      <AlertDialogTrigger className={trigger}>Delete project</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete acme-web?</AlertDialogTitle>
          <AlertDialogDescription>Its deployments and domains go with it. This can&rsquo;t be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel />
          <AlertDialogAction onClick={onDelete}>Delete project</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Delete project" }))
    const alert = await waitFor(() => body().getByRole("alertdialog", { name: "Delete acme-web?" }))
    const cancel = within(alert).getByRole("button", { name: "Cancel" })
    await waitFor(() => expect(cancel).toHaveFocus())
    const action = within(alert).getByRole("button", { name: "Delete project" })
    await expect(action).toHaveAttribute("data-tone", "destructive")
    await userEvent.click(action)
    await expect(args.onDelete).toHaveBeenCalled()
    await waitFor(() => expect(body().queryByRole("alertdialog")).toBeNull())
  },
}

/** A long body scrolls inside the panel; header and footer stay put. */
export const LongContent: Story = {
  args: { defaultOpen: true },
  render: ({ defaultOpen }) => (
    <Dialog defaultOpen={defaultOpen}>
      <DialogTrigger className={trigger}>Terms</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Terms of service</DialogTitle>
        </DialogHeader>
        <DialogBody>
          {Array.from({ length: 30 }, (_, i) => (
            <p key={i} className="mb-3">
              Clause {i + 1}. The service is provided as is, and either party may end it with thirty days&rsquo; notice.
            </p>
          ))}
        </DialogBody>
        <DialogFooter>
          <DialogClose>Decline</DialogClose>
          <DialogClose>Accept</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const Dark: Story = { args: { defaultOpen: true }, globals: { theme: "dark" } }

/** With reduced motion the lights change and the panel appears without moving. */
export const ReducedMotion: Story = {
  args: { defaultOpen: true },
  play: async () => {
    const panel = await waitFor(() => body().getByRole("dialog"))
    await expect(panel.getAttribute("class")).toContain("motion-reduce:transition-none")
    await expect(document.querySelector("[data-slot=dialog-backdrop]")!.getAttribute("class")).toContain(
      "motion-reduce:transition-none"
    )
  },
}
