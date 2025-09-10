// abogado-aguilar-frontend/src/lib/helpApi.ts

// Usa variable pública en Vercel para apuntar al backend en Render.
// En local, si no la defines, quedará vacío y usará rutas relativas (útil si
// tienes proxy en astro.config.mjs hacia tu backend local).
const BASE = (import.meta.env.PUBLIC_HELP_API_BASE || "").replace(/\/$/, "");

async function api<T = any>(path: string, init?: RequestInit): Promise<T> {
  const url = BASE ? `${BASE}${path}` : path;

  const res = await fetch(url, {
    // evita que CDN/Navegador cachee respuestas de API
    cache: "no-store",
    ...init,
  });

  if (!res.ok) {
    // Intenta leer texto para depurar mejor
    const text = await res.text().catch(() => "");
    const msg = `API ${res.status} ${res.statusText}: ${text.slice(0, 180)}`;
    throw new Error(msg);
  }

  // Si la respuesta no es JSON lanzará; es correcto para detectar 404/HTML.
  return res.json() as Promise<T>;
}

export function fetchFaqs(q = "") {
  return api(`/api/help/faq?q=${encodeURIComponent(q)}`);
}

export function createTicket(data: { name: string; email: string; message: string }) {
  return api(`/api/help/ticket`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function createChatSession() {
  return api(`/api/help/chat/session`, { method: "POST" });
}

export function sendChatMessage(sessionId: string, userMsg: string) {
  return api(`/api/help/chat/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, userMsg }),
  });
}
