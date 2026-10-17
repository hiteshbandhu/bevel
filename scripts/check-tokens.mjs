#!/usr/bin/env node
// Fails when a Bevel component or component stylesheet uses a raw value
// instead of a design-system token. Raw values belong in bevel.css, or in a
// component stylesheet's custom-property declarations (its palette).
import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "../packages/ui/src")
// Stock shadcn primitives, not Bevel components.
const skip = new Set(["components/button.tsx", "styles/globals.css", "styles/bevel.css"])

const tsxRules = [
  [/#[0-9a-fA-F]{3,8}\b/, "hex colour"],
  [/\b(rgba?|hsla?|oklch|lab)\(/, "raw colour"],
  [/cubic-bezier|\b\d+ms\b/, "raw easing or duration (use --bevel-ease-* / --bevel-duration-*)"],
  // Arbitrary Tailwind values that start with a number, except proportions (%, aspect ratios).
  [/(?<!aspect|grid-cols|grid-rows)-\[-?\d[^\]%]*\]/, "arbitrary value (add a token)"],
]
const cssRules = [
  [/#[0-9a-fA-F]{3,8}\b/, "hex colour"],
  [/\b(rgba?|hsla?|oklch|lab)\(/, "raw colour outside a custom property"],
  [/cubic-bezier|\b\d+ms\b/, "raw easing or duration"],
]

const problems = []
for (const dir of ["components", "styles"]) {
  for (const file of readdirSync(path.join(root, dir))) {
    const rel = `${dir}/${file}`
    if (skip.has(rel)) continue
    const isCss = file.endsWith(".css")
    if (!isCss && !file.endsWith(".tsx")) continue
    const rules = isCss ? cssRules : tsxRules
    readFileSync(path.join(root, rel), "utf8")
      .split("\n")
      .forEach((line, i) => {
        const trimmed = line.trim()
        if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) return
        if (isCss && /^--[\w-]+:/.test(trimmed)) return // palette declarations
        for (const [pattern, what] of rules) {
          if (pattern.test(line)) problems.push(`${rel}:${i + 1}  ${what}\n    ${trimmed}`)
        }
      })
  }
}

if (problems.length) {
  console.error(`Raw values found; use tokens from styles/bevel.css:\n\n${problems.join("\n")}`)
  process.exit(1)
}
console.log("check-tokens: every component reads from the design system.")
