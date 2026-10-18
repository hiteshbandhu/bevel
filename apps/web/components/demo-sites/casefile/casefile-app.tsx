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
import { Legend } from "../shared/environment"
import { documentFace } from "../shared/fonts"
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

/* The desk. Oak, lit from the upper left, with a grain that runs across it. */
const deskSurface: React.CSSProperties = {
  backgroundColor: "#3A2A1F",
  backgroundImage: [
    "radial-gradient(ellipse 80% 60% at 12% 0%, rgb(255 226 180 / 0.11), transparent 70%)",
    "radial-gradient(ellipse 90% 70% at 100% 100%, rgb(0 0 0 / 0.32), transparent 70%)",
    "repeating-linear-gradient(178deg, rgb(255 255 255 / 0.022) 0 2px, transparent 2px 9px, rgb(0 0 0 / 0.05) 9px 11px, transparent 11px 23px)",
    "repeating-linear-gradient(181deg, transparent 0 41px, rgb(0 0 0 / 0.07) 41px 44px, transparent 44px 97px)",
  ].join(", "),
}

/* Paper lying on the desk: its shadow falls down and to the right, away from the light. */
const onDesk = "shadow-[0_1px_1px_rgb(0_0_0/0.35),6px_14px_28px_-8px_rgb(0_0_0/0.6)]"

/* Words printed on the desk itself. */
const deskLegend = "font-normal italic tracking-normal text-[17px] [text-shadow:0_1px_0_rgb(0_0_0/0.5)]"

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
    <div
      className={cn(
        documentFace.variable,
        "min-h-svh overflow-x-clip font-[family-name:var(--font-document)] text-[#E7DCCB]",
        "[--foreground:#E7DCCB] [--muted-foreground:#B9A992] [--legend:#B9A992] [--ring:#C9B27A]"
      )}
      style={deskSurface}
    >
      <main className="mx-auto max-w-[1360px] px-4 pt-6 pb-20 sm:px-8 lg:pt-10">
        <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <FolderTab />
          <div className="flex items-end gap-8">
            <p className="text-[17px] text-[#B9A992] [text-shadow:0_1px_0_rgb(0_0_0/0.5)]">
              Mira Castell has sent <span className="text-[#E7DCCB] tabular-nums">{sentCount}</span> of {contracts.length}
            </p>
            <BankersLamp />
          </div>
        </header>

        <div className="mt-8 grid gap-x-12 gap-y-12 lg:mt-10 lg:grid-cols-[minmax(0,29rem)_minmax(0,1fr)] [&>*]:min-w-0">
          <Drawer pushed={pushed} onPushedChange={setPushed} openId={contract.id} onOpen={open} reviews={reviews} />

          <div className="flex min-w-0 flex-col gap-12">
            <Desk contract={contract} review={review} update={update} />
            <div className="grid gap-x-10 gap-y-12 md:grid-cols-2 [&>*]:min-w-0">
              <CoverNote contract={contract} review={review} update={update} />
              <Assistant contract={contract} review={review} update={update} />
            </div>
            <Outbox contract={contract} review={review} update={update} />
          </div>
        </div>
      </main>
    </div>
  )
}

/** The banker's lamp, seen from above: green glass shade on a brass arm. Its light falls on the open contract. */
function BankersLamp() {
  return (
    <div aria-hidden className="relative hidden h-24 w-56 lg:block">
      {/* Brass base and stem. */}
      <span className="absolute top-1 left-1/2 size-14 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#E9CF8A,#9C7A35_60%,#5E4718)] shadow-[4px_10px_18px_-4px_rgb(0_0_0/0.7)]" />
      {/* The shade: a long half-cylinder of cased green glass. */}
      <span className="absolute top-9 left-0 h-14 w-56 rounded-[28px] bg-[linear-gradient(180deg,#5FA571_0%,#1F6237_38%,#0E3A20_100%)] shadow-[inset_0_2px_0_rgb(255_255_255/0.35),inset_0_-3px_6px_rgb(0_0_0/0.5),6px_16px_24px_-6px_rgb(0_0_0/0.75)]" />
      <span className="absolute top-[42px] left-6 h-1.5 w-44 rounded-full bg-white/30 blur-[2px]" />
      {/* Brass end caps. */}
      <span className="absolute top-9 left-0 h-14 w-3 rounded-l-[28px] bg-[linear-gradient(180deg,#E3C67E,#7D5F24)]" />
      <span className="absolute top-9 right-0 h-14 w-3 rounded-r-[28px] bg-[linear-gradient(180deg,#E3C67E,#7D5F24)]" />
    </div>
  )
}

