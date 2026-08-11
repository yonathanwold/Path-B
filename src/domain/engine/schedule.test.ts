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

  it('detects prerequisite, offering, credit-cap, and half-time violations', () => {
    const issues = validateSchedule(
      mayaDataset,
      mayaCourseFailure,
      pathStrategies[1]!,
      [
        {
          termId: 'spring-2026',
          courseIds: ['CS301'],
          credits: 12,
        },
      ],
    )

    expect(issues.map((issue) => issue.code)).toEqual([
      'over-credit-cap',
      'course-unavailable',
      'prerequisite-order',
    ])

    const halfTimeIssue = validateSchedule(
      mayaDataset,
      mayaCourseFailure,
      pathStrategies[0]!,
      [
        {
          termId: 'spring-2026',
          courseIds: ['CS201'],
          credits: 4,
        },
      ],
    )
    expect(halfTimeIssue.map((issue) => issue.code)).toContain(
      'below-half-time',
    )
  })
})
