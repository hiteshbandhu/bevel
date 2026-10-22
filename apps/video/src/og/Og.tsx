import * as React from "react"
import { AbsoluteFill, Img, continueRender, delayRender, staticFile } from "remotion"
import { categories, components } from "../../../web/lib/catalog"
import { demoSites } from "../../../web/lib/demos"
import { posts } from "../../../web/lib/blog"
import { origins } from "../../../web/lib/origins"
import { previews } from "../../../web/components/previews"
import { mono, sans } from "../fonts"
import "../style.css"

/**
 * Link-preview images (Open Graph, 1200×630) and the GitHub social preview
 * (1280×640), rendered from the real components. Static files, made once by
 * scripts/og.mts, not at request time.
 */

const ink = "oklch(0.24 0.014 165)"
const muted = "oklch(0.47 0.017 165)"

/** The workbench every card sits on, lit from above. */
function Bench({ children }: { children: React.ReactNode }) {
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 70% 80% at 70% 30%, oklch(1 0 0 / 0.55), transparent 70%), oklch(0.935 0.006 145)",
        fontFamily: sans,
        color: ink,
        ["--font-sans" as string]: sans,
        ["--font-mono" as string]: mono,
      }}
    >
      {children}
    </AbsoluteFill>
  )
}

/** The wordmark, stamped into the mat. */
function Wordmark({ size }: { size: number }) {
  return (
    <div
      style={{
        fontSize: size,
        fontWeight: 800,
        letterSpacing: "-0.05em",
        lineHeight: 1,
        color: "oklch(0.8 0.01 150)",
        textShadow: "0 -3px 2px oklch(0.2 0.01 165 / 0.45), 0 3px 1px oklch(1 0 0 / 0.95)",
      }}
    >
      Bevel
    </div>
  )
}

