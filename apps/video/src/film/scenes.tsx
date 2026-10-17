import * as React from "react"
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion"
import { Annunciator, AnnunciatorPanel, AnnunciatorTile } from "@workspace/ui/components/annunciator"
import { ContactSheet, ContactSheetFrame } from "@workspace/ui/components/contact-sheet"
import { DetentKnob, DetentKnobStop } from "@workspace/ui/components/detent-knob"
import {
  EngineTelegraph,
  EngineTelegraphDial,
  EngineTelegraphOrder,
  EngineTelegraphOrders,
} from "@workspace/ui/components/engine-telegraph"
import { GuardedSwitch, GuardedSwitchControl, GuardedSwitchLabel, GuardedSwitchStatus } from "@workspace/ui/components/guarded-switch"
import { Mixer, MixerStrip, MixerStripFader, MixerStripMute, MixerStripName, MixerStripSolo } from "@workspace/ui/components/mixer-strip"
import { NumberWheel } from "@workspace/ui/components/number-wheel"
import { SplitFlap, SplitFlapRow, SplitFlapText } from "@workspace/ui/components/split-flap"
import { Mat, Words, ease, easeInOut, useProgress } from "../kit"
import { mono, sans } from "../fonts"
import { BEAT, Label, Slam, Spot, Wordmark, cues, jitter, useHit, useShake } from "./fx"

const E = cues.events
const S = cues.scenes

/* ------------------------------------------------------------------ */
/* Shared objects                                                      */
/* ------------------------------------------------------------------ */

/** Lifts a guarded switch's cover on mount; the frame then sets how far it's lifted. */
function OpenOnMount({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null)
  React.useLayoutEffect(() => {
    ref.current?.querySelector<HTMLButtonElement>("[aria-expanded]")?.click()
  }, [])
  return <div ref={ref}>{children}</div>
}

/** A guarded switch whose cover angle and lever position come from the frame. */
function Switch({ lift, lever, on, label = "Deploy to prod", status = false }: { lift: number; lever: number; on: boolean; label?: string; status?: boolean }) {
  return (
    <div className="film-lever" style={{ "--film-lever": lever } as React.CSSProperties}>
      <OpenOnMount>
        <GuardedSwitch checked={on} autoClose={false} style={{ "--guarded-switch-open-angle": `${-112 * lift}deg` } as React.CSSProperties}>
          <GuardedSwitchLabel>{label}</GuardedSwitchLabel>
          <GuardedSwitchControl />
          {status && <GuardedSwitchStatus />}
        </GuardedSwitch>
      </OpenOnMount>
    </div>
  )
}

const lampSet = [
  { id: "budget", label: "Over budget", tone: "red" },
  { id: "tests", label: "Tests failing", tone: "amber" },
  { id: "context", label: "Context full", tone: "amber" },
  { id: "rate", label: "Rate limited", tone: "amber" },
  { id: "approval", label: "Needs approval", tone: "white" },
  { id: "deploy", label: "Deploy live", tone: "green" },
] as const

function Lamps({ lit, flash = 1, cols = 3 }: { lit: (i: number) => boolean; flash?: number; cols?: number }) {
  return (
    <div className="film-flash" style={{ "--film-flash": flash, width: cols * 126 } as React.CSSProperties}>
      <Annunciator aria-label="Alerts">
        <AnnunciatorPanel style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {lampSet.map((l, i) => (
            <AnnunciatorTile key={l.id} id={l.id} tone={l.tone} active={lit(i)}>
              {l.label}
            </AnnunciatorTile>
          ))}
        </AnnunciatorPanel>
      </Annunciator>
    </div>
  )
}

function Board({ rows }: { rows: { name: string; status: string }[] }) {
  return (
    <SplitFlap aria-label="Deploys">
      {rows.map((r) => (
        <SplitFlapRow key={r.name} name={r.name}>
          <SplitFlapText value={r.name} length={8} />
          <SplitFlapText value={r.status} length={8} tone="amber" />
        </SplitFlapRow>
      ))}
    </SplitFlap>
  )
}

