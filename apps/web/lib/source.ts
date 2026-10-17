import { readFile } from "node:fs/promises"
import path from "node:path"
import { codeToHtml } from "shiki"

// Server-only helpers: read real source files at build time so the code on
// the site is always the code that runs.

const demosDir = path.join(process.cwd(), "components/demos")
const uiSrcDir = path.join(process.cwd(), "../../packages/ui/src")

export function readDemo(file: string) {
  return readFile(path.join(demosDir, file), "utf8")
}

export function readLibraryFile(file: string) {
  return readFile(path.join(uiSrcDir, file), "utf8")
}

export function highlight(code: string, lang: "tsx" | "css" | "bash" = "tsx") {
  return codeToHtml(code.trimEnd(), {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  })
}
