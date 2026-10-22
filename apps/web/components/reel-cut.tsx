"use client"

import * as React from "react"
import { flushSync } from "react-dom"
import { Annunciator, AnnunciatorPanel, AnnunciatorTile } from "@workspace/ui/components/annunciator"
import { Key, KeyLamp } from "@workspace/ui/components/key"
import { LatchCheckbox } from "@workspace/ui/components/latch-checkbox"
import { Meter, MeterFlag, MeterHeader, MeterLabel, MeterReading } from "@workspace/ui/components/meter"
import { SplitFlap, SplitFlapRow, SplitFlapText } from "@workspace/ui/components/split-flap"
import { ToggleLever } from "@workspace/ui/components/toggle-lever"
import { previews } from "@/components/previews"
import { components } from "@/lib/catalog"
import { origins } from "@/lib/origins"

/**
 * "Your UI has no body": the 9:16 reel, cut with the reel-edit skill. Every
 * flat default control gets its body back on the kick. Each frame is a pure
 * function of t (the skill's render(t) / window.DUR contract), timed in beats
 * of the track: Try Me by Arulo (Mixkit), 136 bpm, from 9.51 s, so beat 8
 * lands on the drop.
 *
 *   /reel/cut          plays
 *   /reel/cut?t=4.2    frozen
 *   ?external=1        waits for render(t) (launch-kit/reel-edit/engine.html)
 */

const B = 60 / 136
const bt = (beat: number) => beat * B
const BEATS = 52
export const DURATION = bt(BEATS)

const paper = "oklch(0.95 0.02 88)"
const ink = "oklch(0.17 0.01 260)"
const cards = {
  amber: "oklch(0.8 0.16 75)",
  blue: "oklch(0.58 0.17 262)",
  green: "oklch(0.66 0.15 155)",
  red: "oklch(0.62 0.2 27)",
  paper,
  graphite: "oklch(0.2 0.008 260)",
}

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a))
const outBack = (x: number) => 1 + 2.4 * (x - 1) ** 3 + 1.4 * (x - 1) ** 2
const outExpo = (x: number) => (x >= 1 ? 1 : 1 - 2 ** (-10 * x))
/** Seeded, so a frame never changes between renders. */
const rand = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

const head: React.CSSProperties = { fontFamily: '"Helvetica Neue", Helvetica, sans-serif', fontWeight: 900, fontStretch: "condensed", lineHeight: 0.86, letterSpacing: "-0.01em", textTransform: "uppercase" }

/** A font size that sets `text` to `width` in the headline face, capped at `max`. */
function fit(text: string, width: number, max: number) {
  if (typeof document === "undefined") return max
  const c = (fit as unknown as { c?: CanvasRenderingContext2D }).c ?? ((fit as unknown as { c?: CanvasRenderingContext2D }).c = document.createElement("canvas").getContext("2d")!)
  c.font = `900 condensed 100px "Helvetica Neue"`
  return Math.min(max, (100 * width) / c.measureText(text.toUpperCase()).width)
}

function plate(slug: string) {
  const o = origins[slug]
  if (!o) return null
  return o.kind === "patent" ? `${o.label.replace(/^([A-Z]{2}) /, "Pat. $1 ")}, ${o.year}` : `${o.relation}, ${o.year}`
}

/* ---------------------------------------------------------------- the flat defaults */

