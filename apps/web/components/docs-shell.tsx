import { DocsNav } from "@/components/docs-nav"
import { DocsNavMobile } from "@/components/docs-nav-mobile"

/** Sidebar and content column, shared by the guides and the component pages. */
export function DocsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:py-10 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-16">
      <DocsNavMobile />
      <aside className="hidden lg:sticky lg:top-10 lg:block lg:max-h-[calc(100svh-5rem)] lg:self-start lg:overflow-y-auto">
        <DocsNav />
      </aside>
      <main className="min-w-0">{children}</main>
    </div>
  )
}
