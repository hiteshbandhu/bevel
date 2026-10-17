import { CopyButton } from "@/components/copy-button"

/** A one-line shell command with a copy button, for the hero and install steps. */
export function InstallCommand({ command }: { command: string }) {
  return (
    <div className="inline-flex h-10 max-w-full items-center gap-2 rounded-lg border bg-card pr-1 pl-3 font-mono text-sm">
      <span aria-hidden className="text-muted-foreground select-none">
        $
      </span>
      <code className="truncate">{command}</code>
      <CopyButton value={command} />
    </div>
  )
}
