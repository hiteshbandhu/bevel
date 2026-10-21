import type { Metadata } from "next"
import { demoSites } from "@/lib/demos"
import { preview } from "@/lib/og"
import { Meterline } from "@/components/demo-sites/meterline/meterline"

export const metadata: Metadata = {
  title: "Meterline, a demo built with Bevel",
  ...preview({ title: "Meterline, a Bevel demo", description: demoSites[1]!.description, image: "demo-2.jpg", path: "/demo/2" }),
}

export default function MeterlineDemo() {
  return <Meterline />
}
