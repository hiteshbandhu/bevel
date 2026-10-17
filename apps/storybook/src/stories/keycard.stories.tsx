import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect, fn, waitFor } from "storybook/test"
import { Keycard, KeycardKey, KeycardLabel, KeycardSlot, KeycardSwipe } from "@workspace/ui/components/keycard"

const meta = {
  title: "Money/Keycard",
  component: KeycardSlot,
  args: { inserted: false },
  parameters: { layout: "centered" },
  render: (args) => (
    <KeycardSlot {...args} className="w-72">
      <Keycard>
        <KeycardLabel>Your OpenAI key</KeycardLabel>
        <KeycardKey value="sk-proj-8f2c91d0a7e44b3c9e1f" />
      </Keycard>
    </KeycardSlot>
  ),
} satisfies Meta<typeof KeycardSlot>

export default meta
type Story = StoryObj<typeof meta>

export const Out: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("No key inserted")).toBeVisible()
    // Masked to prefix and last four, read as "ending in".
    await expect(canvas.getByText(/ending in/).parentElement).toHaveTextContent("sk-••••••••ending in 9e1f")
  },
}

export const Inserted: Story = {
  args: { inserted: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Key in use")).toBeVisible()
  },
}

/** On its own, without a reader. */
export const CardOnly: Story = {
  render: () => (
    <Keycard className="w-72">
      <KeycardLabel>Anthropic key</KeycardLabel>
      <KeycardKey value="sk-ant-api03-abcdefgh1234" revealed />
    </Keycard>
  ),
}

function Swipe({ onSwipe }: { onSwipe: () => void }) {
  const [count, setCount] = React.useState(0)
  return (
    <KeycardSwipe
      className="w-96"
      accepted={count % 2 === 1}
      onSwipe={() => {
        setCount((c) => c + 1)
        onSwipe()
      }}
    >
      <Keycard>
        <KeycardLabel>Your key</KeycardLabel>
        <KeycardKey value="sk-proj-8f2c91d0a7e44b3c9e1f" />
      </Keycard>
    </KeycardSwipe>
  )
}

/** A short drag springs back; a full drag swipes; Enter swipes from the keyboard. */
export const SwipeReader: Story = {
  args: { onSwipe: fn() } as never,
  render: (args) => <Swipe onSwipe={(args as unknown as { onSwipe: () => void }).onSwipe} />,
  play: async ({ args, canvas, canvasElement }) => {
    const onSwipe = (args as unknown as { onSwipe: () => void }).onSwipe
    const card = canvas.getByRole("button", { name: /^Swipe key: Your key/ })
    await expect(card).toHaveAccessibleDescription("Swipe the card to the right")
    const rect = card.getBoundingClientRect()
    const track = canvasElement.querySelector("[data-slot=keycard-swipe]")!.getBoundingClientRect()
    const y = rect.top + 10
    const fire = (type: string, x: number, timeStamp?: number) =>
      card.dispatchEvent(
        new PointerEvent(type, { bubbles: true, pointerId: 1, button: 0, clientX: x, clientY: y, ...(timeStamp ? {} : {}) })
      )

    // Short, slow drag: springs back, no swipe.
    fire("pointerdown", rect.left + 20)
    await new Promise((r) => setTimeout(r, 400))
    fire("pointermove", rect.left + 40)
    fire("pointerup", rect.left + 40)
    await expect(onSwipe).not.toHaveBeenCalled()

    // Full drag across the channel: swipes.
    await new Promise((r) => setTimeout(r, 400))
    fire("pointerdown", rect.left + 20)
    fire("pointermove", rect.left + 20 + track.width)
    fire("pointerup", rect.left + 20 + track.width)
    await waitFor(() => expect(onSwipe).toHaveBeenCalledTimes(1), { timeout: 2000 })
    await expect(canvas.getByText("Key accepted")).toBeVisible()

    // Keyboard, once the card is back.
    await new Promise((r) => setTimeout(r, 900))
    card.focus()
    card.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }))
    await waitFor(() => expect(onSwipe).toHaveBeenCalledTimes(2), { timeout: 2000 })
  },
}
