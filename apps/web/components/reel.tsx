"use client"

import * as React from "react"
import { flushSync } from "react-dom"
import gsap from "gsap"
import { Annunciator, AnnunciatorPanel, AnnunciatorTile } from "@workspace/ui/components/annunciator"
import { EngineTelegraph, EngineTelegraphDial, EngineTelegraphOrder } from "@workspace/ui/components/engine-telegraph"
import { Key, KeyLamp } from "@workspace/ui/components/key"
import { Meter, MeterFlag, MeterHeader, MeterLabel, MeterReading } from "@workspace/ui/components/meter"
import { SplitFlap, SplitFlapRow, SplitFlapText } from "@workspace/ui/components/split-flap"
import { ToggleLever } from "@workspace/ui/components/toggle-lever"
import { GuardedSwitch, GuardedSwitchControl, GuardedSwitchLabel } from "@workspace/ui/components/guarded-switch"
import { previews } from "@/components/previews"
import { categories, components } from "@/lib/catalog"
import { origins } from "@/lib/origins"

/**
 * The components reel, built the motion2code way (github.com/lovisdotio/motion2code):
 * one GSAP timeline is the only clock, `window.anim.seek(t)` is a pure function
 * of t, and the last frame is the first. The real components render on the
 * stage; their states are read from the timeline's time, never from their own
 * transitions (switched off below), so every frame renders the same way twice.
 *
 *   /reel                  plays and loops
 *   /reel?t=6.5            frozen at 6.5 s
 *   /reel?external=1       waits to be driven (scripts/render-reel.mts)
 *   /reel?shape=vertical   1080×1920
 */

const DURATION = 20

/** The objects, one beat each: [start, end) seconds. */
const beats = [
  { slug: "meter", at: 4.6 },
  { slug: "split-flap", at: 6.15 },
  { slug: "annunciator", at: 7.7 },
  { slug: "toggle-lever", at: 9.25 },
  { slug: "key", at: 10.8 },
  { slug: "engine-telegraph", at: 12.35 },
  { slug: "wallet", at: 13.9 },
] as const
const BEAT = 1.55
const wall = ["guarded-switch", "annunciator", "split-flap", "meter", "wallet", "dial", "time-card", "key", "receipt", "stamp", "dip-switch", "toggle-lever"]
const command = "npx shadcn@latest add @bevel/meter"
/** Everyday-sized controls: they need more zoom than the objects to read on a stage. */
const small = new Set(["key", "toggle-lever", "dip-switch"])

/** How far t is through [a, b], clamped to 0..1. */
const progress = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)))

function plate(slug: string) {
  const o = origins[slug]
  if (!o) return null
  return o.kind === "patent" ? `${o.label.replace(/^([A-Z]{2}) /, "Pat. $1 ")}, ${o.year}` : `${o.relation}, ${o.year}`
}

