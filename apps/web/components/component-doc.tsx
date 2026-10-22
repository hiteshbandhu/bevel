import Link from "next/link"
import { CopyPage } from "@/components/copy-page"
import { CodeBlock } from "@/components/code-block"
import { ComponentTile } from "@/components/component-tile"
import { demos } from "@/components/demos"
import { Example } from "@/components/example"
import {
  categories,
  componentHref,
  foundation,
  getComponent,
  type ComponentDoc,
} from "@/lib/catalog"
import { readDemo, readLibraryFile } from "@/lib/source"
import { origins } from "@/lib/origins"
import { OriginPlate } from "@/components/origin-plate"
import { registryNamespace, registryUrl } from "@/lib/site"

const crumbClass =
  "rounded-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
const linkClass =
  "rounded-sm text-foreground underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"

/** The full page for one component; shared by top-level and nested routes. */
export async function ComponentDocPage({ component }: { component: ComponentDoc }) {
  const category = categories.find((c) => c.slug === component.category)!

  const [exampleSources, librarySources, foundationSource] = await Promise.all([
    Promise.all(component.examples.map((example) => readDemo(example.file))),
    Promise.all(component.files.map((file) => readLibraryFile(file))),
    readLibraryFile(foundation.file),
  ])
  const builtFrom = (component.registryDependencies ?? []).map((slug) => getComponent(slug)!)
  const parent = component.parent ? getComponent(component.parent) : undefined
  const fileName = (file: string) => file.split("/").pop()!
  const stylesheets = [foundation.file, ...component.files].filter((file) => file.endsWith(".css"))

  return (
    <article>
      <nav aria-label="Breadcrumb">
        <ol className="flex gap-2 text-sm text-muted-foreground">
          <li>
            <Link href={`/components#${category.slug}`} className={crumbClass}>
              {category.name}
            </Link>
          </li>
          {parent && (
            <li className="flex gap-2">
              <span aria-hidden>/</span>
              <Link href={componentHref(parent)} className={crumbClass}>
                {parent.name}
              </Link>
            </li>
          )}
        </ol>
      </nav>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <h1 className="text-4xl font-bold tracking-tight">{component.name}</h1>
        <CopyPage />
      </div>
      <p className="mt-3 max-w-prose text-lg text-muted-foreground">{component.description}</p>
      {parent && (
        <p className="mt-4 max-w-prose text-sm text-muted-foreground">
          Part of{" "}
          <Link href={componentHref(parent)} className={linkClass}>
            {parent.name}
          </Link>
          , and works on its own anywhere else.
        </p>
      )}

      {origins[component.slug] && <OriginPlate origin={origins[component.slug]!} />}

      <div className="mt-12 flex flex-col gap-16">
        {component.examples.map((example, i) => {
          const Demo = demos[example.file]!
          return (
            <Example
              key={example.slug}
              id={example.slug}
              trackId={`${component.slug}/${example.slug}`}
              title={example.title}
              description={example.description}
              wide={example.wide}
              code={<CodeBlock code={exampleSources[i]!} title={example.file} />}
            >
              <Demo />
            </Example>
          )
        })}
      </div>

      {builtFrom.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-semibold tracking-tight">Built from</h2>
          <p className="mt-2 max-w-prose text-muted-foreground">
            {component.name} is made of components that also work on their own.
          </p>
          <ul className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2">
            {builtFrom.map((sub) => (
              <li key={sub.slug}>
                <ComponentTile component={sub} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-20">
        <h2 className="text-2xl font-semibold tracking-tight">Installation</h2>

        <h3 className="mt-8 font-semibold">Add with the CLI</h3>
        <ol className="mt-4 flex list-decimal flex-col gap-6 pl-5 marker:text-muted-foreground">
          <li>
            <p>
              Once per project, add the Bevel registry to{" "}
              <code className="font-mono text-sm">components.json</code>.
            </p>
            <CodeBlock
              className="mt-3"
              lang="json"
              title="components.json"
              code={JSON.stringify({ registries: { [registryNamespace]: registryUrl } }, null, 2)}
            />
          </li>
          <li>
            <p>
              Add {component.name}.{" "}
              <span className="text-muted-foreground">
                This brings in{" "}
                {builtFrom.length > 0
                  ? `${builtFrom.map((d) => d.name).join(", ")} and the Bevel foundation`
                  : "the Bevel foundation"}
                , installs {component.dependencies.join(" and ")}, and merges the styles into your
                global CSS.
              </span>
            </p>
            <CodeBlock
              className="mt-3"
              lang="bash"
              title="Terminal"
              code={`npx shadcn@latest add ${registryNamespace}/${component.slug}`}
            />
          </li>
        </ol>

        <details className="group mt-10 rounded-xl border">
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-4 py-3 font-semibold outline-none select-none focus-visible:ring-2 focus-visible:ring-ring">
            Install manually
            <span aria-hidden className="text-muted-foreground transition-[rotate] duration-(--bevel-duration-small) group-open:rotate-45">
              +
            </span>
          </summary>
          <ol className="flex list-decimal flex-col gap-8 border-t px-4 pt-6 pb-6 pl-9 marker:text-muted-foreground">
            <li>
              <p>Install the dependencies.</p>
              <CodeBlock
                className="mt-3"
                lang="bash"
                title="Terminal"
                code={`pnpm add ${component.dependencies.join(" ")}`}
              />
            </li>
            <li>
              <p>
                Add the Bevel foundation, if you haven&apos;t already.{" "}
                <span className="text-muted-foreground">{foundation.description}</span>
              </p>
              <CodeBlock className="mt-3" lang="css" title={foundation.file} code={foundationSource} />
            </li>
            {builtFrom.length > 0 && (
              <li>
                <p>
                  Install the components {component.name} is built from:{" "}
                  {builtFrom.map((dependency, i) => (
                    <span key={dependency.slug}>
                      {i > 0 && ", "}
                      <Link href={componentHref(dependency)} className={linkClass}>
                        {dependency.name}
                      </Link>
                    </span>
                  ))}
                  .
                </p>
              </li>
            )}
            {component.files.map((file, i) => (
              <li key={file}>
                <p>
                  Copy <code className="font-mono text-sm">{file.split("/").pop()}</code> into{" "}
                  <code className="font-mono text-sm">
                    {file.startsWith("lib/") ? "lib" : file.endsWith(".css") ? "your styles" : "components/ui"}
                  </code>
                  .
                </p>
                <CodeBlock
                  className="mt-3"
                  lang={file.endsWith(".css") ? "css" : "tsx"}
                  title={file}
                  code={librarySources[i]!}
                />
              </li>
            ))}
            <li>
              <p>Import the stylesheets after Tailwind in your global CSS, foundation first.</p>
              <CodeBlock
                className="mt-3"
                lang="css"
                title="globals.css"
                code={stylesheets.map((file) => `@import "./${fileName(file)}";`).join("\n")}
              />
            </li>
          </ol>
        </details>
      </section>

      <section className="mt-20">
        <h2 className="text-2xl font-semibold tracking-tight">Anatomy</h2>
        <p className="mt-2 max-w-prose text-muted-foreground">
          Each part is its own component. Leave out the ones you don&apos;t need.
        </p>
        <CodeBlock className="mt-6" code={component.anatomy} title="Anatomy" />
      </section>

      <section className="mt-20">
        <h2 className="text-2xl font-semibold tracking-tight">Parts</h2>
        <div className="mt-6 overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-card text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Part</th>
                <th scope="col" className="px-4 py-3 font-medium">Renders</th>
                <th scope="col" className="px-4 py-3 font-medium">What it does</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {component.parts.map((part) => (
                <tr key={part.name} className="align-top">
                  <th scope="row" className="px-4 py-3 font-mono text-[0.8125rem] font-medium whitespace-nowrap">
                    {part.name}
                  </th>
                  <td className="px-4 py-3 font-mono text-[0.8125rem] whitespace-nowrap text-muted-foreground">
                    {part.renders}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{part.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </article>
  )
}
