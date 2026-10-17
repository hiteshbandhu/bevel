import Link from "next/link"
import { CategorySection } from "@/components/category-section"
import { WalletCheckout } from "@/components/demos/wallet-checkout"
import { categories } from "@/lib/catalog"

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="grid items-center gap-12 py-16 lg:grid-cols-[1fr_auto] lg:py-24">
        <div>
          <h1 className="max-w-[14ch] text-5xl leading-[1.05] font-bold tracking-tight text-balance sm:text-6xl">
            Interface parts with weight, edges and light.
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg text-muted-foreground">
            Bevel is a set of tactile React components built on Base UI and Tailwind. Copy one
            into your project and it&apos;s yours to change.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/components"
              className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Browse components
            </Link>
            <Link
              href="/components/wallet"
              className="inline-flex h-10 items-center rounded-lg border px-4 text-sm font-medium outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              How the wallet works
            </Link>
          </div>
        </div>
        <div className="tray flex justify-center rounded-(--bevel-radius-xl) px-6 py-12 sm:px-12 lg:w-[30rem]">
          <div className="w-full max-w-sm">
            <WalletCheckout />
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-20 border-t py-16">
        {categories.map((category) => (
          <CategorySection key={category.slug} category={category} />
        ))}
      </div>
    </main>
  )
}
