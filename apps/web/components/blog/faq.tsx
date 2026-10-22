import { Fragment } from "react"

/**
 * A post's questions, written once: rendered as headings and answers, and
 * given to search engines as FAQPage structured data from the same text.
 */
export type Question = { q: string; a: string }

export function Faq({ items }: { items: Question[] }) {
  return (
    <>
      <h2>Frequently asked questions</h2>
      {items.map((item) => (
        <Fragment key={item.q}>
          <h3>{item.q}</h3>
          <p>{item.a}</p>
        </Fragment>
      ))}
    </>
  )
}

export const faqData = (items: Question[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
})
