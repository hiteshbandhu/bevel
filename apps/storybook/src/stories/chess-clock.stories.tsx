import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, waitFor } from "storybook/test"
import { ChessClock, ChessClockFace, ChessClockFaces, ChessClockRocker } from "@workspace/ui/components/chess-clock"

const meta: Meta<typeof ChessClock> = {
  title: "Coordination/Chess Clock",
  component: ChessClock,
  parameters: { layout: "centered" },
  args: { names: ["You", "Agent"], time: 60_000, onTurn: fn(), onFlag: fn() },
  render: (args) => (
    <ChessClock {...args} aria-label="Review turns">
      <ChessClockFaces>
        <ChessClockFace side={0} />
        <ChessClockFace side={1} />
      </ChessClockFaces>
      <ChessClockRocker />
    </ChessClock>
  ),
}

export default meta
type Story = StoryObj<typeof ChessClock>

export const Default: Story = {}

/** Only one clock runs: ending your turn sinks your button and raises the other side's. */
export const TakingTurns: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.tab()
    await expect(canvas.getByRole("button", { name: "You first" })).toHaveFocus()
    await userEvent.keyboard("{Enter}")
    await expect(args.onTurn).toHaveBeenLastCalledWith(0)
    await expect(canvas.getByRole("status")).toHaveTextContent("Turn: You.")
    await expect(canvas.getByRole("button", { name: "End turn: Agent" })).toBeDisabled()
    await userEvent.click(canvas.getByRole("button", { name: "End turn: You" }))
    await expect(args.onTurn).toHaveBeenLastCalledWith(1)
    await expect(canvas.getByRole("status")).toHaveTextContent("Turn: Agent.")
  },
}

/** When a clock runs out its flag falls, and both buttons stop. */
export const FlagFalls: Story = {
  args: { time: 1_000, defaultActive: 1 },
  play: async ({ args, canvas }) => {
    await waitFor(() => expect(args.onFlag).toHaveBeenCalledWith(1), { timeout: 3000 })
    await expect(canvas.getByRole("status")).toHaveTextContent("Flag fell: Agent is out of time.")
    await expect(canvas.getByRole("timer", { name: "Time left: Agent" })).toHaveTextContent("Flag fell")
    for (const button of canvas.getAllByRole("button")) await expect(button).toBeDisabled()
  },
}

export const Dark: Story = { globals: { theme: "dark" } }
