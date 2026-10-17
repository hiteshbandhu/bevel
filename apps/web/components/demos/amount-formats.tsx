import { Amount } from "@workspace/ui/components/amount"

const rows = [
  { label: "US dollars", value: 1240.5, currency: "USD" },
  { label: "Euros, German format", value: 1240.5, currency: "EUR", locale: "de-DE" },
  { label: "Yen, no minor unit", value: 98765, currency: "JPY", locale: "ja-JP" },
  { label: "Rupees, Indian grouping", value: 1234567.8, currency: "INR", locale: "en-IN" },
  { label: "Credits, signed", value: 500, signed: true },
]

export function AmountFormats() {
  return (
    <dl className="flex flex-col gap-3 text-sm">
      {rows.map(({ label, ...amount }) => (
        <div key={label} className="flex items-baseline justify-between gap-6">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="font-semibold">
            <Amount {...amount} />
          </dd>
        </div>
      ))}
    </dl>
  )
}
