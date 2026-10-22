// Publishes exported components (scripts/export-21st.mts) to 21st.dev and
// submits each to the catalog. Needs `21st login`. Skips anything already
// published; reuses a component's draft if one was prepared earlier.
//   node scripts/publish-21st.mts <slug>...
import { execFile } from "node:child_process"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { promisify } from "node:util"
import { categories, components } from "../apps/web/lib/catalog.ts"

const run = promisify(execFile)
const root = path.resolve(import.meta.dirname, "..")
const cli = ["-y", "@21st-dev/cli@1.18.0"]

// 21st descriptions read best as one or two sentences.
const short = (text: string, max = 220) => {
  if (text.length <= max) return text
  let out = ""
  for (const s of text.split(/(?<=[.!?])\s+/)) {
    if ((out ? `${out} ${s}` : s).length > max) break
    out = out ? `${out} ${s}` : s
  }
  return out || `${text.slice(0, text.lastIndexOf(" ", max - 1))}…`
}

for (const slug of process.argv.slice(2)) {
  const dir = path.join(root, ".21st", slug)
  const c = components.find((x) => x.slug === slug)
  if (!c) throw new Error(`no component "${slug}"`)
  const state = path.join(dir, "published.json")
  if (existsSync(state)) {
    console.log(`skip ${slug}: already published`)
    continue
  }
  if (!existsSync(path.join(dir, "preview/default.png"))) {
    console.log(`skip ${slug}: no passing render yet`)
    continue
  }
  const prepared = existsSync(path.join(dir, "publish.json")) ? readFileSync(path.join(dir, "publish.json"), "utf8").match(/"draft_id":"([^"]+)"/)?.[1] : undefined
  const category = categories.find((k) => k.slug === c.category)?.name.toLowerCase() ?? c.category
  const description = `${short(c.description)} Skeuomorphic, accessible, Base UI. Part of Bevel: bevel-ui.vercel.app`
  const args = [
    ...cli, "publish", `./${slug}.tsx`, "--demo", `./${slug}.demo.tsx`, "--preview", "./preview/default.png",
    "--to", "bevel", "--name", c.name, "--slug", slug,
    "--tags", ["skeuomorphic", category, "shadcn", "base-ui", "tactile"].join(","),
    "--description", description, "--visibility", "published", "--auto", "--no-open", "--json",
    ...(prepared ? ["--draft", `draft:${prepared}`] : []),
  ]
  try {
    const { stdout } = await run("npx", args, { cwd: dir, maxBuffer: 1 << 24 })
    const result = JSON.parse(stdout.trim().split("\n").pop()!)
    if (result.state !== "published") throw new Error(stdout.slice(-400))
    writeFileSync(state, JSON.stringify(result, null, 2))
    const submit = await run("npx", [...cli, "submit", slug], { cwd: dir })
    console.log(`ok   ${slug}: ${result.url} (${submit.stdout.trim()})`)
  } catch (e) {
    const err = e as { code?: number; stdout?: string; stderr?: string; message: string }
    if (err.code === 4) {
      console.log(`stop at ${slug}: 21st's hourly draft limit; run again later`)
      process.exit(4)
    }
    console.log(`FAIL ${slug}: ${(err.stdout || err.stderr || err.message).slice(-300).replace(/\s+/g, " ")}`)
  }
}
