import { useEffect, useMemo, useState } from "react";
import type { SiteContent } from "../types";
import { fetchContent, primaryCssVars } from "../lib/api";
import Hero from "./Hero";
import Areas from "./Areas";
import Services from "./Services";
import Faq from "./Faq";
import Testimonials from "./Testimonials";
import Footer from "./Footer";
import StickyCTA from "./StickyCTA";

// 🟢 NUEVO: Motion (respeta "reducir movimiento")
import { motion, useReducedMotion } from "framer-motion";

export default function App({ siteId }: { siteId: string }) {
  // 1) Hooks SIEMPRE al tope y en el mismo orden en todos los renders
  const [data, setData] = useState<SiteContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContent(siteId)
      .then(setData)
      .catch((e) => setError(String(e)));
  }, [siteId]);

  const cssVars = useMemo(
    () => (data ? primaryCssVars(data.theme.colors) : {}),
    [data]
  );

  // 🟢 NUEVO: accesibilidad (respeta "prefers-reduced-motion")
  const reduce = useReducedMotion();

  // Variantes/props de animación de sección reutilizables (scroll reveal)
  const sectionMotionProps = {
    initial: { opacity: 0, y: reduce ? 0 : 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.45, ease: "easeOut" }
  } as const;

  // 2) Efecto de SEO: se llama SIEMPRE, pero no hace nada si no hay datos
  useEffect(() => {
    if (!data) return;
    document.title = data.seo?.title ?? document.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && data.seo?.description) meta.setAttribute("content", data.seo.description);
  }, [data]);

  // 3) Render
  if (error) {
    return <div className="container-xl py-12 text-red-600">Error: {error}</div>;
  }

  // Cargando: fade-in sutil (no cambié tu copy ni layout)
  if (!data) {
    return (
      <motion.div
        className="container-xl py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        Cargando…
      </motion.div>
    );
  }

  return (
    // Contenedor con fade-in y transición de colores por si cambian variables CSS del tema
    <motion.div
      style={cssVars}
      className="bg-[var(--bg)] text-[var(--t)] transition-colors duration-300"
      initial={{ opacity: 0, y: reduce ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* Hero entra sin delay para que se vea ágil */}
      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Hero data={data} />
      </motion.div>

      {/* Áreas */}
      {data.sections.showAreas && (
        <motion.section {...sectionMotionProps}>
          <Areas items={data.specialties} />
        </motion.section>
      )}

      {/* Servicios */}
      {data.sections.showServices && (
        <motion.section {...sectionMotionProps}>
          <Services items={data.services} />
        </motion.section>
      )}

      {/* FAQs */}
      {data.sections.showFaqs && (
        <motion.section {...sectionMotionProps}>
          <Faq items={data.faqs} />
        </motion.section>
      )}

      {/* Testimonios */}
      {data.sections.showTestimonials && (
        <motion.section {...sectionMotionProps}>
          <Testimonials items={data.testimonials} />
        </motion.section>
      )}

      {/* Footer fijo, sin animación de scroll para no romper UX al final */}
      <Footer data={data} />

      {/* CTA pegajoso: queda como lo tienes (animarlo aquí podría duplicar efectos con su propio componente) */}
      <StickyCTA data={data} />
    </motion.div>
  );
}