/** Text that turns over column by column from one value to another, starting at `cue`. */
function flip(from: string, to: string, frame: number, cue: number, stagger = 2) {
  const n = Math.max(from.length, to.length)
  const done = Math.max(0, Math.floor((frame - cue) / stagger))
  return to.padEnd(n).slice(0, done) + from.padEnd(n).slice(done)
}

/** A 3D camera around an object: tilt, turn, push and drift, plus an optional shake. */
function Camera({
  children,
  from,
  to,
  scale = 1,
  tilt = [12, 4],
  turn = [-8, 6],
  push = [1, 1.08],
  x = [0, 0],
  y = [0, 0],
  shake = { x: 0, y: 0 },
}: {
  children: React.ReactNode
  from: number
  to: number
  scale?: number
  tilt?: [number, number]
  turn?: [number, number]
  push?: [number, number]
  x?: [number, number]
  y?: [number, number]
  shake?: { x: number; y: number }
}) {
  const t = useProgress(from, to, easeInOut)
  const l = (r: [number, number]) => interpolate(t, [0, 1], r)
  return (
    <AbsoluteFill style={{ perspective: 2400, alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          transform: `translate(${l(x) + shake.x}px, ${l(y) + shake.y}px) rotateX(${l(tilt)}deg) rotateY(${l(turn)}deg) scale(${l(push) * scale})`,
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  )
}

/* ------------------------------------------------------------------ */
/* 1. Cold open: words in the dark, objects caught in a spotlight.     */
/* ------------------------------------------------------------------ */

const coldWords = ["Before", "screens,", "everything", "you touched", "had", "weight."]

function Macro({ i, cue }: { i: number; cue: number }) {
  const frame = useCurrentFrame()
  const push = interpolate(frame, [cue, cue + BEAT], [1, 1.12], { extrapolateRight: "clamp" })
  const x = jitter(`mx${i}`, 120)
  const macros = [
    <Switch key="s" lift={0} lever={1} on={false} />,
    <div key="w" style={{ fontSize: 64 }}><NumberWheel value={4.27} currency="USD" tone="black" format={{ minimumFractionDigits: 2 }} /></div>,
    <Lamps key="l" lit={(n) => n < 3} />,
    <Board key="b" rows={[{ name: "US-EAST", status: "LIVE" }]} />,
    <div key="k" className="film-knob" style={{ "--film-knob": `${-45 + i * 10}deg` } as React.CSSProperties}>
      <DetentKnob aria-label="Effort" defaultValue="high"><DetentKnobStop value="low">Low</DetentKnobStop><DetentKnobStop value="med">Med</DetentKnobStop><DetentKnobStop value="high">High</DetentKnobStop><DetentKnobStop value="max">Max</DetentKnobStop></DetentKnob>
    </div>,
  ]
  return (
    <Spot x={50 + x / 40} size={42}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `translateX(${x}px) scale(${4.2 * push}) rotate(${jitter(`mr${i}`, 6)}deg)` }}>
        {macros[i]}
      </AbsoluteFill>
    </Spot>
  )
}

export function Cold() {
  const frame = useCurrentFrame()
  const words = E.coldWords
  const macros = E.coldMacros
  const word = words.findLastIndex((c) => frame >= c)
  const macro = macros.findLastIndex((c) => frame >= c)
  const showMacro = macro >= 0 && frame >= macros[macro]! && frame < macros[macro]! + BEAT
  return (
    <AbsoluteFill style={{ background: "var(--night)" }}>
      {showMacro ? <Macro i={macro} cue={macros[macro]!} /> : word >= 0 && <Slam key={word} text={coldWords[word]!} cue={words[word]!} />}
    </AbsoluteFill>
  )
}

/* ------------------------------------------------------------------ */
/* 2. Reveal: a lever in the dark throws, the lights come up, and the  */
/*    camera pulls back to the whole bench.                            */
/* ------------------------------------------------------------------ */

