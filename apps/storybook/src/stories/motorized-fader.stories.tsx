import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect } from "storybook/test"
import { MotorizedFader, MotorizedFaderReadout } from "@workspace/ui/components/motorized-fader"

const percent = (v: number) => `${v}%`

function Harness({ start = 40, by = "Agent", disabled = false }) {
  const [value, setValue] = React.useState(start)
  const [changedBy, setChangedBy] = React.useState(by)
  return (
    <div className="flex flex-col items-center gap-3">
      <MotorizedFader
        aria-label="Creativity"
        value={value}
        changedBy={changedBy}
        format={percent}
        disabled={disabled}
        onValueChange={(v) => {
          setValue(v)
          setChangedBy("You")
        }}
      />
      <MotorizedFaderReadout value={percent(value)} changedBy={changedBy} />
      <button
        type="button"
        onClick={() => {
          setValue(90)
          setChangedBy("Agent")
        }}
      >
        Agent sets 90%
      </button>
    </div>
  )
}

const meta: Meta<typeof Harness> = {
  title: "Instruments/Motorized Fader",
  component: Harness,
  parameters: { layout: "centered" },
}

export default meta
type Story = StoryObj<typeof Harness>

export const Default: Story = {}
export const Disabled: Story = { args: { disabled: true } }
export const Dark: Story = { globals: { theme: "dark" } }

/** The agent moves it remotely; taking it with the keyboard makes it yours. */
export const TakeControl: Story = {
  play: async ({ canvas, userEvent }) => {
    const fader = canvas.getByRole("slider", { name: "Creativity" })
    await expect(fader).toHaveAttribute("aria-valuetext", "40%, set by Agent")
    await userEvent.click(canvas.getByRole("button", { name: "Agent sets 90%" }))
    await expect(fader).toHaveAttribute("aria-valuetext", "90%, set by Agent")
    await expect(fader).toHaveAttribute("data-remote")
    fader.focus()
    await userEvent.keyboard("{ArrowDown}")
    await expect(fader).toHaveAttribute("aria-valuetext", "89%, set by You")
    await expect(fader).not.toHaveAttribute("data-remote")
    await userEvent.keyboard("{Home}")
    await expect(fader).toHaveAttribute("aria-valuenow", "0")
  },
}
