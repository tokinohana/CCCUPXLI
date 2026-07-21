import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/ticketing/',
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