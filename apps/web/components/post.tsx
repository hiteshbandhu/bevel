import Link from "next/link"
import { OriginPlate } from "@/components/origin-plate"
import { componentHref, getComponent } from "@/lib/catalog"
import { xHandle, xUrl } from "@/lib/docs"
import { formatPostDate, posts } from "@/lib/blog"
import { origins } from "@/lib/origins"
import { linkClass } from "@/components/prose"

/** A blog post: title, byline, body. */
export function Post({ slug, children }: { slug: (typeof posts)[number]["slug"]; children: React.ReactNode }) {
  const post = posts.find((p) => p.slug === slug)!
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <article>
        <Link
          href="/blog"
          className="rounded-sm text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          Blog
        </Link>
        <h1 className="mt-3 text-4xl leading-tight font-bold tracking-tight text-balance sm:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 max-w-prose text-lg text-muted-foreground">{post.description}</p>
        <p className="mt-6 text-sm text-muted-foreground">
          <time dateTime={post.date}>{formatPostDate(post.date)}</time> ·{" "}
          <a href={xUrl} className={linkClass}>
            @{xHandle}
          </a>
        </p>
        <div className="prose-guide mt-12">{children}</div>
      </article>
    </main>
  )
}

/**
 * A component, live, in its tray, with the invention it's modelled on.
 * The demo is the same one its docs page shows.
 */
export function Specimen({ slug, children }: { slug: string; children: React.ReactNode }) {
  const component = getComponent(slug)!
  const origin = origins[slug]
  return (
    <figure className="my-6 flex flex-col">
      <div data-llm="omit" className="tray flex overflow-x-auto rounded-(--bevel-radius-xl) px-4 py-10 sm:px-10 [&>*]:mx-auto">
        {children}
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        <Link href={componentHref(component)} className={linkClass}>
          {component.name}
        </Link>
        : {component.description}
      </figcaption>
      {origin && <OriginPlate origin={origin} />}
    </figure>
  )
}
