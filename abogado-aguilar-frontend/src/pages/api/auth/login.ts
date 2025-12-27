import type { APIRoute } from "astro";

export const prerender = false;

const API_ORIGIN = import.meta.env.API_ORIGIN ?? "http://localhost:4000";
const COOKIE_NAME = "auth";

export const POST: APIRoute = async ({ request, cookies }) => {
  const { email, password } = await request.json().catch(() => ({} as any));
  if (!email || !password) return new Response("Missing credentials", { status: 400 });

  const upstream = await fetch(`${API_ORIGIN}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!upstream.ok) {
    const body = await upstream.text().catch(() => "");
    return new Response(body || upstream.statusText, { status: upstream.status });
  }

  const data = await upstream.json().catch(() => null);
  const token = (data as any)?.token;
  if (!token) return new Response("Upstream did not return token", { status: 502 });

  // Cookie HttpOnly + SameSite (Astro cookies API) :contentReference[oaicite:1]{index=1}
  cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: import.meta.env.PROD,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
};
