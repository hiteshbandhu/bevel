import type { Metadata } from "next"
import Link from "next/link"
import { LabCode, StyleRow } from "@/components/blog/css-lab"
import { Faq, faqData, type Question } from "@/components/blog/faq"
import { PartCode, PartRow, type Part } from "@/components/blog/parts"
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

/** Glass needs something behind it: a violet-to-blue backdrop with one amber disc. */
const glassSurface =
  "radial-gradient(circle at 64% 40%, oklch(0.78 0.15 75) 0 2.75rem, transparent 2.8rem), linear-gradient(135deg, oklch(0.5 0.17 280), oklch(0.55 0.14 220))"

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

const glass = {
  label: "Glassmorphic",
  surface: glassSurface,
  css: `
.button {${base}
  border: 1px solid oklch(1 0 0 / 0.45);
  background: oklch(1 0 0 / 0.18);
  color: white;
  backdrop-filter: blur(12px);
  box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.5), 0 4px 16px oklch(0 0 0 / 0.15);
}
.button:active {
  background: oklch(1 0 0 / 0.3);
}`,
}

const rows: [string, string, string, string, string][] = [
  ["Idea", "Strip it to colour and type", "Soft shapes pushed out of the surface", "Borrow the look and behaviour of a real object", "Frosted, translucent panels over a colourful backdrop"],
  ["Depth", "None", "Two soft shadows, one light and one dark", "Highlight, side and cast shadow from one light", "Layers, shown by blur and transparency"],
  ["Contrast", "High", "Low: the control is the surface's colour", "High: the object stands apart from the surface", "Depends on whatever is behind the glass"],
  ["Pressed state", "A colour change", "Shadows flip inward", "The key travels down", "The glass gets more opaque"],
  ["Accessibility", "Good, if focus states are clear", "Usually fails WCAG contrast", "Good, if state is also said in words", "Risky over busy or bright backdrops"],
  ["Peak", "2013 on (iOS 7)", "2019–2020, on Dribbble", "2007–2012 (iOS 6), back since about 2024", "Named around 2020; Apple's Liquid Glass in 2025"],
  ["Use it for", "Dense, text-heavy screens", "Mostly mockups", "Controls where state or stakes matter", "Panels and bars that float over content"],
]

/**
 * WCAG 2 contrast ratios, computed from the CSS colours on this page with the
 * relative-luminance formula. Translucent layers are composited over their
 * backdrop first. Glass is measured over the violet and over the amber disc.
 */
const contrast: [string, string, string, string, string][] = [
  ["Button label vs button (needs 4.5:1)", "5.54 ✓", "2.91 ✗", "4.76–5.21 ✓", "4.28 over violet, 1.80 over amber ✗"],
  ["Button vs page", "4.93", "1.00 (its dark shadow: 1.72)", "4.51 (its side: 8.91)", "1.14–1.49 (its border: 1.38–2.58)"],
  ["Switch thumb vs track, off / on (needs 3:1)", "3.64 / 5.54 ✓", "1.00 / 1.00 ✗", "3.05 / 4.65 ✓", "3.82 / 2.20 over violet, 1.70 / 1.40 over amber ✗"],
  ["Switch label vs page (needs 4.5:1)", "14.24 ✓", "2.91 ✗", "13.02 ✓", "6.36 over violet, 2.04 over amber"],
]

/** The same switch in each style: one skeleton, four paints. */
const switchSkeleton = `
/* The skeleton every style shares: a real checkbox laid over a track and thumb. */
.switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font: 600 0.9375rem/1 system-ui, sans-serif;
  cursor: pointer;
}
.switch input {
  position: absolute;
  inset: 0;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}
.switch .track {
  display: block;
  width: 3rem;
  padding: 0.1875rem;
  border-radius: 999px;
  transition: background-color 150ms ease-out;
}
.switch .thumb {
  display: block;
  width: 1.375rem;
  height: 1.375rem;
  border-radius: 50%;
  transition: translate 150ms ease-out;
}
.switch :checked + .track .thumb {
  translate: 1.25rem 0;
}
.switch:has(:focus-visible) .track {
  outline: 2px solid currentColor;
  outline-offset: 3px;
}
@media (prefers-reduced-motion: reduce) {
  .switch .track, .switch .thumb { transition: none; }
}`

const switchHtml = (style: string) => `<label class="switch ${style}">
  <input type="checkbox" role="switch" checked>
  <span class="track"><span class="thumb"></span></span>
  Sync
</label>`

