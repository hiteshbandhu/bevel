import {
  categories,
  components,
  componentHref,
  getComponent,
  rootComponentsIn,
  subcomponentsOf,
  type ComponentDoc,
} from "@/lib/catalog"
import { posts, postHref } from "@/lib/blog"
import { demoSites } from "@/lib/demos"
import { guideHref, guides, repoUrl } from "@/lib/docs"
import { registryNamespace, registryUrl, siteUrl } from "@/lib/site"
import { readProjectDemo } from "@/lib/source"
import { readFoundationTokens } from "@/lib/tokens"

// Plain-text views of the docs for language models (llmstxt.org): an index at
// /llms.txt, everything in one file at /llms-full.txt, and one Markdown file
// per component at /components/<slug>.md. All built from the same catalog the
// site and registry read, so they can't drift.

const summary =
  "Bevel is a shadcn-style registry of tactile, skeuomorphic React components built on Base UI (@base-ui/react) and Tailwind CSS v4. Components install as source with the shadcn CLI; each one is a real object doing a real job in a product (a cover over a deploy switch, a meter for live spend, alarm lamps that latch)."

const abs = (href: string) => `${siteUrl}${href}`

/** Where a component's Markdown lives: its page URL plus `.md`. */
export const componentMarkdownHref = (component: ComponentDoc) => `${componentHref(component)}.md`

/** `<link rel="alternate">`s for a component page: its Markdown, and the site index. */
export const componentAlternates = (component: ComponentDoc) => ({
  types: {
    "text/markdown": [{ url: componentMarkdownHref(component), title: `${component.name} as Markdown` }],
    "text/plain": [{ url: "/llms.txt", title: "Bevel docs for LLMs" }],
  },
})

const addCommand =(slug: string) => `npx shadcn@latest add ${registryNamespace}/${slug}`

const componentsJson = JSON.stringify({ registries: { [registryNamespace]: registryUrl } }, null, 2)

const installSection = `## Install

Bevel needs a React 19 project with Tailwind CSS v4 and shadcn set up (\`npx shadcn@latest init\`). Add the registry to \`components.json\` once:

\`\`\`json
${componentsJson}
\`\`\`

Then add components by name. Each brings the Bevel foundation stylesheet, its own styles (merged into global CSS) and any Bevel parts it is built from:

\`\`\`bash
${addCommand("<slug>")}
\`\`\`

Or with no configuration, from a URL: \`npx shadcn@latest add ${siteUrl}/r/<slug>.json\`. Files land in \`components/ui/<slug>.tsx\` and import as \`@/components/ui/<slug>\`. The registry index is at ${siteUrl}/r/registry.json, so \`npx shadcn@latest search ${registryNamespace}\` and the shadcn MCP server (\`npx shadcn@latest mcp\`) can browse it.`

const rulesSection = `## Rules for writing code with Bevel

- Compose parts. Each component file exports named parts (\`Wallet\`, \`WalletCard\`, \`WalletPocket\`), not one component with many props. Follow the anatomy shown for each component.
- Polymorphism is Base UI's \`render\` prop (\`<Wallet render={<button />} />\`). There is no \`as\` or \`asChild\`.
- Every rendered part sets \`data-slot="<name>"\` and exposes state as \`data-*\` attributes (\`data-pressed\`, \`data-checked\`, \`data-disabled\`, \`data-status\`, \`data-variant\`). Style from those, e.g. \`data-checked:...\` in Tailwind, not with JS-switched classes.
- \`className\` is merged last with \`cn()\` and always wins.
- Never hard-code colours, shadows, radii, durations, easings or type sizes. Read the foundation tokens through Tailwind: \`rounded-(--bevel-radius-md)\`, \`duration-(--bevel-duration-move) ease-(--bevel-ease-out)\`, \`text-(length:--bevel-amount)\`. Apply depth and materials with the utilities \`bevel-{recessed,flush,raised,pressed,object}\` and \`bevel-{leather,plastic,metal}\`.
- One light source, from the top. Nested radii are concentric (inner = outer - inset).
- Motion is CSS transitions on \`transform\`, \`translate\`, \`opacity\` and \`filter\` only; never animate \`height\`, \`width\`, \`top\`/\`left\`, \`margin\` or \`padding\`. Components honour \`prefers-reduced-motion\`.
- Whatever an object shows with light or position, it also says in text, for screen readers and everyone else.
- Dark mode follows a \`.dark\` class on \`<html>\` (the shadcn default). Theme a component by overriding its CSS variables, not by forking it.`

function componentLine(component: ComponentDoc) {
  return `- [${component.name}](${abs(componentMarkdownHref(component))}): ${component.description}`
}

