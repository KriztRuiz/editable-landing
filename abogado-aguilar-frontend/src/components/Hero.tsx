import { useRef } from "react";
import type { SiteContent } from "../types";
import { MessageCircle, Phone } from "lucide-react";
// Motion
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";

function initials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

function waLink(raw: string | undefined, msg?: string) {
  if (!raw) return "#";
  if (/^https?:\/\//i.test(raw)) {
    return msg ? `${raw}${raw.includes("?") ? "&" : "?"}text=${encodeURIComponent(msg)}` : raw;
  }
  const digits = raw.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return msg ? `${base}?text=${encodeURIComponent(msg)}` : base;
}

export default function Hero({ data }: { data: SiteContent }) {
  const { profile, contact, cta, theme } = data;
  const primary = theme.colors.primary;
  const displayName = profile.fullName.startsWith("Lic.")
    ? profile.fullName
    : `Lic. ${profile.fullName}`;
  const cover = theme.coverUrl;

  // A11y: respeta "Reducir movimiento"
  const reduce = useReducedMotion();

  // Parallax de portada (ligero)
  const headerRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: headerRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -40]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.05]);

  // Orquestación de textos y CTAs
  const container: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 10 },
    show: {
      opacity: 1, y: 0,
      transition: { staggerChildren: 0.08, delayChildren: 0.04 },
    },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.header
      ref={headerRef}
      className="relative overflow-hidden"
      initial={{ opacity: 0, y: reduce ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* ===== Fondo / Portada ===== */}
      <div className="absolute inset-0 -z-10">
        {cover && (
          <motion.img
            src={cover}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            style={{ y: bgY, scale: bgScale, transformOrigin: "center" }}
          />
        )}
        {/* Capa de gradiente para contraste */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(80% 60% at 50% 0%, ${primary}10, white 90%)`,
          }}
        />
        <div className="absolute inset-0 bg-black/5" />
      </div>

      {/* ===== Contenido del héroe ===== */}
      <div className="container-xl pt-16 pb-12 md:pt-20 md:pb-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Lado izquierdo (texto + CTAs) */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
          >
            <motion.h1
              className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight"
              variants={item}
            >
              {displayName}
            </motion.h1>

            {profile.headline && (
              <motion.p className="mt-3 text-lg text-black/70 max-w-prose" variants={item}>
                {profile.headline}
              </motion.p>
            )}

            {profile.intro && (
              <motion.p className="mt-3 text-black/70 max-w-prose" variants={item}>
                {profile.intro}
              </motion.p>
            )}

            {/* CTAs */}
            <motion.div className="mt-5 flex flex-wrap gap-3" variants={container}>
              <motion.a
                variants={item}
                href={waLink(contact.whatsapp, cta.whatsappMessage)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white shadow hover:opacity-90"
                whileHover={{ scale: 1.03, y: reduce ? 0 : -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <MessageCircle className="size-4" />
                WhatsApp
              </motion.a>

              <motion.a
                variants={item}
                href={`mailto:${contact.email}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/10 shadow-sm hover:bg-black/5"
                whileHover={{ scale: 1.03, y: reduce ? 0 : -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                Email
              </motion.a>

              <motion.a
                variants={item}
                href="#contacto"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/10 shadow-sm hover:bg-black/5"
                whileHover={{ scale: 1.03, y: reduce ? 0 : -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <Phone className="size-4" />
                Contacto
              </motion.a>
            </motion.div>

            {profile.licenseId && (
              <motion.p className="mt-5 text-sm text-black/60" variants={item}>
                Cédula: {profile.licenseId}
              </motion.p>
            )}
          </motion.div>

          {/* Lado derecho (foto o iniciales) */}
          <motion.div
            className="justify-self-center md:justify-self-end"
            initial={{ opacity: 0, scale: reduce ? 1 : 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{ transformPerspective: 1000 }}
            whileHover={{ rotateX: reduce ? 0 : -2, rotateY: reduce ? 0 : 2 }}
          >
            <div className="w-[260px] h-[220px] md:w-[300px] md:h-[260px] rounded-3xl bg-white shadow-xl grid place-items-center overflow-hidden">
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={profile.fullName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="text-5xl font-extrabold text-black/70">
                  {initials(profile.fullName)}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
