// src/pages/api/auth/me.ts
import type { APIRoute } from "astro";

export const prerender = false; // runtime (SSR)

const API_ORIGIN =
  import.meta.env.API_ORIGIN ??
  import.meta.env.PUBLIC_API_BASE ??
  "http://localhost:4000";

const COOKIE_NAME = "auth_token"; // AJUSTA AL NOMBRE REAL DE TU COOKIE

export const GET: APIRoute = async ({ cookies }) => {
  const token = cookies.get(COOKIE_NAME)?.value;

  // Si no hay cookie -> no hay sesión
  if (!token) {
    return new Response(JSON.stringify({ ok: false }), {
      status: 401,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const upstream = await fetch(`${API_ORIGIN}/api/auth/me`, {
    headers: {
      accept: "application/json",
      authorization: `Bearer ${token}`,
    },
  });

  // Si el backend dice “expiró / no válido” -> borra cookie y regresa 401
  if (upstream.status === 401) {
    cookies.delete(COOKIE_NAME, { path: "/" });
    return new Response(JSON.stringify({ ok: false }), {
      status: 401,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
};
