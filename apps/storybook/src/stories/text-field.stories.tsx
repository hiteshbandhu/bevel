import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn } from "storybook/test"
import { Search } from "lucide-react"
import {
  TextField,
  TextFieldAdornment,
  TextFieldDescription,
  TextFieldError,
  TextFieldInput,
  TextFieldKbd,
  TextFieldLabel,
  TextFieldSlot,
  TextFieldTextarea,
} from "@workspace/ui/components/text-field"

const meta: Meta<typeof TextField> = {
  title: "Essentials/Text field",
  component: TextField,
  parameters: { layout: "centered" },
  args: { size: "md" },
  render: (args) => (
    <TextField {...args} className="w-72">
      <TextFieldLabel>Workspace name</TextFieldLabel>
      <TextFieldInput placeholder="Acme" />
      <TextFieldDescription>Shown on invoices and in invites.</TextFieldDescription>
    </TextField>
  ),
}

export default meta
type Story = StoryObj<typeof TextField>

export const Default: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Workspace name" })
    await expect(input).toHaveAccessibleDescription("Shown on invoices and in invites.")
  },
}

export const Small: Story = { args: { size: "sm" } }

/** Icon, Kbd hint: the docs search box. Pressing the icon focuses the input. */
export const WithAdornments: Story = {
  render: (args) => (
    <TextField {...args} className="w-72">
      <TextFieldLabel className="sr-only">Search components</TextFieldLabel>
      <TextFieldSlot>
        <TextFieldAdornment>
          <Search aria-hidden />
        </TextFieldAdornment>
        <TextFieldInput type="search" placeholder="Search components" />
        <TextFieldKbd>⌘K</TextFieldKbd>
      </TextFieldSlot>
    </TextField>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const icon = canvasElement.querySelector('[data-slot="text-field-adornment"]')!
    await userEvent.click(icon)
    await expect(canvas.getByRole("searchbox", { name: "Search components" })).toHaveFocus()
  },
}

/** A unit after the value. */
export const Unit: Story = {
  render: (args) => (
    <TextField {...args} className="w-56">
      <TextFieldLabel>Monthly cap</TextFieldLabel>
      <TextFieldSlot>
        <TextFieldAdornment>$</TextFieldAdornment>
        <TextFieldInput inputMode="decimal" defaultValue="250" />
        <TextFieldAdornment>USD</TextFieldAdornment>
      </TextFieldSlot>
    </TextField>
  ),
}

export const Textarea: Story = {
  render: (args) => (
    <TextField {...args} className="w-80">
      <TextFieldLabel>System prompt</TextFieldLabel>
      <TextFieldTextarea placeholder="You are a careful assistant…" rows={4} />
      <TextFieldDescription>Sent before every conversation.</TextFieldDescription>
    </TextField>
  ),
  play: async ({ canvas, userEvent }) => {
    const area = canvas.getByRole("textbox", { name: "System prompt" })
    await userEvent.type(area, "Be brief.")
    await expect(area).toHaveValue("Be brief.")
  },
}

/** Invalid: the lamp by the label lights, the slot edges red, and the message describes the input. */
export const Invalid: Story = {
  render: (args) => (
    <TextField {...args} invalid className="w-72">
      <TextFieldLabel>Email</TextFieldLabel>
      <TextFieldInput type="email" defaultValue="ada@" />
      <TextFieldError match>Enter a whole address, like ada@example.com.</TextFieldError>
    </TextField>
  ),
  play: async ({ canvas, canvasElement }) => {
    const input = canvas.getByRole("textbox", { name: "Email" })
    await expect(input).toHaveAttribute("aria-invalid", "true")
    await expect(canvas.getByRole("alert")).toHaveTextContent("Enter a whole address")
    await expect(input).toHaveAccessibleDescription("Enter a whole address, like ada@example.com.")
    await expect(canvasElement.querySelector('[data-slot="text-field-label"]')).toHaveAttribute("data-invalid")
  },
}

/** Validation on blur: clear it, leave, and the error appears. */
export const Required: Story = {
  render: (args) => (
    <TextField {...args} validationMode="onBlur" className="w-72">
      <TextFieldLabel>API key name</TextFieldLabel>
      <TextFieldInput required />
      <TextFieldError match="valueMissing">Give the key a name.</TextFieldError>
    </TextField>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("textbox", { name: "API key name" }), "x{Backspace}")
    await userEvent.tab()
    await expect(await canvas.findByRole("alert")).toHaveTextContent("Give the key a name.")
  },
}

const onProjectChange = fn()

/** Tab in and type; onValueChange reports each change. */
export const Keyboard: Story = {
  render: (args) => (
    <TextField {...args} className="w-72">
      <TextFieldLabel>Project</TextFieldLabel>
      <TextFieldInput onValueChange={onProjectChange} />
    </TextField>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab()
    const input = canvas.getByRole("textbox", { name: "Project" })
    await expect(input).toHaveFocus()
    await userEvent.keyboard("bevel")
    await expect(input).toHaveValue("bevel")
    await expect(onProjectChange).toHaveBeenLastCalledWith("bevel", expect.anything())
  },
}

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("textbox", { name: "Workspace name" })).toBeDisabled()
  },
}

export const LongText: Story = {
  render: (args) => (
    <TextField {...args} className="w-60">
      <TextFieldLabel>A label long enough to wrap onto a second line of print</TextFieldLabel>
      <TextFieldInput defaultValue="averyveryverylongunbrokenvaluethatkeepsgoingandgoing@example.com" />
      <TextFieldDescription>
        A description that runs on for a while, to show that the lines under the slot wrap and keep their spacing.
      </TextFieldDescription>
    </TextField>
  ),
}

export const Dark: Story = { globals: { theme: "dark" }, render: Invalid.render }

/** With reduced motion the lamp switches on instead of fading. */
export const ReducedMotion: Story = {
  render: Invalid.render,
  play: async ({ canvasElement }) => {
    const lamp = canvasElement.querySelector('[data-slot="text-field-lamp"]')!
    await expect(lamp.className).toContain("motion-reduce:transition-none")
  },
}
