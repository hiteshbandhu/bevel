"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu as MenuIcon, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@workspace/ui/lib/utils"
import { transitionTheme } from "@workspace/ui/lib/theme-transition"
import { IconKey } from "@workspace/ui/components/icon-key"
import { Menu, MenuContent, MenuLinkItem, MenuSeparator, MenuTrigger } from "@workspace/ui/components/menu"
import { GitHubStar } from "@/components/github-star"
import { SiteSearch } from "@/components/site-search"
import { xHandle, xUrl } from "@/lib/docs"
import type { SearchGroup } from "@/lib/search"

// On a phone the links move into the menu key; the header keeps the mark, search and theme.
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
        <nav className="hidden min-w-0 gap-6 text-sm whitespace-nowrap sm:flex">
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
        <Menu>
          <MenuTrigger render={<IconKey variant="ghost" aria-label="More pages" className="sm:hidden" />}>
            <MenuIcon aria-hidden />
          </MenuTrigger>
          <MenuContent align="end">
            {links.map((link) => (
              <MenuLinkItem key={link.href} render={<Link href={link.href} />}>
                {link.label}
              </MenuLinkItem>
            ))}
            <MenuSeparator />
            <MenuLinkItem href={xUrl}>@{xHandle} on X</MenuLinkItem>
          </MenuContent>
        </Menu>
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
