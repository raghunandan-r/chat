import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  base: '/chat/',
  build: {
    outDir: 'docs'
  }
}) 