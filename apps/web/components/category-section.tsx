import { ComponentTile } from "@/components/component-tile"
import { componentsIn, type Category } from "@/lib/catalog"

/** A category and every component in it, sub-components included: each works on its own. */
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
        {componentsIn(category.slug).map((component) => (
          <li key={component.slug}>
            <ComponentTile component={component} />
          </li>
        ))}
      </ul>
    </section>
  )
}
