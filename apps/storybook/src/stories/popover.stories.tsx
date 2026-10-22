import type * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, waitFor, within } from "storybook/test"
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@workspace/ui/components/popover"

const trigger =
  "inline-flex h-8 items-center rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"

type Args = React.ComponentProps<typeof PopoverContent> & { defaultOpen?: boolean; disabled?: boolean }

const meta: Meta<Args> = {
  title: "Essentials/Popover",
  component: PopoverContent,
  parameters: { layout: "centered" },
  args: { side: "bottom", tab: true },
  argTypes: { side: { control: "inline-radio", options: ["top", "bottom", "left", "right"] } },
  render: ({ defaultOpen, disabled, ...args }) => (
    <div className="p-24">
      <Popover defaultOpen={defaultOpen}>
        <PopoverTrigger className={trigger} disabled={disabled}>
          Share
        </PopoverTrigger>
        <PopoverContent {...args}>
          <PopoverHeader>
            <PopoverTitle>Share this page</PopoverTitle>
            <PopoverDescription>Anyone with the link can view it.</PopoverDescription>
            <PopoverClose />
          </PopoverHeader>
          <button type="button" className={trigger}>
            Copy link
          </button>
        </PopoverContent>
      </Popover>
    </div>
  ),
}

export default meta
type Story = StoryObj<Args>

const body = () => within(document.body)

/** Click lifts the sheet; the close × puts it down and focus goes back to the trigger. */
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const open = canvas.getByRole("button", { name: "Share" })
    await userEvent.click(open)
    const sheet = await waitFor(() => body().getByRole("dialog", { name: "Share this page" }))
    await expect(sheet).toHaveAttribute("data-side", "bottom")
    await expect(sheet.querySelector("[data-slot=popover-tab]")).not.toBeNull()
    await userEvent.click(body().getByRole("button", { name: "Close" }))
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(open).toHaveFocus())
  },
}

/** Keyboard only: Enter opens, Tab moves inside, Escape closes and returns focus. */
export const Keyboard: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab()
    const open = canvas.getByRole("button", { name: "Share" })
    await expect(open).toHaveFocus()
    await userEvent.keyboard("{Enter}")
    await waitFor(() => expect(body().getByRole("dialog")).toBeVisible())
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(body().queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(open).toHaveFocus())
  },
}

export const Top: Story = { args: { side: "top", defaultOpen: true } }
export const Right: Story = { args: { side: "right", defaultOpen: true } }
export const WithoutTab: Story = { args: { tab: false, defaultOpen: true } }

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Share" })).toBeDisabled()
  },
}

export const Dark: Story = { args: { defaultOpen: true }, globals: { theme: "dark" } }

/** With reduced motion the sheet appears in place, without lifting. */
export const ReducedMotion: Story = {
  args: { defaultOpen: true },
  play: async () => {
    const sheet = await waitFor(() => body().getByRole("dialog"))
    await expect(sheet.getAttribute("class")).toContain("motion-reduce:transition-none")
  },
}
