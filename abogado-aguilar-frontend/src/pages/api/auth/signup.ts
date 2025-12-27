import type { APIRoute } from "astro";

export const prerender = false;

const API_ORIGIN = (process.env.API_ORIGIN ?? import.meta.env.API_ORIGIN ?? "").replace(/\/$/, "");
const cookieName = (isProd: boolean) => (isProd ? "__Host-session" : "session");

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!API_ORIGIN) return new Response("Missing API_ORIGIN", { status: 500 });

  const payload = await request.json().catch(() => null) as any;
  if (!payload?.email || !payload?.password || !payload?.siteId) {
    return new Response("Missing signup fields", { status: 400 });
  }

  const signupRes = await fetch(`${API_ORIGIN}/api/auth/signup`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(payload),
  });

  if (!signupRes.ok) {
    const msg = await signupRes.text().catch(() => "");
    return new Response(msg || "Signup failed", { status: signupRes.status });
  }

  // Auto-login
  const loginRes = await fetch(`${API_ORIGIN}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ email: payload.email, password: payload.password }),
  });

  if (!loginRes.ok) {
    // Signup ok pero login falló → devuelves ok y que el usuario inicie sesión manualmente
    return new Response(JSON.stringify({ ok: true, needsLogin: true }), {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const data = await loginRes.json().catch(() => null) as null | { token?: string };
  const token = data?.token;
  if (token) {
    const isProd = import.meta.env.PROD;
    cookies.set(cookieName(isProd), token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
};
