"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@workspace/ui/lib/utils"
import { categories, componentsIn } from "@/lib/catalog"

export function DocsNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Components" className="flex flex-col gap-6 text-sm">
      <Link
        href="/components"
        className={cn(
          "rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
          pathname === "/components" && "font-medium text-foreground"
        )}
      >
        All components
      </Link>
      {categories.map((category) => (
        <div key={category.slug}>
          <p className="font-semibold">{category.name}</p>
          <ul className="mt-2 flex flex-col gap-1 border-l">
            {componentsIn(category.slug).map((component) => {
              const href = `/components/${component.slug}`
              const active = pathname === href
              return (
                <li key={component.slug}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "-ml-px block border-l border-transparent py-1 pl-3 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                      active && "border-foreground font-medium text-foreground"
                    )}
                  >
                    {component.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
