import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect } from "storybook/test"
import {
  Mixer,
  MixerStrip,
  MixerStripFader,
  MixerStripMute,
  MixerStripName,
  MixerStripSolo,
} from "@workspace/ui/components/mixer-strip"

function Channel({ name, start = 50 }: { name: string; start?: number }) {
  const [value, setValue] = React.useState(start)
  const [muted, setMuted] = React.useState(false)
  return (
    <MixerStrip name={name} muted={muted}>
      <MixerStripName />
      <MixerStripMute pressed={muted} onPressedChange={setMuted} />
      <MixerStripSolo />
      <MixerStripFader value={value} onValueChange={setValue} changedBy="You" format={(v) => `${v}%`} />
    </MixerStrip>
  )
}

const meta: Meta<typeof Mixer> = {
  title: "Instruments/Mixer Strip",
  component: Mixer,
  parameters: { layout: "centered" },
  render: () => (
    <Mixer aria-label="Agents">
      <Channel name="Research" start={70} />
      <Channel name="Code" start={40} />
      <Channel name="Review" start={20} />
    </Mixer>
  ),
}

export default meta
type Story = StoryObj<typeof Mixer>

export const Default: Story = {}
export const OneStrip: Story = { render: () => <Channel name="Research" /> }
export const LongName: Story = { render: () => <Channel name="Documentation writer" /> }
export const Dark: Story = { globals: { theme: "dark" } }

/** Every control is named for its channel, and mute dims the strip. */
export const MuteByKeyboard: Story = {
  play: async ({ canvas, userEvent }) => {
    const mute = canvas.getByRole("button", { name: "Mute Code" })
    mute.focus()
    await userEvent.keyboard("{Enter}")
    await expect(mute).toHaveAttribute("aria-pressed", "true")
    await expect(canvas.getByRole("group", { name: "Code" })).toHaveAttribute("data-muted")
    await userEvent.tab()
    await expect(canvas.getByRole("button", { name: "Solo Code" })).toHaveFocus()
    await userEvent.tab()
    const fader = canvas.getByRole("slider", { name: "Code level" })
    await expect(fader).toHaveFocus()
    await userEvent.keyboard("{ArrowUp}")
    await expect(fader).toHaveAttribute("aria-valuetext", "41%, set by You")
  },
}
