import { describe, expect, it } from 'vitest'

import {
  analyzeCourseFailure,
  mayaCourseFailure,
  mayaDataset,
} from '../domain'
import {
  buildDeterministicExplanation,
  buildImpactSummary,
} from './scenario'

describe('scenario presentation', () => {
  it('derives student, course, counts, and eligibility wording from inputs', () => {
    const scenario = analyzeCourseFailure(
      mayaDataset,
      mayaCourseFailure,
      'graduate-on-time',
    )
    const dataset = {
      ...mayaDataset,
      student: {
        ...mayaDataset.student,
        name: 'Jordan',
        minimumCreditsPerTerm: 9,
      },
      courses: mayaDataset.courses.map((course) =>
        course.id === scenario.failedCourseId
          ? {
              ...course,
              code: 'IT 250',
              offeredIn: ['spring'] as Array<'spring'>,
            }
          : course,
      ),
    }
    const changedScenario = {
      ...scenario,
      affectedCourses: scenario.affectedCourses.slice(0, 3),
    }
    const selectedPath = changedScenario.alternatives[0]!

    expect(buildImpactSummary(dataset, changedScenario)).toEqual({
      title: "Jordan's plan hit a fault line.",
      summary:
        'IT 250 is modeled as spring-only. Two courses are blocked directly and three planned courses shift downstream.',
    })
    expect(
      buildDeterministicExplanation(dataset, changedScenario, selectedPath)
        .nextSteps[1],
    ).toBe(
      'Ask financial aid to verify the 9-credit half-time assumption for Jordan.',
    )
  })
})
