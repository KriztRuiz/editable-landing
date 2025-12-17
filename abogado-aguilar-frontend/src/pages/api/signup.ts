import type { APIRoute } from "astro";

export const GET: APIRoute = () => {
  return new Response("Método no permitido", { status: 405 });
};

// proxy de sign‑up hacia tu backend
export const POST: APIRoute = async ({ request }) => {
  const API_BASE = import.meta.env.PUBLIC_API_BASE ?? "http://localhost:4000";
  const body = await request.text();

  const resp = await fetch(`${API_BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  // Devuelve el cuerpo y el código de estado tal cual
  const text = await resp.text();
  return new Response(text, {
    status: resp.status,
    headers: { "Content-Type": resp.headers.get("Content-Type") ?? "text/plain" },
  });
};
