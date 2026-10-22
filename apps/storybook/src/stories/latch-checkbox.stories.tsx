import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn } from "storybook/test"
import {
  LatchCheckbox,
  LatchCheckboxDescription,
  LatchCheckboxField,
  LatchCheckboxGroup,
  LatchCheckboxLabel,
} from "@workspace/ui/components/latch-checkbox"

const meta: Meta<typeof LatchCheckbox> = {
  title: "Essentials/Latch checkbox",
  component: LatchCheckbox,
  parameters: { layout: "centered" },
  args: { "aria-label": "Select row", onCheckedChange: fn() },
}

export default meta
type Story = StoryObj<typeof LatchCheckbox>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("checkbox", { name: "Select row" })).not.toBeChecked()
  },
}

export const Checked: Story = { args: { defaultChecked: true } }

/** Mixed: the key held half-down, with a dash. */
export const Indeterminate: Story = {
  args: { indeterminate: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("checkbox", { name: "Select row" })).toHaveAttribute("aria-checked", "mixed")
  },
}

export const Press: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const box = canvas.getByRole("checkbox", { name: "Select row" })
    await userEvent.click(box)
    await expect(box).toBeChecked()
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true, expect.anything())
    await userEvent.click(box)
    await expect(box).not.toBeChecked()
  },
}

export const Keyboard: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab()
    const box = canvas.getByRole("checkbox", { name: "Select row" })
    await expect(box).toHaveFocus()
    await userEvent.keyboard(" ")
    await expect(box).toBeChecked()
  },
}

export const Disabled: Story = {
  args: { disabled: true, defaultChecked: true },
  play: async ({ canvas, userEvent }) => {
    const box = canvas.getByRole("checkbox", { name: "Select row" })
    await userEvent.click(box)
    await expect(box).toBeChecked()
  },
}

/** With a label and description; clicking the label presses the key. */
export const WithLabel: Story = {
  render: (args) => (
    <LatchCheckboxField className="w-72">
      <LatchCheckbox onCheckedChange={args.onCheckedChange} />
      <LatchCheckboxLabel>Require review</LatchCheckboxLabel>
      <LatchCheckboxDescription>Agents wait for a person before merging.</LatchCheckboxDescription>
    </LatchCheckboxField>
  ),
  play: async ({ canvas, userEvent }) => {
    const box = canvas.getByRole("checkbox", { name: "Require review" })
    await expect(box).toHaveAccessibleDescription("Agents wait for a person before merging.")
    await userEvent.click(canvas.getByText("Require review"))
    await expect(box).toBeChecked()
  },
}

const scopes = [
  ["read", "Read files"],
  ["write", "Write files"],
  ["shell", "Run commands"],
] as const

/** A group with a parent key: it shows mixed while some are down and presses them all. */
export const Group: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-3">
      <p id="scopes" className="text-sm font-semibold">
        Agent permissions
      </p>
      <LatchCheckboxGroup aria-labelledby="scopes" defaultValue={["read"]} allValues={scopes.map(([v]) => v)}>
        <LatchCheckboxField>
          <LatchCheckbox parent />
          <LatchCheckboxLabel>All permissions</LatchCheckboxLabel>
        </LatchCheckboxField>
        {scopes.map(([value, label]) => (
          <LatchCheckboxField key={value} className="ps-6">
            <LatchCheckbox value={value} />
            <LatchCheckboxLabel>{label}</LatchCheckboxLabel>
          </LatchCheckboxField>
        ))}
      </LatchCheckboxGroup>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const all = canvas.getByRole("checkbox", { name: "All permissions" })
    await expect(all).toHaveAttribute("aria-checked", "mixed")
    await userEvent.click(all)
    for (const [, label] of scopes) await expect(canvas.getByRole("checkbox", { name: label })).toBeChecked()
  },
}

export const Dark: Story = { globals: { theme: "dark" }, args: { defaultChecked: true } }

/** With reduced motion the key drops instead of travelling. */
export const ReducedMotion: Story = {
  play: async ({ canvasElement }) => {
    const cap = canvasElement.querySelector('[data-slot="latch-checkbox-cap"]')!
    await expect(cap.className).toContain("motion-reduce:transition-none")
  },
}
