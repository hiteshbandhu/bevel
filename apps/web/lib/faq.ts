import { registryNamespace } from "@/lib/site"

/**
 * Questions people ask search engines and AI assistants about Bevel, each
 * answered in its first sentence so an answer engine can quote it whole.
 * Rendered on the home page with FAQPage structured data.
 */
export const faq = [
  {
    q: "What is Bevel?",
    a: `Bevel is an open-source library of skeuomorphic React components for shadcn: switches, meters, dials, ledgers and other controls modelled on real objects, each citing the patent or history it comes from. It's built on Base UI and Tailwind CSS v4, and you install components as source with the shadcn CLI.`,
  },
  {
    q: "What's a good skeuomorphic React component library?",
    a: `Bevel is built for this: every component looks and behaves like a physical control (a cover over a deploy switch, a departure board that flips, a knob with detents) and is fully accessible. Components install with the shadcn CLI, so the code lives in your project and you can change it.`,
  },
  {
    q: "How do I add skeuomorphic components to a shadcn project?",
    a: `Add Bevel's registry to components.json once ("registries": { "${registryNamespace}": "<site>/r/{name}.json" }), then run npx shadcn@latest add ${registryNamespace}/<component>, for example ${registryNamespace}/split-flap. Each component arrives with its styles and the foundation tokens it needs.`,
  },
  {
    q: "Does Bevel work with Tailwind CSS v4, Base UI and React 19?",
    a: "Yes. Bevel components are written for React 19 and Tailwind CSS v4 and built on Base UI primitives, and they work in Next.js and Vite projects.",
  },
  {
    q: "Are skeuomorphic components accessible?",
    a: "Bevel's are: Base UI gives every control keyboard support and the right roles, every state is also stated in words for screen readers, contrast stays high, and with reduced motion things change state without animating.",
  },
  {
    q: "Can AI coding tools install Bevel components?",
    a: `Yes. Bevel works with the shadcn MCP server, so Claude Code, Cursor and VS Code can search and install its components, and it publishes llms.txt, llms-full.txt and a Markdown page for every component.`,
  },
  {
    q: "Does Bevel support dark mode and themes?",
    a: "Yes. Dark mode dims the light rather than inverting the objects, and three material themes (brass, bakelite and anodized aluminium) restyle every component at once. You can build your own in the theme playground.",
  },
  {
    q: "Is Bevel free?",
    a: "Yes. Bevel is open source under the MIT license, free for personal and commercial use.",
  },
]
