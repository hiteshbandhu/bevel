import type { Metadata } from "next"
import Link from "next/link"
import { DetentKnobEffort } from "@/components/demos/detent-knob-effort"
import { DipSwitchFlags } from "@/components/demos/dip-switch-flags"
import { MeterLiveUsage } from "@/components/demos/meter-live-usage"
import { SplitFlapDeploys } from "@/components/demos/split-flap-deploys"
import { JsonLd, author } from "@/components/json-ld"
import { Post, Specimen } from "@/components/post"
import { linkClass } from "@/components/prose"
import { postHref, posts } from "@/lib/blog"
import { preview } from "@/lib/og"
import { siteUrl } from "@/lib/site"

const post = posts.find((p) => p.slug === "neo-skeuomorphism")!

export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  ...preview({ title: post.title, description: post.description, image: `blog-${post.slug}.jpg`, path: postHref(post.slug), type: "article" }),
}

export default function NeoSkeuomorphism() {
  return (
    <Post slug="neo-skeuomorphism">
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
          about: ["Neo-skeuomorphism", "Skeuomorphism", "UI design"],
        }}
      />
      <p>
        <strong>Neo-skeuomorphism</strong>, also called skeuomorphism 2.0 or modern skeuomorphism, is the
        return of light, depth and physical behaviour to interfaces, used where it means something instead
        of everywhere. The page stays flat; the controls that matter get a body: a switch you can see is
        on, a meter that runs while it costs you, a cover over the button you mustn&apos;t press by accident.
      </p>
      <p>Every example on this page is a working React component. Use them.</p>
      <Specimen slug="meter">
        <MeterLiveUsage />
      </Specimen>

      <h2>How it differs from the old skeuomorphism</h2>
      <p>
        The skeuomorphism of 2007–2012 copied materials: leather on the calendar, felt on the card table,
        torn paper in the notes app. The materials were the point, and they didn&apos;t make anything easier
        to use. When iOS 7 removed them in 2013, very little was lost.
      </p>
      <p>
        Neo-skeuomorphism copies <em>behaviour</em>. A rotary knob that clicks into four positions tells you
        there are four choices and which one is set, before you read a word. That is information a flat
        dropdown hides until you open it.
      </p>
      <Specimen slug="detent-knob">
        <DetentKnobEffort />
      </Specimen>

      <h2>How it differs from neumorphism</h2>
      <p>
        Neumorphism (2019–2020) looked like soft bumps pressed out of a single-colour page. It is a style of
        its own rather than an early version of this one, and it mostly failed for one reason: contrast.
        Controls the same colour as the page are hard to see and fail accessibility checks.
        Neo-skeuomorphic controls stand apart from their surface, like real objects do. There&apos;s a
        side-by-side, with code, in{" "}
        <Link href={postHref("skeuomorphism-vs-neumorphism")} className={linkClass}>
          skeuomorphism vs neumorphism vs flat design
        </Link>
        .
      </p>

      <h2>Why it&apos;s coming back now</h2>
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

      <h2>Where it works best</h2>
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
      </ul>
      <Specimen slug="split-flap">
        <SplitFlapDeploys />
      </Specimen>

      <h2>How to start</h2>
      <p>
        Build one control by hand to learn the light and depth:{" "}
        <Link href={postHref("skeuomorphic-button-css")} className={linkClass}>
          how to make a skeuomorphic button in CSS and Tailwind
        </Link>{" "}
        takes you from a flat button to one that presses, in four steps. Or install finished controls:{" "}
        <Link href="/components" className={linkClass}>
          Bevel
        </Link>{" "}
        is an open-source library of neo-skeuomorphic React components, each modelled on a real patented
        object and installed with the shadcn CLI.
      </p>

      <h2>Questions</h2>
      <h3>Is skeuomorphism coming back?</h3>
      <p>
        Yes, in a restrained form. Light, depth and physical behaviour are returning to controls that carry
        meaning, while layouts and text stay flat. The textures of 2010 aren&apos;t coming back.
      </p>
      <h3>What&apos;s the difference between neo-skeuomorphism and neumorphism?</h3>
      <p>
        Neumorphism makes controls the same colour as the page and lifts them with soft shadows, which
        lowers contrast. Neo-skeuomorphism gives controls their own colour, a clear light source and real
        behaviour, such as travel and detents.
      </p>
      <h3>Is skeuomorphism bad for accessibility?</h3>
      <p>
        Not if it&apos;s built well. A raised, high-contrast control is often easier to find than a flat one.
        The risks are low contrast and state shown only through visuals. Fix both by keeping contrast high
        and stating every state in text.
      </p>
      <h3>Does skeuomorphic UI hurt performance?</h3>
      <p>
        Only when it uses images or animates layout. CSS gradients and shadows are cheap, and motion that
        only uses <code>transform</code> and <code>opacity</code> stays smooth.
      </p>
    </Post>
  )
}
