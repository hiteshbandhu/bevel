"use client"

import { usePathname } from "next/navigation"
import { CopyButton } from "@/components/copy-button"
import { demoSites } from "@/lib/demos"
import { registryNamespace } from "@/lib/site"

/** The install command for the demo on screen: every demo is also a block. */
export function DemoInstall() {
  const pathname = usePathname()
  const site = demoSites.find((s) => pathname === `/demo/${s.n}`)
  if (!site) return null
  const command = `npx shadcn@latest add ${registryNamespace}/${site.block}`
  return (
    <div className="ml-auto hidden shrink-0 items-center gap-2 pl-4 font-mono text-xs text-muted-foreground md:flex">
      <span className="sr-only">Install this screen:</span>
      <code>{command}</code>
      <CopyButton value={command} />
    </div>
  )
}
