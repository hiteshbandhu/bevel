"use client"

import * as React from "react"
import { Tabs } from "@base-ui/react/tabs"

const tabClass =
  "relative h-9 rounded-sm px-1 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-active:text-foreground"

/** One example: the live component in its tray, and the code that renders it. */
export function Example({
  id,
  title,
  description,
  code,
  children,
}: {
  id: string
  title: string
  description: string
  code: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 max-w-prose text-muted-foreground">{description}</p>
      <Tabs.Root defaultValue="preview" className="mt-4">
        <Tabs.List className="relative flex gap-5 border-b">
          <Tabs.Tab value="preview" className={tabClass}>
            Preview
          </Tabs.Tab>
          <Tabs.Tab value="code" className={tabClass}>
            Code
          </Tabs.Tab>
          <Tabs.Indicator className="absolute bottom-0 left-(--active-tab-left) h-0.5 w-(--active-tab-width) bg-foreground transition-[left,width] duration-(--bevel-duration-small) ease-(--bevel-ease-out) motion-reduce:transition-none" />
        </Tabs.List>
        <Tabs.Panel value="preview" className="mt-4 outline-none" keepMounted>
          <div className="tray flex min-h-96 items-center justify-center rounded-(--bevel-radius-xl) px-4 py-12 sm:px-10">
            <div className="w-full max-w-sm">{children}</div>
          </div>
        </Tabs.Panel>
        <Tabs.Panel value="code" className="mt-4 outline-none">
          {code}
        </Tabs.Panel>
      </Tabs.Root>
    </section>
  )
}
