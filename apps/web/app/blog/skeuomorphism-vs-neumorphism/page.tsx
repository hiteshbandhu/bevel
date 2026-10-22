import type { Metadata } from "next"
import Link from "next/link"
import { LabCode, StyleRow } from "@/components/blog/css-lab"
import { JsonLd, author } from "@/components/json-ld"
import { Post } from "@/components/post"
import { Note, linkClass } from "@/components/prose"
import { postHref, posts } from "@/lib/blog"
import { preview } from "@/lib/og"
import { siteUrl } from "@/lib/site"

const post = posts.find((p) => p.slug === "skeuomorphism-vs-neumorphism")!

export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  ...preview({ title: post.title, description: post.description, image: `blog-${post.slug}.jpg`, path: postHref(post.slug), type: "article" }),
}

const base = `
  padding: 0.75rem 1.5rem;
  border: 0;
  border-radius: 0.625rem;
  font: 600 0.9375rem/1 system-ui, sans-serif;
  cursor: pointer;`

const flat = {
  label: "Flat",
  surface: "oklch(0.96 0.005 255)",
  css: `
.button {${base}
  background: oklch(0.52 0.13 255);
  color: white;
}
.button:active {
  background: oklch(0.46 0.13 255);
}`,
}

const neumorphic = {
  label: "Neumorphic",
  surface: "#e0e5ec",
  css: `
.button {${base}
  background: #e0e5ec;
  color: #7b8698;
  box-shadow: 6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff;
}
.button:active {
  box-shadow: inset 4px 4px 8px #a3b1c6, inset -4px -4px 8px #ffffff;
}`,
}

const skeuomorphic = {
  label: "Skeuomorphic",
  surface: "oklch(0.93 0.006 255)",
  css: `
.button {${base}
  --highlight: oklch(1 0 0 / 0.35);
  --shade: oklch(0 0 0 / 0.35);
  --edge: oklch(0.36 0.11 255);
  background: oklch(0.52 0.13 255)
    linear-gradient(to bottom, oklch(1 0 0 / 0.18), transparent 60%);
  color: white;
  box-shadow: inset 0 1px 0 var(--highlight), 0 1px 0 var(--edge),
    0 2px 0 var(--edge), 0 3px 5px var(--shade);
  transition: translate 100ms ease-out, box-shadow 100ms ease-out;
}
.button:active {
  translate: 0 2px;
  box-shadow: inset 0 1px 2px var(--shade), 0 1px 0 var(--highlight);
}`,
}

const rows: [string, string, string, string][] = [
  ["Idea", "Strip it to colour and type", "Soft shapes pushed out of the surface", "Borrow the look and behaviour of a real object"],
  ["Depth", "None", "Two soft shadows, one light and one dark", "Highlight, side, cast shadow from one light"],
  ["Contrast", "High", "Low: the control is the surface's colour", "High: the object stands apart from the surface"],
  ["Pressed state", "A colour change", "Shadows flip inward", "The key travels down"],
  ["Accessibility", "Good, if focus states are clear", "Usually fails WCAG contrast", "Good, if state is also said in words"],
  ["Peak", "2013 on (iOS 7)", "2019–2020, on Dribbble", "2007–2012 (iOS 6), back since about 2024"],
  ["Use it for", "Dense, text-heavy screens", "Mostly mockups", "Controls where state or stakes matter"],
]

