import { create } from "zustand";
import type { Appointment, Business } from "@/types";
import { DEMO_BUSINESS } from "@/constants";

interface BusinessState {
  business: Business;
  appointments: Appointment[];
  loading: boolean;
  setBusiness: (b: Business) => void;
  setAppointments: (a: Appointment[]) => void;
  addAppointment: (a: Appointment) => void;
  setLoading: (l: boolean) => void;
}

export const useBusinessStore = create<BusinessState>((set, get) => ({
  business: { id: DEMO_BUSINESS.id, slug: DEMO_BUSINESS.slug, name: DEMO_BUSINESS.name, ownerEmail: DEMO_BUSINESS.ownerEmail, phone: DEMO_BUSINESS.phone, description: DEMO_BUSINESS.description },
  appointments: [],
  loading: false,
  setBusiness: (business) => set({ business }),
  setAppointments: (appointments) => { const cur = get().appointments; if (cur.length === appointments.length && cur.every((a, i) => a.id === appointments[i]?.id)) return; set({ appointments }); },
  addAppointment: (a) => set((s) => ({ appointments: [a, ...s.appointments] })),
  setLoading: (loading) => set({ loading }),
}));
