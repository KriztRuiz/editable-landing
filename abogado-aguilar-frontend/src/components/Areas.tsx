import type { Specialty } from "../types";
import { motion, type Variants, useReducedMotion } from "framer-motion";

export default function Areas({ items }: { items: Specialty[] }) {
  if (!items?.length) return null;

  const reduce = useReducedMotion();

  // Orquestación del grid (stagger de las tarjetas)
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.04 }
    }
  };

  // Entrada suave de cada tarjeta (respeta 'prefers-reduced-motion')
  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 12 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section id="areas" className="section">
      <div className="container-xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Áreas de práctica</h2>

        <motion.div
          className="grid md:grid-cols-3 gap-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {items.map((s, i) => (
            <motion.div
              key={i}
              className="card p-5 transition will-change-transform"
              variants={item}
              whileHover={{ scale: 1.02, y: reduce ? 0 : -2 }}
              whileTap={{ scale: 0.99 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, mass: 0.5 }}
            >
              <h3 className="font-semibold text-lg">{s.name}</h3>
              {s.description && (
                <p className="mt-2 text-black/70">{s.description}</p>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
