import type { APIRoute } from "astro";

export const prerender = false;

const API_ORIGIN = import.meta.env.API_ORIGIN ?? "http://localhost:4000";
const COOKIE_NAME = "auth";

async function proxy({ request, params, url, cookies }: Parameters<APIRoute>[0]) {
  const site = (params.site ?? "bufete-ejemplo").toString();
  const target = `${API_ORIGIN}/api/content/admin/${encodeURIComponent(site)}${url.search}`;

  const token = cookies.get(COOKIE_NAME)?.value;
  if (!token) return new Response("Unauthorized", { status: 401 });

  const headers: Record<string, string> = {
    accept: "application/json",
    authorization: `Bearer ${token}`,
  };

  const method = request.method.toUpperCase();
  const init: RequestInit = { method, headers };

  if (method !== "GET" && method !== "HEAD") {
    headers["content-type"] = request.headers.get("content-type") ?? "application/json";
    init.body = await request.text();
  }

  const upstream = await fetch(target, init);

  // Si expiró => borrar cookie y forzar re-login
  if (upstream.status === 401) {
    cookies.delete(COOKIE_NAME, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: import.meta.env.PROD,
    });
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await upstream.text().catch(() => "");
  return new Response(body, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/json; charset=utf-8",
      "Cache-Control": "no-store", // admin: no cache
    },
  });
}

export const GET: APIRoute = proxy;
export const PUT: APIRoute = proxy;
