// astro.config.mjs
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";
import { loadEnv } from "vite";

import vercel from "@astrojs/vercel";

// Lee .env para el modo actual (development/production)
const { SITE_URL } = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "");

export default defineConfig({
  // usado para canonical/sitemap
  site: SITE_URL || "http://localhost:4321",

  integrations: [react(), tailwind(), sitemap(), robotsTxt()],

  vite: {
    server: {
      host: true,
      proxy: {
        "/api": { target: "http://localhost:4000", changeOrigin: true, secure: false }
      }
    }
  },

  adapter: vercel()
});