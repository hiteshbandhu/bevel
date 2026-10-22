import type { Metadata } from "next"
import Link from "next/link"
import { Faq, faqData, type Question } from "@/components/blog/faq"
import { LabCode, LabRow, type LabStep } from "@/components/blog/css-lab"
import { PartCode, PartRow, type Part } from "@/components/blog/parts"
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

/** The kit: the light, the motion and a default key colour, set once on a container. */
const kit = {
  css: `
/* The light, the motion and the default key. Set once, on a container. */
.kit {
  --highlight: oklch(1 0 0 / 0.4);
  --shade: oklch(0 0 0 / 0.3);
  --gloss: linear-gradient(to bottom, oklch(1 0 0 / 0.18), transparent 60%);
  --recess: oklch(0.6 0.012 255);
  --well: oklch(0.86 0.008 255);
  --focus: oklch(0.55 0.15 255);
  --press: 100ms ease-out;
  --travel: 2px;
  --key: oklch(0.52 0.13 255);
  --ink: white;
}
/* At night the light dims and recesses darken. Objects keep their colour. */
.dark .kit {
  --highlight: oklch(1 0 0 / 0.2);
  --shade: oklch(0 0 0 / 0.6);
  --recess: oklch(0.42 0.012 255);
  --well: oklch(0.26 0.008 255);
  --focus: oklch(0.75 0.12 255);
}
@media (prefers-reduced-motion: reduce) {
  .kit { --press: 0s; }
}

/* A key: its side is its own colour, darkened. */
.key {
  --edge: color-mix(in oklch, var(--key), black 40%);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 0;
  border-radius: 0.625rem;
  background: var(--gloss), var(--key);
  color: var(--ink);
  font: 600 0.9375rem/1 system-ui, sans-serif;
  box-shadow:
    inset 0 1px 0 var(--highlight),
    0 1px 0 var(--edge),
    0 var(--travel) 0 var(--edge),
    0 calc(var(--travel) + 1px) 5px var(--shade);
  cursor: pointer;
  transition: translate var(--press), box-shadow var(--press);
}
.key:active:not(:disabled) {
  translate: 0 var(--travel);
  box-shadow: inset 0 1px 2px var(--shade), 0 1px 0 var(--highlight);
}
.key:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 3px;
}`,
  html: `<button class="key" type="button">Deploy</button>`,
}

const keys: Part[] = [
  { label: "Key", css: "", html: kit.html },
  {
    label: "Round key",
    css: `
/* A calculator or arcade key: a dome, so the gloss is round too. */
.key-round {
  --key: oklch(0.56 0.19 35);
  --travel: 3px;
  --gloss: radial-gradient(circle at 50% 30%, oklch(1 0 0 / 0.35), transparent 65%);
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  padding: 0;
  border-radius: 50%;
  font-size: 1.375rem;
}`,
    html: `<button class="key key-round" type="button" aria-label="Equals">=</button>`,
  },
  {
    label: "Graphite key",
    css: `
/* A dark key reflects less of the same light. */
.key-graphite {
  --key: oklch(0.3 0.012 255);
  --ink: oklch(0.93 0 0);
  --highlight: oklch(1 0 0 / 0.2);
}`,
    html: `<button class="key key-graphite" type="button">Esc</button>`,
  },
  {
    label: "Key with an LED",
    css: `
/* A latching key: a checkbox inside it holds the state. While it's on,
   the key stays down and its lamp is lit. */
.key-led {
  position: relative;
}
.key-led input {
  position: absolute;
  inset: 0;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}
.key-led:has(:checked) {
  translate: 0 var(--travel);
  box-shadow: inset 0 1px 2px var(--shade), 0 1px 0 var(--highlight);
}
.key-led:has(:focus-visible) {
  outline: 2px solid var(--focus);
  outline-offset: 3px;
}
.led {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: oklch(0.4 0.04 145);
  box-shadow: inset 0 1px 1px var(--shade);
  transition: background-color var(--press), box-shadow var(--press);
}
.key-led:has(:checked) .led {
  background: oklch(0.85 0.2 145);
  box-shadow: 0 0 6px oklch(0.85 0.2 145);
}`,
    html: `<label class="key key-graphite key-led">
  <input type="checkbox" role="switch" checked>
  <span class="led"></span>
  Live
</label>`,
  },
  {
    label: "Disabled",
    css: `
/* Disabled: no travel and no gloss, so it no longer looks pressable. */
.key:disabled {
  --travel: 0px;
  --gloss: none;
  opacity: 0.55;
  filter: saturate(0.3);
  cursor: not-allowed;
}`,
    html: `<button class="key" type="button" disabled>Deploy</button>`,
  },
]

