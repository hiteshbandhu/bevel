import { readFile } from "node:fs/promises"
import path from "node:path"

/** A colour as the playground edits it: oklch lightness, chroma, hue. */
export type Colour = { l: number; c: number; h: number }

/** The inputs a material theme sets (see packages/ui/src/styles/themes.css). */
export type ThemeInputs = {
  panel: Colour
  hardware: Colour
  face: Colour
  highlight: number
  shade: number
  cast: number
  radius: number
  speed: number
}

export type ThemePreset = { name: string; label: string; description: string; inputs: ThemeInputs }

/** bevel.css with no theme: graphite instruments and brass fittings. */
const graphite: ThemeInputs = {
  panel: { l: 0.3, c: 0.01, h: 260 },
  hardware: { l: 0.76, c: 0.11, h: 82 },
  face: { l: 0.95, c: 0.025, h: 90 },
  highlight: 0.22,
  shade: 0.32,
  cast: 0.22,
  radius: 1,
  speed: 1,
}

const descriptions: Record<string, string> = {
  default: "Graphite instruments with brass fittings. What bevel.css ships with.",
  brass: "A ship's instrument. Bronze housings, polished brass, warm lamplight.",
  bakelite: "Moulded and glossy. Oxblood resin, nickel fittings, round edges.",
  anodized: "Machined aluminium, dyed blue. Crisp edges, cool light, quick.",
}

const oklch = /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+))?\s*\)/

/** The presets, read from themes.css so the playground and the stylesheet can't drift. */
export async function readThemePresets(): Promise<ThemePreset[]> {
  const css = await readFile(path.join(process.cwd(), "../../packages/ui/src/styles/themes.css"), "utf8")
  const presets: ThemePreset[] = [
    { name: "default", label: "Default", description: descriptions.default!, inputs: graphite },
  ]
  for (const [, name, body] of css.matchAll(/\[data-bevel-theme="(\w+)"\]\s*\{([^}]*)\}/g)) {
    const decl = (prop: string) => body!.match(new RegExp(`--${prop}:\\s*([^;]+);`))?.[1] ?? ""
    const colour = (prop: string): Colour => {
      const m = decl(prop).match(oklch)!
      return { l: Number(m[1]), c: Number(m[2]), h: Number(m[3]) }
    }
    const alpha = (prop: string) => Number(decl(prop).match(oklch)?.[4] ?? 0)
    presets.push({
      name: name!,
      label: name![0]!.toUpperCase() + name!.slice(1),
      description: descriptions[name!] ?? "",
      inputs: {
        panel: colour("bevel-theme-panel"),
        hardware: colour("bevel-theme-hardware"),
        face: colour("bevel-theme-face"),
        highlight: alpha("bevel-highlight"),
        shade: alpha("bevel-shade"),
        cast: alpha("bevel-cast"),
        radius: Number(decl("bevel-radius-scale")),
        speed: Number(decl("bevel-speed")),
      },
    })
  }
  return presets
}
