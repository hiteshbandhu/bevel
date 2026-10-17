import type { Metadata } from "next"
import { Meterline } from "@/components/demo-sites/meterline/meterline"

export const metadata: Metadata = { title: "Meterline — demo" }

export default function MeterlineDemo() {
  return <Meterline />
}
