import { Seal, Stamp, StampDetail } from "@workspace/ui/components/stamp"

export function StampMarks() {
  return (
    <div className="bevel-paper flex flex-wrap items-center justify-center gap-6 rounded-(--bevel-radius-xs) p-8">
      <Stamp>
        Received
        <StampDetail>17 Oct 2026</StampDetail>
      </Stamp>
      <Stamp tone="blue">Refunded</Stamp>
      <Stamp tone="black">Held</Stamp>
      <Stamp tone="green" shape="round">
        Auto
      </Stamp>
      <Seal text="Bevel · Credits verified ·">Paid</Seal>
    </div>
  )
}
