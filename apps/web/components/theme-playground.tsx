"use client"

import * as React from "react"
import { Check, Copy, RotateCcw } from "lucide-react"
import { DetentKnob, DetentKnobStop } from "@workspace/ui/components/detent-knob"
import { track } from "@/lib/analytics"
import type { Colour, ThemeInputs, ThemePreset } from "@/lib/themes"

const round = (n: number, places = 3) => Number(n.toFixed(places))
const colour = ({ l, c, h }: Colour, alpha?: number) =>
  `oklch(${round(l)} ${round(c)} ${round(h, 1)}${alpha === undefined ? "" : ` / ${round(alpha, 2)}`})`

/** The CSS for a theme: the inputs themes.css reads, and the same again dimmed for the dark. */
function themeCss(selector: string, t: ThemeInputs) {
  const hue = t.panel.h
  return `${selector} {
  --bevel-theme-panel: ${colour(t.panel)};
  --bevel-theme-hardware: ${colour(t.hardware)};
  --bevel-theme-face: ${colour(t.face)};
  --bevel-highlight: ${colour({ l: 1, c: 0, h: 0 }, t.highlight)};
  --bevel-shade: ${colour({ l: 0.1, c: 0.03, h: hue }, t.shade)};
  --bevel-cast: ${colour({ l: 0.27, c: 0.05, h: hue }, t.cast)};
  --bevel-radius-scale: ${round(t.radius, 2)};
  --bevel-speed: ${round(t.speed, 2)};
}
.dark ${selector} {
  --bevel-highlight: ${colour({ l: 1, c: 0, h: 0 }, t.highlight * 0.65)};
  --bevel-cast: oklch(0 0 0 / 0.55);
}`
}

/* The URL hash carries the whole theme, so a link reproduces it. */
const encode = (base: string, t: ThemeInputs) =>
  new URLSearchParams({
    base,
    panel: [t.panel.l, t.panel.c, t.panel.h].map((n) => round(n)).join(","),
    hardware: [t.hardware.l, t.hardware.c, t.hardware.h].map((n) => round(n)).join(","),
    face: [t.face.l, t.face.c, t.face.h].map((n) => round(n)).join(","),
    light: [t.highlight, t.shade, t.cast].map((n) => round(n, 2)).join(","),
    radius: String(round(t.radius, 2)),
    speed: String(round(t.speed, 2)),
  }).toString()

