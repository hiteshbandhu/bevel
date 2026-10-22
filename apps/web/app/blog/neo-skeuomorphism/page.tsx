import type { Metadata } from "next"
import Link from "next/link"
import { Faq, faqData, type Question } from "@/components/blog/faq"
import { PartCode, PartRow, type Part } from "@/components/blog/parts"
import { AnnunciatorAgent } from "@/components/demos/annunciator-agent"
import { DetentKnobEffort } from "@/components/demos/detent-knob-effort"
import { DipSwitchFlags } from "@/components/demos/dip-switch-flags"
import { GuardedSwitchDeploy } from "@/components/demos/guarded-switch-deploy"
import { KeysortFilterContracts } from "@/components/demos/keysort-filter-contracts"
import { MeterLiveUsage } from "@/components/demos/meter-live-usage"
import { NumberWheelCounter } from "@/components/demos/number-wheel-counter"
import { SplitFlapDeploys } from "@/components/demos/split-flap-deploys"
import { VigilanceAgent } from "@/components/demos/vigilance-agent"
import { JsonLd, author } from "@/components/json-ld"
import { Post, Specimen } from "@/components/post"
import { Note, linkClass } from "@/components/prose"
import { postHref, posts } from "@/lib/blog"
import { preview } from "@/lib/og"
import { siteUrl } from "@/lib/site"

const post = posts.find((p) => p.slug === "neo-skeuomorphism")!

export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  ...preview({ title: post.title, description: post.description, image: `blog-${post.slug}.jpg`, path: postHref(post.slug), type: "article" }),
}

/** The same switch twice: flat, then neo-skeuomorphic. Both are a real checkbox with role="switch". */
const before: Part = {
  label: "Before: flat",
  css: `
.flat-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font: 600 0.9375rem/1 system-ui, sans-serif;
  cursor: pointer;
}
.flat-toggle input {
  position: absolute;
  inset: 0;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}
.flat-track {
  display: block;
  width: 3rem;
  padding: 0.1875rem;
  border-radius: 999px;
  background: oklch(0.78 0.01 255);
  transition: background-color 150ms ease-out;
}
.flat-thumb {
  display: block;
  width: 1.375rem;
  height: 1.375rem;
  border-radius: 50%;
  background: white;
  transition: translate 150ms ease-out;
}
.flat-toggle :checked + .flat-track { background: oklch(0.7 0.17 150); }
.flat-toggle :checked + .flat-track .flat-thumb { translate: 1.25rem 0; }
.flat-toggle:has(:focus-visible) .flat-track {
  outline: 2px solid currentColor;
  outline-offset: 3px;
}
@media (prefers-reduced-motion: reduce) {
  .flat-track, .flat-thumb { transition: none; }
}`,
  html: `<label class="flat-toggle">
  <input type="checkbox" role="switch">
  <span class="flat-track"><span class="flat-thumb"></span></span>
  Auto-deploy
</label>`,
}

const after: Part = {
  label: "After: neo-skeuomorphic",
  css: `
.neo-toggle {
  --highlight: oklch(1 0 0 / 0.5);
  --shade: oklch(0 0 0 / 0.3);
  --recess: oklch(0.6 0.012 255);
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font: 600 0.9375rem/1 system-ui, sans-serif;
  cursor: pointer;
}
.dark .neo-toggle {
  --highlight: oklch(1 0 0 / 0.15);
  --shade: oklch(0 0 0 / 0.6);
  --recess: oklch(0.42 0.012 255);
}
.neo-toggle input {
  position: absolute;
  inset: 0;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}
/* The track is cut into the surface. */
.neo-track {
  display: block;
  width: 3rem;
  padding: 0.1875rem;
  border-radius: 999px;
  background: var(--recess);
  box-shadow: inset 0 1px 3px var(--shade), 0 1px 0 var(--highlight);
  transition: background-color 150ms ease-out;
}
/* The thumb is a small key with a side and a shadow. */
.neo-thumb {
  display: block;
  width: 1.375rem;
  height: 1.375rem;
  border-radius: 50%;
  background: linear-gradient(to bottom, white, oklch(0.94 0 0));
  box-shadow: inset 0 1px 0 white, 0 1px 0 oklch(0.75 0 0), 0 2px 3px var(--shade);
  transition: translate 150ms ease-out;
}
/* A lamp and a printed word say the state, not only the colour. */
.neo-lamp {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: oklch(0.45 0.03 145);
  box-shadow: inset 0 1px 1px var(--shade);
}
.neo-state::after {
  content: "Off";
  font: 600 0.6875rem/1 ui-monospace, monospace;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.7;
}
.neo-toggle :checked + .neo-track { background: oklch(0.5 0.13 150); }
.neo-toggle :checked + .neo-track .neo-thumb { translate: 1.25rem 0; }
.neo-toggle:has(:checked) .neo-lamp {
  background: oklch(0.85 0.2 145);
  box-shadow: 0 0 6px oklch(0.85 0.2 145);
}
.neo-toggle:has(:checked) .neo-state::after { content: "On"; }
.neo-toggle:has(:focus-visible) .neo-track {
  outline: 2px solid currentColor;
  outline-offset: 3px;
}
@media (prefers-reduced-motion: reduce) {
  .neo-track, .neo-thumb { transition: none; }
}`,
  html: `<label class="neo-toggle">
  <input type="checkbox" role="switch">
  <span class="neo-track"><span class="neo-thumb"></span></span>
  Auto-deploy
  <span class="neo-lamp" aria-hidden="true"></span>
  <span class="neo-state" aria-hidden="true"></span>
</label>`,
}

