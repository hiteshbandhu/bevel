import { DocsNav } from "@/components/docs-nav"

/** Sidebar and content column, shared by the guides and the component pages. */
export function DocsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-16">
      <aside className="lg:sticky lg:top-10 lg:max-h-[calc(100svh-5rem)] lg:self-start lg:overflow-y-auto">
        <DocsNav />
      </aside>
      <main className="min-w-0">{children}</main>
    </div>
  )
}
