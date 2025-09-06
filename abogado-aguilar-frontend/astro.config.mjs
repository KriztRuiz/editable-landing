// astro.config.mjs
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";

import vercel from "@astrojs/vercel";

export default defineConfig({
  // usado para canonical/sitemap
  site: process.env.PUBLIC_SITE_URL || "https://editable-landing-kriztruizs-projects.vercel.app",

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