import type { Plugin } from 'vite'

import { handleExplanationHttp } from './http.ts'

type DevApiOptions = {
  apiKey: string
  model: string
}

export function explanationDevApi(options: DevApiOptions): Plugin {
  return {
    name: 'path-b-explanation-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/explain', (request, response) => {
        void handleExplanationHttp(request, response, options)
      })
    },
  }
}
