import { Badge, BadgeLamp, type BadgeProps } from "@workspace/ui/components/badge"

type Deploy = { commit: string; message: string; age: string; status: string; tone: BadgeProps["tone"]; lit: boolean }

const deploys: Deploy[] = [
  { commit: "9c1e4a2", message: "Stream tool calls in the agent log", age: "now", status: "Building", tone: "warning", lit: true },
  { commit: "4f2a7d0", message: "Fix rounding on prepaid balances", age: "2h", status: "Live", tone: "success", lit: true },
  { commit: "b81c3e9", message: "Retry webhook deliveries with backoff", age: "5h", status: "Failed", tone: "danger", lit: true },
  { commit: "77de015", message: "Bump base-ui to 1.9", age: "1d", status: "Superseded", tone: "success", lit: false },
  { commit: "e0a9b44", message: "Preview: new pricing page", age: "2d", status: "Preview", tone: "info", lit: true },
]

/** A deployments table. Lamps are lit while a build runs or a release is live, and dark once superseded. */
export function BadgeDeploys() {
  return (
    <div className="w-full max-w-2xl overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-sm">
        <caption className="sr-only">Recent deployments</caption>
        <thead className="text-left text-xs text-muted-foreground">
          <tr>
            <th scope="col" className="px-4 py-2 font-medium">
              Commit
            </th>
            <th scope="col" className="hidden px-4 py-2 font-medium sm:table-cell">
              Message
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              Status
            </th>
            <th scope="col" className="px-4 py-2 text-right font-medium">
              Age
            </th>
          </tr>
        </thead>
        <tbody>
          {deploys.map((deploy) => (
            <tr key={deploy.commit} className="border-t">
              <td className="px-4 py-2 font-mono text-xs">{deploy.commit}</td>
              <td className="hidden max-w-64 truncate px-4 py-2 sm:table-cell">{deploy.message}</td>
              <td className="px-4 py-2">
                <Badge tone={deploy.tone} lit={deploy.lit}>
                  <BadgeLamp />
                  {deploy.status}
                </Badge>
              </td>
              <td className="px-4 py-2 text-right text-muted-foreground tabular-nums">{deploy.age}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
