import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: 'public',  // <--- tell Vite where to find index.html
  plugins: [react()],
  build: {
    outDir: '../dist' // output relative to 'public'
  }
})
