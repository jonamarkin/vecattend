export interface Attendee {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  category: "regular" | "special" | "patron"
  eventsAttended: string[]
  createdAt: string
}

export interface Event {
  id: string
  name: string
  date: string
  isActive: boolean
  createdAt: string
}

export type AttendeeCategory = Attendee["category"]

export const CATEGORIES: { value: AttendeeCategory; label: string }[] = [
  { value: "regular", label: "Regular" },
  { value: "special", label: "Special" },
  { value: "patron", label: "Patron" },
]
