import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, waitFor } from "storybook/test"
import { Vigilance, VigilanceButton, VigilanceLamps, VigilanceTimer } from "@workspace/ui/components/vigilance"

const meta: Meta<typeof Vigilance> = {
  title: "Safety/Dead man's switch",
  component: Vigilance,
  parameters: { layout: "centered" },
  args: { interval: 1600, onTrip: fn(), onCheckIn: fn(), onResume: fn() },
  render: (args) => (
    <Vigilance {...args} aria-label="Supervision">
      <VigilanceLamps />
      <VigilanceTimer />
      <VigilanceButton />
    </Vigilance>
  ),
}

export default meta
type Story = StoryObj<typeof Vigilance>

/** Left alone it warns, then pauses; Resume starts a new window. */
export const MissedCheckIn: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole("status")).toHaveTextContent("Running.")
    await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent("Check in soon."), { timeout: 2000 })
    await waitFor(() => expect(args.onTrip).toHaveBeenCalledOnce(), { timeout: 3000 })
    await expect(canvas.getByRole("alert")).toHaveTextContent("Paused: no check-in.")
    await userEvent.click(canvas.getByRole("button", { name: "Resume" }))
    await expect(args.onResume).toHaveBeenCalledOnce()
    await expect(canvas.getByRole("status")).toHaveTextContent("Running.")
  },
}

/** Checking in resets the window, so nothing trips. */
export const CheckingIn: Story = {
  play: async ({ args, canvas, userEvent }) => {
    for (let i = 0; i < 3; i++) {
      await new Promise((r) => setTimeout(r, 700))
      await userEvent.click(canvas.getByRole("button", { name: "I'm here" }))
    }
    await expect(args.onCheckIn).toHaveBeenCalledTimes(3)
    await expect(args.onTrip).not.toHaveBeenCalled()
    await expect(canvas.getByRole("progressbar", { name: "Time until next check-in" })).toBeInTheDocument()
  },
}
