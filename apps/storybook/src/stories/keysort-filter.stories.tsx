import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn } from "storybook/test"
import {
  KeysortFilter,
  KeysortFilterCard,
  KeysortFilterCount,
  KeysortFilterDeck,
  KeysortFilterNeedle,
  KeysortFilterNeedles,
} from "@workspace/ui/components/keysort-filter"

const meta: Meta<typeof KeysortFilter> = {
  title: "Records/Keysort Filter",
  component: KeysortFilter,
  parameters: { layout: "padded" },
  args: { "aria-label": "Contracts", onValueChange: fn() },
  render: (args) => (
    <KeysortFilter {...args} className="max-w-xl">
      <KeysortFilterNeedles>
        <KeysortFilterNeedle value="nda">NDA</KeysortFilterNeedle>
        <KeysortFilterNeedle value="signed">Signed</KeysortFilterNeedle>
        <KeysortFilterNeedle value="eu">EU</KeysortFilterNeedle>
      </KeysortFilterNeedles>
      <KeysortFilterDeck>
        <KeysortFilterCard notches={["nda", "signed"]}>Acme mutual NDA</KeysortFilterCard>
        <KeysortFilterCard notches={["nda", "eu"]}>Globex NDA draft</KeysortFilterCard>
        <KeysortFilterCard notches={["signed", "eu"]}>Initech supply agreement</KeysortFilterCard>
        <KeysortFilterCard notches={[]}>Umbrella term sheet</KeysortFilterCard>
      </KeysortFilterDeck>
      <KeysortFilterCount />
    </KeysortFilter>
  ),
}

export default meta
type Story = StoryObj<typeof KeysortFilter>

export const Default: Story = {}
export const Sorting: Story = { args: { defaultValue: ["nda"] } }
export const Dark: Story = { args: { defaultValue: ["signed"] }, globals: { theme: "dark" } }

/** Each needle narrows the match: cards must be notched for all of them. */
export const NeedlesByKeyboard: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const count = canvas.getByRole("status")
    await expect(count).toHaveTextContent("4 cards. Push a needle in to sort.")
    await userEvent.tab()
    await expect(canvas.getByRole("button", { name: "NDA" })).toHaveFocus()
    await userEvent.keyboard(" ")
    await expect(count).toHaveTextContent("2 of 4 cards match NDA.")
    await userEvent.tab()
    await userEvent.keyboard(" ")
    await expect(count).toHaveTextContent("1 of 4 cards match NDA and Signed.")
    await expect(args.onValueChange).toHaveBeenLastCalledWith(["nda", "signed"])
    await expect(canvas.getByText("Acme mutual NDA").closest("li")).toHaveAttribute("data-card", "match")
  },
}
