"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@workspace/ui/lib/utils"
import { transitionTheme } from "@workspace/ui/lib/theme-transition"
import { IconKey } from "@workspace/ui/components/icon-key"
import { GitHubStar } from "@/components/github-star"
import { SiteSearch } from "@/components/site-search"
import { xHandle, xUrl } from "@/lib/docs"
import type { SearchGroup } from "@/lib/search"

const links = [
  { href: "/docs", label: "Docs" },
  { href: "/components", label: "Components" },
  { href: "/demo", label: "Demos" },
  { href: "/themes", label: "Themes" },
  { href: "/blog", label: "Blog" },
]

export function SiteHeader({ searchIndex, stars }: { searchIndex: SearchGroup[]; stars: number | null }) {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  // The server can't know the theme, so the toggle's name waits for mount.
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:gap-8 sm:px-6">
        <Link
          href="/"
          className="wordmark flex shrink-0 items-center gap-2 rounded-sm text-xl font-extrabold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {/* The mark: a bevel with its lamp lit. Decorative; the word names the link. */}
          <img src="/logo.png" alt="" width={24} height={24} className="size-6" />
          Bevel
        </Link>
        {/* On a phone the links scroll sideways rather than push the buttons off screen. */}
        <nav className="-my-1 flex min-w-0 gap-4 overflow-x-auto py-1 text-sm whitespace-nowrap [scrollbar-width:none] sm:gap-6">
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
        <SiteSearch index={searchIndex} />
        <GitHubStar stars={stars} size="sm" className="hidden sm:inline-flex" />
        <a
          href={xUrl}
          className="hidden rounded-sm text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring sm:inline"
        >
          <span aria-hidden>X</span>
          <span className="sr-only">@{xHandle} on X</span>
        </a>
        <IconKey
          variant="ghost"
          aria-label={!mounted ? "Switch theme" : isDark ? "Turn the lights on" : "Turn the lights down"}
          onClick={() => {
            const next = isDark ? "light" : "dark"
            transitionTheme(next, () => setTheme(next))
          }}
        >
          {/* The server can't know the theme, so render both states and let CSS pick. */}
          <Sun className="size-4 dark:hidden" aria-hidden />
          <Moon className="hidden size-4 dark:block" aria-hidden />
        </IconKey>
      </div>
    </header>
  )
}
