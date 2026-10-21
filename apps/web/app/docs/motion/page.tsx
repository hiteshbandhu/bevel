import type { Metadata } from "next"
import { guideMetadata } from "@/lib/og"
import { CodeBlock } from "@/components/code-block"
import { Guide, Note } from "@/components/prose"

export const metadata: Metadata = guideMetadata("motion")

export default function Motion() {
  return (
    <Guide slug="motion">
      <p>
        Physical objects move with weight: a key gives under a finger, a card slides, a needle settles
        with a little overshoot. Bevel gets that from CSS transitions and a handful of tokens.
      </p>

      <h2>Durations by purpose</h2>
      <ul>
        <li>
          <code>--bevel-duration-press</code> (100ms): a control giving under a finger.
        </li>
        <li>
          <code>--bevel-duration-small</code> (200ms): hover lifts, small state changes.
        </li>
        <li>
          <code>--bevel-duration-move</code> (300ms): objects moving: cards, flaps, levers.
        </li>
        <li>
          <code>--bevel-duration-ambient</code> (520ms): whole-scene changes, needles, motors.
        </li>
      </ul>
      <p>
        Pick the duration by what&apos;s happening, not by feel. Curves: <code>--bevel-ease-out</code> for
        things arriving, <code>--bevel-ease-in-out</code> for things travelling, and{" "}
        <code>--bevel-ease-spring</code>, a CSS <code>linear()</code> spring with a slight overshoot, for
        things that settle.
      </p>

      <h2>Only the compositor moves</h2>
      <p>
        Components animate <code>transform</code>, <code>translate</code>, <code>rotate</code>,{" "}
        <code>scale</code>, <code>opacity</code> and <code>filter</code>. They never animate{" "}
        <code>height</code>, <code>width</code>, <code>top</code>, <code>left</code>, margins or padding.
        Animating layout reflows the whole page every frame: adding a card to a wallet cost 678ms of main
        thread work with a height transition and 94ms without.
      </p>
      <CodeBlock
        lang="tsx"
        title="Objects keep their size; their contents move"
        code={`<span
  className="transition-[translate] duration-(--bevel-duration-ambient) ease-(--bevel-ease-in-out)"
  style={{ translate: \`0 calc(var(--motorized-fader-travel) * \${-t})\` }}
/>`}
      />

      <h2>When JavaScript moves things</h2>
      <p>
        Only for gestures with velocity, like swiping a keycard. Everything else is a CSS transition
        between states, which also makes it interruptible for free.
      </p>
      <Note>
        Every transition includes <code>motion-reduce:transition-none</code>. With reduced motion,
        things change state immediately, or crossfade where a jump would be lost.
      </Note>
    </Guide>
  )
}
