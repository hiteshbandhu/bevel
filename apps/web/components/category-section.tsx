import Link from "next/link"
import { previews } from "@/components/previews"
import { componentsIn, type Category } from "@/lib/catalog"

/** A category and its components, each shown as the object itself on the mat. */
export function CategorySection({
  category,
  as: Heading = "h2",
}: {
  category: Category
  as?: "h2" | "h3"
}) {
  return (
    <section id={category.slug} className="scroll-mt-20">
      <Heading className="text-2xl font-semibold tracking-tight">{category.name}</Heading>
      <p className="mt-1 max-w-prose text-muted-foreground">{category.description}</p>
      <ul className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {componentsIn(category.slug).map((component) => {
          const Preview = previews[component.slug]
          return (
            <li key={component.slug}>
              <Link
                href={`/components/${component.slug}`}
                className="group block rounded-(--bevel-radius-lg) outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
              >
                <div
                  inert
                  aria-hidden
                  className="flex justify-center transition-[translate] duration-(--bevel-duration-small) ease-(--bevel-ease-out) group-hover:-translate-y-1 motion-reduce:transition-none"
                >
                  <div className="w-full max-w-72">{Preview && <Preview />}</div>
                </div>
                <p className="mt-5 font-semibold">{component.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{component.description}</p>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
