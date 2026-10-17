/**
 * The contracts in the Northwind v. Halberd drawer. Everything here is
 * fictional: parties, people, numbers, cases.
 */

/** A run of clause text, or one of the assistant's proposed edits. */
export type ClauseSegment = string | { change: string; deletion?: string; insertion?: string }

/** A run of answer text, or a pinned source by number. */
export type AnswerSegment = string | { cite: number }

/** A run of the cover note, or a detail the assistant flagged for redaction. */
export type NoteSegment = string | { redact: string }

export type Source = {
  n: number
  source: string
  location: string
  quote: string
  status: "verified" | "caution" | "unverified"
  statusText?: string
  /** A non-contract source gets a blue sticker. */
  external?: boolean
}

export type Flag = { id: string; label: string; reason: string; text: string }

export type Contract = {
  id: string
  title: string
  parties: string
  ref: string
  tags: string[]
  clause: { number: string; heading: string; body: ClauseSegment[] }
  question: string
  answer: AnswerSegment[][]
  sources: Source[]
  note: {
    to: string
    firm: string
    email: string
    subject: string
    body: NoteSegment[][]
    flags: Flag[]
  }
}

export const needles = [
  { value: "nda", label: "NDA" },
  { value: "signed", label: "Signed" },
  { value: "eu", label: "EU law" },
  { value: "renews", label: "Renews" },
  { value: "dpa", label: "DPA" },
] as const

