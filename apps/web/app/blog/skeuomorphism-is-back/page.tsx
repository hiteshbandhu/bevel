import type { Metadata } from "next"
import Link from "next/link"
import { CodeBlock } from "@/components/code-block"
import { JsonLd, author } from "@/components/json-ld"
import { DetentKnobEffort } from "@/components/demos/detent-knob-effort"
import { GuardedSwitchDeploy } from "@/components/demos/guarded-switch-deploy"
import { KeysortFilterContracts } from "@/components/demos/keysort-filter-contracts"
import { MeterLiveUsage } from "@/components/demos/meter-live-usage"
import { NumberWheelCounter } from "@/components/demos/number-wheel-counter"
import { SplitFlapDeploys } from "@/components/demos/split-flap-deploys"
import { VigilanceAgent } from "@/components/demos/vigilance-agent"
import { Post, Specimen } from "@/components/post"
import { Note, linkClass } from "@/components/prose"
import { postHref, posts } from "@/lib/blog"
import { components } from "@/lib/catalog"
import { preview } from "@/lib/og"
import { registryNamespace, registryUrl, siteUrl } from "@/lib/site"

const post = posts.find((p) => p.slug === "skeuomorphism-is-back")!

export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  ...preview({ title: post.title, description: post.description, image: `blog-${post.slug}.jpg`, path: postHref(post.slug), type: "article" }),
}

const count = components.filter((c) => !c.parent).length