const flatFont: React.CSSProperties = { fontFamily: "Arial, sans-serif", color: "#333" }
const FlatButton = () => <div style={{ ...flatFont, background: "#e9e9e9", border: "1px solid #b9b9b9", borderRadius: 3, padding: "6px 22px", fontSize: 16 }}>Save</div>
const FlatToggle = ({ on = false }: { on?: boolean }) => (
  <div style={{ width: 44, height: 24, borderRadius: 12, background: on ? "#9a9a9a" : "#cfcfcf", position: "relative" }}>
    <div style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: 9, background: "#fff" }} />
  </div>
)
const FlatCheck = () => <div style={{ width: 18, height: 18, border: "1.5px solid #8a8a8a", background: "#fff", borderRadius: 2 }} />
const FlatNumber = () => <div style={{ ...flatFont, fontSize: 22 }}>$0.142</div>
const FlatAlert = () => <div style={{ ...flatFont, fontSize: 15, background: "#fdecec", border: "1px solid #e6a5a5", color: "#a33", padding: "8px 14px" }}>Over budget</div>
const FlatStatus = () => <div style={{ ...flatFont, fontSize: 16 }}>us-east: shipped</div>

/* ---------------------------------------------------------------- the transformations */

type Turn = { slug: string; flatWord: string; word: string; bg: string; dark?: boolean; zoom: number; flat: React.ReactNode; real: (s: number) => React.ReactNode }

const turns: Turn[] = [
  {
    slug: "key",
    flatWord: "Button",
    word: "Key",
    bg: cards.amber,
    zoom: 8,
    flat: <FlatButton />,
    real: (s) => (
      <Key pending={s > 0.55} tabIndex={-1}>
        <KeyLamp />
        {s > 0.55 ? "Saving" : "Save"}
      </Key>
    ),
  },
  {
    slug: "toggle-lever",
    flatWord: "Toggle",
    word: "Lever",
    bg: cards.blue,
    zoom: 9,
    flat: <FlatToggle />,
    real: (s) => <ToggleLever aria-label="Alerts" checked={s > 0.55} tabIndex={-1} />,
  },
  {
    slug: "latch-checkbox",
    flatWord: "Checkbox",
    word: "Latch",
    bg: cards.green,
    zoom: 8,
    flat: <FlatCheck />,
    real: (s) => (
      <div className="flex gap-2">
        <LatchCheckbox aria-label="One" checked={s > 0.45} tabIndex={-1} />
        <LatchCheckbox aria-label="Two" checked={s > 0.6} tabIndex={-1} />
        <LatchCheckbox aria-label="Three" checked={s > 0.75} tabIndex={-1} />
      </div>
    ),
  },
  {
    slug: "meter",
    flatWord: "Number",
    word: "Meter",
    bg: cards.red,
    zoom: 5,
    flat: <FlatNumber />,
    real: (s) => (
      <Meter state={s < 0.9 ? "running" : "idle"} aria-label="Live usage">
        <MeterHeader>
          <MeterLabel>This turn</MeterLabel>
          <MeterFlag />
        </MeterHeader>
        <MeterReading value={Math.round(seg(s, 0.3, 0.85) * 142) / 1000} currency="USD" format={{ minimumFractionDigits: 3 }} />
      </Meter>
    ),
  },
  {
    slug: "annunciator",
    flatWord: "Alert",
    word: "Annunciator",
    bg: cards.paper,
    dark: true,
    zoom: 3.3,
    flat: <FlatAlert />,
    real: (s) => (
      <Annunciator aria-label="Alerts">
        <AnnunciatorPanel className="grid-cols-2 sm:grid-cols-2">
          <AnnunciatorTile id="a" active={s > 0.3} tone="red">Over budget</AnnunciatorTile>
          <AnnunciatorTile id="b" active={s > 0.45}>Rate limited</AnnunciatorTile>
          <AnnunciatorTile id="c" active={s > 0.6}>Tests failing</AnnunciatorTile>
          <AnnunciatorTile id="d" active={s > 0.75} tone="green">Deploy live</AnnunciatorTile>
        </AnnunciatorPanel>
      </Annunciator>
    ),
  },
  {
    slug: "split-flap",
    flatWord: "Status",
    word: "Split-flap",
    bg: cards.blue,
    zoom: 4.6,
    flat: <FlatStatus />,
    real: (s) => (
      <SplitFlap aria-label="Board">
        <SplitFlapRow name="a">
          <SplitFlapText value={s > 0.55 ? "EU-WEST" : "LONDON"} length={7} />
          <SplitFlapText value={s > 0.55 ? "LIVE" : "HOLD"} length={4} tone="amber" />
        </SplitFlapRow>
        <SplitFlapRow name="b">
          <SplitFlapText value={s > 0.55 ? "US-EAST" : "PARIS"} length={7} />
          <SplitFlapText value={s > 0.55 ? "SHIP" : "WAIT"} length={4} tone="amber" />
        </SplitFlapRow>
      </SplitFlap>
    ),
  },
]

