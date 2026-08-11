import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

import { explanationDevApi } from './server/devApiPlugin.ts'

export default defineConfig(({ command, mode }) => {
  const serverEnv =
    command === 'serve' ? loadEnv(mode, process.cwd(), 'ANTHROPIC_') : {}

  return {
    plugins: [
      react(),
      command === 'serve'
        ? explanationDevApi({
            apiKey: serverEnv.ANTHROPIC_API_KEY ?? '',
            model: serverEnv.ANTHROPIC_MODEL ?? 'claude-sonnet-5',
          })
        : null,
    ],
  }
})
