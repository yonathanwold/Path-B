// @vitest-environment node

import { describe, expect, it, vi } from 'vitest'

import type { ExplanationRequest } from '../src/ai/contracts'
import {
  buildClaudeFactPacket,
  createExplanation,
  InvalidExplanationRequestError,
} from './explanation'
import {
  analyzeCourseFailure,
  mayaCourseFailure,
  mayaDataset,
} from '../src/domain'

const fasterRequest: ExplanationRequest = {
  version: 1,
  scenarioId: 'maya-cs201-failure',
  priority: 'graduate-on-time',
  selectedPathId: 'faster-finish',
}

const groundedClaudeOutput = {
  summary:
    'Maya can compare Faster finish with Steadier load using the modeled plan.',
  tradeoff:
    'Faster finish is projected for May 2027 but has a 15-credit peak while Maya works 20 hours weekly.',
  nextSteps: [
    'Confirm the Spring 2026 CS 201 repeat offering with advising.',
    'Ask financial aid to verify the 6-credit threshold before changing enrollment.',
  ],
  advisorQuestion:
    'Can I repeat CS 201 in Spring 2026 and still follow the Faster finish path?',
}

describe('createExplanation', () => {
  it('rejects unknown scenarios and browser-supplied facts', async () => {
    await expect(
      createExplanation({
        ...fasterRequest,
        inventedGraduation: 'May 2024',
      }),
    ).rejects.toBeInstanceOf(InvalidExplanationRequestError)
  })

  it('returns the complete deterministic explanation when no key exists', async () => {
    const generate = vi.fn()

    const response = await createExplanation(fasterRequest, { generate })

    expect(generate).not.toHaveBeenCalled()
    expect(response.mode).toBe('deterministic')
    expect(response.reason).toBe('missing-api-key')
    expect(response.explanation.nextSteps).toHaveLength(3)
    expect(response.explanation.advisorQuestion).toContain('CS 201')
    expect(response.explanation.advisorQuestion).toContain('Spring 2026')
  })

  it('accepts a structured, grounded Claude explanation', async () => {
    const generate = vi.fn().mockResolvedValue(groundedClaudeOutput)

    const response = await createExplanation(fasterRequest, {
      apiKey: 'test-key',
      generate,
    })

    expect(response).toMatchObject({
      mode: 'claude',
      reason: 'ai-complete',
      explanation: groundedClaudeOutput,
    })
    const [facts, config] = generate.mock.calls[0]!
    expect(facts).toMatchObject({
      scenarioId: 'maya-cs201-failure',
      selectedPath: { id: 'faster-finish', projectedGraduation: 'May 2027' },
    })
    expect(config).toMatchObject({ model: 'claude-sonnet-5' })
  })

  it('falls back when Claude output is malformed', async () => {
    const response = await createExplanation(fasterRequest, {
      apiKey: 'test-key',
      generate: vi.fn().mockResolvedValue({ summary: 'Too little.' }),
    })

    expect(response.mode).toBe('deterministic')
    expect(response.reason).toBe('invalid-ai-output')
  })

  it('falls back when Claude introduces an unknown academic fact', async () => {
    const response = await createExplanation(fasterRequest, {
      apiKey: 'test-key',
      generate: vi.fn().mockResolvedValue({
        ...groundedClaudeOutput,
        advisorQuestion:
          'Can I take BIO 999 with CS 201 in Spring 2026 and still follow this path?',
      }),
    })

    expect(response.mode).toBe('deterministic')
    expect(response.reason).toBe('invalid-ai-output')
  })

  it('falls back when the Claude request times out or fails', async () => {
    const response = await createExplanation(fasterRequest, {
      apiKey: 'test-key',
      generate: vi.fn().mockRejectedValue(new Error('timeout')),
    })

    expect(response.mode).toBe('deterministic')
    expect(response.reason).toBe('ai-unavailable')
  })
})

describe('buildClaudeFactPacket', () => {
  it('recomputes the selected scenario entirely on the server', () => {
    const scenario = analyzeCourseFailure(
      mayaDataset,
      mayaCourseFailure,
      fasterRequest.priority,
    )
    const selectedPath = scenario.alternatives.find(
      (path) => path.id === fasterRequest.selectedPathId,
    )!

    const facts = buildClaudeFactPacket(fasterRequest, scenario, selectedPath)

    expect(facts.disruption).toMatchObject({
      failedCourseCode: 'CS 201',
      failedTerm: 'Spring 2025',
      nextRepeatTerm: 'Spring 2026',
      directBlockedCount: 2,
      downstreamShiftCount: 5,
    })
    expect(facts.sourceIds).toEqual(scenario.sourceIds)
    expect(facts.assumptionIds).toEqual(scenario.assumptionIds)
  })
})
