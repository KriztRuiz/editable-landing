// src/routes/content.ts
import { Router } from "express";
import { SiteContentModel } from "../models/SiteContent.js";
import { contentSchema } from "../schema/content.js";
import { requireAuth } from "../middleware/auth.js";

export const contentRouter = Router();

/** Público: obtener contenido por siteId */
contentRouter.get("/public/:siteId", async (req, res) => {
  const { siteId } = req.params;
  const doc = await SiteContentModel.findOne({ siteId }).lean();
  if (!doc) return res.status(404).json({ error: "Not found" });
  res.json(doc);
});

/** Admin: leer contenido completo */
contentRouter.get("/admin/:siteId", requireAuth, async (req, res) => {
  const { siteId } = req.params;
  const doc = await SiteContentModel.findOne({ siteId }).lean();
  if (!doc) return res.status(404).json({ error: "Not found" });
  res.json(doc);
});

/** Admin: reemplazar/crear contenido validado (PUT completo) */
contentRouter.put("/admin/:siteId", requireAuth, async (req, res) => {
  const parse = contentSchema.safeParse({ ...req.body, siteId: req.params.siteId });
  if (!parse.success) return res.status(400).json({ error: "Validation", details: parse.error.flatten() });
  const data = parse.data;
  const doc = await SiteContentModel.findOneAndUpdate({ siteId: data.siteId }, data, { new: true, upsert: true });
  res.json(doc);
});
