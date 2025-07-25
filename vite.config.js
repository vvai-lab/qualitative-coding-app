import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/qualitative-coding-app/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    origin: 'http://localhost:5173',
  }
})