const faq: Question[] = [
  {
    q: "What is neo-skeuomorphism?",
    a: "Neo-skeuomorphism is a design approach that brings light, depth and physical behaviour back to interface controls, but only where they carry meaning. Pages and text stay flat; switches, knobs, meters and dangerous actions get a body that shows their state and stakes at a glance.",
  },
  {
    q: "What is skeuomorphism 2.0?",
    a: "Skeuomorphism 2.0 is another name for neo-skeuomorphism, or modern skeuomorphism. Where the skeuomorphism of 2007 to 2012 copied materials such as leather and felt, the 2.0 version copies behaviour: travel, detents, covers, needles and lamps.",
  },
  {
    q: "Is skeuomorphism coming back?",
    a: "Yes, in a restrained form. Light, depth and physical behaviour are returning to controls that carry meaning, while layouts and text stay flat. Apple's Liquid Glass, introduced in 2025, put highlights and depth back into iOS. The textures of 2010 are not coming back.",
  },
  {
    q: "What replaced skeuomorphism?",
    a: "Flat design replaced it. Microsoft's Metro style on Windows Phone 7 in 2010 and Apple's iOS 7 in 2013 removed textures and simulated materials, and most of the industry followed. Neo-skeuomorphism is a partial return: depth for the controls that need it, flat for everything else.",
  },
  {
    q: "What's the difference between neo-skeuomorphism and neumorphism?",
    a: "Neumorphism makes controls the same colour as the page and lifts them with soft shadows, which lowers contrast. Neo-skeuomorphism gives controls their own colour, a clear light source and real behaviour, such as travel and detents.",
  },
  {
    q: "Is skeuomorphism bad for accessibility?",
    a: "Not if it's built well. A raised, high-contrast control is often easier to find than a flat one. The risks are low contrast and state shown only through visuals. Fix both by keeping contrast high, stating every state in text, and using real form controls underneath.",
  },
  {
    q: "Does skeuomorphic UI hurt performance?",
    a: "Only when it uses images or animates layout. CSS gradients and shadows are cheap, and motion that only uses transform and opacity stays smooth.",
  },
]

