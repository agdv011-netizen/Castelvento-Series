import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Используем SERVER_URL из .env (например, http://localhost:3001)
// Если нет, собираем из SERVER_PORT (по умолчанию 3000)
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${process.env.SERVER_PORT || '3001'}`
const CLIENT_PORT = process.env.PORT || process.env.VITE_CLIENT_PORT || '5173'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared/src')
    }
  },
  server: {
    port: Number(CLIENT_PORT),
    strictPort: false, // Разрешить занять другой порт, если этот занят
    proxy: {
      '/api': {
        target: SERVER_URL,
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
