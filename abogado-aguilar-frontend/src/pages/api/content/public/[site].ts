// src/pages/api/content/public/[site].ts
import type { APIRoute } from "astro";
export const prerender = false;

const API_ORIGIN = (process.env.API_ORIGIN ?? import.meta.env.API_ORIGIN ?? "").trim();

export const GET: APIRoute = async ({ params, url }) => {
  const site = params.site?.toString().trim();
  if (!site) return new Response("Falta :site", { status: 400 });

  if (!API_ORIGIN) return new Response("Falta API_ORIGIN", { status: 500 });

  const target = `${API_ORIGIN}/api/content/public/${encodeURIComponent(site)}${url.search}`;

  const upstream = await fetch(target, { headers: { accept: "application/json" }, cache: "no-store" });

  if (!upstream.ok) {
    const body = await upstream.text().catch(() => "");
    return new Response(body.slice(0, 400), { status: upstream.status });
  }

  return new Response(await upstream.text(), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
};
