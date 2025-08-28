// src/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import { authRouter } from "./routes/auth.js";
import { contentRouter } from "./routes/content.js";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(cors())
app.use(helmet());
app.use(rateLimit({ windowMs: 60_000, limit: 120 }));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRouter);
app.use("/api/content", contentRouter);

const PORT = Number(process.env.PORT || 4000);

mongoose.connect(process.env.MONGO_URL!)
  .then(() => {
    app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error("Mongo connection error", err);
    process.exit(1);
  });
