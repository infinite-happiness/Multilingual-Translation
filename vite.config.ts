import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// PREVIEW=1 inlines everything into one HTML file for the in-chat preview only.
const preview = !!process.env.PREVIEW

export default defineConfig({
  // Compile-time flag so preview-only code is removed from the real build.
  define: { __PREVIEW__: JSON.stringify(preview) },
  base: preview ? '/' : './',
  plugins: [react(), tailwindcss(), ...(preview ? [viteSingleFile()] : [])],
  server: { port: 3000 },
  preview: { port: 3000 },
})
