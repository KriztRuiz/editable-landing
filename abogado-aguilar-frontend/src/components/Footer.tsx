import type { SiteContent } from "../types";
import MapEmbed from "./MapEmbed";
import { motion, type Variants, useReducedMotion } from "framer-motion";

export default function Footer({ data }: { data: SiteContent }) {
  const { contact, schedule, legal } = data;

  // "auto" | "google" | "osm" | "static" (leído de .env; default "auto")
  const prefer = (
    ((import.meta as any).env?.PUBLIC_MAP_PREFER as string) ?? "auto"
  ) as "auto" | "google" | "osm" | "static";

  // Si es un embed de Google, generamos un link clicable equivalente
  const mapsLink = contact.mapUrl
    ? contact.mapUrl.includes("/maps/embed")
      ? contact.mapUrl.replace("/embed", "")
      : contact.mapUrl
    : "";

  const reduce = useReducedMotion();

  // Orquestación del grid (stagger de columnas)
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.04 }
    }
  };
  // Entrada sutil de cada columna
  const col: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 12 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.footer
      id="contacto"
      className="section"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{ padding: "3rem 1rem" }}
    >
      <div className="container-xl">
        <motion.div
          className="grid md:grid-cols-3 gap-6"
          variants={container}
        >
          {/* Contacto */}
          <motion.div variants={col}>
            <h3 className="font-semibold text-lg">Contacto</h3>
            <p className="mt-2 text-black/70">
              Tel:{" "}
              <motion.a
                whileHover={{ scale: 1.03, y: reduce ? 0 : -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="underline inline-block"
                href={`tel:${contact.phone}`}
              >
                {contact.phone}
              </motion.a>
              <br />
              Email:{" "}
              <motion.a
                whileHover={{ scale: 1.03, y: reduce ? 0 : -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="underline inline-block"
                href={`mailto:${contact.email}`}
              >
                {contact.email}
              </motion.a>
              <br />
              {contact.address && (
                <>
                  Dirección: {contact.address}
                  <br />
                </>
              )}
            </p>
          </motion.div>

          {/* Horario */}
          <motion.div variants={col}>
            <h3 className="font-semibold text-lg">Horario</h3>
            <ul className="mt-2 text-black/70 space-y-1">
              {schedule?.length ? (
                schedule.map((s, i) => (
                  <li key={i}>
                    {s.days}: {s.open}–{s.close}
                  </li>
                ))
              ) : (
                <li>—</li>
              )}
            </ul>
          </motion.div>

          {/* Ubicación */}
          <motion.div variants={col}>
            <h3 className="font-semibold text-lg">Ubicación</h3>
            {contact.mapUrl ? (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: reduce ? 1 : 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="mt-2"
                >
                  <MapEmbed src={contact.mapUrl} link={mapsLink} prefer={prefer} />
                </motion.div>

                {(prefer === "google" || prefer === "auto") && (
                  <motion.a
                    className="underline block mt-2 inline-flex w-fit"
                    href={mapsLink}
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ x: reduce ? 0 : 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Abrir en Google Maps
                  </motion.a>
                )}
                {/* Para "osm" o "static", MapEmbed ya muestra su propio link */}
              </>
            ) : (
              <p className="mt-2 text-black/60">Mapa no disponible.</p>
            )}
          </motion.div>
        </motion.div>

        <motion.hr
          className="my-6 border-black/10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
        />

        {/* Aviso de privacidad */}
        <motion.div
          className="text-xs text-black/60"
          initial={{ opacity: 0, y: reduce ? 0 : 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <motion.a
            className="underline inline-block"
            href="#aviso"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Aviso de privacidad
          </motion.a>
          {legal?.privacyPolicy && (
            <motion.p
              id="aviso"
              className="mt-3 whitespace-pre-wrap"
              initial={{ opacity: 0, height: 0 }}
              whileInView={{ opacity: 1, height: "auto" }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {legal.privacyPolicy}
            </motion.p>
          )}
        </motion.div>
      </div>
    </motion.footer>
  );
}
