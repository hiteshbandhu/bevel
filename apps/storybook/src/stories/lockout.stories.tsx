import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect, fn } from "storybook/test"
import { Lockout, LockoutAction, LockoutHasp, LockoutLock } from "@workspace/ui/components/lockout"

function Harness({ onRun }: { onRun: () => void }) {
  const [locks, setLocks] = React.useState(["Priya", "You"])
  return (
    <Lockout aria-label="Migration">
      <LockoutHasp>
        {locks.map((owner) => (
          <LockoutLock
            key={owner}
            id={owner}
            owner={owner}
            reason="Working"
            onRemove={() => setLocks((l) => l.filter((x) => x !== owner))}
          />
        ))}
      </LockoutHasp>
      <LockoutAction onClick={onRun}>Run migration</LockoutAction>
    </Lockout>
  )
}

const meta: Meta<typeof Lockout> = {
  title: "Coordination/Lockout",
  component: Lockout,
  parameters: { layout: "centered" },
  args: { onClick: fn() } as never,
  render: (args) => <Harness onRun={(args as unknown as { onClick: () => void }).onClick} />,
}

export default meta
type Story = StoryObj<typeof Lockout>

/** The action stays disabled, and says whose locks hold it, until the last lock is off. */
export const AllLocksOff: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const run = canvas.getByRole("button", { name: "Run migration" })
    await expect(run).toHaveAttribute("aria-disabled", "true")
    await expect(run).toHaveAccessibleDescription("Locked by 2: Priya, You")
    const removes = canvas.getAllByRole("button", { name: "Remove my lock" })
    await userEvent.click(removes[0]!)
    await expect(run).toHaveAccessibleDescription("Locked by 1: You")
    await userEvent.click(canvas.getByRole("button", { name: "Remove my lock" }))
    await expect(run).not.toHaveAttribute("aria-disabled", "true")
    await userEvent.click(run)
    await expect((args as unknown as { onClick: () => void }).onClick).toHaveBeenCalledOnce()
  },
}
