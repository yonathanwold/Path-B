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

const groundedClaudePlan = {
  summaryFocus: 'recovery-window',
  comparisonFocus: 'workload-fit',
  nextStepIds: ['repeat-registration', 'aid-threshold'],
  advisorQuestionFocus: 'graduation',
} as const

const inventedAcademicOutputs = [
  {
    label: 'course offering',
    output: {
      ...groundedClaudePlan,
      summaryFocus: 'Maya can take CS 201 in a new summer session.',
    },
  },
  {
    label: 'prerequisite',
    output: {
      ...groundedClaudePlan,
      comparisonFocus: 'A remedial workshop is now required.',
    },
  },
  {
    label: 'aid rule',
    output: {
      ...groundedClaudePlan,
      nextStepIds: ['repeat-registration', 'Aid is guaranteed at 6 credits.'],
    },
  },
  {
    label: 'eligibility result',
    output: {
      ...groundedClaudePlan,
      advisorQuestionFocus: 'Maya remains eligible automatically.',
    },
  },
]

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

  it('compiles a structured Claude plan into deterministic student-facing text', async () => {
    const generate = vi.fn().mockResolvedValue(groundedClaudePlan)

    const response = await createExplanation(fasterRequest, {
      apiKey: 'test-key',
      generate,
    })

    expect(response.mode).toBe('claude')
    expect(response.reason).toBe('ai-complete')
    expect(response.explanation).toMatchObject({
      summary:
        'Maya can next repeat CS 201 in Spring 2026. Faster finish is projected to reach May 2027.',
      nextSteps: [
        'Confirm the Spring 2026 CS 201 repeat offering and registration deadline.',
        'Ask financial aid to verify the 6-credit half-time assumption before changing enrollment.',
      ],
    })
    expect(JSON.stringify(response.explanation)).not.toContain('summaryFocus')
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

  it.each(inventedAcademicOutputs)(
    'falls back when Claude tries to introduce an invented $label claim',
    async ({ output }) => {
      const response = await createExplanation(fasterRequest, {
        apiKey: 'test-key',
        generate: vi.fn().mockResolvedValue(output),
      })

      expect(response.mode).toBe('deterministic')
      expect(response.reason).toBe('invalid-ai-output')
      expect(JSON.stringify(response.explanation)).not.toContain('guaranteed')
      expect(JSON.stringify(response.explanation)).not.toContain('remedial')
    },
  )

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