/** The matter's file folder, its typed label on the tab. */
function FolderTab() {
  return (
    <div className="relative min-w-0 max-w-full">
      {/* The tab, rising from the folder's edge. */}
      <div className={cn("relative z-10 inline-block max-w-full rounded-t-[10px] bg-[#D8BE8A] px-3 pt-3 pb-2", "shadow-[inset_0_1px_0_rgb(255_255_255/0.35)]")}>
        <div className="rounded-[2px] bg-[#FBF7EE] px-4 py-2 shadow-[0_1px_1px_rgb(0_0_0/0.25)]">
          <h1 className="text-[22px] leading-tight font-semibold text-[#2B2620] sm:text-[26px]">
            Northwind v. Halberd, supply dispute
          </h1>
          <p className="mt-0.5 text-[15px] text-[#6B6152]">Matter 2026-0417, commercial litigation</p>
        </div>
      </div>
      {/* The folder's front edge, running on under the papers. */}
      <div aria-hidden className={cn("-mt-px h-7 w-[calc(100%+4rem)] max-w-[calc(100vw-2rem)] rounded-r-[6px] bg-[#CFB37C]", onDesk)} />
    </div>
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
    <section id="drawer" aria-labelledby="drawer-title" className="flex scroll-mt-4 flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
      <Legend id="drawer-title" className={deskLegend}>
        Drawer
      </Legend>
      {/* A card file box: walnut sides, the cards standing in its well. */}
      <div className="rounded-[14px] bg-[#4A3526] p-1.5 sm:p-2.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_2px_2px_rgb(0_0_0/0.4),8px_18px_36px_-10px_rgb(0_0_0/0.7)]">
        <div className="rounded-[8px] bg-[#241911] px-1.5 pt-4 pb-4 [--keysort-filter-column:2.3rem] sm:[--keysort-filter-column:3.5rem] shadow-[inset_0_6px_14px_rgb(0_0_0/0.65),inset_0_-1px_0_rgb(255_255_255/0.06)] sm:px-4 lg:[--keysort-filter-column:3.4rem]">
          <KeysortFilter aria-label="Contracts in this matter" value={pushed} onValueChange={onPushedChange} className="text-[#E7DCCB]">
            <KeysortFilterNeedles className="[&_[data-slot=keysort-filter-needle]]:text-[12px] sm:[&_[data-slot=keysort-filter-needle]]:text-[13px]">
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
                    className="data-open:ring-2 data-open:ring-[#7FB08A] data-open:ring-offset-2 data-open:ring-offset-[#241911]"
                  >
                    <button
                      type="button"
                      onClick={() => onOpen(c.id)}
                      aria-current={isOpen ? "true" : undefined}
                      className="cursor-pointer rounded-sm text-left text-[14px] outline-none sm:text-[15px] hover:underline focus-visible:ring-2 focus-visible:ring-[#7FB08A]"
                    >
                      {c.title}
                      {state && (
                        <span className="block text-[13px] font-normal italic opacity-80">
                          {state === "approved" ? "Sent" : "Sent back"}
                        </span>
                      )}
                    </button>
                  </KeysortFilterCard>
                )
              })}
            </KeysortFilterDeck>
            <KeysortFilterCount className="px-1 text-[15px] text-[#B9A992]" />
          </KeysortFilter>
        </div>
      </div>
    </section>
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

