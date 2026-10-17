"use client"

import {
  Citation,
  CitationContent,
  CitationLocation,
  CitationQuote,
  CitationSource,
  CitationStatus,
  CitationTrigger,
} from "@workspace/ui/components/citation"

/** An agent's answer with its sources pinned in. Open a sticker to read the passage. */
export function CitationAnswer() {
  return (
    <div className="max-w-md space-y-3 text-[0.9375rem] leading-relaxed">
      <p>
        The landlord can end the lease on thirty days&apos; notice
        <Citation>
          <CitationTrigger>1</CitationTrigger>
          <CitationContent>
            <CitationSource>Lease agreement, Harbor Street</CitationSource>
            <CitationLocation>p. 14, clause 9.2</CitationLocation>
            <CitationQuote>
              Either party may end this lease on thirty (30) days&apos; written notice.
            </CitationQuote>
            <CitationStatus status="verified" />
          </CitationContent>
        </Citation>
        , but notice must be written and delivered to the address in the schedule
        <Citation>
          <CitationTrigger>2</CitationTrigger>
          <CitationContent>
            <CitationSource>Lease agreement, Schedule B</CitationSource>
            <CitationLocation>p. 31</CitationLocation>
            <CitationQuote>Notices: 400 Harbor Street, Suite 12, attention of the Tenant.</CitationQuote>
            <CitationStatus status="verified" />
          </CitationContent>
        </Citation>
        .
      </p>
      <p>
        Courts have read similar clauses strictly
        <Citation>
          <CitationTrigger tone="blue">3</CitationTrigger>
          <CitationContent>
            <CitationSource>Marlow v. Pierce Holdings (2019)</CitationSource>
            <CitationLocation>¶ 42</CitationLocation>
            <CitationQuote>A notice not delivered as the lease requires is no notice at all.</CitationQuote>
            <CitationStatus status="caution">Appealed</CitationStatus>
          </CitationContent>
        </Citation>
        , so email alone may not count.
      </p>
    </div>
  )
}
