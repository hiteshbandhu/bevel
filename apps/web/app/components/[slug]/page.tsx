import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CodeBlock } from "@/components/code-block"
import { demos } from "@/components/demos"
import { Example } from "@/components/example"
import { categories, components, foundation, getComponent } from "@/lib/catalog"
import { readDemo, readLibraryFile } from "@/lib/source"

export const dynamicParams = false

export function generateStaticParams() {
  return components.map((component) => ({ slug: component.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const component = getComponent((await params).slug)
  return component ? { title: component.name, description: component.description } : {}
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const component = getComponent((await params).slug)
  if (!component) notFound()
  const category = categories.find((c) => c.slug === component.category)!

  const [exampleSources, librarySources, foundationSource] = await Promise.all([
    Promise.all(component.examples.map((example) => readDemo(example.file))),
    Promise.all(component.files.map((file) => readLibraryFile(file))),
    readLibraryFile(foundation.file),
  ])
  const builtFrom = (component.registryDependencies ?? []).map((slug) => getComponent(slug)!)
  const fileName = (file: string) => file.split("/").pop()!
  const stylesheets = [foundation.file, ...component.files].filter((file) => file.endsWith(".css"))

  return (
    <article>
      <Link
        href={`/components#${category.slug}`}
        className="rounded-sm text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        {category.name}
      </Link>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">{component.name}</h1>
      <p className="mt-3 max-w-prose text-lg text-muted-foreground">{component.description}</p>

      <div className="mt-12 flex flex-col gap-16">
        {component.examples.map((example, i) => {
          const Demo = demos[example.file]!
          return (
            <Example
              key={example.slug}
              id={example.slug}
              title={example.title}
              description={example.description}
              code={<CodeBlock code={exampleSources[i]!} title={example.file} />}
            >
              <Demo />
            </Example>
          )
        })}
      </div>

      <section className="mt-20">
        <h2 className="text-2xl font-semibold tracking-tight">Installation</h2>
        <ol className="mt-6 flex list-decimal flex-col gap-8 pl-5 marker:text-muted-foreground">
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
                    <Link
                      href={`/components/${dependency.slug}`}
                      className="rounded-sm underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
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
                Copy <code className="font-mono text-sm">{file.split("/").pop()}</code> into your
                project.
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
