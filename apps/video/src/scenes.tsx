import * as React from "react"
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion"
import { Annunciator, AnnunciatorPanel, AnnunciatorTile } from "@workspace/ui/components/annunciator"
import { ContactSheet, ContactSheetFrame } from "@workspace/ui/components/contact-sheet"
import { DetentKnob, DetentKnobStop } from "@workspace/ui/components/detent-knob"
import { DueDateSlip, DueDateSlipStatus } from "@workspace/ui/components/due-date-slip"
import {
  EngineTelegraph,
  EngineTelegraphDial,
  EngineTelegraphOrder,
  EngineTelegraphOrders,
} from "@workspace/ui/components/engine-telegraph"
import {
  GuardedSwitch,
  GuardedSwitchControl,
  GuardedSwitchLabel,
} from "@workspace/ui/components/guarded-switch"
import { Lockout, LockoutHasp, LockoutLock } from "@workspace/ui/components/lockout"
import {
  Mixer,
  MixerStrip,
  MixerStripFader,
  MixerStripMute,
  MixerStripName,
  MixerStripSolo,
} from "@workspace/ui/components/mixer-strip"
import { NumberWheel } from "@workspace/ui/components/number-wheel"
import { PushToTalk, PushToTalkKey } from "@workspace/ui/components/push-to-talk"
import { SplitFlap, SplitFlapRow, SplitFlapText } from "@workspace/ui/components/split-flap"
import { TakeANumber, TakeANumberSign } from "@workspace/ui/components/take-a-number"
import { Caption, Mat, Stage, Words, ease, easeInOut, useProgress, useSpring } from "./kit"
import { mono, sans } from "./fonts"

/* 1. Dark. */
export function Flat() {
  return (
    <AbsoluteFill style={{ background: "var(--night)", alignItems: "center", justifyContent: "center" }}>
      <Words text="Software went flat." delay={8} size={150} color="oklch(0.93 0.006 150)" out={58} />
    </AbsoluteFill>
  )
}

