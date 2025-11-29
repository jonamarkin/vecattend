import type { Attendee, Event } from "./types"

const ATTENDEES_KEY = "choir_attendees"
const EVENTS_KEY = "choir_events"
const ACTIVE_EVENT_KEY = "choir_active_event"

// Attendees
export function getAttendees(): Attendee[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(ATTENDEES_KEY)
  return data ? JSON.parse(data) : []
}

export function saveAttendees(attendees: Attendee[]): void {
  localStorage.setItem(ATTENDEES_KEY, JSON.stringify(attendees))
}

export function addAttendee(attendee: Omit<Attendee, "id" | "createdAt">): Attendee {
  const attendees = getAttendees()
  const newAttendee: Attendee = {
    ...attendee,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  attendees.push(newAttendee)
  saveAttendees(attendees)
  return newAttendee
}

export function updateAttendee(id: string, updates: Partial<Attendee>): Attendee | null {
  const attendees = getAttendees()
  const index = attendees.findIndex((a) => a.id === id)
  if (index === -1) return null
  attendees[index] = { ...attendees[index], ...updates }
  saveAttendees(attendees)
  return attendees[index]
}

export function deleteAttendee(id: string): boolean {
  const attendees = getAttendees()
  const filtered = attendees.filter((a) => a.id !== id)
  if (filtered.length === attendees.length) return false
  saveAttendees(filtered)
  return true
}

export function toggleAttendance(attendeeId: string, eventId: string): Attendee | null {
  const attendees = getAttendees()
  const attendee = attendees.find((a) => a.id === attendeeId)
  if (!attendee) return null

  const attended = attendee.eventsAttended.includes(eventId)
  if (attended) {
    attendee.eventsAttended = attendee.eventsAttended.filter((e) => e !== eventId)
  } else {
    attendee.eventsAttended.push(eventId)
  }
  saveAttendees(attendees)
  return attendee
}

// Events
export function getEvents(): Event[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(EVENTS_KEY)
  return data ? JSON.parse(data) : []
}

export function saveEvents(events: Event[]): void {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events))
}

export function addEvent(event: Omit<Event, "id" | "createdAt">): Event {
  const events = getEvents()
  const newEvent: Event = {
    ...event,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  events.push(newEvent)
  saveEvents(events)
  return newEvent
}

export function deleteEvent(id: string): boolean {
  const events = getEvents()
  const filtered = events.filter((e) => e.id !== id)
  if (filtered.length === events.length) return false
  saveEvents(filtered)
  return true
}

export function getActiveEvent(): Event | null {
  if (typeof window === "undefined") return null
  const id = localStorage.getItem(ACTIVE_EVENT_KEY)
  if (!id) return null
  const events = getEvents()
  return events.find((e) => e.id === id) || null
}

export function setActiveEvent(eventId: string | null): void {
  if (eventId) {
    localStorage.setItem(ACTIVE_EVENT_KEY, eventId)
  } else {
    localStorage.removeItem(ACTIVE_EVENT_KEY)
  }
}
