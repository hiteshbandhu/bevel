import type { Metadata } from "next"
import { CasefileApp } from "@/components/demo-sites/casefile/casefile-app"

export const metadata: Metadata = { title: "Casefile — demo" }

export default function CasefileDemoPage() {
  return <CasefileApp />
}
