import { describe, expect, it } from 'vitest'

import { resolveScenario, ScenarioSessionSchema } from './scenarios.ts'

describe('scenario registry', () => {
  it('resolves the trusted Maya scenario from one registry', () => {
    const resolved = resolveScenario('maya-cs201-failure')

    expect(resolved.dataset.student.name).toBe('Maya')
    expect(resolved.disruption).toEqual({
      type: 'course-not-passed',
      courseId: 'CS201',
      termId: 'spring-2025',
    })
  })

  it('rejects unknown fields and path identifiers in persisted intent', () => {
    expect(
      ScenarioSessionSchema.safeParse({
        version: 1,
        scenarioId: 'maya-cs201-failure',
        priority: 'graduate-on-time',
        selectedPathId: 'invented-path',
        scenarioResult: {},
      }).success,
    ).toBe(false)
  })
})
