import { AbsoluteFill } from "remotion"
import "../style.css"

/**
 * The Bevel mark is a bevel: a square seen from above, its four edges sloping
 * away under one light from the top. The top edge catches the light, the
 * sides take half, the bottom falls into shade. Plain polygons, so it holds
 * at 16px. Three takes:
 *
 *   lamp   graphite, with an amber indicator lamp lit on the face
 *   brass  a brass frame around a recessed graphite face
 *   key    a pressed key: deep bevel, small face, a single detent mark
 */
export type LogoVariant = "lamp" | "brass" | "key"

type Facets = { top: string; left: string; right: string; bottom: string; face: string; faceTo: string; rim: string }

const palettes: Record<LogoVariant, Facets> = {
  lamp: {
    top: "oklch(0.62 0.01 260)",
    left: "oklch(0.44 0.01 260)",
    right: "oklch(0.3 0.01 260)",
    bottom: "oklch(0.2 0.01 260)",
    face: "oklch(0.38 0.01 260)",
    faceTo: "oklch(0.28 0.01 260)",
    rim: "oklch(0.14 0.01 260)",
  },
  brass: {
    top: "oklch(0.92 0.09 90)",
    left: "oklch(0.78 0.12 82)",
    right: "oklch(0.62 0.11 72)",
    bottom: "oklch(0.47 0.09 62)",
    face: "oklch(0.24 0.01 260)",
    faceTo: "oklch(0.32 0.01 260)",
    rim: "oklch(0.36 0.07 60)",
  },
  key: {
    top: "oklch(0.7 0.01 260)",
    left: "oklch(0.5 0.01 260)",
    right: "oklch(0.34 0.01 260)",
    bottom: "oklch(0.22 0.01 260)",
    face: "oklch(0.46 0.01 260)",
    faceTo: "oklch(0.36 0.01 260)",
    rim: "oklch(0.14 0.01 260)",
  },
}

/** The mark itself, in a 100×100 box. */
export function Mark({ variant, size }: { variant: LogoVariant; size: number }) {
  const p = palettes[variant]
  // Outer square with rounded corners via the rim; inner face inset by `b`.
  const o = 4
  const O = 96
  const b = variant === "key" ? 26 : 20
  const i = o + b
  const I = O - b
  const r = 13
  const id = `face-${variant}`
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} shapeRendering="geometricPrecision">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.face} />
          <stop offset="1" stopColor={p.faceTo} />
        </linearGradient>
        <radialGradient id="lamp" cx="0.4" cy="0.35" r="0.65">
          <stop offset="0" stopColor="oklch(0.97 0.08 90)" />
          <stop offset="0.45" stopColor="oklch(0.83 0.16 75)" />
          <stop offset="1" stopColor="oklch(0.62 0.17 55)" />
        </radialGradient>
        <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="oklch(0.85 0.17 75 / 0.55)" />
          <stop offset="1" stopColor="oklch(0.85 0.17 75 / 0)" />
        </radialGradient>
        <clipPath id={`clip-${variant}`}>
          <rect x={o} y={o} width={O - o} height={O - o} rx={r} />
        </clipPath>
      </defs>
      <g clipPath={`url(#clip-${variant})`}>
        <polygon points={`${o},${o} ${O},${o} ${I},${i} ${i},${i}`} fill={p.top} />
        <polygon points={`${o},${o} ${i},${i} ${i},${I} ${o},${O}`} fill={p.left} />
        <polygon points={`${O},${o} ${O},${O} ${I},${I} ${I},${i}`} fill={p.right} />
        <polygon points={`${o},${O} ${i},${I} ${I},${I} ${O},${O}`} fill={p.bottom} />
      </g>
      <rect x={i} y={i} width={I - i} height={I - i} rx={variant === "key" ? 5 : 4} fill={`url(#${id})`} />
      {/* A hairline where the face meets the bevel: light on top, shade below. */}
      <line x1={i + 3} y1={i + 0.4} x2={I - 3} y2={i + 0.4} stroke="oklch(1 0 0 / 0.35)" strokeWidth="0.8" />
      <rect x={o} y={o} width={O - o} height={O - o} rx={r} fill="none" stroke={p.rim} strokeWidth="1.6" />
      {variant === "lamp" && (
        <>
          <circle cx="50" cy="50" r="16" fill="url(#glow)" />
          <circle cx="50" cy="50" r="9" fill="url(#lamp)" />
          <circle cx="47" cy="47" r="2.6" fill="oklch(1 0 0 / 0.75)" />
        </>
      )}
      {variant === "key" && <rect x="47.5" y={i + 6} width="5" height="14" rx="2.5" fill="oklch(0.93 0.03 90)" />}
    </svg>
  )
}

/** One mark on a transparent square, for icons. */
export function Logo({ variant = "lamp", padded = true }: { variant?: LogoVariant; padded?: boolean }) {
  return (
    <AbsoluteFill style={{ background: "transparent", alignItems: "center", justifyContent: "center" }}>
      <Mark variant={variant} size={padded ? 900 : 1024} />
    </AbsoluteFill>
  )
}

/** All three, large and at favicon sizes, on light and dark, to choose from. */
export function LogoSheet() {
  const variants: LogoVariant[] = ["lamp", "brass", "key"]
  const row = (bg: string, fg: string) => (
    <div style={{ display: "flex", gap: 80, padding: "48px 64px", background: bg, alignItems: "center" }}>
      {variants.map((v) => (
        <div key={v} style={{ display: "flex", alignItems: "flex-end", gap: 28 }}>
          <Mark variant={v} size={260} />
          <Mark variant={v} size={64} />
          <Mark variant={v} size={32} />
          <Mark variant={v} size={16} />
          <span style={{ color: fg, font: "600 22px system-ui", marginLeft: 8 }}>{v}</span>
        </div>
      ))}
    </div>
  )
  return (
    <AbsoluteFill style={{ background: "white" }}>
      {row("oklch(0.97 0.004 145)", "oklch(0.3 0 0)")}
      {row("oklch(0.17 0.007 165)", "oklch(0.85 0 0)")}
    </AbsoluteFill>
  )
}
