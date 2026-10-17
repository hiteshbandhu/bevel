import type { Metadata } from "next"
import { RelayApp } from "@/components/demo-sites/relay/relay-app"

export const metadata: Metadata = { title: "Relay — demo" }

export default function RelayDemoPage() {
  return <RelayApp />
}
