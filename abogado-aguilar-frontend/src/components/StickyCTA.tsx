import type { SiteContent } from "../types";
import { Phone, MessageCircle, CalendarCheck } from "lucide-react";
import { buildWhatsAppUrl } from "../lib/api";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import HelpButton from './help/HelpButton';
import { useState } from "react";

export default function StickyCTA({ data }: { data: SiteContent }) {
  const { cta, contact, theme } = data;

  const href =
    cta.preferred === "whatsapp"
      ? buildWhatsAppUrl(contact.whatsapp, cta.whatsappMessage)
      : cta.preferred === "call"
      ? `tel:${contact.phone}`
      : cta.bookingUrl ?? "#";

  const label =
    cta.preferred === "whatsapp" ? "WhatsApp" : cta.preferred === "call" ? "Llamar" : "Agendar";

  const Icon =
    cta.preferred === "whatsapp" ? MessageCircle : cta.preferred === "call" ? Phone : CalendarCheck;

  // Accesibilidad: respeta "Reducir movimiento"
  const reduce = useReducedMotion();

  // Mostrar/ocultar según dirección del scroll
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    const goingDown = latest > prev;
    const beyond = latest > 120;
    if (focusWithin) return; // si el botón tiene foco, no lo escondemos
    setVisible(beyond && !goingDown);
  });

  // Abrir en nueva pestaña si es http(s)
  const isExternal = /^https?:\/\//i.test(href);
  const aria =
    label === "Llamar"
      ? `Llamar a ${contact.phone}`
      : label === "WhatsApp"
      ? "Abrir chat en WhatsApp"
      : "Abrir agenda";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="sticky-cta"
          className="fixed left-1/2 -translate-x-1/2 z-50"
          // bottom usa safe-area para no chocar con el notch
          style={{ bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
          initial={{ y: reduce ? 0 : 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: reduce ? 0 : 24, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
        >
          <motion.a
            href={href}
            aria-label={aria}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noreferrer" : undefined}
            className="btn btn-primary px-6 py-3 text-base will-change-transform inline-flex items-center gap-2 rounded-full shadow-soft"
            style={{ background: theme.colors.primary }}
            whileHover={{ scale: 1.03, y: reduce ? 0 : -1 }}
            whileTap={{ scale: 0.98 }}
            onFocus={() => setFocusWithin(true)}
            onBlur={() => setFocusWithin(false)}
          >
            <Icon className="h-5 w-5" /> {label}
          </motion.a>
        </motion.div>
      )}
          <HelpButton />
    </AnimatePresence>
  );
}
