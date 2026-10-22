import { ArrowRight, Download, Trash2 } from "lucide-react"
import { Key } from "@workspace/ui/components/key"

/** Every variant at every size. Heights match shadcn's buttons, so keys drop into existing layouts. */
export function KeyVariants() {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex flex-wrap items-center justify-center gap-3">
          <Key size={size}>
            Continue
            <ArrowRight />
          </Key>
          <Key size={size} variant="secondary">
            <Download />
            Export
          </Key>
          <Key size={size} variant="ghost">
            Skip
          </Key>
          <Key size={size} variant="danger">
            <Trash2 />
            Delete
          </Key>
        </div>
      ))}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Key disabled>Disabled</Key>
        <Key variant="secondary" disabled>
          Disabled
        </Key>
      </div>
    </div>
  )
}
