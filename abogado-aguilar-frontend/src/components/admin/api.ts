import type { SiteContent } from "../../types";

const API_BASE =
  (import.meta as any).env?.PUBLIC_API_BASE && (import.meta as any).env.PUBLIC_API_BASE.length
    ? (import.meta as any).env.PUBLIC_API_BASE
    : ""; // vacío = usa proxy de Vite/Astro en dev

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login HTTP ${res.status}`);
  return (await res.json()) as { token: string };
}

export async function apiGet(siteId: string, token: string) {
  const res = await fetch(`${API_BASE}/api/content/admin/${siteId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`GET HTTP ${res.status}`);
  return (await res.json()) as SiteContent;
}

export async function apiPut(siteId: string, token: string, payload: SiteContent) {
  const res = await fetch(`${API_BASE}/api/content/admin/${siteId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`PUT HTTP ${res.status} ${text}`);
  }
  return (await res.json()) as SiteContent;
}