const strobe = [
  { slug: "wallet", bg: cards.green },
  { slug: "guarded-switch", bg: cards.amber },
  { slug: "dial", bg: cards.blue },
  { slug: "stamp", bg: cards.red },
  { slug: "receipt", bg: cards.graphite },
  { slug: "engine-telegraph", bg: cards.amber },
  { slug: "dip-switch", bg: cards.paper },
  { slug: "time-card", bg: cards.blue },
]
const wall = ["guarded-switch", "annunciator", "split-flap", "meter", "wallet", "dial", "time-card", "key", "receipt", "stamp", "toggle-lever", "keycard"]
const command = "npx shadcn@latest add @bevel/key"

/* ---------------------------------------------------------------- scenes */

/** A hard cut: the new card punches in over three frames. */
const punch = (t: number, at: number) => 1 + 0.07 * (1 - seg(t, at, at + 0.1))

function Grain() {
  return (
    <svg className="pointer-events-none absolute inset-0 size-full mix-blend-multiply" style={{ opacity: 0.22 }}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
        <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 0.55 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  )
}

function Intro({ t }: { t: number }) {
  const words = ["Your", "UI", "has no", "body"]
  return (
    <div className="absolute inset-0" style={{ background: paper, transform: `scale(${punch(t, 0)})` }}>
      <div className="absolute inset-x-[60px] top-[230px] flex flex-col gap-3" style={{ color: ink }}>
        {words.map((w, i) => {
          const at = bt(i * 2)
          const p = seg(t, at, at + 0.12)
          return (
            <span key={w} style={{ ...head, fontSize: fit(w, 960, 255), opacity: p > 0 ? 1 : 0, transform: `scale(${1.25 - 0.25 * outExpo(p)})`, transformOrigin: "left center" }}>
              {w}
            </span>
          )
        })}
      </div>
      {/* The flat UI everyone ships: no edges, no light, no weight. */}
      <div className="absolute inset-x-[60px] top-[1420px] flex h-[200px] items-center justify-around rounded-lg bg-white shadow-[0_1px_2px_#0002] [&>*]:[zoom:2.2]">
        <FlatButton />
        <FlatCheck />
        <FlatToggle on={t > bt(5)} />
        <FlatNumber />
      </div>
      {/* Into the drop: the page whites out on the last half beat. */}
      <div className="absolute inset-0 bg-white" style={{ opacity: seg(t, bt(7.5), bt(8)) * 0.85 }} />
    </div>
  )
}

