import react from '@vitejs/plugin-react'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    exclude: [...configDefaults.exclude, 'tests/e2e/**'],
    environment: 'happy-dom',
    setupFiles: './vitest.setup.ts',
    coverage: {
      reporter: ['text', 'html'],
    },
  },
})
