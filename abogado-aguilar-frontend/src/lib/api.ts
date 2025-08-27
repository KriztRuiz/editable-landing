import type { SiteContent } from "../types";

export async function fetchContent(siteId: string) {
  const base = import.meta.env.PUBLIC_API_BASE || ""; // vacío en dev
  const res = await fetch(`${base}/api/content/public/${siteId}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function primaryCssVars(colors: SiteContent["theme"]["colors"]) {
  return {
    "--p": colors.primary,
    "--s": colors.secondary,
    "--bg": colors.background,
    "--t": colors.text,
  } as React.CSSProperties;
}

// Util para componer WhatsApp
export function buildWhatsAppUrl(base: string, message?: string) {
  try {
    const u = new URL(base);
    if (message) u.searchParams.set("text", message);
    return u.toString();
  } catch {
    // Si mandan solo el número
    const clean = base.replace(/\D/g, "");
    const msg = message ? `?text=${encodeURIComponent(message)}` : "";
    return `https://wa.me/${clean}${msg}`;
  }
}