export const contracts: Contract[] = [
  {
    id: "msa",
    title: "Master supply agreement",
    parties: "Northwind Freight B.V. and Halberd Components GmbH",
    ref: "NW-031",
    tags: ["signed", "eu", "renews"],
    clause: {
      number: "14.3",
      heading: "Limitation of liability",
      body: [
        "Neither party's total liability under this Agreement shall exceed the fees paid in the ",
        { change: "cap", deletion: "three (3)", insertion: "twelve (12)" },
        " months before the claim arose. This cap does not apply to ",
        { change: "carve", insertion: "breach of clause 9 (Confidentiality), " },
        "fraud or wilful misconduct",
        { change: "notice", insertion: ", and no claim is barred for want of notice given within ninety (90) days" },
        ".",
      ],
    },
    question: "Can Northwind recover the full cost of the March shortfall, or does the cap bite?",
    answer: [
      [
        "Probably not in full. Liability is capped at three months' fees",
        { cite: 1 },
        ", about €410,000 on the current run rate, against a claimed loss of €1.2m.",
      ],
      [
        "The cap doesn't apply to wilful misconduct, and Halberd's own email shows it moved Northwind's allocated stock to another buyer",
        { cite: 2 },
        ". The agreement renewed on 1 January",
        { cite: 3 },
        ", so the current terms apply. I found a case striking down a similar cap",
        { cite: 4 },
        ", but couldn't confirm it exists. Don't rely on it.",
      ],
    ],
    sources: [
      {
        n: 1,
        source: "Master supply agreement",
        location: "p. 22, clause 14.3",
        quote: "Neither party's total liability under this Agreement shall exceed the fees paid in the three (3) months before the claim arose.",
        status: "verified",
      },
      {
        n: 2,
        source: "Halberd internal email, 4 Mar 2026",
        location: "Disclosure bundle, tab 7",
        quote: "Move the Northwind allocation to Vantor for this run. We'll make it up in April.",
        status: "verified",
        external: true,
      },
      {
        n: 3,
        source: "Master supply agreement",
        location: "p. 3, clause 2.2",
        quote: "This Agreement renews automatically for successive twelve-month terms unless either party gives ninety (90) days' notice.",
        status: "verified",
      },
      {
        n: 4,
        source: "Brennan Freight v. Ostmark AG (2021)",
        location: "¶ 18, as cited",
        quote: "No matching passage found in any reporter Casefile can search.",
        status: "unverified",
        external: true,
      },
    ],
    note: {
      to: "Ines Varga",
      firm: "Varga Lindqvist",
      email: "i.varga@vargalindqvist.example",
      subject: "Northwind / Halberd: proposed amendment to clause 14.3",
      body: [
        ["Dear Ms Varga,"],
        [
          "Further to our call, please find our proposed amendment to clause 14.3 of the supply agreement. ",
          { redact: "contact" },
          " can confirm the shortfall figures on request.",
        ],
        [{ redact: "strategy" }, " We look forward to your client's response by 31 October."],
      ],
      flags: [
        { id: "contact", label: "Client contact's name and mobile", reason: "personal data", text: "Our client's operations lead, Tomas Reyes (+31 6 1234 5678)," },
        { id: "strategy", label: "Our view on the cap", reason: "privileged", text: "We think the cap is unlikely to survive the diversion of stock." },
      ],
    },
  },
  {
    id: "nda",
    title: "Mutual NDA",
    parties: "Northwind Freight B.V. and Halberd Components GmbH",
    ref: "NW-012",
    tags: ["nda", "signed"],
    clause: {
      number: "5.1",
      heading: "Duration of confidentiality",
      body: [
        "The obligations in this Agreement last for ",
        { change: "term", deletion: "two (2)", insertion: "five (5)" },
        " years after each disclosure",
        { change: "secrets", insertion: ", and for trade secrets, for as long as the information remains a trade secret" },
        ".",
      ],
    },
    question: "Can we put Halberd's pricing sheet in front of the court?",
    answer: [
      [
        "Yes, with care. Either party may disclose Confidential Information when a court requires it",
        { cite: 1 },
        ", provided it gives the other side prompt written notice first",
        { cite: 2 },
        ".",
      ],
      [
        "The sheet is marked confidential but undated",
        { cite: 3 },
        ", so we should file it under seal and confirm which version Halberd sent.",
      ],
    ],
    sources: [
      {
        n: 1,
        source: "Mutual NDA",
        location: "p. 4, clause 6.2",
        quote: "Nothing in this Agreement prevents disclosure required by law or by order of a competent court.",
        status: "verified",
      },
      {
        n: 2,
        source: "Mutual NDA",
        location: "p. 4, clause 6.3",
        quote: "The disclosing party shall give prompt written notice before any such disclosure, where lawful.",
        status: "verified",
      },
      {
        n: 3,
        source: "Halberd pricing sheet",
        location: "Disclosure bundle, tab 12, footer",
        quote: "Halberd Components. Confidential. Not for distribution.",
        status: "caution",
        statusText: "Undated",
        external: true,
      },
    ],
    note: {
      to: "Ines Varga",
      firm: "Varga Lindqvist",
      email: "i.varga@vargalindqvist.example",
      subject: "Northwind / Halberd: notice under clause 6.3 of the NDA",
      body: [
        ["Dear Ms Varga,"],
        [
          "We give notice under clause 6.3 that our client intends to file Halberd's pricing sheet with the court, under seal. We also attach a proposed amendment to clause 5.1.",
        ],
        [{ redact: "author" }],
      ],
      flags: [
        { id: "author", label: "Associate's direct line", reason: "personal data", text: "Drafted by Mira Castell, direct line +44 20 7946 0113." },
      ],
    },
  },
  {
    id: "dpa",
    title: "Data processing addendum",
    parties: "Northwind Freight B.V. (controller) and Halberd Components GmbH (processor)",
    ref: "NW-033",
    tags: ["signed", "eu", "dpa"],
    clause: {
      number: "8.1",
      heading: "Breach notification",
      body: [
        "The processor shall notify the controller of a personal data breach ",
        { change: "speed", deletion: "without undue delay", insertion: "within twenty-four (24) hours" },
        " after becoming aware of it",
        { change: "annex", insertion: ", with the information listed in Annex 3" },
        ".",
      ],
    },
    question: "Did Halberd breach the DPA when the shipment manifests leaked?",
    answer: [
      [
        "Arguably. Halberd had to tell us without undue delay",
        { cite: 1 },
        ", and its first notice came nine days after it found the leak",
        { cite: 2 },
        ".",
      ],
      [
        "We then had 72 hours to tell the regulator",
        { cite: 3 },
        ", which a nine-day gap makes hard. That's why I suggest a fixed 24-hour window.",
      ],
    ],
    sources: [
      {
        n: 1,
        source: "Data processing addendum",
        location: "p. 6, clause 8.1",
        quote: "The processor shall notify the controller of a personal data breach without undue delay after becoming aware of it.",
        status: "verified",
      },
      {
        n: 2,
        source: "Halberd letter, 22 Aug 2026",
        location: "Disclosure bundle, tab 19, para. 2",
        quote: "Our team identified the exposure on 13 August and has since contained it.",
        status: "verified",
        external: true,
      },
      {
        n: 3,
        source: "GDPR, Article 33(1)",
        location: "Regulation (EU) 2016/679",
        quote: "…not later than 72 hours after having become aware of it…",
        status: "verified",
        external: true,
      },
    ],
    note: {
      to: "Ines Varga",
      firm: "Varga Lindqvist",
      email: "i.varga@vargalindqvist.example",
      subject: "Northwind / Halberd: breach notification under the DPA",
      body: [
        ["Dear Ms Varga,"],
        [
          "The leaked manifests included the home address of ",
          { redact: "driver" },
          " Please confirm what was exposed and when, and see our proposed amendment to clause 8.1.",
        ],
        [{ redact: "regulator" }],
      ],
      flags: [
        { id: "driver", label: "Driver's name", reason: "personal data", text: "one of our client's drivers, Pieter Aalders." },
        { id: "regulator", label: "Internal note on the regulator", reason: "privileged", text: "Internal: we reported late to the regulator and may face a fine." },
      ],
    },
  },
  {
    id: "whs",
    title: "Kessler warehousing",
    parties: "Northwind Freight B.V. and Kessler Logistics Ltd",
    ref: "NW-020",
    tags: ["signed", "renews"],
    clause: {
      number: "11.2",
      heading: "Termination for supply failure",
      body: [
        "Northwind may end this Agreement on ",
        { change: "notice", deletion: "six (6) months'", insertion: "sixty (60) days'" },
        " written notice if its principal supplier fails to deliver for ",
        { change: "weeks", deletion: "twelve (12)", insertion: "eight (8)" },
        " consecutive weeks.",
      ],
    },
    question: "If Halberd stock stops, can Northwind get out of the Kessler warehouse?",
    answer: [
      [
        "Yes, but slowly. Northwind can end it on six months' notice once supply has failed for twelve weeks",
        { cite: 1 },
        ". Until then it pays for the space, empty or not",
        { cite: 2 },
        ".",
      ],
    ],
    sources: [
      {
        n: 1,
        source: "Kessler warehousing agreement",
        location: "p. 9, clause 11.2",
        quote: "Northwind may end this Agreement on six (6) months' written notice if its principal supplier fails to deliver for twelve (12) consecutive weeks.",
        status: "verified",
      },
      {
        n: 2,
        source: "Kessler warehousing agreement",
        location: "Schedule 1, fees",
        quote: "Storage fees are payable monthly for the reserved area, whether or not used.",
        status: "verified",
      },
    ],
    note: {
      to: "Owen Hartley",
      firm: "Kessler Logistics",
      email: "legal@kesslerlogistics.example",
      subject: "Proposed amendment to clause 11.2",
      body: [
        ["Dear Mr Hartley,"],
        [
          "Given the supply position, our client proposes the attached amendment to clause 11.2. ",
          { redact: "dispute" },
        ],
      ],
      flags: [
        { id: "dispute", label: "Reference to the Halberd claim", reason: "privileged", text: "This is driven by our claim against Halberd, which we expect to settle." },
      ],
    },
  },
  {
    id: "ts",
    title: "Settlement term sheet, draft",
    parties: "Northwind Freight B.V. and Halberd Components GmbH",
    ref: "NW-041",
    tags: ["eu"],
    clause: {
      number: "3",
      heading: "Payment",
      body: [
        "Halberd shall pay Northwind ",
        { change: "sum", deletion: "€600,000", insertion: "€850,000" },
        " in full and final settlement, within ",
        { change: "days", deletion: "sixty (60)", insertion: "thirty (30)" },
        " days of signature.",
      ],
    },
    question: "Is €850,000 a defensible opening number?",
    answer: [
      [
        "It's within range. The cap limits a contract claim to about €410,000",
        { cite: 1 },
        ", but the misconduct carve-out could lift it to the full €1.2m loss",
        { cite: 2 },
        ". €850,000 prices in roughly even odds on the carve-out.",
      ],
    ],
    sources: [
      {
        n: 1,
        source: "Master supply agreement",
        location: "p. 22, clause 14.3",
        quote: "…shall exceed the fees paid in the three (3) months before the claim arose.",
        status: "verified",
      },
      {
        n: 2,
        source: "Loss schedule, v4",
        location: "Expert report, table 2",
        quote: "Total loss, March shortfall: €1,204,300.",
        status: "caution",
        statusText: "Draft",
        external: true,
      },
    ],
    note: {
      to: "Ines Varga",
      firm: "Varga Lindqvist",
      email: "i.varga@vargalindqvist.example",
      subject: "Without prejudice: settlement terms",
      body: [
        ["Dear Ms Varga,"],
        [
          "Without prejudice save as to costs, we enclose revised settlement terms. ",
          { redact: "floor" },
        ],
      ],
      flags: [
        { id: "floor", label: "Client's walk-away figure", reason: "privileged", text: "Our client would accept €700,000 if pressed." },
      ],
    },
  },
  {
    id: "orrin",
    title: "Orrin Metals NDA",
    parties: "Northwind Freight B.V. and Orrin Metals S.A.",
    ref: "NW-044",
    tags: ["nda", "renews"],
    clause: {
      number: "2.1",
      heading: "Permitted purpose",
      body: [
        "Northwind may use the Information only to evaluate ",
        { change: "purpose", deletion: "a supply relationship", insertion: "a replacement supply relationship" },
        " with Orrin",
        { change: "advisers", insertion: ", and may share it with its legal advisers" },
        ".",
      ],
    },
    question: "Can we show Orrin's quote to our expert as evidence of replacement cost?",
    answer: [
      [
        "Not yet. Use is limited to evaluating a supply relationship",
        { cite: 1 },
        ", and only named recipients may see it",
        { cite: 2 },
        ". The proposed edit adds legal advisers, which would cover the expert through us.",
      ],
    ],
    sources: [
      {
        n: 1,
        source: "Orrin Metals NDA",
        location: "p. 1, clause 2.1",
        quote: "Northwind may use the Information only to evaluate a supply relationship with Orrin.",
        status: "verified",
      },
      {
        n: 2,
        source: "Orrin Metals NDA",
        location: "p. 2, clause 3.4",
        quote: "Information may be shared only with the employees named in Schedule A.",
        status: "verified",
      },
    ],
    note: {
      to: "Lucía Ferrer",
      firm: "Orrin Metals",
      email: "l.ferrer@orrinmetals.example",
      subject: "NDA: request to extend permitted purpose",
      body: [
        ["Dear Ms Ferrer,"],
        [
          "We act for Northwind and propose the attached change to clause 2.1, so we can review your quote with our client. ",
          { redact: "reason" },
        ],
      ],
      flags: [
        { id: "reason", label: "Why we really want it", reason: "privileged", text: "We intend to use it as evidence of replacement cost against Halberd." },
      ],
    },
  },
]

/** Every change id in a clause. */
export function changeIds(contract: Contract) {
  return contract.clause.body.flatMap((s) => (typeof s === "string" ? [] : [s.change]))
}
