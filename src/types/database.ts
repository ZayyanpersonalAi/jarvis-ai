// Supabase database types — Jarvis AI
// Tables are created by supabase/schema.sql

export interface DbBusiness {
  id: string;
  owner_id: string | null;
  slug: string;
  name: string;
  name_urdu: string | null;
  phone: string | null;
  email: string | null;
  description: string | null;
  description_urdu: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbAppointment {
  id: string;
  business_id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  service: string;
  date: string;
  time: string;
  notes: string | null;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  created_at: string;
}

export interface DbConversation {
  id: string;
  business_id: string | null;
  visitor_name: string | null;
  language: string;
  created_at: string;
}

export interface DbMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  text: string;
  tool_used: string | null;
  created_at: string;
}

export interface DbWidget {
  id: string;
  business_id: string;
  slug: string;
  title: string;
  title_urdu: string;
  greeting: string;
  greeting_urdu: string;
  primary_color: string;
  language: string;
  created_at: string;
}

export interface DbAutomation {
  id: string;
  business_id: string;
  name: string;
  name_urdu: string | null;
  trigger: string;
  tool_name: string;
  enabled: boolean;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      businesses: { Row: DbBusiness; Insert: Partial<DbBusiness>; Update: Partial<DbBusiness> };
      appointments: { Row: DbAppointment; Insert: Partial<DbAppointment>; Update: Partial<DbAppointment> };
      conversations: { Row: DbConversation; Insert: Partial<DbConversation>; Update: Partial<DbConversation> };
      messages: { Row: DbMessage; Insert: Partial<DbMessage>; Update: Partial<DbMessage> };
      widgets: { Row: DbWidget; Insert: Partial<DbWidget>; Update: Partial<DbWidget> };
      automations: { Row: DbAutomation; Insert: Partial<DbAutomation>; Update: Partial<DbAutomation> };
    };
  };
}
