import type { Metadata } from "next"
import { demoSites } from "@/lib/demos"
import { preview } from "@/lib/og"
import { RelayApp } from "@/components/demo-sites/relay/relay-app"

export const metadata: Metadata = {
  title: "Relay, a demo built with Bevel",
  ...preview({ title: "Relay, a Bevel demo", description: demoSites[0]!.description, image: "demo-1.jpg", path: "/demo/1" }),
}

export default function RelayDemoPage() {
  return <RelayApp />
}
