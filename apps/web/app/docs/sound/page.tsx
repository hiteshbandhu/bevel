import type { Metadata } from "next"
import { guideMetadata } from "@/lib/og"
import { CodeBlock } from "@/components/code-block"
import { Guide, Note } from "@/components/prose"
import { SoundDemo } from "@/components/sound-demo"

export const metadata: Metadata = guideMetadata("sound")

export default function Sound() {
  return (
    <Guide slug="sound">
      <p>
        Real switches make a noise, and the noise tells you the switch went. Bevel controls can do the same:
        a tick for each detent on a knob, a snap for a toggle, a thunk when a breaker or a plug lands. It&apos;s
        off by default, and stays off until your app turns it on.
      </p>
      <SoundDemo />

      <h2>Turn it on</h2>
      <p>
        Install the <code>feedback</code> item (components that make sounds pull it in for you), then wrap
        the part of your app that should click in <code>BevelFeedback</code>. Drive it from a setting, so
        people who don&apos;t want sound never hear it.
      </p>
      <CodeBlock lang="bash" title="Terminal" code={`npx shadcn@latest add @bevel/feedback`} />
      <CodeBlock
        lang="tsx"
        title="app/providers.tsx"
        code={`"use client"

import { BevelFeedback } from "@/lib/feedback"

export function Providers({ children, settings }) {
  return (
    <BevelFeedback sound={settings.sound} haptics={settings.haptics}>
      {children}
    </BevelFeedback>
  )
}`}
      />

      <h2>Your own controls</h2>
      <p>
        <code>useBevelFeedback()</code> returns <code>click</code>, <code>detent</code>, <code>thunk</code> and{" "}
        <code>toggle</code>. Call them from event handlers. Outside the provider, or with it off, they do
        nothing, so a component can call them unconditionally.
      </p>
      <CodeBlock
        lang="tsx"
        title="A button that clicks"
        code={`const { click } = useBevelFeedback()

<button onClick={() => { click(); save() }}>Save</button>`}
      />

      <h2>How it works</h2>
      <ul>
        <li>
          Sounds are synthesised with the Web Audio API: short bursts of filtered noise, with a falling tone
          under the heavy ones. There are no audio files to load.
        </li>
        <li>
          The audio context is created on the first sound, which always comes from a click or a key press,
          so browsers let it start.
        </li>
        <li>
          Haptics use <code>navigator.vibrate</code>, which Android browsers support. Elsewhere they do
          nothing.
        </li>
        <li>Only actions make a sound. Nothing clicks when a value changes on its own.</li>
      </ul>
      <Note>
        Sound is separate from reduced motion: someone who wants less movement may still want to hear a
        switch go. Give people a setting for each, and leave both off until they choose.
      </Note>
    </Guide>
  )
}
