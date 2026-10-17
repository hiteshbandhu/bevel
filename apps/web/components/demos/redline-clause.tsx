"use client"

import { Redline, RedlineChange, RedlineDocument, RedlineToolbar } from "@workspace/ui/components/redline"

/** The drafting agent's suggested edits to a notice clause. Nothing changes until you decide. */
export function RedlineClause() {
  return (
    <Redline>
      <RedlineDocument>
        <strong>9.2 Notice.</strong> Either party may end this lease on{" "}
        <RedlineChange id="period" deletion="thirty (30)" insertion="sixty (60)" /> days&apos; written notice
        delivered <RedlineChange id="delivery" deletion="by hand" insertion="by hand or by registered post" /> to
        the address in Schedule B
        <RedlineChange id="email" insertion=". Notice by email alone is not valid" />.
      </RedlineDocument>
      <RedlineToolbar />
    </Redline>
  )
}
