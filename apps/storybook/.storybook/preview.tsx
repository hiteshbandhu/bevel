import type { Preview } from "@storybook/react-vite"
import "@workspace/ui/globals.css"

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Color scheme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: ["light", "dark"],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    (Story, { globals }) => {
      document.documentElement.classList.toggle("dark", globals.theme === "dark")
      return (
        <div className="bg-background text-foreground p-10">
          <Story />
        </div>
      )
    },
  ],
  parameters: {
    layout: "fullscreen",
    // Fail the vitest run on a11y violations, not just warn.
    a11y: { test: "error" },
  },
}

export default preview
