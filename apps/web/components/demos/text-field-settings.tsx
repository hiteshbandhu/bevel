"use client"

import * as React from "react"
import { Form } from "@base-ui/react/form"
import {
  TextField,
  TextFieldAdornment,
  TextFieldDescription,
  TextFieldError,
  TextFieldInput,
  TextFieldLabel,
  TextFieldSlot,
} from "@workspace/ui/components/text-field"
import { ToggleLever, ToggleLeverDescription, ToggleLeverField, ToggleLeverLabel } from "@workspace/ui/components/toggle-lever"
import { LatchCheckbox, LatchCheckboxField, LatchCheckboxLabel } from "@workspace/ui/components/latch-checkbox"

/**
 * Workspace settings. Fields validate when you leave them and again on save;
 * the server's answer comes back as an error on the field it's about.
 */
export function TextFieldSettings() {
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [saved, setSaved] = React.useState<string | null>(null)

  return (
    <Form
      errors={errors}
      validationMode="onBlur"
      onFormSubmit={(values) => {
        setSaved(null)
        // Pretend the server owns the slug namespace.
        if (values.slug === "acme") {
          setErrors({ slug: "acme is taken. Try acme-labs." })
          return
        }
        setErrors({})
        setSaved(`Saved ${values.name}.`)
      }}
      className="flex w-full flex-col gap-5 rounded-xl border bg-card p-5"
    >
      <TextField name="name">
        <TextFieldLabel>Workspace name</TextFieldLabel>
        <TextFieldInput required defaultValue="Acme" autoComplete="organization" />
        <TextFieldError match="valueMissing">Give the workspace a name.</TextFieldError>
      </TextField>

      <TextField
        name="slug"
        validate={(value) =>
          !value ? "Choose a URL." : /^[a-z0-9-]+$/.test(String(value)) ? null : "Only lowercase letters, numbers and dashes."
        }
      >
        <TextFieldLabel>URL</TextFieldLabel>
        <TextFieldSlot>
          <TextFieldAdornment>bevel.app/</TextFieldAdornment>
          <TextFieldInput defaultValue="acme" spellCheck={false} autoCapitalize="none" />
        </TextFieldSlot>
        <TextFieldDescription>Lowercase letters, numbers and dashes. Try saving as is.</TextFieldDescription>
        {/* Shows the validate message, or the server's. */}
        <TextFieldError />
      </TextField>

      <TextField name="billing">
        <TextFieldLabel>Billing email</TextFieldLabel>
        <TextFieldInput type="email" required placeholder="finance@acme.com" autoComplete="email" />
        <TextFieldError match="valueMissing">Invoices need somewhere to go.</TextFieldError>
        <TextFieldError match="typeMismatch">That isn't a whole email address.</TextFieldError>
      </TextField>

      <div className="flex flex-col gap-4 border-t pt-4">
        <ToggleLeverField name="digest">
          <ToggleLeverLabel>Weekly digest</ToggleLeverLabel>
          <ToggleLeverDescription>Runs, spend and failures, every Monday.</ToggleLeverDescription>
          <ToggleLever size="sm" defaultChecked />
        </ToggleLeverField>
        <LatchCheckboxField name="capAlert">
          <LatchCheckbox defaultChecked />
          <LatchCheckboxLabel>Email me when spend passes the monthly cap</LatchCheckboxLabel>
        </LatchCheckboxField>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p role="status" className="text-sm text-muted-foreground">
          {saved}
        </p>
        <button
          type="submit"
          className="h-9 rounded-md bg-foreground px-4 text-sm font-medium text-background outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Save
        </button>
      </div>
    </Form>
  )
}
