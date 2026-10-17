"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@workspace/ui/lib/utils"
import {
  categories,
  componentHref,
  rootComponentsIn,
  subcomponentsOf,
  type ComponentDoc,
} from "@/lib/catalog"

function NavLink({ component, nested }: { component: ComponentDoc; nested?: boolean }) {
  const pathname = usePathname()
  const href = componentHref(component)
  const active = pathname === href
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "-ml-px block border-l border-transparent py-1 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        nested ? "pl-6" : "pl-3",
        active && "border-foreground font-medium text-foreground"
      )}
    >
      {component.name}
    </Link>
  )
}

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
            {rootComponentsIn(category.slug).map((component) => {
              const subs = subcomponentsOf(component.slug)
              return (
                <li key={component.slug}>
                  <NavLink component={component} />
                  {subs.length > 0 && (
                    <ul className="flex flex-col gap-1">
                      {subs.map((sub) => (
                        <li key={sub.slug}>
                          <NavLink component={sub} nested />
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
