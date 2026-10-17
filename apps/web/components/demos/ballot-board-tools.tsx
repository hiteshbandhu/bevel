"use client"

import * as React from "react"
import { BallotBoard, BallotCommit, BallotLever, BallotRace } from "@workspace/ui/components/ballot-board"

const proposals = [
  { id: "read", action: "Read the three lease PDFs" },
  { id: "email", action: "Email the summary to the client" },
  { id: "delete", action: "Delete the old draft folder" },
]

/** An agent proposes actions; you decide each one, then pull the lever to send all decisions at once. */
export function BallotBoardTools() {
  const [last, setLast] = React.useState<string | null>(null)
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <BallotBoard
        onCommit={(s) =>
          setLast(
            proposals.map((p) => `${p.action}: ${s[p.id]?.[0] ?? "no decision"}`).join(" · ") +
              (s.reviewers?.length ? ` · Reviewers: ${s.reviewers.join(", ")}` : "")
          )
        }
      >
        {proposals.map((p) => (
          <BallotRace key={p.id} name={p.id} label={p.action}>
            <BallotLever value="approve">Approve</BallotLever>
            <BallotLever value="deny">Deny</BallotLever>
          </BallotRace>
        ))}
        <BallotRace name="reviewers" label="Who reviews the summary? Pick two" max={2}>
          <BallotLever value="Priya">Priya</BallotLever>
          <BallotLever value="Sam">Sam</BallotLever>
          <BallotLever value="Ana">Ana</BallotLever>
          <BallotLever value="Lee">Lee</BallotLever>
        </BallotRace>
        <BallotCommit>Send decisions</BallotCommit>
      </BallotBoard>
      {last && <p className="text-center text-xs text-muted-foreground">{last}</p>}
    </div>
  )
}
