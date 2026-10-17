/**
 * What the library contains, grouped by category. Drives the site's
 * navigation and component pages; the registry will read the same data.
 */

export type Category = {
  slug: string
  name: string
  description: string
}

export type Example = {
  slug: string
  title: string
  description: string
  /** Demo file under components/demos, shown as the example's code. */
  file: string
  /** Give the preview the full width of the page instead of a wallet's width. */
  wide?: boolean
}

export type Part = {
  name: string
  renders: string
  description: string
}

export type ComponentDoc = {
  slug: string
  name: string
  category: Category["slug"]
  description: string
  /** Source files a user copies, relative to packages/ui/src. */
  files: string[]
  /** Other Bevel components this one is built from, by slug. */
  registryDependencies?: string[]
  /**
   * The component this one is a part of, by slug. It gets its own page,
   * nested under the parent's, and must still work on its own.
   */
  parent?: string
  dependencies: string[]
  anatomy: string
  parts: Part[]
  examples: Example[]
}

/** The design system every component builds on. Installed once. */
export const foundation = {
  file: "styles/bevel.css",
  description:
    "Light, depth, materials, motion and shape tokens, plus the utilities components use to apply them.",
}

export const categories: Category[] = [
  {
    slug: "money",
    name: "Money",
    description: "Balances, payment methods and credits for checkout, billing and usage-based products.",
  },
  {
    slug: "instruments",
    name: "Instruments",
    description: "Readouts and controls from a panel: rolling counters, gauges, dials and breakers.",
  },
  {
    slug: "safety",
    name: "Safety",
    description:
      "Guards for consequential actions: covers over critical switches, levers that won't move until their dependencies are set, a check-in that keeps an agent running, and choices committed in one pull.",
  },
  {
    slug: "coordination",
    name: "Coordination",
    description:
      "Locks, holds, turns and caps for people and agents sharing work: a single edit token, a lockout everyone must release, a chess clock, a kanban rack and a take-a-number queue.",
  },
  {
    slug: "records",
    name: "Records",
    description:
      "Seeing many things at once: notched cards that drop out when filtered, signals along a file's edge, a contact sheet, a departures board and a due-date slip.",
  },
  {
    slug: "agents",
    name: "Agents",
    description:
      "Plans, logs, delegation and approvals for AI agents at work. Who's doing what, how far along, and what needs you.",
  },
  {
    slug: "documents",
    name: "Documents",
    description: "Sources and edits: citations that open their passage, and redlines you accept or reject.",
  },
  {
    slug: "marks",
    name: "Marks",
    description: "Ink and relief on paper: status stamps, embossed seals and redactions.",
  },
]