export default function SkeuomorphismIsBack() {
  return (
    <Post slug="skeuomorphism-is-back">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          url: `${siteUrl}${postHref(post.slug)}`,
          image: `${siteUrl}/og/blog-${post.slug}.jpg`,
          author,
          about: { "@id": `${siteUrl}/#library` },
        }}
      />
      <p>
        In 2013, iOS 7 took the felt off Game Center and the yellow paper out of Notes, and most of the
        industry followed it into flat design within a year or two. It was the right call. Screens had
        become sharp enough to stop pretending, and the stitching and torn paper were a costume. They made
        software look like objects without making it behave like them.
      </p>
      <p>
        But flat design threw out something along with the costume. Real objects tell you things with
        their shape: what can be pressed, what state it&apos;s in, what happens if you push it. A light
        switch shows which way it&apos;s set. The cover over a cockpit switch tells you this one
        matters. A meter keeps turning while it costs you money. Flat interfaces had to put all of that
        back into words, colours and badges, and most of them only partly managed it.
      </p>
      <p>
        That loss mattered less when software mostly waited for you to click. It matters now. Interfaces
        today run deploys, spend money and start agents that keep working after you look away. Interfaces
        that act on their own need to show their state and their stakes at a glance. Machines got good at
        that long before screens existed.
      </p>

      <h2>Borrow the mechanism, not the costume</h2>
      <p>
        So this is the rule behind <Link href="/" className={linkClass}>Bevel</Link>, a set of {count}{" "}
        React components: every component starts from a real object that already solved a modern
        interface problem, and it keeps the part that did the solving. That can be a click into place, a
        cover you lift first, a drum that rolls. The leather stays in the past.
      </p>
      <p>
        Each component&apos;s page also cites where its object came from: the patent where there is one,
        the documented history where there isn&apos;t. Those sources turned out to be the best design
        documents I had. Inventors had to write down exactly what problem a mechanism solves, and many of
        those problems are the ones we&apos;re solving in software again.
      </p>

      <h2>Numbers that roll instead of jump</h2>
      <p>
        When a number changes on a flat screen, it swaps. You get one frame of the old value, then the new
        one, and if you weren&apos;t looking you missed it. Curtis Veeder&apos;s 1895 cyclometer stacked
        numbered rings on one axle, each ring turning the next one step per full turn. You can see that a
        count went up, and roughly by how much, without reading it.
      </p>
      <Specimen slug="number-wheel">
        <NumberWheelCounter />
      </Specimen>

      <h2>A cost you can watch run</h2>
      <p>
        Usage-based pricing means a bill grows while you work, and most products hide that on a billing
        page you visit once a month. Arthur Pitney&apos;s postage meter counted every impression on wheels
        locked inside a tamper-proof case, and stopped when its prepaid amount ran out. That&apos;s a
        balance you can see draining, which is exactly what a token budget should look like.
      </p>
      <Specimen slug="meter">
        <MeterLiveUsage />
      </Specimen>

      <h2>A cover over the dangerous ones</h2>
      <p>
        A confirm dialog asks &ldquo;are you sure?&rdquo; after you&apos;ve already pressed the button, and
        everyone learns to click through it. Cockpits do it the other way round: the switch that matters
        sits under a cover, so arming it and firing it are two separate gestures. Bevel&apos;s version,
        like the touchscreen one Rockwell Collins patented, drops the cover back on its own if you walk
        away.
      </p>
      <Specimen slug="guarded-switch">
        <GuardedSwitchDeploy />
      </Specimen>

      <h2>A dead man&apos;s switch for agents</h2>
      <p>
        Here&apos;s the most direct analogy in the set. A locomotive&apos;s vigilance control assumes the
        driver might stop paying attention. It warns, and if nobody acknowledges in time, it brakes.
        That&apos;s the right default for an agent running unsupervised: it keeps going while someone
        checks in, warns as the window closes, and pauses if nobody does.
      </p>
      <Specimen slug="vigilance">
        <VigilanceAgent />
      </Specimen>

      <h2>Clicks you can count</h2>
      <p>
        Plenty of settings are really a few fixed steps, like low, medium and high reasoning effort. A
        slider pretends they&apos;re continuous. A rotary switch with a detent clicks into each position
        and stops hard at the ends, so you can feel how many choices there are. On screen, the
        &ldquo;feel&rdquo; is the snap, and the knob refusing to turn past the last stop.
      </p>
      <Specimen slug="detent-knob">
        <DetentKnobEffort />
      </Specimen>

      <h2>Filtering you can see</h2>
      <p>
        Alfred Perkins&apos;s 1925 edge-notched cards record values as notches along the edge. Run a
        needle through the stack and lift it: the matching cards drop out. That&apos;s a faceted filter,
        except you can see which cards each criterion keeps and which it holds back, instead of watching a
        list quietly shrink.
      </p>
      <Specimen slug="keysort-filter">
        <KeysortFilterContracts />
      </Specimen>

      <h2>Status that announces itself</h2>
      <p>
        Fermo Solari&apos;s departure boards flip through printed blades until they reach the new value.
        The clatter and the movement are the point: a whole station notices that a platform changed,
        without anyone having to look for it. Deploy status, build queues and release trains all need that
        same tap on the shoulder.
      </p>
      <Specimen slug="split-flap">
        <SplitFlapDeploys />
      </Specimen>

      <h2>What makes it work on a screen</h2>
      <p>
        Skeuomorphism earned its bad reputation partly through bad execution: heavy images, a different
        light direction on every element, motion that jammed the page. The parts above follow a few strict
        rules instead.
      </p>
      <ul>
        <li>
          <strong>One light source, from the top.</strong> Every highlight, shade and cast shadow comes from
          the same few tokens, so objects from different eras sit together on one desk.
        </li>
        <li>
          <strong>Only the compositor moves.</strong> Components animate transform and opacity, never
          layout. With a height transition, adding a card to the wallet cost 678ms of main-thread work.
          Without it, 94ms.
        </li>
        <li>
          <strong>The shape is a hint, not the message.</strong> Every state is also stated in words, so
          screen readers hear it. Live readouts are throttled so they don&apos;t chatter, and with reduced
          motion everything simply changes state.
        </li>
        <li>
          <strong>No images.</strong> Brass, plastic, paper and leather are CSS gradients and a grain
          texture, built from tokens you can retheme.
        </li>
      </ul>
      <p>
        The details are in the <Link href="/docs/design-system" className={linkClass}>design system</Link>{" "}
        and <Link href="/docs/motion" className={linkClass}>motion</Link> guides.
      </p>

      <h2>What doesn&apos;t make the cut</h2>
      <p>
        The easiest way to build a library like this is to make it big. Early on, five Bevel components
        gated an action behind a disabled button with a reason underneath, and two more were the same
        countdown in different costumes. The duplicates are gone. If an object doesn&apos;t do a job that no other component already
        does, it doesn&apos;t ship. Nostalgia isn&apos;t a job.
      </p>
      <Note>
        Not everything has a patent. The wallet, the amount and the activity log are ordinary objects with
        no single inventor, so their pages cite nothing rather than something forced.
      </Note>

      <h2>Try it</h2>
      <p>
        Bevel is a shadcn registry built on Base UI and Tailwind CSS v4. Components install as source
        files you own, with their styles merged into your global CSS. Add the registry once:
      </p>
      <CodeBlock
        lang="json"
        title="components.json"
        code={JSON.stringify({ registries: { [registryNamespace]: registryUrl } }, null, 2)}
      />
      <CodeBlock
        lang="bash"
        title="Terminal"
        code={`npx shadcn@latest add ${registryNamespace}/guarded-switch ${registryNamespace}/vigilance ${registryNamespace}/meter`}
      />
      <p>
        Then browse <Link href="/components" className={linkClass}>all {count} components</Link>, see them
        assembled in the <Link href="/demo" className={linkClass}>demos</Link>, or read the code on{" "}
        <a href="https://github.com/hiteshbandhu/bevel" className={linkClass}>
          GitHub
        </a>
        . If you know an older patent for any of these objects, open an issue. I&apos;d love to cite it.
      </p>
    </Post>
  )
}
