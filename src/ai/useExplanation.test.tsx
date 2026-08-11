import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useExplanation } from './useExplanation'
import {
  analyzeCourseFailure,
  mayaCourseFailure,
  mayaDataset,
} from '../domain'

const scenario = analyzeCourseFailure(
  mayaDataset,
  mayaCourseFailure,
  'graduate-on-time',
)
const selectedPath = scenario.alternatives.find(
  (path) => path.id === 'faster-finish',
)!

function Harness() {
  const state = useExplanation({
    dataset: mayaDataset,
    priority: 'graduate-on-time',
    scenario,
    scenarioId: 'maya-cs201-failure',
    selectedPath,
  })

  return (
    <div>
      <span data-testid="status">{state.status}</span>
      <p>{state.explanation.advisorQuestion}</p>
      <span data-testid="step-count">{state.explanation.nextSteps.length}</span>
    </div>
  )
}

function apiResponse(body: unknown) {
  return {
    ok: true,
    json: async () => body,
  } as Response
}

afterEach(() => vi.unstubAllGlobals())

describe('useExplanation', () => {
  it('accepts a validated deterministic API fallback', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        apiResponse({
          mode: 'deterministic',
          reason: 'missing-api-key',
          explanation: {
            summary: 'The verified deterministic summary remains available for Maya.',
            tradeoff:
              'The verified deterministic tradeoff remains available without Claude.',
            nextSteps: [
              'Confirm the repeat offering with advising before registration.',
              'Verify the half-time threshold with financial aid before changing enrollment.',
            ],
            advisorQuestion:
              'Can I repeat CS 201 in Spring 2026 and keep this modeled path?',
          },
        }),
      ),
    )

    render(<Harness />)

    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('deterministic'),
    )
    expect(screen.getByTestId('step-count')).toHaveTextContent('2')
  })

  it('accepts a validated Claude response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        apiResponse({
          mode: 'claude',
          reason: 'ai-complete',
          explanation: {
            summary: 'Claude explains the selected path from the fixed plan facts.',
            tradeoff:
              'Claude compares the modeled workload and graduation tradeoff for Maya.',
            nextSteps: [
              'Confirm the modeled repeat term with an academic advisor.',
              'Verify financial-aid assumptions before changing enrollment.',
            ],
            advisorQuestion:
              'Can we verify the selected recovery path together before registration?',
          },
        }),
      ),
    )

    render(<Harness />)

    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('claude'),
    )
  })

  it('keeps the fallback when the API response is malformed', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(apiResponse({ mode: 'claude' })),
    )

    render(<Harness />)

    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('unavailable'),
    )
    expect(screen.getByText(/still graduate in May 2027/)).toBeVisible()
  })

  it('keeps the fallback when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))

    render(<Harness />)

    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('unavailable'),
    )
    expect(screen.getByTestId('step-count')).toHaveTextContent('3')
  })
})
