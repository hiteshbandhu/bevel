import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect, fn } from "storybook/test"
import { TimeCard, TimeCardPunch, TimeCardStatus, type TimeCardEntry } from "@workspace/ui/components/time-card"

type HarnessProps = {
  start?: TimeCardEntry[]
  disabled?: boolean
  onPunch?: (event: { kind: "in" | "out"; at: Date }) => void
}

function Harness({ start = [], disabled, onPunch }: HarnessProps) {
  const [entries, setEntries] = React.useState(start)
  return (
    <TimeCard
      title="Focus sessions · Tuesday"
      entries={entries}
      timeZone="UTC"
      locale="en-GB"
      onPunch={(event) => {
        onPunch?.(event)
        setEntries((all) =>
          event.kind === "in"
            ? [...all, { in: event.at }]
            : all.map((e, i) => (i === all.length - 1 ? { ...e, out: event.at } : e))
        )
      }}
      className="w-80"
    >
      <TimeCardStatus />
      <TimeCardPunch disabled={disabled} />
    </TimeCard>
  )
}

const meta: Meta<typeof Harness> = {
  title: "Records/Time card",
  component: Harness,
  parameters: { layout: "centered" },
  args: {
    onPunch: fn(),
    start: [
      { in: "2026-10-19T08:58:00Z", out: "2026-10-19T12:31:00Z" },
      { in: "2026-10-19T13:15:00Z", out: "2026-10-19T17:42:00Z" },
    ],
  },
}

export default meta
type Story = StoryObj<typeof Harness>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("table", { name: "Focus sessions · Tuesday" })).toBeInTheDocument()
    await expect(canvas.getByText("3h 33m")).toBeInTheDocument()
    await expect(canvas.getByText("8h")).toBeInTheDocument()
    await expect(canvas.getByRole("status")).toHaveTextContent("Clocked out at 17:42. 8h on this card.")
  },
}

/** Punch in, then out: each press stamps the time now on the card. */
export const PunchInAndOut: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const key = canvas.getByRole("button", { name: "Punch in" })
    await expect(key).toHaveAccessibleDescription(/Clocked out/)
    await userEvent.click(key)
    await expect(args.onPunch).toHaveBeenLastCalledWith(expect.objectContaining({ kind: "in" }))
    await expect(canvas.getByRole("status")).toHaveTextContent(/^Clocked in at \d\d:\d\d\.$/)
    await expect(canvas.getByText("Still clocked in")).toBeInTheDocument()
    await userEvent.click(canvas.getByRole("button", { name: "Punch out" }))
    await expect(args.onPunch).toHaveBeenLastCalledWith(expect.objectContaining({ kind: "out" }))
    await expect(canvas.getAllByRole("row")).toHaveLength(1 + 3 + 1)
  },
}

export const Keyboard: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.tab()
    await expect(canvas.getByRole("button", { name: "Punch in" })).toHaveFocus()
    await userEvent.keyboard("{Enter}")
    await expect(args.onPunch).toHaveBeenCalledTimes(1)
    await expect(canvas.getByRole("button", { name: "Punch out" })).toHaveFocus()
    await userEvent.keyboard(" ")
    await expect(args.onPunch).toHaveBeenCalledTimes(2)
  },
}

/** An on-call shift that runs past midnight is marked +1. */
export const Overnight: Story = {
  args: { start: [{ in: "2026-10-19T22:00:00Z", out: "2026-10-20T06:30:00Z" }] },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByText("8h 30m")).toHaveLength(2)
    await expect(canvas.getByText(/\+1/)).toHaveTextContent("+1 day")
  },
}

export const Empty: Story = {
  args: { start: [] },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("status")).toHaveTextContent("Not clocked in yet.")
    await expect(canvas.getByText("0m")).toBeInTheDocument()
  },
}

/** More sessions than lines: the card grows. */
export const FullWeek: Story = {
  args: {
    start: Array.from({ length: 9 }, (_, i) => ({
      in: `2026-10-${String(12 + i).padStart(2, "0")}T09:00:00Z`,
      out: `2026-10-${String(12 + i).padStart(2, "0")}T17:15:00Z`,
    })),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("74h 15m")).toBeInTheDocument()
  },
}

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const key = canvas.getByRole("button", { name: "Punch in" })
    await expect(key).toHaveAttribute("disabled")
    await userEvent.click(key)
    await expect(args.onPunch).not.toHaveBeenCalled()
  },
}

export const Dark: Story = { globals: { theme: "dark" } }

/** With reduced motion, a new stamp appears in place instead of landing. */
export const ReducedMotion: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Punch in" }))
    const fresh = canvasElement.querySelector('[data-slot="time-card-stamp"][data-fresh]')
    await expect(fresh).not.toBeNull()
    await expect(fresh!.className).toContain("motion-reduce:transition-none")
  },
}
