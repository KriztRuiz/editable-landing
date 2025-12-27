import type { APIRoute } from "astro";

export const prerender = false;
const COOKIE_NAME = "auth";

export const GET: APIRoute = async ({ cookies }) => {
  const token = cookies.get(COOKIE_NAME)?.value;
  if (!token) return new Response("Unauthorized", { status: 401 });
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
};