/** A shallow tray cut into the mat, the way the docs show components. */
function Tray({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        borderRadius: 34,
        background: "oklch(0.912 0.007 145)",
        boxShadow: "inset 0 2px 4px oklch(0.24 0.014 165 / 0.14), inset 0 0 0 1px oklch(0.24 0.014 165 / 0.06), 0 1px 0 oklch(1 0 0 / 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/** Scales its content up to fill a box, measured after mount. */
function Fit({ children, width, height, max = 2.4 }: { children: React.ReactNode; width: number; height: number; max?: number }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [scale, setScale] = React.useState(1)
  const [handle] = React.useState(() => delayRender("fit"))
  React.useLayoutEffect(() => {
    // Let fonts and layout settle, then measure the natural size once.
    const id = requestAnimationFrame(() => {
      const box = ref.current!.getBoundingClientRect()
      setScale(Math.min(max, width / Math.max(box.width, 1), height / Math.max(box.height, 1)))
      continueRender(handle)
    })
    return () => cancelAnimationFrame(id)
  }, [handle, width, height, max])
  return (
    <div style={{ width, height, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div ref={ref} style={{ transform: `scale(${scale})`, flexShrink: 0 }}>
        {children}
      </div>
    </div>
  )
}

function Footer({ command }: { command?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {command && (
        <div style={{ fontFamily: mono, fontSize: 17, whiteSpace: "nowrap", color: ink, background: "oklch(0.9 0.008 150)", padding: "10px 14px", borderRadius: 10, alignSelf: "flex-start" }}>
          {command}
        </div>
      )}
      <div style={{ fontSize: 22, color: muted }}>bevel-ui.vercel.app</div>
    </div>
  )
}

/* ---------------------------------------------------------------- */

export function OgComponent({ slug }: { slug: string }) {
  const c = components.find((x) => x.slug === slug)!
  const cat = categories.find((x) => x.slug === c.category)!
  const Preview = previews[slug]
  return (
    <Bench>
      <div style={{ position: "absolute", inset: 0, display: "flex", padding: 56, gap: 44 }}>
        <div style={{ width: 470, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <Wordmark size={44} />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 24, color: muted }}>{cat.name}</div>
            <div style={{ fontSize: c.name.length > 16 ? 58 : 68, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.02 }}>{c.name}</div>
            <div style={{ fontSize: 23, lineHeight: 1.4, color: muted, display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {c.description}
            </div>
          </div>
          <Footer command={`npx shadcn add @bevel/${slug}`} />
        </div>
        <Tray style={{ flex: 1 }}>
          {Preview ? (
            <Fit width={540} height={440}>
              <Preview />
            </Fit>
          ) : null}
        </Tray>
      </div>
    </Bench>
  )
}

const wall = ["guarded-switch", "annunciator", "split-flap", "engine-telegraph", "wallet", "mixer-strip"]

export function OgSite({ social = false }: { social?: boolean }) {
  return (
    <Bench>
      <div style={{ position: "absolute", inset: 0, display: "flex", padding: social ? 64 : 56, gap: 36 }}>
        <div style={{ width: 470, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <Wordmark size={118} />
          <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.12 }}>
            Tactile React components for real product work.
          </div>
          <div style={{ fontSize: 22, color: muted, lineHeight: 1.45 }}>
            Base UI and Tailwind CSS v4. Installs with the shadcn CLI. Open source, MIT.
          </div>
          <Footer command="npx shadcn add @bevel/annunciator" />
        </div>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {wall.map((slug) => {
            const Preview = previews[slug]
            return (
              <Tray key={slug} style={{ borderRadius: 24 }}>
                {Preview && (
                  <Fit width={social ? 290 : 270} height={social ? 160 : 150} max={1.4}>
                    <Preview />
                  </Fit>
                )}
              </Tray>
            )
          })}
        </div>
      </div>
    </Bench>
  )
}

export function OgDemo({ n }: { n: number }) {
  const site = demoSites.find((s) => s.n === n)!
  return (
    <Bench>
      <div style={{ position: "absolute", inset: 0, display: "flex", padding: 56, gap: 40 }}>
        <div style={{ width: 400, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <Wordmark size={44} />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 24, color: muted }}>Demo, {site.kind.toLowerCase().replace("ai ", "AI ")}</div>
            <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>{site.name}</div>
            <div style={{ fontSize: 22, lineHeight: 1.4, color: muted, display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {site.description}
            </div>
          </div>
          <Footer command={`npx shadcn add @bevel/${site.block}`} />
        </div>
        <div style={{ flex: 1, alignSelf: "center", borderRadius: 18, overflow: "hidden", background: "oklch(0.97 0.004 145)", boxShadow: "0 30px 60px -24px oklch(0.2 0.01 165 / 0.55), 0 0 0 1px oklch(0.2 0.01 165 / 0.12)" }}>
          <div style={{ height: 34, display: "flex", alignItems: "center", gap: 8, padding: "0 14px", borderBottom: "1px solid oklch(0.85 0.01 155)" }}>
            {["oklch(0.7 0.18 27)", "oklch(0.82 0.15 85)", "oklch(0.72 0.15 150)"].map((c) => (
              <span key={c} style={{ width: 11, height: 11, borderRadius: 99, background: c }} />
            ))}
            <span style={{ marginLeft: 12, fontFamily: mono, fontSize: 13, color: muted }}>bevel-ui.vercel.app/demo/{n}</span>
          </div>
          <Img src={staticFile(`demos/demo-${n}.jpg`)} style={{ display: "block", width: "100%", height: 400, objectFit: "cover", objectPosition: "top" }} />
        </div>
      </div>
    </Bench>
  )
}

/** A post: its title beside three of the objects it's about, each with its patent plate. */
export function OgPost({ slug }: { slug: string }) {
  const post = posts.find((p) => p.slug === slug)!
  const objects: readonly string[] = post.objects
  return (
    <Bench>
      <div style={{ position: "absolute", inset: 0, display: "flex", padding: 56, gap: 40 }}>
        <div style={{ width: 560, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <Wordmark size={44} />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 24, color: muted }}>Blog</div>
            <div style={{ fontSize: 58, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.04 }}>{post.title}</div>
          </div>
          <Footer />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          {objects.map((o) => {
            const Preview = previews[o]
            const origin = origins[o]
            return (
              <Tray key={o} style={{ flex: 1, borderRadius: 24, position: "relative", paddingTop: 34 }}>
                {Preview && (
                  <Fit width={420} height={98} max={2.6}>
                    <Preview />
                  </Fit>
                )}
                {origin && (
                  <span
                    className="bevel-metal"
                    style={{
                      position: "absolute",
                      left: 14,
                      top: 12,
                      padding: "4px 9px",
                      borderRadius: 6,
                      fontFamily: mono,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "oklch(0.32 0.05 70)",
                      boxShadow: "var(--bevel-depth-raised)",
                      ["--bevel-material" as string]: "var(--bevel-brass)",
                      ["--bevel-material-edge" as string]: "var(--bevel-brass-edge)",
                    }}
                  >
                    {origin.kind === "patent" ? origin.label.replace(/^([A-Z]{2}) /, "Pat. $1 ") : origin.relation}, {origin.year}
                  </span>
                )}
              </Tray>
            )
          })}
        </div>
      </div>
    </Bench>
  )
}