export function llmsIndex() {
  const lines = [
    "# Bevel",
    "",
    `> ${summary}`,
    "",
    `Install a component with \`${addCommand("<slug>")}\` after adding \`"registries": { "${registryNamespace}": "${registryUrl}" }\` to components.json. Everything below in one file: ${abs("/llms-full.txt")}. Each component link is a Markdown file with its install command, anatomy, parts and example code.`,
    "",
    "## Docs",
    "",
    ...guides.map((g) => `- [${g.title}](${abs(`${guideHref(g.slug)}.md`)}): ${g.description}`),
    `- [Material themes](${abs("/themes")}): brass, bakelite and anodized themes (\`${addCommand("themes")}\`, then \`data-bevel-theme="brass"\` on <html> or a container), and a playground that writes custom theme CSS.`,
    "",
  ]
  for (const category of categories) {
    lines.push(`## ${category.name}`, "", `${category.description}`, "")
    for (const component of rootComponentsIn(category.slug)) {
      lines.push(componentLine(component))
      for (const sub of subcomponentsOf(component.slug)) lines.push(`  ${componentLine(sub)}`)
    }
    lines.push("")
  }
  lines.push(
    "## Blocks",
    "",
    "Whole screens built only from Bevel components, for Next.js apps.",
    "",
    ...demoSites.map(
      (d) =>
        `- [${d.name}, ${d.kind}](${abs(`/demo/${d.n}`)}): ${d.description} Install: \`${addCommand(d.block)}\`.`
    ),
    "",
    "## Optional",
    "",
    ...posts.map((p) => `- [${p.title}](${abs(`${postHref(p.slug)}.md`)}): ${p.description}`),
    `- [Full docs in one file](${abs("/llms-full.txt")}): every component with its anatomy, parts and example code.`,
    `- [Registry index](${abs("/r/registry.json")}): the shadcn registry, for \`shadcn search\` and the shadcn MCP server.`,
    `- [Source on GitHub](${repoUrl}): the components, the docs site and the registry build.`,
    ""
  )
  return lines.join("\n")
}

/** One component as Markdown. `depth` is the level of its title heading. */
export async function componentMarkdown(component: ComponentDoc, depth = 1) {
  const h = (n: number) => "#".repeat(depth + n)
  const category = categories.find((c) => c.slug === component.category)
  const parent = component.parent ? getComponent(component.parent) : undefined
  const builtFrom = (component.registryDependencies ?? []).map((slug) => getComponent(slug)?.name ?? slug)
  const parts = subcomponentsOf(component.slug)
  const examples = await Promise.all(
    component.examples.map(async (example) => ({ ...example, code: await readProjectDemo(example.file) }))
  )

  const lines = [
    `${h(0)} ${component.name}`,
    "",
    component.description,
    "",
    `- Category: ${category?.name ?? component.category}`,
    ...(parent ? [`- Part of: ${parent.name} (${abs(componentMarkdownHref(parent))})`] : []),
    ...(builtFrom.length ? [`- Built from: ${builtFrom.join(", ")}`] : []),
    ...(parts.length ? [`- Has parts that work alone: ${parts.map((p) => p.name).join(", ")}`] : []),
    `- Docs: ${abs(componentHref(component))}`,
    `- Import from: \`@/components/ui/${component.slug}\``,
    "",
    `${h(1)} Install`,
    "",
    "```bash",
    addCommand(component.slug),
    "```",
    "",
    `npm dependencies (installed by the CLI): ${component.dependencies.map((d) => `\`${d}\``).join(", ")}.`,
    "",
    `${h(1)} Anatomy`,
    "",
    "```tsx",
    component.anatomy,
    "```",
    "",
    `${h(1)} Parts`,
    "",
    "| Part | Renders | Description |",
    "| --- | --- | --- |",
    ...component.parts.map(
      (p) => `| \`${p.name}\` | ${cell(p.renders)} | ${cell(p.description)} |`
    ),
    "",
  ]
  for (const example of examples) {
    lines.push(
      `${h(1)} Example: ${example.title}`,
      "",
      example.description,
      "",
      "```tsx",
      example.code.trimEnd(),
      "```",
      ""
    )
  }
  return lines.join("\n")
}

const cell = (text: string) => text.replaceAll("|", "\\|").replaceAll("\n", " ")

export async function llmsFull() {
  const tokens = await readFoundationTokens()
  const tokenLines = tokens.flatMap((group) => [
    `### ${group.title}`,
    "",
    ...group.tokens.map((t) => `- \`${t.name}\`${t.note ? `: ${t.note}` : ""}`),
    "",
  ])
  // Parents first, each followed by its parts, in catalog category order.
  const ordered = categories.flatMap((c) =>
    rootComponentsIn(c.slug).flatMap((root) => [root, ...subcomponentsOf(root.slug)])
  )
  const missing = components.filter((c) => !ordered.includes(c))
  const bodies = await Promise.all([...ordered, ...missing].map((c) => componentMarkdown(c, 2)))

  return [
    "# Bevel",
    "",
    `> ${summary}`,
    "",
    `Docs: ${siteUrl}. Source: ${repoUrl}. Index of these docs: ${abs("/llms.txt")}.`,
    "",
    installSection,
    "",
    rulesSection,
    "",
    "## Foundation tokens",
    "",
    "Defined in `bevel.css`, installed with the first component. Use these instead of raw values.",
    "",
    ...tokenLines,
    "## Categories",
    "",
    ...categories.map((c) => `- ${c.name}: ${c.description}`),
    "",
    "## Blocks",
    "",
    ...demoSites.map((d) => `- ${d.name} (\`${addCommand(d.block)}\`): ${d.kind}. ${d.description} Uses ${d.uses.join(", ")}.`),
    "",
    "## Components",
    "",
    ...bodies,
  ].join("\n")
}

/** Plain text, cacheable, readable in a browser tab. */
export function textResponse(body: string, type: "text/plain" | "text/markdown" = "text/plain") {
  return new Response(body, { headers: { "Content-Type": `${type}; charset=utf-8` } })
}
