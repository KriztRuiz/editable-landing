import type { Service } from "../types";
import { motion, type Variants, useReducedMotion } from "framer-motion";

function priceRange(s: Service){
  if (s.priceMin == null && s.priceMax == null) return null;
  if (s.priceMin == null) return `~ $${s.priceMax}`;
  if (s.priceMax == null) return `$${s.priceMin}+`;
  if (s.priceMin === 0 && s.priceMax === 0) return "Gratuito";
  return `$${s.priceMin} - $${s.priceMax}`;
}

export default function Services({ items }: { items: Service[] }) {
  if (!items?.length) return null;

  const reduce = useReducedMotion();

  // Orquestación (contendor + ítems) con stagger
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.04 }
    }
  };

  const cardItem: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 12 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.section
      id="servicios"
      className="section bg-black/[.03]"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }} // dispara al entrar al viewport
    >
      <div className="container-xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Servicios</h2>

        <motion.div
          className="grid md:grid-cols-2 gap-4"
          variants={container}
        >
          {items.map((s, i) => (
            <motion.div
              key={i}
              className="card p-5 flex items-start gap-4 will-change-transform"
              variants={cardItem}
              whileHover={{ scale: 1.02, y: reduce ? 0 : -2 }}
              whileTap={{ scale: 0.99 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, mass: 0.5 }}
              layout // si cambia el contenido/altura, la transición es suave
            >
              <motion.div
                className="badge shrink-0 mt-1"
                initial={{ opacity: 0, scale: reduce ? 1 : 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                #{i + 1}
              </motion.div>

              <div>
                <h3 className="font-semibold text-lg">{s.name}</h3>
                {s.description && (
                  <p className="mt-1 text-black/70">{s.description}</p>
                )}
                {priceRange(s) && (
                  <p className="mt-2 text-sm text-black/60">
                    Tarifa: {priceRange(s)}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