const switches: Part[] = [
  {
    label: "Flat",
    surface: flat.surface,
    html: switchHtml("flat"),
    css: `
.flat { color: oklch(0.25 0.02 255); }
.flat .track { background: oklch(0.62 0.01 255); }
.flat :checked + .track { background: oklch(0.52 0.13 255); }
.flat .thumb { background: white; }`,
  },
  {
    label: "Neumorphic",
    surface: neumorphic.surface,
    html: switchHtml("neu"),
    css: `
.neu { color: #7b8698; }
.neu .track {
  background: #e0e5ec;
  box-shadow: inset 3px 3px 6px #a3b1c6, inset -3px -3px 6px #ffffff;
}
.neu .thumb {
  background: #e0e5ec;
  box-shadow: 3px 3px 6px #a3b1c6, -3px -3px 6px #ffffff;
}`,
  },
  {
    label: "Skeuomorphic",
    surface: skeuomorphic.surface,
    html: switchHtml("skeuo"),
    css: `
.skeuo { color: oklch(0.25 0.02 255); }
.skeuo .track {
  background: oklch(0.62 0.012 255);
  box-shadow: inset 0 1px 3px oklch(0 0 0 / 0.35), 0 1px 0 oklch(1 0 0 / 0.6);
}
.skeuo :checked + .track { background: oklch(0.52 0.13 255); }
.skeuo .thumb {
  background: linear-gradient(to bottom, white, oklch(0.94 0 0));
  box-shadow: inset 0 1px 0 white, 0 1px 0 oklch(0.75 0 0),
    0 2px 3px oklch(0 0 0 / 0.35);
}`,
  },
  {
    label: "Glassmorphic",
    surface: glassSurface,
    html: switchHtml("glass"),
    css: `
.glass { color: white; }
.glass .track {
  background: oklch(1 0 0 / 0.18);
  box-shadow: inset 0 0 0 1px oklch(1 0 0 / 0.35);
  backdrop-filter: blur(12px);
}
.glass :checked + .track { background: oklch(1 0 0 / 0.45); }
.glass .thumb {
  background: oklch(1 0 0 / 0.92);
  box-shadow: 0 2px 6px oklch(0 0 0 / 0.2);
}`,
  },
]

const faq: Question[] = [
  {
    q: "What is the difference between skeuomorphism and neumorphism?",
    a: "Skeuomorphism makes a control look and behave like a real object: it has its own colour, one light source and real behaviour such as a key that travels when pressed. Neumorphism makes a control the same colour as the page and lifts it with one light and one dark soft shadow. The practical difference is contrast: skeuomorphic controls stand apart from the page, neumorphic ones blend into it.",
  },
  {
    q: "What is neumorphism in UI?",
    a: "Neumorphism, or soft UI, is a style that appeared on Dribbble around 2019. Buttons and cards are the same colour as the background and look extruded from it, drawn with a light shadow on one side and a dark shadow on the other. Pressed controls flip those shadows inward.",
  },
  {
    q: "Is neumorphism the same as neomorphism?",
    a: "Yes. Neomorphism is a common alternative spelling of neumorphism, a contraction of new skeuomorphism. Both names describe the same soft, same-colour extruded style.",
  },
  {
    q: "Is neumorphism accessible?",
    a: "Usually not as it's typically drawn. In the example on this page the label measures 2.91:1 against the button, below the 4.5:1 WCAG asks for text, and the switch thumb measures 1:1 against its track, so on and off look nearly alike. Giving the control its own colour and a darker label fixes most of it.",
  },
  {
    q: "What is the difference between skeuomorphism and flat design?",
    a: "Flat design removes depth and texture and shows controls with colour and type alone. Skeuomorphism keeps depth, light and physical behaviour, so you can see what is pressable and what state it's in. Flat suits dense, text-heavy screens; skeuomorphism suits the few controls where state or stakes matter, and the two mix well.",
  },
  {
    q: "What replaced skeuomorphism?",
    a: "Flat design. Microsoft's Metro style on Windows Phone 7 in 2010 and Apple's iOS 7 in 2013 dropped textures and simulated materials, and most of the industry followed. Google's Material Design, introduced in 2014, kept the flat look but added shadows for elevation back.",
  },
  {
    q: "What is glassmorphism?",
    a: "Glassmorphism is a style of frosted, translucent panels: a semi-transparent fill, a thin light border and backdrop-filter: blur() over a colourful background. It's a surface style rather than a control style, and its contrast depends on what sits behind the glass.",
  },
  {
    q: "Is Apple's Liquid Glass the same as glassmorphism?",
    a: "Not quite. Liquid Glass, introduced at WWDC in 2025, is a translucent material that also refracts and reflects what is behind it. It shares glassmorphism's translucency and has the same contrast risk over bright or busy content.",
  },
]

const th = "py-2 pr-4 font-semibold"

