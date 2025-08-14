"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Event {
  id: number
  date: Date
  title: string
  type: "reservation" | "delivery" | "meeting"
}

const events: Event[] = [
  {
    id: 1,
    date: new Date(2025, 2, 28),
    title: "Table 5 Reservation - Party of 6",
    type: "reservation",
  },
  {
    id: 2,
    date: new Date(2025, 2, 28),
    title: "Produce Delivery - Green Farms",
    type: "delivery",
  },
  {
    id: 3,
    date: new Date(2025, 2, 29),
    title: "Staff Meeting",
    type: "meeting",
  },
  {
    id: 4,
    date: new Date(2025, 2, 30),
    title: "Table 8 Reservation - Anniversary",
    type: "reservation",
  },
]

export function CalendarWidget() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Get events for the selected date
  const selectedDateEvents = events.filter((event) => date && event.date.toDateString() === date.toDateString())

  // Function to determine which dates have events
  const hasEvent = (day: Date) => {
    return events.some((event) => event.date.toDateString() === day.toDateString())
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border w-full"
        modifiers={{
          hasEvent: (date) => hasEvent(date),
        }}
        modifiersStyles={{
          hasEvent: {
            fontWeight: "bold",
            backgroundColor: "rgba(var(--primary), 0.1)",
            borderRadius: "100%",
          },
        }}
      />

      {selectedDateEvents.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Events for {date?.toLocaleDateString()}</h3>
          <div className="space-y-2">
            {selectedDateEvents.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <span className="text-sm">{event.title}</span>
                  <Badge
                    variant={
                      event.type === "reservation" ? "default" : event.type === "delivery" ? "secondary" : "outline"
                    }
                  >
                    {event.type}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : date ? (
        <p className="text-sm text-muted-foreground text-center py-2">
          No events scheduled for {date.toLocaleDateString()}
        </p>
      ) : null}
    </div>
  )
}

