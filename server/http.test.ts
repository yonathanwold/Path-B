// @vitest-environment node

import type { IncomingMessage, ServerResponse } from 'node:http'
import { Readable } from 'node:stream'
import { describe, expect, it, vi } from 'vitest'

import { handleExplanationHttp } from './http'

function requestFor({
  method = 'POST',
  body = '',
  contentType = 'application/json',
}: {
  method?: string
  body?: string
  contentType?: string
}) {
  const request = Readable.from(body ? [body] : []) as unknown as IncomingMessage
  request.method = method
  request.headers = { 'content-type': contentType }
  return request
}

function responseRecorder() {
  const headers = new Map<string, string | number | readonly string[]>()
  let responseBody = ''
  const response = {
    statusCode: 200,
    setHeader: vi.fn(
      (name: string, value: string | number | readonly string[]) => {
        headers.set(name.toLowerCase(), value)
      },
    ),
    end: vi.fn((value?: string) => {
      responseBody = value ?? ''
    }),
  } as unknown as ServerResponse

  return {
    response,
    headers,
    body: () => JSON.parse(responseBody) as unknown,
  }
}

const validBody = JSON.stringify({
  version: 1,
  scenarioId: 'maya-cs201-failure',
  priority: 'graduate-on-time',
  selectedPathId: 'faster-finish',
})

describe('handleExplanationHttp', () => {
  it('serves the no-key deterministic fallback with defensive headers', async () => {
    const recorder = responseRecorder()

    await handleExplanationHttp(
      requestFor({ body: validBody }),
      recorder.response,
    )

    expect(recorder.response.statusCode).toBe(200)
    expect(recorder.headers.get('cache-control')).toBe('no-store')
    expect(recorder.headers.get('x-content-type-options')).toBe('nosniff')
    expect(recorder.body()).toMatchObject({
      mode: 'deterministic',
      reason: 'missing-api-key',
    })
  })

  it('rejects non-POST methods', async () => {
    const recorder = responseRecorder()

    await handleExplanationHttp(
      requestFor({ method: 'GET' }),
      recorder.response,
    )

    expect(recorder.response.statusCode).toBe(405)
    expect(recorder.headers.get('allow')).toBe('POST')
  })

  it('rejects non-JSON content', async () => {
    const recorder = responseRecorder()

    await handleExplanationHttp(
      requestFor({ body: validBody, contentType: 'text/plain' }),
      recorder.response,
    )

    expect(recorder.response.statusCode).toBe(415)
  })

  it('rejects malformed and oversized request bodies', async () => {
    const malformed = responseRecorder()
    const oversized = responseRecorder()

    await handleExplanationHttp(
      requestFor({ body: '{not json}' }),
      malformed.response,
    )
    await handleExplanationHttp(
      requestFor({ body: JSON.stringify({ payload: 'x'.repeat(5_000) }) }),
      oversized.response,
    )

    expect(malformed.response.statusCode).toBe(400)
    expect(oversized.response.statusCode).toBe(413)
  })

  it('rejects a well-formed body outside the request schema', async () => {
    const recorder = responseRecorder()

    await handleExplanationHttp(
      requestFor({ body: JSON.stringify({ scenarioId: 'unknown' }) }),
      recorder.response,
    )

    expect(recorder.response.statusCode).toBe(400)
    expect(recorder.body()).toEqual({ error: 'Invalid explanation request.' })
  })
})
