import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn } from "storybook/test"
import { Redline, RedlineChange, RedlineDocument, RedlineToolbar } from "@workspace/ui/components/redline"

const meta: Meta<typeof Redline> = {
  title: "Documents/Redline",
  component: Redline,
  parameters: { layout: "centered" },
  args: { onDecisionsChange: fn() },
  render: (args) => (
    <Redline {...args} className="w-[34rem]">
      <RedlineDocument>
        Either party may end this lease on{" "}
        <RedlineChange id="period" deletion="thirty (30)" insertion="fourteen (14)" /> days&apos; written
        notice<RedlineChange id="email" insertion=", including by email" />.
      </RedlineDocument>
      <RedlineToolbar />
    </Redline>
  ),
}

export default meta
type Story = StoryObj<typeof Redline>

export const AcceptOne: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    await expect(canvas.getByText("2 changes to review")).toBeVisible()
    const change = canvas.getByRole("group", { name: /delete .thirty \(30\)., insert .fourteen \(14\)./ })
    // Screen readers hear what's deleted and inserted, not just a colour.
    await expect(change.querySelector("del")).toHaveTextContent("deleted: thirty (30)")
    await userEvent.click(canvas.getAllByRole("button", { name: "Accept change" })[0]!)
    await expect(canvasElement.querySelector("[data-slot=redline-document]")).toHaveTextContent(/on fourteen \(14\) days/)
    await expect(canvas.getByText("1 change to review")).toBeVisible()
  },
}

export const RejectOne: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getAllByRole("button", { name: "Reject change" })[1]!)
    await expect(canvasElement.querySelector("[data-slot=redline-document]")).not.toHaveTextContent(/email/)
  },
}

export const AcceptAll: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Accept all" }))
    await expect(args.onDecisionsChange).toHaveBeenLastCalledWith({ period: "accepted", email: "accepted" })
    await expect(canvas.getByText("All changes decided")).toBeVisible()
    await expect(canvas.getByRole("button", { name: "Accept all" })).toBeDisabled()
  },
}

export const KeyboardOnly: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab()
    await expect(canvas.getAllByRole("button", { name: "Accept change" })[0]).toHaveFocus()
    await userEvent.keyboard("{Enter}")
    await expect(canvas.getByText("1 change to review")).toBeVisible()
  },
}
