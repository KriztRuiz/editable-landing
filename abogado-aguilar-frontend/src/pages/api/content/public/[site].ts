// src/pages/api/content/public/[site].ts
import type { APIRoute } from "astro";

// Si tu salida global es "static", esto fuerza endpoint "vivo"
export const prerender = false; // ← importante en modo static. :contentReference[oaicite:1]{index=1}

export const GET: APIRoute = async ({ params }) => {
  const site = params.site ?? "default";
  const payload = {
    profile: { fullName: "Lic. Ejemplo", headline: "Asesoría legal" },
    contact: { phone: "8112345678", email: "hola@ejemplo.com" },
    theme: { colors: { background: "#fff", text: "#111", primary: "#0ea5e9" } },
    sections: { showAreas: true, showServices: true, showFaqs: true, showTestimonials: true },
    specialties: [], services: [], faqs: [], testimonials: [],
    seo: { title: `Despacho — ${site}`, description: "Sitio de ejemplo" },
    schedule: [],
  };
  return new Response(JSON.stringify(payload), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
};
