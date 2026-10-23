import { Amount } from "@workspace/ui/components/amount"
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

const entries = [
  { no: 45, date: "17 Oct", what: "Credits bought", amount: 50, after: 74.6 },
  {
    no: 44,
    date: "16 Oct",
    what: "Usage, 212 calls",
    amount: -18.4,
    after: 24.6,
  },
  { no: 43, date: "14 Oct", what: "Refund, case 118", amount: 12, after: 43 },
  { no: 42, date: "12 Oct", what: "Credits bought", amount: 10, after: 31 },
  { no: 41, date: "9 Oct", what: "Usage, 96 calls", amount: -9, after: 21 },
]

/** A credit history on ruled ledger paper: numbered entries, signed amounts and a running balance. */
export function LedgerHistory() {
  return (
    <Ledger className="w-[34rem]">
      <LedgerTitle>Credit ledger</LedgerTitle>
      <LedgerTable>
        <LedgerHeader>
          <LedgerRow>
            <LedgerHead>No.</LedgerHead>
            <LedgerHead>Date</LedgerHead>
            <LedgerHead>Entry</LedgerHead>
            <LedgerHead className="text-right">Amount</LedgerHead>
            <LedgerHead className="text-right">Balance</LedgerHead>
          </LedgerRow>
        </LedgerHeader>
        <LedgerBody>
          {entries.map((e) => (
            <LedgerRow key={e.no}>
              <LedgerCell>
                <LedgerNumber value={e.no} />
              </LedgerCell>
              <LedgerCell>{e.date}</LedgerCell>
              <LedgerCell>{e.what}</LedgerCell>
              <LedgerCell className="text-right">
                <LedgerAmount value={e.amount} currency="USD" />
              </LedgerCell>
              <LedgerCell className="text-right">
                <Amount value={e.after} currency="USD" />
              </LedgerCell>
            </LedgerRow>
          ))}
        </LedgerBody>
      </LedgerTable>
    </Ledger>
  )
}
