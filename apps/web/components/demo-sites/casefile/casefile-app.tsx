"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import {
  KeysortFilter,
  KeysortFilterCard,
  KeysortFilterCount,
  KeysortFilterDeck,
  KeysortFilterNeedle,
  KeysortFilterNeedles,
} from "@workspace/ui/components/keysort-filter"
import { Redline, RedlineChange, RedlineDocument, RedlineToolbar, type RedlineDecision } from "@workspace/ui/components/redline"
import {
  Citation,
  CitationContent,
  CitationLocation,
  CitationQuote,
  CitationSource,
  CitationStatus,
  CitationTrigger,
} from "@workspace/ui/components/citation"
import { Redaction } from "@workspace/ui/components/redaction"
import {
  Approval,
  ApprovalActions,
  ApprovalDescription,
  ApprovalReject,
  ApprovalSeal,
  ApprovalSignature,
  ApprovalSignatures,
  ApprovalTitle,
  type ApprovalState,
} from "@workspace/ui/components/approval"
import { Stamp, StampDetail } from "@workspace/ui/components/stamp"
import { changeIds, contracts, needles, type Contract } from "./contracts"

const TODAY = "17 Oct 2026"

type Review = {
  decisions: Record<string, RedlineDecision>
  redacted: string[]
  opened: number[]
  approval: ApprovalState
}

const emptyReview: Review = { decisions: {}, redacted: [], opened: [], approval: "pending" }

function progressOf(contract: Contract, review: Review) {
  const changes = changeIds(contract)
  const decided = changes.filter((id) => review.decisions[id]).length
  const redacted = contract.note.flags.filter((f) => review.redacted.includes(f.id)).length
  const opened = contract.sources.filter((s) => review.opened.includes(s.n)).length
  return {
    changes: { done: decided, total: changes.length },
    redactions: { done: redacted, total: contract.note.flags.length },
    sources: { done: opened, total: contract.sources.length },
    ready: decided === changes.length && redacted === contract.note.flags.length && opened === contract.sources.length,
  }
}

/** Casefile: a legal review desk for one matter, with an AI assistant. */
export function CasefileApp() {
  const [pushed, setPushed] = React.useState<string[]>(["signed", "renews"])
  const [openId, setOpenId] = React.useState("msa")
  const [reviews, setReviews] = React.useState<Record<string, Review>>({})

  const contract = contracts.find((c) => c.id === openId) ?? contracts[0]!
  const review = reviews[contract.id] ?? emptyReview
  const update = React.useCallback(
    (id: string, patch: (r: Review) => Partial<Review>) =>
      setReviews((all) => {
        const current = all[id] ?? emptyReview
        return { ...all, [id]: { ...current, ...patch(current) } }
      }),
    []
  )
  const sentCount = contracts.filter((c) => reviews[c.id]?.approval === "approved").length

  const open = (id: string) => {
    setOpenId(id)
    // On a phone the desk is below the drawer: take the reader to it.
    if (window.matchMedia("(max-width: 63.999rem)").matches) {
      document.getElementById("desk")?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <span className="wordmark text-lg font-bold tracking-tight">Casefile</span>
          <nav aria-label="Casefile" className="order-last flex w-full gap-4 overflow-x-auto text-sm sm:order-none sm:w-auto">
            {[
              ["#drawer", "Drawer"],
              ["#desk", "Desk"],
              ["#assistant", "Assistant"],
              ["#outbox", "Outbox"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="shrink-0 rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                {label}
              </a>
            ))}
          </nav>
          <span className="ml-auto text-sm text-muted-foreground">
            Mira Castell · <span className="tabular-nums">{sentCount}</span> of {contracts.length} sent
          </span>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">Matter 2026-0417 · Commercial litigation</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Northwind v. Halberd — supply dispute</h1>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[30rem_minmax(0,1fr)]">
          <Drawer
            pushed={pushed}
            onPushedChange={setPushed}
            openId={contract.id}
            onOpen={open}
            reviews={reviews}
          />

          <div className="flex min-w-0 flex-col gap-6">
            <Desk contract={contract} review={review} update={update} />
            <Assistant contract={contract} review={review} update={update} />
            <Outbox contract={contract} review={review} update={update} />
          </div>
        </div>
      </main>
    </div>
  )
}

function Panel({
  id,
  title,
  description,
  className,
  children,
}: {
  id: string
  title: string
  description?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn("tray flex min-w-0 scroll-mt-4 flex-col gap-4 rounded-(--bevel-radius-xl) p-3 sm:p-5", className)}
    >
      <div className="flex flex-col gap-0.5 px-1">
        <h2 id={`${id}-title`} className="text-lg font-semibold tracking-tight">
          {title}
        </h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  )
}

