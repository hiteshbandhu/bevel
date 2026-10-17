import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect } from "storybook/test"
import { NameTag, NameTagDetail, NameTagInput, NameTagName } from "@workspace/ui/components/name-tag"

const meta = {
  title: "Agents/Name tag",
  component: NameTag,
  args: { variant: "sticker" },
  argTypes: { variant: { control: "inline-radio", options: ["sticker", "visitor", "plain"] } },
  parameters: { layout: "centered" },
  render: (args) => (
    <NameTag {...args}>
      <NameTagName>Research</NameTagName>
      <NameTagDetail>acting for Priya</NameTagDetail>
    </NameTag>
  ),
} satisfies Meta<typeof NameTag>

export default meta
type Story = StoryObj<typeof meta>

/** Screen readers hear the name and detail, not the printed "HELLO my name is". */
export const Sticker: Story = {
  play: async ({ canvasElement }) => {
    const tag = canvasElement.querySelector("[data-slot=name-tag]")!
    await expect(tag.querySelector("[data-slot=name-tag-band]")).toHaveAttribute("aria-hidden", "true")
    await expect(tag).toHaveTextContent(/Research/)
  },
}

export const Visitor: Story = { args: { variant: "visitor" } }

export const Plain: Story = { args: { variant: "plain" } }

export const Translated: Story = { args: { greeting: "Hola", caption: "me llamo" } }

export const LongName: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <NameTag>
        <NameTagName>Due diligence research assistant</NameTagName>
      </NameTag>
      <NameTag variant="plain" className="w-48">
        <NameTagName>Due diligence research assistant</NameTagName>
      </NameTag>
    </div>
  ),
}

function Editable() {
  const [name, setName] = React.useState("Drafting")
  return (
    <div className="flex flex-col items-center gap-4">
      <NameTag>
        <NameTagInput value={name} onChange={(e) => setName(e.target.value)} />
      </NameTag>
      <p data-testid="saved">{name}</p>
    </div>
  )
}

/** The name is a real text field: rename an agent by writing on its tag. */
export const Rename: Story = {
  render: () => <Editable />,
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Name" })
    await userEvent.clear(input)
    await userEvent.type(input, "Review")
    await expect(canvas.getByTestId("saved")).toHaveTextContent("Review")
  },
}