const controls: Part[] = [
  {
    label: "Toggle switch",
    css: `
/* A switch is a recess with a small key sliding in it. */
.toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font: 600 0.9375rem/1 system-ui, sans-serif;
  cursor: pointer;
}
.toggle input {
  position: absolute;
  inset: 0;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}
.toggle-track {
  display: block;
  width: 3rem;
  padding: 0.1875rem;
  border-radius: 999px;
  background-color: var(--recess);
  box-shadow: inset 0 1px 3px var(--shade), 0 1px 0 var(--highlight);
  transition: background-color var(--press);
}
.toggle-thumb {
  display: block;
  width: 1.375rem;
  height: 1.375rem;
  border-radius: 50%;
  background: var(--gloss), oklch(0.98 0 0);
  box-shadow:
    inset 0 1px 0 var(--highlight),
    0 1px 0 oklch(0.78 0 0),
    0 2px 3px var(--shade);
  transition: translate var(--press);
}
.toggle :checked + .toggle-track {
  background-color: var(--key);
}
.toggle :checked + .toggle-track .toggle-thumb {
  translate: 1.25rem 0;
}
.toggle:has(:focus-visible) .toggle-track {
  outline: 2px solid var(--focus);
  outline-offset: 3px;
}`,
    html: `<label class="toggle">
  <input type="checkbox" role="switch" checked>
  <span class="toggle-track"><span class="toggle-thumb"></span></span>
  Sync
</label>`,
  },
  {
    label: "Segmented control",
    css: `
/* A pill-shaped well. The chosen segment rises out of it as a key. */
.segmented {
  position: relative;
  display: inline-flex;
  margin: 0;
  padding: 0.25rem;
  border: 0;
  border-radius: 999px;
  background-color: var(--well);
  box-shadow: inset 0 1px 3px var(--shade), 0 1px 0 var(--highlight);
}
.segmented legend {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.segment {
  --edge: color-mix(in oklch, var(--key), black 40%);
  position: relative;
  padding: 0.5rem 0.875rem;
  border-radius: 999px;
  font: 600 0.875rem/1 system-ui, sans-serif;
  cursor: pointer;
}
.segment input {
  position: absolute;
  inset: 0;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}
.segment:has(:checked) {
  background: var(--gloss), var(--key);
  color: var(--ink);
  box-shadow:
    inset 0 1px 0 var(--highlight),
    0 1px 0 var(--edge),
    0 2px 3px var(--shade);
}
.segment:has(:focus-visible) {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}`,
    html: `<fieldset class="segmented">
  <legend>View</legend>
  <label class="segment"><input type="radio" name="view" checked>Day</label>
  <label class="segment"><input type="radio" name="view">Week</label>
  <label class="segment"><input type="radio" name="view">Month</label>
</fieldset>`,
  },
]

const overrides: [string, string][] = [
  ["Key", "Nothing. It reads every token as set on .kit."],
  ["Round key", "--key, --travel and --gloss, plus its shape"],
  ["Graphite key", "--key, --ink and --highlight"],
  ["Key with an LED", "Adds a lamp and a latched state; colours from the graphite key"],
  ["Disabled", "--travel and --gloss, set to nothing"],
  ["Toggle switch", "Uses --recess for the track and --key once it's on"],
  ["Segmented control", "Uses --well for the groove and --key for the chosen segment"],
]

const faq: Question[] = [
  {
    q: "How do you make a button look 3D in CSS?",
    a: "Stack box shadows from one light source above the screen: an inset 1px highlight on the top edge, two hard shadows 1px and 2px down in a darker shade of the button's colour for its side, and one soft shadow for its shadow on the surface. Add a top-to-bottom gradient for the gloss. No images are needed.",
  },
  {
    q: "How do you make a pressed button effect in CSS?",
    a: "On :active, move the button down by the depth of its side with translate (2px here) and swap its raised shadows for an inset one. Transition only translate and box-shadow, over about 100ms, and turn the transition off under prefers-reduced-motion.",
  },
  {
    q: "What CSS properties are used for skeuomorphism?",
    a: "Mostly box-shadow (inset and outset, stacked), linear-gradient and radial-gradient for light on the surface, translate for travel, and custom properties to keep every shadow on the same light source. text-shadow and color-mix help with labels and darker sides.",
  },
  {
    q: "Can you build skeuomorphic buttons with Tailwind CSS?",
    a: "Yes. In Tailwind v4, define the shadows once with @utility (for example key-raised and key-pressed), then put colour, travel and focus in classes on the element: active:translate-y-0.5, active:key-pressed and motion-reduce:transition-none.",
  },
  {
    q: "How do you make a skeuomorphic toggle switch in CSS?",
    a: "Use a real checkbox with role=\"switch\" inside a label, laid invisibly over the control. Draw the track as a recess with an inset shadow, draw the thumb as a small raised key, and move it with translate when the checkbox is :checked. Show focus with :has(:focus-visible).",
  },
  {
    q: "Are skeuomorphic buttons accessible?",
    a: "They can be. Use real button and input elements, keep label text at 4.5:1 against the key, keep the key and its state at 3:1 against what's around them, give every control a visible focus outline outside its shadows, and stop the motion for people who ask for reduced motion.",
  },
]