function Drawer({
  pushed,
  onPushedChange,
  openId,
  onOpen,
  reviews,
}: {
  pushed: string[]
  onPushedChange: (value: string[]) => void
  openId: string
  onOpen: (id: string) => void
  reviews: Record<string, Review>
}) {
  return (
    <Panel
      id="drawer"
      title="Contract drawer"
      description="Push needles in to pull every contract with those terms. Open one to put it on the desk."
      className="lg:sticky lg:top-4 lg:self-start"
    >
      <KeysortFilter aria-label="Contracts in this matter" value={pushed} onValueChange={onPushedChange}>
        <KeysortFilterNeedles>
          {needles.map((n) => (
            <KeysortFilterNeedle key={n.value} value={n.value}>
              {n.label}
            </KeysortFilterNeedle>
          ))}
        </KeysortFilterNeedles>
        <KeysortFilterDeck>
          {contracts.map((c) => {
            const isOpen = c.id === openId
            const state = reviews[c.id]?.approval
            return (
              <KeysortFilterCard
                key={c.id}
                notches={c.tags}
                data-open={isOpen ? "" : undefined}
                className="data-open:ring-2 data-open:ring-ring"
              >
                <button
                  type="button"
                  onClick={() => onOpen(c.id)}
                  aria-current={isOpen ? "true" : undefined}
                  className="cursor-pointer rounded-sm text-left outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {c.title}
                  <span className="block text-xs font-normal opacity-75">
                    {c.ref}
                    {state === "approved" && " · sent"}
                    {state === "rejected" && " · sent back"}
                  </span>
                </button>
              </KeysortFilterCard>
            )
          })}
        </KeysortFilterDeck>
        <KeysortFilterCount className="px-1" />
      </KeysortFilter>
    </Panel>
  )
}

type PanelProps = {
  contract: Contract
  review: Review
  update: (id: string, patch: (r: Review) => Partial<Review>) => void
}

function SentStamp({ className }: { className?: string }) {
  return (
    <Stamp tone="blue" animate className={cn("pointer-events-none absolute", className)}>
      Sent
      <StampDetail>{TODAY}</StampDetail>
    </Stamp>
  )
}

function Desk({ contract, review, update }: PanelProps) {
  const sent = review.approval === "approved"
  return (
    <Panel
      id="desk"
      title="On the desk"
      description={`${contract.title}, ${contract.ref}. The assistant's suggested edits are in red ink; nothing changes until you decide.`}
    >
      <div className="relative">
        <Redline
          key={contract.id}
          className="max-w-none"
          decisions={review.decisions}
          onDecisionsChange={(decisions) => update(contract.id, () => ({ decisions }))}
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-(--bevel-paper-rule) px-5 pt-4 pb-3">
            <p className="text-xs font-medium tracking-wide text-(--bevel-paper-muted) uppercase">{contract.parties}</p>
            <Stamp tone="red" className="ml-auto">
              Privileged
            </Stamp>
          </div>
          <RedlineDocument className="text-[0.9375rem] sm:text-base">
            <strong>
              {contract.clause.number} {contract.clause.heading}.
            </strong>{" "}
            {contract.clause.body.map((s, i) =>
              typeof s === "string" ? (
                <React.Fragment key={i}>{s}</React.Fragment>
              ) : (
                <RedlineChange key={s.change} id={s.change} deletion={s.deletion} insertion={s.insertion} />
              )
            )}
          </RedlineDocument>
          {sent ? (
            <p className="border-t border-(--bevel-paper-rule) px-5 py-3 text-sm text-(--bevel-paper-muted)">
              Sent to {contract.note.to} with these decisions. The clause is locked.
            </p>
          ) : (
            <RedlineToolbar className="flex-wrap" />
          )}
        </Redline>
        {sent && <SentStamp className="right-4 bottom-14" />}
      </div>
    </Panel>
  )
}

