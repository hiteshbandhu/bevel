// Exports one Bevel component as a single self-contained file for 21st.dev,
// whose publisher takes one component file and one demo, with no local imports
// or stylesheets. Bevel's own modules are inlined; npm packages stay imports;
// the CSS (foundation + the component's own) becomes a string injected once.
//
//   node scripts/export-21st.mts <slug> [outDir]     (outDir defaults to .21st/<slug>)
//
// Writes <outDir>/<slug>.tsx, <outDir>/<slug>.demo.tsx and a package.json the
// 21st CLI reads to check dependencies.
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import postcss, { type AtRule } from "postcss"
import { components, foundation } from "../apps/web/lib/catalog.ts"

const root = path.resolve(import.meta.dirname, "..")
const uiSrc = path.join(root, "packages/ui/src")
const slug = process.argv[2]
if (!slug) throw new Error("usage: node scripts/export-21st.mts <slug> [outDir]")
const outDir = path.resolve(process.argv[3] ?? path.join(root, ".21st", slug))

const component = components.find((c) => c.slug === slug)
if (!component) throw new Error(`no component "${slug}"`)

/* ---- Code: walk workspace imports, dependencies first ------------------ */

const workspaceImport = /^import\s[^"]*from\s+"@workspace\/ui\/(components|lib)\/([\w-]+)"\s*\n/gm
const order: string[] = []
const seen = new Set<string>()
async function visit(file: string) {
  if (seen.has(file)) return
  seen.add(file)
  const source = await readFile(path.join(uiSrc, file), "utf8")
  for (const [, dir, name] of source.matchAll(workspaceImport)) await visit(`${dir}/${name}${dir === "lib" ? ".ts" : ".tsx"}`)
  order.push(file)
}
const entry = component.files.find((f) => f.endsWith(".tsx"))!
await visit(entry)

// The demo may use other Bevel modules too (a keycard demo shows a payment
// card): those join the bundle and keep their exports, so the demo can import
// everything from the one file.
const demoSource = await readFile(path.join(root, "apps/web/components/demos", component.examples[0]!.file), "utf8")
const exported = new Set([entry])
for (const [, dir, name] of demoSource.matchAll(workspaceImport)) {
  const file = `${dir}/${name}${dir === "lib" ? ".ts" : ".tsx"}`
  await visit(file)
  exported.add(file)
}

const npmImports = new Set<string>()
const bodies: string[] = []
for (const file of order) {
  let source = await readFile(path.join(uiSrc, file), "utf8")
  source = source.replace(/^"use client"\s*\n/m, "").replace(workspaceImport, "")
  // npm imports (possibly multi-line) move to the top, deduplicated.
  source = source.replace(/^import\s[\s\S]*?from\s+"([^"]+)"\s*\n/gm, (line) => {
    npmImports.add(line.trim())
    return ""
  })
  if (!exported.has(file)) {
    // A dependency's exports become plain declarations inside the bundle.
    source = source.replace(/^export\s+(?:type\s+)?\{[^}]*\}\s*\n?/gm, "").replace(/^export\s+(?=(function|const|type|interface|class)\b)/gm, "")
  }
  bodies.push(`/* ---- ${file} ---- */\n${source.trim()}`)
}

/* ---- CSS: foundation + every inlined component's stylesheet ------------ */

const cssFiles = [foundation.file]
for (const file of order) {
  const owner = components.find((c) => c.files.includes(file))
  for (const f of owner?.files ?? []) if (f.endsWith(".css") && !cssFiles.includes(f)) cssFiles.push(f)
}
const code = bodies.join("\n\n")

// Tailwind @utility blocks become plain classes. Where the code uses one
// behind a variant (active:bevel-pressed), the variant becomes a selector.
const variantSelector: Record<string, (cls: string) => string> = {
  active: (c) => `${c}:active`,
  before: (c) => `${c}::before`,
  after: (c) => `${c}::after`,
  "aria-pressed": (c) => `${c}[aria-pressed="true"]`,
  "aria-checked": (c) => `${c}[aria-checked="true"]`,
  "aria-expanded": (c) => `${c}[aria-expanded="true"]`,
  hover: (c) => `@media (hover: hover) { ${c}:hover`,
  "focus-visible": (c) => `${c}:focus-visible`,
  disabled: (c) => `${c}:disabled`,
}
const esc = (s: string) => s.replace(/([:[\]=/.()])/g, "\\$1")
function variantRule(variant: string, utility: string): string | null {
  const cls = `.${esc(`${variant}:${utility}`)}`
  // in-data-[state=new]: styles the element when an ancestor matches.
  const inData = variant.match(/^in-data-\[([\w-]+)(?:=([\w-]+))?\]$/)
  if (inData) return `:where([data-${inData[1]}${inData[2] ? `="${inData[2]}"` : ""}]) ${cls}`
  const data = variant.match(/^data-\[([\w-]+)(?:=([\w-]+))?\]$/) ?? variant.match(/^data-([\w-]+)()$/)
  if (data) return `${cls}[data-${data[1]}${data[2] ? `="${data[2]}"` : ""}]`
  const v = variantSelector[variant]
  return v ? v(cls) : null
}

