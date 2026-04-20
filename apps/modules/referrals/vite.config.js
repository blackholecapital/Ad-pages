import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/apps/referrals/",
  plugins: [react()],
  server: { port: 5175 },
  build: {
    outDir: "../../product-shell/public/apps/referrals",
    emptyOutDir: true,
  },
});
