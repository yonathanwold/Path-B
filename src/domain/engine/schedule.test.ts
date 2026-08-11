import { describe, expect, it } from 'vitest'

import { mayaCourseFailure, mayaDataset } from '../fixtures/maya'
import {
  generateAlternativePath,
  pathStrategies,
  validateSchedule,
} from './schedule'

function placement(path: ReturnType<typeof generateAlternativePath>) {
  return new Map(
    path.schedule.flatMap((term) =>
      term.courseIds.map((courseId) => [courseId, term.termId] as const),
    ),
  )
}

describe('generateAlternativePath', () => {
  it('uses the next spring offering and preserves a May 2027 finish', () => {
    const faster = generateAlternativePath(
      mayaDataset,
      mayaCourseFailure,
      pathStrategies[0]!,
    )
    const placements = placement(faster)

    expect(placements.get('CS201')).toBe('spring-2026')
    expect(placements.get('CS301')).toBe('fall-2026')
    expect(placements.get('CS330')).toBe('fall-2026')
    expect(placements.get('CS495')).toBe('spring-2027')
    expect(faster.graduationTermId).toBe('spring-2027')
    expect(faster.maximumCredits).toBe(15)
    expect(faster.remainsHalfTime).toBe(true)
    expect(faster.issues).toEqual([])
  })

  it('creates a materially different work-friendly path', () => {
    const steadier = generateAlternativePath(
      mayaDataset,
      mayaCourseFailure,
      pathStrategies[1]!,
    )

    expect(steadier.graduationTermId).toBe('fall-2027')
    expect(steadier.maximumCredits).toBeLessThanOrEqual(10)
    expect(steadier.workFit).toBe('comfortable')
    expect(steadier.additionalTerms).toBe(1)
    expect(steadier.issues).toEqual([])
  })

  it('derives credits from known courses instead of trusting caller totals', () => {
    const issues = validateSchedule(
      mayaDataset,
      mayaCourseFailure,
      pathStrategies[0]!,
      [
        {
          termId: 'spring-2026',
          courseIds: ['CS201'],
          credits: 6,
        },
      ],
    )

    expect(issues.map((issue) => issue.code)).toEqual([
      'credit-mismatch',
      'below-half-time',
    ])
  })

  it('rejects unknown terms and courses', () => {
    const issues = validateSchedule(
      mayaDataset,
      mayaCourseFailure,
      pathStrategies[0]!,
      [
        {
          termId: 'spring-2099',
          courseIds: ['CS999'],
          credits: 6,
        },
      ],
    )

    expect(issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        'unknown-course',
        'unknown-term',
        'credit-mismatch',
        'below-half-time',
      ]),
    )
  })

  it('detects prerequisite, offering, and credit-cap violations', () => {
    const prerequisiteIssues = validateSchedule(
      mayaDataset,
      mayaCourseFailure,
      pathStrategies[0]!,
      [{ termId: 'spring-2026', courseIds: ['CS301'], credits: 3 }],
    )
    expect(prerequisiteIssues.map((issue) => issue.code)).toEqual([
      'below-half-time',
      'course-unavailable',
      'prerequisite-order',
    ])

    const overloadIssues = validateSchedule(
      mayaDataset,
      mayaCourseFailure,
      pathStrategies[1]!,
      [
        {
          termId: 'fall-2025',
          courseIds: ['CS240', 'STAT250', 'MATH252', 'HUM210'],
          credits: 12,
        },
      ],
    )
    expect(overloadIssues.map((issue) => issue.code)).toEqual([
      'over-credit-cap',
    ])
  })
})
