import type { Meta, StoryObj } from "@storybook/react-vite"
import { Bold, Copy, Italic, Trash2, Underline, X } from "lucide-react"
import { expect, fn } from "storybook/test"
import { IconKey } from "@workspace/ui/components/icon-key"

const meta: Meta<typeof IconKey> = {
  title: "Essentials/Icon key",
  component: IconKey,
  parameters: { layout: "centered" },
  args: { "aria-label": "Copy", children: <Copy />, onClick: fn() },
}

export default meta
type Story = StoryObj<typeof IconKey>

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const key = canvas.getByRole("button", { name: "Copy" })
    const box = key.getBoundingClientRect()
    await expect(box.width).toBe(box.height)
    await userEvent.click(key)
    await expect(args.onClick).toHaveBeenCalledTimes(1)
  },
}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex items-center gap-2">
          <IconKey size={size} aria-label="Copy">
            <Copy />
          </IconKey>
          <IconKey size={size} variant="primary" aria-label="Copy">
            <Copy />
          </IconKey>
          <IconKey size={size} variant="ghost" aria-label="Close">
            <X />
          </IconKey>
          <IconKey size={size} variant="danger" aria-label="Delete">
            <Trash2 />
          </IconKey>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const sizes = canvas.getAllByRole("button", { name: "Delete" }).map((k) => k.getBoundingClientRect().width)
    await expect(sizes).toEqual([32, 36, 40])
  },
}

/** A toolbar of ghost keys. Tab moves between them; Space presses. */
export const Toolbar: Story = {
  render: (args) => (
    <div role="toolbar" aria-label="Formatting" className="flex gap-1 rounded-lg border p-1">
      <IconKey variant="ghost" size="sm" aria-label="Bold" onClick={args.onClick}>
        <Bold />
      </IconKey>
      <IconKey variant="ghost" size="sm" aria-label="Italic" onClick={args.onClick}>
        <Italic />
      </IconKey>
      <IconKey variant="ghost" size="sm" aria-label="Underline" onClick={args.onClick}>
        <Underline />
      </IconKey>
    </div>
  ),
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.tab()
    await userEvent.tab()
    const italic = canvas.getByRole("button", { name: "Italic" })
    await expect(italic).toHaveFocus()
    await userEvent.keyboard("[Space>]")
    await expect(italic).toHaveAttribute("data-pressed")
    await userEvent.keyboard("[/Space]")
    await expect(args.onClick).toHaveBeenCalledTimes(1)
  },
}

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Copy" })).toBeDisabled()
  },
}

export const Dark: Story = { globals: { theme: "dark" }, render: Variants.render }

export const ReducedMotion: Story = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-slot="key-cap"]')?.className).toContain(
      "motion-reduce:transition-none"
    )
  },
}
