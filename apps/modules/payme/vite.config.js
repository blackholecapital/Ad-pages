import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Must match Gateway iframe mount path: /apps/payme/
  base: "/apps/payme/",
  plugins: [react()],
  server: { port: 5174 },
  build: {
    // Output directly into Gateway static folder
    outDir: "../../product-shell/public/apps/payme",
    emptyOutDir: true,
  },
});
