import type { SiteContent } from "../types";
import type { CSSProperties } from "react";

// Base del API: en dev suele ir vacía (proxy de Vite); en prod puedes setear tu dominio.
const API_BASE = (import.meta.env.PUBLIC_API_BASE ?? "").replace(/\/$/, "");

export async function fetchContent(siteId: string): Promise<SiteContent> {
  const path = `/api/content/public/${encodeURIComponent(siteId)}`;
  const url = API_BASE ? `${API_BASE}${path}` : path;

  // (Opcional) timeout seguro
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      headers: { accept: "application/json" },
      signal: controller.signal,
    });

    // fetch NO rechaza en 404/500; hay que revisar res.ok (MDN).
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `fetchContent ${res.status} ${res.statusText} -> ${res.url}\n` +
        body.slice(0, 300)
      );
    }
    return res.json() as Promise<SiteContent>;
  } finally {
    clearTimeout(t);
  }
}

export function primaryCssVars(colors: SiteContent["theme"]["colors"]): CSSProperties {
  return {
    "--p": colors.primary,
    "--s": colors.secondary ?? colors.primary,
    "--bg": colors.background,
    "--t": colors.text,
  } as CSSProperties;
}

// Util para componer WhatsApp
export function buildWhatsAppUrl(base: string, message?: string) {
  try {
    const u = new URL(base);
    if (message) u.searchParams.set("text", message);
    return u.toString();
  } catch {
    const clean = base.replace(/\D/g, "");
    const msg = message ? `?text=${encodeURIComponent(message)}` : "";
    return `https://wa.me/${clean}${msg}`;
  }
}
