// Generates the shadcn registry from the docs catalog, so the two can't drift.
//
//   registry.json          source registry (root, so item paths need no "..")
//   registry/bevel/...     component sources with imports in "@/" form, which
//                          the shadcn CLI rewrites to each project's aliases
//
// Then `shadcn build` turns it into apps/web/public/r/<name>.json.
// Stylesheets ship in each item's `css` field and merge into the user's
// global CSS on install; the foundation (bevel.css) is its own item that
// every component depends on.

import { mkdir, readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import postcss, { type ChildNode, type Container } from "postcss"
import { components, foundation } from "../apps/web/lib/catalog.ts"

const root = path.resolve(import.meta.dirname, "..")
const uiSrc = path.join(root, "packages/ui/src")
const outDir = path.join(root, "registry/bevel")
const namespace = "@bevel"

type CssObject = { [key: string]: string | CssObject }

/** postcss tree -> the nested object shape the shadcn `css` field takes. */
function toCssObject(container: Container): CssObject {
  const out: CssObject = {}
  container.each((node: ChildNode) => {
    if (node.type === "comment") return
    if (node.type === "decl") {
      out[node.prop] = clean(node.value) + (node.important ? " !important" : "")
    } else if (node.type === "rule") {
      const key = clean(node.selector)
      out[key] = { ...((out[key] as CssObject) ?? {}), ...toCssObject(node) }
    } else if (node.type === "atrule") {
      out[`@${node.name} ${clean(node.params)}`.trim()] = node.nodes ? toCssObject(node) : {}
    }
  })
  return out
}

const clean = (value: string) => value.replace(/\s+/g, " ").trim()

async function cssFor(file: string) {
  return toCssObject(postcss.parse(await readFile(path.join(uiSrc, file), "utf8")))
}

/** Workspace imports -> "@/" imports the CLI maps onto the project's aliases. */
function rewriteImports(source: string) {
  return source
    .replaceAll("@workspace/ui/components/", "@/components/ui/")
    .replaceAll("@workspace/ui/lib/", "@/lib/")
}

async function emitFile(file: string) {
  const isLib = file.startsWith("lib/")
  const target = path.join(outDir, isLib ? "lib" : "ui", path.basename(file))
  await mkdir(path.dirname(target), { recursive: true })
  await writeFile(target, rewriteImports(await readFile(path.join(uiSrc, file), "utf8")))
  return {
    path: path.relative(root, target),
    type: isLib ? "registry:lib" : "registry:ui",
  }
}

async function main() {
  await rm(outDir, { recursive: true, force: true })
  // shadcn build only adds files, so clear its output too: removed components must stop installing.
  await rm(path.join(root, "apps/web/public/r"), { recursive: true, force: true })

  const foundationItem = {
    name: "bevel",
    type: "registry:item",
    title: "Bevel foundation",
    description: foundation.description,
    css: await cssFor(foundation.file),
  }

  const themeTransition = {
    name: "theme-transition",
    type: "registry:lib",
    title: "Theme transition",
    description:
      "Switch light and dark as a change in lighting: the room dims, or the lights come up. Uses View Transitions.",
    registryDependencies: [`${namespace}/bevel`],
    files: [await emitFile("lib/theme-transition.ts")],
    css: await cssFor("styles/theme-transition.css"),
  }

  const componentItems = await Promise.all(
    components.map(async (component) => {
      const code = component.files.filter((file) => !file.endsWith(".css"))
      const styles = component.files.filter((file) => file.endsWith(".css"))
      const css: CssObject = {}
      for (const file of styles) Object.assign(css, await cssFor(file))
      return {
        name: component.slug,
        type: "registry:ui",
        title: component.name,
        description: component.description,
        categories: [component.category],
        dependencies: component.dependencies,
        registryDependencies: [
          `${namespace}/bevel`,
          ...(component.registryDependencies ?? []).map((slug) => `${namespace}/${slug}`),
        ],
        files: await Promise.all(code.map(emitFile)),
        ...(styles.length ? { css } : {}),
      }
    })
  )

  const registry = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "bevel",
    homepage: "https://github.com/hiteshbandhu/bevel",
    items: [foundationItem, themeTransition, ...componentItems],
  }
  await writeFile(path.join(root, "registry.json"), JSON.stringify(registry, null, 2) + "\n")
  console.log(`registry.json: ${registry.items.length} items`)
}

await main()
