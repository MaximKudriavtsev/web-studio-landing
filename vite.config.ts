import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages: '/web-studio-landing/'
// Яндекс Object Storage / свой домен: '/'
const base = process.env.VITE_BASE ?? '/web-studio-landing/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
})
