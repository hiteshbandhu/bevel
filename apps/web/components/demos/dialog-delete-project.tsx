"use client"

import * as React from "react"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/dialog"

/** Deleting a project: an alert dialog that won't close on a stray click. Cancel takes focus first. */
export function DialogDeleteProject({ project = "acme-web" }: { project?: string }) {
  const [deleted, setDeleted] = React.useState(false)
  return (
    <div className="flex flex-col items-center gap-4">
      <AlertDialog>
        <AlertDialogTrigger
          disabled={deleted}
          className="inline-flex h-8 items-center gap-1.5 rounded-(--bevel-radius-sm) border border-destructive/30 bg-background px-3 text-sm font-medium text-destructive outline-none hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-destructive/40 disabled:opacity-50"
        >
          <Trash2 className="size-4" aria-hidden />
          Delete project
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {project}?</AlertDialogTitle>
            <AlertDialogDescription>
              Its 14 deployments, environment variables and domains go with it. This can&rsquo;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel />
            <AlertDialogAction onClick={() => setDeleted(true)}>Delete project</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <p role="status" className="text-sm text-muted-foreground">
        {deleted ? `${project} was deleted.` : `${project} · 14 deployments`}
      </p>
      {deleted && (
        <button type="button" onClick={() => setDeleted(false)} className="text-sm underline underline-offset-4">
          Restore for the demo
        </button>
      )}
    </div>
  )
}