export default function SkeuomorphismVsNeumorphism() {
  return (
    <Post slug="skeuomorphism-vs-neumorphism">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          url: `${siteUrl}${postHref(post.slug)}`,
          image: `${siteUrl}/og/blog-${post.slug}.jpg`,
          author,
          about: ["Skeuomorphism", "Neumorphism", "Flat design"],
        }}
      />
      <p>
        <strong>Skeuomorphism</strong> makes a control look and behave like a real object.{" "}
        <strong>Neumorphism</strong> makes it look like a soft bump pushed out of the page.{" "}
        <strong>Flat design</strong> removes depth altogether. The fastest way to see the difference is the
        same button in all three. Press each one:
      </p>
      <StyleRow styles={[flat, neumorphic, skeuomorphic]} />

      <h2>The short version</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 pr-4 font-medium text-muted-foreground"></th>
              <th className="py-2 pr-4 font-semibold">Flat</th>
              <th className="py-2 pr-4 font-semibold">Neumorphism</th>
              <th className="py-2 font-semibold">Skeuomorphism</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([what, ...cells]) => (
              <tr key={what} className="border-b align-top">
                <th className="py-2 pr-4 font-medium text-muted-foreground">{what}</th>
                {cells.map((cell, i) => (
                  <td key={i} className="py-2 pr-4">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Flat design</h2>
      <p>
        Flat design took over in 2013, when iOS 7 dropped Apple&apos;s textures and most of the industry
        followed. It&apos;s fast, clean and scales to dense screens. Its weakness is the reason the
        other two exist: a flat button and a flat label can look the same, so users have to learn what&apos;s
        clickable instead of seeing it.
      </p>
      <LabCode step={flat} />

      <h2>Neumorphism</h2>
      <p>
        Neumorphism, or &ldquo;new skeuomorphism&rdquo;, appeared on Dribbble around 2019: controls the same
        colour as the background, lifted by a light shadow on one side and a dark one on the other. It
        looks calm in a mockup, and that&apos;s where most of it stayed. The problem is contrast. In the
        example above, the label is <strong>2.9:1</strong> against the button, under WCAG&apos;s 4.5:1 for
        text, and the button&apos;s own edge barely separates from the page (1.7:1 for the dark shadow,
        against the 3:1 that WCAG asks of controls). Pressed and unpressed states look almost the same.
      </p>
      <LabCode step={neumorphic} />
      <Note>
        If you like the softness of neumorphism, keep the soft shadows but give the control its own colour.
        That one change fixes most of its accessibility problems, and it&apos;s halfway to skeuomorphism.
      </Note>

      <h2>Skeuomorphism</h2>
      <p>
        Skeuomorphism borrows from a real object: a key that stands up from the surface, has a side you
        can see, and sinks when you press it. The 2010-era version used it as decoration (leather
        calendars, felt card tables), which is why it got a bad name. The modern version, sometimes called{" "}
        <Link href={postHref("neo-skeuomorphism")} className={linkClass}>
          neo-skeuomorphism
        </Link>
        , uses depth only where it tells the user something: what can be pressed, what state a switch is
        in, which action is dangerous.
      </p>
      <LabCode step={skeuomorphic} />
      <p>
        The step-by-step version of this button, including dark mode and Tailwind, is in{" "}
        <Link href={postHref("skeuomorphic-button-css")} className={linkClass}>
          how to make a skeuomorphic button in CSS
        </Link>
        .
      </p>

      <h2>What about glassmorphism?</h2>
      <p>
        Glassmorphism is frosted, translucent panels: <code>backdrop-filter: blur()</code> over a colourful
        background. It&apos;s a surface style rather than a control style, so it combines with the others: a
        glass panel can hold flat or skeuomorphic buttons. Watch its contrast too, since the text sits on
        whatever is behind the glass.
      </p>

      <h2>Which one should you use?</h2>
      <ul>
        <li>
          <strong>Flat</strong> for most of the screen: lists, tables, forms, reading.
        </li>
        <li>
          <strong>Skeuomorphic</strong> for the few controls where state and stakes matter: a deploy switch,
          a spend meter, an on/off with consequences. Mixing the two is the point: depth stands out because
          the rest is flat.
        </li>
        <li>
          <strong>Neumorphic</strong> only with its colours fixed, as in the note above.
        </li>
      </ul>
      <p>
        If you&apos;re building in React,{" "}
        <Link href="/components" className={linkClass}>
          Bevel&apos;s skeuomorphic components
        </Link>{" "}
        do the hard parts for you: one light source, transform-only motion, full keyboard and screen-reader
        support, and dark mode that dims the light rather than inverting the object.
      </p>
    </Post>
  )
}
