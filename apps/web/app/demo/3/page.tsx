import type { Metadata } from "next"
import { demoSites } from "@/lib/demos"
import { preview } from "@/lib/og"
import { Shipyard } from "@/components/demo-sites/shipyard/shipyard"

export const metadata: Metadata = {
  title: "Shipyard, a demo built with Bevel",
  ...preview({ title: "Shipyard, a Bevel demo", description: demoSites[2]!.description, image: "demo-3.jpg", path: "/demo/3" }),
}

export default function ShipyardDemo() {
  return <Shipyard />
}
