// src/scripts/seedAdmin.ts
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/User.js";
import { SiteContentModel } from "../models/SiteContent.js";

async function main() {
  await mongoose.connect(process.env.MONGO_URL!);

  // Admin
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const exists = await UserModel.findOne({ email: process.env.ADMIN_EMAIL });
    if (!exists) {
      const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      await UserModel.create({ email: process.env.ADMIN_EMAIL, passwordHash, role: "admin" });
      console.log("✔ Admin creado:", process.env.ADMIN_EMAIL);
    } else {
      console.log("ℹ Admin ya existe");
    }
  }

  // Contenido base
  const siteId = process.env.DEFAULT_SITE_ID || "bufete-ejemplo";
  const existsContent = await SiteContentModel.findOne({ siteId });
  if (!existsContent) {
    await SiteContentModel.create({
      siteId,
      profile: { fullName: "Lic. Nombre Apellido", licenseId: "Cédula 000000", headline: "Defensa legal clara y cercana" },
      contact: { phone: "811-000-0000", whatsapp: "https://wa.me/528110000000", email: "contacto@bufete.com", address: "Calle 123, Ciudad", mapUrl: "" },
      specialties: [{ name: "Familiar" }, { name: "Penal" }, { name: "Laboral" }],
      services: [{ name: "Consulta inicial", description: "30-45 min", priceMin: 0, priceMax: 0 }],
      faqs: [{ q: "¿La primera consulta tiene costo?", a: "No, la primera orientación es gratuita." }],
      testimonials: [{ author: "M. García", text: "Atención rápida y resultados." }],
      schedule: [{ days: "Lun-Vie", open: "09:00", close: "18:00" }],
      cta: { preferred: "whatsapp", whatsappMessage: "Hola, me gustaría una orientación." },
      seo: { title: "Abogado en [Ciudad] | [Área]", description: "Asesoría legal profesional en [Ciudad].", cityKeywords: ["Ciudad", "Colonia"] },
      theme: { colors: { primary: "#0f172a", secondary: "#1e293b", background: "#ffffff", text: "#0b0b0b" }, logoUrl: "" },
      legal: { privacyPolicy: "Tu aviso de privacidad aquí.", disclaimers: "" },
      settings: { layoutOption: 1, mainArea: "familiar", targetCity: "Ciudad" },
      sections: { showAreas: true, showServices: true, showFaqs: true, showTestimonials: true, showMap: true }
    });
    console.log("✔ Contenido base creado para", siteId);
  } else {
    console.log("ℹ Contenido ya existe para", siteId);
  }

  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
