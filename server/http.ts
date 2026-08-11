import type { IncomingMessage, ServerResponse } from 'node:http'

import {
  createExplanation,
  InvalidExplanationRequestError,
} from './explanation.ts'

const MAX_REQUEST_BYTES = 4_096

type ParsedRequest = IncomingMessage & {
  body?: unknown
}

type ExplanationHttpOptions = {
  apiKey?: string
  model?: string
}

class RequestTooLargeError extends Error {}

function sendJson(
  response: ServerResponse,
  statusCode: number,
  body: unknown,
) {
  response.statusCode = statusCode
  response.setHeader('Cache-Control', 'no-store')
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('X-Content-Type-Options', 'nosniff')
  response.end(JSON.stringify(body))
}

function parseJson(value: string) {
  if (Buffer.byteLength(value) > MAX_REQUEST_BYTES) {
    throw new RequestTooLargeError()
  }
  return JSON.parse(value) as unknown
}

async function readJsonBody(request: ParsedRequest) {
  if (request.body !== undefined) {
    if (typeof request.body === 'string') return parseJson(request.body)
    if (Buffer.isBuffer(request.body)) return parseJson(request.body.toString('utf8'))

    const serialized = JSON.stringify(request.body)
    if (Buffer.byteLength(serialized) > MAX_REQUEST_BYTES) {
      throw new RequestTooLargeError()
    }
    return request.body
  }

  const chunks: Buffer[] = []
  let size = 0

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.byteLength
    if (size > MAX_REQUEST_BYTES) throw new RequestTooLargeError()
    chunks.push(buffer)
  }

  return parseJson(Buffer.concat(chunks).toString('utf8'))
}

export async function handleExplanationHttp(
  request: ParsedRequest,
  response: ServerResponse,
  options: ExplanationHttpOptions = {},
) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    sendJson(response, 405, { error: 'Method not allowed.' })
    return
  }

  const contentType = request.headers['content-type'] ?? ''
  if (!contentType.toLowerCase().startsWith('application/json')) {
    sendJson(response, 415, { error: 'Content-Type must be application/json.' })
    return
  }

  try {
    const body = await readJsonBody(request)
    const result = await createExplanation(body, options)
    sendJson(response, 200, result)
  } catch (error) {
    if (error instanceof RequestTooLargeError) {
      sendJson(response, 413, { error: 'Request body is too large.' })
      return
    }
    if (
      error instanceof InvalidExplanationRequestError ||
      error instanceof SyntaxError
    ) {
      sendJson(response, 400, { error: 'Invalid explanation request.' })
      return
    }

    sendJson(response, 500, { error: 'Explanation service unavailable.' })
  }
}
