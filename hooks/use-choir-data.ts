"use client";

import { useState, useEffect } from "react";
import { firebaseService } from "@/lib/firebase-service";
import type { Attendee, Event } from "@/lib/types";

const MOCK_EVENTS: Event[] = [
  {
    id: "fn12",
    name: "Feliz Navidad - 12th Noel",
    date: "2025-11-30",
    description: "Annual Pre-Christmas Concert",
  },
];

export function useChoirData() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const attendeesData = await firebaseService.fetchAttendees();
        setAttendees(attendeesData);
      } catch (error) {
        console.error("Error loading attendees:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const addAttendee = async (attendee: Omit<Attendee, "id">) => {
    try {
      const id = await firebaseService.addAttendee(attendee);
      const newAttendee = { ...attendee, id } as Attendee;
      setAttendees([...attendees, newAttendee]);
    } catch (error) {
      console.error("Error adding attendee:", error);
      throw error;
    }
  };

  const updateAttendee = async (id: string, attendee: Partial<Attendee>) => {
    try {
      await firebaseService.updateAttendee(id, attendee);
      setAttendees(
        attendees.map((a) => (a.id === id ? { ...a, ...attendee } : a))
      );
    } catch (error) {
      console.error("Error updating attendee:", error);
      throw error;
    }
  };

  const deleteAttendee = async (id: string) => {
    try {
      await firebaseService.deleteAttendee(id);
      setAttendees(attendees.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Error deleting attendee:", error);
      throw error;
    }
  };

  const toggleAttendance = async (attendeeId: string, eventId: string) => {
    try {
      await firebaseService.toggleAttendance(attendeeId, eventId);
      // Refetch to ensure data consistency
      const updatedAttendees = await firebaseService.fetchAttendees();
      setAttendees(updatedAttendees);
    } catch (error) {
      console.error("Error toggling attendance:", error);
      throw error;
    }
  };

  const addEvent = async (event: Omit<Event, "id">) => {
    try {
      const id = firebaseService.createId();
      const newEvent = { ...event, id } as Event;
      setEvents([...events, newEvent]);
      return newEvent;
    } catch (error) {
      console.error("Error adding event:", error);
      throw error;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      setEvents(events.filter((e) => e.id !== id));
      if (activeEvent?.id === id) {
        setActiveEvent(null);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  };

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
  };
}
