import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base is intentionally omitted (defaults to '/') — this frontend lives at the
// root of tix.cccup.id on Vercel. Setting base: '/ticketing/' would cause asset
// 404s on the subdomain deployment.
export default defineConfig({
  plugins: [react()], // Removed tsconfigPaths() from here
  resolve: {
    tsconfigPaths: true, // Added native support here
  },
  server: {
    proxy: {
      '/api/ticketing': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})