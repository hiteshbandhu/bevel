import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect, fn, waitFor } from "storybook/test"
import {
  PatchBay,
  PatchBayJack,
  PatchBayPanel,
  PatchBayRoutes,
  PatchBayRow,
  type PatchBayRoute,
} from "@workspace/ui/components/patch-bay"

type HarnessProps = {
  initial?: PatchBayRoute[]
  disabled?: boolean
  routesList?: boolean
  onValueChange?: (value: PatchBayRoute[]) => void
}

/** Agent tools patched to agents. */
function Harness({ initial = [["search", "researcher"]], disabled, routesList, onValueChange }: HarnessProps) {
  const [routes, setRoutes] = React.useState(initial)
  return (
    <PatchBay
      aria-label="Tool access"
      value={routes}
      disabled={disabled}
      onValueChange={(next) => {
        setRoutes(next)
        onValueChange?.(next)
      }}
      className="w-[min(32rem,90vw)]"
    >
      <PatchBayPanel>
        <PatchBayRow side="source" label="Tools">
          <PatchBayJack value="search">Web search</PatchBayJack>
          <PatchBayJack value="shell">Shell</PatchBayJack>
          <PatchBayJack value="email">Send email</PatchBayJack>
        </PatchBayRow>
        <PatchBayRow side="destination" label="Agents">
          <PatchBayJack value="researcher">Researcher</PatchBayJack>
          <PatchBayJack value="coder">Coder</PatchBayJack>
          <PatchBayJack value="support">Support</PatchBayJack>
        </PatchBayRow>
      </PatchBayPanel>
      {routesList && <PatchBayRoutes />}
    </PatchBay>
  )
}

const meta: Meta<typeof Harness> = {
  title: "Instruments/Patch bay",
  component: Harness,
  parameters: { layout: "centered" },
  args: { onValueChange: fn() },
}

export default meta
type Story = StoryObj<typeof Harness>

export const Default: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("button", { name: "Web search" })).toHaveAccessibleDescription("Patched to Researcher.")
    await expect(canvas.getByRole("button", { name: "Coder" })).toHaveAccessibleDescription("Not patched.")
    await expect(canvas.getByRole("list", { name: "Routes" })).toHaveTextContent("Web search to Researcher")
    await waitFor(() => expect(canvasElement.querySelectorAll('[data-slot="patch-bay-cable"]')).toHaveLength(1))
  },
}

/** Press a tool, then an agent: a cable goes in, and it's announced. */
export const Patch: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const shell = canvas.getByRole("button", { name: "Shell" })
    await userEvent.click(shell)
    await expect(shell).toHaveAttribute("aria-pressed", "true")
    await expect(canvas.getByRole("status")).toHaveTextContent("Selected Shell. Now choose one of the Agents.")
    await userEvent.click(canvas.getByRole("button", { name: "Coder" }))
    await expect(args.onValueChange).toHaveBeenLastCalledWith([
      ["search", "researcher"],
      ["shell", "coder"],
    ])
    await expect(canvas.getByRole("status")).toHaveTextContent("Patched Shell to Coder.")
    await expect(shell).toHaveAttribute("aria-pressed", "false")
    await expect(shell).toHaveAccessibleDescription("Patched to Coder.")
    await waitFor(() => expect(canvasElement.querySelectorAll('[data-slot="patch-bay-cable"]')).toHaveLength(2))
  },
}

/** Either end first: pick the agent, then the tool. Patching the same pair again pulls the cable. */
export const Unpatch: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Researcher" }))
    await userEvent.click(canvas.getByRole("button", { name: "Web search" }))
    await expect(args.onValueChange).toHaveBeenLastCalledWith([])
    await expect(canvas.getByRole("status")).toHaveTextContent("Unpatched Web search from Researcher.")
    await expect(canvas.getByRole("list", { name: "Routes" })).toHaveTextContent("No routes")
  },
}

/** Keyboard: Enter picks up a jack, Escape puts it down, Delete pulls every cable on it. */
export const Keyboard: Story = {
  args: { initial: [["search", "researcher"], ["search", "coder"]] },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.tab()
    const search = canvas.getByRole("button", { name: "Web search" })
    await expect(search).toHaveFocus()
    await expect(search).toHaveAccessibleDescription("Patched to Researcher and Coder.")
    await userEvent.keyboard("{Enter}")
    await expect(search).toHaveAttribute("aria-pressed", "true")
    await userEvent.keyboard("{Escape}")
    await expect(search).toHaveAttribute("aria-pressed", "false")
    await expect(canvas.getByRole("status")).toHaveTextContent("Cancelled.")
    await userEvent.keyboard("{Delete}")
    await expect(args.onValueChange).toHaveBeenLastCalledWith([])
    await expect(canvas.getByRole("status")).toHaveTextContent("Unpatched Web search: 2 cables.")
  },
}

/** A many-to-many patch: one tool to every agent, and every tool to one agent. */
export const Busy: Story = {
  args: {
    initial: [
      ["search", "researcher"],
      ["search", "coder"],
      ["search", "support"],
      ["shell", "coder"],
      ["email", "coder"],
      ["email", "support"],
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Coder" })).toHaveAccessibleDescription(
      "Patched from Web search, Shell and Send email."
    )
  },
}

/** With a visible list, each route gets an Unpatch button. */
export const WithRoutes: Story = {
  args: { routesList: true },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Unpatch Web search from Researcher" }))
    await expect(args.onValueChange).toHaveBeenLastCalledWith([])
    await expect(canvas.getByRole("list", { name: "Routes" })).toHaveTextContent("No routes yet.")
  },
}

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const shell = canvas.getByRole("button", { name: "Shell" })
    await expect(shell).toBeDisabled()
    await userEvent.click(shell)
    await expect(args.onValueChange).not.toHaveBeenCalled()
  },
}

/** Long names wrap onto two lines of the designation strip. */
export const LongLabels: Story = {
  render: () => (
    <PatchBay aria-label="Webhooks" defaultValue={[["a", "x"]]} className="w-80">
      <PatchBayPanel>
        <PatchBayRow side="source" label="Events">
          <PatchBayJack value="a">customer.subscription.trial_will_end</PatchBayJack>
          <PatchBayJack value="b">invoice.paid</PatchBayJack>
        </PatchBayRow>
        <PatchBayRow side="destination" label="Handlers">
          <PatchBayJack value="x">Notify the account owner by email</PatchBayJack>
        </PatchBayRow>
      </PatchBayPanel>
    </PatchBay>
  ),
}

export const Dark: Story = { globals: { theme: "dark" } }

/** With reduced motion, cables appear without fading in. */
export const ReducedMotion: Story = {
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelector('[data-slot="patch-bay-cable"]')).not.toBeNull())
    for (const cable of canvasElement.querySelectorAll('[data-slot="patch-bay-cable"]')) {
      await expect(cable.getAttribute("class")).toContain("motion-reduce:transition-none")
    }
  },
}
