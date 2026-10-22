import * as React from "react"
import { AbsoluteFill, Img, continueRender, delayRender, staticFile } from "remotion"
import { categories, components } from "../../../web/lib/catalog"
import { demoSites } from "../../../web/lib/demos"
import { posts } from "../../../web/lib/blog"
import { origins } from "../../../web/lib/origins"
import { previews } from "../../../web/components/previews"
import { mono, sans } from "../fonts"
import { Mark } from "./Logo"
import { ogPages } from "./pages"
import "../style.css"

/**
 * Link-preview images (Open Graph, 1200×630) and the GitHub social preview
 * (1280×640), rendered from the real components. Static files, made once by
 * scripts/og.mts, not at request time.
 *
 * A dark graphite bench under one light from the top, so the object reads
 * as an object and the card holds its own in a dark feed. The components
 * render in their dark palettes (the bench carries the `dark` class).
 */

const ink = "oklch(0.96 0.006 90)"
const muted = "oklch(0.72 0.012 260)"
const faint = "oklch(0.56 0.012 260)"
const amber = "oklch(0.82 0.15 75)"

/** The bench: graphite, lit from above, with a pool of light where the object sits. */
function Bench({ children, light = "70% 46%" }: { children: React.ReactNode; light?: string }) {
  return (
    <AbsoluteFill
      className="dark"
      style={{
        background: [
          `radial-gradient(ellipse 38% 46% at ${light}, oklch(1 0 0 / 0.09), transparent 70%)`,
          "linear-gradient(to bottom, oklch(0.2 0.008 260), oklch(0.13 0.006 260))",
        ].join(", "),
        fontFamily: sans,
        color: ink,
        ["--font-sans" as string]: sans,
        ["--font-mono" as string]: mono,
      }}
    >
      {/* The bench's front edge catches the light. */}
      <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.08), inset 0 -80px 120px -60px oklch(0 0 0 / 0.5)" }} />
      {children}
    </AbsoluteFill>
  )
}

/** The lamp mark and the wordmark. */
function Brand({ size = 34 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.32 }}>
      <Mark variant="lamp" size={size * 1.15} />
      <span style={{ fontSize: size, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>Bevel</span>
    </div>
  )
}

/** A small label above the title: the collection, "Docs", "Blog". */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 19, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: amber }}>
      <span style={{ width: 9, height: 9, borderRadius: 99, background: amber, boxShadow: `0 0 12px ${amber}` }} />
      {children}
    </div>
  )
}

function Title({ children, size }: { children: React.ReactNode; size: number }) {
  return <div style={{ fontSize: size, fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 1.02, textWrap: "balance" }}>{children}</div>
}

function Lead({ children, lines = 3, size = 24 }: { children: React.ReactNode; lines?: number; size?: number }) {
  return (
    <div style={{ fontSize: size, lineHeight: 1.4, color: muted, display: "-webkit-box", WebkitLineClamp: lines, WebkitBoxOrient: "vertical", overflow: "hidden", textWrap: "pretty" }}>
      {children}
    </div>
  )
}

/** The install command in a slot cut into the bench. */
function Command({ children }: { children: string }) {
  return (
    <div
      style={{
        alignSelf: "flex-start",
        display: "flex",
        gap: 12,
        fontFamily: mono,
        fontSize: 18,
        whiteSpace: "nowrap",
        padding: "12px 16px",
        borderRadius: 12,
        background: "oklch(0.1 0.005 260)",
        boxShadow: "inset 0 2px 5px oklch(0 0 0 / 0.6), inset 0 0 0 1px oklch(0 0 0 / 0.5), 0 1px 0 oklch(1 0 0 / 0.07)",
      }}
    >
      <span style={{ color: faint }}>$</span>
      <span style={{ color: ink }}>{children}</span>
    </div>
  )
}

/** The brass plate a machine carried its patent number on. */
function Plate({ slug, size = 15 }: { slug: string; size?: number }) {
  const origin = origins[slug]
  if (!origin) return null
  return (
    <span
      className="bevel-metal"
      style={{
        alignSelf: "flex-start",
        padding: `${size * 0.4}px ${size * 0.75}px`,
        borderRadius: 7,
        fontFamily: mono,
        fontSize: size,
        fontWeight: 600,
        letterSpacing: "0.03em",
        color: "oklch(0.3 0.05 70)",
        textShadow: "0 1px 0 oklch(1 0 0 / 0.35)",
        boxShadow: "var(--bevel-depth-raised)",
        ["--bevel-material" as string]: "var(--bevel-brass)",
        ["--bevel-material-edge" as string]: "var(--bevel-brass-edge)",
      }}
    >
      {origin.kind === "patent" ? origin.label.replace(/^([A-Z]{2}) /, "Pat. $1 ") : origin.relation}, {origin.year}
    </span>
  )
}

