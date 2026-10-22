import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, waitFor } from "storybook/test"
import { Kbd, KbdGroup } from "@workspace/ui/components/kbd"

const meta: Meta<typeof Kbd> = {
  title: "Essentials/Kbd",
  component: Kbd,
  parameters: { layout: "centered" },
  args: { children: "K" },
}

export default meta
type Story = StoryObj<typeof Kbd>

export const Default: Story = {}

/** Symbols are drawn on the cap and read aloud by name. */
export const Combo: Story = {
  render: () => (
    <p className="text-sm">
      Press{" "}
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>{" "}
      to search, or <Kbd>Esc</Kbd> to close.
    </p>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector(".sr-only")).toHaveTextContent("Command")
  },
}

export const Legends: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {["⌘", "⌥", "⇧", "⌃", "↵", "⌫", "⇥", "↑", "↓", "←", "→", "Esc", "Space", "Ctrl", "F12"].map((k) => (
        <Kbd key={k}>{k}</Kbd>
      ))}
    </div>
  ),
}

/** Listening caps go down when you press the real key, and come back up when you let go. */
export const Listen: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4">
      <KbdGroup>
        <Kbd listen>⌘</Kbd>
        <Kbd listen>K</Kbd>
      </KbdGroup>
      <input aria-label="Search" placeholder="Typing here doesn't press caps" className="rounded border px-2 py-1 text-sm" />
    </div>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const [, k] = canvasElement.querySelectorAll<HTMLElement>('[data-slot="kbd"]')
    await expect(k).toHaveAttribute("data-listening")
    await userEvent.keyboard("{k>}")
    await waitFor(() => expect(k).toHaveAttribute("data-pressed"))
    await userEvent.keyboard("{/k}")
    await waitFor(() => expect(k).not.toHaveAttribute("data-pressed"))
    // Shift changes the key to "K", but it's the same cap.
    await userEvent.keyboard("{Shift>}{k>}")
    await waitFor(() => expect(k).toHaveAttribute("data-pressed"))
    await userEvent.keyboard("{/k}{/Shift}")
    await waitFor(() => expect(k).not.toHaveAttribute("data-pressed"))
  },
}

/** Focus in a field: keys type, the caps stay still. */
export const IgnoresTyping: Story = {
  render: Listen.render,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const [, k] = canvasElement.querySelectorAll<HTMLElement>('[data-slot="kbd"]')
    await userEvent.click(canvas.getByRole("textbox", { name: "Search" }))
    await userEvent.keyboard("{k>}")
    await expect(k).not.toHaveAttribute("data-pressed")
    await userEvent.keyboard("{/k}")
  },
}

/** A named key: "mod" is ⌘ on Apple and Ctrl elsewhere. */
export const NamedKey: Story = {
  args: { listen: "Escape", children: "Esc" },
  play: async ({ canvasElement, userEvent }) => {
    const cap = canvasElement.querySelector('[data-slot="kbd"]')
    await userEvent.keyboard("{Escape>}")
    await waitFor(() => expect(cap).toHaveAttribute("data-pressed"))
    await userEvent.keyboard("{/Escape}")
    await waitFor(() => expect(cap).not.toHaveAttribute("data-pressed"))
  },
}

/** In a line of body text and inside a heading. */
export const Inline: Story = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-2">
      <h3 className="text-lg font-semibold">
        Command menu <Kbd>⌘</Kbd> <Kbd>K</Kbd>
      </h3>
      <p className="text-sm text-muted-foreground">
        Select a row and press <Kbd>↵</Kbd> to open it, <Kbd>⌫</Kbd> to archive it, or hold <Kbd>⇧</Kbd> to select a
        range.
      </p>
    </div>
  ),
}

export const Dark: Story = { globals: { theme: "dark" }, render: Legends.render }

export const ReducedMotion: Story = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-slot="kbd-cap"]')?.className).toContain(
      "motion-reduce:transition-none"
    )
  },
}
