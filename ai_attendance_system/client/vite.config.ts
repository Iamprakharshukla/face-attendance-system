import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isVercel = mode === 'vercel'

  return {
    plugins: [react()],
    base: isVercel ? '/' : '/static/dist/',
    build: {
      outDir: isVercel ? 'dist' : '../app/static/dist',
      emptyOutDir: true,
    },
    define: {
      // Inject API base URL at build time
      'import.meta.env.VITE_API_BASE': JSON.stringify(
        isVercel ? (process.env.VITE_API_BASE || '') : ''
      ),
    },
  }
})
