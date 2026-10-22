import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { Badge, BadgeLamp } from "@workspace/ui/components/badge"

const tones = ["neutral", "info", "success", "warning", "danger"] as const

const meta: Meta<typeof Badge> = {
  title: "Essentials/Badge",
  component: Badge,
  parameters: { layout: "centered" },
  args: { tone: "success" },
  render: (args) => (
    <Badge {...args}>
      <BadgeLamp />
      Live
    </Badge>
  ),
}

export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText("Live")).toBeInTheDocument()
    await expect(canvasElement.querySelector('[data-slot="badge"]')).toHaveAttribute("data-lit")
    await expect(canvasElement.querySelector('[data-slot="badge-lamp"]')).toHaveAttribute("aria-hidden", "true")
  },
}

/** Every tone, lit and dark. */
export const Tones: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-3">
      {tones.map((tone) => [true, false].map((lit) => (
        <Badge key={`${tone}-${lit}`} tone={tone} lit={lit}>
          <BadgeLamp />
          {tone}
        </Badge>
      )))}
    </div>
  ),
}

export const Neutral: Story = { args: { tone: "neutral" } }
export const Info: Story = { args: { tone: "info" } }
export const Warning: Story = { args: { tone: "warning" } }
export const Danger: Story = { args: { tone: "danger" } }

/** Off: the condition isn't happening. The lamp is dark glass of the same colour. */
export const Unlit: Story = {
  args: { lit: false },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-slot="badge"]')).not.toHaveAttribute("data-lit")
  },
}

/** Without a lamp it is just a printed plate. */
export const PlateOnly: Story = { render: () => <Badge>Beta</Badge> }

/** In a table row and next to a heading, at body sizes. */
export const InContext: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <h3 className="flex items-center gap-2 text-lg font-semibold">
        api-gateway
        <Badge tone="success">
          <BadgeLamp />
          Healthy
        </Badge>
      </h3>
      <table className="text-sm">
        <tbody>
          <tr className="border-t">
            <td className="py-1.5">main@4f2a</td>
            <td className="py-1.5 text-right">
              <Badge tone="warning">
                <BadgeLamp />
                Building
              </Badge>
            </td>
          </tr>
          <tr className="border-t">
            <td className="py-1.5">feat/a-really-long-branch-name</td>
            <td className="py-1.5 text-right">
              <Badge tone="danger">
                <BadgeLamp />
                Failed
              </Badge>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
}

/** Rendered as a link, through render. */
export const AsLink: Story = {
  render: () => (
    <Badge tone="info" render={<a href="#status" />}>
      <BadgeLamp />
      Status page
    </Badge>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Status page" })).toHaveAttribute("href", "#status")
  },
}

/** Badges aren't interactive, so there's no disabled state: an unlit lamp is the "off" look. */
export const Disabled: Story = { args: { lit: false, tone: "neutral" } }

/** Badges don't take focus; Tab goes straight past them to the next control. */
export const Keyboard: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Badge tone="success">
        <BadgeLamp />
        Live
      </Badge>
      <button type="button" className="rounded border px-2 py-1 text-sm">
        Redeploy
      </button>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab()
    await expect(canvas.getByRole("button", { name: "Redeploy" })).toHaveFocus()
  },
}

export const Dark: Story = { globals: { theme: "dark" }, render: Tones.render }

/** The lamp switches on and off instantly with reduced motion. Lamps never blink in any mode. */
export const ReducedMotion: Story = {
  play: async ({ canvasElement }) => {
    const glow = canvasElement.querySelector('[data-slot="badge-lamp"] > span')
    await expect(glow?.className).toContain("motion-reduce:transition-none")
    await expect(glow?.className).not.toContain("animate")
  },
}
