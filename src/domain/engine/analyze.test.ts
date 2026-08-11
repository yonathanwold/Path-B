import { describe, expect, it } from 'vitest'

import { mayaCourseFailure, mayaDataset } from '../fixtures/maya'
import { analyzeCourseFailure } from './analyze'

describe('analyzeCourseFailure', () => {
  it.each([
    ['graduate-on-time', 'faster-finish'],
    ['protect-work-schedule', 'steadier-load'],
    ['limit-extra-cost', 'faster-finish'],
  ] as const)(
    'recommends the right path when the priority is %s',
    (priority, expectedPath) => {
      const result = analyzeCourseFailure(
        mayaDataset,
        mayaCourseFailure,
        priority,
      )

      expect(result.recommendedPathId).toBe(expectedPath)
    },
  )

  it('keeps the same computed facts while the recommendation changes', () => {
    const onTime = analyzeCourseFailure(
      mayaDataset,
      mayaCourseFailure,
      'graduate-on-time',
    )
    const work = analyzeCourseFailure(
      mayaDataset,
      mayaCourseFailure,
      'protect-work-schedule',
    )

    expect(work.alternatives).toEqual(onTime.alternatives)
    expect(work.affectedCourses).toEqual(onTime.affectedCourses)
    expect(work.recommendedPathId).not.toBe(onTime.recommendedPathId)
  })

  it('rejects a disruption that is not in the baseline plan', () => {
    expect(() =>
      analyzeCourseFailure(
        mayaDataset,
        {
          type: 'course-not-passed',
          courseId: 'GEN320',
          termId: 'spring-2025',
        },
        'graduate-on-time',
      ),
    ).toThrow('The disruption must target a course in the baseline plan.')
  })

  it.each([
    ['CS150', 'fall-2024'],
    ['CS301', 'fall-2025'],
  ])('rejects a failure for non-current course %s', (courseId, termId) => {
    expect(() =>
      analyzeCourseFailure(
        mayaDataset,
        { type: 'course-not-passed', courseId, termId },
        'graduate-on-time',
      ),
    ).toThrow('A course-failure disruption must target an in-progress course.')
  })
})
