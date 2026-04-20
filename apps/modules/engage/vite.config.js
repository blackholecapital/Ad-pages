import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Must match Gateway iframe mount path: /apps/engage/
  base: '/apps/engage/',
  plugins: [react()],
  build: {
    // Output directly into Gateway static folder
    outDir: '../../product-shell/public/apps/engage',
    emptyOutDir: true,
  },
})
