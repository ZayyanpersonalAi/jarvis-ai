// In-memory demo store — used while Supabase is not connected.
// Resets on server restart; use Supabase for real data.
import type { Appointment } from "@/types";

export const demoAppointments: Appointment[] = [
  { id: "apt-1", businessId: "demo-business", customerName: "Ahmed Ali", customerPhone: "+92 300 1111111", customerEmail: "ahmed@example.com", service: "Consultation", date: new Date().toISOString().slice(0, 10), time: "15:00", notes: "First meeting", status: "confirmed", createdAt: new Date().toISOString() },
  { id: "apt-2", businessId: "demo-business", customerName: "Fatima Khan", customerPhone: "+92 321 2222222", service: "Follow-up", date: new Date().toISOString().slice(0, 10), time: "17:30", status: "pending", createdAt: new Date().toISOString() },
];
export const demoNotes: { id: string; text: string; createdAt: string }[] = [
  { id: "note-1", text: "Call the supplier tomorrow", createdAt: new Date().toISOString() },
];
export const demoReminders: { id: string; text: string; when: string; createdAt: string }[] = [];
export const demoMessages: { id: string; role: string; text: string; createdAt: string }[] = [];
