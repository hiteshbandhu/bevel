"use client"

import * as React from "react"
import {
  Approval,
  ApprovalActions,
  ApprovalDescription,
  ApprovalReject,
  ApprovalSeal,
  ApprovalSignature,
  ApprovalSignatures,
  ApprovalTitle,
  type ApprovalState,
} from "@workspace/ui/components/approval"

/** The drafting agent wants to send a redline. Hold the seal to approve it. */
export function ApprovalSend() {
  const [state, setState] = React.useState<ApprovalState>("pending")
  return (
    <div className="flex flex-col items-center gap-4">
      <Approval state={state} onApprove={() => setState("approved")} onReject={() => setState("rejected")}>
        <ApprovalTitle>Send the redline to opposing counsel</ApprovalTitle>
        <ApprovalDescription>
          The drafting agent will email it to j.lee@haleward.com. Sent email can&apos;t be recalled.
        </ApprovalDescription>
        <ApprovalSignatures>
          <ApprovalSignature name="Priya Shah" signed />
          <ApprovalSignature name="You" signed={state === "approved"} />
        </ApprovalSignatures>
        <ApprovalActions>
          <ApprovalReject>Send back</ApprovalReject>
          <ApprovalSeal />
        </ApprovalActions>
      </Approval>
      <button
        type="button"
        disabled={state === "pending"}
        onClick={() => setState("pending")}
        className="h-9 rounded-md border px-3 text-sm font-medium hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
      >
        Reset
      </button>
    </div>
  )
}
