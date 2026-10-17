"use client"

import * as React from "react"
import {
  Mixer,
  MixerStrip,
  MixerStripFader,
  MixerStripMute,
  MixerStripName,
  MixerStripSolo,
} from "@workspace/ui/components/mixer-strip"

type Channel = { name: string; share: number; by: string; muted: boolean }

const start: Channel[] = [
  { name: "Research", share: 60, by: "Lead", muted: false },
  { name: "Code", share: 80, by: "Lead", muted: false },
  { name: "Tests", share: 45, by: "Lead", muted: false },
  { name: "Docs", share: 20, by: "Lead", muted: false },
]

/**
 * A lead agent splits effort between its subagents and rebalances as it
 * goes. Take a fader to override it; mute pauses a subagent, solo runs one alone.
 */
export function MixerStripAgents() {
  const [channels, setChannels] = React.useState(start)
  const [solo, setSolo] = React.useState<string | null>(null)
  const update = (name: string, patch: Partial<Channel>) =>
    setChannels((all) => all.map((c) => (c.name === name ? { ...c, ...patch } : c)))

  React.useEffect(() => {
    const timer = setInterval(() => {
      setChannels((all) => {
        const led = all.filter((c) => c.by === "Lead")
        const pick = led[Math.floor(Math.random() * led.length)]
        if (!pick) return all
        const share = Math.min(100, Math.max(5, pick.share + (Math.random() > 0.5 ? 25 : -25)))
        return all.map((c) => (c === pick ? { ...c, share } : c))
      })
    }, 2400)
    return () => clearInterval(timer)
  }, [])

  const running = (c: Channel) => !c.muted && (solo === null || solo === c.name)

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <Mixer aria-label="Subagents">
        {channels.map((c) => (
          <MixerStrip key={c.name} name={c.name} muted={!running(c)}>
            <MixerStripName />
            <MixerStripMute pressed={c.muted} onPressedChange={(muted) => update(c.name, { muted })} />
            <MixerStripSolo pressed={solo === c.name} onPressedChange={(on) => setSolo(on ? c.name : null)} />
            <MixerStripFader
              value={c.share}
              changedBy={c.by}
              format={(v) => `${v}%`}
              onValueChange={(share) => update(c.name, { share, by: "You" })}
            />
          </MixerStrip>
        ))}
      </Mixer>
      <p role="status" className="text-center text-sm text-muted-foreground">
        Running: {channels.filter(running).map((c) => c.name).join(", ") || "nothing"}
      </p>
    </div>
  )
}
