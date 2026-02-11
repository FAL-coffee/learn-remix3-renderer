import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@remix-run/component',
    }),
  ],
  optimizeDeps: {
    entries: ['index.html', 'src/**/*.{ts,tsx}'],
  },
})