/**
 * The demo sites: one product each, built only from Bevel components. Pages
 * live at /demo/<n>. Each also ships as a registry block: `folder` is its code
 * in components/demo-sites, `entry` the component its page renders.
 */
export const demoSites = [
  {
    n: 1,
    block: "agent-console",
    folder: "relay",
    entry: { name: "RelayApp", file: "relay-app" },
    name: "Relay",
    kind: "AI agent control room",
    description:
      "Supervise a coding agent and its subagents: set its autonomy, balance effort between subagents, hold the dead man's switch, and lift the cover to ship.",
    uses: ["engine-telegraph", "mixer-strip", "vigilance", "annunciator", "guarded-switch", "push-to-talk", "task-plan"],
  },
  {
    n: 2,
    block: "billing-desk",
    folder: "meterline",
    entry: { name: "Meterline", file: "meterline" },
    name: "Meterline",
    kind: "Usage billing",
    description:
      "A usage-based account page: the balance in a wallet, spend running on a meter, caps on breakers, the ledger, and API keys that expire on a library slip.",
    uses: ["wallet", "meter", "breaker", "ledger", "due-date-slip", "receipt"],
  },
  {
    n: 3,
    block: "release-hall",
    folder: "shipyard",
    entry: { name: "Shipyard", file: "shipyard" },
    name: "Shipyard",
    kind: "Release coordination",
    description:
      "A release board for a team: regions on a split-flap board, services moving through stages, a deploy queue, a freeze everyone must lift, and the promote switch.",
    uses: ["split-flap", "visible-file", "take-a-number", "lockout", "guarded-switch", "annunciator"],
  },
  {
    n: 4,
    block: "review-desk",
    folder: "casefile",
    entry: { name: "CasefileApp", file: "casefile-app" },
    name: "Casefile",
    kind: "Legal review desk",
    description:
      "A lawyer's desk with an AI assistant: pull contracts with needles, mark up a clause, check the answer's sources, redact, and seal before it leaves.",
    uses: ["keysort-filter", "redline", "citation", "redaction", "approval", "stamp"],
  },
] as const

export type DemoSite = (typeof demoSites)[number]
