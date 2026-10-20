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

/** Workspace imports in the "@/" form a user's project uses, the same rewrite the registry build applies. */
export function toProjectImports(source: string) {
  return source
    .replaceAll("@workspace/ui/components/", "@/components/ui/")
    .replaceAll("@workspace/ui/lib/", "@/lib/")
}

/** A demo as a user's project sees it. */
export async function readProjectDemo(file: string) {
  return toProjectImports(await readDemo(file))
}

/** A library file as a user's project sees it. */
export async function readLibraryFile(file: string) {
  return toProjectImports(await readFile(path.join(uiSrcDir, file), "utf8"))
}

export function highlight(code: string, lang: "tsx" | "css" | "bash" | "json" | "markdown" = "tsx") {
  return codeToHtml(code.trimEnd(), {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  })
}
