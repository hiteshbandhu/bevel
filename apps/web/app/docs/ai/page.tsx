import type { Metadata } from "next"
import { CodeBlock } from "@/components/code-block"
import { Guide, Note, linkClass } from "@/components/prose"
import { registryNamespace, registryUrl, siteUrl } from "@/lib/site"

export const metadata: Metadata = { title: "Use with AI" }

const mcpServer = { command: "npx", args: ["shadcn@latest", "mcp"] }

export default function UseWithAI() {
  return (
    <Guide slug="ai">
      <p>
        Coding assistants can browse the Bevel registry, install components and write code with them. They
        need two things: the registry in your <code>components.json</code>, and either the shadcn MCP server
        or the docs as plain text.
      </p>

      <h2>Add the registry</h2>
      <p>
        If you followed{" "}
        <a className={linkClass} href="/docs/installation">
          installation
        </a>
        , this is done. The MCP server and <code>shadcn search</code> read registries from here.
      </p>
      <CodeBlock
        lang="json"
        title="components.json"
        code={JSON.stringify({ registries: { [registryNamespace]: registryUrl } }, null, 2)}
      />

      <h2>The shadcn MCP server</h2>
      <p>
        The shadcn CLI ships an MCP server. With it, an assistant can list and search{" "}
        <code>{registryNamespace}</code>, read a component&apos;s files and examples, and run the add command
        for you. Set it up from your project root:
      </p>
      <h3>Claude Code</h3>
      <CodeBlock lang="bash" title="Terminal" code="npx shadcn@latest mcp init --client claude" />
      <p>
        This writes <code>.mcp.json</code>. Restart Claude Code and check <code>/mcp</code> lists{" "}
        <code>shadcn</code>.
      </p>
      <h3>Cursor</h3>
      <CodeBlock lang="bash" title="Terminal" code="npx shadcn@latest mcp init --client cursor" />
      <p>
        This writes <code>.cursor/mcp.json</code>. Turn the server on in Cursor&apos;s MCP settings.
      </p>
      <h3>VS Code (Copilot)</h3>
      <CodeBlock lang="bash" title="Terminal" code="npx shadcn@latest mcp init --client vscode" />
      <p>
        This writes <code>.vscode/mcp.json</code>. Open it and press Start next to the server, then use
        Copilot Chat in agent mode.
      </p>
      <p>Any other client takes the same server by hand:</p>
      <CodeBlock
        lang="json"
        title="mcp.json"
        code={JSON.stringify({ mcpServers: { shadcn: mcpServer } }, null, 2)}
      />
      <Note>
        Without MCP, the CLI does the same from a terminal: <code>npx shadcn@latest search {registryNamespace} -q meter</code>,{" "}
        <code>npx shadcn@latest view {registryNamespace}/meter</code>.
      </Note>

      <h2>Docs as plain text</h2>
      <p>
        For tools that read URLs (v0, ChatGPT, Cursor&apos;s <code>@Docs</code>), the docs come as text, in
        the <a className={linkClass} href="https://llmstxt.org">llms.txt</a> format:
      </p>
      <ul>
        <li>
          <a className={linkClass} href="/llms.txt">
            <code>/llms.txt</code>
          </a>
          : an index of the guides and every component, with a line on each.
        </li>
        <li>
          <a className={linkClass} href="/llms-full.txt">
            <code>/llms-full.txt</code>
          </a>
          : everything in one file. Each component&apos;s install command, anatomy, parts and example code,
          plus the rules and tokens.
        </li>
        <li>
          Any component page plus <code>.md</code>, such as{" "}
          <a className={linkClass} href="/components/guarded-switch.md">
            <code>/components/guarded-switch.md</code>
          </a>
          : one component, for a smaller context.
        </li>
      </ul>

      <h2>Ask for it</h2>
      <p>Name the registry and the job. The assistant finds the component, installs it and follows its anatomy.</p>
      <CodeBlock
        lang="markdown"
        title="Prompt"
        code={`Use the ${registryNamespace} registry. Add a deploy button to the release page
that needs two deliberate actions: find the Bevel component for a guarded
critical switch, install it, and wire it to deploy() when switched on.
Follow the component's anatomy, and style only with Bevel tokens.`}
      />
      <p>
        Without MCP, give it the docs instead: start the prompt with <code>Read {siteUrl}/llms.txt</code>.
      </p>
    </Guide>
  )
}
