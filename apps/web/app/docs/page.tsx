import type { Metadata } from "next"
import Link from "next/link"
import { Guide, linkClass } from "@/components/prose"
import { components } from "@/lib/catalog"

export const metadata: Metadata = { title: "Introduction" }

export default function Introduction() {
  return (
    <Guide slug="">
      <p>
        Bevel is a set of tactile React components: interface parts with weight, edges and light. Each
        one is a real object that does a real job in a modern product: a cover over a deploy switch, a
        meter that shows a turn&apos;s cost as it runs, alarm lamps that latch until someone sees them.
      </p>
      <p>
        It isn&apos;t a package. Like shadcn/ui, you add components with the shadcn CLI and the source
        lands in your project, yours to read and change. There are {components.length} today, built on{" "}
        <a className={linkClass} href="https://base-ui.com">
          Base UI
        </a>{" "}
        and Tailwind CSS v4.
      </p>

      <h2>The rules</h2>
      <p>Every component follows the same handful of rules, so they read as one set and stay fast.</p>
      <ul>
        <li>
          <strong>A real job first.</strong> The object has to earn its place: if a plain control does
          the job as well, it isn&apos;t in Bevel. No two components do the same job.
        </li>
        <li>
          <strong>Composable parts.</strong> One file per component family, exported as parts (
          <code>Wallet</code>, <code>WalletCard</code>, <code>WalletPocket</code>), not one component with
          forty props. A part that works alone is its own component.
        </li>
        <li>
          <strong>Tokens, not values.</strong> Components never hard-code a colour, shadow, radius,
          duration or type size. They read tokens from one foundation stylesheet, so a change there
          reaches everything. See the{" "}
          <Link className={linkClass} href="/docs/design-system">
            design system
          </Link>
          .
        </li>
        <li>
          <strong>One light, from above.</strong> Every highlight and shadow agrees, which is most of
          what makes the set look like it belongs together.
        </li>
        <li>
          <strong>State in words.</strong> Whatever an object shows with light or position, it also says
          in text, to everyone. See{" "}
          <Link className={linkClass} href="/docs/accessibility">
            accessibility
          </Link>
          .
        </li>
        <li>
          <strong>Motion that stays on the compositor.</strong> Only transform, opacity and filter move;
          nothing animates layout. See{" "}
          <Link className={linkClass} href="/docs/motion">
            motion
          </Link>
          .
        </li>
      </ul>

      <h2>What&apos;s in the box</h2>
      <ul>
        <li>
          <strong>Money:</strong> wallets, cards, meters, ledgers, receipts. For checkout, billing and
          usage.
        </li>
        <li>
          <strong>Agents and documents:</strong> task plans, delegation boards, citations, approvals,
          redlines, redactions.
        </li>
        <li>
          <strong>Coordination:</strong> guarded switches, lockouts, dead man&apos;s switches and queues,
          for work people and agents share.
        </li>
        <li>
          <strong>Instruments:</strong> gauges, dials, telegraphs, annunciators, faders.
        </li>
        <li>
          <strong>Records:</strong> ways to see many things at once: notched cards, Kardex trays, contact
          sheets, departure boards.
        </li>
      </ul>
      <p>
        Browse them all on the{" "}
        <Link className={linkClass} href="/components">
          components page
        </Link>
        , or see them working together in the{" "}
        <Link className={linkClass} href="/demo">
          demos
        </Link>
        .
      </p>
    </Guide>
  )
}
