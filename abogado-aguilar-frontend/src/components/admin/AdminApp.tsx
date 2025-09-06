// src/components/admin/AdminApp.tsx
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { SiteContent } from "../../types";
import { apiGet, apiPut } from "./api";
import Login from "./Login";
import { Btn } from "./ui";

// Tabs
import ProfileTab from "./tabs/ProfileTab";
import ContactTab from "./tabs/ContactTab";
import CtaTab from "./tabs/CtaTab";
import SeoTab from "./tabs/SeoTab";
import ThemeTab from "./tabs/ThemeTab";
import SpecialtiesTab from "./tabs/SpecialtiesTab";
import ServicesTab from "./tabs/ServicesTab";
import FaqsTab from "./tabs/FaqsTab";
import TestimonialsTab from "./tabs/TestimonialsTab";
import ScheduleTab from "./tabs/ScheduleTab";
import SectionsTab from "./tabs/SectionsTab";
import JsonTab from "./tabs/JsonTab";

/* 🟢 Motion */
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  useReducedMotion,
  type Variants,
} from "framer-motion";

/* -------------------------- helpers -------------------------- */
type Tab =
  | "perfil" | "contacto" | "cta" | "seo" | "tema"
  | "especialidades" | "servicios" | "faqs" | "testimonios" | "horario"
  | "secciones" | "json";

const deepEqual = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const isUrl = (v?: string) => {
  if (!v) return true;
  try { new URL(v); return true; } catch { return false; }
};

// Validación mínima en cliente (evita PUT con datos obviously inválidos)
function validateContent(d: SiteContent): string[] {
  const errs: string[] = [];
  if (!d.profile.fullName?.trim()) errs.push("Perfil: nombre completo requerido");
  if (!d.contact.email?.includes("@")) errs.push("Contacto: email inválido");
  if (!d.cta.preferred) errs.push("CTA: preferida requerida");
  if (!d.seo.title?.trim()) errs.push("SEO: title requerido");
  if (!d.seo.description?.trim()) errs.push("SEO: description requerida");
  // URLs opcionales
  if (!isUrl(d.profile.photoUrl)) errs.push("Foto: URL inválida");
  if (!isUrl(d.theme.logoUrl)) errs.push("Tema: logo URL inválida");
  // coverUrl es opcional si la agregaste en tu tipo
  // @ts-ignore - por si aún no está en tus tipos
  if (!isUrl(d.theme.coverUrl)) errs.push("Tema: portada URL inválida");
  if (!isUrl(d.cta.bookingUrl)) errs.push("CTA: booking URL inválida");
  if (!isUrl(d.contact.mapUrl)) errs.push("Contacto: map URL inválida");
  return errs;
}

