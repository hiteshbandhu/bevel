import * as React from "react"
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion"
import { mono, sans } from "../fonts"
import raw from "./cues.json"

/** The cue sheet, with each scene typed as a [start, end) pair of frames. */
export const cues = {
  ...raw,
  scenes: raw.scenes as unknown as Record<keyof typeof raw.scenes, readonly [number, number]>,
}
export const BEAT = cues.beat

/** Frames since a cue, clamped at 0. */
export function useSince(cue: number) {
  return Math.max(0, useCurrentFrame() - cue)
}

/** A snappy spring from a cue: physical things arriving or settling. */
export function useHit(cue: number, config: { damping?: number; stiffness?: number; mass?: number } = {}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  return spring({ frame: frame - cue, fps, config: { damping: 14, stiffness: 180, mass: 0.7, ...config } })
}

/** Film grain over everything: a little life in the flat areas. */
export function Grain({ opacity = 0.06 }: { opacity?: number }) {
  const frame = useCurrentFrame()
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity }}>
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 12} />
          <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1.4 -0.2" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  )
}

/** Darkens the corners, like a lens. */
export function Vignette({ strength = 0.35 }: { strength?: number }) {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background: `radial-gradient(ellipse 75% 70% at 50% 48%, transparent 55%, oklch(0.12 0.01 165 / ${strength}))`,
      }}
    />
  )
}

/** A spotlight on black: everything outside the pool falls away. */
export function Spot({ children, x = 50, y = 46, size = 38 }: { children: React.ReactNode; x?: number; y?: number; size?: number }) {
  return (
    <AbsoluteFill style={{ background: "var(--night)" }}>
      <AbsoluteFill
        style={{
          maskImage: `radial-gradient(circle at ${x}% ${y}%, black ${size * 0.45}%, transparent ${size}%)`,
          WebkitMaskImage: `radial-gradient(circle at ${x}% ${y}%, black ${size * 0.45}%, transparent ${size}%)`,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

/** Big, heavy type that slams in on a beat. */
export function Slam({ text, cue, size = 220, color = "oklch(0.95 0.006 150)" }: { text: string; cue: number; size?: number; color?: string }) {
  const p = useHit(cue, { damping: 12, stiffness: 260 })
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: sans,
          fontSize: size,
          fontWeight: 800,
          letterSpacing: "-0.05em",
          color,
          transform: `scale(${1.25 - 0.25 * p}) translateY(${(1 - p) * 30}px)`,
          opacity: Math.min(1, p * 1.6),
          filter: `blur(${(1 - Math.min(1, p)) * 10}px)`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  )
}

/** A small label: what you're looking at, in mono caps. */
export function Label({ children, cue, style }: { children: React.ReactNode; cue: number; style?: React.CSSProperties }) {
  const p = useHit(cue, { damping: 20, stiffness: 120 })
  return (
    <div
      style={{
        fontFamily: mono,
        fontSize: 22,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "var(--mat-muted)",
        opacity: p,
        transform: `translateY(${(1 - p) * 14}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/** The wordmark stamped into the mat, with a highlight sweeping across it. */
export function Wordmark({ cue, size = 300, sweepAt }: { cue: number; size?: number; sweepAt: number }) {
  const frame = useCurrentFrame()
  const p = useHit(cue, { damping: 16, stiffness: 140 })
  const sweep = interpolate(frame, [sweepAt, sweepAt + 40], [-60, 160], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  const type: React.CSSProperties = {
    fontFamily: sans,
    fontSize: size,
    fontWeight: 800,
    letterSpacing: "-0.055em",
    lineHeight: 1,
  }
  return (
    <div style={{ position: "relative", opacity: Math.min(1, p * 1.4), transform: `scale(${1.08 - 0.08 * p})` }}>
      {/* Debossed: shaded on the upper inner edge, lit along the lower one. */}
      <div
        style={{
          ...type,
          color: "oklch(0.8 0.01 150)",
          textShadow: "0 -4px 3px oklch(0.2 0.01 165 / 0.5), 0 4px 1px oklch(1 0 0 / 0.95), 0 0 1px oklch(0.3 0.01 165 / 0.4)",
        }}
      >
        Bevel
      </div>
      <div
        aria-hidden
        style={{
          ...type,
          position: "absolute",
          inset: 0,
          color: "transparent",
          backgroundImage: `linear-gradient(100deg, transparent ${sweep - 18}%, oklch(1 0 0 / 0.9) ${sweep}%, transparent ${sweep + 18}%)`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          mixBlendMode: "soft-light",
        }}
      >
        Bevel
      </div>
    </div>
  )
}

/** Deterministic jitter for camera angles, keyed by a seed. */
export function jitter(seed: string, range: number) {
  return (random(seed) * 2 - 1) * range
}

/** A gentle camera shake that decays after a hit. */
export function useShake(cue: number, amount = 8) {
  const t = useSince(cue)
  const decay = Math.exp(-t / 5)
  return t === 0 ? { x: 0, y: 0 } : { x: Math.sin(t * 2.7) * amount * decay, y: Math.cos(t * 3.3) * amount * decay }
}
