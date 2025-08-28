// src/pages/api/content/public/[site].ts
import type { APIRoute } from "astro";

export const prerender = false; // ejecuta en runtime (no prerender)

const API_ORIGIN = import.meta.env.API_ORIGIN ?? "http://localhost:4000";

export const GET: APIRoute = async ({ params, url }) => {
  const site = (params.site ?? "bufete-ejemplo").toString();
  const target = `${API_ORIGIN}/api/content/public/${encodeURIComponent(site)}${url.search}`;

  const upstream = await fetch(target, {
    headers: { accept: "application/json" },
  });

  if (!upstream.ok) {
    const body = await upstream.text().catch(() => "");
    return new Response(
      `Upstream ${upstream.status} ${upstream.statusText} -> ${target}\n${body.slice(0, 400)}`,
      { status: upstream.status, headers: { "content-type": "text/plain; charset=utf-8" } }
    );
  }

  const json = await upstream.text();
  return new Response(json, {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // cache CDN (no browser)
      "Cache-Control": "max-age=0, s-maxage=300, stale-while-revalidate=60",
      // opcional: control explícito del edge de Vercel
      "CDN-Cache-Control": "s-maxage=300, stale-while-revalidate=60",
    },
  });
};
