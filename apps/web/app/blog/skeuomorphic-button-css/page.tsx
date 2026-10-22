import type { Metadata } from "next"
import Link from "next/link"
import { LabCode, LabRow, type LabStep } from "@/components/blog/css-lab"
import { CodeBlock } from "@/components/code-block"
import { BreakerCaps } from "@/components/demos/breaker-caps"
import { GuardedSwitchDeploy } from "@/components/demos/guarded-switch-deploy"
import { JsonLd, author } from "@/components/json-ld"
import { Post, Specimen } from "@/components/post"
import { Note, linkClass } from "@/components/prose"
import { postHref, posts } from "@/lib/blog"
import { preview } from "@/lib/og"
import { registryNamespace, siteUrl } from "@/lib/site"

const post = posts.find((p) => p.slug === "skeuomorphic-button-css")!

export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  ...preview({ title: post.title, description: post.description, image: `blog-${post.slug}.jpg`, path: postHref(post.slug), type: "article" }),
}

const steps: LabStep[] = [
  {
    label: "Flat",
    css: `
.button {
  padding: 0.75rem 1.5rem;
  border: 0;
  border-radius: 0.625rem;
  background-color: oklch(0.52 0.13 255);
  color: white;
  font: 600 0.9375rem/1 system-ui, sans-serif;
  cursor: pointer;
}`,
  },
  {
    label: "Depth",
    css: `
.button {
  /* One light, above the screen. Every shadow reads from these. */
  --highlight: oklch(1 0 0 / 0.35);
  --shade: oklch(0 0 0 / 0.35);
  --edge: oklch(0.36 0.11 255);

  box-shadow:
    inset 0 1px 0 var(--highlight), /* lit top edge */
    0 1px 0 var(--edge),            /* the side of the key */
    0 2px 0 var(--edge),
    0 3px 5px var(--shade);         /* its shadow on the surface */
}`,
  },
  {
    label: "Material",
    css: `
.button {
  /* Light falls off from the top: a gloss, not a texture image. */
  background-image: linear-gradient(to bottom, oklch(1 0 0 / 0.18), transparent 60%);
  text-shadow: 0 -1px 0 oklch(0 0 0 / 0.25);
}`,
  },
  {
    label: "Press",
    css: `
.button {
  transition: translate 100ms ease-out, box-shadow 100ms ease-out;
}
.button:active {
  /* Sink by the depth of the edge, and lose the edge. */
  translate: 0 2px;
  box-shadow:
    inset 0 1px 2px var(--shade),
    0 1px 0 var(--highlight);
}
.button:focus-visible {
  outline: 2px solid oklch(0.52 0.13 255);
  outline-offset: 3px;
}
@media (prefers-reduced-motion: reduce) {
  .button { transition: none; }
}`,
  },
]

const darkMode: LabStep = {
  label: "Dark",
  css: `
/* In the dark the light dims. The key is still blue plastic. */
.dark .button {
  --highlight: oklch(1 0 0 / 0.18);
  --shade: oklch(0 0 0 / 0.6);
}`,
}

