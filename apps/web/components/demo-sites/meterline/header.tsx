"use client"

const links = [
  { href: "#overview", label: "Overview" },
  { href: "#usage", label: "Usage" },
  { href: "#billing", label: "Billing" },
  { href: "#keys", label: "Keys" },
]

/** The product's own top bar: wordmark, section nav and the signed-in org. */
export function MeterlineHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <a
          href="#overview"
          className="flex items-center gap-2 rounded-sm font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span aria-hidden className="flex size-7 items-end gap-0.5 rounded-md bg-foreground p-1.5">
            <span className="h-1.5 w-1 rounded-full bg-background" />
            <span className="h-2.5 w-1 rounded-full bg-background" />
            <span className="h-4 w-1 rounded-full bg-background" />
          </span>
          Meterline
        </a>
        <nav aria-label="Meterline" className="order-last -mx-2 w-full sm:order-none sm:mx-0 sm:w-auto">
          <ul className="flex gap-1 text-sm">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block rounded-md px-2 py-1.5 text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <span className="hidden text-muted-foreground sm:inline">Halvorsen Labs</span>
          <span
            aria-label="Signed in as Ines Varga, owner of Halvorsen Labs"
            role="img"
            className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold"
          >
            IV
          </span>
        </div>
      </div>
    </header>
  )
}
