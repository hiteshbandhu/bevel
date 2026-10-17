import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn } from "storybook/test"
import { Button } from "@workspace/ui/components/button"

const meta = {
  title: "Primitives/Button",
  component: Button,
  args: { children: "Button", onClick: fn() },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "secondary", "ghost", "destructive", "link"],
    },
    size: { control: "select", options: ["xs", "sm", "default", "lg"] },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Pressable: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Button" })
    await userEvent.click(button)
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}

export const KeyboardActivates: Story = {
  play: async ({ args, canvas, userEvent }) => {
    canvas.getByRole("button").focus()
    await userEvent.keyboard("{Enter}")
    await userEvent.keyboard(" ")
    await expect(args.onClick).toHaveBeenCalledTimes(2)
  },
}

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button")).toBeDisabled()
  },
}
