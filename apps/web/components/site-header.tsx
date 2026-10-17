"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@workspace/ui/lib/utils"
import { transitionTheme } from "@workspace/ui/lib/theme-transition"

const links = [{ href: "/components", label: "Components" }]

export function SiteHeader() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-8 px-4 sm:px-6">
        <Link
          href="/"
          className="wordmark rounded-sm text-xl font-extrabold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Bevel
        </Link>
        <nav className="flex gap-6 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                pathname.startsWith(link.href) && "text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => {
            const next = isDark ? "light" : "dark"
            transitionTheme(next, () => setTheme(next))
          }}
          className="ml-auto inline-flex size-9 items-center justify-center rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          {/* The server can't know the theme, so render both states and let CSS pick. */}
          <Sun className="size-4 dark:hidden" aria-hidden />
          <Moon className="hidden size-4 dark:block" aria-hidden />
          <span className="sr-only dark:hidden">Turn the lights down</span>
          <span className="hidden dark:sr-only dark:block">Turn the lights on</span>
        </button>
      </div>
    </header>
  )
}
