import type { Metadata } from "next"
import { Shipyard } from "@/components/demo-sites/shipyard/shipyard"

export const metadata: Metadata = { title: "Shipyard — demo" }

export default function ShipyardDemo() {
  return <Shipyard />
}