export function Reveal() {
  const frame = useCurrentFrame()
  const throwP = useProgress(E.leverFlip, E.leverFlip + 5, ease)
  const lit = useProgress(E.lightsOn, E.lightsOn + 14, ease)
  const pull = useProgress(E.lightsOn, S.reveal[1], easeInOut)
  const shake = useShake(E.lightsOn, 10)
  const scale = interpolate(pull, [0, 1], [7.5, 1.05])
  const bench = useProgress(E.lightsOn + 20, E.titleLands, ease)
  return (
    <AbsoluteFill>
      <Mat glow={lit} />
      {/* The bench, arriving as the camera pulls back. */}
      <AbsoluteFill style={{ opacity: bench, perspective: 2400 }}>
        <Bench />
      </AbsoluteFill>
      {/* Night, lifting as the lights come up; the lever sits above it, caught in the dark. */}
      <AbsoluteFill style={{ background: "var(--night)", opacity: 1 - lit }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `translate(${shake.x}px, ${shake.y}px) scale(${scale})` }}>
        <div style={{ opacity: interpolate(pull, [0.55, 0.85], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <Switch lift={1} lever={1 - 2 * throwP} on={frame >= E.leverFlip + 3} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 24 }}>
        {frame >= E.titleLands - 2 && (
          <>
            <Wordmark cue={E.titleLands} size={300} sweepAt={E.titleLands + 14} />
            <Words text="Tactile components for real product work." delay={E.titleLands + 12} size={46} weight={600} color="var(--mat-muted)" />
          </>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

/** The workbench seen from above: a spread of objects, slightly out of focus behind the title. */
function Bench() {
  const frame = useCurrentFrame()
  const items: { node: React.ReactNode; x: number; y: number; r: number; s: number }[] = [
    { node: <Lamps lit={(i) => i !== 3} />, x: -620, y: -260, r: -6, s: 0.9 },
    { node: <Board rows={[{ name: "US-EAST", status: "LIVE" }, { name: "EU-WEST", status: "ROLLOUT" }]} />, x: 560, y: -300, r: 5, s: 1 },
    { node: <div style={{ fontSize: 46 }}><NumberWheel value={4.27} currency="USD" tone="black" format={{ minimumFractionDigits: 2 }} /></div>, x: -660, y: 280, r: 4, s: 1 },
    { node: <Switch lift={0} lever={1} on={false} label="Promote" />, x: 640, y: 250, r: -5, s: 0.8 },
    { node: <div className="film-knob" style={{ "--film-knob": "45deg" } as React.CSSProperties}><DetentKnob aria-label="Effort" defaultValue="high"><DetentKnobStop value="low">Low</DetentKnobStop><DetentKnobStop value="med">Med</DetentKnobStop><DetentKnobStop value="high">High</DetentKnobStop><DetentKnobStop value="max">Max</DetentKnobStop></DetentKnob></div>, x: -60, y: 360, r: 0, s: 0.75 },
  ]
  const drift = interpolate(frame, [E.lightsOn, S.reveal[1]], [0, -30])
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", filter: "blur(1.5px)", transform: `rotateX(18deg) translateY(${drift}px)` }}>
      {items.map((it, i) => (
        <div key={i} style={{ position: "absolute", transform: `translate(${it.x}px, ${it.y}px) rotate(${it.r}deg) scale(${it.s * 1.3})` }}>
          {it.node}
        </div>
      ))}
    </AbsoluteFill>
  )
}

/* ------------------------------------------------------------------ */
/* 3. Guarded switch: Lift. Flip. Ship. Each word with its action.     */
/* ------------------------------------------------------------------ */

export function SwitchScene() {
  const frame = useCurrentFrame()
  const lift = useProgress(E.coverLift, E.coverLift + 10, ease)
  const throwP = useProgress(E.switchFlip, E.switchFlip + 5, ease)
  const shake = useShake(E.switchFlip, 6)
  const steps = [
    { word: "Lift.", cue: E.coverLift },
    { word: "Flip.", cue: E.switchFlip },
    { word: "Ship.", cue: E.ship },
  ]
  return (
    <Mat>
      <AbsoluteFill style={{ flexDirection: "row" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingLeft: 170, gap: 10 }}>
          <Label cue={S.switch[0] + 4}>Guarded switch</Label>
          {steps.map((s) => {
            const p = useHit(s.cue, { damping: 13, stiffness: 220 })
            const active = frame >= s.cue
            return (
              <div
                key={s.word}
                style={{
                  fontFamily: sans,
                  fontSize: 150,
                  fontWeight: 800,
                  letterSpacing: "-0.05em",
                  lineHeight: 1,
                  color: s.word === "Ship." && active ? "oklch(0.55 0.2 27)" : "var(--mat-ink)",
                  opacity: active ? Math.min(1, p * 1.5) : 0.12,
                  transform: `translateX(${(1 - p) * -40}px)`,
                }}
              >
                {s.word}
              </div>
            )
          })}
        </div>
        <div style={{ flex: 1, position: "relative" }}>
          <Camera from={S.switch[0]} to={S.switch[1]} scale={3} tilt={[16, 6]} turn={[-18, -6]} push={[0.92, 1.04]} shake={shake}>
            <Switch lift={lift} lever={1 - 2 * throwP} on={frame >= E.switchFlip + 3} status />
          </Camera>
        </div>
      </AbsoluteFill>
    </Mat>
  )
}

/* ------------------------------------------------------------------ */
/* 4. Annunciator, full bleed: lamps come on with the beat and flash   */
/*    until they're acknowledged.                                      */
/* ------------------------------------------------------------------ */

export function LampsScene() {
  const frame = useCurrentFrame()
  const acked = frame >= E.acknowledge
  // Unseen alarms flash on eighth notes; acknowledged ones burn steady.
  const flash = acked ? 1 : Math.floor((frame - S.lamps[0]) / (BEAT / 2)) % 2 === 0 ? 1 : 0.28
  const shake = useShake(E.acknowledge, 5)
  return (
    <AbsoluteFill style={{ background: "oklch(0.18 0.008 260)" }}>
      <Camera from={S.lamps[0]} to={S.lamps[1]} scale={3.3} tilt={[10, 2]} turn={[10, -8]} push={[1, 1.1]} shake={shake}>
        <Lamps lit={(i) => i !== 3 && frame >= E.lamps[Math.min(i, E.lamps.length - 1)]!} flash={flash} />
      </Camera>
      <AbsoluteFill style={{ padding: "80px 110px", justifyContent: "flex-end" }}>
        <div style={{ background: "oklch(0.18 0.008 260 / 0.75)", padding: "26px 34px", borderRadius: 18, alignSelf: "flex-start" }}>
          <Label cue={S.lamps[0] + 8} style={{ color: "oklch(0.75 0.01 260)" }}>Annunciator</Label>
          <Words text={acked ? "Seen. Steady until it clears." : "Alarms that wait until someone sees them."} key={String(acked)} delay={acked ? E.acknowledge : S.lamps[0] + 12} size={56} weight={700} color="oklch(0.96 0.006 150)" style={{ justifyContent: "flex-start", marginTop: 12 }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

/* ------------------------------------------------------------------ */
/* 5. Mixer: the camera tracks along the strips while a lead agent     */
/*    rides the faders with the music; then you take one.              */
/* ------------------------------------------------------------------ */

export function MixerScene() {
  const frame = useCurrentFrame()
  const t = (frame - S.mixer[0]) / BEAT
  const grabbed = frame >= E.faderGrab
  const names = ["Explore", "Plan", "Code", "Tests", "Review", "Docs"]
  const yours = interpolate(frame, [E.faderGrab, E.faderGrab + 10], [0, 1], { easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  return (
    <Mat>
      <Camera from={S.mixer[0]} to={S.mixer[1]} scale={2.05} tilt={[22, 14]} turn={[-12, 14]} x={[-260, -420]} push={[1, 1.06]}>
        <Mixer aria-label="Subagents">
          {names.map((name, i) => {
            const ride = 50 + 32 * Math.sin((t * Math.PI) / 2 + i * 0.9) * (i % 2 ? 1 : 0.8)
            const isYours = name === "Code" && grabbed
            const v = isYours ? interpolate(yours, [0, 1], [ride, 94]) : ride
            return (
              <MixerStrip key={name} name={name} muted={name === "Docs"}>
                <MixerStripName />
                <MixerStripMute pressed={name === "Docs"} />
                <MixerStripSolo />
                <MixerStripFader value={Math.round(v)} changedBy={isYours ? "You" : "Lead"} />
              </MixerStrip>
            )
          })}
        </Mixer>
      </Camera>
      <AbsoluteFill style={{ padding: "0 110px", alignItems: "flex-end", justifyContent: "center" }}>
        <div style={{ textAlign: "right", width: 640 }}>
          <Label cue={S.mixer[0] + 6}>Mixer strip · motorized fader</Label>
          <Words text="Agents move the faders." delay={S.mixer[0] + 10} size={64} style={{ justifyContent: "flex-end", marginTop: 12 }} />
          <Words text="You can take them back." delay={E.faderGrab} size={64} color="oklch(0.5 0.15 250)" style={{ justifyContent: "flex-end" }} />
        </div>
      </AbsoluteFill>
    </Mat>
  )
}

/* ------------------------------------------------------------------ */
/* 6. Controls triptych: a knob that clicks on every beat, an order    */
/*    and its answer, a cost that counts.                              */
/* ------------------------------------------------------------------ */

const knobAngles = [-135, -45, 45, 135]
const knobPath = [0, 1, 2, 3, 2, 1, 2, 3]

export function ControlsScene() {
  const frame = useCurrentFrame()
  const click = E.knobClicks.findLastIndex((c) => frame >= c)
  const prev = knobAngles[knobPath[Math.max(0, click - 1)]!]!
  const next = knobAngles[knobPath[Math.max(0, click)]!]!
  const settle = useHit(E.knobClicks[Math.max(0, click)]!, { damping: 9, stiffness: 320, mass: 0.5 })
  const knob = click <= 0 ? next : prev + (next - prev) * settle
  const handle = interpolate(useHit(E.telegraphOrder, { damping: 12, stiffness: 200 }), [0, 1], [-23.3, 70])
  const answer = interpolate(useHit(E.telegraphAnswer, { damping: 10, stiffness: 120 }), [0, 1], [-23.3, 70])
  const cost = interpolate(frame, [S.controls[0] + 6, S.controls[1] - 20], [0, 12.48], { easing: (x) => 1 - Math.pow(1 - x, 2), extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  const panels: { label: string; line: string; node: React.ReactNode; scale: number }[] = [
    {
      label: "Detent knob",
      line: "Clicks into place.",
      scale: 1.55,
      node: (
        <div className="film-knob" style={{ "--film-knob": `${knob}deg` } as React.CSSProperties}>
          <DetentKnob aria-label="Effort" defaultValue="low"><DetentKnobStop value="low">Low</DetentKnobStop><DetentKnobStop value="medium">Medium</DetentKnobStop><DetentKnobStop value="high">High</DetentKnobStop><DetentKnobStop value="max">Max</DetentKnobStop></DetentKnob>
        </div>
      ),
    },
    {
      label: "Engine telegraph",
      line: "Orders get answers.",
      scale: 1.05,
      node: (
        <div className="film-telegraph" style={{ width: 330, "--film-handle": `${handle}deg`, "--film-answer": `${answer}deg` } as React.CSSProperties}>
          <EngineTelegraph aria-label="Autonomy" value="ask" confirmed="ask">
            <EngineTelegraphDial />
            <EngineTelegraphOrders className="hidden"><EngineTelegraphOrder value="stop">Stop</EngineTelegraphOrder><EngineTelegraphOrder value="ask">Ask</EngineTelegraphOrder><EngineTelegraphOrder value="act">Act</EngineTelegraphOrder><EngineTelegraphOrder value="auto">Auto</EngineTelegraphOrder></EngineTelegraphOrders>
          </EngineTelegraph>
        </div>
      ),
    },
    {
      label: "Number wheel",
      line: "Cost you can count.",
      scale: 1,
      node: (
        <div style={{ fontSize: 72 }}>
          <NumberWheel value={Math.round(cost * 100) / 100} currency="USD" tone="black" format={{ minimumFractionDigits: 2 }} />
        </div>
      ),
    },
  ]
  return (
    <Mat>
      <AbsoluteFill style={{ flexDirection: "row", padding: "0 60px", alignItems: "center", gap: 30 }}>
        {panels.map((p, i) => {
          const enter = useHit(S.controls[0] + i * 4, { damping: 16, stiffness: 140 })
          return (
            <div key={p.label} style={{ flex: 1, height: 760, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "60px 0", borderRadius: 40, background: "oklch(0.912 0.007 145)", boxShadow: "inset 0 2px 4px oklch(0.24 0.014 165 / 0.12), 0 1px 0 oklch(1 0 0 / 0.6)", opacity: enter, transform: `translateY(${(1 - enter) * 80}px)` }}>
              <Label cue={S.controls[0] + 6 + i * 4}>{p.label}</Label>
              <div style={{ transform: `scale(${p.scale * 1.5})` }}>{p.node}</div>
              <Words text={p.line} delay={S.controls[0] + 10 + i * 6} size={50} weight={700} />
            </div>
          )
        })}
      </AbsoluteFill>
    </Mat>
  )
}

/* ------------------------------------------------------------------ */
/* 7. Records: the board turns over, the grease pencil circles.        */
/* ------------------------------------------------------------------ */

const regions = [
  { name: "US-EAST", from: "ROLLOUT", to: "LIVE" },
  { name: "US-WEST", from: "TESTING", to: "ROLLOUT" },
  { name: "EU-WEST", from: "BUILDING", to: "TESTING" },
  { name: "AP-SOUTH", from: "QUEUED", to: "BUILDING" },
]
const hues = [40, 230, 350, 150, 60, 290]
const picks: Record<string, number> = { a: 0, c: 1, d: 2, f: 3 }

export function RecordsScene() {
  const frame = useCurrentFrame()
  const marks: Record<string, "pick" | "reject"> = { b: "reject", e: "reject" }
  for (const [id, n] of Object.entries(picks)) if (frame >= E.pencilMarks[n]!) marks[id] = "pick"
  return (
    <Mat>
      <AbsoluteFill style={{ flexDirection: "row" }}>
        <div style={{ flex: 1.1, position: "relative" }}>
          <Camera from={S.records[0]} to={S.records[1]} scale={2.1} tilt={[18, 8]} turn={[14, 4]} push={[0.95, 1.05]}>
            <Board rows={regions.map((r, i) => ({ name: r.name, status: flip(r.from, r.to, frame, E.flapRows[i]!) }))} />
          </Camera>
        </div>
        <div style={{ flex: 1, position: "relative" }}>
          <Camera from={S.records[0]} to={S.records[1]} scale={1.8} tilt={[14, 6]} turn={[-14, -4]} push={[0.95, 1.05]}>
            <div className="film-pencil" style={{ width: 380 }}>
              <ContactSheet aria-label="Variants" columns={3} value={marks}>
                {hues.map((h, i) => {
                  const id = "abcdef"[i]!
                  const cue = picks[id] === undefined ? 0 : E.pencilMarks[picks[id]!]!
                  const draw = interpolate(frame, [cue, cue + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
                  return (
                    <ContactSheetFrame key={id} id={id} label={`Frame ${i + 1}`} style={{ "--film-draw": draw } as React.CSSProperties}>
                      <svg viewBox="0 0 90 60" style={{ display: "block", width: "100%", height: "100%" }}>
                        <rect width="90" height="60" fill={`oklch(0.72 0.1 ${h})`} />
                        <circle cx={25 + i * 8} cy={22} r="7" fill="oklch(0.95 0.08 90)" />
                        <path d="M0 42 Q20 30 40 40 T90 36 V60 H0 Z" fill={`oklch(0.45 0.09 ${h + 40})`} />
                      </svg>
                    </ContactSheetFrame>
                  )
                })}
              </ContactSheet>
            </div>
          </Camera>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 70 }}>
        <Label cue={S.records[0] + 6}>Split-flap board · contact sheet</Label>
        <Words text="See many things at once." delay={S.records[0] + 10} size={64} style={{ marginTop: 12 }} />
      </AbsoluteFill>
    </Mat>
  )
}

/* ------------------------------------------------------------------ */
/* 8. Montage: the rest of the library, one cut every half beat.       */
/* ------------------------------------------------------------------ */

export type Shot = { name: string; node: React.ReactNode; scale?: number }

export function MontageScene({ shots }: { shots: Shot[] }) {
  const frame = useCurrentFrame()
  const len = BEAT / 2
  const i = Math.min(shots.length - 1, Math.floor((frame - S.montage[0]) / len))
  const shot = shots[i]!
  const local = (frame - S.montage[0] - i * len) / len
  const dark = i % 4 === 3
  return (
    <AbsoluteFill style={{ background: dark ? "oklch(0.2 0.008 165)" : "var(--mat)" }}>
      <AbsoluteFill style={{ perspective: 2000, alignItems: "center", justifyContent: "center" }}>
        <div
          className={dark ? "dark" : undefined}
          style={{
            transform: `rotateX(${jitter(`tx${i}`, 14)}deg) rotateY(${jitter(`ty${i}`, 18)}deg) rotateZ(${jitter(`tz${i}`, 4)}deg) scale(${(shot.scale ?? 1.6) * (1 + local * 0.08)})`,
            color: "var(--foreground)",
          }}
        >
          {shot.node}
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 80, bottom: 64, fontFamily: mono, fontSize: 26, letterSpacing: "0.2em", textTransform: "uppercase", color: dark ? "oklch(0.75 0.01 160)" : "var(--mat-muted)" }}>
        {String(i + 1).padStart(2, "0")} · {shot.name}
      </div>
    </AbsoluteFill>
  )
}

/* ------------------------------------------------------------------ */
/* 9. Demo products: four browser windows, flipped through on the beat.*/
/* ------------------------------------------------------------------ */

const demoNames = ["Relay · agent control room", "Meterline · usage billing", "Shipyard · release coordination", "Casefile · legal review desk"]

function BrowserFrame({ src, title }: { src: string; title: string }) {
  return (
    <div style={{ width: 1280, borderRadius: 22, overflow: "hidden", background: "oklch(0.97 0.004 145)", boxShadow: "0 1px 0 oklch(1 0 0 / 0.8) inset, 0 40px 80px -30px oklch(0.2 0.01 165 / 0.55), 0 0 0 1px oklch(0.2 0.01 165 / 0.12)" }}>
      <div style={{ height: 44, display: "flex", alignItems: "center", gap: 9, padding: "0 18px", borderBottom: "1px solid oklch(0.85 0.01 155)" }}>
        {["oklch(0.7 0.18 27)", "oklch(0.82 0.15 85)", "oklch(0.72 0.15 150)"].map((c) => (
          <span key={c} style={{ width: 13, height: 13, borderRadius: 99, background: c }} />
        ))}
        <span style={{ marginLeft: 18, fontFamily: mono, fontSize: 16, color: "oklch(0.49 0.017 165)" }}>{title}</span>
      </div>
      <Img src={staticFile(src)} style={{ display: "block", width: "100%" }} />
    </div>
  )
}

export function DemosScene() {
  const frame = useCurrentFrame()
  const flips = E.demoFlips
  const front = flips.filter((c) => frame >= c).length
  return (
    <Mat>
      <AbsoluteFill style={{ perspective: 2600, alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", width: 1280, height: 800, transformStyle: "preserve-3d", transform: "rotateX(12deg) rotateY(-14deg) translateY(30px) scale(0.88)" }}>
          {[0, 1, 2, 3].map((n) => {
            const out = n < 3 ? useHit(flips[n]!, { damping: 18, stiffness: 120 }) : 0
            const depth = n - front
            const rise = useHit(n === 0 ? S.demos[0] : flips[n - 1]!, { damping: 16, stiffness: 120 })
            return (
              <div
                key={n}
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 10 - n,
                  transform: `translateZ(${-Math.max(0, depth) * 110 + rise * 0}px) translateY(${Math.max(0, depth) * -46 - out * 1100}px) rotateX(${out * -28}deg)`,
                  opacity: depth < -1 ? 0 : 1 - out * 0.4,
                  filter: depth > 0 ? `brightness(${1 - depth * 0.06}) blur(${depth * 1.2}px)` : undefined,
                }}
              >
                <BrowserFrame src={`demos/demo-${n + 1}.jpg`} title={`bevel-ui.vercel.app/demo/${n + 1}`} />
              </div>
            )
          })}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ padding: "70px 100px", alignItems: "flex-start" }}>
        <Label cue={S.demos[0] + 4}>Demos</Label>
        <div key={front} style={{ marginTop: 12 }}>
          <Words text={demoNames[Math.min(3, front)]!} delay={front === 0 ? S.demos[0] + 8 : flips[front - 1]!} size={58} style={{ justifyContent: "flex-start" }} />
        </div>
      </AbsoluteFill>
    </Mat>
  )
}

/* ------------------------------------------------------------------ */
/* 10. Install: the command types; Enter, and the component flies out. */
/* ------------------------------------------------------------------ */

export function InstallScene() {
  const frame = useCurrentFrame()
  const command = "npx shadcn@latest add @bevel/annunciator"
  const typed = command.slice(0, Math.max(0, Math.floor((frame - E.typingStart) / E.typingStep)))
  const box = useHit(S.install[0], { damping: 16, stiffness: 140 })
  const out = useHit(E.enter, { damping: 13, stiffness: 110 })
  const shake = useShake(E.enter, 6)
  const caret = Math.floor(frame / 8) % 2 === 0
  return (
    <Mat>
      <AbsoluteFill style={{ perspective: 2400, alignItems: "center", justifyContent: "center", transform: `translate(${shake.x}px, ${shake.y}px)` }}>
        <div style={{ transform: `rotateX(${14 - out * 6}deg) translateY(${(1 - box) * 120 + out * 200}px) scale(${1 - out * 0.12})`, opacity: box }}>
          <div style={{ width: 1240, borderRadius: 26, background: "oklch(0.19 0.008 165)", boxShadow: "0 1px 0 oklch(1 0 0 / 0.12) inset, 0 50px 90px -30px oklch(0.15 0.01 165 / 0.7)", padding: "26px 40px 40px" }}>
            <div style={{ display: "flex", gap: 9, marginBottom: 26 }}>
              {[0, 1, 2].map((k) => <span key={k} style={{ width: 13, height: 13, borderRadius: 99, background: "oklch(0.35 0.01 165)" }} />)}
            </div>
            <div style={{ fontFamily: mono, fontSize: 40, color: "oklch(0.93 0.006 150)" }}>
              <span style={{ color: "oklch(0.6 0.12 150)" }}>$ </span>
              {typed}
              <span style={{ opacity: caret && frame < E.enter ? 1 : 0 }}>▍</span>
            </div>
            <div style={{ fontFamily: mono, fontSize: 26, marginTop: 18, color: "oklch(0.69 0.016 160)", opacity: frame >= E.enter ? 1 : 0 }}>
              ✔ Created components/ui/annunciator.tsx · Updated globals.css
            </div>
          </div>
        </div>
      </AbsoluteFill>
      {/* Out of the terminal, toward you. */}
      {frame >= E.enter && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", perspective: 2000 }}>
          <div style={{ transform: `translateY(${-140 * out + 160}px) translateZ(${(out - 1) * 600}px) rotateX(${(1 - out) * 40}deg) scale(${2.2 * out})`, opacity: Math.min(1, out * 2) }}>
            <Lamps lit={(i) => i !== 3} />
          </div>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 80 }}>
        <Words text="Copy it in. Make it yours." delay={S.install[0] + 4} size={84} out={E.enter - 10} />
      </AbsoluteFill>
    </Mat>
  )
}

/* ------------------------------------------------------------------ */
/* 11. End: the wordmark, the address, the light passing over.         */
/* ------------------------------------------------------------------ */

export function EndScene() {
  const frame = useCurrentFrame()
  const fade = interpolate(frame, [S.end[1] - 24, S.end[1]], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  return (
    <AbsoluteFill style={{ background: "var(--night)" }}>
      <AbsoluteFill style={{ opacity: fade }}>
        <Mat>
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 28 }}>
            <Wordmark cue={E.endChord} size={260} sweepAt={E.endChord + 20} />
            <Words text="bevel-ui.vercel.app" delay={E.endChord + 16} size={58} weight={700} />
            <Label cue={E.endChord + 30}>Open source · MIT · Base UI · Tailwind · shadcn</Label>
          </AbsoluteFill>
        </Mat>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
