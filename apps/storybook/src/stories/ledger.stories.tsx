import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import {
  Ledger,
  LedgerAmount,
  LedgerBody,
  LedgerCell,
  LedgerHead,
  LedgerHeader,
  LedgerNumber,
  LedgerRow,
  LedgerTable,
  LedgerTitle,
} from "@workspace/ui/components/ledger"
import { Stamp } from "@workspace/ui/components/stamp"

const meta = {
  title: "Money/Ledger",
  component: Ledger,
  parameters: { layout: "padded" },
  render: () => (
    <Ledger className="max-w-xl">
      <LedgerTitle>Credit ledger</LedgerTitle>
      <LedgerTable>
        <LedgerHeader>
          <LedgerRow>
            <LedgerHead>No.</LedgerHead>
            <LedgerHead>Entry</LedgerHead>
            <LedgerHead className="text-right">Amount</LedgerHead>
            <LedgerHead>Status</LedgerHead>
          </LedgerRow>
        </LedgerHeader>
        <LedgerBody>
          <LedgerRow>
            <LedgerCell>
              <LedgerNumber value={42} />
            </LedgerCell>
            <LedgerCell>Credits bought</LedgerCell>
            <LedgerCell className="text-right">
              <LedgerAmount value={10} currency="USD" />
            </LedgerCell>
            <LedgerCell>
              <Stamp tone="green">Received</Stamp>
            </LedgerCell>
          </LedgerRow>
          <LedgerRow>
            <LedgerCell>
              <LedgerNumber value={43} />
            </LedgerCell>
            <LedgerCell>Usage</LedgerCell>
            <LedgerCell className="text-right">
              <LedgerAmount value={-4.2} currency="USD" />
            </LedgerCell>
            <LedgerCell>
              <Stamp tone="blue">Auto</Stamp>
            </LedgerCell>
          </LedgerRow>
        </LedgerBody>
      </LedgerTable>
    </Ledger>
  ),
} satisfies Meta<typeof Ledger>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("table")).toBeVisible()
    await expect(canvas.getAllByRole("columnheader")).toHaveLength(4)
    await expect(canvas.getAllByText("Entry", { selector: ".sr-only" })).toHaveLength(2)
    const [credit, debit] = [...canvasElement.querySelectorAll("[data-slot=amount]")]
    await expect(credit).toHaveTextContent("+$10.00")
    await expect(debit).toHaveAttribute("data-sign", "negative")
    // Every row is exactly one rule tall, so text sits on the lines.
    const rule = parseFloat(getComputedStyle(canvasElement.querySelector("[data-slot=ledger]")!).getPropertyValue("--ledger-rule"))
    const row = canvasElement.querySelector("tbody tr")!.getBoundingClientRect().height
    await expect(row).toBeCloseTo(rule * 16, 0)
  },
}
