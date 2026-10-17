"use client"

import * as React from "react"
import { PushToTalk, PushToTalkKey, PushToTalkStatus } from "@workspace/ui/components/push-to-talk"

/** Talk to the agent only while the key is held. Hold Space, or press and hold with the pointer. */
export function PushToTalkAgent() {
  const [talking, setTalking] = React.useState(false)
  const [seconds, setSeconds] = React.useState(0)
  const [clips, setClips] = React.useState<number[]>([])

  React.useEffect(() => {
    if (!talking) return
    const started = Date.now()
    const timer = setInterval(() => setSeconds((Date.now() - started) / 1000), 100)
    return () => {
      clearInterval(timer)
      setClips((c) => [...c.slice(-2), (Date.now() - started) / 1000])
      setSeconds(0)
    }
  }, [talking])

  return (
    <div className="flex flex-col items-center gap-4">
      <PushToTalk talking={talking} onTalkingChange={setTalking}>
        <PushToTalkKey />
        <PushToTalkStatus />
        {/* Shown, not announced: a live region that ticks would talk over you. */}
        <span aria-hidden className="h-4 font-mono text-xs tabular-nums opacity-70">
          {talking ? `${seconds.toFixed(1)}s` : ""}
        </span>
      </PushToTalk>
      <ul aria-label="Sent" className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
        {clips.map((c, i) => (
          <li key={i}>Sent a {c.toFixed(1)}s voice note</li>
        ))}
      </ul>
    </div>
  )
}