function TurnScene({ turn, at, t }: { turn: Turn; at: number; t: number }) {
  const local = t - at
  const kick = bt(1)
  const turned = local >= kick
  const sPop = seg(local, kick, kick + 0.35)
  const sState = seg(local, kick, bt(4))
  const fg = turn.dark ? ink : "oklch(0.98 0.005 90)"
  const strike = seg(local, kick - 0.05, kick + 0.12)
  const nameIn = seg(local, kick + 0.02, kick + 0.14)
  const p = plate(turn.slug)
  return (
    <div className="absolute inset-0" style={{ background: turn.bg, transform: `scale(${punch(t, at)})` }}>
      <div className="absolute inset-x-[60px] top-[230px]" style={{ color: fg }}>
        <div className="relative inline-block" style={{ ...head, fontSize: 150, opacity: turned ? 0.55 : 1 }}>
          {turn.flatWord}
          {/* Struck out in marker on the kick. */}
          <span className="absolute top-1/2 left-[-2%] h-[14px] rounded-full" style={{ width: `${104 * strike}%`, background: turn.dark ? cards.red : ink, transform: "translateY(-30%) rotate(-3deg)" }} />
        </div>
        <div style={{ ...head, fontSize: fit(turn.word, 960, 330), marginTop: 18, opacity: nameIn > 0 ? 1 : 0, transform: `translateY(${(1 - outExpo(nameIn)) * 60}px)` }}>{turn.word}</div>
      </div>
      <div className="absolute inset-x-0 top-[860px] flex h-[560px] items-center justify-center">
        {!turned ? (
          <div style={{ zoom: 6, filter: "grayscale(1)" }}>{turn.flat}</div>
        ) : (
          <div style={{ zoom: turn.zoom, transform: `scale(${0.7 + 0.3 * outBack(sPop)})`, filter: `drop-shadow(0 6px 10px oklch(0 0 0 / 0.35))` }}>{turn.real(sState)}</div>
        )}
      </div>
      {p && (
        <div className="absolute inset-x-0 top-[1440px] flex justify-center" style={{ opacity: seg(local, bt(2), bt(2) + 0.1) }}>
          <span className="bevel-metal rounded-lg px-5 py-2.5 font-mono text-[30px] font-semibold text-[oklch(0.3_0.05_70)] shadow-(--bevel-depth-raised) [--bevel-material:var(--bevel-brass)] [--bevel-material-edge:var(--bevel-brass-edge)] [text-shadow:0_1px_0_oklch(1_0_0/0.35)]">
            {p}
          </span>
        </div>
      )}
      {/* A white flash ring on the transformation. */}
      <div className="absolute inset-0 bg-white" style={{ opacity: turned ? (1 - seg(local, kick, kick + 0.12)) * 0.7 : 0 }} />
    </div>
  )
}

function Strobe({ t, at }: { t: number; at: number }) {
  const i = Math.min(strobe.length - 1, Math.floor((t - at) / B))
  const s = strobe[i]!
  const c = components.find((x) => x.slug === s.slug)!
  const light = s.bg === cards.paper
  const Preview = previews[s.slug]
  return (
    <div className="absolute inset-0" style={{ background: s.bg, transform: `scale(${punch(t, at + i * B)})` }}>
      <div className="absolute inset-x-0 top-[420px] flex h-[900px] items-center justify-center">
        <div style={{ zoom: 3.6, transform: `rotate(${(rand(i) - 0.5) * 6}deg)`, filter: "drop-shadow(0 6px 10px oklch(0 0 0 / 0.35))" }}>{Preview && <Preview />}</div>
      </div>
      <div className="absolute inset-x-[60px] top-[230px]" style={{ ...head, fontSize: fit(c.name, 960, 200), color: light ? ink : "oklch(0.98 0.005 90)" }}>
        {c.name}
      </div>
    </div>
  )
}

function Wall({ t, at }: { t: number; at: number }) {
  const local = t - at
  return (
    <div className="absolute inset-0" style={{ background: paper, transform: `scale(${punch(t, at)})` }}>
      <div className="absolute inset-x-[60px] top-[230px]" style={{ color: ink }}>
        <div style={{ ...head, fontSize: fit("50 real", 960, 330) }}>{components.length} real</div>
        <div style={{ ...head, fontSize: fit("objects", 960, 330) }}>objects</div>
      </div>
      <div className="absolute inset-x-[60px] top-[700px] grid grid-cols-3 gap-5">
        {wall.map((slug, i) => {
          const p = seg(local, i * (B / 3), i * (B / 3) + 0.25)
          const Preview = previews[slug]
          return (
            <div key={slug} className="flex h-[200px] items-center justify-center overflow-hidden rounded-2xl" style={{ background: cards.graphite, opacity: p > 0 ? 1 : 0, transform: `scale(${0.6 + 0.4 * outBack(p)})` }}>
              <div style={{ zoom: slug === "key" || slug === "toggle-lever" ? 1.2 : 0.75 }}>{Preview && <Preview />}</div>
            </div>
          )
        })}
      </div>
      <div className="absolute inset-x-[60px] top-[1640px] text-center" style={{ ...head, fontSize: 64, color: ink, opacity: seg(local, bt(3), bt(3) + 0.1) }}>
        Each with its patent or past
      </div>
    </div>
  )
}

