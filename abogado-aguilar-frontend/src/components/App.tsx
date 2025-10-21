// abogado-aguilar-frontend/src/App.tsx
import { useEffect, useState } from "react";

/**
 * Base de API. En Vercel define:
 * PUBLIC_HELP_API_BASE = https://editable-landing-backend.onrender.com
 */
const API_BASE = (import.meta.env.PUBLIC_HELP_API_BASE ||
  "https://editable-landing-backend.onrender.com"
).replace(/\/$/, "");

type Status = "checking" | "ok" | "down";

export default function App() {
  const [status, setStatus] = useState<Status>("checking");
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/health`, { cache: "no-store" });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        if (!aborted) setStatus("ok");
      } catch (e: any) {
        if (!aborted) {
          setErr(e?.message || "Failed to fetch");
          setStatus("down");
        }
      }
    })();
    return () => {
      aborted = true;
    };
  }, []);

  // ✅ No bloqueamos el render cuando todo va bien
  if (status === "ok") return null;

  // No muestres “pantalla en blanco” mientras chequea
  if (status === "checking") return null;

  // ❌ Solo si hay error mostramos un overlay no bloqueante
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-6 pointer-events-none">
      <div className="pointer-events-auto max-w-xl w-full rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
        <h2 className="text-lg font-semibold">Error</h2>
        <p className="mt-2">
          No se pudo conectar a la API (<span className="font-mono">{err}</span>).
        </p>
        <ul className="mt-3 list-disc pl-5 text-sm text-red-600">
          <li>Verifica que la API esté en línea.</li>
          <li>
            Revisa <code className="px-1 rounded bg-white border">PUBLIC_HELP_API_BASE</code> en Vercel.
          </li>
        </ul>
      </div>
    </div>
  );
}
