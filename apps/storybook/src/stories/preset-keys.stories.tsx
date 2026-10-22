import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, waitFor } from "storybook/test"
import {
  PresetKey,
  PresetKeys,
  PresetTabs,
  PresetTabsList,
  PresetTabsPanel,
  PresetTabsTab,
} from "@workspace/ui/components/preset-keys"

const meta: Meta<typeof PresetTabs> = {
  title: "Essentials/Preset keys",
  component: PresetTabs,
  parameters: { layout: "centered" },
  args: { defaultValue: "preview", onValueChange: fn() },
  render: (args) => (
    <PresetTabs {...args} className="w-80">
      <PresetTabsList size="sm" aria-label="Example">
        <PresetTabsTab value="preview">Preview</PresetTabsTab>
        <PresetTabsTab value="code">Code</PresetTabsTab>
      </PresetTabsList>
      <PresetTabsPanel value="preview" className="rounded-lg border p-4 text-sm">
        The component, live.
      </PresetTabsPanel>
      <PresetTabsPanel value="code" className="rounded-lg border p-4 font-mono text-xs">
        {"<PresetTabs />"}
      </PresetTabsPanel>
    </PresetTabs>
  ),
}

export default meta
type Story = StoryObj<typeof PresetTabs>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("tab", { name: "Preview" })).toHaveAttribute("aria-selected", "true")
    await expect(canvas.getByRole("tabpanel")).toHaveTextContent("The component, live.")
  },
}

/** Pressing Code latches it and pops Preview back up. */
export const Press: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Code" }))
    await expect(canvas.getByRole("tab", { name: "Code" })).toHaveAttribute("data-active")
    await expect(canvas.getByRole("tab", { name: "Preview" })).not.toHaveAttribute("data-active")
    await waitFor(() => expect(canvas.getByRole("tabpanel")).toHaveTextContent("<PresetTabs />"))
    await expect(args.onValueChange).toHaveBeenLastCalledWith("code", expect.anything())
  },
}

/** Arrow keys move along the row; Enter presses. */
export const Keyboard: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab()
    await expect(canvas.getByRole("tab", { name: "Preview" })).toHaveFocus()
    await userEvent.keyboard("{ArrowRight}")
    await expect(canvas.getByRole("tab", { name: "Code" })).toHaveFocus()
    await userEvent.keyboard("{Enter}")
    await expect(canvas.getByRole("tab", { name: "Code" })).toHaveAttribute("aria-selected", "true")
  },
}

/** The md size, for a screen's main sections, with one key disabled. */
export const Sections: Story = {
  args: { defaultValue: "general" },
  render: (args) => (
    <PresetTabs {...args}>
      <PresetTabsList aria-label="Settings">
        <PresetTabsTab value="general">General</PresetTabsTab>
        <PresetTabsTab value="members">Members</PresetTabsTab>
        <PresetTabsTab value="billing">Billing</PresetTabsTab>
        <PresetTabsTab value="sso" disabled>
          SSO
        </PresetTabsTab>
      </PresetTabsList>
      {["general", "members", "billing", "sso"].map((v) => (
        <PresetTabsPanel key={v} value={v} className="text-sm text-muted-foreground">
          {v} settings
        </PresetTabsPanel>
      ))}
    </PresetTabs>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("tab", { name: "SSO" })).toHaveAttribute("aria-disabled", "true")
  },
}

/** Segmented: PresetKeys picks a value. Arrow keys move and press. */
export const Segmented: StoryObj<typeof PresetKeys> = {
  render: () => {
    const onValueChange = fn()
    return (
      <PresetKeys aria-label="Range" defaultValue="7d" onValueChange={onValueChange}>
        {["24h", "7d", "30d", "90d"].map((v) => (
          <PresetKey key={v} value={v}>
            {v}
          </PresetKey>
        ))}
      </PresetKeys>
    )
  },
  play: async ({ canvas, userEvent }) => {
    const week = canvas.getByRole("radio", { name: "7d" })
    await expect(week).toBeChecked()
    await userEvent.click(canvas.getByRole("radio", { name: "30d" }))
    await expect(canvas.getByRole("radio", { name: "30d" })).toBeChecked()
    await expect(week).not.toBeChecked()
    await userEvent.keyboard("{ArrowRight}")
    await expect(canvas.getByRole("radio", { name: "90d" })).toBeChecked()
  },
}

export const Disabled: StoryObj<typeof PresetKeys> = {
  render: () => (
    <PresetKeys aria-label="Range" defaultValue="7d" disabled size="sm">
      <PresetKey value="24h">24h</PresetKey>
      <PresetKey value="7d">7d</PresetKey>
    </PresetKeys>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "24h" }))
    await expect(canvas.getByRole("radio", { name: "7d" })).toBeChecked()
  },
}

export const Dark: Story = { globals: { theme: "dark" } }

/** With reduced motion keys drop and pop without travelling. */
export const ReducedMotion: Story = {
  play: async ({ canvasElement }) => {
    for (const key of canvasElement.querySelectorAll('[data-slot="preset-tabs-tab"]')) {
      await expect(key.className).toContain("motion-reduce:transition-none")
    }
  },
}
