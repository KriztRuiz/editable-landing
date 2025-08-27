// src/schema/content.ts
import { z } from "zod";

export const contentSchema = z.object({
  siteId: z.string().min(1),                              // slug del sitio
  profile: z.object({
    fullName: z.string(),
    licenseId: z.string().optional(),                     // cédula/profesional
    photoUrl: z.string().url().optional(),
    headline: z.string().optional(),                      // frase corta del hero
    intro: z.string().optional(),                         // párrafo breve
  }),
  contact: z.object({
    phone: z.string(),
    whatsapp: z.string(),                                  // wa.me/521XXXXXXXXXX
    email: z.string().email(),
    address: z.string().optional(),
    mapUrl: z.string().url().optional(),
  }),
  specialties: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    icon: z.string().optional()
  })).default([]),
  services: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    priceMin: z.number().optional(),
    priceMax: z.number().optional()
  })).default([]),
  faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  testimonials: z.array(z.object({
    author: z.string(),
    text: z.string(),
    rating: z.number().min(1).max(5).optional()
  })).default([]),
  schedule: z.array(z.object({
    days: z.string(),     // "Lun-Vie"
    open: z.string(),     // "09:00"
    close: z.string()     // "18:00"
  })).default([]),
  cta: z.object({
    preferred: z.enum(["whatsapp", "call", "agenda"]).default("whatsapp"),
    bookingUrl: z.string().url().optional(),
    whatsappMessage: z.string().optional()
  }),
  seo: z.object({
    title: z.string(),
    description: z.string(),
    cityKeywords: z.array(z.string()).default([])
  }),
  theme: z.object({
    colors: z.object({
      primary: z.string().default("#0f172a"),
      secondary: z.string().default("#1e293b"),
      background: z.string().default("#ffffff"),
      text: z.string().default("#0b0b0b")
    }),
    logoUrl: z.string().url().optional().default("https://cdn.suitsupply.com/image/upload/fl_progressive,f_auto,q_auto,w_1440/suitsupply/campaigns/ss24/formal-wedding-guide/formalWeddingAttire-d-08.jpg")
  }),
  legal: z.object({
    privacyPolicy: z.string().default(""),
    disclaimers: z.string().default("")
  }),
  settings: z.object({
    layoutOption: z.union([z.literal(1),z.literal(2),z.literal(3),z.literal(4),z.literal(5),z.literal(6)]).default(1),
    mainArea: z.string().default("general"),
    targetCity: z.string().default(""),
  }),
  sections: z.object({
    showAreas: z.boolean().default(true),
    showServices: z.boolean().default(true),
    showFaqs: z.boolean().default(true),
    showTestimonials: z.boolean().default(true),
    showMap: z.boolean().default(true),
  }).default({
    showAreas: true, showServices: true, showFaqs: true, showTestimonials: true, showMap: true
  })
});

export type SiteContent = z.infer<typeof contentSchema>;
