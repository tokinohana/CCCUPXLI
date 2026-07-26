import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
// base is intentionally omitted (defaults to '/') — this frontend lives at the
// root of pay.cccup.id on Vercel. Setting base: '/ccpay/' would cause asset
// 404s on the subdomain deployment.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', // local dev only
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
