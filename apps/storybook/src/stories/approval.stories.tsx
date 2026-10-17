import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, waitFor } from "storybook/test"
import {
  Approval,
  ApprovalActions,
  ApprovalDescription,
  ApprovalReject,
  ApprovalSeal,
  ApprovalSignature,
  ApprovalSignatures,
  ApprovalTitle,
} from "@workspace/ui/components/approval"

const meta: Meta<typeof Approval> = {
  title: "Agents/Approval",
  component: Approval,
  parameters: { layout: "centered" },
  args: { onApprove: fn(), onReject: fn() },
  render: (args) => (
    <Approval {...args} className="w-[28rem]">
      <ApprovalTitle>Send the redline to opposing counsel</ApprovalTitle>
      <ApprovalDescription>It goes to j.lee@haleward.com and can&apos;t be recalled.</ApprovalDescription>
      <ApprovalSignatures>
        <ApprovalSignature name="Priya Shah" signed />
        <ApprovalSignature name="You" />
      </ApprovalSignatures>
      <ApprovalActions>
        <ApprovalReject>Send back</ApprovalReject>
        <ApprovalSeal />
      </ApprovalActions>
    </Approval>
  ),
}

export default meta
type Story = StoryObj<typeof Approval>

/** Holding Enter for the full hold approves; the seal is pressed and announced. */
export const HoldToApprove: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole("group", { name: /send the redline/i })).toBeVisible()
    const seal = canvas.getByRole("button", { name: "Seal" })
    await expect(seal).toHaveAccessibleDescription("Press and hold to approve")
    seal.focus()
    await userEvent.keyboard("{Enter>}")
    // Halfway through the hold, nothing has happened yet.
    await new Promise((r) => setTimeout(r, 500))
    await expect(args.onApprove).not.toHaveBeenCalled()
    await expect(seal).toHaveAttribute("data-holding")
    await waitFor(() => expect(args.onApprove).toHaveBeenCalledOnce(), { timeout: 3000 })
    await userEvent.keyboard("{/Enter}")
    // Announced as one word, not the seal's ring text.
    await expect(canvas.getByRole("status")).toHaveAccessibleName("")
    await expect(canvas.getByRole("status").querySelector(".sr-only")).toHaveTextContent("Approved")
    await expect(canvas.getByRole("status").querySelector("[data-slot=seal]")).toHaveAttribute("aria-hidden", "true")
    await expect(canvas.queryByRole("button", { name: "Seal" })).toBeNull()
  },
}

/** Letting go early springs back and approves nothing. */
export const ReleaseEarly: Story = {
  play: async ({ args, canvas, userEvent }) => {
    // The hold is read from CSS, which browsers may report in seconds.
    canvas.getByRole("group").style.setProperty("--approval-hold", "1.2s")
    const seal = canvas.getByRole("button", { name: "Seal" })
    seal.focus()
    await userEvent.keyboard("{Enter>}")
    await new Promise((r) => setTimeout(r, 300))
    await userEvent.keyboard("{/Enter}")
    await new Promise((r) => setTimeout(r, 1500))
    await expect(args.onApprove).not.toHaveBeenCalled()
    await expect(seal).not.toHaveAttribute("data-holding")
  },
}

export const SendBack: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Send back" }))
    await expect(args.onReject).toHaveBeenCalledOnce()
    await expect(canvas.getByRole("status")).toHaveTextContent("Sent back")
  },
}

/** For teams that would rather confirm with a single press. */
export const SinglePress: Story = {
  render: (args) => (
    <Approval {...args} className="w-[28rem]">
      <ApprovalTitle>Archive the matter</ApprovalTitle>
      <ApprovalActions>
        <ApprovalReject>Cancel</ApprovalReject>
        <ApprovalSeal requireHold={false}>Approve</ApprovalSeal>
      </ApprovalActions>
    </Approval>
  ),
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Approve" }))
    await expect(args.onApprove).toHaveBeenCalledOnce()
  },
}
