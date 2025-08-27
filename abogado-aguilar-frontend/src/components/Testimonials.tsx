import type { Testimonial } from "../types";
import { motion, type Variants, useReducedMotion } from "framer-motion";

export default function Testimonials({ items }: { items: Testimonial[] }) {
  if (!items?.length) return null;

  const reduce = useReducedMotion();

  // Orquestación con stagger
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.04 }
    }
  };

  // Entrada sutil por tarjeta (sin desplazamiento cuando hay "reduced motion")
  const card: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 12 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.section
      id="testimonios"
      className="section bg-black/[.03]"
      initial="hidden"
      whileInView="show"                // dispara al entrar al viewport
      viewport={{ once: true, amount: 0.25 }}
    >
      <div className="container-xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Testimonios</h2>

        <motion.div
          className="grid md:grid-cols-2 gap-4"
          variants={container}
        >
          {items.map((t, i) => (
            <motion.figure
              key={i}
              className="card p-5 will-change-transform"
              variants={card}
              layout                                   // transiciones suaves si cambia el alto
              whileHover={{ scale: 1.02, y: reduce ? 0 : -2, rotateX: reduce ? 0 : -0.5, rotateY: reduce ? 0 : 0.5 }}
              whileTap={{ scale: 0.99 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, mass: 0.5 }}
              style={{ transformPerspective: 1000 }}
            >
              <blockquote className="text-black/80 leading-relaxed">“{t.text}”</blockquote>
              <figcaption className="mt-3 text-sm text-black/60">— {t.author}</figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
