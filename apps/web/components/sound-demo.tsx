"use client"

import * as React from "react"
import { BevelFeedback } from "@workspace/ui/lib/feedback"
import { Breaker } from "@workspace/ui/components/breaker"
import { DetentKnob, DetentKnobStop } from "@workspace/ui/components/detent-knob"
import { PushToTalk, PushToTalkKey, PushToTalkStatus } from "@workspace/ui/components/push-to-talk"

/** The live toggle on /docs/sound: the same controls, with feedback on or off. */
export function SoundDemo() {
  const [sound, setSound] = React.useState(false)
  const [haptics, setHaptics] = React.useState(false)
  const [talking, setTalking] = React.useState(false)
  return (
    <div className="my-6 flex flex-col gap-6 rounded-xl border bg-card p-6">
      <div className="flex flex-wrap items-center gap-3">
        <Toggle pressed={sound} onPressedChange={setSound}>
          Sound
        </Toggle>
        <Toggle pressed={haptics} onPressedChange={setHaptics}>
          Haptics
        </Toggle>
        <p className="m-0 text-sm text-muted-foreground">
          {sound || haptics ? "Turn the knob, flip the breaker, hold the key." : "Off: the controls are silent."}
        </p>
      </div>
      <BevelFeedback sound={sound} haptics={haptics}>
        <div className="flex flex-wrap items-center justify-center gap-8">
          <DetentKnob aria-label="Verbosity" defaultValue="normal">
            <DetentKnobStop value="quiet">Quiet</DetentKnobStop>
            <DetentKnobStop value="normal">Normal</DetentKnobStop>
            <DetentKnobStop value="chatty">Chatty</DetentKnobStop>
          </DetentKnob>
          <Breaker label="Web search" defaultChecked />
          <PushToTalk talking={talking} onTalkingChange={setTalking} className="w-44">
            <PushToTalkKey />
            <PushToTalkStatus />
          </PushToTalk>
        </div>
      </BevelFeedback>
    </div>
  )
}

function Toggle({
  pressed,
  onPressedChange,
  children,
}: {
  pressed: boolean
  onPressedChange: (pressed: boolean) => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onPressedChange(!pressed)}
      className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring aria-pressed:bg-foreground aria-pressed:text-background"
    >
      <span aria-hidden className="size-2 rounded-full bg-current opacity-60" />
      {children}: {pressed ? "on" : "off"}
    </button>
  )
}
