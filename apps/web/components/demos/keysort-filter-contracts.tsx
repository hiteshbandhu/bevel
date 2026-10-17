"use client"

import {
  KeysortFilter,
  KeysortFilterCard,
  KeysortFilterCount,
  KeysortFilterDeck,
  KeysortFilterNeedle,
  KeysortFilterNeedles,
} from "@workspace/ui/components/keysort-filter"

const contracts = [
  { title: "Acme mutual NDA", tags: ["nda", "signed", "auto"] },
  { title: "Globex NDA, redlined", tags: ["nda", "eu"] },
  { title: "Initech supply agreement", tags: ["signed", "eu", "auto"] },
  { title: "Umbrella term sheet", tags: [] },
  { title: "Hooli data processing addendum", tags: ["signed", "eu", "dpa"] },
  { title: "Stark consulting SOW", tags: ["signed", "auto"] },
  { title: "Wayne one-way NDA", tags: ["nda"] },
  { title: "Tyrell DPA, draft", tags: ["eu", "dpa"] },
]

/** A drawer of contracts. Push needles through to find the ones with every attribute. */
export function KeysortFilterContracts() {
  return (
    <KeysortFilter aria-label="Contracts" className="max-w-2xl">
      <KeysortFilterNeedles>
        <KeysortFilterNeedle value="nda">NDA</KeysortFilterNeedle>
        <KeysortFilterNeedle value="signed">Signed</KeysortFilterNeedle>
        <KeysortFilterNeedle value="eu">EU law</KeysortFilterNeedle>
        <KeysortFilterNeedle value="auto">Auto-renews</KeysortFilterNeedle>
        <KeysortFilterNeedle value="dpa">Data processing</KeysortFilterNeedle>
      </KeysortFilterNeedles>
      <KeysortFilterDeck>
        {contracts.map((c) => (
          <KeysortFilterCard key={c.title} notches={c.tags}>
            {c.title}
          </KeysortFilterCard>
        ))}
      </KeysortFilterDeck>
      <KeysortFilterCount />
    </KeysortFilter>
  )
}
