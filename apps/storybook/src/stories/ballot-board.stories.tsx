import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn } from "storybook/test"
import { BallotBoard, BallotCommit, BallotLever, BallotRace } from "@workspace/ui/components/ballot-board"

const meta: Meta<typeof BallotBoard> = {
  title: "Safety/Ballot board",
  component: BallotBoard,
  parameters: { layout: "centered" },
  args: { onCommit: fn() },
  render: (args) => (
    <BallotBoard {...args} className="w-[28rem]">
      <BallotRace name="email" label="Email the client">
        <BallotLever value="approve">Approve</BallotLever>
        <BallotLever value="deny">Deny</BallotLever>
      </BallotRace>
      <BallotRace name="reviewers" label="Reviewers" max={2}>
        <BallotLever value="Priya">Priya</BallotLever>
        <BallotLever value="Sam">Sam</BallotLever>
        <BallotLever value="Ana">Ana</BallotLever>
      </BallotRace>
      <BallotCommit />
    </BallotBoard>
  ),
}

export default meta
type Story = StoryObj<typeof BallotBoard>

/** One choice per race; extra choices lock at the limit; the commit sends everything and resets. */
export const ChooseAndCast: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const race = canvas.getByRole("radiogroup", { name: "Email the client" })
    await userEvent.click(canvas.getByRole("radio", { name: "Approve" }))
    await userEvent.click(canvas.getByRole("radio", { name: "Deny" }))
    await expect(canvas.getByRole("radio", { name: "Approve" })).not.toBeChecked()
    await expect(race).toBeInTheDocument()
    await userEvent.click(canvas.getByRole("checkbox", { name: "Priya" }))
    await userEvent.click(canvas.getByRole("checkbox", { name: "Sam" }))
    await expect(canvas.getByRole("checkbox", { name: "Ana" })).toHaveAttribute("aria-disabled", "true")
    await expect(canvas.getByRole("status")).toHaveTextContent("3 choices, not cast yet.")
    await userEvent.click(canvas.getByRole("button", { name: "Cast" }))
    await expect(args.onCommit).toHaveBeenCalledWith({ email: ["deny"], reviewers: ["Priya", "Sam"] })
    await expect(canvas.getByRole("status")).toHaveTextContent("Cast 3 choices. The board is reset.")
    await expect(canvas.getByRole("checkbox", { name: "Priya" })).not.toBeChecked()
  },
}

export const ArrowKeys: Story = {
  play: async ({ canvas, userEvent }) => {
    canvas.getByRole("radio", { name: "Approve" }).focus()
    await userEvent.keyboard("{ArrowRight}")
    await expect(canvas.getByRole("radio", { name: "Deny" })).toHaveFocus()
    await userEvent.keyboard(" ")
    await expect(canvas.getByRole("radio", { name: "Deny" })).toBeChecked()
  },
}
