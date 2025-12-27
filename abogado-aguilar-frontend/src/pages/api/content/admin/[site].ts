// src/pages/api/content/admin/[site].ts
import type { APIRoute } from "astro";
export const prerender = false;

const API_ORIGIN = (process.env.API_ORIGIN ?? import.meta.env.API_ORIGIN ?? "").replace(/\/$/, "");

function unauthorized(cookies: any) {
  cookies.delete("__Host_session", { path: "/" });
  return new Response("Unauthorized", { status: 401 });
}

export const GET: APIRoute = async ({ params, cookies }) => {
  if (!API_ORIGIN) return new Response("Missing API_ORIGIN", { status: 500 });

  const site = params.site?.toString().trim();
  if (!site) return new Response("Missing :site", { status: 400 });

  const token = cookies.get("__Host_session")?.value;
  if (!token) return new Response("Unauthorized", { status: 401 });

  const upstream = await fetch(`${API_ORIGIN}/api/content/admin/${encodeURIComponent(site)}`, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  // Si expiró token → limpias cookie y fuerzas login
  if (upstream.status === 401) return unauthorized(cookies);

  if (!upstream.ok) {
    const msg = await upstream.text().catch(() => "");
    return new Response(msg || "Upstream error", { status: upstream.status });
  }

  return new Response(await upstream.text(), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
};
