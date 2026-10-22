import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, waitFor, within } from "storybook/test"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuLinkItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@workspace/ui/components/menu"

const trigger =
  "inline-flex h-8 items-center rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"

type Args = { defaultOpen?: boolean; disabled?: boolean; onDuplicate?: () => void }

function FileMenu({ defaultOpen, disabled, onDuplicate }: Args) {
  const [preview, setPreview] = React.useState(true)
  const [sort, setSort] = React.useState("modified")
  return (
    <Menu defaultOpen={defaultOpen}>
      <MenuTrigger className={trigger} disabled={disabled}>
        Actions
      </MenuTrigger>
      <MenuContent>
        <MenuItem aria-keyshortcuts="F2">
          Rename
          <MenuShortcut keys={["F2"]} />
        </MenuItem>
        <MenuItem onClick={onDuplicate} aria-keyshortcuts="Meta+D">
          Duplicate
          <MenuShortcut keys={["⌘", "D"]} />
        </MenuItem>
        <MenuItem disabled>Share (no access)</MenuItem>
        <MenuSub>
          <MenuSubTrigger>Move to</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>Drafts</MenuItem>
            <MenuItem>Archive</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuSeparator />
        <MenuCheckboxItem checked={preview} onCheckedChange={setPreview}>
          Show preview
        </MenuCheckboxItem>
        <MenuGroup>
          <MenuGroupLabel>Sort by</MenuGroupLabel>
          <MenuRadioGroup value={sort} onValueChange={setSort}>
            <MenuRadioItem value="name">Name</MenuRadioItem>
            <MenuRadioItem value="modified">Date modified</MenuRadioItem>
          </MenuRadioGroup>
        </MenuGroup>
        <MenuSeparator />
        <MenuItem variant="destructive">
          Delete
          <MenuShortcut keys={["⌘", "⌫"]} />
        </MenuItem>
      </MenuContent>
    </Menu>
  )
}

const meta: Meta<Args> = {
  title: "Essentials/Menu",
  parameters: { layout: "centered" },
  args: { onDuplicate: fn() },
  render: (args) => (
    <div className="h-112 p-8">
      <FileMenu {...args} />
    </div>
  ),
}

export default meta
type Story = StoryObj<Args>

const body = () => within(document.body)

/** Click opens the plate; choosing an item runs it and closes. */
export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Actions" }))
    const plate = await waitFor(() => body().getByRole("menu"))
    await userEvent.click(within(plate).getByRole("menuitem", { name: "Duplicate" }))
    await expect(args.onDuplicate).toHaveBeenCalled()
    await waitFor(() => expect(body().queryByRole("menu")).toBeNull())
  },
}

/** Keyboard: arrows move the pressed-in item, Space lights a lamp, → opens the submenu, Escape returns focus. */
export const Keyboard: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab()
    const open = canvas.getByRole("button", { name: "Actions" })
    await userEvent.keyboard("{ArrowDown}")
    const plate = await waitFor(() => body().getByRole("menu"))
    await waitFor(() => expect(within(plate).getByRole("menuitem", { name: /Rename/ })).toHaveFocus())

    const preview = within(plate).getByRole("menuitemcheckbox", { name: "Show preview" })
    await expect(preview).toHaveAttribute("aria-checked", "true")
    preview.focus()
    await userEvent.keyboard(" ")
    await expect(preview).toHaveAttribute("aria-checked", "false")

    const move = within(plate).getByRole("menuitem", { name: "Move to" })
    move.focus()
    await userEvent.keyboard("{ArrowRight}")
    await waitFor(() => expect(body().getByRole("menuitem", { name: "Drafts" })).toHaveFocus())
    await userEvent.keyboard("{ArrowLeft}")
    await waitFor(() => expect(move).toHaveFocus())

    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(body().queryByRole("menu")).toBeNull())
    await waitFor(() => expect(open).toHaveFocus())
  },
}

/** Open, with a lit lamp, a radio choice, keycaps and a destructive item. */
export const Open: Story = { args: { defaultOpen: true } }

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Actions" })).toBeDisabled()
  },
}

/** The "Copy page" menu: link items open in a new tab. */
export const LinkItems: Story = {
  render: () => (
    <div className="h-64 p-8">
      <Menu defaultOpen>
        <MenuTrigger className={trigger}>Copy page</MenuTrigger>
        <MenuContent>
          <MenuItem>Copy as Markdown</MenuItem>
          <MenuLinkItem href="/components/menu.md" target="_blank" rel="noopener">
            View as Markdown
          </MenuLinkItem>
          <MenuSeparator />
          <MenuLinkItem href="https://claude.ai/new" target="_blank" rel="noopener">
            Open in Claude
          </MenuLinkItem>
        </MenuContent>
      </Menu>
    </div>
  ),
  play: async () => {
    const link = await waitFor(() => body().getByRole("menuitem", { name: "View as Markdown" }))
    await expect(link.tagName).toBe("A")
    await expect(link).toHaveAttribute("href", "/components/menu.md")
  },
}

/** Right-click an area to open the same plate at the pointer. */
export const Context: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="grid h-40 w-72 place-items-center rounded-md border border-dashed text-sm text-muted-foreground">
        Right-click here
      </ContextMenuTrigger>
      <ContextMenuContent>
        <MenuItem>Paste</MenuItem>
        <MenuSeparator />
        <MenuItem variant="destructive">Clear</MenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.pointer({ keys: "[MouseRight]", target: canvas.getByText("Right-click here") })
    await waitFor(() => expect(body().getByRole("menuitem", { name: "Paste" })).toBeVisible())
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(body().queryByRole("menu")).toBeNull())
  },
}

/** A long label widens the plate; more items than fit make it scroll. */
export const LongLabels: Story = {
  render: () => (
    <div className="h-80 p-8">
      <Menu defaultOpen>
        <MenuTrigger className={trigger}>Workspaces</MenuTrigger>
        <MenuContent>
          {Array.from({ length: 16 }, (_, i) => (
            <MenuItem key={i}>{i === 2 ? "Platform infrastructure and developer experience" : `Workspace ${i + 1}`}</MenuItem>
          ))}
        </MenuContent>
      </Menu>
    </div>
  ),
}

export const Dark: Story = { args: { defaultOpen: true }, globals: { theme: "dark" } }

/** With reduced motion the plate appears in place. */
export const ReducedMotion: Story = {
  args: { defaultOpen: true },
  play: async () => {
    const plate = await waitFor(() => body().getByRole("menu"))
    await expect(plate.getAttribute("class")).toContain("motion-reduce:transition-none")
  },
}
