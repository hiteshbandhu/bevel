import * as React from "react"
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion"
import { mono, sans } from "./fonts"

export const ease = Easing.bezier(0.23, 1, 0.32, 1)
export const easeInOut = Easing.bezier(0.77, 0, 0.175, 1)

/** 0 → 1 between two frames, eased. */
export function useProgress(from: number, to: number, easing = ease) {
  const frame = useCurrentFrame()
  return interpolate(frame, [from, to], [0, 1], { easing, extrapolateLeft: "clamp", extrapolateRight: "clamp" })
}

/** A settling spring starting at `delay`. */
export function useSpring(delay = 0, config: { damping?: number; stiffness?: number; mass?: number } = {}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  return spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 120, mass: 0.9, ...config } })
}

/** Kinetic type: each word rises out of a mask, one after another. */
export function Words({
  text,
  delay = 0,
  stagger = 3,
  size = 120,
  weight = 800,
  color = "var(--mat-ink)",
  out,
  style,
}: {
  text: string
  delay?: number
  stagger?: number
  size?: number
  weight?: number
  color?: string
  /** Frame at which the words leave, upward. */
  out?: number
  style?: React.CSSProperties
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const words = text.split(" ")
  return (
    <div
      style={{
        fontFamily: sans,
        fontSize: size,
        fontWeight: weight,
        letterSpacing: "-0.035em",
        lineHeight: 1.04,
        color,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: "0.24em",
        ...style,
      }}
    >
      {words.map((word, i) => {
        const p = spring({ frame: frame - delay - i * stagger, fps, config: { damping: 20, stiffness: 140 } })
        const leave = out === undefined ? 0 : interpolate(frame, [out + i * 2, out + i * 2 + 12], [0, 1], { easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp" })
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: "0.08em" }}>
            <span
              style={{
                display: "inline-block",
                transform: `translateY(${(1 - p) * 110 - leave * 110}%)`,
                opacity: p * (1 - leave),
              }}
            >
              {word}
            </span>
          </span>
        )
      })}
    </div>
  )
}

/** A small caption under an object: a label line, then what it's for. */
export function Caption({ name, line, delay = 0, out }: { name: string; line: string; delay?: number; out?: number }) {
  const p = useProgress(delay, delay + 18)
  const frame = useCurrentFrame()
  const leave = out === undefined ? 0 : interpolate(frame, [out, out + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  return (
    <div style={{ textAlign: "center", opacity: p * (1 - leave), transform: `translateY(${(1 - p) * 24}px)` }}>
      <div style={{ fontFamily: mono, fontSize: 22, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--mat-muted)" }}>
        {name}
      </div>
      <Words text={line} delay={delay + 4} size={56} weight={700} out={out} style={{ marginTop: 14 }} />
    </div>
  )
}

/**
 * A stage for one object: perspective, a slow camera move (tilt and push),
 * and the object scaled up from its real size so its details read at 1080p.
 */
export function Stage({
  children,
  scale = 2.4,
  from = 0,
  to = 120,
  tilt = [16, 4],
  turn = [-10, 6],
  push = [0.9, 1.04],
  y = -60,
}: {
  children: React.ReactNode
  scale?: number
  from?: number
  to?: number
  tilt?: [number, number]
  turn?: [number, number]
  push?: [number, number]
  y?: number
}) {
  const t = useProgress(from, to, easeInOut)
  const enter = useSpring(from, { damping: 16, stiffness: 90 })
  const rx = interpolate(t, [0, 1], tilt)
  const ry = interpolate(t, [0, 1], turn)
  const s = interpolate(t, [0, 1], push) * interpolate(enter, [0, 1], [0.82, 1])
  return (
    <AbsoluteFill style={{ perspective: 2200, alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          transform: `translateY(${y + (1 - enter) * 160}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`,
          transformStyle: "preserve-3d",
          opacity: enter,
        }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: "center" }}>{children}</div>
      </div>
    </AbsoluteFill>
  )
}

/** The workbench, lit from above, with a soft pool of light where the object sits. */
export function Mat({ children, glow = 1 }: { children?: React.ReactNode; glow?: number }) {
  return (
    <AbsoluteFill style={{ background: "var(--mat)" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 55% at 50% 42%, oklch(1 0 0 / ${0.55 * glow}), transparent 70%), radial-gradient(ellipse 120% 90% at 50% 50%, transparent 55%, oklch(0.2 0.01 165 / 0.22))`,
        }}
      />
      {children}
    </AbsoluteFill>
  )
}

/** Fades a whole scene in and out at its edges. */
export function SceneFade({ length, children, fade = 10 }: { length: number; children: React.ReactNode; fade?: number }) {
  const frame = useCurrentFrame()
  const o = interpolate(frame, [0, fade, length - fade, length], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>
}