export default function NeoSkeuomorphism() {
  return (
    <Post slug="neo-skeuomorphism">
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
            about: ["Neo-skeuomorphism", "Skeuomorphism", "UI design"],
          },
          faqData(faq),
        ]}
      />
      <p>
        <strong>Neo-skeuomorphism</strong>, also called skeuomorphism 2.0 or modern skeuomorphism, is the
        return of light, depth and physical behaviour to interfaces, used where it means something instead
        of everywhere. The page stays flat; the controls that matter get a body: a switch you can see is
        on, a meter that runs while it costs you, a cover over the button you mustn&apos;t press by accident.
      </p>
      <p>Every example on this page is a working React component or a few lines of CSS. Use them.</p>
      <Note>
        <p className="font-semibold">Key takeaways</p>
        <ul className="mt-2">
          <li>Neo-skeuomorphism copies how objects behave, not what they&apos;re made of.</li>
          <li>Depth has to carry information: raised means pressable, sunk means on, a cover means careful.</li>
          <li>Keep the page flat and give depth to the few controls where state or stakes matter.</li>
          <li>Unlike neumorphism, controls keep their own colour, so contrast stays high.</li>
          <li>Every state is also said in words, for screen readers and for anyone glancing.</li>
        </ul>
      </Note>
      <Specimen slug="meter">
        <MeterLiveUsage />
      </Specimen>

      <h2>Flat vs neo-skeuomorphic: the same switch</h2>
      <p>
        The quickest way to see neo-skeuomorphism is one control before and after. Both switches below are
        the same checkbox with <code>role=&quot;switch&quot;</code>. The flat one shows its state with colour
        alone: its white thumb measures 2.00:1 against the grey track and 2.49:1 against the green, under
        the 3:1 WCAG asks for the parts of a control that show its state. The neo-skeuomorphic one cuts the
        track into the surface, makes the thumb a small key, and adds a lamp and a printed word. In light mode
        its thumb measures 3.31:1 off and 4.74:1 on, and you can read its state without relying on colour.
      </p>
      <PartRow parts={[before, after]} caption="The same switch, flat and neo-skeuomorphic. Flip both." />
      <PartCode part={before} />
      <PartCode part={after} />
      <p>
        The lamp and the word are <code>aria-hidden</code> because the checkbox already tells screen
        readers whether it is on. They exist for sighted people who don&apos;t want to decode a colour.
      </p>

      <h2>How neo-skeuomorphism differs from the old skeuomorphism</h2>
      <p>
        Old skeuomorphism copied materials; neo-skeuomorphism copies behaviour. The skeuomorphism of
        2007–2012 put leather on the calendar, felt on the card table and torn paper in the notes app. The
        materials were the point, and they didn&apos;t make anything easier to use. When iOS 7 removed them
        in 2013, very little was lost.
      </p>
      <p>
        A rotary knob that clicks into four positions tells you there are four choices and which one is set,
        before you read a word. That is information a flat dropdown hides until you open it.
      </p>
      <Specimen slug="detent-knob">
        <DetentKnobEffort />
      </Specimen>

      <h2>How it differs from neumorphism</h2>
      <p>
        Neumorphism is a separate style, not an early version of this one, and it mostly failed on contrast.
        It appeared around 2019 and made controls look like soft bumps pressed out of a single-colour page.
        Controls the same colour as the page are hard to see and fail accessibility checks.
        Neo-skeuomorphic controls stand apart from their surface, like real objects do. There&apos;s a
        side-by-side with measured contrast in{" "}
        <Link href={postHref("skeuomorphism-vs-neumorphism")} className={linkClass}>
          skeuomorphism vs neumorphism vs flat design
        </Link>
        .
      </p>

      <h2>Is skeuomorphism coming back? Why now</h2>
      <p>Yes, for four reasons, and none of them is nostalgia.</p>
      <ul>
        <li>
          <strong>Screens got good enough.</strong> On high-density displays, a 1px highlight and a soft
          shadow look like light, not like a filter. Depth no longer needs textures to be convincing.
        </li>
        <li>
          <strong>Apple went back to light.</strong> Liquid Glass, introduced in 2025, put refraction,
          highlights and depth back into the most copied interface in the world.
        </li>
        <li>
          <strong>Software acts on its own.</strong> Deploys, payments and AI agents keep running after you
          look away. Interfaces like that need to show state and stakes at a glance, and physical controls
          were designed to do exactly that.
        </li>
        <li>
          <strong>Flat products started to look the same.</strong> When every app is built from the same
          default components, a control with weight and character is memorable.
        </li>
      </ul>

      <h2>The five rules of neo-skeuomorphism</h2>
      <ol>
        <li>
          <strong>One light source.</strong> All highlights and shadows agree, so different objects sit
          together on one surface.
        </li>
        <li>
          <strong>Depth has to mean something.</strong> Raised means pressable, sunk means on or done, a
          cover means dangerous. If depth doesn&apos;t carry information, leave the element flat.
        </li>
        <li>
          <strong>Behaviour before texture.</strong> Travel, detents, flaps and needles do more than any
          material. A switch that throws is worth more than a switch with brushed metal.
        </li>
        <li>
          <strong>Flat page, tactile controls.</strong> The contrast is what makes the controls stand out.
          A whole screen of objects is the 2010 mistake again.
        </li>
        <li>
          <strong>Never only visual.</strong> Say the state in words for screen readers, keep text contrast
          high, and respect reduced motion: things change state immediately instead of animating.
        </li>
      </ol>
      <Specimen slug="dip-switch">
        <DipSwitchFlags />
      </Specimen>

      <h2>Neo-skeuomorphism examples, and the job each one does</h2>
      <p>
        A good neo-skeuomorphic control borrows an object because the object already solved a problem. Each
        one below is modelled on a real machine, and each does one job a flat control does badly.
      </p>
      <h3>Guarded switch: make a dangerous action take two moves</h3>
      <p>
        A cover over the switch means you can&apos;t flip it by accident: you lift the cover, then flip. If
        you walk away, the cover drops and the switch goes back to safe. It replaces the confirm dialog
        people click through without reading.
      </p>
      <Specimen slug="guarded-switch">
        <GuardedSwitchDeploy />
      </Specimen>
      <h3>Annunciator: alerts that wait until someone has seen them</h3>
      <p>
        A panel of lamps where every new alarm flashes until it&apos;s acknowledged, then stays lit while the
        condition lasts. An alarm that clears before anyone looks keeps flashing, so nothing passes
        unnoticed. A toast that fades after five seconds can&apos;t promise that.
      </p>
      <Specimen slug="annunciator">
        <AnnunciatorAgent />
      </Specimen>
      <h3>Vigilance control: keep a person in the loop</h3>
      <p>
        A supervised run keeps going only while someone checks in. Miss the window and it warns, then
        pauses. It suits AI agents that act on their own: supervision becomes something you do, not a
        setting you forget.
      </p>
      <Specimen slug="vigilance">
        <VigilanceAgent />
      </Specimen>
      <h3>Keysort filter: AND filtering you can see</h3>
      <p>
        Edge-notched cards with a hole per attribute. Push needles through the tags you want and only the
        cards notched for all of them fall free. You see why each record matched, which a list of filter
        chips doesn&apos;t show.
      </p>
      <Specimen slug="keysort-filter">
        <KeysortFilterContracts />
      </Specimen>
      <h3>Number wheel: a count you can watch change</h3>
      <p>
        Printed drums that roll to each digit, lowest first, like an odometer. When a number changes you see
        it move and by roughly how much, instead of a figure that silently swaps.
      </p>
      <Specimen slug="number-wheel">
        <NumberWheelCounter />
      </Specimen>
      <h3>Split-flap board: live status at a glance</h3>
      <p>
        A departure board that flips when a deploy moves. The movement draws the eye to what just changed,
        and the board reads from across a room.
      </p>
      <Specimen slug="split-flap">
        <SplitFlapDeploys />
      </Specimen>

      <h2>Where neo-skeuomorphism works best</h2>
      <ul>
        <li>
          <strong>Settings with a few fixed steps</strong>: effort levels, plans, modes. A knob or a lever
          shows every option at once.
        </li>
        <li>
          <strong>Feature flags and toggles</strong> that should be scannable at a glance, like a bank of
          DIP switches.
        </li>
        <li>
          <strong>Live status</strong>: a departure board that flips when a deploy moves, a meter for spend.
        </li>
        <li>
          <strong>Dangerous actions</strong>: deploy to production, delete, send money. A cover beats a
          confirm dialog.
        </li>
        <li>
          <strong>Alerts and supervision</strong>: lamps that wait for acknowledgement, a check-in for a
          running agent.
        </li>
      </ul>

      <h2>How to start</h2>
      <p>
        Build one control by hand to learn the light and depth:{" "}
        <Link href={postHref("skeuomorphic-button-css")} className={linkClass}>
          how to make a skeuomorphic button in CSS and Tailwind
        </Link>{" "}
        takes you from a flat button to one that presses, then builds keys, a switch and a segmented control
        from the same tokens. Or install finished controls:{" "}
        <Link href="/components" className={linkClass}>
          Bevel
        </Link>{" "}
        is an open-source library of neo-skeuomorphic React components, each modelled on a real object and
        installed with the shadcn CLI.
      </p>

      <Faq items={faq} />
    </Post>
  )
}