/* =========================== Componente =========================== */
export default function AdminApp({ siteId }: { siteId: string }) {
  // client:only => podemos leer localStorage en el init
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("authToken"));
  const [data, setData] = useState<SiteContent | null>(null);
  const [initial, setInitial] = useState<SiteContent | null>(null);
  const [tab, setTab] = useState<Tab>("perfil");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // 🟢 accesibilidad: respeta "Reducir movimiento"
  const reduce = useReducedMotion(); // para minimizar desplazamientos si el usuario lo solicita.

  // Carga inicial
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    apiGet(siteId, token)
      .then((d) => {
        setData(d);
        setInitial(d);
        setGlobalError(null);
      })
      .catch((e: any) => {
        // Si la API devuelve 401 (token caducado o inválido),
        // eliminamos el token para volver a mostrar la pantalla de login.
        if (e?.status === 401 || (typeof e?.message === 'string' && e.message.includes('401'))) {
          localStorage.removeItem('authToken');
          setToken(null);
          setGlobalError(null);
        } else {
          setGlobalError(e?.message);
        }
      })
      .finally(() => setLoading(false));
  }, [token, siteId]);

  // Atajo Ctrl/Cmd+S para guardar
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [token, data, saving]);

  // Aviso al cerrar si hay cambios sin guardar
  const hasChanges = !!(data && initial && !deepEqual(data, initial));
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!hasChanges) return;
      e.preventDefault();
      e.returnValue = ""; // muestra diálogo nativo
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasChanges]);

  const themeVars: CSSProperties = useMemo(() => {
    const c = data?.theme?.colors;
    return c ? { background: c.background, color: c.text } : {};
  }, [data]);

  function logout() {
    localStorage.removeItem("authToken");
    setToken(null);
    setData(null);
    setInitial(null);
  }

  function resetChanges() {
    if (initial) setData(initial);
  }

  async function handleSave() {
    if (!token || !data) return;
    const v = validateContent(data);
    if (v.length) {
      setGlobalError("Corrige: " + v.join(" · "));
      return;
    }
    setSaving(true);
    setMessage(null);
    setGlobalError(null);
    try {
      const saved = await apiPut(siteId, token, data);
      setData(saved);
      setInitial(saved);
      setMessage("Guardado ✓");
      setTimeout(() => setMessage(null), 1500);
    } catch (e: any) {
      setGlobalError(e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  // Estado de login / carga
  if (!token) {
    return (
      <Login
        onLogin={(t) => {
          localStorage.setItem("authToken", t);
          setToken(t);
        }}
      />
    );
  }
  if (loading) return <div className="container-xl py-12">Cargando…</div>;
  if (globalError) return <div className="container-xl py-12 text-red-600">Error: {globalError}</div>;
  if (!data) return null;

  const tabs: { id: Tab; label: string; node: JSX.Element }[] = [
    { id: "perfil", label: "Perfil", node: <ProfileTab data={data} setData={setData} /> },
    { id: "contacto", label: "Contacto", node: <ContactTab data={data} setData={setData} /> },
    { id: "cta", label: "CTA", node: <CtaTab data={data} setData={setData} /> },
    { id: "seo", label: "SEO", node: <SeoTab data={data} setData={setData} /> },
    { id: "tema", label: "Tema", node: <ThemeTab data={data} setData={setData} /> },
    { id: "especialidades", label: "Especialidades", node: <SpecialtiesTab data={data} setData={setData} /> },
    { id: "servicios", label: "Servicios", node: <ServicesTab data={data} setData={setData} /> },
    { id: "faqs", label: "FAQs", node: <FaqsTab data={data} setData={setData} /> },
    { id: "testimonios", label: "Testimonios", node: <TestimonialsTab data={data} setData={setData} /> },
    { id: "horario", label: "Horario", node: <ScheduleTab data={data} setData={setData} /> },
    { id: "secciones", label: "Secciones", node: <SectionsTab data={data} setData={setData} /> },
    { id: "json", label: "JSON", node: <JsonTab data={data} setData={setData} /> },
  ];

  // Variants reutilizables
  const headerV: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 8 },
    show: { opacity: 1, y: 0 }
  };
  const tabsV: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 6 },
    show: {
      opacity: 1, y: 0,
      transition: { staggerChildren: 0.05, delayChildren: 0.03 }
    }
  };
  const tabItemV: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 6 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className="container-xl py-6"
      style={themeVars}
      initial="hidden"
      animate="show"
      variants={headerV}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <header className="flex items-center justify-between mb-4" style={{ display: "block" }}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin de contenido</h1>
        </div>

        <div
          className="items-center gap-2"
          style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
        >
          <AnimatePresence>
            {hasChanges && (
              <motion.span
                key="unsaved"
                className="text-xs px-2 py-1 rounded-full bg-yellow-100"
                initial={{ opacity: 0, y: reduce ? 0 : -4 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  ...(reduce ? {} : { scale: [1, 1.04, 1] }) // “latido” sutil
                }}
                exit={{ opacity: 0, y: reduce ? 0 : -4 }}
                transition={{ duration: 0.4, repeat: reduce ? 0 : Infinity, repeatDelay: 3 }}
              >
                Cambios sin guardar
              </motion.span>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {message && (
              <motion.span
                key="saved-msg"
                className="text-sm text-green-600"
                initial={{ opacity: 0, y: reduce ? 0 : -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -4 }}
                transition={{ duration: 0.25 }}
                aria-live="polite"
              >
                {message}
              </motion.span>
            )}
          </AnimatePresence>

          <Btn onClick={resetChanges} disabled={!hasChanges}>Descartar</Btn>
          <Btn onClick={handleSave} kind="primary" disabled={saving || !hasChanges}>
            {saving ? "Guardando…" : "Guardar"}
          </Btn>
          <Btn onClick={logout}>Salir</Btn>
        </div>
      </header>

      {/* NAV de pestañas con underline animado (shared layout) */}
      <LayoutGroup>
        <motion.nav
          className="flex flex-wrap gap-2 mb-4"
          variants={tabsV}
          initial="hidden"
          animate="show"
        >
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <motion.button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative px-3 py-2 rounded-lg border ${
                  active ? "bg-black text-white" : "bg-white"
                } border-black/10`}
                variants={tabItemV}
                whileHover={{ scale: 1.03, y: reduce ? 0 : -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                layout // anima pequeños cambios de tamaño/posición
              >
                {t.label}
                {active && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute left-2 right-2 -bottom-1 h-0.5"
                    style={{ background: "currentColor", opacity: 0.6 }}
                  />
                )}
              </motion.button>
            );
          })}
        </motion.nav>
      </LayoutGroup>

      {/* Panel con transición (enter/exit) entre pestañas */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: reduce ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : -8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="space-y-4"
        >
          {tabs.find((t) => t.id === tab)?.node}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
