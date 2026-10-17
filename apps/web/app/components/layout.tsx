import { DocsNav } from "@/components/docs-nav"

export default function ComponentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-16">
      <aside className="lg:sticky lg:top-10 lg:self-start">
        <DocsNav />
      </aside>
      <main className="min-w-0">{children}</main>
    </div>
  )
}
