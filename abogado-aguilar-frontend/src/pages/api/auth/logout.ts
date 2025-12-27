import type { APIRoute } from "astro";

export const prerender = false;
const COOKIE_NAME = "auth";

export const POST: APIRoute = async ({ cookies }) => {
  cookies.delete(COOKIE_NAME, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: import.meta.env.PROD,
  });
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
};