/** Each object, with its state at time t (s is 0..1 through its beat). */
function Object_({ slug, s }: { slug: string; s: number }) {
  switch (slug) {
    case "meter":
      return (
        <Meter state={s < 0.85 ? "running" : "idle"} aria-label="Live usage">
          <MeterHeader>
            <MeterLabel>This turn</MeterLabel>
            <MeterFlag />
          </MeterHeader>
          <MeterReading value={Math.round(progress(s, 0.15, 0.8) * 142) / 1000} currency="USD" format={{ minimumFractionDigits: 3 }} />
        </Meter>
      )
    case "split-flap": {
      const flipped = s > 0.4
      return (
        <SplitFlap aria-label="Board">
          <SplitFlapRow name="a">
            <SplitFlapText value={flipped ? "EU-WEST" : "LONDON"} length={7} />
            <SplitFlapText value={flipped ? "LIVE" : "DLAY"} length={4} tone="amber" />
          </SplitFlapRow>
          <SplitFlapRow name="b">
            <SplitFlapText value={flipped ? "US-EAST" : "PARIS"} length={7} />
            <SplitFlapText value={flipped ? "SHIP" : "HOLD"} length={4} tone="amber" />
          </SplitFlapRow>
        </SplitFlap>
      )
    }
    case "annunciator":
      return (
        <Annunciator aria-label="Alerts">
          <AnnunciatorPanel className="grid-cols-2 sm:grid-cols-2">
            <AnnunciatorTile id="a" active={s > 0.2} tone="red">Over budget</AnnunciatorTile>
            <AnnunciatorTile id="b" active={s > 0.38}>Rate limited</AnnunciatorTile>
            <AnnunciatorTile id="c" active={s > 0.56}>Tests failing</AnnunciatorTile>
            <AnnunciatorTile id="d" active={s > 0.74} tone="green">Deploy live</AnnunciatorTile>
          </AnnunciatorPanel>
        </Annunciator>
      )
    case "toggle-lever":
      return (
        <div className="flex flex-col items-center gap-3">
          <ToggleLever aria-label="Alerts" checked={s > 0.35} tabIndex={-1} />
          <ToggleLever aria-label="Digest" checked={s > 0.6} tabIndex={-1} />
        </div>
      )
    case "key":
      return (
        <div className="flex items-center gap-2">
          <Key variant="secondary" tabIndex={-1}>
            Cancel
          </Key>
          <Key pending={s > 0.35 && s < 0.85} tabIndex={-1}>
            <KeyLamp />
            {s > 0.35 && s < 0.85 ? "Saving" : "Save"}
          </Key>
        </div>
      )
    case "engine-telegraph": {
      const order = s < 0.3 ? "stop" : s < 0.55 ? "ask" : "act"
      return (
        <EngineTelegraph aria-label="Autonomy" value={order} confirmed={s < 0.75 ? "stop" : order} className="max-w-52">
          <EngineTelegraphDial />
          <div className="hidden">
            <EngineTelegraphOrder value="stop">Stop</EngineTelegraphOrder>
            <EngineTelegraphOrder value="ask">Ask</EngineTelegraphOrder>
            <EngineTelegraphOrder value="act">Act</EngineTelegraphOrder>
            <EngineTelegraphOrder value="auto">Auto</EngineTelegraphOrder>
          </div>
        </EngineTelegraph>
      )
    }
    case "guarded-switch":
      return (
        <GuardedSwitch checked={s > 0.5}>
          <GuardedSwitchLabel>Deploy</GuardedSwitchLabel>
          <GuardedSwitchControl />
        </GuardedSwitch>
      )
    default: {
      const Preview = previews[slug]
      return Preview ? <Preview /> : null
    }
  }
}

