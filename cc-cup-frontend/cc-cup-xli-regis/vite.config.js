import { defineConfig } from 'vite'
import react from '@vitejs.plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// base is intentionally omitted (defaults to '/') — this frontend lives at the
// root of regis.cccup.id on Vercel. Setting base: '/regis/' would cause asset
// 404s on the subdomain deployment.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})