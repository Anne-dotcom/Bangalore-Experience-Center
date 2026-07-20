import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main:   resolve(__dirname, 'index.html'),
        podium: resolve(__dirname, 'podium.html'),
        tv:     resolve(__dirname, 'tv.html'),
      },
    },
  },
})
