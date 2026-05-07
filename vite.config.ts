import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  // GitHub Pages serves project repos under /<repo-name>/.
  // Production builds need the prefix; the dev server stays at root.
  base: command === 'build' ? '/dna-budget/' : '/',
}))