function Assistant({ contract, review, update }: PanelProps) {
  const opened = contract.sources.filter((s) => review.opened.includes(s.n)).length
  return (
    <Panel
      id="assistant"
      title="Assistant"
      description={`Every claim is pinned to a source. You've opened ${opened} of ${contract.sources.length}.`}
    >
      <div className="flex flex-col gap-3 rounded-(--bevel-radius-lg) border bg-card p-4">
        <div className="self-end rounded-(--bevel-radius-md) bg-muted px-3 py-2 text-sm sm:max-w-[80%]">
          <span className="sr-only">You asked: </span>
          {contract.question}
        </div>
        <div className="flex flex-col gap-2 text-[0.9375rem] leading-relaxed">
          <p className="text-xs font-medium text-muted-foreground">Casefile assistant · drafted from this matter&apos;s documents</p>
          {contract.answer.map((paragraph, i) => (
            <p key={i}>
              {paragraph.map((seg, j) => {
                if (typeof seg === "string") return <React.Fragment key={j}>{seg}</React.Fragment>
                const source = contract.sources.find((s) => s.n === seg.cite)!
                return (
                  <Citation
                    key={j}
                    onOpenChange={(isOpen) => {
                      if (isOpen) update(contract.id, (r) => ({ opened: r.opened.includes(source.n) ? r.opened : [...r.opened, source.n] }))
                    }}
                  >
                    <CitationTrigger tone={source.external ? "blue" : "yellow"} abbreviation="Src." label="Source">
                      {source.n}
                    </CitationTrigger>
                    <CitationContent>
                      <CitationSource>{source.source}</CitationSource>
                      <CitationLocation>{source.location}</CitationLocation>
                      <CitationQuote>{source.quote}</CitationQuote>
                      <CitationStatus status={source.status}>{source.statusText}</CitationStatus>
                    </CitationContent>
                  </Citation>
                )
              })}
            </p>
          ))}
        </div>
        <ul aria-label="Sources" className="flex flex-col gap-1 border-t pt-3 text-sm">
          {contract.sources.map((s) => (
            <li key={s.n} className="flex flex-wrap gap-x-2">
              <span className="tabular-nums text-muted-foreground">{s.n}.</span>
              <span className="min-w-0 flex-1">
                {s.source}, {s.location}
              </span>
              <span className="text-muted-foreground">
                {review.opened.includes(s.n) ? (s.status === "unverified" ? "Checked: not found" : "Checked") : "Not opened"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  )
}

function Check({ done, total, label }: { done: number; total: number; label: string }) {
  const complete = done === total
  return (
    <li className="flex items-center gap-2">
      <span
        aria-hidden
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-full border text-xs",
          complete ? "border-foreground bg-foreground text-background" : "border-muted-foreground/50"
        )}
      >
        {complete ? "✓" : ""}
      </span>
      <span className="min-w-0 flex-1">{label}</span>
      <span className="tabular-nums text-muted-foreground">
        {complete ? "Done" : `${done} of ${total}`}
      </span>
    </li>
  )
}

function Outbox({ contract, review, update }: PanelProps) {
  const progress = progressOf(contract, review)
  const { note } = contract
  const sent = review.approval === "approved"
  const locked = review.approval !== "pending"
  const flag = (id: string) => note.flags.find((f) => f.id === id)!

  return (
    <Panel
      id="outbox"
      title="Outbox"
      description="The assistant drafted a cover note. Redact what shouldn't leave the firm, then seal it."
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <article aria-label="Cover note, as the recipient will see it" className="bevel-paper relative flex flex-col gap-3 rounded-(--bevel-radius-xs) p-5 text-sm leading-relaxed">
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-0.5 border-b border-(--bevel-paper-rule) pb-3 text-xs text-(--bevel-paper-muted)">
            <dt>To</dt>
            <dd className="break-words">
              {note.to}, {note.firm} &lt;{note.email}&gt;
            </dd>
            <dt>Subject</dt>
            <dd>{note.subject}</dd>
            <dt>Attached</dt>
            <dd>
              Clause {contract.clause.number}, marked up ({progress.changes.done} of {progress.changes.total} edits decided)
            </dd>
          </dl>
          {note.body.map((paragraph, i) => (
            <p key={i}>
              {paragraph.map((seg, j) => {
                if (typeof seg === "string") return <React.Fragment key={j}>{seg}</React.Fragment>
                const f = flag(seg.redact)
                return review.redacted.includes(f.id) ? (
                  <Redaction key={j} length={Math.min(f.text.length, 36)} reason={f.reason} />
                ) : (
                  <mark key={j} className="rounded-sm bg-(--bevel-pen-red)/12 px-0.5 text-inherit box-decoration-clone">
                    <span className="sr-only">Flagged as {f.reason}: </span>
                    {f.text}
                  </mark>
                )
              })}
            </p>
          ))}
          <p>Kind regards,<br />Castell Rowe LLP</p>
          {sent && <SentStamp className="top-4 right-4" />}
        </article>

        <div className="flex flex-col gap-4">
          <fieldset disabled={locked} className="flex flex-col gap-2 rounded-(--bevel-radius-lg) border bg-card p-4 text-sm">
            <legend className="px-1 font-medium">Flagged by the assistant</legend>
            {note.flags.map((f) => (
              <label key={f.id} className="flex cursor-pointer items-start gap-2 has-disabled:cursor-default">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 accent-foreground"
                  checked={review.redacted.includes(f.id)}
                  onChange={(e) =>
                    update(contract.id, (r) => ({
                      redacted: e.target.checked ? [...r.redacted, f.id] : r.redacted.filter((x) => x !== f.id),
                    }))
                  }
                />
                <span>
                  Redact {f.label.charAt(0).toLowerCase() + f.label.slice(1)}{" "}
                  <span className="text-muted-foreground">({f.reason})</span>
                </span>
              </label>
            ))}
          </fieldset>

          <div className="flex flex-col gap-2 rounded-(--bevel-radius-lg) border bg-card p-4 text-sm">
            <h3 className="font-medium">Before it leaves the firm</h3>
            <ul className="flex flex-col gap-1.5">
              <Check {...progress.changes} label="Decide every suggested edit" />
              <Check {...progress.sources} label="Open every source the answer cites" />
              <Check {...progress.redactions} label="Redact everything flagged" />
            </ul>
          </div>
        </div>
      </div>

      <Approval
        key={contract.id}
        className="max-w-none sm:max-w-md"
        state={review.approval}
        onApprove={() => {
          if (progress.ready) update(contract.id, () => ({ approval: "approved" }))
        }}
        onReject={() => update(contract.id, () => ({ approval: "rejected" }))}
      >
        <ApprovalTitle>Send to {note.firm}</ApprovalTitle>
        <ApprovalDescription>
          Casefile will email the redacted cover note and clause {contract.clause.number} to {note.to}. Sent email
          can&apos;t be recalled.
        </ApprovalDescription>
        <ApprovalSignatures>
          <ApprovalSignature name="Dana Okafor" signed />
          <ApprovalSignature name="Mira Castell" signed={sent} />
        </ApprovalSignatures>
        {!locked && !progress.ready && (
          <p className="text-(--bevel-paper-muted)">The seal unlocks when the checklist is done.</p>
        )}
        <ApprovalActions className="flex-wrap">
          <ApprovalReject>Send back</ApprovalReject>
          <ApprovalSeal disabled={!progress.ready} className="disabled:cursor-not-allowed disabled:opacity-50 data-disabled:cursor-not-allowed data-disabled:opacity-50" />
        </ApprovalActions>
        {locked && (
          <button
            type="button"
            onClick={() => update(contract.id, () => ({ approval: "pending" }))}
            className="h-9 self-start rounded-(--bevel-radius-sm) border border-(--bevel-paper-foreground)/30 px-3 font-medium text-(--bevel-paper-foreground) outline-none hover:bg-(--bevel-paper-foreground)/5 focus-visible:ring-2 focus-visible:ring-(--bevel-pen-blue)/50"
          >
            {sent ? "Reset this contract (demo)" : "Reopen for review"}
          </button>
        )}
      </Approval>
    </Panel>
  )
}