export default function SkeuomorphicButtonCss() {
  return (
    <Post slug="skeuomorphic-button-css">
      <JsonLd
        data={[
          {
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
          },
          faqData(faq),
        ]}
      />
      <p>
        A skeuomorphic button looks like a physical key: it has a lit top edge, a side, a shadow on the
        surface it sits on, and it sinks when you press it. You need about 30 lines of CSS and no images.
        Here are the four steps, each one live, so you can press the result of every stage.
      </p>
      <LabRow steps={steps} />
      <Note>
        <p className="font-semibold">Key takeaways</p>
        <ul className="mt-2">
          <li>Put the light in custom properties: one highlight, one shade. Every shadow reads from them.</li>
          <li>Two hard shadows, 1px and 2px down, give a key its side. A single soft shadow only makes it float.</li>
          <li>Press with <code>translate</code> and <code>box-shadow</code>, never with margin, padding or height.</li>
          <li>Dark mode dims the light. It doesn&apos;t invert the object.</li>
          <li>The same tokens build round keys, dark keys, lit keys, switches and segmented controls.</li>
        </ul>
      </Note>

      <h2>Skeuomorphism CSS: the four layers</h2>
      <p>
        A skeuomorphic button is built from four layers: one light source, depth, material and travel.
        Skeuomorphism means borrowing the look of a real object, and for a button the useful part is that
        its shape tells you things. A raised key says <em>press me</em>. A key that sinks says{" "}
        <em>that worked</em>. Flat design keeps the label and drops those signals. The four layers bring
        them back without textures:
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
        Start with a <code>&lt;button&gt;</code>, not a <code>div</code>. You get keyboard support, focus and
        the right role for free, and everything after this is paint.
      </p>
      <LabCode step={steps[0]!} />

      <h2>Step 2: pick one light and build the depth</h2>
      <p>
        Depth is four stacked shadows that all read from the same light. Put the light in three custom
        properties: a highlight, a shade, and the colour of the key&apos;s side, a darker version of the
        face. The inset shadow lights the top edge. The two hard ones, 1px and 2px down, draw the side of
        the key. The soft one is its shadow on the surface.
      </p>
      <LabCode step={steps[1]!} />
      <Note>
        The hard 1px and 2px shadows are the trick most tutorials miss. A single blurry drop shadow makes a
        button float. Two solid offsets give it a side, so it reads as a key with thickness.
      </Note>

      <h2>Step 3: add the material</h2>
      <p>
        The material is one gradient: light hitting a glossy surface from above is brightest at the top.
        Avoid texture images. They cost a request, blur on high-density screens and fight with dark mode. A
        dark text shadow just above the label makes it look printed into the key.
      </p>
      <LabCode step={steps[2]!} />

      <h2>Step 4: make it press</h2>
      <p>
        A press moves the key down by the depth of its side and flattens its shadows. On{" "}
        <code>:active</code>, translate it 2px and swap the raised shadows for an inset one, as if it now
        sits level with the surface. Animate only <code>translate</code> and <code>box-shadow</code>, never{" "}
        <code>margin</code>, <code>padding</code> or <code>top</code>, which make the browser lay out the page
        again on every frame. Keep it fast: 100ms feels like a key; 300ms feels like a slow lift.
      </p>
      <LabCode step={steps[3]!} />
      <p>
        The focus ring matters more on a skeuomorphic button than a flat one. The shadows already use
        contrast, so a keyboard user needs an outline that clearly sits outside them.
      </p>

      <h2>Dark mode: dim the light, don&apos;t invert the object</h2>
      <p>
        In dark mode, change the light and leave the object alone. A blue key is still a blue key at night.
        What changes is the light: highlights get weaker and shadows get deeper. Because the light lives in
        custom properties, dark mode is two lines.
      </p>
      <LabCode step={darkMode} />

      <h2>One set of custom properties, a whole kit of controls</h2>
      <p>
        Once the light lives in custom properties, every other control is a few overrides. Below, the tokens
        sit on one container, <code>.kit</code>, and a single <code>.key</code> rule reads them. Each variant
        changes only what makes it different. Press them, and switch the site to dark mode: the light
        changes, the objects don&apos;t.
      </p>
      <PartRow css={kit.css} parts={keys} className="kit grid-cols-2 md:grid-cols-5" caption="Five keys from one set of tokens. Press them; the Live key latches." />
      <p>
        Here is the shared part. The key&apos;s side is no longer a fixed colour: <code>color-mix()</code>{" "}
        darkens whatever <code>--key</code> is, so a new key colour gets a matching side for free. The shadow
        offsets read <code>--travel</code>, so a deeper key presses further. Motion is a token too, which
        lets reduced motion turn every transition off in one line.
      </p>
      <PartCode part={kit} />

      <h3>A round key</h3>
      <p>
        A round key is the same key with a new shape and a domed gloss. A calculator or arcade key is
        convex, so the light becomes a radial gradient near the top instead of a slope, and a taller key
        travels 3px instead of 2px. Because the symbol is not a word, it gets an <code>aria-label</code>.
      </p>
      <PartCode part={keys[1]!} />

      <h3>A graphite key</h3>
      <p>
        A dark key changes three tokens: its colour, its label, and how much light it reflects. A
        near-black surface shows a weaker highlight than a coloured one, so <code>--highlight</code> drops to
        20%. Its side comes from <code>color-mix()</code> as before.
      </p>
      <PartCode part={keys[2]!} />

      <h3>A key with an LED</h3>
      <p>
        A key that stays on needs state, and a checkbox holds it without JavaScript. Put a checkbox with{" "}
        <code>role=&quot;switch&quot;</code> inside a label, lay it invisibly over the key, and style the key
        with <code>:has(:checked)</code>: it stays down and its lamp lights. Screen readers announce it as a
        switch, on or off, and the label text is its name.
      </p>
      <PartCode part={keys[3]!} />

      <h3>The disabled state</h3>
      <p>
        A disabled key should stop looking pressable. Set <code>--travel</code> to zero and drop the gloss,
        so it sits low and matte, then fade and desaturate it. The base rule only presses keys that
        aren&apos;t disabled, so it doesn&apos;t move either. WCAG&apos;s text contrast rule doesn&apos;t
        apply to inactive controls, but if people need to read the label, keep it legible.
      </p>
      <PartCode part={keys[4]!} />

      <h2>A skeuomorphic toggle switch and segmented control in CSS</h2>
      <p>
        Switches and segmented controls are recesses with keys in them, so they use the same tokens. The
        track and the well are cut into the surface: an inset shadow from the same light. The thumb and the
        chosen segment are small raised keys. Both are real form controls (a checkbox and a group of radio
        buttons), so the keyboard works: Space flips the switch, arrow keys move between segments.
      </p>
      <PartRow parts={controls} className="kit" caption="A switch and a segmented control, built from the same tokens as the keys." />
      <h3>The toggle switch</h3>
      <p>
        The thumb moves with <code>translate</code>, so the switch never changes size. When it&apos;s on, the
        recess fills with <code>--key</code>. Against the off track the white thumb measures 3.7:1 in light
        mode, above WCAG&apos;s 3:1 for the parts of a control you need to see its state.
      </p>
      <PartCode part={controls[0]!} />
      <h3>The segmented control</h3>
      <p>
        A <code>fieldset</code> of radio buttons is the native segmented control: one choice, arrow keys,
        a group name from its <code>legend</code>. The legend is hidden visually but still read out.
      </p>
      <PartCode part={controls[1]!} />

      <h3>What each part changes</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 pr-4 font-semibold">Part</th>
              <th className="py-2 font-semibold">What it overrides</th>
            </tr>
          </thead>
          <tbody>
            {overrides.map(([part, what]) => (
              <tr key={part} className="border-b align-top">
                <th className="py-2 pr-4 font-medium">{part}</th>
                <td className="py-2">{what}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Skeuomorphism in Tailwind CSS v4</h2>
      <p>
        In Tailwind v4, put the depth in a utility with <code>@utility</code> so it can&apos;t drift, and keep
        the press in classes next to the markup:
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
          soft shadows look calm and are hard to see. Keep label text at 4.5:1 against the key, and the key
          clearly apart from the surface.
        </li>
        <li>
          <strong>Animating layout.</strong> Growing <code>padding</code> or <code>height</code> on press
          relays out the page on every frame. In Bevel, adding a card to a wallet cost 678ms of main-thread
          work with a height transition and 94ms with transforms instead.
        </li>
        <li>
          <strong>State shown only by depth.</strong> A key that stays down is a strong signal, but not one
          a screen reader can see. Use a real checkbox or <code>aria-pressed</code>, as the LED key does.
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
        , compare{" "}
        <Link href={postHref("skeuomorphism-vs-neumorphism")} className={linkClass}>
          skeuomorphism with neumorphism and flat design
        </Link>
        , or read{" "}
        <Link href={postHref("skeuomorphism-is-back")} className={linkClass}>
          why skeuomorphism is back
        </Link>
        .
      </p>

      <Faq items={faq} />
    </Post>
  )
}
