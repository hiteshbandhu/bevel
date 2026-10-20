import type { Metadata } from "next"
import { demoSites } from "@/lib/demos"
import { preview } from "@/lib/og"
import { Shipyard } from "@/components/demo-sites/shipyard/shipyard"

export const metadata: Metadata = {
  title: "Shipyard — demo",
  ...preview({ title: "Shipyard, a Bevel demo", description: demoSites[2]!.description, image: "demo-3.jpg" }),
}

export default function ShipyardDemo() {
  return <Shipyard />
}
