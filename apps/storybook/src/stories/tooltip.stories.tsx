import type * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, waitFor, within } from "storybook/test"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@workspace/ui/components/tooltip"

const trigger =
  "inline-flex h-8 items-center rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"

type Args = React.ComponentProps<typeof TooltipContent> & { disabled?: boolean; defaultOpen?: boolean }

const meta: Meta<Args> = {
  title: "Essentials/Tooltip",
  component: TooltipContent,
  parameters: { layout: "centered" },
  args: { children: "Copy link", tone: "black", side: "top" },
  argTypes: {
    tone: { control: "inline-radio", options: ["black", "red", "blue"] },
    side: { control: "inline-radio", options: ["top", "bottom", "left", "right"] },
  },
  render: ({ disabled, defaultOpen, ...args }) => (
    <div className="p-16">
      <Tooltip disabled={disabled} defaultOpen={defaultOpen}>
        <TooltipTrigger className={trigger}>Hover or focus me</TooltipTrigger>
        <TooltipContent {...args} />
      </Tooltip>
    </div>
  ),
}

export default meta
type Story = StoryObj<Args>

const body = () => within(document.body)

/** Focus prints the label; Escape tears it off. */
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab()
    await expect(canvas.getByRole("button")).toHaveFocus()
    const label = await waitFor(() => body().getByText("Copy link"), { timeout: 3000 })
    await expect(label.closest("[data-slot=tooltip-content]")).toHaveAttribute("data-side", "top")
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(body().queryByText("Copy link")).toBeNull())
  },
}

export const Red: Story = { args: { tone: "red", children: "Deletes for everyone", defaultOpen: true } }
export const Blue: Story = { args: { tone: "blue", children: "New", side: "right" } }

/** Every side, open at once: the tab always points back at the trigger. */
export const Sides: Story = {
  render: ({ disabled: _d, defaultOpen: _o, ...args }) => (
    <div className="grid grid-cols-2 gap-x-40 gap-y-24 p-16">
      {(["top", "bottom", "left", "right"] as const).map((side) => (
        <Tooltip key={side} defaultOpen>
          <TooltipTrigger className={trigger}>{side}</TooltipTrigger>
          <TooltipContent {...args} side={side}>
            {side}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
  play: async () => {
    for (const side of ["top", "bottom", "left", "right"]) {
      const tab = await waitFor(() =>
        document.querySelector(`[data-slot=tooltip-content][data-side=${side}] [data-slot=tooltip-tab]`)
      )
      await expect(tab).toHaveAttribute("data-side", side)
    }
  },
}

/** In a provider, moving to the next trigger opens it at once, with no animation. */
export const Group: Story = {
  render: ({ disabled: _d, defaultOpen: _o, ...args }) => (
    <TooltipProvider delay={300}>
      <div className="flex gap-1 p-16">
        {["Bold", "Italic", "Link"].map((label) => (
          <Tooltip key={label}>
            <TooltipTrigger className={trigger}>{label[0]}</TooltipTrigger>
            <TooltipContent {...args}>{label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.hover(canvas.getByRole("button", { name: "B" }))
    await waitFor(() => expect(body().getByText("Bold")).toBeVisible(), { timeout: 3000 })
    await userEvent.hover(canvas.getByRole("button", { name: "I" }))
    const italic = await waitFor(() => body().getByText("Italic"), { timeout: 3000 })
    await waitFor(() => expect(italic.closest("[data-slot=tooltip-content]")).toHaveAttribute("data-instant"))
  },
}

/** Long text wraps on the tape instead of running off the screen. */
export const LongLabel: Story = {
  args: { children: "Opens the billing portal in a new tab, signed in as you", defaultOpen: true },
}

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab()
    await expect(canvas.getByRole("button")).toHaveFocus()
    await new Promise((r) => setTimeout(r, 800))
    await expect(body().queryByText("Copy link")).toBeNull()
  },
}

export const Dark: Story = { args: { defaultOpen: true }, globals: { theme: "dark" } }

/** With reduced motion the label appears in place, without feeding out. */
export const ReducedMotion: Story = {
  args: { defaultOpen: true },
  play: async () => {
    const tape = await waitFor(() => document.querySelector("[data-slot=tooltip-content]")!)
    await expect(tape.getAttribute("class")).toContain("motion-reduce:transition-none")
  },
}