/** The hero: the open contract, under the lamp. */
function Desk({ contract, review, update }: PanelProps) {
  const sent = review.approval === "approved"
  return (
    <section id="desk" aria-labelledby="desk-title" className="relative flex scroll-mt-4 flex-col gap-3">
      <Legend id="desk-title" className={deskLegend}>
        On the desk
      </Legend>
      {/* The banker's lamp: a warm pool on the page, a little green from its shade. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-16 -top-20 -bottom-24"
        style={{
          background:
            "radial-gradient(ellipse 58% 52% at 50% 45%, rgb(255 238 200 / 0.34), rgb(170 215 160 / 0.12) 50%, transparent 74%)",
        }}
      />
      <div className="relative z-10 [--bevel-paper:oklch(0.965_0.014_85)] sm:rotate-[-0.6deg]">
        <Redline
          key={contract.id}
          className={cn("max-w-none", onDesk)}
          decisions={review.decisions}
          onDecisionsChange={(decisions) => update(contract.id, () => ({ decisions }))}
        >
          <div className="flex flex-wrap items-start gap-x-4 gap-y-2 px-6 pt-6 sm:px-10 sm:pt-9">
            <div className="min-w-0 flex-1">
              <p className="text-[24px] leading-tight font-semibold text-(--bevel-paper-foreground) sm:text-[28px]">
                {contract.title}
              </p>
              <p className="mt-1 text-[15px] text-(--bevel-paper-muted)">{contract.parties}</p>
            </div>
            <Stamp tone="red" className="text-[15px]">
              Privileged
            </Stamp>
          </div>
          <RedlineDocument className="px-6 pt-5 pb-7 text-[18px] leading-[2.1] sm:px-10 sm:text-[21px]">
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
            <p className="border-t border-(--bevel-paper-rule) px-6 py-3 text-[15px] text-(--bevel-paper-muted) sm:px-10">
              Sent to {contract.note.to}. The clause is locked.
            </p>
          ) : (
            <RedlineToolbar className="flex-wrap px-6 text-[15px] sm:px-10" />
          )}
        </Redline>
        {sent && <SentStamp className="right-8 bottom-16" />}
      </div>
    </section>
  )
}

/** The cover note, tucked under the contract, with the assistant's flags on a sticky note. */
function CoverNote({ contract, review, update }: PanelProps) {
  const progress = progressOf(contract, review)
  const { note } = contract
  const sent = review.approval === "approved"
  const locked = review.approval !== "pending"
  const flag = (id: string) => note.flags.find((f) => f.id === id)!

  return (
    <section aria-label="Cover note" className="relative md:-mt-16 md:ml-2">
      <article
        aria-label="Cover note, as the recipient will see it"
        className={cn(
          "bevel-paper relative flex flex-col gap-3 rounded-(--bevel-radius-xs) px-6 pt-6 pb-24 text-[15px] leading-relaxed md:rotate-[1.3deg] md:pt-20",
          onDesk
        )}
      >
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-0.5 border-b border-(--bevel-paper-rule) pb-3 text-[14px] text-(--bevel-paper-muted)">
          <dt>To</dt>
          <dd className="break-words">
            {note.to}, {note.firm}
          </dd>
          <dt>Re</dt>
          <dd>{note.subject}</dd>
          <dt>Encl.</dt>
          <dd>
            Clause {contract.clause.number}, {progress.changes.done} of {progress.changes.total} edits decided
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
        <p>
          Kind regards,
          <br />
          Castell Rowe LLP
        </p>
        {sent && <SentStamp className="top-24 right-6" />}
      </article>

      {/* The assistant's flags, on a sticky note stuck to the bottom of the page. */}
      <fieldset
        disabled={locked}
        className={cn(
          "relative z-10 mx-auto -mt-20 flex [color-scheme:light] w-[min(100%,19rem)] flex-col gap-2 rounded-[2px] bg-[#F2DE7C] px-4 pt-3 pb-4 text-[15px] text-[#3B3215] rotate-[-2deg] sm:mr-4",
          "shadow-[0_1px_1px_rgb(0_0_0/0.25),4px_10px_16px_-6px_rgb(0_0_0/0.5)]"
        )}
      >
        <legend className="float-left mb-1 w-full font-semibold">Redact before sending</legend>
        {note.flags.map((f) => (
          <label key={f.id} className="flex cursor-pointer items-start gap-2 leading-snug has-disabled:cursor-default">
            <input
              type="checkbox"
              className="mt-1 size-4 shrink-0 accent-[#3B3215]"
              checked={review.redacted.includes(f.id)}
              onChange={(e) =>
                update(contract.id, (r) => ({
                  redacted: e.target.checked ? [...r.redacted, f.id] : r.redacted.filter((x) => x !== f.id),
                }))
              }
            />
            <span>
              {f.label} <span className="italic opacity-75">({f.reason})</span>
            </span>
          </label>
        ))}
      </fieldset>
    </section>
  )
}

/** The assistant's answer, printed as a memo, every claim stickered to its source. */
function Assistant({ contract, review, update }: PanelProps) {
  return (
    <section id="assistant" aria-labelledby="assistant-title" className="flex scroll-mt-4 flex-col gap-3">
      <Legend id="assistant-title" className={deskLegend}>
        Assistant
      </Legend>
      <article
        className={cn(
          "bevel-paper flex flex-col gap-4 rounded-(--bevel-radius-xs) px-6 py-6 text-[16px] leading-relaxed md:rotate-[-1.4deg]",
          onDesk
        )}
      >
        <p className="border-b border-(--bevel-paper-rule) pb-3 text-[17px] italic text-(--bevel-paper-foreground)">
          <span className="sr-only">You asked: </span>
          {contract.question}
        </p>
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
        <ol aria-label="Sources" className="flex flex-col gap-1.5 border-t border-(--bevel-paper-rule) pt-3 text-[14px] leading-snug text-(--bevel-paper-muted)">
          {contract.sources.map((s) => {
            const opened = review.opened.includes(s.n)
            return (
              <li key={s.n} className="flex gap-2">
                <span className="tabular-nums">{s.n}.</span>
                <span className="min-w-0 flex-1">
                  {s.source}, {s.location}
                </span>
                <span className={cn("shrink-0 italic", opened && "text-(--bevel-pen-blue)")}>
                  {opened ? (s.status === "unverified" ? "Not found" : "Checked") : "Unread"}
                </span>
              </li>
            )
          })}
        </ol>
      </article>
    </section>
  )
}

function Check({ done, total, label }: { done: number; total: number; label: string }) {
  const complete = done === total
  return (
    <li className="flex items-start gap-2.5">
      <span
        aria-hidden
        className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-[3px] border border-(--bevel-paper-foreground)/45 text-[17px] leading-none font-bold text-(--bevel-pen-blue)"
      >
        {complete ? "✓" : ""}
      </span>
      <span className="min-w-0 flex-1">
        {label}
        <span className="sr-only">{complete ? ", done" : `, ${done} of ${total}`}</span>
      </span>
      {!complete && (
        <span aria-hidden className="tabular-nums text-(--bevel-paper-muted)">
          {done}/{total}
        </span>
      )}
    </li>
  )
}

/** Before it leaves: the checklist slip and the seal press. */
function Outbox({ contract, review, update }: PanelProps) {
  const progress = progressOf(contract, review)
  const { note } = contract
  const sent = review.approval === "approved"
  const locked = review.approval !== "pending"

  return (
    <section id="outbox" aria-labelledby="outbox-title" className="flex scroll-mt-4 flex-col gap-3">
      <Legend id="outbox-title" className={deskLegend}>
        Before it leaves
      </Legend>
      <div className="flex flex-col items-stretch gap-8 sm:flex-row sm:items-start sm:justify-end">
        <div
          className={cn(
            "bevel-paper relative z-10 flex flex-col gap-2 self-center rounded-[2px] px-5 py-4 text-[15px] leading-snug sm:mt-14 sm:-mr-3 sm:w-64 sm:shrink-0 sm:rotate-[2.6deg]",
            onDesk
          )}
        >
          <ul aria-label="Checklist" className="flex flex-col gap-2.5">
            <Check {...progress.changes} label="Decide every edit" />
            <Check {...progress.sources} label="Read every source" />
            <Check {...progress.redactions} label="Redact every flag" />
          </ul>
        </div>

        <Approval
          key={contract.id}
          className={cn("max-w-none sm:max-w-md sm:rotate-[-0.8deg] text-[15px]", onDesk)}
          state={review.approval}
          onApprove={() => {
            if (progress.ready) update(contract.id, () => ({ approval: "approved" }))
          }}
          onReject={() => update(contract.id, () => ({ approval: "rejected" }))}
        >
          <ApprovalTitle className="text-[19px]">Send to {note.firm}</ApprovalTitle>
          <ApprovalDescription>
            The redacted note and clause {contract.clause.number} go to {note.to}. Sent email can&apos;t be recalled.
          </ApprovalDescription>
          <ApprovalSignatures>
            <ApprovalSignature name="Dana Okafor" signed />
            <ApprovalSignature name="Mira Castell" signed={sent} />
          </ApprovalSignatures>
          {!locked && !progress.ready && (
            <p className="text-(--bevel-pen-red)">The seal is locked until the checklist is done.</p>
          )}
          <ApprovalActions className="flex-wrap">
            <ApprovalReject>Send back</ApprovalReject>
            <ApprovalSeal
              disabled={!progress.ready}
              className="size-20 disabled:cursor-not-allowed disabled:opacity-50 data-disabled:cursor-not-allowed data-disabled:opacity-50"
            />
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
      </div>
    </section>
  )
}