/** Scales its content to fill a box, measured after mount. */
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

/**
 * Previews whose measured box is far larger than what shows (the number wheel
 * measures its whole digit strips), so Fit can't size them; these scale as given.
 */
const fixedScale: Record<string, number> = { "number-wheel": 6 }

/** An object set down on the bench: fitted, with its contact shadow beneath. */
function Placed({ slug, width, height, max }: { slug: string; width: number; height: number; max?: number }) {
  const Preview = previews[slug]
  if (!Preview) return null
  const fixed = fixedScale[slug]
  return (
    <div style={{ position: "relative", width, height, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", left: "12%", right: "12%", bottom: "4%", height: "16%", borderRadius: "50%", background: "radial-gradient(closest-side, oklch(0 0 0 / 0.55), transparent)", filter: "blur(6px)" }} />
      <div style={{ position: "relative", filter: "drop-shadow(0 18px 24px oklch(0 0 0 / 0.45))" }}>
        {fixed ? (
          <div style={{ width, height, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ transform: `scale(${fixed})` }}>
              <Preview />
            </div>
          </div>
        ) : (
          <Fit width={width} height={height} max={max}>
            <Preview />
          </Fit>
        )}
      </div>
    </div>
  )
}

/** A shallow cell cut into the bench, for pages that show several objects. */
function Cell({ slug, width, height, plate, max = 2.2 }: { slug: string; width: number; height: number; plate?: boolean; max?: number }) {
  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: 22,
        background: "oklch(0.15 0.006 260)",
        boxShadow: "inset 0 2px 6px oklch(0 0 0 / 0.55), inset 0 0 0 1px oklch(0 0 0 / 0.4), 0 1px 0 oklch(1 0 0 / 0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <Fit width={width - 48} height={height - (plate && origins[slug] ? 70 : 44)} max={max}>
        {React.createElement(previews[slug] ?? (() => null))}
      </Fit>
      {plate && (
        <div style={{ position: "absolute", left: 14, top: 12, display: "flex" }}>
          <Plate slug={slug} size={13} />
        </div>
      )}
    </div>
  )
}

/** The left column every card shares: brand on top, the words, the foot. */
function Column({ width, children, foot }: { width: number; children: React.ReactNode; foot?: React.ReactNode }) {
  return (
    <div style={{ width, flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <Brand />
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>{children}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 50, justifyContent: "flex-end" }}>{foot}</div>
    </div>
  )
}

/** One short line: the first sentence, or, when that runs long, its clause before a colon or semicolon. */
function summary(text: string) {
  const sentence = text.split(/(?<=[.!?])\s/)[0]!
  if (sentence.length <= 90) return sentence
  const clause = sentence.split(/[:;]\s/)[0]!
  return clause.length < sentence.length ? `${clause}.` : sentence
}

/* ---------------------------------------------------------------- */

export function OgComponent({ slug }: { slug: string }) {
  const c = components.find((x) => x.slug === slug)!
  const parent = c.parent ? components.find((x) => x.slug === c.parent) : undefined
  const cat = categories.find((x) => x.slug === c.category)!
  return (
    <Bench light="72% 52%">
      <div style={{ position: "absolute", inset: 0, display: "flex", padding: 56, gap: 32 }}>
        <Column
          width={500}
          foot={
            <>
              <Plate slug={slug} />
              <Command>{`npx shadcn@latest add @bevel/${slug}`}</Command>
            </>
          }
        >
          <Eyebrow>{parent ? `${cat.name} · ${parent.name}` : cat.name}</Eyebrow>
          <Title size={c.name.length > 11 ? 64 : 80}>{c.name}</Title>
          <Lead lines={origins[slug] ? 2 : 3}>{summary(c.description)}</Lead>
        </Column>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Placed slug={slug} width={560} height={440} max={4} />
        </div>
      </div>
    </Bench>
  )
}

const wall = ["guarded-switch", "annunciator", "split-flap", "meter", "wallet", "key"]

export function OgSite({ social = false }: { social?: boolean }) {
  const cell = social ? { w: 300, h: 168 } : { w: 280, h: 160 }
  return (
    <Bench light="74% 50%">
      <div style={{ position: "absolute", inset: 0, display: "flex", padding: social ? 64 : 56, gap: 40 }}>
        <Column width={470} foot={<Command>npx shadcn@latest add @bevel/meter</Command>}>
          <Title size={58}>Interface parts with weight, edges and light.</Title>
          <Lead size={23}>{`${components.length} real objects as React components for shadcn. Base UI, Tailwind v4, MIT.`}</Lead>
        </Column>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignContent: "center" }}>
          {wall.map((slug) => (
            <Cell key={slug} slug={slug} width={cell.w} height={cell.h} max={1.6} />
          ))}
        </div>
      </div>
    </Bench>
  )
}

