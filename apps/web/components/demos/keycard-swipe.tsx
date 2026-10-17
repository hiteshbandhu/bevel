"use client"

import * as React from "react"
import { Keycard, KeycardKey, KeycardLabel, KeycardSwipe } from "@workspace/ui/components/keycard"

/** Swipe the key through the reader to switch billing to it; swipe again to switch back. */
export function KeycardSwipeDemo() {
  const [inUse, setInUse] = React.useState(false)
  return (
    <KeycardSwipe
      accepted={inUse}
      onSwipe={() => setInUse((v) => !v)}
      label={inUse ? "Swipe to stop using your key" : "Swipe to use your key"}
      status={inUse ? "Billed to your key" : "Swipe to bill to your key"}
    >
      <Keycard>
        <KeycardLabel>Your OpenAI key</KeycardLabel>
        <KeycardKey value="sk-proj-8f2c91d0a7e44b3c9e1f" />
      </Keycard>
    </KeycardSwipe>
  )
}
