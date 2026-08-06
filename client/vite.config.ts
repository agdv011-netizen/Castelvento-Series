import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Используем SERVER_PORT из .env (как в .env.example), по умолчанию 3000
// Также поддерживаем VITE_CLIENT_PORT для порта самого клиента
const SERVER_PORT = process.env.SERVER_PORT || process.env.VITE_SERVER_PORT || '3000'
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
        target: `http://localhost:${SERVER_PORT}`,
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
