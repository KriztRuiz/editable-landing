import type { SiteContent } from "../types";
import type { CSSProperties } from "react";

function readPublicApiBase(): string | undefined {
  // Build-time (Vite/Astro)
  const fromVite = (import.meta.env.PUBLIC_API_BASE as string | undefined)?.trim();

  // Runtime (SSR function)
  const fromProcess =
    typeof process !== "undefined"
      ? (process.env.PUBLIC_API_BASE as string | undefined)?.trim()
      : undefined;

  return fromVite || fromProcess || undefined;
}

function assertAbsoluteHttpUrl(value: string, varName = "PUBLIC_API_BASE") {
  try {
    const u = new URL(value);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      throw new Error(`Protocolo no soportado: ${u.protocol}`);
    }
  } catch {
    throw new Error(
      `${varName} inválida: "${value}". Debe ser una URL absoluta con http/https (ej: https://mi-backend.com)`
    );
  }
}

const IS_DEV = Boolean(import.meta.env.DEV);

const RAW_API_BASE = readPublicApiBase();

const API_BASE = (() => {
  if (RAW_API_BASE) {
    const base = RAW_API_BASE.replace(/\/+$/, "");
    assertAbsoluteHttpUrl(base);
    return base;
  }

  // En local, te dejo el fallback para que no te estorbe.
  if (IS_DEV) return "http://localhost:4000";

  // En producción, NO: porque “rompe” en silencio y pierdes horas.
  throw new Error(
    "Falta PUBLIC_API_BASE en producción. Configúrala en Vercel (Production/Preview) y haz redeploy."
  );
})();

function buildPublicContentUrl(siteId: string): string {
  // Normaliza para que /api no se duplique si ya viene incluido en PUBLIC_API_BASE
  const baseWithSlash = API_BASE.endsWith("/") ? API_BASE : `${API_BASE}/`;
  const baseUrl = new URL(baseWithSlash);
  const basePath = baseUrl.pathname.replace(/\/+$/, "");

  // Si la base ya termina en /api, NO agregamos /api otra vez
  const rel = basePath.endsWith("/api")
    ? `content/public/${encodeURIComponent(siteId)}`
    : `api/content/public/${encodeURIComponent(siteId)}`;

  return new URL(rel, baseUrl).toString();
}

export async function fetchContent(siteId: string): Promise<SiteContent> {
  const id = String(siteId ?? "").trim();

  // Esto evita requests tipo ".../undefined" cuando algo raro pase
  if (!id || id === "undefined" || id === "null") {
    throw new Error(`siteId inválido: "${siteId}"`);
  }

  const url = buildPublicContentUrl(id);

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(url, {
      headers: { accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `fetchContent ${res.status} ${res.statusText} -> ${url}\n` + body.slice(0, 300)
      );
    }

    return (await res.json()) as SiteContent;
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

export function buildWhatsAppUrl(base: string, message?: string) {
  try {
    const u = new URL(base);
    if (message) u.searchParams.set("text", message);
    return u.toString();
  } catch {
    const clean = String(base ?? "").replace(/\D/g, "");
    const msg = message ? `?text=${encodeURIComponent(message)}` : "";
    return `https://wa.me/${clean}${msg}`;
  }
}
