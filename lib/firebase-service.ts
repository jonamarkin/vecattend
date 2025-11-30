import {
  collection,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Attendee, Event } from "./types";

const ATTENDEES_COLLECTION = "audiences";
const EVENTS_COLLECTION = "events";

export const firebaseService = {
  // Attendees
  async fetchAttendees(): Promise<Attendee[]> {
    const querySnapshot = await getDocs(collection(db, ATTENDEES_COLLECTION));
    const attendees: Attendee[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      attendees.push({
        ...data,
        id: doc.id,
      } as Attendee);
    });
    //Print attendees for debugging
    console.log("Fetched attendees:", attendees);
    return attendees;
  },

  async addAttendee(attendee: Omit<Attendee, "id">): Promise<string> {
    const id = this.createId();
    const docData = {
      firstname: attendee.firstname,
      lastname: attendee.lastname,
      email: attendee.email || "",
      phone: attendee.phone,
      category: attendee.category,
      events_attended: attendee.events_attended || [],
      registered_on: serverTimestamp(),
      registered_by: attendee.registered_by || "admin",
      created_at: serverTimestamp(),
    };
    await setDoc(doc(db, ATTENDEES_COLLECTION, id), docData);
    return id;
  },

  async updateAttendee(id: string, attendee: Partial<Attendee>): Promise<void> {
    const updateData: any = { ...attendee };
    delete updateData.id;
    delete updateData.created_at;
    await updateDoc(doc(db, ATTENDEES_COLLECTION, id), updateData);
  },

  async deleteAttendee(id: string): Promise<void> {
    await deleteDoc(doc(db, ATTENDEES_COLLECTION, id));
  },

  // Events
  async fetchEvents(): Promise<Event[]> {
    const querySnapshot = await getDocs(collection(db, EVENTS_COLLECTION));
    const events: Event[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      events.push({
        ...data,
        id: doc.id,
      } as Event);
    });
    return events;
  },

  async addEvent(event: Omit<Event, "id">): Promise<string> {
    const id = this.createId();
    const docData = {
      ...event,
      created_at: serverTimestamp(),
    };
    await setDoc(doc(db, EVENTS_COLLECTION, id), docData);
    return id;
  },

  async deleteEvent(id: string): Promise<void> {
    await deleteDoc(doc(db, EVENTS_COLLECTION, id));
  },

  // Attendance
  async toggleAttendance(attendeeId: string, eventId: string): Promise<void> {
    const attendeeRef = doc(db, ATTENDEES_COLLECTION, attendeeId);
    const attendeeSnap = await getDocs(collection(db, ATTENDEES_COLLECTION));

    let isAttending = false;
    attendeeSnap.forEach((snap) => {
      if (snap.id === attendeeId) {
        const data = snap.data();
        isAttending = data.events_attended.includes(eventId);
      }
    });

    if (isAttending) {
      await updateDoc(attendeeRef, {
        events_attended: arrayRemove(eventId),
      });
    } else {
      await updateDoc(attendeeRef, {
        events_attended: arrayUnion(eventId),
      });
    }
  },

  // Utilities
  createId(): string {
    let id = "";
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 8; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  },
};
