import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect, waitFor } from "storybook/test"
import {
  Receipt,
  ReceiptFooter,
  ReceiptHeader,
  ReceiptItem,
  ReceiptItems,
  ReceiptLabel,
  ReceiptMark,
  ReceiptMeta,
  ReceiptSeparator,
  ReceiptTitle,
  ReceiptTotal,
  ReceiptValue,
} from "@workspace/ui/components/receipt"
import { Stamp } from "@workspace/ui/components/stamp"

const meta = {
  title: "Money/Receipt",
  component: Receipt,
  args: { variant: "thermal" },
  argTypes: { variant: { control: "inline-radio", options: ["thermal", "carbon"] } },
  parameters: { layout: "centered" },
  render: (args) => (
    <Receipt {...args}>
      <ReceiptHeader>
        <ReceiptTitle>Credit purchase</ReceiptTitle>
        <ReceiptMeta>17 Oct 2026, 14:02</ReceiptMeta>
      </ReceiptHeader>
      <ReceiptSeparator />
      <ReceiptItems>
        <ReceiptItem>
          <ReceiptLabel>50 credits</ReceiptLabel>
          <ReceiptValue>$50.00</ReceiptValue>
        </ReceiptItem>
        <ReceiptItem>
          <ReceiptLabel>A very long line item name that has to wrap</ReceiptLabel>
          <ReceiptValue>$1.75</ReceiptValue>
        </ReceiptItem>
      </ReceiptItems>
      <ReceiptSeparator />
      <ReceiptTotal>
        <ReceiptLabel>Total</ReceiptLabel>
        <ReceiptValue>$51.75</ReceiptValue>
      </ReceiptTotal>
      <ReceiptFooter>Credits never expire.</ReceiptFooter>
    </Receipt>
  ),
} satisfies Meta<typeof Receipt>

export default meta
type Story = StoryObj<typeof meta>

export const Thermal: Story = {
  play: async ({ canvas }) => {
    // Lines are a description list: label and value pairs.
    await expect(canvas.getByText("Total").tagName).toBe("DT")
    await expect(canvas.getByText("$51.75").tagName).toBe("DD")
  },
}

export const Carbon: Story = { args: { variant: "carbon" } }

function Printing() {
  const [lines, setLines] = React.useState(["50 credits"])
  const [paid, setPaid] = React.useState(false)
  return (
    <div className="flex flex-col items-center gap-4">
      <Receipt>
        <ReceiptItems>
          {lines.map((line) => (
            <ReceiptItem key={line}>
              <ReceiptLabel>{line}</ReceiptLabel>
              <ReceiptValue>$1.00</ReceiptValue>
            </ReceiptItem>
          ))}
        </ReceiptItems>
        {paid && (
          <ReceiptMark>
            <Stamp animate role="status">
              Paid
            </Stamp>
          </ReceiptMark>
        )}
      </Receipt>
      <button type="button" onClick={() => setLines((l) => [...l, `Line ${l.length + 1}`])}>
        Add line
      </button>
      <button type="button" onClick={() => setPaid(true)}>
        Pay
      </button>
    </div>
  )
}

/** Lines added after first render print in; the first line does not. */
export const PrintsNewLines: Story = {
  render: () => <Printing />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const first = canvasElement.querySelector("[data-slot=receipt-item]")!
    await expect(first).not.toHaveAttribute("data-enter")
    await userEvent.click(canvas.getByRole("button", { name: "Add line" }))
    await waitFor(() => expect(canvas.getByText("Line 2")).toBeInTheDocument())
    const added = [...canvasElement.querySelectorAll("[data-slot=receipt-item]")].at(-1)!
    await expect(added).toHaveAttribute("data-enter")
    await userEvent.click(canvas.getByRole("button", { name: "Pay" }))
    await expect(canvas.getByRole("status")).toHaveTextContent("Paid")
  },
}
