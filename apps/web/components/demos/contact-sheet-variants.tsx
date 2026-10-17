"use client"

import * as React from "react"
import { ContactSheet, ContactSheetFrame } from "@workspace/ui/components/contact-sheet"

// Eight generated variants of one prompt, drawn as simple landscapes.
const variants = [
  { id: "v1", label: "Dusk, low sun", sky: 40, land: 60, sun: 0.7 },
  { id: "v2", label: "Noon, haze", sky: 230, land: 120, sun: 0.25 },
  { id: "v3", label: "Night, moon", sky: 270, land: 250, sun: 0.35 },
  { id: "v4", label: "Dawn, pink", sky: 350, land: 30, sun: 0.85 },
  { id: "v5", label: "Storm", sky: 250, land: 160, sun: 0.1 },
  { id: "v6", label: "Desert", sky: 60, land: 70, sun: 0.5 },
  { id: "v7", label: "Arctic", sky: 210, land: 220, sun: 0.6 },
  { id: "v8", label: "Jungle", sky: 160, land: 140, sun: 0.4 },
]

function Scene({ sky, land, sun }: { sky: number; land: number; sun: number }) {
  return (
    <svg viewBox="0 0 90 60" className="block size-full" aria-hidden>
      <rect width="90" height="60" fill={`oklch(0.72 0.1 ${sky})`} />
      <circle cx={20 + sun * 50} cy={40 - sun * 26} r="7" fill="oklch(0.95 0.08 90)" />
      <path d="M0 42 Q20 30 40 40 T90 36 V60 H0 Z" fill={`oklch(0.45 0.09 ${land})`} />
      <path d="M0 50 Q30 44 55 50 T90 48 V60 H0 Z" fill={`oklch(0.32 0.07 ${land})`} />
    </svg>
  )
}

/** Review eight generated variants. Circle the keepers, cross out the rest. */
export function ContactSheetVariants() {
  const [marks, setMarks] = React.useState<Record<string, "pick" | "reject">>({ v1: "pick", v5: "reject" })
  const picked = variants.filter((v) => marks[v.id] === "pick")
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <ContactSheet aria-label="Generated variants" value={marks} onValueChange={setMarks} columns={4}>
        {variants.map((v) => (
          <ContactSheetFrame key={v.id} id={v.id} label={v.label}>
            <Scene {...v} />
          </ContactSheetFrame>
        ))}
      </ContactSheet>
      <p className="text-sm text-muted-foreground">
        Click to cycle, or use arrow keys with P, X and Backspace.{" "}
        {picked.length ? `Keeping: ${picked.map((v) => v.label).join(", ")}.` : "Nothing kept yet."}
      </p>
    </div>
  )
}
