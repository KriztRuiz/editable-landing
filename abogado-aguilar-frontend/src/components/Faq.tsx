import { useState } from "react";
import type { FAQ } from "../types";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";

export default function Faq({ items }: { items: FAQ[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();

  if (!items?.length) return null;

  // Stagger para las tarjetas
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.04 }
    }
  };
  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.section
      id="faqs"
      className="section"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="container-xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Preguntas frecuentes</h2>

        <motion.div
          className="space-y-3"
          variants={container}
        >
          {items.map((f, i) => {
            const isOpen = open === i;
            const btnId = `faq-trigger-${i}`;
            const panelId = `faq-panel-${i}`;

            return (
              <motion.div
                key={i}
                className="card"
                variants={item}
                layout // anima el reajuste de layout cuando abre/cierra
              >
                <motion.button
                  type="button"
                  id={btnId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full text-left p-4 font-medium flex items-center justify-between gap-3"
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <span>{f.q}</span>
                  {/* Chevrón que rota al abrir */}
                  <motion.svg
                    viewBox="0 0 24 24"
                    className="size-5 opacity-70"
                    animate={{ rotate: isOpen ? 180 : 0 }}
                  >
                    <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" />
                  </motion.svg>
                </motion.button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      id={panelId}
                      role="region"
                      aria-labelledby={btnId}
                      className="px-4 pb-4 text-black/70 overflow-hidden"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <div className="pt-1">{f.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.section>
  );
}
