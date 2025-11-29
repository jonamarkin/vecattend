"use client"

import { useState, useEffect, useCallback } from "react"
import type { Attendee, Event } from "@/lib/types"
import * as storage from "@/lib/storage"

export function useChoirData() {
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [activeEvent, setActiveEventState] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load initial data
  useEffect(() => {
    setAttendees(storage.getAttendees())
    setEvents(storage.getEvents())
    setActiveEventState(storage.getActiveEvent())
    setIsLoading(false)
  }, [])

  const addAttendee = useCallback((attendee: Omit<Attendee, "id" | "createdAt">) => {
    const newAttendee = storage.addAttendee(attendee)
    setAttendees((prev) => [...prev, newAttendee])
    return newAttendee
  }, [])

  const updateAttendee = useCallback((id: string, updates: Partial<Attendee>) => {
    const updated = storage.updateAttendee(id, updates)
    if (updated) {
      setAttendees((prev) => prev.map((a) => (a.id === id ? updated : a)))
    }
    return updated
  }, [])

  const deleteAttendee = useCallback((id: string) => {
    const success = storage.deleteAttendee(id)
    if (success) {
      setAttendees((prev) => prev.filter((a) => a.id !== id))
    }
    return success
  }, [])

  const toggleAttendance = useCallback((attendeeId: string, eventId: string) => {
    const updated = storage.toggleAttendance(attendeeId, eventId)
    if (updated) {
      setAttendees((prev) => prev.map((a) => (a.id === attendeeId ? updated : a)))
    }
    return updated
  }, [])

  // Event actions
  const addEvent = useCallback((event: Omit<Event, "id" | "createdAt">) => {
    const newEvent = storage.addEvent(event)
    setEvents((prev) => [...prev, newEvent])
    return newEvent
  }, [])

  const deleteEvent = useCallback(
    (id: string) => {
      const success = storage.deleteEvent(id)
      if (success) {
        setEvents((prev) => prev.filter((e) => e.id !== id))
        if (activeEvent?.id === id) {
          storage.setActiveEvent(null)
          setActiveEventState(null)
        }
      }
      return success
    },
    [activeEvent],
  )

  const setActiveEvent = useCallback(
    (eventId: string | null) => {
      storage.setActiveEvent(eventId)
      const event = eventId ? events.find((e) => e.id === eventId) || null : null
      setActiveEventState(event)
    },
    [events],
  )

  return {
    attendees,
    events,
    activeEvent,
    isLoading,
    addAttendee,
    updateAttendee,
    deleteAttendee,
    toggleAttendance,
    addEvent,
    deleteEvent,
    setActiveEvent,
  }
}