export const components: ComponentDoc[] = [
  {
    slug: "wallet",
    name: "Wallet",
    category: "money",
    description:
      "A customer's stored balance, shown as a leather wallet. Saved cards sit in it, and picking one pulls it out of the pocket.",
    files: ["components/wallet.tsx", "styles/wallet.css"],
    registryDependencies: ["payment-card", "amount"],
    dependencies: ["@base-ui/react", "cn"],
    anatomy: `<Wallet>
  <WalletCards>
    <WalletCard>
      <PaymentCardBrand />
      <PaymentCardNumber />
    </WalletCard>
  </WalletCards>
  <WalletPocket>
    <WalletHeader>
      <WalletLabel />
      <WalletStatus />
    </WalletHeader>
    <WalletBalance />
    <WalletSeparator />
    <WalletDetails>
      <WalletDetail>
        <WalletDetailLabel />
        <WalletDetailValue>
          <WalletAmount />
        </WalletDetailValue>
      </WalletDetail>
    </WalletDetails>
    <WalletMeter>
      <WalletMeterLabel />
      <WalletMeterValue />
    </WalletMeter>
    <WalletFooter>
      <WalletAction />
    </WalletFooter>
  </WalletPocket>
</Wallet>`,
    parts: [
      {
        name: "Wallet",
        renders: "div",
        description:
          "The leather panel. variant picks the finish (saddle, noir, oxblood); status sets the light and meter colour. Takes render to become a button or label.",
      },
      {
        name: "WalletCards",
        renders: "div or RadioGroup",
        description:
          "Holds any number of cards. Pass value, defaultValue or onValueChange to make them a radio group; the chosen card is pulled out.",
      },
      {
        name: "WalletCard",
        renders: "PaymentCard",
        description:
          "A PaymentCard placed in the stack, so it takes the same parts and tone. value identifies it when the cards are selectable. Cards added after mount slide in.",
      },
      {
        name: "WalletPocket",
        renders: "div",
        description: "The stitched front pocket that holds everything else.",
      },
      {
        name: "WalletStatus",
        renders: "span",
        description: "A status light with text from the wallet's status. Children replace the text.",
      },
      {
        name: "WalletBalance",
        renders: "p",
        description:
          "The amount, stamped into the leather. value, currency (ISO 4217, omit for plain numbers), locale and format.",
      },
      {
        name: "WalletAmount",
        renders: "span",
        description: "An inline amount with the same formatting, for detail rows.",
      },
      {
        name: "WalletDetails",
        renders: "dl",
        description: "Label and value rows: WalletDetail, WalletDetailLabel (dt), WalletDetailValue (dd).",
      },
      {
        name: "WalletMeter",
        renders: "Meter",
        description: "A groove that fills with the remaining amount. value, min and max, plus label and value parts.",
      },
      {
        name: "WalletAction",
        renders: "Button",
        description: "A raised leather tab that sinks when pressed.",
      },
    ],
    examples: [
      {
        slug: "checkout",
        title: "Checkout",
        description:
          "Pay from stored balance. Pay once to drain it, then pick the card that covers the rest.",
        file: "wallet-checkout.tsx",
      },
      {
        slug: "billing",
        title: "Billing",
        description: "Account credit and saved cards. Add a card and it slides into the wallet.",
        file: "wallet-billing.tsx",
      },
      {
        slug: "usage",
        title: "Usage",
        description: "Prepaid credits running down over a billing cycle. Low balance turns the light and meter amber.",
        file: "wallet-usage.tsx",
      },
    ],
  },
  {
    slug: "payment-card",
    name: "Payment card",
    category: "money",
    parent: "wallet",
    description:
      "A plastic payment card at real proportions. Use it on its own, as a radio in a picker, or inside a Wallet.",
    files: ["components/payment-card.tsx", "styles/payment-card.css"],
    dependencies: ["@base-ui/react", "cn"],
    anatomy: `<PaymentCard>
  <PaymentCardBrand />
  <PaymentCardNumber />
  <PaymentCardChip />
</PaymentCard>`,
    parts: [
      {
        name: "PaymentCard",
        renders: "div",
        description:
          "The card, at ID-1 proportions (85.60 × 53.98 mm). tone picks sapphire, gold or graphite. Pass render={<Radio.Root value=\"…\" />} to make it selectable.",
      },
      {
        name: "PaymentCardBrand",
        renders: "span",
        description: "The card's mark. Text by default; put your own SVG logo inside.",
      },
      {
        name: "PaymentCardNumber",
        renders: "span",
        description: "last4 shown as •••• 4242 and read as “ending in 4242”.",
      },
      {
        name: "PaymentCardChip",
        renders: "span",
        description: "The metal contact chip. Decorative and hidden from screen readers.",
      },
    ],
    examples: [
      {
        slug: "picker",
        title: "Saved payment methods",
        description:
          "Cards as a radio group, without a wallet. The chosen card lifts; arrow keys move between them.",
        file: "payment-card-picker.tsx",
      },
    ],
  },
  {
    slug: "amount",
    name: "Amount",
    category: "money",
    description:
      "A formatted figure with steady digits, in any currency and locale. Every amount in Bevel is one of these.",
    files: ["lib/format-amount.ts", "components/amount.tsx"],
    dependencies: ["cn"],
    anatomy: `<Amount value={1240.5} currency="USD" />`,
    parts: [
      {
        name: "Amount",
        renders: "span",
        description:
          "value, currency (ISO 4217; omit for plain numbers), locale (fixed to en-US by default so server and client match), format, and signed for a leading +. Exposes data-sign.",
      },
    ],
    examples: [
      {
        slug: "formats",
        title: "Currencies and locales",
        description: "Digits are tabular so columns line up; separators keep their natural width in any font.",
        file: "amount-formats.tsx",
      },
    ],
  },
  {
    slug: "number-wheel",
    name: "Number wheel",
    category: "instruments",
    description:
      "Mechanical rolling digits. Each digit is a printed drum that turns to its figure, lowest digit first.",
    files: ["components/number-wheel.tsx", "styles/number-wheel.css"],
    registryDependencies: ["amount"],
    dependencies: ["cn"],
    anatomy: `<NumberWheel value={1240} />`,
    parts: [
      {
        name: "NumberWheel",
        renders: "span",
        description:
          "value with the same formatting options as Amount. tone is ivory or black. live sets whether screen readers hear changes: leave it off while a value ticks.",
      },
    ],
    examples: [
      {
        slug: "counter",
        title: "Counter",
        description: "Change the value and the drums roll to it. Sized by font size.",
        file: "number-wheel-counter.tsx",
      },
    ],
  },
  {
    slug: "meter",
    name: "Meter",
    category: "money",
    description:
      "A brass metering instrument with a rolling reading: live spend that ticks up, or a prepaid balance that counts down.",
    files: ["components/meter.tsx", "styles/meter.css"],
    registryDependencies: ["number-wheel"],
    dependencies: ["@base-ui/react", "cn"],
    anatomy: `<Meter state="running">
  <MeterHeader>
    <MeterLabel />
    <MeterFlag />
  </MeterHeader>
  <MeterReading />
  <MeterUnit />
  <MeterFooter>
    <MeterButton />
  </MeterFooter>
</Meter>`,
    parts: [
      {
        name: "Meter",
        renders: "div (group)",
        description: "The bezel and face. state is idle, running or stopped; variant is brass or graphite.",
      },
      { name: "MeterLabel", renders: "p", description: "An engraved label." },
      {
        name: "MeterFlag",
        renders: "span",
        description: "A lamp that lights while running, with Ready, Running or Stopped. Children replace the text.",
      },
      {
        name: "MeterReading",
        renders: "NumberWheel",
        description: "The reading. Silent to screen readers while running; announced once it stops.",
      },
      { name: "MeterUnit", renders: "span", description: "What the reading counts." },
      { name: "MeterButton", renders: "Button", description: "A brass push-button that sinks when pressed." },
    ],
    examples: [
      {
        slug: "live-usage",
        title: "Live usage",
        description: "The cost of a chat turn, ticking while the model writes. Run it, stop it, clear it.",
        file: "meter-live-usage.tsx",
      },
      {
        slug: "prepaid",
        title: "Prepaid balance",
        description: "Like a postage meter: each call stamps a little off; add credit to refill.",
        file: "meter-postage.tsx",
      },
    ],
  },
  {
    slug: "stamp",
    name: "Stamp and seal",
    category: "marks",
    description:
      "A rubber-stamp impression in ink for statuses, and an embossed seal for the moment something becomes official.",
    files: ["components/stamp.tsx", "styles/stamp.css"],
    dependencies: ["cn"],
    anatomy: `<Stamp tone="red">
  Received
  <StampDetail>17 Oct</StampDetail>
</Stamp>

<Seal text="Credits verified">Paid</Seal>`,
    parts: [
      {
        name: "Stamp",
        renders: "span",
        description:
          "Inked text that soaks into the surface. tone (red, blue, green, black), shape (rect, round), animate to land with a press.",
      },
      { name: "StampDetail", renders: "span", description: "A smaller second line: a date or reference." },
      {
        name: "Seal",
        renders: "span (img)",
        description: "Raised relief with text round the rim and a short centre mark. Has an accessible name.",
      },
    ],
    examples: [
      {
        slug: "marks",
        title: "Statuses",
        description: "Stamps replace badges: Received, Refunded, Held, Auto. The seal marks something verified.",
        file: "stamp-marks.tsx",
        wide: true,
      },
    ],
  },
  {
    slug: "receipt",
    name: "Receipt",
    category: "money",
    description:
      "Thermal paper with torn edges. Lines print in as they're added; a stamp or seal lands when it's paid.",
    files: ["components/receipt.tsx", "styles/receipt.css"],
    registryDependencies: ["amount", "stamp"],
    dependencies: ["@base-ui/react", "cn"],
    anatomy: `<Receipt>
  <ReceiptHeader>
    <ReceiptTitle />
    <ReceiptMeta />
  </ReceiptHeader>
  <ReceiptSeparator />
  <ReceiptItems>
    <ReceiptItem>
      <ReceiptLabel />
      <ReceiptValue />
    </ReceiptItem>
  </ReceiptItems>
  <ReceiptTotal>
    <ReceiptLabel />
    <ReceiptValue />
  </ReceiptTotal>
  <ReceiptFooter />
  <ReceiptMark>
    <Stamp />
  </ReceiptMark>
</Receipt>`,
    parts: [
      { name: "Receipt", renders: "div", description: "The paper. variant thermal, or carbon for a yellow copy behind." },
      { name: "ReceiptItems", renders: "dl", description: "The lines." },
      {
        name: "ReceiptItem",
        renders: "div",
        description: "One line: ReceiptLabel (dt, with a dotted leader) and ReceiptValue (dd). Lines added later print in.",
      },
      { name: "ReceiptTotal", renders: "div", description: "The total line, printed bold." },
      { name: "ReceiptMark", renders: "div", description: "Holds a Stamp or Seal where an attendant would press it." },
    ],
    examples: [
      {
        slug: "credits-checkout",
        title: "Buying credits",
        description:
          "Pick a pack and the receipt reprints; pay and it's stamped. Ticket sheet, receipt and stamp together.",
        file: "credits-checkout.tsx",
      },
    ],
  },
  {
    slug: "ticket-sheet",
    name: "Ticket sheet",
    category: "money",
    description:
      "A sheet of perforated tickets, one per option. Picking one tears it off. A radio group underneath.",
    files: ["components/ticket-sheet.tsx", "styles/ticket-sheet.css"],
    dependencies: ["@base-ui/react", "cn"],
    anatomy: `<TicketSheet>
  <Ticket value="team" tone="vermilion">
    <TicketLabel />
    <TicketValue />
    <TicketNote />
  </Ticket>
</TicketSheet>`,
    parts: [
      { name: "TicketSheet", renders: "RadioGroup", description: "The sheet. value, defaultValue, onValueChange." },
      {
        name: "Ticket",
        renders: "Radio",
        description: "One perforated ticket. tone: vermilion, ultramarine, emerald, ochre. Lifts and tilts when chosen.",
      },
      { name: "TicketValue", renders: "span", description: "The big figure." },
      { name: "TicketLabel", renders: "span", description: "What it is." },
      { name: "TicketNote", renders: "span", description: "Small print: a fee, a limit." },
    ],
    examples: [
      {
        slug: "plans",
        title: "Plans",
        description: "Plans as tickets. Arrow keys move between them; a sold-out one is disabled.",
        file: "ticket-sheet-plans.tsx",
      },
      {
        slug: "credits-checkout",
        title: "Credit packs with a receipt",
        description: "The sheet driving a receipt.",
        file: "credits-checkout.tsx",
      },
    ],
  },
  {
    slug: "dial",
    name: "Gauge and dial",
    category: "instruments",
    description:
      "A needle on a brass-bezelled scale. Gauge reads a value; Dial sets one, turned by drag or keyboard.",
    files: ["components/dial.tsx", "styles/dial.css"],
    registryDependencies: ["amount"],
    dependencies: ["@base-ui/react", "cn"],
    anatomy: `<Gauge value={12} max={30} marks={<DialMark value={5} />}>
  <GaugeLabel />
  <GaugeValue />
</Gauge>

<Dial label="Keep above" value={30} onValueChange={setValue} />`,
    parts: [
      {
        name: "Gauge",
        renders: "Meter",
        description: "Read-only. value, min, max, ticks, marks. Announced as a meter; pass getAriaValueText to describe marks.",
      },
      { name: "GaugeLabel / GaugeValue", renders: "Meter parts", description: "The name and the formatted value." },
      {
        name: "Dial",
        renders: "div (slider)",
        description:
          "Adjustable. value, defaultValue, onValueChange, min, max, step, label, and Amount formatting for the readout. Arrows, Page Up/Down, Home, End.",
      },
      { name: "DialMark", renders: "span", description: "A painted mark on the scale: red, amber or green. Decorative." },
    ],
    examples: [
      {
        slug: "runway",
        title: "Runway",
        description: "Days of credit left, with the auto top-up level marked.",
        file: "dial-runway.tsx",
      },
      {
        slug: "auto-top-up",
        title: "Auto top-up",
        description: "Set like a thermostat: the level to keep above, and how much to add.",
        file: "dial-auto-top-up.tsx",
        wide: true,
      },
    ],
  },
  {
    slug: "breaker",
    name: "Breaker",
    category: "instruments",
    description:
      "A circuit breaker: on, off, or tripped until someone resets it. For spending caps, kill switches and feature flags.",
    files: ["components/breaker.tsx", "styles/breaker.css"],
    dependencies: ["@base-ui/react", "cn"],
    anatomy: `<BreakerPanel>
  <BreakerPanelTitle />
  <BreakerRow>
    <Breaker label="Workspace" description="$500 a month" tripped />
  </BreakerRow>
</BreakerPanel>`,
    parts: [
      { name: "BreakerPanel", renders: "div (group)", description: "The panel. Give it an aria-label." },
      {
        name: "Breaker",
        renders: "Switch",
        description:
          "checked, defaultChecked, onCheckedChange, disabled, plus tripped: the lever drops to the middle and a red flag shows. Switching a tripped breaker resets it; clear tripped in onCheckedChange.",
      },
    ],
    examples: [
      {
        slug: "caps",
        title: "Spending caps",
        description: "The per-person cap has tripped; switch it to reset. Overage is locked to owners.",
        file: "breaker-caps.tsx",
        wide: true,
      },
    ],
  },
  {
    slug: "ledger",
    name: "Ledger",
    category: "money",
    description:
      "A ruled page of numbered entries with a red margin. History and audit logs that read like a passbook.",
    files: ["components/ledger.tsx", "styles/ledger.css"],
    registryDependencies: ["amount", "stamp"],
    dependencies: ["cn"],
    anatomy: `<Ledger>
  <LedgerTitle />
  <LedgerTable>
    <LedgerHeader>
      <LedgerRow><LedgerHead /></LedgerRow>
    </LedgerHeader>
    <LedgerBody>
      <LedgerRow>
        <LedgerCell><LedgerNumber value={42} /></LedgerCell>
        <LedgerCell><LedgerAmount value={10} /></LedgerCell>
      </LedgerRow>
    </LedgerBody>
  </LedgerTable>
</Ledger>`,
    parts: [
      { name: "Ledger", renders: "div", description: "The ruled page. Every row sits exactly on one rule." },
      { name: "LedgerTable", renders: "table", description: "A real table, with LedgerHeader, LedgerBody, LedgerRow, LedgerHead, LedgerCell." },
      { name: "LedgerNumber", renders: "span", description: "The entry number, “No. 0042”, read as “Entry 0042”." },
      { name: "LedgerAmount", renders: "Amount", description: "Signed: credits in green ink, debits in black." },
    ],
    examples: [
      {
        slug: "history",
        title: "Credit history",
        description: "Numbered entries with the balance after each, and stamped statuses.",
        file: "ledger-history.tsx",
        wide: true,
      },
    ],
  },
  {
    slug: "keycard",
    name: "Keycard",
    category: "money",
    description:
      "An API key on a plastic card that slides into a brass reader. For bring-your-own-key and credential screens.",
    files: ["components/keycard.tsx", "styles/keycard.css"],
    registryDependencies: ["payment-card"],
    dependencies: ["@base-ui/react", "cn"],
    anatomy: `<KeycardSlot inserted>
  <Keycard>
    <KeycardLabel />
    <KeycardKey value="sk-…" />
  </Keycard>
</KeycardSlot>

<KeycardSwipe onSwipe={useKey}>
  <Keycard>…</Keycard>
</KeycardSwipe>`,
    parts: [
      { name: "Keycard", renders: "PaymentCard", description: "The card, with a magnetic stripe. Takes PaymentCard's tone." },
      { name: "KeycardLabel", renders: "span", description: "Whose key it is." },
      {
        name: "KeycardKey",
        renders: "span",
        description: "The key, masked to its prefix and last four (read as “ending in”). revealed shows it all.",
      },
      {
        name: "KeycardSlot",
        renders: "div",
        description: "A brass reader. inserted slides the card in; status text on the plate is announced politely.",
      },
      {
        name: "KeycardSwipe",
        renders: "div, card as button",
        description:
          "A swipe reader: drag the card left to right, or flick it. onSwipe fires when it completes; accepted lights the lamp. Enter or Space swipes from the keyboard.",
      },
    ],
    examples: [
      {
        slug: "byok",
        title: "Bring your own key",
        description: "Switch the breaker and the key goes into the reader: usage bills to it instead of credits.",
        file: "keycard-byok.tsx",
      },
      {
        slug: "swipe",
        title: "Swipe to use",
        description:
          "Drag the card through the reader, or flick it. A short drag springs back. Keyboard: focus the card, press Enter.",
        file: "keycard-swipe.tsx",
      },
    ],
  },
  {
    slug: "name-tag",
    name: "Name tag",
    category: "agents",
    description:
      "Who someone is: an agent, a person, a guest. The \u201cHELLO my name is\u201d sticker, a visitor badge for outside collaborators, and a plain tag for lists.",
    files: ["components/name-tag.tsx", "styles/name-tag.css"],
    dependencies: ["cn"],
    anatomy: `<NameTag variant="sticker">
  <NameTagName />
  <NameTagDetail />
</NameTag>`,
    parts: [
      {
        name: "NameTag",
        renders: "div",
        description:
          "variant: sticker, visitor or plain. greeting and caption translate the printed words, which screen readers skip.",
      },
      { name: "NameTagName", renders: "span", description: "The name, in marker on the sticker and badge." },
      { name: "NameTagDetail", renders: "span", description: "A role, or who an agent acts for." },
      { name: "NameTagInput", renders: "input", description: "Write a new name on the tag. Labelled \u201cName\u201d." },
    ],
    examples: [
      {
        slug: "agents",
        title: "Agents and guests",
        description: "Rename the agent by writing on its sticker. Guests get a visitor badge; lists use the plain tag.",
        file: "name-tag-agents.tsx",
        wide: true,
      },
    ],
  },
  {
    slug: "citation",
    name: "Citation",
    category: "documents",
    description:
      "An exhibit sticker in the text that opens the exact passage it cites, with a stamp saying whether the source checks out.",
    files: ["components/citation.tsx", "styles/citation.css"],
    registryDependencies: ["stamp"],
    dependencies: ["@base-ui/react", "cn"],
    anatomy: `<Citation>
  <CitationTrigger>4</CitationTrigger>
  <CitationContent>
    <CitationSource />
    <CitationLocation />
    <CitationQuote />
    <CitationStatus status="verified" />
  </CitationContent>
</Citation>`,
    parts: [
      { name: "Citation", renders: "Popover", description: "One cited source. open, defaultOpen, onOpenChange." },
      {
        name: "CitationTrigger",
        renders: "button",
        description:
          "The exhibit sticker, inline in text: \u201cEx. 4\u201d, read as \u201cExhibit 4\u201d. tone: yellow, blue, white. abbreviation and label change the prefix.",
      },
      {
        name: "CitationContent",
        renders: "Popover popup",
        description: "The paper slip. Grows from the sticker; Escape closes it and returns focus.",
      },
      { name: "CitationSource", renders: "Popover title", description: "The source's name; titles the slip." },
      { name: "CitationLocation", renders: "p", description: "Page, paragraph or clause." },
      { name: "CitationQuote", renders: "blockquote", description: "The passage, highlighted." },
      {
        name: "CitationStatus",
        renders: "Stamp",
        description: "verified, caution or unverified, always in words. Children replace the word.",
      },
    ],
    examples: [
      {
        slug: "answer",
        title: "An answer with sources",
        description: "Open a sticker to read the cited passage. The third source has been appealed.",
        file: "citation-answer.tsx",
      },
    ],
  },
  {
    slug: "task-plan",
    name: "Task plan",
    category: "agents",
    description:
      "An agent's plan on a legal pad. Finished steps are ticked in ink, the current one is underlined in red pen, the rest are still in pencil.",
    files: ["components/task-plan.tsx", "styles/task-plan.css"],
    dependencies: ["@base-ui/react", "cn"],
    anatomy: `<TaskPlan>
  <TaskPlanHeader>
    <TaskPlanTitle />
    <TaskPlanProgress value={2} max={5} />
  </TaskPlanHeader>
  <TaskPlanSteps>
    <TaskPlanStep status="done" />
    <TaskPlanStep status="current" />
  </TaskPlanSteps>
</TaskPlan>`,
    parts: [
      { name: "TaskPlan", renders: "div", description: "The pad. Every row sits on a rule." },
      {
        name: "TaskPlanProgress",
        renders: "Progress",
        description: "value and max. Read as \u201c2 of 5 done\u201d; children replace the visible text.",
      },
      { name: "TaskPlanSteps", renders: "ol", description: "The steps, in order." },
      {
        name: "TaskPlanStep",
        renders: "li",
        description:
          "status: done, current, pending, error or skipped, spoken before the step. The current step is marked aria-current. The tick draws itself when a step finishes.",
      },
    ],
    examples: [
      {
        slug: "agent",
        title: "An agent at work",
        description: "The plan advances on its own. Each step is ticked in ink as it finishes.",
        file: "task-plan-agent.tsx",
      },
    ],
  },
  {
    slug: "activity-log",
    name: "Activity log",
    category: "agents",
    description:
      "A docket of what an agent did: thoughts, actions, questions, responses and errors, each timed. Questions waiting on you are highlighted.",
    files: ["components/activity-log.tsx", "styles/activity-log.css"],
    dependencies: ["cn"],
    anatomy: `<ActivityLog aria-label="Agent activity">
  <ActivityLogTitle />
  <ActivityLogEntries>
    <ActivityLogEntry kind="action" time="14:02" />
  </ActivityLogEntries>
</ActivityLog>`,
    parts: [
      { name: "ActivityLog", renders: "section", description: "The docket page. Give it an aria-label." },
      {
        name: "ActivityLogEntries",
        renders: "div (log)",
        description:
          "A live log: new entries are announced politely. Scrolls past --activity-log-height and follows new entries only while you're at the bottom.",
      },
      {
        name: "ActivityLogEntry",
        renders: "div",
        description:
          "kind: thought, action, question, response or error (shown in words), time and dateTime. Entries added later print in.",
      },
    ],
    examples: [
      {
        slug: "agent",
        title: "Two agents on a matter",
        description: "Entries arrive as the agents work. Who acted is a plain Name tag.",
        file: "activity-log-agent.tsx",
        wide: true,
      },
    ],
  },
  {
    slug: "approval",
    name: "Approval",
    category: "agents",
    description:
      "An action an agent wants to take, waiting for a person. Say what it does and what can't be undone; press and hold the brass seal to approve.",
    files: ["components/approval.tsx", "styles/approval.css"],
    registryDependencies: ["stamp"],
    dependencies: ["@base-ui/react", "cn"],
    anatomy: `<Approval onApprove={send} onReject={sendBack}>
  <ApprovalTitle />
  <ApprovalDescription />
  <ApprovalSignatures>
    <ApprovalSignature name="Priya Shah" signed />
  </ApprovalSignatures>
  <ApprovalActions>
    <ApprovalReject />
    <ApprovalSeal />
  </ApprovalActions>
</Approval>`,
    parts: [
      {
        name: "Approval",
        renders: "div (group)",
        description:
          "state (pending, approved, rejected), defaultState, onApprove, onReject. Labelled by its title; the outcome is pressed into the card and announced.",
      },
      { name: "ApprovalDescription", renders: "p", description: "What happens and what can't be undone." },
      {
        name: "ApprovalSignature",
        renders: "li",
        description: "A signature line; signed names are written over it. For dual approval.",
      },
      { name: "ApprovalReject", renders: "Button", description: "Send it back. A single press." },
      {
        name: "ApprovalSeal",
        renders: "Button",
        description:
          "Press and hold (pointer, Enter or Space) for --approval-hold to approve; letting go early springs back. requireHold={false} for a single press.",
      },
    ],
    examples: [
      {
        slug: "send",
        title: "Before an agent sends email",
        description: "Hold the seal until it presses. Let go early and nothing happens.",
        file: "approval-send.tsx",
      },
    ],
  },
  {
    slug: "delegation-board",
    name: "Delegation board",
    category: "agents",
    description:
      "Pigeonholes for delegated work, one per subagent: its task slip, a lamp and a word for its status, and its progress. Finished work rises out of its cubby.",
    files: ["components/delegation-board.tsx", "styles/delegation-board.css"],
    registryDependencies: ["name-tag"],
    dependencies: ["@base-ui/react", "cn"],
    anatomy: `<DelegationBoard aria-label="Subagents">
  <DelegationSlot status="active">
    <DelegationAgent>
      <NameTag variant="plain">…</NameTag>
    </DelegationAgent>
    <DelegationTask />
    <DelegationProgress value={40} aria-label="Research progress" />
  </DelegationSlot>
</DelegationBoard>`,
    parts: [
      { name: "DelegationBoard", renders: "ul", description: "The board. Give it an aria-label." },
      {
        name: "DelegationSlot",
        renders: "li",
        description: "One subagent. status: pending, active, awaiting, error or complete, shown as a lamp and in words.",
      },
      { name: "DelegationAgent", renders: "div", description: "Who it is, with the status lamp. Holds a Name tag." },
      { name: "DelegationTask", renders: "div", description: "The task slip. Rises out of the cubby when complete." },
      { name: "DelegationProgress", renders: "Progress", description: "value and max; name it after the agent." },
    ],
    examples: [
      {
        slug: "agents",
        title: "A coordinator's subagents",
        description: "Four agents working in parallel. Drafting stops to ask you a question; answer it to unblock Review.",
        file: "delegation-board-agents.tsx",
        wide: true,
      },
    ],
  },
  {
    slug: "redline",
    name: "Redline",
    category: "documents",
    description:
      "Proposed edits in proofreader's red ink, each with a sign-here flag to accept or reject it. Nothing is applied until someone decides.",
    files: ["components/redline.tsx", "styles/redline.css"],
    dependencies: ["cn"],
    anatomy: `<Redline onDecisionsChange={save}>
  <RedlineDocument>
    … <RedlineChange id="period" deletion="thirty" insertion="sixty" /> …
  </RedlineDocument>
  <RedlineToolbar />
</Redline>`,
    parts: [
      {
        name: "Redline",
        renders: "div",
        description: "Holds the decisions: decisions, defaultDecisions, onDecisionsChange ({ id: accepted | rejected }).",
      },
      { name: "RedlineDocument", renders: "div", description: "The text being edited." },
      {
        name: "RedlineChange",
        renders: "span (group)",
        description:
          "One edit: id, deletion, insertion. Uses real del and ins, read as \u201cdeleted\u201d and \u201cinserted\u201d. Its flag holds Accept and Reject.",
      },
      {
        name: "RedlineToolbar",
        renders: "div (toolbar)",
        description: "How many changes are left, with Accept all and Reject all.",
      },
    ],
    examples: [
      {
        slug: "clause",
        title: "A notice clause",
        description: "Three suggested edits. Decide each one, or all at once.",
        file: "redline-clause.tsx",
      },
    ],
  },
  {
    slug: "redaction",
    name: "Redaction",
    category: "marks",
    description:
      "A black marker bar over withheld text, read as \u201cRedacted\u201d with the reason. Hidden text is never rendered; revealed text keeps a trace of the marker.",
    files: ["components/redaction.tsx", "styles/redaction.css"],
    dependencies: ["cn"],
    anatomy: `{canSee ? (
  <Redaction revealed>the withheld text</Redaction>
) : (
  <Redaction length={22} reason="privileged" />
)}`,
    parts: [
      {
        name: "Redaction",
        renders: "span",
        description:
          "length (in characters) sizes the bar; reason is read to screen readers; revealed shows children. Only pass children to viewers allowed to read them: anything sent to the browser can be read there.",
      },
    ],
    examples: [
      {
        slug: "privilege",
        title: "Privilege marks",
        description: "A privileged memo, stamped. Switch who's reading: opposing counsel sees the redactions.",
        file: "privilege-marks.tsx",
        wide: true,
      },
    ],
  },
  {
    slug: "guarded-switch",
    name: "Guarded switch",
    category: "safety",
    description:
      "A critical switch under a flip-up cover, as in a cockpit. Lift the cover, then flip it; closing the cover returns it to safe, and the cover closes itself if left.",
    files: ["components/guarded-switch.tsx", "styles/guarded-switch.css"],
    dependencies: ["@base-ui/react", "cn"],
    anatomy: `<GuardedSwitch checked={on} onCheckedChange={setOn}>
  <GuardedSwitchLabel />
  <GuardedSwitchControl />
  <GuardedSwitchStatus />
</GuardedSwitch>`,
    parts: [
      {
        name: "GuardedSwitch",
        renders: "div (group)",
        description:
          "checked, defaultChecked, onCheckedChange. safeOnClose (default true) turns it off when the cover closes; autoClose closes the cover after --guarded-switch-close-after.",
      },
      { name: "GuardedSwitchLabel", renders: "span", description: "Names the group and the switch." },
      {
        name: "GuardedSwitchControl",
        renders: "button + Switch",
        description:
          "The cover (a button with aria-expanded) over a Base UI Switch that's disabled while the cover is closed.",
      },
      { name: "GuardedSwitchStatus", renders: "span (status)", description: "Off, cover open, or on, in words." },
    ],
    examples: [
      {
        slug: "deploy",
        title: "Agent permissions and deploys",
        description: "Lift a cover, then flip the switch. Leave it and the cover closes, turning it off.",
        file: "guarded-switch-deploy.tsx",
        wide: true,
      },
    ],
  },
  {
    slug: "interlock",
    name: "Interlock",
    category: "safety",
    description:
      "A railway lever frame. A lever stays locked until the levers it depends on are pulled, and says so; once pulled it holds them in place.",
    files: ["components/interlock.tsx", "styles/interlock.css"],
    dependencies: ["@base-ui/react", "cn"],
    anatomy: `<Interlock aria-label="Release levers">
  <InterlockLever id="migrations" label="Migrations applied" />
  <InterlockLever id="promote" label="Promote" requires={["migrations"]} />
</Interlock>`,
    parts: [
      {
        name: "Interlock",
        renders: "div (group)",
        description: "values, defaultValues, onValuesChange ({ id: pulled }). Give it an aria-label.",
      },
      {
        name: "InterlockLever",
        renders: "Switch",
        description:
          "id, label, requires (ids), tone (red, black, blue, yellow), number. Locked levers are aria-disabled and described: “Locked until: …” or “Held by: …”.",
      },
    ],
    examples: [
      {
        slug: "deploy",
        title: "Release levers",
        description: "Promote is locked until three levers are pulled. Once it's pulled, they can't go back.",
        file: "interlock-deploy.tsx",
        wide: true,
      },
    ],
  },
  {
    slug: "vigilance",
    name: "Dead man's switch",
    category: "safety",
    description:
      "A train cab's vigilance control for supervised agent runs: the run keeps going only while someone checks in. Miss the window and it warns, then pauses.",
    files: ["components/vigilance.tsx", "styles/vigilance.css"],
    dependencies: ["@base-ui/react", "cn"],
    anatomy: `<Vigilance interval={30000} onTrip={pauseAgent}>
  <VigilanceLamps />
  <VigilanceTimer />
  <VigilanceButton />
</Vigilance>`,
    parts: [
      {
        name: "Vigilance",
        renders: "div (group)",
        description:
          "interval (ms), warnAt and stopAt (share left), running, onTrip, onCheckIn, onResume.",
      },
      {
        name: "VigilanceLamps",
        renders: "div",
        description:
          "Clear, Warning, Stopping lamps (steady, never flashing) and the stage in words. Only stage changes are announced; the final warning and the pause assertively.",
      },
      { name: "VigilanceTimer", renders: "Progress", description: "Time until the next check-in, read in seconds." },
      { name: "VigilanceButton", renders: "Button", description: "Check in. While paused it becomes Resume." },
    ],
    examples: [
      {
        slug: "agent",
        title: "A supervised agent run",
        description: "Check in every 12 seconds to keep it going. Stop checking in and watch it warn, then pause.",
        file: "vigilance-agent.tsx",
      },
    ],
  },
  {
    slug: "ballot-board",
    name: "Ballot board",
    category: "safety",
    description:
      "A lever voting machine: set many choices, then pull one lever to commit them all and reset. Races refuse choices past their limit, so an invalid ballot can't be built.",
    files: ["components/ballot-board.tsx", "styles/ballot-board.css"],
    dependencies: ["@base-ui/react", "cn"],
    anatomy: `<BallotBoard onCommit={send}>
  <BallotRace name="email" label="Email the client">
    <BallotLever value="approve">Approve</BallotLever>
    <BallotLever value="deny">Deny</BallotLever>
  </BallotRace>
  <BallotCommit />
</BallotBoard>`,
    parts: [
      { name: "BallotBoard", renders: "div", description: "onCommit receives { race: values[] } and the board resets." },
      {
        name: "BallotRace",
        renders: "fieldset (radiogroup or group)",
        description: "name, label, max. With max 1 it's a radio group; above that, levers past the limit lock.",
      },
      {
        name: "BallotLever",
        renders: "button (radio or checkbox)",
        description: "value. Flips down to point at its choice. Arrow keys move between levers.",
      },
      { name: "BallotCommit", renders: "Button", description: "Commits every choice and says what was cast." },
    ],
    examples: [
      {
        slug: "tools",
        title: "Approving an agent's proposals",
        description: "Decide each proposed action and pick two reviewers, then send every decision with one lever.",
        file: "ballot-board-tools.tsx",
        wide: true,
      },
    ],
  },
  {
    slug: "token-instrument",
    name: "Token instrument",
    category: "coordination",
    description:
      "A railway single-line token: only one exists, and whoever holds it may proceed. An empty slot shows who has it. For edit locks, deploy lanes and who's driving.",
    files: ["components/token-instrument.tsx", "styles/token-instrument.css"],
    dependencies: ["@base-ui/react", "cn"],
    anatomy: `<TokenInstrument section="Lease draft" holder={holder} you="You" onTake={take} onReturn={give}>
  <TokenInstrumentSlot />
  <TokenInstrumentStatus />
  <TokenInstrumentAction />
</TokenInstrument>`,
    parts: [
      {
        name: "TokenInstrument",
        renders: "div (group)",
        description: "section, holder (null when free), you, onTake, onReturn, onRequest. Named “<section> token”.",
      },
      { name: "TokenInstrumentSlot", renders: "div", description: "The token in its slot, or an Out plate naming the holder." },
      { name: "TokenInstrumentStatus", renders: "p (status)", description: "Who holds it, in words." },
      { name: "TokenInstrumentAction", renders: "Button", description: "Take token, Return token, or Ask <holder>." },
    ],
    examples: [
      {
        slug: "edit",
        title: "An edit token",
        description: "Take the token to edit. Let Priya take it, then ask for it back.",
        file: "token-instrument-edit.tsx",
      },
    ],
  },
  {
    slug: "lockout",
    name: "Lockout",
    category: "coordination",
    description:
      "A lockout-tagout hasp: everyone working on something hangs their own padlock and tag, and it can't start until the last lock comes off. For freezes and holds.",
    files: ["components/lockout.tsx", "styles/lockout.css"],
    dependencies: ["@base-ui/react", "cn"],
    anatomy: `<Lockout aria-label="Database migration">
  <LockoutHasp>
    <LockoutLock id="priya" owner="Priya" reason="Restoring a backup" />
  </LockoutHasp>
  <LockoutAction>Run migration</LockoutAction>
</Lockout>`,
    parts: [
      { name: "Lockout", renders: "div (group)", description: "Counts the locks on it. Give it an aria-label." },
      { name: "LockoutHasp", renders: "ul", description: "The bar the locks hang from." },
      {
        name: "LockoutLock",
        renders: "li",
        description:
          "id, owner, reason, shown on a danger tag. onRemove adds “Remove my lock”: pass it only for the current user's lock.",
      },
      {
        name: "LockoutAction",
        renders: "Button",
        description: "Disabled while any lock remains, described as “Locked by 2: Priya, Sam”.",
      },
    ],
    examples: [
      {
        slug: "migration",
        title: "A migration on hold",
        description: "Three locks hold the migration. Remove yours; the others come off as their work finishes.",
        file: "lockout-migration.tsx",
        wide: true,
      },
    ],
  },
  {
    slug: "chess-clock",
    name: "Chess clock",
    category: "coordination",
    description:
      "Two clocks on one rocker: ending your turn stops your clock and starts the other, so exactly one runs. When a side runs out, its flag falls. For turn-taking with time budgets.",
    files: ["components/chess-clock.tsx", "styles/chess-clock.css"],
    dependencies: ["cn"],
    anatomy: `<ChessClock aria-label="Review turns" names={["You", "Agent"]} time={120_000}>
  <ChessClockFaces>
    <ChessClockFace side={0} />
    <ChessClockFace side={1} />
  </ChessClockFaces>
  <ChessClockRocker />
</ChessClock>`,
    parts: [
      {
        name: "ChessClock",
        renders: "div (group)",
        description:
          "names, time (ms each), defaultActive, onTurn(active), onFlag(side). Announces turns and fallen flags, not seconds.",
      },
      { name: "ChessClockFaces", renders: "div", description: "Lays the two faces side by side." },
      {
        name: "ChessClockFace",
        renders: "div",
        description: "side 0 or 1. The hand climbs to twelve as time runs out; a timer below reads the time left.",
      },
      {
        name: "ChessClockRocker",
        renders: "div",
        description: "Two buttons. Before play, a side's button starts its clock; then the waiting side's is down and disabled, and the running side's ends its turn.",
      },
    ],
    examples: [
      {
        slug: "review",
        title: "Taking turns with an agent",
        description: "You and the agent have two minutes each. End your turn; the agent answers and hands back.",
        file: "chess-clock-review.tsx",
      },
    ],
  },
  {
    slug: "kanban-rack",
    name: "Kanban rack",
    category: "coordination",
    description:
      "A rack of kanban cards that caps work in progress: starting something takes a card, finishing puts it back, and when the rack is empty nothing new starts. For limiting concurrent agent runs, jobs or reviews.",
    files: ["components/kanban-rack.tsx", "styles/kanban-rack.css"],
    dependencies: ["@base-ui/react", "cn"],
    anatomy: `<KanbanRack aria-label="Agent runs" capacity={3} inUse={running}>
  <KanbanRackPockets />
  <KanbanRackTake onClick={start}>Start a run</KanbanRackTake>
  <KanbanRackStatus />
</KanbanRack>`,
    parts: [
      {
        name: "KanbanRack",
        renders: "div (group)",
        description: "capacity, and inUse: what each card that's out is doing. Give it an aria-label.",
      },
      {
        name: "KanbanRackPockets",
        renders: "ul",
        description: "One pocket per card. A free card stands in its pocket; an empty pocket names the work its card is on.",
      },
      {
        name: "KanbanRackTake",
        renders: "Button",
        description: "Starts work. Disabled, but still focusable, when no card is free.",
      },
      { name: "KanbanRackStatus", renders: "p (status)", description: "“1 of 3 free”, and describes the button." },
    ],
    examples: [
      {
        slug: "runs",
        title: "Three agent runs at a time",
        description: "Start runs from the backlog until the cards run out; finish one to start the next.",
        file: "kanban-rack-runs.tsx",
      },
    ],
  },
  {
    slug: "take-a-number",
    name: "Take a number",
    category: "coordination",
    description:
      "A ticket dispenser and a Now Serving sign: your place in the queue is the number in your hand. For support queues, waitlists and jobs waiting their turn.",
    files: ["components/take-a-number.tsx", "styles/take-a-number.css"],
    registryDependencies: ["number-wheel"],
    dependencies: ["@base-ui/react", "cn"],
    anatomy: `<TakeANumber aria-label="Support queue" serving={42} ticket={ticket}>
  <TakeANumberSign />
  <TakeANumberDispenser onClick={take} />
  <TakeANumberStatus />
</TakeANumber>`,
    parts: [
      {
        name: "TakeANumber",
        renders: "div (group)",
        description: "serving, and ticket: the number you hold, or null. Give it an aria-label.",
      },
      {
        name: "TakeANumberSign",
        renders: "div",
        description: "Now Serving, on number wheels that roll to each new number. Its lamp lights on your turn.",
      },
      {
        name: "TakeANumberDispenser",
        renders: "Button",
        description: "“Take a number”. Tears off your ticket; disabled, but focusable, while you hold one.",
      },
      {
        name: "TakeANumberStatus",
        renders: "p (status)",
        description: "“You're 44: 2 ahead of you.” Announced once per number served.",
      },
    ],
    examples: [
      {
        slug: "support",
        title: "A support queue",
        description: "Take a number; the sign rolls on every two seconds until it's your turn.",
        file: "take-a-number-support.tsx",
      },
    ],
  },
  {
    slug: "engine-telegraph",
    name: "Engine telegraph",
    category: "instruments",
    description:
      "A ship's engine order telegraph: you set an order, the other side answers by moving its own pointer to match. Both show on one dial, so a pending order is visible at a glance. For autonomy levels, deploy stages and any setting that takes effect only once acknowledged.",
    files: ["components/engine-telegraph.tsx", "styles/engine-telegraph.css"],
    dependencies: ["@base-ui/react", "cn"],
    anatomy: `<EngineTelegraph aria-label="Agent autonomy" value={value} onValueChange={setValue} confirmed={confirmed}>
  <EngineTelegraphDial />
  <EngineTelegraphOrders>
    <EngineTelegraphOrder value="ask">Ask</EngineTelegraphOrder>
    <EngineTelegraphOrder value="act">Act</EngineTelegraphOrder>
  </EngineTelegraphOrders>
  <EngineTelegraphStatus />
</EngineTelegraph>`,
    parts: [
      {
        name: "EngineTelegraph",
        renders: "div (group) + RadioGroup",
        description: "value and onValueChange for your order; confirmed for the other side's answer. Give it an aria-label.",
      },
      {
        name: "EngineTelegraphDial",
        renders: "div (decorative)",
        description: "Your handle (dark, long) and the answer pointer (red, short) over the orders, in the order they're listed.",
      },
      { name: "EngineTelegraphOrders", renders: "div", description: "Lays out the order plates." },
      {
        name: "EngineTelegraphOrder",
        renders: "Radio",
        description: "One order; its text is its label on the dial too. Arrow keys move between orders.",
      },
      {
        name: "EngineTelegraphStatus",
        renders: "p (status)",
        description: "“Ordered: Act. Waiting for confirmation”, or “Confirmed: Act.” Describes the group.",
      },
    ],
    examples: [
      {
        slug: "autonomy",
        title: "Agent autonomy",
        description: "Set how much the agent may do alone. It answers once its current step is done.",
        file: "engine-telegraph-autonomy.tsx",
      },
    ],
  },
  {
    slug: "annunciator",
    name: "Annunciator",
    category: "instruments",
    description:
      "A panel of alarm lamps from a control room. A new alarm flashes until someone acknowledges it, then stays lit while its condition lasts; one that clears unseen keeps flashing, so nothing passes unnoticed. For agent, build and system alerts.",
    files: ["components/annunciator.tsx", "styles/annunciator.css"],
    dependencies: ["@base-ui/react", "cn"],
    anatomy: `<Annunciator aria-label="Agent alerts">
  <AnnunciatorPanel>
    <AnnunciatorTile id="budget" active={overBudget} tone="red">Over budget</AnnunciatorTile>
    <AnnunciatorTile id="tests" active={failing}>Tests failing</AnnunciatorTile>
  </AnnunciatorPanel>
  <AnnunciatorAcknowledge />
</Annunciator>`,
    parts: [
      {
        name: "Annunciator",
        renders: "div (group)",
        description: "Latches alarms and announces each one as it comes in and clears. Give it an aria-label.",
      },
      { name: "AnnunciatorPanel", renders: "div", description: "The grid of lamp windows." },
      {
        name: "AnnunciatorTile",
        renders: "button",
        description:
          "id, active, tone red, amber, green or white. Named with its state (“Over budget: new alarm”); pressing it acknowledges it. With reduced motion, a dot marks it new instead of flashing.",
      },
      {
        name: "AnnunciatorAcknowledge",
        renders: "Button",
        description: "“Acknowledge 2”: acknowledges every unseen alarm. Disabled, but focusable, when there are none.",
      },
    ],
    examples: [
      {
        slug: "agent",
        title: "An agent's alert panel",
        description: "Conditions come and go on their own. Acknowledge them one by one, or all at once.",
        file: "annunciator-agent.tsx",
      },
    ],
  },
  {
    slug: "detent-knob",
    name: "Detent knob",
    category: "instruments",
    description:
      "A rotary switch that clicks into fixed positions and stops hard at both ends. For a few ordered settings where the order matters: permission modes, quality presets, verbosity.",
    files: ["components/detent-knob.tsx", "styles/detent-knob.css"],
    dependencies: ["cn"],
    anatomy: `<DetentKnob aria-label="Agent mode" value={mode} onValueChange={setMode}>
  <DetentKnobStop value="ask">Ask</DetentKnobStop>
  <DetentKnobStop value="edit">Auto-edit</DetentKnobStop>
  <DetentKnobStop value="full">Full auto</DetentKnobStop>
</DetentKnob>`,
    parts: [
      {
        name: "DetentKnob",
        renders: "div (slider)",
        description:
          "value, defaultValue, onValueChange, disabled. Arrow keys, Home and End, or drag round; it gives a little at the ends. Reads as “Auto-edit, 3 of 4”.",
      },
      {
        name: "DetentKnobStop",
        renders: "nothing",
        description: "One position, in order. Its text is drawn round the dial.",
      },
    ],
    examples: [
      {
        slug: "mode",
        title: "Agent permission mode",
        description: "Turn the knob to change what the agent may do without asking.",
        file: "detent-knob-mode.tsx",
      },
    ],
  },
  {
    slug: "push-to-talk",
    name: "Push to talk",
    category: "instruments",
    description:
      "A radio's push-to-talk key: it listens only while held, and letting go stops it. Nothing records by accident. For voice input to agents, walkie-talkie chat and dictation.",
    files: ["components/push-to-talk.tsx", "styles/push-to-talk.css"],
    dependencies: ["cn"],
    anatomy: `<PushToTalk talking={talking} onTalkingChange={setTalking}>
  <PushToTalkKey />
  <PushToTalkStatus />
</PushToTalk>`,
    parts: [
      {
        name: "PushToTalk",
        renders: "div",
        description: "talking, onTalkingChange(talking), disabled. The radio body and speaker grille.",
      },
      {
        name: "PushToTalkKey",
        renders: "button (aria-pressed)",
        description:
          "Pressed only while held, with the pointer or Space. Releasing, leaving the window or losing focus stops it; Enter does nothing, since it can't be held.",
      },
      {
        name: "PushToTalkStatus",
        renders: "p + status",
        description: "The on-air lamp and its words: idle and live, “Not listening” and “Listening” by default.",
      },
    ],
    examples: [
      {
        slug: "agent",
        title: "Voice notes to an agent",
        description: "Hold the key, or Space, to record a note. Let go to send it.",
        file: "push-to-talk-agent.tsx",
      },
    ],
  },
  {
    slug: "motorized-fader",
    name: "Motorized fader",
    category: "instruments",
    parent: "mixer-strip",
    description:
      "A console fader with a motor: when someone else sets it, the cap travels there on its own and says who moved it. Grab it and it's yours. For settings an agent, a teammate or an automation can change too.",
    files: ["components/motorized-fader.tsx", "styles/motorized-fader.css"],
    dependencies: ["cn"],
    anatomy: `<MotorizedFader
  aria-label="Temperature"
  value={value}
  changedBy={changedBy}
  onValueChange={(v) => { setValue(v); setChangedBy("You") }}
/>
<MotorizedFaderReadout value={format(value)} changedBy={changedBy} />`,
    parts: [
      {
        name: "MotorizedFader",
        renders: "div (slider)",
        description:
          "value, onValueChange, min, max, step, changedBy, you, format, disabled. Arrow keys, Page Up and Down, Home and End, or drag. Reads as “0.70, set by Agent”. With reduced motion it jumps instead of travelling.",
      },
      {
        name: "MotorizedFaderReadout",
        renders: "p",
        description: "A scribble strip: the value and who set it, lit when it wasn't you. Works on its own.",
      },
    ],
    examples: [
      {
        slug: "temperature",
        title: "Temperature the agent tunes",
        description: "The agent adjusts its own temperature; grab the fader to take over, then hand it back.",
        file: "motorized-fader-temperature.tsx",
      },
    ],
  },
  {
    slug: "mixer-strip",
    name: "Mixer strip",
    category: "instruments",
    description:
      "One channel of a mixing console per agent or source: its name, mute and solo keys, and a motorized fader that an orchestrator can move and you can take. For balancing subagents, models or data sources.",
    files: ["components/mixer-strip.tsx", "styles/mixer-strip.css"],
    registryDependencies: ["motorized-fader"],
    dependencies: ["@base-ui/react", "cn"],
    anatomy: `<Mixer aria-label="Subagents">
  <MixerStrip name="Research" muted={muted}>
    <MixerStripName />
    <MixerStripMute pressed={muted} onPressedChange={setMuted} />
    <MixerStripSolo pressed={solo} onPressedChange={setSolo} />
    <MixerStripFader value={share} onValueChange={setShare} changedBy={by} />
  </MixerStrip>
</Mixer>`,
    parts: [
      { name: "Mixer", renders: "div (group)", description: "A row of strips; scrolls sideways when narrow. Give it an aria-label." },
      {
        name: "MixerStrip",
        renders: "div (group)",
        description: "name labels the group and every control in it. muted dims it.",
      },
      { name: "MixerStripName", renders: "p", description: "The lit scribble strip with the name." },
      { name: "MixerStripMute", renders: "Toggle", description: "“Mute Research”. Lit red when pressed." },
      {
        name: "MixerStripSolo",
        renders: "Toggle",
        description: "“Solo Research”. Lit yellow when pressed. What solo silences is up to you.",
      },
      {
        name: "MixerStripFader",
        renders: "MotorizedFader",
        description: "“Research level”. Takes every MotorizedFader prop.",
      },
    ],
    examples: [
      {
        slug: "agents",
        title: "Subagents on a console",
        description:
          "A lead agent rebalances effort as it goes. Take a fader to override it; mute pauses a subagent, solo runs one alone.",
        file: "mixer-strip-agents.tsx",
      },
    ],
  },
  {
    slug: "keysort-filter",
    name: "Keysort filter",
    category: "records",
    description:
      "Edge-notched cards from the 1950s office: each hole along the top is an attribute, notched open if the card has it. Push needles through and the cards notched for all of them drop out. AND filtering you can see. For documents, tickets and records with tags.",
    files: ["components/keysort-filter.tsx", "styles/keysort-filter.css"],
    dependencies: ["@base-ui/react", "cn"],
    anatomy: `<KeysortFilter aria-label="Contracts">
  <KeysortFilterNeedles>
    <KeysortFilterNeedle value="nda">NDA</KeysortFilterNeedle>
    <KeysortFilterNeedle value="signed">Signed</KeysortFilterNeedle>
  </KeysortFilterNeedles>
  <KeysortFilterDeck>
    <KeysortFilterCard notches={["nda", "signed"]}>Acme mutual NDA</KeysortFilterCard>
  </KeysortFilterDeck>
  <KeysortFilterCount />
</KeysortFilter>`,
    parts: [
      {
        name: "KeysortFilter",
        renders: "div (group)",
        description: "value, defaultValue and onValueChange: the needles pushed through. Give it an aria-label.",
      },
      { name: "KeysortFilterNeedles", renders: "fieldset", description: "The needle rack." },
      {
        name: "KeysortFilterNeedle",
        renders: "Checkbox",
        description: "One attribute. Its hole appears on every card, in the order the needles are listed.",
      },
      { name: "KeysortFilterDeck", renders: "ul", description: "The cards, in a grid." },
      {
        name: "KeysortFilterCard",
        renders: "li",
        description: "notches: the attributes it has. Drops, and says “Matches”, when notched for every needle in.",
      },
      {
        name: "KeysortFilterCount",
        renders: "p (status)",
        description: "“2 of 8 cards match NDA and Signed.” Announced as needles go in and out.",
      },
    ],
    examples: [
      {
        slug: "contracts",
        title: "A drawer of contracts",
        description: "Push needles through to find the contracts with every attribute.",
        file: "keysort-filter-contracts.tsx",
        wide: true,
      },
    ],
  },
  {
    slug: "visible-file",
    name: "Visible file",
    category: "records",
    description:
      "A Kardex visible-index tray: each record shows only its edge, and coloured signal clips slide along it to mark where it stands, so a whole tray reads at a glance. For pipelines, renewals and task stages.",
    files: ["components/visible-file.tsx", "styles/visible-file.css"],
    dependencies: ["cn"],
    anatomy: `<VisibleFile aria-label="Agent tasks" scale={["Queued", "Plan", "Build", "Done"]}>
  <VisibleFileRow title="Fix login redirect" detail="Coder">
    <VisibleFileSignal value={2} label="Stage" />
  </VisibleFileRow>
</VisibleFile>`,
    parts: [
      {
        name: "VisibleFile",
        renders: "div (group) + ul",
        description: "scale: the positions printed across the top. Give it an aria-label.",
      },
      {
        name: "VisibleFileRow",
        renders: "li",
        description: "title and detail, typed on the card edge in its clear pocket.",
      },
      {
        name: "VisibleFileSignal",
        renders: "span",
        description: "value (an index into the scale), label, tone. Slides when it changes; reads as “Stage: Build.”",
      },
    ],
    examples: [
      {
        slug: "tasks",
        title: "Agent tasks by stage",
        description: "Signals slide along each card as its task moves through the stages.",
        file: "visible-file-tasks.tsx",
        wide: true,
      },
    ],
  },
]

export function getComponent(slug: string) {
  return components.find((c) => c.slug === slug)
}

export function componentsIn(category: Category["slug"]) {
  return components.filter((c) => c.category === category)
}

/** Top-level components in a category, for navigation. */
export function rootComponentsIn(category: Category["slug"]) {
  return componentsIn(category).filter((c) => !c.parent)
}

export function subcomponentsOf(slug: string) {
  return components.filter((c) => c.parent === slug)
}

export function componentHref(component: ComponentDoc) {
  return component.parent
    ? `/components/${component.parent}/${component.slug}`
    : `/components/${component.slug}`
}
