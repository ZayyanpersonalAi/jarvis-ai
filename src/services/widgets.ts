// Widget service — embed code and config (English UI; voice understands Urdu too)
import type { WidgetConfig } from "@/types";

export function getWidgetConfig(slug: string): WidgetConfig {
  return {
    id: `widget-${slug}`, businessId: "demo-business", slug,
    title: "Jarvis AI Assistant",
    greeting: "Hi! I'm Jarvis — how can I help you today?",
    primaryColor: "#2dd4bf", language: "en",
  };
}

export function getEmbedCode(slug: string, baseUrl: string): string {
  return `<script src="${baseUrl}/widget.js" data-business="${slug}" async></script>`;
}

export async function fetchWidgetConfig(slug: string, baseUrl = ""): Promise<WidgetConfig> {
  try {
    const res = await fetch(`${baseUrl}/api/widget?slug=${encodeURIComponent(slug)}`);
    if (res.ok) { const j = await res.json(); if (j?.data) return j.data as WidgetConfig; }
  } catch { /* fallback */ }
  return getWidgetConfig(slug);
}