export default function SkeuomorphicButtonCss() {
  return (
    <Post slug="skeuomorphic-button-css">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          url: `${siteUrl}${postHref(post.slug)}`,
          image: `${siteUrl}/og/blog-${post.slug}.jpg`,
          author,
          proficiencyLevel: "Beginner",
          about: ["Skeuomorphism", "CSS", "Tailwind CSS", "Buttons"],
        }}
      />
      <p>
        A skeuomorphic button looks like a physical key: it has a lit top edge, a side, a shadow on the
        surface it sits on, and it sinks when you press it. You need about 30 lines of CSS and no images.
        Here are the four steps, each one live, so you can press the result of every stage.
      </p>
      <LabRow steps={steps} />

      <h2>What makes a button skeuomorphic</h2>
      <p>
        Skeuomorphism means borrowing the look of a real object, and for a button the useful part of the
        object is that its shape tells you things. A raised key says <em>press me</em>. A key that sinks
        says <em>that worked</em>. Flat design keeps the label and drops those signals. A good skeuomorphic
        button brings the signals back without dragging in textures and noise. It comes down to four
        things:
      </p>
      <ol>
        <li>
          <strong>One light source.</strong> Every highlight and shadow agrees about where the light is.
        </li>
        <li>
          <strong>Depth.</strong> Stacked box shadows draw the key&apos;s top edge, its side and its shadow.
        </li>
        <li>
          <strong>Material.</strong> A gradient for how light falls across the surface.
        </li>
        <li>
          <strong>Travel.</strong> On press, the key moves down by the depth of its side.
        </li>
      </ol>

      <h2>Step 1: start with a real button</h2>
      <p>
        Use a <code>&lt;button&gt;</code>, not a <code>div</code>. You get keyboard support, focus and the
        right role for free, and everything after this is just paint.
      </p>
      <LabCode step={steps[0]!} />

      <h2>Step 2: pick one light and build the depth</h2>
      <p>
        Put the light in three custom properties: a highlight, a shade, and the colour of the key&apos;s
        side, which is a darker version of the face. Then stack four shadows. The inset one lights the top
        edge. The two hard ones, 1px and 2px down, draw the side of the key. The soft one is its shadow on
        the surface.
      </p>
      <LabCode step={steps[1]!} />
      <Note>
        The hard 1px and 2px shadows are the trick most tutorials miss. A single blurry drop shadow makes a
        button float. Two solid offsets give it a side, so it reads as a key with thickness.
      </Note>

      <h2>Step 3: add the material</h2>
      <p>
        Light hitting a glossy surface from above is brightest at the top. One gradient over the base
        colour does it. Avoid texture images: they cost a request, blur on high-density screens and fight
        with dark mode. A light text shadow on the upper side makes the label look printed into the key.
      </p>
      <LabCode step={steps[2]!} />

      <h2>Step 4: make it press</h2>
      <p>
        On <code>:active</code>, move the key down by the depth of its side, 2px, and swap the raised
        shadows for an inset one, as if it now sits level with the surface. Animate only{" "}
        <code>translate</code> and <code>box-shadow</code>: never <code>margin</code>,{" "}
        <code>padding</code> or <code>top</code>, which make the browser lay out the page again on every
        frame. Keep it fast. 100ms feels like a key; 300ms feels like a slow elevator.
      </p>
      <LabCode step={steps[3]!} />
      <p>
        The focus ring matters more on a skeuomorphic button than a flat one: the shadows already use
        contrast, so a keyboard user needs an outline that clearly sits outside them.
      </p>

      <h2>Dark mode: dim the light, don&apos;t invert the object</h2>
      <p>
        A common mistake is to flip a skeuomorphic button&apos;s colours for dark mode. A blue key is still a
        blue key at night. What changes is the light: highlights get weaker and shadows get deeper. Because
        the light lives in custom properties, dark mode is two lines.
      </p>
      <LabCode step={darkMode} />

      <h2>The same button in Tailwind CSS v4</h2>
      <p>
        In Tailwind v4, put the depth in a utility with <code>@utility</code> so it can&apos;t drift, and
        keep the press in classes next to the markup:
      </p>
      <CodeBlock
        lang="css"
        title="globals.css"
        code={`@utility key-raised {
  --highlight: oklch(1 0 0 / 0.35);
  --shade: oklch(0 0 0 / 0.35);
  background-image: linear-gradient(to bottom, oklch(1 0 0 / 0.18), transparent 60%);
  box-shadow:
    inset 0 1px 0 var(--highlight),
    0 1px 0 var(--color-blue-800),
    0 2px 0 var(--color-blue-800),
    0 3px 5px var(--shade);
}

@utility key-pressed {
  box-shadow: inset 0 1px 2px var(--shade), 0 1px 0 var(--highlight);
}`}
      />
      <CodeBlock
        lang="tsx"
        title="deploy-button.tsx"
        code={`<button
  className="key-raised rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white
    transition-[translate,box-shadow] duration-100 ease-out
    active:translate-y-0.5 active:key-pressed
    focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-600
    motion-reduce:transition-none"
>
  Deploy
</button>`}
      />

      <h2>Mistakes that make skeuomorphism look dated</h2>
      <ul>
        <li>
          <strong>Two light sources.</strong> A highlight on the left edge of one button and the top of
          another reads as wrong even when nobody can say why. Keep the light in shared variables.
        </li>
        <li>
          <strong>Low contrast, the neumorphism trap.</strong> Light-grey buttons on a light-grey page with
          soft shadows look elegant and fail WCAG&apos;s 3:1 contrast rule for controls. Keep the key&apos;s
          colour clearly apart from the surface.
        </li>
        <li>
          <strong>Animating layout.</strong> Growing <code>padding</code> or <code>height</code> on press
          relays out the page on every frame. In Bevel, adding a card to a wallet cost 678ms of main-thread
          work with a height transition and 94ms with transforms instead.
        </li>
        <li>
          <strong>Decoration without a job.</strong> Stitching, leather and wood grain on a button that
          does nothing special is the costume skeuomorphism got its bad name from. Use depth where it tells
          the user something.
        </li>
      </ul>

      <h2>Or install buttons that already do this</h2>
      <p>
        Everything above is how{" "}
        <Link href="/" className={linkClass}>
          Bevel
        </Link>
        &apos;s components are built: one set of light tokens, stacked depth, transform-only motion,
        accessible by default. Some of them are buttons with a job: a switch under a cover for actions you
        must not press by accident, and breakers that trip and reset.
      </p>
      <Specimen slug="guarded-switch">
        <GuardedSwitchDeploy />
      </Specimen>
      <Specimen slug="breaker">
        <BreakerCaps />
      </Specimen>
      <CodeBlock
        lang="bash"
        title="Terminal"
        code={`npx shadcn@latest add ${registryNamespace}/guarded-switch ${registryNamespace}/breaker`}
      />
      <p>
        Or browse all{" "}
        <Link href="/components" className={linkClass}>
          skeuomorphic React components
        </Link>
        , or read{" "}
        <Link href={postHref("skeuomorphism-is-back")} className={linkClass}>
          why skeuomorphism is back
        </Link>
        .
      </p>
    </Post>
  )
}
