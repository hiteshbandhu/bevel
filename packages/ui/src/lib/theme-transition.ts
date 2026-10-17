import { flushSync } from "react-dom"

type Theme = "light" | "dark"

/**
 * Switches theme as a change in lighting: going dark, the room dims;
 * going light, the lights come up. `apply` must update the theme (e.g.
 * next-themes' `setTheme`). Falls back to an instant swap when View
 * Transitions are unsupported or the user prefers reduced motion.
 */
function transitionTheme(to: Theme, apply: () => void) {
  const root = document.documentElement
  if (
    typeof document.startViewTransition !== "function" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    apply()
    return
  }

  root.dataset.themeTransition = to
  const transition = document.startViewTransition(() => flushSync(apply))
  // Skipped transitions (hidden tab, a toggle interrupting the last one)
  // reject `ready`; the theme still applies, so there is nothing to report.
  transition.ready.catch(() => {})
  transition.finished.finally(() => delete root.dataset.themeTransition)
}

export { transitionTheme }
export type { Theme }