const cssParts: string[] = []
const unsupported = new Set<string>()
for (const file of cssFiles) {
  const tree = postcss.parse(await readFile(path.join(uiSrc, file), "utf8"))
  tree.walkComments((c) => void c.remove())
  tree.walkAtRules("utility", (rule: AtRule) => {
    const name = rule.params.trim()
    const body = rule.nodes?.map((n) => n.toString()).join(";\n") ?? ""
    const extra: string[] = []
    for (const [, variant] of code.matchAll(new RegExp(`([\\w-]+(?:\\[[^\\]]*\\])?):${name}\\b`, "g"))) {
      const sel = variantRule(variant!, name)
      if (!sel) {
        unsupported.add(`${variant}:${name}`)
        continue
      }
      extra.push(sel.startsWith("@media") ? `${sel} { ${body} } }` : `${sel} { ${body} }`)
    }
    rule.replaceWith(postcss.parse(`.${name} { ${body} }\n${extra.join("\n")}`))
  })
  tree.walkAtRules((rule) => {
    if (["custom-variant", "theme", "source", "plugin", "import"].includes(rule.name)) unsupported.add(`@${rule.name} ${rule.params}`)
  })
  cssParts.push(`/* ${file} */\n${tree.toString().trim()}`)
}
if (unsupported.size) {
  console.error(`Can't export "${slug}" as one file yet; these need Tailwind:\n  ${[...unsupported].join("\n  ")}`)
  process.exit(1)
}
const css = cssParts.join("\n\n")

/* ---- Write ------------------------------------------------------------- */

const header = `"use client"

/**
 * ${component.name}, from Bevel: skeuomorphic React components for shadcn.
 * ${component.description}
 *
 * This is a single-file build for 21st.dev. The source, docs and the shadcn
 * install (npx shadcn@latest add @bevel/${slug}) are at
 * https://bevel-ui.vercel.app/components/${slug}
 */
`
const styleInjection = `
/* Bevel's design tokens and this component's styles, added to the page once. */
const BEVEL_STYLE_ID = "bevel-${slug}"
const BEVEL_CSS = String.raw\`
${css.replaceAll("`", "\\`").replaceAll("${", "\\${")}
\`
if (typeof document !== "undefined" && !document.getElementById(BEVEL_STYLE_ID)) {
  const style = document.createElement("style")
  style.id = BEVEL_STYLE_ID
  style.textContent = BEVEL_CSS
  document.head.appendChild(style)
}
`
const file = `${header}\n${[...npmImports].join("\n")}\n${styleInjection}\n${code}\n`

// The demo: the catalog's first example, importing everything from the bundle.
const demo = demoSource.replace(/"@workspace\/ui\/(components|lib)\/[\w-]+"/g, `"./${slug}"`)
// 21st's preview imports each demo as: import Demo from "./demos/<slug>"
const demoName = demo.match(/export function (\w+)/)?.[1]
if (!demoName) throw new Error(`the ${slug} demo has no exported function`)
const demoFile = `${demo.trimEnd()}\n\nexport default ${demoName}\n`

const pkg = JSON.parse(await readFile(path.join(root, "packages/ui/package.json"), "utf8"))
const deps: Record<string, string> = {}
for (const line of [...npmImports, ...demo.split("\n")]) {
  const m = line.match(/from\s+"((?:@[^/"]+\/)?[^/"]+)/)
  if (m && m[1] !== "react" && pkg.dependencies?.[m[1]!]) deps[m[1]!] = pkg.dependencies[m[1]!]
}

await mkdir(outDir, { recursive: true })
await writeFile(path.join(outDir, `${slug}.tsx`), file)
await writeFile(path.join(outDir, `${slug}.demo.tsx`), demoFile)
await writeFile(
  path.join(outDir, "package.json"),
  JSON.stringify({ name: `bevel-${slug}`, private: true, dependencies: { react: "^19.0.0", "react-dom": "^19.0.0", ...deps } }, null, 2) + "\n"
)
console.log(`${path.relative(root, outDir)}: ${slug}.tsx (${order.length} modules, ${cssFiles.length} stylesheets), ${slug}.demo.tsx`)
