import { readFile } from "node:fs/promises"
import path from "node:path"

export type Token = { name: string; value: string; note?: string }
export type TokenGroup = { title: string; tokens: Token[] }

const foundation = path.join(process.cwd(), "../../packages/ui/src/styles/bevel.css")

/**
 * The foundation's light-mode tokens, grouped the way bevel.css groups them:
 * a comment line opens a group, a blank line closes it.
 */
export async function readFoundationTokens(): Promise<TokenGroup[]> {
  const css = await readFile(foundation, "utf8")
  const root = css.slice(css.indexOf(":root {") + 7, css.indexOf("\n}\n", css.indexOf(":root {")))
  const groups: TokenGroup[] = []
  let current: TokenGroup | undefined
  let pending = ""
  for (const raw of root.split("\n")) {
    const line = raw.trim()
    if (!line) {
      current = undefined
      pending = ""
      continue
    }
    const comment = line.match(/^\/\*\s*(.*?)\s*\*\/$/)
    if (comment) {
      if (!current) {
        current = { title: comment[1]!.replace(/^\d+\.\s*/, "").replace(/[.;:].*$/, ""), tokens: [] }
        groups.push(current)
      } else pending = comment[1]!
      continue
    }
    const decl = line.match(/^(--[\w-]+):\s*(.*?);?\s*(?:\/\*\s*(.*?)\s*\*\/)?$/)
    if (decl) {
      if (!current) {
        current = { title: "Other", tokens: [] }
        groups.push(current)
      }
      const value = decl[2]!.startsWith("url(") ? "SVG texture" : decl[2]!.replace(/;$/, "") || "(several shadows)"
      current.tokens.push({ name: decl[1]!, value, note: decl[3] ?? (pending || undefined) })
      pending = ""
    }
  }
  return groups.filter((g) => g.tokens.length)
}
