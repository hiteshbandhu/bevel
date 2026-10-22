import { CodeBlock } from "@/components/code-block"

/**
 * A tutorial step whose CSS is both shown and applied: the code block and the
 * live element read the same string, so the demo can't drift from the code.
 * Each step's `.button` selector is rewritten to a class of its own, and a
 * step's button carries every earlier step's class too, so steps build up.
 */
export type LabStep = { label: string; css: string }

const scoped = (css: string, i: number) => css.replaceAll(".button", `.lab-step-${i}`)

/** Every step's button side by side, each with the steps before it applied. */
export function LabRow({ steps, upTo }: { steps: LabStep[]; upTo?: number }) {
  const shown = steps.slice(0, upTo ?? steps.length)
  return (
    <figure className="my-6">
      <style>{steps.map((s, i) => scoped(s.css, i)).join("\n")}</style>
      <div className="tray grid grid-cols-2 gap-6 rounded-(--bevel-radius-xl) px-4 py-10 sm:grid-cols-4">
        {shown.map((step, i) => (
          <div key={step.label} className="flex flex-col items-center gap-3">
            <button type="button" className={steps.slice(0, i + 1).map((_, j) => `lab-step-${j}`).join(" ")}>
              Deploy
            </button>
            <span className="text-xs text-muted-foreground">
              {i + 1}. {step.label}
            </span>
          </div>
        ))}
      </div>
      <figcaption className="mt-2 text-sm text-muted-foreground">
        Each button adds one step to the one before it. Press them.
      </figcaption>
    </figure>
  )
}

/** One step's CSS, as shown in the text. */
export function LabCode({ step, title = "styles.css" }: { step: LabStep; title?: string }) {
  return <CodeBlock lang="css" title={title} code={step.css.trim()} />
}

/** Styles compared side by side: each is applied on its own, on its own surface. */
export function StyleRow({ styles }: { styles: (LabStep & { surface: string })[] }) {
  return (
    <figure className="my-6">
      <style>{styles.map((s, i) => s.css.replaceAll(".button", `.lab-style-${i}`)).join("\n")}</style>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {styles.map((style, i) => (
          <div
            key={style.label}
            className="flex flex-col items-center gap-4 rounded-(--bevel-radius-xl) px-4 py-10"
            style={{ background: style.surface }}
          >
            <button type="button" className={`lab-style-${i}`}>
              Deploy
            </button>
            <span className="rounded-full bg-black/55 px-2 py-0.5 text-xs text-white">{style.label}</span>
          </div>
        ))}
      </div>
      <figcaption className="mt-2 text-sm text-muted-foreground">The same button in each style. Press them.</figcaption>
    </figure>
  )
}
