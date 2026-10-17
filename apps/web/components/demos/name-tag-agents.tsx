"use client"

import * as React from "react"
import { NameTag, NameTagDetail, NameTagInput, NameTagName } from "@workspace/ui/components/name-tag"

/** Agents wear stickers, guests wear visitor badges, and lists use the plain tag. */
export function NameTagAgents() {
  const [name, setName] = React.useState("Drafting")
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-wrap items-start justify-center gap-6">
        <NameTag>
          <NameTagInput value={name} onChange={(e) => setName(e.target.value)} />
          <NameTagDetail>acting for Priya</NameTagDetail>
        </NameTag>
        <NameTag variant="visitor">
          <NameTagName>Jordan Lee</NameTagName>
          <NameTagDetail>Co-counsel, Hale &amp; Ward</NameTagDetail>
        </NameTag>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <NameTag variant="plain">
          <NameTagName>{name || "Unnamed"}</NameTagName>
        </NameTag>
        <NameTag variant="plain">
          <NameTagName>Research</NameTagName>
          <NameTagDetail>for Priya</NameTagDetail>
        </NameTag>
        <NameTag variant="plain">
          <NameTagName>Review</NameTagName>
        </NameTag>
      </div>
    </div>
  )
}
