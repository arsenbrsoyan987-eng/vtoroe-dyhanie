import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const BASE_NAME = process.env.VITE_GITHUB_PAGES ? '/vtoroe-dyhanie/' : '/'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: BASE_NAME,
})
