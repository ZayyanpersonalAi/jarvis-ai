// Shared types — Jarvis AI

export type Language = "ur" | "en";
export type VoiceStatus = "idle" | "listening" | "thinking" | "speaking" | "error";
export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  language?: Language;
  createdAt: string;
  toolUsed?: string;
}

export interface Business {
  id: string;
  slug: string;
  name: string;
  ownerEmail?: string;
  phone?: string;
  description?: string;
  createdAt?: string;
}

export interface Appointment {
  id: string;
  businessId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  service: string;
  date: string;
  time: string;
  notes?: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface WidgetConfig {
  id: string;
  businessId: string;
  slug: string;
  title: string;
  greeting: string;
  primaryColor: string;
  language: Language;
}

export interface ToolInfo {
  name: string;
  category: string;
  description: string;
  parameters: Record<string, { type: string; description: string; required?: boolean }>;
}

export interface ApiResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  demo?: boolean;
}
