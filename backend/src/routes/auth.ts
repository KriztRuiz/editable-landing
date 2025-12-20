// src/routes/auth.ts
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User.js";
import { SiteContentModel } from "../models/SiteContent.js";
import { contentSchema } from "../schema/content.js";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Missing credentials" });
  const user = await UserModel.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ id: String(user._id), role: user.role }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  res.json({ token });
});

authRouter.post("/signup", async (req, res) => {
  const { email, password, siteId, fullName, headline, description } = req.body || {};
  if (!email || !password || !siteId || !fullName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Verifica que no exista el usuario ni el siteId
  if (await UserModel.findOne({ email })) {
    return res.status(400).json({ error: "User already exists" });
  }
  if (await SiteContentModel.findOne({ siteId })) {
    return res.status(400).json({ error: "siteId already exists" });
  }

  // Crea el usuario con la contraseña cifrada
  const passwordHash = await bcrypt.hash(password, 10);
  await UserModel.create({ email, passwordHash, role: "admin" });

  // Construye el contenido con valores por defecto utilizando zod
  const parse = contentSchema.safeParse({
  siteId,
  profile: {
    fullName,            // nombre ingresado
    headline,            // titular opcional
    intro: description,  // descripción opcional
    licenseId: "",       // en blanco: se editará después en el panel
    photoUrl: undefined,        // idem
  },
  contact: {
    phone: "",
    whatsapp: "",
    email,               // el mismo email de registro
    address: "",
    mapUrl: undefined,
  },
  specialties: [],        // listas vacías en vez de copiar del ejemplo
  services: [],
  faqs: [],
  testimonials: [],
  schedule: [],
  cta: {
    preferred: "whatsapp",
    bookingUrl: undefined,
    whatsappMessage: "",
  },
  seo: {
    title: fullName,
    description: description ?? "",
    cityKeywords: [],
  },
  theme: {
    colors: { primary: "#0f172a", secondary: "#1e293b", background: "#ffffff", text: "#0b0b0b" },
    logoUrl: undefined,
    coverUrl: undefined,
  },
  settings: { layoutOption: 1, mainArea: "general", targetCity: "" },
  sections: { showAreas: true, showServices: true, showFaqs: true, showTestimonials: true, showMap: true },
});


  if (!parse.success) {
    return res.status(400).json({ error: "Invalid content", details: parse.error.flatten() });
  }

  // Guarda el contenido base
  await SiteContentModel.create(parse.data);
  return res.status(201).json({ message: "Site and admin created successfully" });
});
