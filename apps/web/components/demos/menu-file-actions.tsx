"use client"

import * as React from "react"
import { Copy, FolderInput, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@workspace/ui/components/menu"

/** A file's ⋯ menu: actions with shortcuts, a submenu, a setting with a lamp, a sort order, and delete. */
export function MenuFileActions() {
  const [preview, setPreview] = React.useState(true)
  const [sort, setSort] = React.useState("modified")
  const [last, setLast] = React.useState<string | null>(null)

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-72 max-w-full items-center gap-3 rounded-(--bevel-radius-md) border bg-background py-2 pr-2 pl-3">
        <span className="min-w-0 flex-1 truncate text-sm">quarterly-report.pdf</span>
        <Menu>
          <MenuTrigger
            aria-label="Actions for quarterly-report.pdf"
            className="inline-flex size-8 items-center justify-center rounded-(--bevel-radius-sm) text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-muted"
          >
            <MoreHorizontal className="size-4" aria-hidden />
          </MenuTrigger>
          <MenuContent align="end">
            <MenuItem onClick={() => setLast("Rename")} aria-keyshortcuts="F2">
              <Pencil aria-hidden />
              Rename
              <MenuShortcut keys={["F2"]} />
            </MenuItem>
            <MenuItem onClick={() => setLast("Duplicate")} aria-keyshortcuts="Meta+D">
              <Copy aria-hidden />
              Duplicate
              <MenuShortcut keys={["⌘", "D"]} />
            </MenuItem>
            <MenuSub>
              <MenuSubTrigger>
                <FolderInput aria-hidden />
                Move to
              </MenuSubTrigger>
              <MenuSubContent>
                {["Drafts", "Finance", "Archive"].map((folder) => (
                  <MenuItem key={folder} onClick={() => setLast(`Moved to ${folder}`)}>
                    {folder}
                  </MenuItem>
                ))}
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
                <MenuRadioItem value="size">Size</MenuRadioItem>
              </MenuRadioGroup>
            </MenuGroup>
            <MenuSeparator />
            <MenuItem variant="destructive" onClick={() => setLast("Deleted")} aria-keyshortcuts="Meta+Backspace">
              <Trash2 aria-hidden />
              Delete
              <MenuShortcut keys={["⌘", "⌫"]} />
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>
      <p role="status" className="text-sm text-muted-foreground">
        {last ?? `Preview ${preview ? "on" : "off"}, sorted by ${sort}.`}
      </p>
    </div>
  )
}
