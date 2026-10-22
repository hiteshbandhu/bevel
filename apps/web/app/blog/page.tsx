import type { Metadata } from "next"
import Link from "next/link"
import { formatPostDate, postHref, posts } from "@/lib/blog"
import { preview } from "@/lib/og"

const description =
  "Notes on skeuomorphic UI design and building Bevel: CSS tutorials, comparisons, and the real objects its React components borrow from."

export const metadata: Metadata = {
  title: "Blog",
  description,
  ...preview({ title: "Blog – Bevel", description, image: "page-blog.jpg", path: "/blog" }),
}

export default function Blog() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
      <p className="mt-3 text-lg text-muted-foreground">{description}</p>
      <ul className="mt-10 flex flex-col gap-4">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={postHref(post.slug)}
              className="flex flex-col gap-1.5 rounded-xl border p-5 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              <time dateTime={post.date} className="text-sm text-muted-foreground">
                {formatPostDate(post.date)}
              </time>
              <span className="text-xl font-semibold tracking-tight">{post.title}</span>
              <span className="text-muted-foreground">{post.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
