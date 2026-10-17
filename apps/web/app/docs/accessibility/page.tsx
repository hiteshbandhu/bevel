import type { Metadata } from "next"
import { Guide, Note } from "@/components/prose"

export const metadata: Metadata = { title: "Accessibility" }

export default function Accessibility() {
  return (
    <Guide slug="accessibility">
      <p>
        A skeuomorphic interface makes its meaning visual: a lamp is lit, a cover is open, a needle points
        at red. Bevel&apos;s rule is that everything an object shows, it also says.
      </p>

      <h2>Real roles</h2>
      <p>
        Controls are built on Base UI primitives (Switch, Radio, Toggle, Checkbox, Meter, Progress) or
        follow the ARIA pattern for their role exactly. A detent knob is a <code>slider</code> with{" "}
        <code>aria-valuetext</code> like “High, 3 of 4”. A contact-sheet frame is a button named “3. Dusk,
        picked”. Decorative parts (grain, needles, flaps, sprocket holes) are hidden from assistive tech.
      </p>

      <h2>Keyboard</h2>
      <ul>
        <li>Everything you can do with a pointer, you can do with a keyboard.</li>
        <li>
          Groups use arrow keys (radio groups, contact-sheet frames, the knob), and focus order follows
          the steps: a guarded switch&apos;s cover comes before the switch.
        </li>
        <li>
          Held actions use Space: push-to-talk records while Space is down. Enter does nothing there,
          because it can&apos;t be held.
        </li>
        <li>
          A disabled action stays focusable when it has a reason to give (“Locked by 2: Priya, Sam”).
        </li>
      </ul>

      <h2>Announcements</h2>
      <p>
        Live regions announce changes of state, never ticks. A timer counting down doesn&apos;t talk over
        the user; the dead man&apos;s switch says “Stopping soon” once. A departure board gathers its
        changes and announces “Updated: US East, EU West.” once.
      </p>

      <h2>Motion and colour</h2>
      <ul>
        <li>
          Every transition stops under <code>prefers-reduced-motion</code>. Where motion carried meaning, it
          gets a still equivalent: split-flaps crossfade, and unseen alarms show a dot instead of
          flashing.
        </li>
        <li>Colour is never the only signal: states have words, and lit lamps have text.</li>
        <li>Edges that matter have forced-colours fallbacks.</li>
      </ul>

      <Note>
        Every component has stories run as browser tests with axe checks set to fail, including a
        keyboard walkthrough.
      </Note>
    </Guide>
  )
}
