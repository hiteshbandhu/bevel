import { AbsoluteFill } from "remotion"
import { mono, sans } from "../fonts"
import { Film } from "./Film"

/**
 * The 16:9 film framed for feeds that prefer tall or square video: the
 * film in the middle, the name above it and the install line below.
 */
export function Framed({ shape }: { shape: "vertical" | "square" }) {
  const width = 1080
  const scale = width / 1920
  const tall = shape === "vertical"
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse 90% 60% at 50% 30%, oklch(1 0 0 / 0.5), transparent 70%), oklch(0.935 0.006 145)",
        fontFamily: sans,
        color: "oklch(0.24 0.014 165)",
        alignItems: "center",
        justifyContent: "center",
        gap: tall ? 90 : 46,
      }}
    >
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: tall ? 26 : 12 }}>
        <div
          style={{
            fontSize: tall ? 150 : 96,
            fontWeight: 800,
            letterSpacing: "-0.05em",
            lineHeight: 1,
            color: "oklch(0.8 0.01 150)",
            textShadow: "0 -3px 2px oklch(0.2 0.01 165 / 0.45), 0 3px 1px oklch(1 0 0 / 0.95)",
          }}
        >
          Bevel
        </div>
        <div style={{ fontSize: tall ? 46 : 34, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, padding: "0 70px" }}>
          Tactile React components for real product work.
        </div>
      </div>
      <div
        style={{
          position: "relative",
          width,
          height: 1080 * scale,
          overflow: "hidden",
          boxShadow: "0 30px 60px -30px oklch(0.2 0.01 165 / 0.6)",
        }}
      >
        <div style={{ position: "absolute", width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          <Film />
        </div>
      </div>
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: tall ? 22 : 10, alignItems: "center" }}>
        <div style={{ fontFamily: mono, fontSize: tall ? 30 : 24, background: "oklch(0.9 0.008 150)", padding: "14px 22px", borderRadius: 14 }}>
          npx shadcn add @bevel/annunciator
        </div>
        <div style={{ fontSize: tall ? 34 : 26, color: "oklch(0.47 0.017 165)" }}>bevel-ui.vercel.app</div>
      </div>
    </AbsoluteFill>
  )
}
