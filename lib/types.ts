export type Attendee = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  category: "regular" | "special" | "patron";
  events_attended: string[];
  registered_on: any; // Firestore Timestamp
  registered_by: string;
  created_at?: any;
};

export type Event = {
  id: string;
  name: string;
  date?: string;
  description?: string;
  created_at?: any;
};

export type AttendeeCategory = Attendee["category"];

export const CATEGORIES: { value: AttendeeCategory; label: string }[] = [
  { value: "regular", label: "Regular" },
  { value: "special", label: "Special" },
  { value: "patron", label: "Patron" },
];
