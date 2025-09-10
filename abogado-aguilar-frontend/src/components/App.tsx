// abogado-aguilar-frontend/src/App.tsx
import { useEffect, useState } from "react";

/**
 * Base de la API (prod: Render). Puedes sobreescribirla en Vercel con
 * PUBLIC_HELP_API_BASE=https://editable-landing-backend.onrender.com
 */
const API_BASE = (import.meta.env.PUBLIC_HELP_API_BASE ||
  "https://editable-landing-backend.onrender.com"
).replace(/\/$/, "");

type Status = "checking" | "ok" | "down";

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="max-w-xl w-full rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
        <h2 className="text-lg font-semibold">Error</h2>
        <p className="mt-2">{message}</p>
        <ul className="mt-3 list-disc pl-5 text-sm text-red-600">
          <li>Verifica que la API esté en línea.</li>
          <li>
            Revisa la variable{" "}
            <code className="px-1 rounded bg-white border">PUBLIC_HELP_API_BASE</code>{" "}
            en Vercel (Project → Settings → Environment Variables).
          </li>
        </ul>
      </div>
    </div>
  );
}

export default function App({ siteId }: { siteId?: string }) {
  const [status, setStatus] = useState<Status>("checking");
  const [errMsg, setErrMsg] = useState<string>("");

  useEffect(() => {
    // Chequeo rápido para evitar pantalla en blanco si la API no responde
    const check = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/health`, {
          method: "GET",
          // evita cache en navegadores intermedios / CDN
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        setStatus("ok");
      } catch (e: any) {
        setErrMsg(
          `No se pudo conectar a la API (${e?.message ?? "motivo desconocido"}).`
        );
        setStatus("down");
      }
    };
    check();
  }, []);

  if (status === "checking") {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-gray-600">
        Cargando…
      </div>
    );
  }

  if (status === "down") {
    return <ErrorBox message={errMsg} />;
  }

  // ✅ Si la API está OK, muestra tu landing normalmente.
  // OJO: el HelpButton ya está en el <Footer />, así que NO lo renderizamos aquí.
  return (
    <div className="bg-white">
      {/* ====== TU CONTENIDO EXISTENTE ======
          Mantén aquí tus secciones: Header, Hero, Sections, Tabs, etc.
          Ejemplos ilustrativos (borra si no aplican en tu proyecto):
      */}
      <main className="container mx-auto px-4 py-12">
        {/* <Hero /> */}
        {/* <Services /> */}
        {/* <Testimonials /> */}
        {/* <Faq /> */}
      </main>

      {/* <Footer />  ← aquí va tu HelpButton */}
    </div>
  );
}
