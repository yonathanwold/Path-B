import type { IncomingMessage, ServerResponse } from 'node:http'

import { handleExplanationHttp } from '../server/http.ts'

export default async function explain(
  request: IncomingMessage,
  response: ServerResponse,
) {
  await handleExplanationHttp(request, response, {
    apiKey: process.env.ANTHROPIC_API_KEY ?? '',
    model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-5',
  })
}
