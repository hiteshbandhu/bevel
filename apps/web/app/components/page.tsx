import type { Metadata } from "next"
import { CategorySection } from "@/components/category-section"
import { categories } from "@/lib/catalog"
import { preview } from "@/lib/og"

const description =
  "Every Bevel component: skeuomorphic React parts for money, instruments, records, agents and documents. Built on Base UI and Tailwind CSS v4, installed with the shadcn CLI."

export const metadata: Metadata = {
  title: "Skeuomorphic React components",
  description,
  ...preview({ title: "Skeuomorphic React components – Bevel", description, image: "page-components.jpg", path: "/components" }),
}

export default function ComponentsIndex() {
  return (
    <>
      <h1 className="text-4xl font-bold tracking-tight">Components</h1>
      <p className="mt-3 max-w-prose text-lg text-muted-foreground">
        Every component is source you copy into your project, built on Base UI so keyboard
        and screen reader support come with it.
      </p>
      <div className="mt-14 flex flex-col gap-20">
        {categories.map((category) => (
          <CategorySection key={category.slug} category={category} />
        ))}
      </div>
    </>
  )
}
