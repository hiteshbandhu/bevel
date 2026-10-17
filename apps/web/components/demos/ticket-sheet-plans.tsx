"use client"

import {
  Ticket,
  TicketLabel,
  TicketNote,
  TicketSheet,
  TicketValue,
} from "@workspace/ui/components/ticket-sheet"

/** Plans as a sheet of tickets. Arrow keys move between them. */
export function TicketSheetPlans() {
  return (
    <TicketSheet aria-label="Plan" defaultValue="team">
      <Ticket value="solo" tone="ochre">
        <TicketLabel>Solo</TicketLabel>
        <TicketValue>$12</TicketValue>
        <TicketNote>per month</TicketNote>
      </Ticket>
      <Ticket value="team" tone="vermilion">
        <TicketLabel>Team</TicketLabel>
        <TicketValue>$48</TicketValue>
        <TicketNote>up to 10 seats</TicketNote>
      </Ticket>
      <Ticket value="firm" tone="ultramarine">
        <TicketLabel>Firm</TicketLabel>
        <TicketValue>$190</TicketValue>
        <TicketNote>unlimited seats</TicketNote>
      </Ticket>
      <Ticket value="custom" tone="emerald" disabled>
        <TicketLabel>Custom</TicketLabel>
        <TicketValue>Talk</TicketValue>
        <TicketNote>sold out this quarter</TicketNote>
      </Ticket>
    </TicketSheet>
  )
}