function decode(hash: string): { base: string; inputs: ThemeInputs } | null {
  const q = new URLSearchParams(hash.replace(/^#/, ""))
  const nums = (key: string, n: number) => {
    const v = (q.get(key) ?? "").split(",").map(Number)
    return v.length === n && v.every(Number.isFinite) ? v : null
  }
  const [panel, hardware, face, light] = [nums("panel", 3), nums("hardware", 3), nums("face", 3), nums("light", 3)]
  const radius = Number(q.get("radius"))
  const speed = Number(q.get("speed"))
  if (!panel || !hardware || !face || !light || !radius || !speed) return null
  const c = ([l, c, h]: number[]) => ({ l: l!, c: c!, h: h! })
  return {
    base: q.get("base") ?? "default",
    inputs: { panel: c(panel), hardware: c(hardware), face: c(face), highlight: light[0]!, shade: light[1]!, cast: light[2]!, radius, speed },
  }
}

type Range = { label: string; min: number; max: number; step: number; format?: (n: number) => string }
const lightness: Range = { label: "Lightness", min: 0.1, max: 0.98, step: 0.01 }
const chroma: Range = { label: "Chroma", min: 0, max: 0.2, step: 0.005 }
const hue: Range = { label: "Hue", min: 0, max: 360, step: 1, format: (n) => `${Math.round(n)}°` }

function Slider({
  range,
  value,
  onChange,
}: {
  range: Range
  value: number
  onChange: (value: number) => void
}) {
  const id = React.useId()
  return (
    <div className="grid grid-cols-[5.5rem_minmax(0,1fr)_3rem] items-center gap-3 text-sm">
      <label htmlFor={id} className="text-muted-foreground">
        {range.label}
      </label>
      <input
        id={id}
        type="range"
        min={range.min}
        max={range.max}
        step={range.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-foreground"
      />
      <output htmlFor={id} className="text-right font-mono text-xs tabular-nums">
        {range.format ? range.format(value) : round(value, 2)}
      </output>
    </div>
  )
}

function ColourField({ legend, value, onChange }: { legend: string; value: Colour; onChange: (c: Colour) => void }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 flex items-center gap-2 text-sm font-medium">
        <span aria-hidden className="size-4 rounded-full border shadow-sm" style={{ background: colour(value) }} />
        {legend}
      </legend>
      <Slider range={lightness} value={value.l} onChange={(l) => onChange({ ...value, l })} />
      <Slider range={chroma} value={value.c} onChange={(c) => onChange({ ...value, c })} />
      <Slider range={hue} value={value.h} onChange={(h) => onChange({ ...value, h })} />
    </fieldset>
  )
}

/**
 * Pick a material, then tune it: the stage re-renders with every change,
 * the hash keeps it, and Copy CSS gives a block to paste.
 */
export function ThemePlayground({ presets, children }: { presets: ThemePreset[]; children: React.ReactNode }) {
  const [base, setBase] = React.useState("brass")
  const [inputs, setInputs] = React.useState(() => presets.find((p) => p.name === "brass")!.inputs)
  const [copied, setCopied] = React.useState(false)
  const preset = presets.find((p) => p.name === base) ?? presets[0]!
  const edited = encode(base, inputs) !== encode(base, preset.inputs)

  // Read a shared theme from the hash once, then keep the hash in step.
  const loaded = React.useRef(false)
  React.useEffect(() => {
    if (!loaded.current) {
      loaded.current = true
      const shared = decode(window.location.hash)
      if (shared) {
        setBase(shared.base)
        setInputs(shared.inputs)
        return
      }
    }
    window.history.replaceState(null, "", `#${encode(base, inputs)}`)
  }, [base, inputs])

  React.useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [copied])

  const set = <K extends keyof ThemeInputs>(key: K) => (value: ThemeInputs[K]) => setInputs((t) => ({ ...t, [key]: value }))
  const name = edited ? "custom" : preset.name
  const css = `/* After: npx shadcn@latest add @bevel/themes */\n${themeCss(`[data-bevel-theme="${name}"]`, inputs)}`

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <style>{themeCss('[data-bevel-theme="playground"]', inputs)}</style>
      <div data-bevel-theme="playground" className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
        {children}
      </div>

      <div className="flex flex-col gap-6 rounded-xl border bg-card p-5 lg:sticky lg:top-6">
        {/* The knob is made of the material it picks. */}
        <div data-bevel-theme="playground" className="flex justify-center">
          <DetentKnob
            aria-label="Material"
            value={base}
            onValueChange={(value) => {
              setBase(value)
              setInputs(presets.find((p) => p.name === value)!.inputs)
            }}
          >
            {presets.map((p) => (
              <DetentKnobStop key={p.name} value={p.name}>
                {p.label}
              </DetentKnobStop>
            ))}
          </DetentKnob>
        </div>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          <span className="font-medium text-foreground">
            {preset.label}
            {edited ? ", edited" : ""}.
          </span>{" "}
          {preset.description}
        </p>

        <ColourField legend="Panel" value={inputs.panel} onChange={set("panel")} />
        <ColourField legend="Hardware" value={inputs.hardware} onChange={set("hardware")} />
        <ColourField legend="Face" value={inputs.face} onChange={set("face")} />

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium">Light and shape</legend>
          <Slider range={{ label: "Highlight", min: 0, max: 0.6, step: 0.01 }} value={inputs.highlight} onChange={set("highlight")} />
          <Slider range={{ label: "Shade", min: 0, max: 0.7, step: 0.01 }} value={inputs.shade} onChange={set("shade")} />
          <Slider range={{ label: "Shadow", min: 0, max: 0.6, step: 0.01 }} value={inputs.cast} onChange={set("cast")} />
          <Slider
            range={{ label: "Radius", min: 0, max: 2.5, step: 0.05, format: (n) => `${round(n, 2)}×` }}
            value={inputs.radius}
            onChange={set("radius")}
          />
          <Slider
            range={{ label: "Speed", min: 0.4, max: 2, step: 0.05, format: (n) => `${round(n, 2)}×` }}
            value={inputs.speed}
            onChange={set("speed")}
          />
        </fieldset>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">CSS</span>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={!edited}
                onClick={() => setInputs(preset.inputs)}
                className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
              >
                <RotateCcw className="size-3.5" aria-hidden />
                Reset
              </button>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(css)
                  track("select_content", { content_type: "theme_css", item_id: name })
                  setCopied(true)
                }}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
                {copied ? "Copied" : "Copy CSS"}
              </button>
            </div>
          </div>
          <pre className="max-h-56 overflow-auto rounded-lg bg-muted p-3 font-mono text-xs leading-relaxed">{css}</pre>
          <p className="text-xs text-muted-foreground">
            Then put <code className="font-mono">data-bevel-theme=&quot;{name}&quot;</code> on{" "}
            <code className="font-mono">&lt;html&gt;</code> or any container. The link in the address bar
            reproduces this theme.
          </p>
        </div>
      </div>
    </div>
  )
}
