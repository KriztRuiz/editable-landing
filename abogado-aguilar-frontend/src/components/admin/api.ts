// src/components/admin/api.ts
import type { SiteContent } from "../../types";

/**
 * Helper error that preserves HTTP status + optional response body.
 */
export class ApiError extends Error {
  status: number;
  body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type RequestJsonOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

function buildHeaders(hasBody: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    accept: "application/json",
  };
  if (hasBody) headers["content-type"] = "application/json";
  return headers;
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function requestJson<T>(path: string, opts: RequestJsonOptions = {}): Promise<T> {
  const hasBody = opts.body !== undefined;

  const res = await fetch(path, {
    method: opts.method ?? "GET",
    headers: buildHeaders(hasBody),
    body: hasBody ? JSON.stringify(opts.body) : undefined,

    // IMPORTANTE: para sesión con cookie HttpOnly.
    // Aunque sea same-origin, esto asegura envío/recepción consistente.
    credentials: "include", // :contentReference[oaicite:1]{index=1}

    signal: opts.signal,
  });

  const text = await res.text().catch(() => "");
  const maybeJson = text ? safeJsonParse(text) : undefined;

  if (!res.ok) {
    const msg =
      (typeof maybeJson === "object" &&
        maybeJson &&
        "message" in (maybeJson as any) &&
        String((maybeJson as any).message)) ||
      `${res.status} ${res.statusText}`;

    throw new ApiError(msg, res.status, maybeJson ?? text);
  }

  // Algunos endpoints pueden regresar body vacío
  return (text ? (maybeJson as T) : (undefined as unknown as T));
}

// ---------- Auth (cookie session) ----------

export type MeUser = { id?: string; email: string; siteIds?: string[] };
export type MeResult = { ok: true; user: MeUser } | { ok: false };

export async function apiLogin(email: string, password: string): Promise<void> {
  await requestJson("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function apiLogout(): Promise<void> {
  try {
    await requestJson("/api/auth/logout", { method: "POST" });
  } catch {
    // si ya no había sesión, no importa
  }
}

export async function apiMe(): Promise<MeResult> {
  try {
    const data = await requestJson<any>("/api/auth/me", { method: "GET" });

    // Normaliza formas:
    // - { user: {...} }
    // - o directamente { email: ... }
    const user = (data?.user ?? data) as any;

    if (user && typeof user.email === "string") {
      return { ok: true, user: { email: user.email, id: user.id, siteIds: user.siteIds } };
    }
    return { ok: false };
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) return { ok: false };
    throw e;
  }
}

// ---------- Content (admin) ----------

export async function apiGet(siteId: string): Promise<SiteContent> {
  return requestJson<SiteContent>(`/api/content/admin/${encodeURIComponent(siteId)}`, { method: "GET" });
}

export async function apiPut(siteId: string, content: SiteContent): Promise<SiteContent> {
  return requestJson<SiteContent>(`/api/content/admin/${encodeURIComponent(siteId)}`, {
    method: "PUT",
    body: content,
  });
}
