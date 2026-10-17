import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect, fn } from "storybook/test"
import { PushToTalk, PushToTalkKey, PushToTalkStatus } from "@workspace/ui/components/push-to-talk"

function Harness({ disabled = false, onTalkingChange = (_: boolean) => {} }) {
  const [talking, setTalking] = React.useState(false)
  return (
    <PushToTalk
      talking={talking}
      disabled={disabled}
      onTalkingChange={(t) => {
        setTalking(t)
        onTalkingChange(t)
      }}
    >
      <PushToTalkKey />
      <PushToTalkStatus />
    </PushToTalk>
  )
}

const meta: Meta<typeof Harness> = {
  title: "Instruments/Push to Talk",
  component: Harness,
  parameters: { layout: "centered" },
  args: { onTalkingChange: fn() },
}

export default meta
type Story = StoryObj<typeof Harness>

export const Default: Story = {}
export const Disabled: Story = { args: { disabled: true } }
export const Dark: Story = { globals: { theme: "dark" } }

/** Space held down listens; letting go stops. Enter does nothing, since it can't be held. */
export const HoldSpace: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const key = canvas.getByRole("button", { name: "Hold to talk" })
    await userEvent.tab()
    await expect(key).toHaveFocus()
    await userEvent.keyboard("[Space>]")
    await expect(key).toHaveAttribute("aria-pressed", "true")
    await expect(canvas.getByRole("status")).toHaveTextContent("Listening")
    await userEvent.keyboard("[/Space]")
    await expect(key).toHaveAttribute("aria-pressed", "false")
    await expect(canvas.getByRole("status")).toHaveTextContent("Not listening")
    await userEvent.keyboard("{Enter}")
    await expect(args.onTalkingChange).toHaveBeenCalledTimes(2)
  },
}

/** Holding with the pointer listens until it's released. */
export const HoldPointer: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const key = canvas.getByRole("button", { name: "Hold to talk" })
    await userEvent.pointer({ keys: "[MouseLeft>]", target: key })
    await expect(key).toHaveAttribute("aria-pressed", "true")
    await userEvent.pointer({ keys: "[/MouseLeft]", target: key })
    await expect(key).toHaveAttribute("aria-pressed", "false")
    await expect(args.onTalkingChange).toHaveBeenCalledTimes(2)
  },
}