/* 2. The lights come up on the workbench. */
export function LightsUp() {
  const frame = useCurrentFrame()
  const lit = useProgress(0, 40, easeInOut)
  return (
    <AbsoluteFill>
      <Mat glow={lit} />
      {/* The light spreads from above, like a lamp coming on. */}
      <AbsoluteFill
        style={{
          background: "var(--night)",
          maskImage: `radial-gradient(circle at 50% 0%, transparent ${lit * 160}%, black ${lit * 160 + 20}%)`,
          WebkitMaskImage: `radial-gradient(circle at 50% 0%, transparent ${lit * 160}%, black ${lit * 160 + 20}%)`,
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: interpolate(frame, [80, 90], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        <Words text="Bevel puts the weight back." delay={22} size={128} />
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

/** Lifts a guarded switch's cover on mount; the frame then sets how far it's lifted. */
function OpenOnMount({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null)
  React.useLayoutEffect(() => {
    ref.current?.querySelector<HTMLButtonElement>("[aria-expanded]")?.click()
  }, [])
  return <div ref={ref}>{children}</div>
}

/* 3. Guarded switch: the cover swings up, the lever goes over. */
export function Guarded() {
  const frame = useCurrentFrame()
  const lift = useProgress(34, 56, ease)
  const on = frame >= 84
  const bump = interpolate(frame, [84, 88, 100], [1, 1.035, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  return (
    <Mat>
      <Stage scale={2.6} to={150} tilt={[18, 6]} turn={[-14, 8]} push={[0.92, 1.06]} y={-90}>
        <div style={{ transform: `scale(${bump})` }}>
          <OpenOnMount>
            <GuardedSwitch
              checked={on}
              autoClose={false}
              style={{ "--guarded-switch-open-angle": `${-112 * lift}deg` } as React.CSSProperties}
            >
              <GuardedSwitchLabel>Deploy to prod</GuardedSwitchLabel>
              <GuardedSwitchControl />
            </GuardedSwitch>
          </OpenOnMount>
        </div>
      </Stage>
      <AbsoluteFill style={{ justifyContent: "flex-end", paddingBottom: 90 }}>
        <Caption name="Guarded switch" line="Two deliberate steps to ship." delay={18} out={138} />
      </AbsoluteFill>
    </Mat>
  )
}

const lamps = [
  { id: "budget", label: "Over budget", tone: "red", at: 22 },
  { id: "tests", label: "Tests failing", tone: "amber", at: 34 },
  { id: "rate", label: "Rate limited", tone: "amber", at: 999 },
  { id: "context", label: "Context full", tone: "amber", at: 46 },
  { id: "approval", label: "Needs approval", tone: "white", at: 58 },
  { id: "deploy", label: "Deploy live", tone: "green", at: 70 },
] as const

/* 4. Annunciator: the lamps come on one by one. */
export function Lamps() {
  const frame = useCurrentFrame()
  return (
    <Mat>
      <Stage scale={2.3} to={135} tilt={[10, 0]} turn={[12, -6]} push={[0.9, 1.05]} y={-110}>
        <div style={{ width: 380 }}>
          <Annunciator aria-label="Agent alerts">
            <AnnunciatorPanel className="grid-cols-3">
              {lamps.map((l) => (
                <AnnunciatorTile key={l.id} id={l.id} tone={l.tone} active={frame >= l.at}>
                  {l.label}
                </AnnunciatorTile>
              ))}
            </AnnunciatorPanel>
          </Annunciator>
        </div>
      </Stage>
      <AbsoluteFill style={{ justifyContent: "flex-end", paddingBottom: 90 }}>
        <Caption name="Annunciator" line="Alarms that wait until someone sees them." delay={14} out={122} />
      </AbsoluteFill>
    </Mat>
  )
}

/* 5. Mixer: a lead agent rides the faders; then you take one. */
export function Faders() {
  const frame = useCurrentFrame()
  const t = frame / 30
  const yours = frame >= 78
  const channels = [
    { name: "Explore", v: 55 + 25 * Math.sin(t * 1.6) },
    { name: "Code", v: yours ? interpolate(frame, [78, 96], [62, 92], { easing: ease, extrapolateRight: "clamp" }) : 62 + 18 * Math.sin(t * 1.2 + 1) },
    { name: "Tests", v: 40 + 22 * Math.sin(t * 1.9 + 2) },
    { name: "Docs", v: 28 + 12 * Math.sin(t * 1.4 + 3) },
  ]
  return (
    <Mat>
      <Stage scale={2.1} to={150} tilt={[14, 6]} turn={[-8, 10]} push={[0.92, 1.05]} y={-110}>
        <Mixer aria-label="Subagents">
          {channels.map((c) => (
            <MixerStrip key={c.name} name={c.name} muted={c.name === "Docs"}>
              <MixerStripName />
              <MixerStripMute pressed={c.name === "Docs"} />
              <MixerStripSolo />
              <MixerStripFader
                value={Math.round(c.v)}
                changedBy={c.name === "Code" && yours ? "You" : "Lead"}
              />
            </MixerStrip>
          ))}
        </Mixer>
      </Stage>
      <AbsoluteFill style={{ justifyContent: "flex-end", paddingBottom: 80 }}>
        <Caption name="Mixer strip" line="Faders an agent can move, and you can take back." delay={14} out={138} />
      </AbsoluteFill>
    </Mat>
  )
}

/* 6. Number wheels: a turn's cost, counted as it runs. */
export function Cost() {
  const frame = useCurrentFrame()
  const value = interpolate(frame, [10, 96], [0, 4.27], { easing: (x) => 1 - Math.pow(1 - x, 2.4), extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  return (
    <Mat>
      <Stage scale={1} to={120} tilt={[12, 2]} turn={[10, -4]} push={[0.94, 1.04]} y={-120}>
        <div style={{ fontSize: 150, fontFamily: mono }}>
          <NumberWheel value={Math.round(value * 100) / 100} currency="USD" tone="black" format={{ minimumFractionDigits: 2 }} />
        </div>
      </Stage>
      <AbsoluteFill style={{ justifyContent: "flex-end", paddingBottom: 110 }}>
        <Caption name="Number wheel" line="Cost, counted as it runs." delay={14} out={108} />
      </AbsoluteFill>
    </Mat>
  )
}

/** Text that turns over column by column, from `from` to `to`, starting at `at`. */
function useFlip(from: string, to: string, at: number, stagger = 2) {
  const frame = useCurrentFrame()
  const n = Math.max(from.length, to.length)
  const done = Math.max(0, Math.floor((frame - at) / stagger))
  return to.padEnd(n).slice(0, done) + from.padEnd(n).slice(done)
}

function Region({ name, from, to, at }: { name: string; from: string; to: string; at: number }) {
  const status = useFlip(from, to, at)
  return (
    <SplitFlapRow name={name}>
      <SplitFlapText value={name} length={8} />
      <SplitFlapText value={status} length={8} tone="amber" />
    </SplitFlapRow>
  )
}

/* 7. Split-flap: the regions turn over to LIVE. */
export function Board() {
  return (
    <Mat>
      <Stage scale={2.2} to={135} tilt={[16, 4]} turn={[-12, 6]} push={[0.92, 1.05]} y={-100}>
        <div style={{ fontSize: 16 }}>
          <SplitFlap aria-label="Deploys">
            <Region name="US-EAST" from="ROLLOUT" to="LIVE" at={20} />
            <Region name="US-WEST" from="TESTING" to="ROLLOUT" at={34} />
            <Region name="EU-WEST" from="BUILDING" to="TESTING" at={48} />
            <Region name="AP-SOUTH" from="QUEUED" to="BUILDING" at={62} />
          </SplitFlap>
        </div>
      </Stage>
      <AbsoluteFill style={{ justifyContent: "flex-end", paddingBottom: 90 }}>
        <Caption name="Split-flap board" line="Status that reads across a room." delay={14} out={122} />
      </AbsoluteFill>
    </Mat>
  )
}

/** One object on the wall, rising into place a little after its neighbours. */
function Tile({ i, children }: { i: number; children: React.ReactNode }) {
  const p = useSpring(6 + i * 3, { damping: 16, stiffness: 100 })
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `translateZ(${(1 - p) * -400}px) translateY(${(1 - p) * 80}px)`,
        opacity: p,
      }}
    >
      {children}
    </div>
  )
}

/* 8. The wall: everything at once, and the name. */
export function Wall() {
  const frame = useCurrentFrame()
  const dolly = useProgress(0, 180, easeInOut)
  const title = useSpring(56, { damping: 20, stiffness: 110 })
  const veil = useProgress(48, 70)
  const items: React.ReactNode[] = [
    <GuardedSwitch key="g" checked autoClose={false}><GuardedSwitchLabel>Deploy</GuardedSwitchLabel><GuardedSwitchControl /></GuardedSwitch>,
    <div key="a" style={{ width: 300 }}><Annunciator aria-label="Alerts"><AnnunciatorPanel className="grid-cols-2">{lamps.slice(0, 4).map((l) => <AnnunciatorTile key={l.id} id={l.id} tone={l.tone} active={l.id !== "rate"}>{l.label}</AnnunciatorTile>)}</AnnunciatorPanel></Annunciator></div>,
    <DetentKnob key="k" aria-label="Effort" defaultValue="high"><DetentKnobStop value="low">Low</DetentKnobStop><DetentKnobStop value="medium">Medium</DetentKnobStop><DetentKnobStop value="high">High</DetentKnobStop><DetentKnobStop value="max">Max</DetentKnobStop></DetentKnob>,
    <div key="t" style={{ width: 300 }}><EngineTelegraph aria-label="Autonomy" value="act" confirmed="ask"><EngineTelegraphDial /><EngineTelegraphOrders className="hidden"><EngineTelegraphOrder value="stop">Stop</EngineTelegraphOrder><EngineTelegraphOrder value="ask">Ask</EngineTelegraphOrder><EngineTelegraphOrder value="act">Act</EngineTelegraphOrder><EngineTelegraphOrder value="auto">Auto</EngineTelegraphOrder></EngineTelegraphOrders></EngineTelegraph></div>,
    <DueDateSlip key="d" title="Production API key" dates={["2026-08-14", "2026-09-13", "2026-11-12"]} now="2026-10-17"><DueDateSlipStatus /></DueDateSlip>,
    <TakeANumber key="q" aria-label="Queue" serving={42} ticket={44}><TakeANumberSign /></TakeANumber>,
    <PushToTalk key="p" talking={frame % 60 < 30} />,
    <Lockout key="l" aria-label="Migration"><LockoutHasp><LockoutLock id="p" owner="Priya" reason="Backup" /><LockoutLock id="s" owner="Sam" reason="Load test" /></LockoutHasp></Lockout>,
    <div key="c" style={{ width: 340 }}><ContactSheet aria-label="Variants" columns={3} defaultValue={{ b: "pick", c: "reject" }}>{[40, 230, 350, 150, 60, 290].map((h, i) => <ContactSheetFrame key={i} id={"abcdef"[i]!} label={`Frame ${i + 1}`}><span style={{ display: "block", width: "100%", height: "100%", background: `oklch(0.66 0.1 ${h})` }} /></ContactSheetFrame>)}</ContactSheet></div>,
  ]
  return (
    <Mat>
      <AbsoluteFill style={{ perspective: 2400, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 420px)",
            gap: 70,
            alignItems: "center",
            transformStyle: "preserve-3d",
            transform: `rotateX(${interpolate(dolly, [0, 1], [32, 22])}deg) rotateZ(${interpolate(dolly, [0, 1], [-10, -4])}deg) translateY(${interpolate(dolly, [0, 1], [120, -60])}px) scale(${interpolate(dolly, [0, 1], [1.05, 1.18])})`,
          }}
        >
          {items.map((item, i) => (
            <Tile key={i} i={i}>
              {item}
            </Tile>
          ))}
        </div>
      </AbsoluteFill>
      {/* The name comes up over the wall. */}
      <AbsoluteFill style={{ background: `oklch(0.935 0.006 145 / ${0.55 * veil})` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 28, flexDirection: "column" }}>
        <div
          style={{
            fontFamily: sans,
            fontSize: 260,
            fontWeight: 800,
            letterSpacing: "-0.05em",
            color: "var(--mat-ink)",
            textShadow: "0 3px 0 oklch(1 0 0 / 0.6), 0 -2px 0 oklch(0 0 0 / 0.18)",
            opacity: title,
            transform: `translateY(${(1 - title) * 60}px) scale(${0.94 + 0.06 * title})`,
          }}
        >
          Bevel
        </div>
        <Words text="Tactile React components for real product work." delay={70} size={50} weight={600} color="var(--mat-muted)" />
      </AbsoluteFill>
    </Mat>
  )
}

/* 9. Install: the command types itself. */
export function Install() {
  const frame = useCurrentFrame()
  const command = "npx shadcn@latest add @bevel/annunciator"
  const typed = command.slice(0, Math.max(0, Math.floor((frame - 24) / 1.2)))
  const box = useSpring(4, { damping: 18 })
  const caret = Math.floor(frame / 15) % 2 === 0
  return (
    <Mat>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 56 }}>
        <Words text="Copy it in. It's yours." delay={2} size={110} />
        <div
          style={{
            fontFamily: mono,
            fontSize: 44,
            padding: "30px 44px",
            borderRadius: 22,
            background: "oklch(0.2 0.008 165)",
            color: "oklch(0.93 0.006 150)",
            boxShadow: "0 1px 0 oklch(1 0 0 / 0.5), 0 24px 60px -20px oklch(0.2 0.01 165 / 0.6)",
            minWidth: 1180,
            opacity: box,
            transform: `translateY(${(1 - box) * 40}px)`,
          }}
        >
          <span style={{ color: "oklch(0.69 0.016 160)" }}>$ </span>
          {typed}
          <span style={{ opacity: caret ? 1 : 0 }}>▍</span>
        </div>
        <div style={{ fontFamily: sans, fontSize: 32, color: "var(--mat-muted)", opacity: useProgress(76, 92) }}>
          Built on Base UI and Tailwind CSS. Installs with the shadcn CLI.
        </div>
      </AbsoluteFill>
    </Mat>
  )
}

/* 10. End card. */
export function End() {
  const p = useSpring(6, { damping: 20 })
  return (
    <Mat>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 30 }}>
        <div
          style={{
            fontFamily: sans,
            fontSize: 180,
            fontWeight: 800,
            letterSpacing: "-0.05em",
            color: "var(--mat-ink)",
            textShadow: "0 3px 0 oklch(1 0 0 / 0.6), 0 -2px 0 oklch(0 0 0 / 0.18)",
            opacity: p,
            transform: `scale(${0.96 + 0.04 * p})`,
          }}
        >
          Bevel
        </div>
        <Words text="bevel-ui.vercel.app" delay={18} size={60} weight={600} />
        <div style={{ fontFamily: mono, fontSize: 28, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--mat-muted)", opacity: useProgress(34, 50) }}>
          Open source · MIT
        </div>
      </AbsoluteFill>
    </Mat>
  )
}
