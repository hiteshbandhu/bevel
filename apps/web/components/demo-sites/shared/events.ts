/**
 * Announces a milestone in a demo (a merge, a top-up) as a DOM event. It
 * does nothing on its own; a page that wants to count milestones listens
 * for "bevel:demo". The Bevel site forwards them to its analytics.
 */
export function demoMilestone(demo: string, action: string) {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent("bevel:demo", { detail: { demo, action } }))
}
