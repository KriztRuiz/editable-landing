// src/models/SiteContent.ts
import mongoose, { Schema } from "mongoose";
import type { SiteContent } from "../schema/content.js";

const SiteContentSchema = new Schema<SiteContent>(
  {
    siteId: { type: String, unique: true, index: true, required: true },
    profile: {
      fullName: String,
      licenseId: String,
      photoUrl: String,
      headline: String,
      intro: String
    },
    contact: {
      phone: String, whatsapp: String, email: String, address: String, mapUrl: String
    },
    specialties: [{ name: String, description: String, icon: String }],
    services: [{ name: String, description: String, priceMin: Number, priceMax: Number }],
    faqs: [{ q: String, a: String }],
    testimonials: [{ author: String, text: String, rating: Number }],
    schedule: [{ days: String, open: String, close: String }],
    cta: { preferred: String, bookingUrl: String, whatsappMessage: String },
    seo: { title: String, description: String, cityKeywords: [String] },
    theme: { colors: { primary: String, secondary: String, background: String, text: String }, logoUrl: String },
    settings: { layoutOption: Number, mainArea: String, targetCity: String },
    sections: { showAreas: Boolean, showServices: Boolean, showFaqs: Boolean, showTestimonials: Boolean, showMap: Boolean }
  },
  { timestamps: true }
);

export const SiteContentModel = mongoose.model<SiteContent>("SiteContent", SiteContentSchema);
