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
]

export const components: ComponentDoc[] = [
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
    slug: "wallet",
    name: "Wallet",
    category: "money",
    description:
      "A customer's stored balance, shown as a leather wallet. Saved cards sit in it, and picking one pulls it out of the pocket.",
    files: ["components/wallet.tsx", "styles/wallet.css"],
    registryDependencies: ["payment-card"],
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
