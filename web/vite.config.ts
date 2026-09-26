import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the build works on GitHub Pages under /<repo>/ or at a domain root.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1600,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Needed so the sandbox / codespace preview host is accepted.
    allowedHosts: true,
    hmr:
      process.env.PREVIEW_HTTPS === '1'
        ? { protocol: 'wss', clientPort: 443 }
        : undefined,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
  },
})