/** A page with a few objects: guides and index pages. */
export function OgPage({ id }: { id: string }) {
  const page = ogPages.find((p) => p.id === id)!
  const objects = page.objects.filter((o) => previews[o]).slice(0, 4)
  return (
    <Bench light="74% 50%">
      <div style={{ position: "absolute", inset: 0, display: "flex", padding: 56, gap: 40 }}>
        <Column width={480} foot={page.id === "components" ? <Command>npx shadcn@latest add @bevel/meter</Command> : undefined}>
          <Eyebrow>{page.eyebrow}</Eyebrow>
          <Title size={page.title.length > 22 ? 60 : 74}>{page.title}</Title>
          <Lead>{page.description}</Lead>
        </Column>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignContent: "center" }}>
          {objects.map((slug) => (
            <Cell key={slug} slug={slug} width={276} height={240} max={3} />
          ))}
        </div>
      </div>
    </Bench>
  )
}

export function OgDemo({ n }: { n: number }) {
  const site = demoSites.find((s) => s.n === n)!
  return (
    <Bench light="72% 50%">
      <div style={{ position: "absolute", inset: 0, display: "flex", padding: 56, gap: 40 }}>
        <Column width={400} foot={<Command>{`npx shadcn@latest add @bevel/${site.block}`}</Command>}>
          <Eyebrow>{`Demo · ${site.kind.replace("AI ", "AI ")}`}</Eyebrow>
          <Title size={76}>{site.name}</Title>
          <Lead>{summary(site.description)}</Lead>
        </Column>
        <div
          style={{
            flex: 1,
            alignSelf: "center",
            borderRadius: 16,
            overflow: "hidden",
            background: "oklch(0.97 0.004 145)",
            boxShadow: "0 40px 70px -24px oklch(0 0 0 / 0.8), 0 0 0 1px oklch(1 0 0 / 0.1)",
          }}
        >
          <div style={{ height: 36, display: "flex", alignItems: "center", gap: 8, padding: "0 14px", background: "oklch(0.22 0.008 260)" }}>
            {["oklch(0.7 0.18 27)", "oklch(0.82 0.15 85)", "oklch(0.72 0.15 150)"].map((c) => (
              <span key={c} style={{ width: 11, height: 11, borderRadius: 99, background: c }} />
            ))}
            <span style={{ marginLeft: 12, fontFamily: mono, fontSize: 13, color: muted }}>/demo/{n}</span>
          </div>
          <Img src={staticFile(`demos/demo-${n}.jpg`)} style={{ display: "block", width: "100%", height: 420, objectFit: "cover", objectPosition: "top" }} />
        </div>
      </div>
    </Bench>
  )
}

/** A post: its title beside the objects it's about, each with its patent plate. */
export function OgPost({ slug }: { slug: string }) {
  const post = posts.find((p) => p.slug === slug)!
  const objects: readonly string[] = post.objects
  return (
    <Bench light="74% 50%">
      <div style={{ position: "absolute", inset: 0, display: "flex", padding: 56, gap: 40 }}>
        <Column width={560}>
          <Eyebrow>Blog</Eyebrow>
          <Title size={post.title.length > 40 ? 54 : 62}>{post.title}</Title>
        </Column>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, justifyContent: "center" }}>
          {objects.slice(0, 3).map((o) => (
            <Cell key={o} slug={o} width={472} height={160} plate max={3} />
          ))}
        </div>
      </div>
    </Bench>
  )
}
