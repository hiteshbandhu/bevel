import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { ArrowRight, Download } from "lucide-react"
import { expect, fn, waitFor } from "storybook/test"
import { Key, KeyLamp } from "@workspace/ui/components/key"

const meta: Meta<typeof Key> = {
  title: "Essentials/Key",
  component: Key,
  parameters: { layout: "centered" },
  args: { children: "Save changes", onClick: fn() },
}

export default meta
type Story = StoryObj<typeof Key>

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const key = canvas.getByRole("button", { name: "Save changes" })
    await expect(key).toHaveAttribute("data-variant", "primary")
    await userEvent.click(key)
    await expect(args.onClick).toHaveBeenCalledTimes(1)
  },
}

export const Secondary: Story = { args: { variant: "secondary", children: "Cancel" } }
export const Ghost: Story = { args: { variant: "ghost", children: "Skip for now" } }
export const Danger: Story = { args: { variant: "danger", children: "Delete project" } }

/** Every variant at every size, side by side: heights match shadcn's buttons. */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex flex-wrap items-center gap-3">
          <Key size={size}>Primary</Key>
          <Key size={size} variant="secondary">
            Secondary
          </Key>
          <Key size={size} variant="ghost">
            Ghost
          </Key>
          <Key size={size} variant="danger">
            Danger
          </Key>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const heights = canvas.getAllByRole("button", { name: "Primary" }).map((k) => k.getBoundingClientRect().height)
    await expect(heights).toEqual([32, 36, 40])
  },
}

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Key variant="secondary">
        <Download />
        Export CSV
      </Key>
      <Key>
        Continue
        <ArrowRight />
      </Key>
    </div>
  ),
}

/** Space and Enter press the cap down exactly as the pointer does. */
export const Keyboard: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const key = canvas.getByRole("button", { name: "Save changes" })
    await userEvent.tab()
    await expect(key).toHaveFocus()
    await userEvent.keyboard("[Space>]")
    await expect(key).toHaveAttribute("data-pressed")
    await userEvent.keyboard("[/Space]")
    await expect(key).not.toHaveAttribute("data-pressed")
    await expect(args.onClick).toHaveBeenCalledTimes(1)
    await userEvent.keyboard("[Enter>]")
    await expect(key).toHaveAttribute("data-pressed")
    await userEvent.keyboard("[/Enter]")
    await expect(key).not.toHaveAttribute("data-pressed")
    await expect(args.onClick).toHaveBeenCalledTimes(2)
  },
}

/** Sunk into its housing and matte. It can't be pressed. */
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const key = canvas.getByRole("button", { name: "Save changes" })
    await expect(key).toBeDisabled()
    await expect(key).toHaveAttribute("data-state", "disabled")
    key.click()
    await expect(args.onClick).not.toHaveBeenCalled()
    await userEvent.tab()
    await expect(key).not.toHaveFocus()
  },
}

function Saving() {
  const [pending, setPending] = React.useState(false)
  return (
    <Key
      pending={pending}
      onClick={() => {
        setPending(true)
        window.setTimeout(() => setPending(false), 600)
      }}
    >
      <KeyLamp />
      {pending ? "Saving…" : "Save changes"}
    </Key>
  )
}

/** The key latches down with its lamp lit while it works, keeps focus, and pops back up when done. */
export const Pending: Story = {
  render: () => <Saving />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const key = canvas.getByRole("button", { name: "Save changes" })
    await userEvent.tab()
    await userEvent.keyboard("{Enter}")
    await expect(key).toHaveAttribute("data-state", "pending")
    await expect(key).toHaveAttribute("aria-busy", "true")
    await expect(key).toHaveAttribute("aria-disabled", "true")
    await expect(key).toHaveFocus()
    await expect(canvasElement.querySelector('[data-slot="key-lamp"]')).toHaveAttribute("data-lit")
    await waitFor(() => expect(key).not.toHaveAttribute("data-state"), { timeout: 2000 })
    await expect(canvasElement.querySelector('[data-slot="key-lamp"]')).not.toHaveAttribute("data-lit")
  },
}

/** Rendered as a link. */
export const AsLink: Story = {
  args: { render: <a href="#pricing" />, nativeButton: false, children: "See pricing", variant: "secondary" },
  play: async ({ canvas }) => {
    const link = canvas.getByText("See pricing").closest('[data-slot="key"]')
    await expect(link?.tagName).toBe("A")
    await expect(link).toHaveAttribute("href", "#pricing")
  },
}

export const LongLabel: Story = {
  args: { children: "Save and continue to billing details" },
}

export const Dark: Story = { globals: { theme: "dark" }, render: Variants.render }

/** With reduced motion the cap jumps instead of travelling. */
export const ReducedMotion: Story = {
  play: async ({ canvasElement }) => {
    const cap = canvasElement.querySelector('[data-slot="key-cap"]')
    await expect(cap?.className).toContain("motion-reduce:transition-none")
  },
}
