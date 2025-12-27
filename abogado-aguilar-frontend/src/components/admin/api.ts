import type { SiteContent } from "../../types";

type ApiError = Error & { status?: number; body?: string };

async function requestJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    credentials: "include", // 👈 importante con cookies
    ...init,
    headers: { ...(init?.headers ?? {}), accept: "application/json" },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const err: ApiError = new Error(body || `Request failed (${res.status})`);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return (await res.json()) as T;
}

export async function apiLogin(email: string, password: string) {
  await requestJson<{ ok: boolean }>("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export async function apiMe() {
  return await requestJson<{ ok: boolean }>("/api/auth/me");
}

export async function apiLogout() {
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
}

export async function apiGet(siteId: string): Promise<SiteContent> {
  return await requestJson<SiteContent>(`/api/content/admin/${encodeURIComponent(siteId)}`);
}

export async function apiPut(siteId: string, data: SiteContent): Promise<SiteContent> {
  return await requestJson<SiteContent>(`/api/content/admin/${encodeURIComponent(siteId)}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  });
}
