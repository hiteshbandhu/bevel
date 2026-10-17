import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn } from "storybook/test"
import { ContactSheet, ContactSheetFrame } from "@workspace/ui/components/contact-sheet"

const frames = ["Dunes", "Harbour", "Forest", "Glacier", "Canyon", "Lagoon"]

const meta: Meta<typeof ContactSheet> = {
  title: "Records/Contact Sheet",
  component: ContactSheet,
  parameters: { layout: "padded" },
  args: { "aria-label": "Variants", columns: 3, onValueChange: fn() },
  render: (args) => (
    <ContactSheet {...args} className="max-w-lg">
      {frames.map((f, i) => (
        <ContactSheetFrame key={f} id={f} label={f}>
          <span className="block size-full" style={{ background: `oklch(0.6 0.12 ${i * 55})` }} />
        </ContactSheetFrame>
      ))}
    </ContactSheet>
  ),
}

export default meta
type Story = StoryObj<typeof ContactSheet>

export const Default: Story = {}
export const Marked: Story = { args: { defaultValue: { Dunes: "pick", Forest: "reject", Canyon: "pick" } } }
export const Dark: Story = { args: { defaultValue: { Harbour: "pick" } }, globals: { theme: "dark" } }

/** Arrow keys move by frame and by row; P picks, X rejects, Backspace clears. */
export const MarkByKeyboard: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.tab()
    await expect(canvas.getByRole("button", { name: "1. Dunes" })).toHaveFocus()
    await userEvent.keyboard("p")
    await expect(canvas.getByRole("button", { name: "1. Dunes, picked" })).toBeVisible()
    await userEvent.keyboard("{ArrowDown}")
    await expect(canvas.getByRole("button", { name: "4. Glacier" })).toHaveFocus()
    await userEvent.keyboard("x")
    await expect(canvas.getByRole("button", { name: "4. Glacier, rejected" })).toBeVisible()
    await userEvent.keyboard("{Backspace}{ArrowRight}")
    await expect(canvas.getByRole("button", { name: "5. Canyon" })).toHaveFocus()
    await expect(canvas.getByRole("status")).toHaveTextContent("1 picked of 6")
    await expect(args.onValueChange).toHaveBeenLastCalledWith({ Dunes: "pick" })
  },
}
