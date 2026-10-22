"use client"

import * as React from "react"
import { Check, ChevronDown, Copy, ExternalLink, FileText } from "lucide-react"
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuLinkItem,
  MenuSeparator,
  MenuTrigger,
} from "@workspace/ui/components/menu"
import { IconKey } from "@workspace/ui/components/icon-key"
import { Key } from "@workspace/ui/components/key"

type CopyPageMenuProps = {
  /** The page as Markdown, e.g. "/components/menu.md". Relative URLs resolve against the current page. */
  markdownUrl?: string
}

const prompt = (url: string) => `Read ${url} so I can ask questions about it.`

/**
 * Copies the page as Markdown into the clipboard. Safari only lets a page
 * write to the clipboard during the click, so the text goes in as a promise
 * where ClipboardItem exists; elsewhere it's fetched first.
 */
async function copyMarkdown(url: string) {
  const text = () =>
    fetch(url).then((response) => {
      if (!response.ok) throw new Error(`${response.status} fetching ${url}`)
      return response.text()
    })
  if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    const blob = text().then((t) => new Blob([t], { type: "text/plain" }))
    await navigator.clipboard.write([new ClipboardItem({ "text/plain": blob })])
  } else {
    await navigator.clipboard.writeText(await text())
  }
}

/** The "Copy page" menu for a docs page that has a Markdown version. */
export function MenuCopyPage({
  markdownUrl = "/components/menu.md",
}: CopyPageMenuProps) {
  const [state, setState] = React.useState<"idle" | "copied" | "failed">("idle")
  // Assistants need an absolute address; resolve it once mounted.
  const [absolute, setAbsolute] = React.useState(markdownUrl)
  const timer = React.useRef<number | undefined>(undefined)

  React.useEffect(
    () => setAbsolute(new URL(markdownUrl, window.location.href).href),
    [markdownUrl]
  )
  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  function copy() {
    copyMarkdown(markdownUrl).then(
      () => setState("copied"),
      () => setState("failed")
    )
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setState("idle"), 2000)
  }

  return (
    // A split key: the label does what it says, the chevron holds the other ways to read the page.
    <div className="flex items-center gap-1">
      <Key variant="secondary" size="sm" onClick={copy}>
        {state === "copied" ? <Check aria-hidden /> : <Copy aria-hidden />}
        {state === "copied" ? "Copied" : "Copy page"}
      </Key>
      <Menu>
        <MenuTrigger
          render={
            <IconKey
              variant="secondary"
              size="sm"
              aria-label="More ways to read this page"
            />
          }
        >
          <ChevronDown aria-hidden />
        </MenuTrigger>
        <MenuContent align="end">
          <MenuItem onClick={copy}>
            <Copy aria-hidden />
            Copy as Markdown
          </MenuItem>
          <MenuLinkItem href={markdownUrl} target="_blank" rel="noopener">
            <FileText aria-hidden />
            View as Markdown
          </MenuLinkItem>
          <MenuSeparator />
          <MenuLinkItem
            href={`https://chatgpt.com/?hints=search&q=${encodeURIComponent(prompt(absolute))}`}
            target="_blank"
            rel="noopener"
          >
            <ExternalLink aria-hidden />
            Open in ChatGPT
          </MenuLinkItem>
          <MenuLinkItem
            href={`https://claude.ai/new?q=${encodeURIComponent(prompt(absolute))}`}
            target="_blank"
            rel="noopener"
          >
            <ExternalLink aria-hidden />
            Open in Claude
          </MenuLinkItem>
        </MenuContent>
      </Menu>
      <span role="status" className="sr-only">
        {state === "copied"
          ? "Page copied as Markdown"
          : state === "failed"
            ? "Couldn't copy the page"
            : ""}
      </span>
    </div>
  )
}
