import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { Keycard, KeycardKey, KeycardLabel, KeycardSlot } from "@workspace/ui/components/keycard"

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