function End({ t, at }: { t: number; at: number }) {
  const local = t - at
  const typed = command.slice(0, Math.round(seg(local, bt(1), bt(4)) * command.length))
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-14" style={{ background: cards.graphite, transform: `scale(${punch(t, at)})`, color: "oklch(0.97 0.006 90)" }}>
      <div className="flex items-center gap-8">
        <img src="/logo.png" alt="" className="size-[170px]" />
        <span style={{ ...head, fontSize: 250, fontStretch: "condensed" }}>Bevel</span>
      </div>
      <div className="flex gap-4 rounded-2xl px-8 py-6 font-mono text-[36px]" style={{ background: "oklch(0.12 0.005 260)", boxShadow: "inset 0 2px 6px oklch(0 0 0 / 0.6), 0 1px 0 oklch(1 0 0 / 0.07)" }}>
        <span style={{ color: "oklch(0.56 0.012 260)" }}>$</span>
        <span className="min-w-[30ch]">
          {typed}
          <span className="ml-0.5 inline-block h-[1em] w-[0.55ch] translate-y-[0.15em]" style={{ background: cards.amber }} />
        </span>
      </div>
      <div style={{ ...head, fontSize: 64, color: "oklch(0.72 0.012 260)", opacity: seg(local, bt(4), bt(4) + 0.1) }}>Free and open source</div>
    </div>
  )
}

export function ReelCut() {
  const [t, setT] = React.useState(0)
  const [fit_, setFit] = React.useState(1)

  React.useEffect(() => {
    const resize = () => setFit(Math.min(1, window.innerWidth / 1080, window.innerHeight / 1920))
    resize()
    window.addEventListener("resize", resize)
    return () => window.removeEventListener("resize", resize)
  }, [])

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const w = window as unknown as { render: (t: number) => Promise<void>; DUR: number }
    w.DUR = DURATION
    w.render = async (time: number) => {
      flushSync(() => setT(time))
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    }
    // The same contract as /reel, so scripts/render-reel.mts renders both.
    ;(window as unknown as { anim: object }).anim = { duration: DURATION, seek: (time: number) => flushSync(() => setT(((time % DURATION) + DURATION) % DURATION)) }
    const frozen = params.get("t")
    let raf = 0
    document.fonts.ready.then(async () => {
      await w.render(frozen ? parseFloat(frozen) : 0)
      document.documentElement.dataset.ready = "1"
      if (frozen || params.has("external")) return
      const start = performance.now()
      const loop = () => {
        setT(((performance.now() - start) / 1000) % DURATION)
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  const beat = t / B
  let scene: React.ReactNode
  if (beat < 8) scene = <Intro t={t} />
  else if (beat < 32) {
    const i = Math.floor((beat - 8) / 4)
    scene = <TurnScene turn={turns[i]!} at={bt(8 + i * 4)} t={t} />
  } else if (beat < 40) scene = <Strobe t={t} at={bt(32)} />
  else if (beat < 46) scene = <Wall t={t} at={bt(40)} />
  else scene = <End t={t} at={bt(46)} />

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black">
      <div data-reel="" className="dark relative shrink-0 overflow-hidden" style={{ width: 1080, height: 1920, transform: `scale(${fit_})` }}>
        {scene}
        <Grain />
      </div>
    </div>
  )
}
