// src/pages/api/auth/me.ts
import type { APIRoute } from "astro";

export const prerender = false; // runtime (SSR) :contentReference[oaicite:2]{index=2}

const API_ORIGIN =
  import.meta.env.API_ORIGIN ??
  import.meta.env.PUBLIC_API_BASE ??
  "http://localhost:4000";

// Puedes sobreescribir el nombre por env si quieres (Render/Vercel)
const COOKIE_NAME = import.meta.env.AUTH_COOKIE_NAME ?? "auth_token";

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // auth endpoints: nunca cachear
      "cache-control": "no-store",
      ...headers,
    },
  });
}

export const GET: APIRoute = async ({ cookies }) => {
  const token = cookies.get(COOKIE_NAME)?.value;

  // No cookie => no sesión
  if (!token) return json({ ok: false }, 401);

  const target = `${API_ORIGIN}/api/auth/me`;

  const upstream = await fetch(target, {
    method: "GET",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  // Token expirado / inválido => borra cookie y fuerza re-login
  if (upstream.status === 401) {
    cookies.delete(COOKIE_NAME, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: import.meta.env.PROD,
    }); // opciones válidas en Astro :contentReference[oaicite:3]{index=3}

    return json({ ok: false }, 401);
  }

  // Otros errores del backend: devuelve texto para debug
  if (!upstream.ok) {
    const body = await upstream.text().catch(() => "");
    return new Response(body || `Upstream error: ${upstream.status}`, {
      status: upstream.status,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }

  // OK: devuelve el JSON tal cual lo manda el backend
  const body = await upstream.text().catch(() => "");
  return new Response(body || JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
};
