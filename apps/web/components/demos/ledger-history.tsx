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
import { Amount } from "@workspace/ui/components/amount"
import { Stamp } from "@workspace/ui/components/stamp"

const entries = [
  { no: 45, date: "17 Oct", what: "Credits bought", amount: 50, after: 74.6, status: "Received", tone: "green" },
  { no: 44, date: "16 Oct", what: "Usage, 212 calls", amount: -18.4, after: 24.6, status: "Auto", tone: "blue" },
  { no: 43, date: "14 Oct", what: "Refund, case 118", amount: 12, after: 43, status: "Returned", tone: "red" },
  { no: 42, date: "12 Oct", what: "Credits bought", amount: 10, after: 31, status: "Held", tone: "black" },
] as const

export function LedgerHistory() {
  return (
    <Ledger className="max-w-xl">
      <LedgerTitle>Credit ledger</LedgerTitle>
      <LedgerTable>
        <LedgerHeader>
          <LedgerRow>
            <LedgerHead>No.</LedgerHead>
            <LedgerHead>Date</LedgerHead>
            <LedgerHead>Entry</LedgerHead>
            <LedgerHead className="text-right">Amount</LedgerHead>
            <LedgerHead className="text-right">Balance</LedgerHead>
            <LedgerHead>Status</LedgerHead>
          </LedgerRow>
        </LedgerHeader>
        <LedgerBody>
          {entries.map((entry) => (
            <LedgerRow key={entry.no}>
              <LedgerCell>
                <LedgerNumber value={entry.no} />
              </LedgerCell>
              <LedgerCell>{entry.date}</LedgerCell>
              <LedgerCell>{entry.what}</LedgerCell>
              <LedgerCell className="text-right">
                <LedgerAmount value={entry.amount} currency="USD" />
              </LedgerCell>
              <LedgerCell className="text-right">
                <Amount value={entry.after} currency="USD" />
              </LedgerCell>
              <LedgerCell>
                <Stamp tone={entry.tone} className="px-1 py-0.5 text-(length:--bevel-fine)">
                  {entry.status}
                </Stamp>
              </LedgerCell>
            </LedgerRow>
          ))}
        </LedgerBody>
      </LedgerTable>
    </Ledger>
  )
}
