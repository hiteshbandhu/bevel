import type { Metadata } from "next"
import { demoSites } from "@/lib/demos"
import { preview } from "@/lib/og"
import { CasefileApp } from "@/components/demo-sites/casefile/casefile-app"

export const metadata: Metadata = {
  title: "Casefile — demo",
  ...preview({ title: "Casefile, a Bevel demo", description: demoSites[3]!.description, image: "demo-4.jpg" }),
}

export default function CasefileDemoPage() {
  return <CasefileApp />
}
