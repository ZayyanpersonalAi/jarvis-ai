import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = loginSchema.extend({
  name: z.string().min(2, "Enter your name"),
  businessName: z.string().min(2, "Enter a business name"),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const appointmentSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
  service: z.string().min(2, "Enter a service"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  notes: z.string().optional(),
});
export type AppointmentInput = z.infer<typeof appointmentSchema>;

export const businessSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug can only have lowercase letters, numbers and -"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  description: z.string().optional(),
});
export type BusinessInput = z.infer<typeof businessSchema>;

export const chatSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  language: z.enum(["ur", "en"]).optional(),
  conversationId: z.string().optional(),
});
export type ChatInput = z.infer<typeof chatSchema>;

export const toolExecuteSchema = z.object({
  name: z.string().min(1),
  args: z.record(z.unknown()).default({}),
});
export type ToolExecuteInput = z.infer<typeof toolExecuteSchema>;