export default function SkeuomorphismVsNeumorphism() {
  return (
    <Post slug="skeuomorphism-vs-neumorphism">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            url: `${siteUrl}${postHref(post.slug)}`,
            image: `${siteUrl}/og/blog-${post.slug}.jpg`,
            author,
            about: ["Skeuomorphism", "Neumorphism", "Flat design", "Glassmorphism"],
          },
          faqData(faq),
        ]}
      />
      <p>
        <strong>Skeuomorphism</strong> makes a control look and behave like a real object.{" "}
        <strong>Neumorphism</strong> makes it look like a soft bump pushed out of the page.{" "}
        <strong>Flat design</strong> removes depth altogether. <strong>Glassmorphism</strong> puts it on a
        pane of frosted glass. The fastest way to see the difference is the same button in all four. Press
        each one:
      </p>
      <StyleRow styles={[flat, neumorphic, skeuomorphic, glass]} />
      <Note>
        <p className="font-semibold">Key takeaways</p>
        <ul className="mt-2">
          <li>The styles differ mostly in how they show depth, and that decides their contrast.</li>
          <li>
            Neumorphism&apos;s same-colour controls measure about 1:1 against the page; its typical grey label
            is 2.91:1, under WCAG&apos;s 4.5:1 for text.
          </li>
          <li>Glassmorphism&apos;s contrast changes with the backdrop: the same white label is 4.28:1 over violet and 1.80:1 over amber.</li>
          <li>Flat and skeuomorphic controls both pass; skeuomorphism also shows what can be pressed and what state it&apos;s in.</li>
          <li>Use flat for most of a screen and depth for the few controls where state or stakes matter.</li>
        </ul>
      </Note>

      <h2>Skeuomorphism vs neumorphism vs flat design vs glassmorphism</h2>
      <p>
        The four styles answer one question differently: how do you show that something is a control? Flat
        uses colour. Neumorphism uses soft shadows in the page&apos;s own colour. Skeuomorphism uses a real
        object&apos;s light, depth and travel. Glassmorphism uses layers you can see through.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 pr-4 font-medium text-muted-foreground"></th>
              <th className={th}>Flat</th>
              <th className={th}>Neumorphism</th>
              <th className={th}>Skeuomorphism</th>
              <th className="py-2 font-semibold">Glassmorphism</th>
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

      <h2>Contrast, measured</h2>
      <p>
        Measured against WCAG 2, flat and skeuomorphic controls pass and neumorphic and glass ones fail in
        places. WCAG asks for 4.5:1 for normal-size text (SC 1.4.3) and 3:1 for the parts of a control you
        need to see it and its state (SC 1.4.11). These are the ratios of the exact colours in the demos on
        this page, computed with the WCAG relative-luminance formula. Translucent layers are blended over
        their backdrop first, and glass is measured over both the violet and the amber disc.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[44rem] border-collapse text-left text-sm tabular-nums">
          <thead>
            <tr className="border-b">
              <th className="py-2 pr-4 font-medium text-muted-foreground">Contrast ratio</th>
              <th className={th}>Flat</th>
              <th className={th}>Neumorphic</th>
              <th className={th}>Skeuomorphic</th>
              <th className="py-2 font-semibold">Glassmorphic</th>
            </tr>
          </thead>
          <tbody>
            {contrast.map(([what, ...cells]) => (
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
      <p>
        A button with a text label doesn&apos;t strictly need its outline at 3:1, since the words say
        what it is. But a switch&apos;s thumb and track are the only way to see whether it is on, so they
        do. That is where neumorphism fails hardest: its thumb is the colour of its track.
      </p>

      <h2>What is flat design?</h2>
      <p>
        Flat design shows controls with colour and type alone, without shadows, gradients or texture. It
        took over in 2013, when iOS 7 dropped Apple&apos;s textures and most of the industry followed.
        It&apos;s fast, clean and scales to dense screens. Its weakness is the reason the other styles exist:
        a flat button and a flat label can look the same, so users have to learn what&apos;s clickable instead
        of seeing it.
      </p>
      <LabCode step={flat} />

      <h2>Skeuomorphism vs flat design</h2>
      <p>
        The difference between skeuomorphism and flat design is whether a control&apos;s shape carries
        information. Flat design moves that information into colour, position and words. Skeuomorphism
        keeps it in the object: raised means pressable, sunk means on, a cover means careful. Press the flat
        and skeuomorphic buttons above: the flat one changes colour, the skeuomorphic one moves. Most good
        interfaces now mix them, flat for the page and depth for the controls that matter.
      </p>

      <h2>What is neumorphism in UI?</h2>
      <p>
        Neumorphism (also spelled neomorphism, short for &ldquo;new skeuomorphism&rdquo;) draws controls in
        the same colour as the page and lifts them with one light and one dark soft shadow. It appeared on
        Dribbble around 2019. It looks calm in a mockup, and that&apos;s where most of it stayed. The
        problem is contrast. In the example above, the label is <strong>2.91:1</strong> against the button,
        under WCAG&apos;s 4.5:1 for text, the button&apos;s fill is identical to the page, and its dark
        shadow is only 1.72:1 against it. Pressed and unpressed states look almost the same.
      </p>
      <LabCode step={neumorphic} />
      <Note>
        If you like the softness of neumorphism, keep the soft shadows but give the control its own colour
        and a darker label. That fixes most of its accessibility problems, and it&apos;s halfway to
        skeuomorphism.
      </Note>

      <h2>Neumorphism vs skeuomorphism: the difference is contrast</h2>
      <p>
        Neumorphism and skeuomorphism both use light and shadow, but neumorphism shapes the page itself
        while skeuomorphism places an object on it. Skeuomorphism borrows from a real object: a key that
        stands up from the surface, has a side you can see, and sinks when you press it. The 2010-era version
        used it as decoration (leather calendars, felt card tables), which is why it got a bad name. The
        modern version, sometimes called{" "}
        <Link href={postHref("neo-skeuomorphism")} className={linkClass}>
          neo-skeuomorphism
        </Link>
        , uses depth only where it tells the user something: what can be pressed, what state a switch is in,
        which action is dangerous.
      </p>
      <LabCode step={skeuomorphic} />
      <p>
        The step-by-step version of this button, including dark mode, Tailwind and a whole kit of keys and
        switches from the same tokens, is in{" "}
        <Link href={postHref("skeuomorphic-button-css")} className={linkClass}>
          how to make a skeuomorphic button in CSS
        </Link>
        .
      </p>

      <h2>What is glassmorphism?</h2>
      <p>
        Glassmorphism is frosted, translucent panels: a semi-transparent fill, a thin light border and{" "}
        <code>backdrop-filter: blur()</code> over a colourful background. The name caught on around 2020.
        Apple&apos;s Liquid Glass, introduced in 2025, is a newer relative that also refracts and reflects
        what&apos;s behind it. Glass is a surface style rather than a control style, so it combines with the
        others: a glass panel can hold flat or skeuomorphic buttons.
      </p>
      <LabCode step={glass} />
      <p>
        Its contrast is not a property of the button at all. It belongs to whatever is behind the glass. The
        white label above is 4.28:1 over the violet and 1.80:1 where it crosses the amber disc. If you use
        glass, put it over quiet backdrops, raise the fill&apos;s opacity behind text, or check contrast
        against the brightest thing that can scroll underneath.
      </p>

      <h2>The same switch in four styles</h2>
      <p>
        A switch shows the styles&apos; differences more clearly than a button, because its only job is to
        show a state. All four use the same skeleton, a real checkbox with <code>role=&quot;switch&quot;</code>{" "}
        laid over a track and a thumb, and differ only in paint. Flip each one, with the mouse or with Tab
        and Space.
      </p>
      <PartRow css={switchSkeleton} parts={switches} caption="One skeleton, four paints. Each switch starts on." />
      <PartCode part={{ css: switchSkeleton, html: switchHtml("flat") }} />
      <h3>Flat</h3>
      <p>
        The track changes colour and the thumb slides. Clear, if a little anonymous: the white thumb is 3.64:1
        against the grey track and 5.54:1 against the blue.
      </p>
      <PartCode part={switches[0]!} markup={false} />
      <h3>Neumorphic</h3>
      <p>
        The track is pressed in and the thumb pushed out, both in the page&apos;s colour. Only the
        thumb&apos;s position tells you it&apos;s on, and the thumb is 1:1 against its track.
      </p>
      <PartCode part={switches[1]!} markup={false} />
      <h3>Skeuomorphic</h3>
      <p>
        A recessed track from the same light, a raised thumb with a side and a cast shadow, and a track that
        fills with colour when it&apos;s on. The thumb is 3.05:1 against the off track and 4.65:1 against the
        on track.
      </p>
      <PartCode part={switches[2]!} markup={false} />
      <h3>Glassmorphic</h3>
      <p>
        A pane of glass for a track that gets more opaque when it&apos;s on. Turning it on makes the thumb
        harder to see, not easier: 3.82:1 off and 2.20:1 on over the violet, and 1.70:1 and 1.40:1 over the
        amber.
      </p>
      <PartCode part={switches[3]!} markup={false} />

      <h2>Which one should you use?</h2>
      <p>Use flat for most of the screen and depth for the controls where state and stakes matter.</p>
      <ul>
        <li>
          <strong>Flat</strong> for lists, tables, forms and reading.
        </li>
        <li>
          <strong>Skeuomorphic</strong> for the few controls where state and stakes matter: a deploy switch,
          a spend meter, an on/off with consequences. Mixing the two is the point: depth stands out because
          the rest is flat.
        </li>
        <li>
          <strong>Glass</strong> for panels and bars that float over content, with the contrast checked
          against the brightest thing that can pass behind them.
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

      <Faq items={faq} />
    </Post>
  )
}
