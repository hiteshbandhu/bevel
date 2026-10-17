"use client"

import * as React from "react"
import { Breaker } from "@workspace/ui/components/breaker"
import { Keycard, KeycardKey, KeycardLabel, KeycardSlot } from "@workspace/ui/components/keycard"

/** Bring your own key: put it in the reader and usage bills to it instead of credits. */
export function KeycardByok() {
  const [inUse, setInUse] = React.useState(false)
  return (
    <div className="flex flex-col items-center gap-6">
      <KeycardSlot inserted={inUse} status={inUse ? "Billed to your key" : "Billed to credits"}>
        <Keycard>
          <KeycardLabel>Your OpenAI key</KeycardLabel>
          <KeycardKey value="sk-proj-8f2c91d0a7e44b3c9e1f" />
        </Keycard>
      </KeycardSlot>
      <Breaker label="Use my key" checked={inUse} onCheckedChange={setInUse} />
    </div>
  )
}