export function Reel({ vertical }: { vertical: boolean }) {
  const W = vertical ? 1080 : 1920
  const H = vertical ? 1920 : 1080
  const stage = React.useRef<HTMLDivElement>(null)
  const [t, setT] = React.useState(0)
  const [fit, setFit] = React.useState(1)

  // Outside a render the stage scales to fit the window; the renderer's viewport is the stage.
  React.useEffect(() => {
    const resize = () => setFit(Math.min(1, window.innerWidth / W, window.innerHeight / H))
    resize()
    window.addEventListener("resize", resize)
    return () => window.removeEventListener("resize", resize)
  }, [W, H])

  React.useLayoutEffect(() => {
    const q = gsap.utils.selector(stage)
    const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } })
    // Components read the time on every render; flushSync so a seek paints the right state.
    // Not while this effect runs: React is mid-commit then, and a plain update is enough.
    let settingUp = true
    const sync = (time: number) => (settingUp ? setT(time) : flushSync(() => setT(time)))
    tl.eventCallback("onUpdate", () => sync(tl.time()))

    // 0–2.2 the mark lights, the name follows.
    tl.fromTo(q("[data-part=mark]"), { autoAlpha: 0, scale: 0.86 }, { autoAlpha: 1, scale: 1, duration: 0.7 }, 0.2)
    tl.fromTo(q("[data-part=lamp]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, ease: "power2.out" }, 0.75)
    tl.fromTo(q("[data-part=wordmark]"), { autoAlpha: 0, x: -18 }, { autoAlpha: 1, x: 0, duration: 0.6 }, 1.0)
    tl.to(q("[data-scene=intro]"), { autoAlpha: 0, y: -30, duration: 0.3, ease: "power2.in" }, 2.0)

    // 2.2–4.6 the line, a word at a time.
    tl.fromTo(q("[data-word]"), { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.32 }, 2.3)
    tl.to(q("[data-scene=line]"), { autoAlpha: 0, y: -30, duration: 0.3, ease: "power2.in" }, 4.3)

    // 4.6–15.45 one object per beat: in with a lift, out upward.
    for (const b of beats) {
      const s = q(`[data-scene=${b.slug}]`)
      tl.fromTo(s, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: "none" }, b.at)
      tl.fromTo(q(`[data-scene=${b.slug}] [data-part=object]`), { y: 80, scale: 0.94 }, { y: 0, scale: 1, duration: 0.6, ease: "back.out(1.4)" }, b.at)
      tl.fromTo(q(`[data-scene=${b.slug}] [data-part=caption] > *`), { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.07 }, b.at + 0.08)
      tl.to(s, { autoAlpha: 0, y: -40, duration: 0.25, ease: "power2.in" }, b.at + BEAT - 0.25)
    }

    // 15.5–18.4 the wall.
    tl.fromTo(q("[data-scene=wall]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: "none" }, 15.5)
    tl.fromTo(q("[data-cell]"), { autoAlpha: 0, y: 40, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, stagger: { each: 0.06, from: "center" }, ease: "back.out(1.6)" }, 15.55)
    tl.fromTo(q("[data-scene=wall] [data-part=title]"), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 16.1)
    tl.to(q("[data-scene=wall]"), { autoAlpha: 0, scale: 0.97, duration: 0.3, ease: "power2.in" }, 18.1)

    // 18.4–20 the command types out, then back to the empty bench of frame 0.
    tl.fromTo(q("[data-scene=end]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: "none" }, 18.4)
    tl.to(q("[data-scene=end]"), { autoAlpha: 0, duration: 0.35, ease: "power2.in" }, DURATION - 0.4)
    tl.set({}, {}, DURATION)

    const params = new URLSearchParams(window.location.search)
    const anim = {
      tl,
      duration: DURATION,
      // Wrap so seek(duration) is frame 0: the loop closes in code.
      seek: (time: number) => {
        const at = ((time % DURATION) + DURATION) % DURATION
        tl.seek(at, false)
        sync(at)
      },
      play: (from = 0) => {
        tl.repeat(-1).play(from)
      },
      pause: () => tl.pause(),
    }
    ;(window as unknown as { anim: typeof anim }).anim = anim

    const frozen = params.get("t")
    anim.seek(frozen ? parseFloat(frozen) : 0)
    settingUp = false
    document.fonts.ready.then(() => {
      requestAnimationFrame(() => {
        document.documentElement.dataset.ready = "1"
        if (!frozen && !params.has("external")) anim.play()
      })
    })
    return () => {
      tl.kill()
    }
  }, [])

  const typed = command.slice(0, Math.round(progress(t, 18.6, 19.3) * command.length))

  return (
    <div className="dark fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black">
      <div
        ref={stage}
        data-reel=""
        style={{
          width: W,
          height: H,
          transform: `scale(${fit})`,
          background: "radial-gradient(ellipse 50% 55% at 50% 42%, oklch(1 0 0 / 0.07), transparent 70%), linear-gradient(to bottom, oklch(0.2 0.008 260), oklch(0.12 0.006 260))",
        }}
        className="relative shrink-0 font-sans text-[oklch(0.96_0.006_90)]"
      >
        {/* Intro: the mark and the name. */}
        <div data-scene="intro" className="absolute inset-0 flex items-center justify-center gap-8">
          <div data-part="mark" className="relative size-40">
            <img src="/logo.png" alt="" className="size-full" />
            <span data-part="lamp" className="absolute top-1/2 left-1/2 size-28 -translate-1/2 rounded-full bg-[radial-gradient(closest-side,oklch(0.85_0.17_75/0.5),transparent)]" />
          </div>
          <span data-part="wordmark" className="text-[150px] font-extrabold tracking-[-0.05em]">
            Bevel
          </span>
        </div>

        {/* The line. */}
        <div data-scene="line" className={`absolute inset-0 flex flex-col justify-center ${vertical ? "px-20" : "px-40"}`}>
          {["Interface parts", "with weight,", "edges", "and light."].map((w) => (
            <span key={w} data-word="" className={`block font-extrabold tracking-[-0.05em] leading-[0.98] invisible ${vertical ? "text-[130px]" : "text-[150px]"}`}>
              {w}
            </span>
          ))}
        </div>

        {/* One object per beat. */}
        {beats.map((b) => {
          const c = components.find((x) => x.slug === b.slug)!
          const p = plate(b.slug)
          return (
            <div
              key={b.slug}
              data-scene={b.slug}
              className={`invisible absolute inset-0 flex ${vertical ? "flex-col justify-center gap-24 px-20" : "items-center gap-24 px-36"}`}
            >
              <div data-part="caption" className={`flex shrink-0 flex-col gap-6 ${vertical ? "" : "w-[640px]"}`}>
                <span className="flex items-center gap-3 text-[26px] font-bold tracking-[0.16em] text-[oklch(0.82_0.15_75)] uppercase">
                  <span className="size-3 rounded-full bg-current shadow-[0_0_16px_currentColor]" />
                  {categories.find((k) => k.slug === c.category)?.name}
                </span>
                <span className="text-[120px] leading-[0.95] font-extrabold tracking-[-0.05em]">{c.name}</span>
                {p && (
                  <span
                    className="bevel-metal self-start rounded-lg px-4 py-2 font-mono text-[22px] font-semibold text-[oklch(0.3_0.05_70)] shadow-(--bevel-depth-raised) [--bevel-material:var(--bevel-brass)] [--bevel-material-edge:var(--bevel-brass-edge)] [text-shadow:0_1px_0_oklch(1_0_0/0.35)]"
                  >
                    {p}
                  </span>
                )}
              </div>
              <div className={`flex items-center justify-center ${vertical ? "min-h-[900px]" : "flex-1"}`}>
                <div data-part="object" className="origin-center" style={{ zoom: small.has(b.slug) ? 5 : 3 }}>
                  <Object_ slug={b.slug} s={progress(t, b.at, b.at + BEAT)} />
                </div>
              </div>
            </div>
          )
        })}

        {/* The wall. */}
        <div data-scene="wall" className={`invisible absolute inset-0 flex flex-col justify-center ${vertical ? "gap-14 px-14" : "gap-12 px-24"}`}>
          <span data-part="title" className={`font-extrabold tracking-[-0.05em] leading-none ${vertical ? "text-[96px]" : "text-[88px]"}`}>
            {components.length} objects. Each with its patent.
          </span>
          <div className={`grid gap-5 ${vertical ? "grid-cols-3" : "grid-cols-6"}`}>
            {wall.map((slug) => (
              <div
                key={slug}
                data-cell=""
                className="flex h-56 items-center justify-center overflow-hidden rounded-3xl bg-[oklch(0.15_0.006_260)] shadow-[inset_0_2px_6px_oklch(0_0_0/0.55),inset_0_0_0_1px_oklch(0_0_0/0.4),0_1px_0_oklch(1_0_0/0.06)]"
              >
                <div style={{ zoom: slug === "key" || slug === "toggle-lever" ? 1.5 : 0.85 }}>
                  <Object_ slug={slug} s={progress(t, 16, 17.5)} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* The end: the command, typed. */}
        <div data-scene="end" className="invisible absolute inset-0 flex flex-col items-center justify-center gap-12">
          <div className="flex items-center gap-6">
            <img src="/logo.png" alt="" className="size-24" />
            <span className="text-[96px] font-extrabold tracking-[-0.05em]">Bevel</span>
          </div>
          <div className={`flex gap-5 rounded-2xl bg-[oklch(0.1_0.005_260)] px-8 py-6 font-mono shadow-[inset_0_2px_6px_oklch(0_0_0/0.6),0_1px_0_oklch(1_0_0/0.07)] ${vertical ? "text-[34px]" : "text-[44px]"}`}>
            <span className="text-[oklch(0.56_0.012_260)]">$</span>
            <span className="min-w-[30ch]">
              {typed}
              <span className="ml-0.5 inline-block h-[1em] w-[0.55ch] translate-y-[0.15em] bg-[oklch(0.82_0.15_75)]" />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
