"use client"

import * as React from "react"
import { Redaction } from "@workspace/ui/components/redaction"
import { Stamp } from "@workspace/ui/components/stamp"

type Viewer = "firm" | "opposing"

/**
 * A privileged memo. Our firm sees everything; opposing counsel sees the
 * redactions. Withheld text is only passed in for viewers allowed to read it.
 */
export function PrivilegeMarks() {
  const [viewer, setViewer] = React.useState<Viewer>("opposing")
  const canSee = viewer === "firm"

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-4">
      <div role="radiogroup" aria-label="View as" className="flex rounded-md border p-0.5 text-sm">
        {(
          [
            ["firm", "Our firm"],
            ["opposing", "Opposing counsel"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={viewer === value}
            onClick={() => setViewer(value)}
            className="h-8 rounded-sm px-3 font-medium text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring aria-checked:bg-muted aria-checked:text-foreground"
          >
            {label}
          </button>
        ))}
      </div>
      <article className="bevel-paper relative w-full rounded-(--bevel-radius-xs) p-6 text-sm leading-relaxed">
        <div className="mb-4 flex flex-wrap gap-3">
          <Stamp tone="red">Privileged</Stamp>
          <Stamp tone="black">Confidential</Stamp>
        </div>
        <h3 className="font-semibold">Memo: Harbor Street lease dispute</h3>
        <p className="mt-2">
          The client confirmed the notice was sent on 3 March by{" "}
          {canSee ? <Redaction revealed>email only, not by hand</Redaction> : <Redaction length={22} reason="privileged" />}
          . Our view is that{" "}
          {canSee ? (
            <Redaction revealed>the court will likely find notice invalid under clause 9.2</Redaction>
          ) : (
            <Redaction length={52} reason="attorney work product" />
          )}
          , so we recommend settling before the hearing.
        </p>
      </article>
    </div>
  )
}
